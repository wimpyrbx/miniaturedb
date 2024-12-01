import Database from 'better-sqlite3';

const db = new Database('database.sqlite', { verbose: console.log });

export default db;
