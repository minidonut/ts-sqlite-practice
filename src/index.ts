import Database from "./db";

const DB_PATH = "./data/database.db";

const queries = [
  "CREATE TABLE packages (id INTEGER PRIMARY KEY AUTOINCREMENT, name CHAR(50))", // create table
  "SELECT * FROM packages",
  "INSERT INTO packages (name) VALUES('hello')",
  "DROP TABLE packages"
];

async function main() {
  const db = new Database(DB_PATH);
  await db.init();
  /* const result = await db.run(queries[1]); */

  const result = await db.all(queries[1]);
  console.log(result);
  db.close();
}

main();
