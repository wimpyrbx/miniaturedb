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

    // Create user_preferences table if it doesn't exist
    db.prepare(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        username TEXT NOT NULL,
        setting_key TEXT NOT NULL,
        setting_value TEXT NOT NULL,
        PRIMARY KEY (username, setting_key)
      )
    `).run();

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

    // Create user_preferences table if it doesn't exist
    db.prepare(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        username TEXT NOT NULL,
        setting_key TEXT NOT NULL,
        setting_value TEXT NOT NULL,
        PRIMARY KEY (username, setting_key)
      )
    `).run();

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
    const types = minisDb.prepare(`
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

    // Parse JSON arrays
    types.forEach(type => {
      type.categories = JSON.parse(type.categories).filter((id: number | null) => id !== null);
      type.category_names = JSON.parse(type.category_names).filter((name: string | null) => name !== null);
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
    const db = minisDb.transaction((name: string, typeId: number) => {
      // First create the category
      const category = minisDb.prepare(
        'INSERT INTO mini_categories (name) VALUES (?) RETURNING *'
      ).get(name) as Category;
      
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
    const deleteCategory = minisDb.transaction((categoryId) => {
      // First delete all relationships
      minisDb.prepare('DELETE FROM type_to_categories WHERE category_id = ?').run(categoryId);
      // Then delete the category
      minisDb.prepare('DELETE FROM mini_categories WHERE id = ?').run(categoryId);
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

app.post('/api/classification/type-categories', requireAuth, (req, res) => {
  try {
    const { type_id, category_id } = req.body;
    
    // Check if relationship already exists
    const existing = minisDb.prepare(
      'SELECT * FROM type_to_categories WHERE type_id = ? AND category_id = ?'
    ).get(type_id, category_id);

    if (existing) {
      res.status(400).json({ error: 'This category is already assigned to this type' });
      return;
    }

    // Create the relationship
    minisDb.prepare(
      'INSERT INTO type_to_categories (type_id, category_id) VALUES (?, ?)'
    ).run(type_id, category_id);

    // Return the category details
    const category = minisDb.prepare(
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
    const categories = minisDb.prepare('SELECT * FROM mini_categories ORDER BY name').all();
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

    const updateAssignments = minisDb.transaction((typeId: number, categoryIds: number[]) => {
      // First delete all existing assignments for this type
      minisDb.prepare('DELETE FROM type_to_categories WHERE type_id = ?').run(typeId);
      
      // Then add the new assignments
      const insertStmt = minisDb.prepare(
        'INSERT INTO type_to_categories (type_id, category_id) VALUES (?, ?)'
      );
      
      for (const categoryId of categoryIds) {
        insertStmt.run(typeId, categoryId);
      }
      
      // Return the updated category list
      return minisDb.prepare(`
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
  id: number;
  name: string;
  proxy_type: boolean;
}

interface Mini {
  id: number;
  name: string;
  description: string | null;
  location: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  painted_by_id: number;
  base_size_id: number;
  product_set_id: number | null;
  base_size_name: string | null;
  painted_by_name: string | null;
  product_set_name: string | null;
  product_line_name: string | null;
  company_name: string | null;
}

// Tag endpoints
app.get('/api/tags', requireAuth, (_req, res) => {
  try {
    const tags = minisDb.prepare('SELECT * FROM tags ORDER BY name').all();
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

app.post('/api/tags', requireAuth, (req, res) => {
  try {
    const { name } = req.body;
    const result = minisDb.prepare(
      'INSERT INTO tags (name) VALUES (?) RETURNING *'
    ).get(name);
    res.json(result);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// Minis endpoints
app.get('/api/minis', requireAuth, (req, res) => {
  try {
    // First get all minis with their basic info
    const minis = minisDb.prepare(`
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

    // For each mini, get its tags
    const minisWithTags = minis.map(mini => {
      const tags = minisDb.prepare(`
        SELECT t.id, t.name
        FROM tags t
        JOIN mini_to_tags mtt ON t.id = mtt.tag_id
        WHERE mtt.mini_id = ?
        ORDER BY t.name
      `).all(mini.id) as Tag[];

      // Get types and categories
      const types = minisDb.prepare(`
        SELECT mt.id, mt.name, mtt.proxy_type
        FROM mini_types mt
        JOIN mini_to_types mtt ON mt.id = mtt.type_id
        WHERE mtt.mini_id = ?
        ORDER BY mtt.proxy_type, mt.name
      `).all(mini.id) as MiniType[];

      const categories = minisDb.prepare(`
        SELECT DISTINCT mc.id, mc.name
        FROM mini_categories mc
        JOIN type_to_categories ttc ON mc.id = ttc.category_id
        JOIN mini_to_types mtt ON ttc.type_id = mtt.type_id
        WHERE mtt.mini_id = ?
        ORDER BY mc.name
      `).all(mini.id) as Category[];

      return {
        ...mini,
        tags,
        types,
        categories: categories.map(c => c.id),
        category_names: categories.map(c => c.name)
      };
    });

    res.json(minisWithTags);
  } catch (error) {
    console.error('Error fetching minis:', error);
    res.status(500).json({ error: 'Failed to fetch minis' });
  }
});

app.put('/api/minis/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const result = minisDb.prepare(`
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
    const result = minisDb.prepare(
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

    const updateTags = minisDb.transaction((miniId: number, tagData: Array<{ id: number, name: string }>) => {
      // First create any new tags (those with id === -1)
      const insertTagStmt = minisDb.prepare('INSERT INTO tags (name) VALUES (?) RETURNING *');
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
      minisDb.prepare('DELETE FROM mini_to_tags WHERE mini_id = ?').run(miniId);
      
      // Add all tag relationships
      const insertRelationStmt = minisDb.prepare(
        'INSERT INTO mini_to_tags (mini_id, tag_id) VALUES (?, ?)'
      );
      
      for (const tag of finalTags) {
        insertRelationStmt.run(miniId, tag.id);
      }
      
      // Return the updated mini with tags
      return minisDb.prepare(`
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
    updatedMini.tags = JSON.parse(updatedMini.tags).filter((t: any) => t.id !== null);
    
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

    const updateType = minisDb.transaction((miniId: number, newTypeId: number) => {
      // First delete all existing types
      minisDb.prepare('DELETE FROM mini_to_types WHERE mini_id = ?').run(miniId);
      
      // Then add the new type
      minisDb.prepare(
        'INSERT INTO mini_to_types (mini_id, type_id, proxy_type) VALUES (?, ?, 0)'
      ).run(miniId, newTypeId);
      
      // Return the updated mini with type
      return minisDb.prepare(`
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
    updatedMini.types = JSON.parse(updatedMini.types).filter((id: number | null) => id !== null);
    
    res.json(updatedMini);
  } catch (error) {
    console.error('Error updating mini type:', error);
    res.status(500).json({ error: 'Failed to update mini type' });
  }
});

// Base sizes endpoints
app.get('/api/base_sizes', requireAuth, (_req, res) => {
  try {
    const baseSizes = minisDb.prepare('SELECT * FROM base_sizes ORDER BY id').all();
    res.json(baseSizes);
  } catch (error) {
    console.error('Error fetching base sizes:', error);
    res.status(500).json({ error: 'Failed to fetch base sizes' });
  }
});

// Painted by endpoints
app.get('/api/painted_by', requireAuth, (_req, res) => {
  try {
    const paintedBy = minisDb.prepare('SELECT * FROM painted_by ORDER BY id').all();
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 