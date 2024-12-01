import Database from 'better-sqlite3';
import type { Database as SQLiteDB } from 'better-sqlite3';

const db: SQLiteDB = new Database('database.sqlite', { verbose: console.log });

export default db;
