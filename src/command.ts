import Database from "./db";
import * as fs from "fs";
import * as config from "config";
import * as prompts from "prompts";
const dbPath: string = config.get("db_path");
const schemaPath: string = config.get("db_schema_path");


const getMigrationCodes = async (db: Database, table: string) => {
  const { sql } = await db.get(`SELECT sql FROM sqlite_master WHERE name='${table}'`);
  return sql as string;
};

const dump = async () => {
  const db = await Database.getInstance();
  const tables = await db.tables;
  const schema = await Promise.all(tables.map((t) => getMigrationCodes(db, t)));
  fs.writeFileSync(schemaPath, schema.join("\n"));

  for (const table of tables) {
    const data = await db.all(`SELECT * FROM ${table}`);
    fs.writeFileSync(`./data/${table}.json`, JSON.stringify(data, undefined, 2));
  }
};

const restore = async () => {
  try {
    fs.unlinkSync(dbPath);
  } catch (_) {
    /* do nothing */
  }
  const db = await Database.getInstance();
  const tables = fs.readdirSync("./data").filter(x => /\.json/.test(x)).map(x => x.slice(0, x.length - 5));
  const SQLs = fs.readFileSync(schemaPath).toString().split("\n");

  // create table
  for (const sql of SQLs) {
    await db.run(sql);
  }

  for (const table of tables) {
    const data = JSON.parse(fs.readFileSync(`./data/${table}.json`).toString());
    const queries = bulkInsertQuery(data, table);
    for (const query of queries) {
      await db.run(query);
    }
  }
};


const bulkInsertQuery = (records: any[], tableName: string) => {
  if (records.length === 0) return "";
  const SQLs = records.map((record) => {
    const keys = Object.keys(record).join(", ");
    const values = Object.values(record).map(x => x === null ? "null" : `"${x}"`).join(", ");
    return `INSERT INTO ${tableName} (${keys}) VALUES(${values})`;
  });

  return ["BEGIN"].concat(SQLs).concat(["END"]);
};

// main
(async () => {
  const { command } = await prompts({
    name: "command",
    type: "select",
    message: "what to do?",
    choices: [
      { title: "dump", value: "dump" },
      { title: "restore", value: "restore" },
    ],
  });
  if (!command) { console.log("canceled"); process.exit(0); }
  if (command === "dump") {
    const db = await Database.getInstance();
    const tables = await db.tables;
    const { yes } = await prompts({
      message: `dump [${tables.join(", ")}] to JSON?`,
      type: "confirm",
      name: "yes",
    });
    if (yes) {
      await dump();
    }
  } else {
    const tables = fs.readdirSync("./data").filter(x => /\.json/.test(x));
    const { yes } = await prompts({
      message: `restore from [${tables.join(", ")}]?`,
      type: "confirm",
      name: "yes",
    });
    if (yes) {
      await restore();
    }
  }
})();
