import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { verifyCredentials } from './auth/users';
import Database from 'better-sqlite3';
import { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

const app = express();
const port = process.env.PORT || 3001;
const db = new Database('auth.db');
const minisDb = new Database('minis.db');

app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(session({
  secret: 'your-secret-key', // In production, use an environment variable
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Make databases available to request handlers
app.locals.db = db;
app.locals.minisDb = minisDb;

// Authentication middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

// Login route
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', { username });
  
  if (verifyCredentials(username, password)) {
    req.session.user = { username };
    console.log('Login successful:', {
      sessionID: req.sessionID,
      user: req.session.user
    });
    res.json({ success: true, username });
  } else {
    console.log('Login failed: Invalid credentials');
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Logout route
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to logout' });
    } else {
      res.json({ success: true });
    }
  });
});

// Check auth status
app.get('/api/auth/status', (req, res) => {
  console.log('Auth status check:', {
    hasSession: !!req.session,
    hasUser: !!req.session.user,
    user: req.session.user
  });
  
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

// Protected health check route
app.get('/api/health', requireAuth, (_req, res) => {
  res.json({ status: 'ok' });
});

// Companies endpoints
app.get('/api/companies', requireAuth, (_req, res) => {
  try {
    const companies = minisDb.prepare('SELECT * FROM production_companies ORDER BY name').all();
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

app.get('/api/companies/:id', requireAuth, (req, res) => {
  try {
    const company = minisDb.prepare('SELECT * FROM production_companies WHERE id = ?').get(req.params.id);
    if (company) {
      res.json(company);
    } else {
      res.status(404).json({ error: 'Company not found' });
    }
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

app.get('/api/companies/:id/lines', requireAuth, (req, res) => {
  try {
    const lines = minisDb.prepare('SELECT * FROM product_lines WHERE company_id = ? ORDER BY name').all(req.params.id);
    res.json(lines);
  } catch (error) {
    console.error('Error fetching product lines:', error);
    res.status(500).json({ error: 'Failed to fetch product lines' });
  }
});

app.get('/api/product-lines/:id/sets', requireAuth, (req, res) => {
  try {
    const sets = minisDb.prepare('SELECT * FROM product_sets WHERE product_line_id = ? ORDER BY name').all(req.params.id);
    res.json(sets);
  } catch (error) {
    console.error('Error fetching product sets:', error);
    res.status(500).json({ error: 'Failed to fetch product sets' });
  }
});

interface UserSession {
  user?: {
    username: string;
  };
}

// Add settings endpoints
app.get('/api/settings', requireAuth, async (
  req: Request<ParamsDictionary, any, any, ParsedQs> & { session: UserSession },
  res: Response
) => {
  try {
    const username = req.session.user?.username;
    if (!username) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const settings = db.prepare(
      'SELECT setting_key, setting_value FROM user_preferences WHERE username = ?'
    ).all(username);

    const settingsObject = settings.reduce((acc: Record<string, string>, curr: any) => {
      acc[curr.setting_key] = curr.setting_value;
      return acc;
    }, {});

    res.json(settingsObject);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/settings', requireAuth, async (
  req: Request<ParamsDictionary, any, any, ParsedQs> & { session: UserSession },
  res: Response
) => {
  try {
    const username = req.session.user?.username;
    if (!username) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { setting_key, setting_value } = req.body;
    if (!setting_key || !setting_value) {
      res.status(400).json({ message: 'Missing setting_key or setting_value' });
      return;
    }

    // Validate setting_key
    if (!['colormode', 'colortheme', 'styletheme'].includes(setting_key)) {
      res.status(400).json({ message: 'Invalid setting_key' });
      return;
    }

    // Update or insert the setting
    db.prepare(`
      INSERT INTO user_preferences (username, setting_key, setting_value) 
      VALUES (?, ?, ?) 
      ON CONFLICT(username, setting_key) 
      DO UPDATE SET setting_value = ?
    `).run(username, setting_key, setting_value, setting_value);

    res.json({ message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 