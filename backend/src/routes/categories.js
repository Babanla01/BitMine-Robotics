import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const router = express.Router();

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ===== CATEGORY ENDPOINTS =====

// Get all categories with subcategories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.name, c.description, c.created_at, c.updated_at,
        json_agg(
          json_build_object(
            'id', s.id,
            'name', s.name,
            'description', s.description,
            'created_at', s.created_at,
            'updated_at', s.updated_at
          ) ORDER BY s.name
        ) FILTER (WHERE s.id IS NOT NULL) as subcategories
      FROM categories c
      LEFT JOIN subcategories s ON c.id = s.category_id
      GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at
      ORDER BY c.name ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single category with subcategories
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.name, c.description, c.created_at, c.updated_at,
        json_agg(
          json_build_object(
            'id', s.id,
            'name', s.name,
            'description', s.description,
            'created_at', s.created_at,
            'updated_at', s.updated_at
          ) ORDER BY s.name
        ) FILTER (WHERE s.id IS NOT NULL) as subcategories
      FROM categories c
      LEFT JOIN subcategories s ON c.id = s.category_id
      WHERE c.id = $1
      GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create category (admin only)
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const result = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name.trim(), description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update category (admin only)
router.put('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const result = await pool.query(
      'UPDATE categories SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name.trim(), description || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete category (admin only)
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    // Check if category has products
    const productsCheck = await pool.query(
      'SELECT COUNT(*) FROM products WHERE category_id = $1',
      [req.params.id]
    );

    if (parseInt(productsCheck.rows[0].count) > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete category with existing products. Please reassign or delete products first.' 
      });
    }

    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully', category: result.rows[0] });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== SUBCATEGORY ENDPOINTS =====

// Get subcategories for a specific category
router.get('/:categoryId/subcategories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM subcategories WHERE category_id = $1 ORDER BY name ASC',
      [req.params.categoryId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create subcategory (admin only)
router.post('/:categoryId/subcategories', verifyAdminToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const { categoryId } = req.params;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Subcategory name is required' });
    }

    // Verify category exists
    const categoryCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const result = await pool.query(
      'INSERT INTO subcategories (name, description, category_id) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), description || null, categoryId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating subcategory:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Subcategory name already exists in this category' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update subcategory (admin only)
router.put('/subcategories/:id', verifyAdminToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Subcategory name is required' });
    }

    const result = await pool.query(
      'UPDATE subcategories SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name.trim(), description || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating subcategory:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Subcategory name already exists in this category' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete subcategory (admin only)
router.delete('/subcategories/:id', verifyAdminToken, async (req, res) => {
  try {
    // Check if subcategory has products
    const productsCheck = await pool.query(
      'SELECT COUNT(*) FROM products WHERE subcategory_id = $1',
      [req.params.id]
    );

    if (parseInt(productsCheck.rows[0].count) > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete subcategory with existing products. Please reassign or delete products first.' 
      });
    }

    const result = await pool.query(
      'DELETE FROM subcategories WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json({ message: 'Subcategory deleted successfully', subcategory: result.rows[0] });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
