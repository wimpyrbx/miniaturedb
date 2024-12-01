import Database from 'better-sqlite3';
import type { Database as SQLiteDB } from 'better-sqlite3';

const authDb: SQLiteDB = new Database('auth.db', { verbose: console.log });

export default authDb; 