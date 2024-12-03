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

// Product Info endpoints
// Companies
app.get('/api/productinfo/companies', requireAuth, (_req, res) => {
  try {
    const companies = minisDb.prepare('SELECT * FROM production_companies ORDER BY name').all();
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

app.post('/api/productinfo/companies', requireAuth, (req, res) => {
  try {
    const { name } = req.body;
    const result = minisDb.prepare(
      'INSERT INTO production_companies (name) VALUES (?) RETURNING *'
    ).get(name);
    res.json(result);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

app.put('/api/productinfo/companies/:id', requireAuth, (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const result = minisDb.prepare(
      'UPDATE production_companies SET name = ? WHERE id = ? RETURNING *'
    ).get(name, id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Company not found' });
    }
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

app.delete('/api/productinfo/companies/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const result = minisDb.prepare('DELETE FROM production_companies WHERE id = ?').run(id);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Company not found' });
    }
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

// Product Lines
app.get('/api/productinfo/companies/:id/lines', requireAuth, (req, res) => {
  try {
    const lines = minisDb.prepare(
      'SELECT * FROM product_lines WHERE company_id = ? ORDER BY name'
    ).all(req.params.id);
    res.json(lines);
  } catch (error) {
    console.error('Error fetching product lines:', error);
    res.status(500).json({ error: 'Failed to fetch product lines' });
  }
});

app.post('/api/productinfo/lines', requireAuth, (req, res) => {
  try {
    const { name, company_id } = req.body;
    const result = minisDb.prepare(
      'INSERT INTO product_lines (name, company_id) VALUES (?, ?) RETURNING *'
    ).get(name, company_id);
    res.json(result);
  } catch (error) {
    console.error('Error creating product line:', error);
    res.status(500).json({ error: 'Failed to create product line' });
  }
});

app.put('/api/productinfo/lines/:id', requireAuth, (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const result = minisDb.prepare(
      'UPDATE product_lines SET name = ? WHERE id = ? RETURNING *'
    ).get(name, id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Product line not found' });
    }
  } catch (error) {
    console.error('Error updating product line:', error);
    res.status(500).json({ error: 'Failed to update product line' });
  }
});

app.delete('/api/productinfo/lines/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const result = minisDb.prepare('DELETE FROM product_lines WHERE id = ?').run(id);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Product line not found' });
    }
  } catch (error) {
    console.error('Error deleting product line:', error);
    res.status(500).json({ error: 'Failed to delete product line' });
  }
});

// Product Sets
app.get('/api/productinfo/lines/:id/sets', requireAuth, (req, res) => {
  try {
    const sets = minisDb.prepare(`
      SELECT 
        ps.*,
        (SELECT COUNT(*) FROM minis WHERE product_set_id = ps.id) as mini_count
      FROM product_sets ps
      WHERE product_line_id = ?
      ORDER BY name
    `).all(req.params.id);
    res.json(sets);
  } catch (error) {
    console.error('Error fetching product sets:', error);
    res.status(500).json({ error: 'Failed to fetch product sets' });
  }
});

app.post('/api/productinfo/sets', requireAuth, (req, res) => {
  try {
    const { name, product_line_id } = req.body;
    const result = minisDb.prepare(
      'INSERT INTO product_sets (name, product_line_id) VALUES (?, ?) RETURNING *'
    ).get(name, product_line_id);
    res.json(result);
  } catch (error) {
    console.error('Error creating product set:', error);
    res.status(500).json({ error: 'Failed to create product set' });
  }
});

app.put('/api/productinfo/sets/:id', requireAuth, (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const result = minisDb.prepare(
      'UPDATE product_sets SET name = ? WHERE id = ? RETURNING *'
    ).get(name, id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Product set not found' });
    }
  } catch (error) {
    console.error('Error updating product set:', error);
    res.status(500).json({ error: 'Failed to update product set' });
  }
});

app.delete('/api/productinfo/sets/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const result = minisDb.prepare('DELETE FROM product_sets WHERE id = ?').run(id);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Product set not found' });
    }
  } catch (error) {
    console.error('Error deleting product set:', error);
    res.status(500).json({ error: 'Failed to delete product set' });
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

// Classification endpoints
// Types
app.get('/api/classification/types', requireAuth, (_req, res) => {
  try {
    const types = minisDb.prepare('SELECT * FROM mini_types ORDER BY name').all();
    res.json(types);
  } catch (error) {
    console.error('Error fetching types:', error);
    res.status(500).json({ error: 'Failed to fetch types' });
  }
});

app.post('/api/classification/types', requireAuth, (req, res) => {
  try {
    const { name } = req.body;
    const result = minisDb.prepare(
      'INSERT INTO mini_types (name) VALUES (?) RETURNING *'
    ).get(name);
    res.json(result);
  } catch (error) {
    console.error('Error creating type:', error);
    res.status(500).json({ error: 'Failed to create type' });
  }
});

app.put('/api/classification/types/:id', requireAuth, (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const result = minisDb.prepare(
      'UPDATE mini_types SET name = ? WHERE id = ? RETURNING *'
    ).get(name, id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Type not found' });
    }
  } catch (error) {
    console.error('Error updating type:', error);
    res.status(500).json({ error: 'Failed to update type' });
  }
});

app.delete('/api/classification/types/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    minisDb.prepare('DELETE FROM mini_types WHERE id = ?').run(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting type:', error);
    res.status(500).json({ error: 'Failed to delete type' });
  }
});

// Categories for a specific type
app.get('/api/classification/types/:id/categories', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const categories = minisDb.prepare(`
      SELECT mc.* 
      FROM mini_categories mc
      JOIN type_to_categories ttc ON mc.id = ttc.category_id
      WHERE ttc.type_id = ?
      ORDER BY mc.name
    `).all(id);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Categories
app.post('/api/classification/categories', requireAuth, (req, res) => {
  try {
    const { name, type_id } = req.body;
    const db = minisDb.transaction((name, typeId) => {
      // First create the category
      const category = minisDb.prepare(
        'INSERT INTO mini_categories (name) VALUES (?) RETURNING *'
      ).get(name);
      
      // Then link it to the type
      minisDb.prepare(
        'INSERT INTO type_to_categories (type_id, category_id) VALUES (?, ?)'
      ).run(typeId, category.id);
      
      return category;
    });
    
    const result = db(name, type_id);
    res.json(result);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/classification/categories/:id', requireAuth, (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const result = minisDb.prepare(
      'UPDATE mini_categories SET name = ? WHERE id = ? RETURNING *'
    ).get(name, id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/classification/categories/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    minisDb.prepare('DELETE FROM mini_categories WHERE id = ?').run(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Get all type-category relationships
app.get('/api/classification/type-categories', requireAuth, (_req, res) => {
  try {
    const relationships = minisDb.prepare(`
      SELECT mc.*, ttc.type_id
      FROM mini_categories mc
      JOIN type_to_categories ttc ON mc.id = ttc.category_id
      ORDER BY mc.name
    `).all();
    res.json(relationships);
  } catch (error) {
    console.error('Error fetching type-category relationships:', error);
    res.status(500).json({ error: 'Failed to fetch type-category relationships' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 