import Database from "./db";

async function main() {
  /* const result = await db.run(queries[1]); */
  const db = await Database.getInstance();
  const tables = await db.tables;
  console.log(tables);

  db.close();
}

main();
