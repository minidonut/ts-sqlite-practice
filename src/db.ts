import * as sqlite3 from "sqlite3";
import * as config from "config";

// singleton object
let db: Database = null;

class Database {
  db: sqlite3.Database;
  path: string;

  static async getInstance() {
    if (!db) {
      db = new Database();
      await db.init();
    }
    return db;
  }

  constructor(path = config.get("db_path") as string) {
    this.path = path;
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.path, (error) => {
        if (error) reject(error);
        resolve();
      });
    });
  }

  async run(sql: string, ...args: any) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, ...args, (error: Error, result: sqlite3.RunResult) => {
        if (error) reject(error);
        resolve(result);
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.db.close((error: Error) => {
        if (error) reject(error);
        resolve();
      });
    });
  }

  async all(sql: string, ...args: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, ...args, (error: Error, rows: any[]) => {
        if (error) reject(error);
        resolve(rows);
      });
    });
  }

  async get(sql: string, ...args: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, ...args, (error: Error, result: any) => {
        if (error) reject(error);
        resolve(result);
      });
    });
  }

  get tables(): Promise<string[]> {
    return this
      .all("SELECT name FROM sqlite_master WHERE type='table'")
      .then(rows => rows.map(x => x.name).filter(x => x !== "sqlite_sequence"));
  }
}

export default Database;
