import * as sqlite3 from "sqlite3";

class Database {
  db: sqlite3.Database;
  path: string;

  constructor(path: string) {
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
}

export default Database;
