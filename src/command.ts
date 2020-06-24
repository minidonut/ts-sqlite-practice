import Database from "./db";
import * as fs from "fs";
import * as config from "config";
const dbPath: string = config.get("db_path");
const schemaPath: string = config.get("db_schema_path");

const cmd = process.argv[2];

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
  fs.unlinkSync(dbPath);
  const db = await Database.getInstance();
  const tables = await db.tables;
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

dump();
restore();
