export default [{
  up: "CREATE TABLE packages (id INTEGER PRIMARY KEY AUTOINCREMENT, name CHAR(50))",
  down: "DROP TABLE packages",
}];
