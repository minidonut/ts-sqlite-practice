import Database from "./db";


const queries = [
  "CREATE TABLE packages (id INTEGER PRIMARY KEY AUTOINCREMENT, name CHAR(50))", // create table
  "SELECT * FROM packages",
  "INSERT INTO packages (name) VALUES('hello')",
  "DROP TABLE packages"
];

async function main() {
  /* const result = await db.run(queries[1]); */
  const db = await Database.getInstance();
  const tables = await db.tables;
  console.log(tables);

  db.close();
}

main();
