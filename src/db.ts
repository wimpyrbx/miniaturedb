import sqlite3, { Database } from 'better-sqlite3';

export const db: Database = new sqlite3('auth.db', {
  verbose: console.log
}); 