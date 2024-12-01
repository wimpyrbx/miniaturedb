import { createHash } from 'crypto';
import authDb from '../db/auth';

// Initialize users table
authDb.exec(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

interface User {
  password_hash: string;
}

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export function createUser(username: string, password: string): boolean {
  try {
    const stmt = authDb.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    stmt.run(username, hashPassword(password));
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    return false;
  }
}

export function verifyCredentials(username: string, password: string): boolean {
  try {
    const stmt = authDb.prepare('SELECT password_hash FROM users WHERE username = ?');
    const user = stmt.get(username) as User | undefined;
    
    if (!user) return false;
    
    return user.password_hash === hashPassword(password);
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return false;
  }
}

// Add initial user (ltg:ltg)
try {
  createUser('ltg', 'ltg');
} catch (error) {
  // User might already exist, that's fine
} 