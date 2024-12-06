import { createHash } from 'crypto';
import Database from 'better-sqlite3';

let authDb: Database.Database | null = null;

const getAuthDb = () => {
  if (!authDb) {
    authDb = new Database('auth.db');
    // Initialize users table only when first accessed
    authDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add initial user (ltg:ltg) if it doesn't exist
    const stmt = authDb.prepare('SELECT username FROM users WHERE username = ?');
    const existingUser = stmt.get('ltg');
    if (!existingUser) {
      createUser('ltg', 'ltg');
    }
  }
  return authDb;
};

interface User {
  password_hash: string;
}

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export function createUser(username: string, password: string): boolean {
  try {
    const db = getAuthDb();
    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    stmt.run(username, hashPassword(password));
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    return false;
  }
}

export function verifyCredentials(username: string, password: string): boolean {
  try {
    const db = getAuthDb();
    const stmt = db.prepare('SELECT password_hash FROM users WHERE username = ?');
    const user = stmt.get(username) as User | undefined;
    
    if (!user) return false;
    
    return user.password_hash === hashPassword(password);
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return false;
  }
} 