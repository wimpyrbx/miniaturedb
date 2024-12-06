import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { verifyCredentials } from './auth/users';
import Database from 'better-sqlite3';
import { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const app = express();
const port = process.env.PORT || 3001;

// Initialize databases lazily
let db: Database.Database | null = null;
let minisDb: Database.Database | null = null;

const getAuthDb = () => {
  if (!db) {
    db = new Database('auth.db');
  }
  return db;
};

const getMinisDb = () => {
  if (!minisDb) {
    minisDb = new Database('minis.db');
  }
  return minisDb;
};

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
app.locals.getDb = getAuthDb;
app.locals.getMinisDb = getMinisDb;

// Authentication middleware - only initialize db when needed
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

// Login route - optimized to minimize db operations
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  try {
    if (verifyCredentials(username, password)) {
      req.session.user = { username };
      res.json({ success: true, username });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    const companies = getMinisDb().prepare('SELECT * FROM production_companies ORDER BY name').all();
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

app.post('/api/productinfo/companies', requireAuth, (req, res) => {
  try {
    const { name } = req.body;
    const result = getMinisDb().prepare(
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
    const result = getMinisDb().prepare(
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
    const result = getMinisDb().prepare('DELETE FROM production_companies WHERE id = ?').run(id);
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
    const lines = getMinisDb().prepare(
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
    const result = getMinisDb().prepare(
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
    const result = getMinisDb().prepare(
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
    const result = getMinisDb().prepare('DELETE FROM product_lines WHERE id = ?').run(id);
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
app.get('/api/productinfo/sets', requireAuth, (_req, res) => {
  try {
    const sets = getMinisDb().prepare(`
      SELECT 
        ps.*,
        pl.name as product_line_name,
        pc.name as company_name,
        (SELECT COUNT(*) FROM minis WHERE product_set_id = ps.id) as mini_count
      FROM product_sets ps
      JOIN product_lines pl ON ps.product_line_id = pl.id
      JOIN production_companies pc ON pl.company_id = pc.id
      ORDER BY pc.name, pl.name, ps.name
    `).all();
    res.json(sets);
  } catch (error) {
    console.error('Error fetching all product sets:', error);
    res.status(500).json({ error: 'Failed to fetch product sets' });
  }
});

app.get('/api/productinfo/lines/:id/sets', requireAuth, (req, res) => {
  try {
    const sets = getMinisDb().prepare(`
      SELECT 
        ps.*,
        (SELECT COUNT(*) FROM minis WHERE product_set_id = ps.id) as mini_count
      FROM product_sets ps
      WHERE product_line_id = ?
      ORDER BY name
    `).all(req.params.id);
    res.json(sets);
  } catch (error) {
    console.error('Error fetching product sets for line:', error);
    res.status(500).json({ error: 'Failed to fetch product sets' });
  }
});

app.post('/api/productinfo/sets', requireAuth, (req, res) => {
  try {
    const { name, product_line_id } = req.body;
    const result = getMinisDb().prepare(
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
    const result = getMinisDb().prepare(
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
    const result = getMinisDb().prepare('DELETE FROM product_sets WHERE id = ?').run(id);
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

    // Create user_preferences table if it doesn't exist
    getAuthDb().prepare(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        username TEXT NOT NULL,
        setting_key TEXT NOT NULL,
        setting_value TEXT NOT NULL,
        PRIMARY KEY (username, setting_key)
      )
    `).run();

    const settings = getAuthDb().prepare(
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
    if (typeof setting_key !== 'string') {
      res.status(400).json({ message: 'Missing or invalid setting_key' });
      return;
    }

    // Allow empty string for filter text, but require values for other settings
    if (setting_key !== 'miniatures_view_last_filter_text' && !setting_value) {
      res.status(400).json({ message: 'Missing setting_value' });
      return;
    }

    // Validate setting_key and value
    if (!['colormode', 'colortheme', 'styletheme', 'miniatures_view_type', 
          'miniatures_view_last_page_visited', 'miniatures_view_last_filter_text'].includes(setting_key)) {
      res.status(400).json({ message: 'Invalid setting_key' });
      return;
    }

    // Validate specific setting values
    if (setting_key === 'colormode' && !['light', 'dark'].includes(setting_value)) {
      res.status(400).json({ message: 'Invalid color mode value' });
      return;
    }

    if (setting_key === 'miniatures_view_type' && !['table', 'cards', 'banner', 'timeline'].includes(setting_value)) {
      res.status(400).json({ message: 'Invalid view type value' });
      return;
    }

    // Validate page number is a positive integer
    if (setting_key === 'miniatures_view_last_page_visited') {
      const pageNum = parseInt(setting_value);
      if (isNaN(pageNum) || pageNum < 1) {
        res.status(400).json({ message: 'Invalid page number' });
        return;
      }
    }

    // Create user_preferences table if it doesn't exist
    getAuthDb().prepare(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        username TEXT NOT NULL,
        setting_key TEXT NOT NULL,
        setting_value TEXT NOT NULL,
        PRIMARY KEY (username, setting_key)
      )
    `).run();

    // Update or insert the setting
    getAuthDb().prepare(`
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
    const types = getMinisDb().prepare(`
      WITH type_categories AS (
        SELECT 
          mt.id as type_id,
          json_group_array(DISTINCT mc.id) as category_ids,
          json_group_array(DISTINCT mc.name) as category_names
        FROM mini_types mt
        LEFT JOIN type_to_categories ttc ON mt.id = ttc.type_id
        LEFT JOIN mini_categories mc ON ttc.category_id = mc.id
        GROUP BY mt.id
      )
      SELECT 
        mt.*,
        tc.category_ids as categories,
        tc.category_names as category_names,
        (
          SELECT json_group_array(m.id)
          FROM minis m
          JOIN mini_to_types mtt ON m.id = mtt.mini_id
          WHERE mtt.type_id = mt.id
        ) as mini_ids,
        (
          SELECT COUNT(*)
          FROM minis m
          JOIN mini_to_types mtt ON m.id = mtt.mini_id
          WHERE mtt.type_id = mt.id
        ) as mini_count
      FROM mini_types mt
      LEFT JOIN type_categories tc ON mt.id = tc.type_id
      ORDER BY mt.name
    `).all() as MiniType[];

    // Parse JSON arrays and mini_ids
    types.forEach(type => {
      type.categories = type.categories ? JSON.parse(type.categories as unknown as string).filter((id: number | null) => id !== null) : [];
      type.category_names = type.category_names ? JSON.parse(type.category_names as unknown as string).filter((name: string | null) => name !== null) : [];
      type.mini_ids = type.mini_ids ? JSON.parse(type.mini_ids as string).filter((id: number | null) => id !== null) : [];
    });

    res.json(types);
  } catch (error) {
    console.error('Error fetching types:', error);
    res.status(500).json({ error: 'Failed to fetch types' });
  }
});

app.post('/api/classification/types', requireAuth, (req, res) => {
  try {
    const { name } = req.body;
    const result = getMinisDb().prepare(
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
    const result = getMinisDb().prepare(
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
    getMinisDb().prepare('DELETE FROM mini_types WHERE id = ?').run(id);
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
    const categories = getMinisDb().prepare(`
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
    const db = getMinisDb().transaction((name: string, typeId: number) => {
      // First create the category
      const category = getMinisDb().prepare(
        'INSERT INTO mini_categories (name) VALUES (?) RETURNING *'
      ).get(name) as Category;
      
      // Then link it to the type
      getMinisDb().prepare(
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
    const result = getMinisDb().prepare(
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
    const deleteCategory = getMinisDb().transaction((categoryId) => {
      // First delete all relationships
      getMinisDb().prepare('DELETE FROM type_to_categories WHERE category_id = ?').run(categoryId);
      // Then delete the category
      getMinisDb().prepare('DELETE FROM mini_categories WHERE id = ?').run(categoryId);
    });
    
    deleteCategory(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Get all type-category relationships
app.get('/api/classification/type-categories', requireAuth, (_req, res) => {
  try {
    const relationships = getMinisDb().prepare(`
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

app.post('/api/classification/type-categories', requireAuth, (req, res) => {
  try {
    const { type_id, category_id } = req.body;
    
    // Check if relationship already exists
    const existing = getMinisDb().prepare(
      'SELECT * FROM type_to_categories WHERE type_id = ? AND category_id = ?'
    ).get(type_id, category_id);

    if (existing) {
      res.status(400).json({ error: 'This category is already assigned to this type' });
      return;
    }

    // Create the relationship
    getMinisDb().prepare(
      'INSERT INTO type_to_categories (type_id, category_id) VALUES (?, ?)'
    ).run(type_id, category_id);

    // Return the category details
    const category = getMinisDb().prepare(
      'SELECT * FROM mini_categories WHERE id = ?'
    ).get(category_id);

    res.json(category);
  } catch (error) {
    console.error('Error creating type-category relationship:', error);
    res.status(500).json({ error: 'Failed to create type-category relationship' });
  }
});

app.get('/api/classification/categories', requireAuth, (_req, res) => {
  try {
    const categories = getMinisDb().prepare('SELECT * FROM mini_categories ORDER BY name').all();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Add new endpoint for managing type-category assignments
app.put('/api/classification/types/:id/categories', requireAuth, (req, res) => {
  try {
    const { id: typeId } = req.params;
    const { categoryIds } = req.body;

    const updateAssignments = getMinisDb().transaction((typeId: number, categoryIds: number[]) => {
      // First delete all existing assignments for this type
      getMinisDb().prepare('DELETE FROM type_to_categories WHERE type_id = ?').run(typeId);
      
      // Then add the new assignments
      const insertStmt = getMinisDb().prepare(
        'INSERT INTO type_to_categories (type_id, category_id) VALUES (?, ?)'
      );
      
      for (const categoryId of categoryIds) {
        insertStmt.run(typeId, categoryId);
      }
      
      // Return the updated category list
      return getMinisDb().prepare(`
        SELECT mc.* 
        FROM mini_categories mc
        JOIN type_to_categories ttc ON mc.id = ttc.category_id
        WHERE ttc.type_id = ?
        ORDER BY mc.name
      `).all(typeId);
    });
    
    const updatedCategories = updateAssignments(parseInt(typeId), categoryIds);
    res.json(updatedCategories);
  } catch (error) {
    console.error('Error updating type categories:', error);
    res.status(500).json({ error: 'Failed to update type categories' });
  }
});

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface MiniType {
  mini_ids: any;
  id: number;
  name: string;
  proxy_type: boolean;
  categories?: number[];
  category_names?: string[];
}

interface Mini {
  id: number;
  name: string;
  description: string | null;
  location: string;
  quantity: number;
  painted_by_id: number;
  base_size_id: number;
  product_set_id: number | null;
  created_at: string;
  updated_at: string;
  tags?: any[];
  types?: any[];
}

// Tag endpoints
app.get('/api/tags', (_req, res) => {
  try {
    const tags = getMinisDb().prepare('SELECT * FROM tags ORDER BY name').all();
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

app.post('/api/tags', requireAuth, (req, res) => {
  try {
    const { name } = req.body;
    const result = getMinisDb().prepare(
      'INSERT INTO tags (name) VALUES (?) RETURNING *'
    ).get(name);
    res.json(result);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// Minis endpoints
app.get('/api/minis', (_req, res) => {
  try {
    // First get all minis with their basic info
    const minis = getMinisDb().prepare(`
      SELECT 
        m.*,
        bs.base_size_name,
        pb.painted_by_name,
        ps.name as product_set_name,
        pl.name as product_line_name,
        pc.name as company_name
      FROM minis m
      LEFT JOIN base_sizes bs ON m.base_size_id = bs.id
      LEFT JOIN painted_by pb ON m.painted_by_id = pb.id
      LEFT JOIN product_sets ps ON m.product_set_id = ps.id
      LEFT JOIN product_lines pl ON ps.product_line_id = pl.id
      LEFT JOIN production_companies pc ON pl.company_id = pc.id
      ORDER BY m.name
    `).all() as Mini[];

    // For each mini, get its tags and types
    const minisWithDetails = minis.map(mini => {
      const tags = getMinisDb().prepare(`
        SELECT t.id, t.name
        FROM tags t
        JOIN mini_to_tags mtt ON t.id = mtt.tag_id
        WHERE mtt.mini_id = ?
        ORDER BY t.name
      `).all(mini.id) as Tag[];

      const types = getMinisDb().prepare(`
        SELECT mt.id, mt.name, mtt.proxy_type
        FROM mini_types mt
        JOIN mini_to_types mtt ON mt.id = mtt.type_id
        WHERE mtt.mini_id = ?
        ORDER BY mtt.proxy_type, mt.name
      `).all(mini.id) as MiniType[];

      return {
        ...mini,
        tags,
        types
      };
    });

    res.json(minisWithDetails);
  } catch (error) {
    console.error('Error fetching minis:', error);
    res.status(500).json({ error: 'Failed to fetch minis' });
  }
});

app.put('/api/minis/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const result = getMinisDb().prepare(`
      UPDATE minis 
      SET name = ?, 
          description = ?, 
          location = ?, 
          quantity = ?,
          painted_by_id = ?,
          base_size_id = ?,
          product_set_id = ?,
          updated_at = datetime('now')
      WHERE id = ?
      RETURNING *
    `).get(
      updates.name, 
      updates.description, 
      updates.location, 
      updates.quantity,
      updates.painted_by_id,
      updates.base_size_id,
      updates.product_set_id,
      id
    );

    if (!result) {
      res.status(404).json({ error: 'Mini not found' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating mini:', error);
    res.status(500).json({ error: 'Failed to update mini' });
  }
});

// Create new tag
app.post('/api/tags', requireAuth, (req, res) => {
  try {
    const { name } = req.body;
    const result = getMinisDb().prepare(
      'INSERT INTO tags (name) VALUES (?) RETURNING *'
    ).get(name) as Tag;
    res.json(result);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// Update mini tags with support for new tags
app.put('/api/minis/:id/tags', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;  // Array of { id: number, name: string }

    const updateTags = getMinisDb().transaction((miniId: number, tagData: Array<{ id: number, name: string }>) => {
      // First create any new tags (those with id === -1)
      const insertTagStmt = getMinisDb().prepare('INSERT INTO tags (name) VALUES (?) RETURNING *');
      const newTags = tagData.filter(t => t.id === -1).map(t => {
        const result = insertTagStmt.get(t.name) as Tag;
        return result;
      });

      // Combine existing and new tags
      const finalTags = [
        ...tagData.filter(t => t.id !== -1),
        ...newTags
      ];

      // Delete all existing tag relationships
      getMinisDb().prepare('DELETE FROM mini_to_tags WHERE mini_id = ?').run(miniId);
      
      // Add all tag relationships
      const insertRelationStmt = getMinisDb().prepare(
        'INSERT INTO mini_to_tags (mini_id, tag_id) VALUES (?, ?)'
      );
      
      for (const tag of finalTags) {
        insertRelationStmt.run(miniId, tag.id);
      }
      
      // Return the updated mini with tags
      return getMinisDb().prepare(`
        WITH mini_tags AS (
          SELECT 
            m.id as mini_id,
            json_group_array(json_object(
              'id', t.id,
              'name', t.name
            )) as tag_info
          FROM minis m
          LEFT JOIN mini_to_tags mtt ON m.id = mtt.mini_id
          LEFT JOIN tags t ON mtt.tag_id = t.id
          WHERE m.id = ?
          GROUP BY m.id
        )
        SELECT 
          m.*,
          mt.tag_info as tags
        FROM minis m
        LEFT JOIN mini_tags mt ON m.id = mt.mini_id
        WHERE m.id = ?
        GROUP BY m.id
      `).get(miniId, miniId) as Mini;
    });
    const updatedMini = updateTags(parseInt(id), tags);
    const parsedTags = JSON.parse(updatedMini.tags as unknown as string);
    updatedMini.tags = parsedTags.filter((t: {id: number | null}) => t.id !== null);
    
    res.json(updatedMini);
  } catch (error) {
    console.error('Error updating mini tags:', error);
    res.status(500).json({ error: 'Failed to update mini tags' });
  }
});

app.put('/api/minis/:id/type', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { typeId } = req.body;

    const updateType = getMinisDb().transaction((miniId: number, newTypeId: number) => {
      // First delete all existing types
      getMinisDb().prepare('DELETE FROM mini_to_types WHERE mini_id = ?').run(miniId);
      
      // Then add the new type
      getMinisDb().prepare(
        'INSERT INTO mini_to_types (mini_id, type_id, proxy_type) VALUES (?, ?, 0)'
      ).run(miniId, newTypeId);
      
      // Return the updated mini with type
      return getMinisDb().prepare(`
        SELECT 
          m.*,
          json_group_array(mt.id) as types
        FROM minis m
        LEFT JOIN mini_to_types mty ON m.id = mty.mini_id
        LEFT JOIN mini_types mt ON mty.type_id = mt.id
        WHERE m.id = ?
        GROUP BY m.id
      `).get(miniId) as Mini;
    });
    const updatedMini = updateType(parseInt(id), typeId);
    const parsedTypes = JSON.parse(updatedMini.types as unknown as string);
    updatedMini.types = parsedTypes.filter((id: number | null) => id !== null);
    
    res.json(updatedMini);
  } catch (error) {
    console.error('Error updating mini type:', error);
    res.status(500).json({ error: 'Failed to update mini type' });
  }
});

// Base sizes endpoints
app.get('/api/base_sizes', (_req, res) => {
  try {
    const baseSizes = getMinisDb().prepare('SELECT * FROM base_sizes ORDER BY id').all();
    res.json(baseSizes);
  } catch (error) {
    console.error('Error fetching base sizes:', error);
    res.status(500).json({ error: 'Failed to fetch base sizes' });
  }
});

// Painted by endpoints
app.get('/api/painted_by', (_req, res) => {
  try {
    const paintedBy = getMinisDb().prepare('SELECT * FROM painted_by ORDER BY id').all();
    res.json(paintedBy);
  } catch (error) {
    console.error('Error fetching painted by options:', error);
    res.status(500).json({ error: 'Failed to fetch painted by options' });
  }
});

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed'));
      return;
    }
    cb(null, true);
  }
});

// Helper function to ensure directory exists
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Helper function to get image paths
function getImagePaths(miniId: number) {
  const idStr = miniId.toString();
  const firstDigit = idStr[0];
  const secondDigit = idStr.length > 1 ? idStr[1] : '0';
  
  const originalDir = path.join(process.cwd(), 'public', 'images', 'miniatures', 'original', firstDigit, secondDigit);
  const thumbDir = path.join(process.cwd(), 'public', 'images', 'miniatures', 'thumb', firstDigit, secondDigit);
  
  return {
    originalDir,
    thumbDir,
    originalPath: path.join(originalDir, `${miniId}.webp`),
    thumbPath: path.join(thumbDir, `${miniId}.webp`)
  };
}

// Image status endpoint
app.get('/api/minis/:id/image', requireAuth, (req, res) => {
  try {
    const miniId = parseInt(req.params.id);
    const { originalPath, thumbPath } = getImagePaths(miniId);
    
    const status = {
      hasOriginal: fs.existsSync(originalPath),
      hasThumb: fs.existsSync(thumbPath)
    };
    
    res.json(status);
  } catch (error) {
    console.error('Error checking image status:', error);
    res.status(500).json({ error: 'Failed to check image status' });
  }
});

// Image upload endpoint
app.post('/api/minis/:id/image', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const miniId = parseInt(req.params.id);
    const { originalDir, thumbDir, originalPath, thumbPath } = getImagePaths(miniId);

    // Ensure directories exist
    ensureDirectoryExists(originalDir);
    ensureDirectoryExists(thumbDir);

    // Process and save original image
    await sharp(req.file.buffer)
      .webp({ quality: 90 })
      .toFile(originalPath);

    // Process and save thumbnail
    await sharp(req.file.buffer)
      .resize(200, 200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 80 })
      .toFile(thumbPath);

    res.json({ success: true });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Image delete endpoint
app.delete('/api/minis/:id/image', requireAuth, (req, res) => {
  try {
    const miniId = parseInt(req.params.id);
    const { originalPath, thumbPath } = getImagePaths(miniId);
    
    // Delete both original and thumb if they exist
    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
    }
    if (fs.existsSync(thumbPath)) {
      fs.unlinkSync(thumbPath);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Types endpoints
app.get('/api/types', (_req, res) => {
  try {
    const types = getMinisDb().prepare(`
      SELECT mt.*, 
             COUNT(DISTINCT mtt.mini_id) as mini_count
      FROM mini_types mt
      LEFT JOIN mini_to_types mtt ON mt.id = mtt.type_id
      GROUP BY mt.id
      ORDER BY mt.name
    `).all();
    res.json(types);
  } catch (error) {
    console.error('Error fetching types:', error);
    res.status(500).json({ error: 'Failed to fetch types' });
  }
});

// Update mini types endpoint
app.put('/api/minis/:id/types', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { types } = req.body; // Array of { id: number, name: string, proxy_type: boolean }

    const updateTypes = getMinisDb().transaction((miniId: number, typeData: Array<{ id: number, proxy_type: boolean }>) => {
      // Delete all existing type relationships
      getMinisDb().prepare('DELETE FROM mini_to_types WHERE mini_id = ?').run(miniId);
      
      // Add all type relationships
      const insertRelationStmt = getMinisDb().prepare(
        'INSERT INTO mini_to_types (mini_id, type_id, proxy_type) VALUES (?, ?, ?)'
      );
      
      for (const type of typeData) {
        insertRelationStmt.run(miniId, type.id, type.proxy_type ? 1 : 0);
      }
      
      // Return the updated mini with types
      return getMinisDb().prepare(`
        SELECT 
          m.*,
          json_group_array(json_object(
            'id', mt.id,
            'name', mt.name,
            'proxy_type', mtt.proxy_type
          )) as type_info
        FROM minis m
        LEFT JOIN mini_to_types mtt ON m.id = mtt.mini_id
        LEFT JOIN mini_types mt ON mtt.type_id = mt.id
        WHERE m.id = ?
        GROUP BY m.id
      `).get(miniId);
    });

    const result = updateTypes(parseInt(id), types);
    res.json(result);
  } catch (error) {
    console.error('Error updating mini types:', error);
    res.status(500).json({ error: 'Failed to update mini types' });
  }
});

// Update the miniatures endpoint to include types
app.get('/api/miniatures', requireAuth, (_req, res) => {
  try {
    // First get all minis with their basic info
    const minis = getMinisDb().prepare(`
      SELECT 
        m.*,
        bs.base_size_name,
        pb.painted_by_name,
        ps.name as product_set_name,
        pl.name as product_line_name,
        pc.name as company_name
      FROM minis m
      LEFT JOIN base_sizes bs ON m.base_size_id = bs.id
      LEFT JOIN painted_by pb ON m.painted_by_id = pb.id
      LEFT JOIN product_sets ps ON m.product_set_id = ps.id
      LEFT JOIN product_lines pl ON ps.product_line_id = pl.id
      LEFT JOIN production_companies pc ON pl.company_id = pc.id
      ORDER BY m.created_at DESC, m.name
    `).all() as Mini[];

    // For each mini, get its tags and types
    const minisWithDetails = minis.map(mini => {
      const tags = getMinisDb().prepare(`
        SELECT t.id, t.name
        FROM tags t
        JOIN mini_to_tags mtt ON t.id = mtt.tag_id
        WHERE mtt.mini_id = ?
        ORDER BY t.name
      `).all(mini.id) as Tag[];

      const types = getMinisDb().prepare(`
        SELECT mt.id, mt.name, mtt.proxy_type
        FROM mini_types mt
        JOIN mini_to_types mtt ON mt.id = mtt.type_id
        WHERE mtt.mini_id = ?
        ORDER BY mtt.proxy_type, mt.name
      `).all(mini.id) as MiniType[];

      return {
        ...mini,
        tags,
        types
      };
    });

    res.json(minisWithDetails);
  } catch (error) {
    console.error('Error fetching minis:', error);
    res.status(500).json({ error: 'Failed to fetch minis' });
  }
});
// Delete miniature and all associated data
app.delete('/api/minis/:id', requireAuth, async (req, res): Promise<void> => {
  const { id } = req.params;
  const db = getMinisDb();

  try {
    // Start a transaction
    db.prepare('BEGIN').run();

    try {
      // Delete associated records first
      db.prepare('DELETE FROM mini_to_types WHERE mini_id = ?').run(id);
      db.prepare('DELETE FROM mini_to_tags WHERE mini_id = ?').run(id);
      
      // Delete the miniature record
      const result = db.prepare('DELETE FROM minis WHERE id = ?').run(id);
      
      if (result.changes === 0) {
        db.prepare('ROLLBACK').run();
        res.status(404).json({ error: 'Miniature not found' });
        return;
      }

      // Delete associated images
      const { originalPath, thumbPath } = getImagePaths(parseInt(id));
      
      try {
        // Delete original image if it exists
        if (fs.existsSync(originalPath)) {
          fs.unlinkSync(originalPath);
        }
        
        // Delete thumbnail if it exists
        if (fs.existsSync(thumbPath)) {
          fs.unlinkSync(thumbPath);
        }
      } catch (imageError) {
        console.error('Error deleting images:', imageError);
        // Continue with transaction even if image deletion fails
      }

      // Commit the transaction
      db.prepare('COMMIT').run();
      
      res.json({ success: true });
    } catch (error) {
      // Rollback on error
      db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting miniature:', error);
    res.status(500).json({ error: 'Failed to delete miniature' });
  }
});

app.post('/api/miniatures', requireAuth, (req, res) => {
  try {
    console.log('Received request to create miniature:', req.body);

    const {
      name,
      description,
      location,
      quantity,
      painted_by_id,
      base_size_id,
      product_set_id,
      types,
      tags
    } = req.body;

    // Validate required fields
    if (!name || !location) {
      console.error('Missing required fields:', { name, location });
      res.status(400).json({ error: 'Name and location are required' });
      return;
    }

    interface MiniatureData {
      name: string;
      description: string | null;
      location: string;
      quantity: number;
      painted_by_id: number;
      base_size_id: number;
      product_set_id: number | null;
      types: Array<{ id: number; proxy_type: boolean }>;
      tags: Array<{ id: number; name: string }>;
    }

    interface DbMini {
      id: number;
      name: string;
      description: string | null;
      location: string;
      quantity: number;
      painted_by_id: number;
      base_size_id: number;
      product_set_id: number | null;
      created_at: string;
      updated_at: string;
    }

    // Use a transaction to insert miniature and its relationships
    const createMiniature = getMinisDb().transaction((data: MiniatureData) => {
      console.log('Starting transaction with data:', data);

      try {
        // Insert the miniature
        console.log('Inserting miniature...');
        const mini = getMinisDb().prepare(`
          INSERT INTO minis (
            name,
            description,
            location,
            quantity,
            painted_by_id,
            base_size_id,
            product_set_id,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          RETURNING *
        `).get(
          data.name,
          data.description,
          data.location,
          data.quantity,
          data.painted_by_id,
          data.base_size_id,
          data.product_set_id
        ) as DbMini;

        console.log('Miniature inserted:', mini);

        // Insert types if any
        if (data.types && data.types.length > 0) {
          console.log('Inserting types:', data.types);
          const insertTypeStmt = getMinisDb().prepare(
            'INSERT INTO mini_to_types (mini_id, type_id, proxy_type) VALUES (?, ?, ?)'
          );
          for (const type of data.types) {
            insertTypeStmt.run(mini.id, type.id, type.proxy_type ? 1 : 0);
          }
        }

        // Handle tags - create new ones if needed
        if (data.tags && data.tags.length > 0) {
          console.log('Processing tags:', data.tags);
          const findTagStmt = getMinisDb().prepare(
            'SELECT id, name FROM tags WHERE name = ? COLLATE NOCASE'
          );
          const insertTagStmt = getMinisDb().prepare(
            'INSERT INTO tags (name) VALUES (?) RETURNING *'
          );
          const linkTagStmt = getMinisDb().prepare(
            'INSERT INTO mini_to_tags (mini_id, tag_id) VALUES (?, ?)'
          );

          for (const tag of data.tags) {
            let tagId = tag.id;
            
            // If tag ID is -1, check if it exists or create it
            if (tagId === -1) {
              console.log('Checking if tag exists:', tag.name);
              const existingTag = findTagStmt.get(tag.name) as { id: number } | undefined;
              
              if (existingTag) {
                console.log('Found existing tag:', existingTag);
                tagId = existingTag.id;
              } else {
                console.log('Creating new tag:', tag.name);
                const newTag = insertTagStmt.get(tag.name) as { id: number };
                tagId = newTag.id;
                console.log('Created new tag with ID:', tagId);
              }
            }

            console.log('Linking tag', tagId, 'to miniature', mini.id);
            linkTagStmt.run(mini.id, tagId);
          }
        }

        // Return the complete miniature with all relationships
        console.log('Fetching complete miniature data...');
        const result = getMinisDb().prepare(`
          SELECT 
            m.*,
            bs.base_size_name,
            pb.painted_by_name,
            ps.name as product_set_name,
            pl.name as product_line_name,
            pc.name as company_name,
            (
              SELECT json_group_array(json_object(
                'id', t.id,
                'name', t.name,
                'proxy_type', mtt.proxy_type
              ))
              FROM mini_to_types mtt
              JOIN mini_types t ON mtt.type_id = t.id
              WHERE mtt.mini_id = m.id
            ) as types,
            (
              SELECT json_group_array(json_object(
                'id', t.id,
                'name', t.name
              ))
              FROM mini_to_tags mtt
              JOIN tags t ON mtt.tag_id = t.id
              WHERE mtt.mini_id = m.id
            ) as tags
          FROM minis m
          LEFT JOIN base_sizes bs ON m.base_size_id = bs.id
          LEFT JOIN painted_by pb ON m.painted_by_id = pb.id
          LEFT JOIN product_sets ps ON m.product_set_id = ps.id
          LEFT JOIN product_lines pl ON ps.product_line_id = pl.id
          LEFT JOIN production_companies pc ON pl.company_id = pc.id
          WHERE m.id = ?
        `).get(mini.id) as {
          types: string;
          tags: string;
          [key: string]: any;
        };

        console.log('Complete miniature data:', result);
        return result;
      } catch (err) {
        console.error('Error in transaction:', err);
        throw err;
      }
    });

    // Execute the transaction
    console.log('Executing transaction...');
    const result = createMiniature({
      name,
      description,
      location,
      quantity,
      painted_by_id,
      base_size_id,
      product_set_id,
      types: types || [],
      tags: tags || []
    });

    // Parse the JSON arrays in the result
    result.types = JSON.parse(result.types || '[]');
    result.tags = JSON.parse(result.tags || '[]');

    console.log('Transaction complete, sending response:', result);
    res.json(result);
  } catch (error) {
    console.error('Error creating miniature:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: `Failed to create miniature: ${error.message}` });
    } else {
      res.status(500).json({ error: 'Failed to create miniature: Unknown error' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 