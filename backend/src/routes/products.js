import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all products with pagination
router.get('/', async (req, res) => {
  try {
    const { category, age_group, skill_level, page = 1, limit = 10 } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10)); // Max 100 per page
    const offset = (pageNum - 1) * limitNum;

    let whereClause = '1=1';
    const params = [];

    if (category) {
      whereClause += ` AND category = $${params.length + 1}`;
      params.push(category);
    }
    if (age_group) {
      whereClause += ` AND age_group = $${params.length + 1}`;
      params.push(age_group);
    }
    if (skill_level) {
      whereClause += ` AND skill_level = $${params.length + 1}`;
      params.push(skill_level);
    }

    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) FROM products WHERE ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results - add limit and offset params
    const allParams = [...params, limitNum, offset];
    const query = `SELECT * FROM products WHERE ${whereClause} ORDER BY id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    
    const result = await pool.query(query, allParams);
    
    res.json({
      data: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products: ' + error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM products');
    const categories = result.rows.map(row => row.category);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, category_id, subcategory_id, price, stock, description, image_url, age_group, skill_level } = req.body;

    // Validate required fields
    if (!name || !category_id || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name, category_id, price, and stock are required' });
    }

    // Get category name for backward compatibility
    const categoryResult = await pool.query('SELECT name FROM categories WHERE id = $1', [category_id]);
    const categoryName = categoryResult.rows[0]?.name || 'Uncategorized';

    const result = await pool.query(
      'INSERT INTO products (name, category, category_id, subcategory_id, price, stock, description, image_url, age_group, skill_level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [name, categoryName, category_id, subcategory_id || null, price, stock, description || '', image_url || '', age_group || 'All', skill_level || 'Beginner']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product: ' + error.message });
  }
});

// Update product (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { name, category_id, subcategory_id, price, stock, description, image_url, age_group, skill_level } = req.body;
    const productId = req.params.id;

    // Check if product exists
    const existingProduct = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get category name if category_id is provided
    let categoryName = existingProduct.rows[0].category;
    if (category_id) {
      const categoryResult = await pool.query('SELECT name FROM categories WHERE id = $1', [category_id]);
      categoryName = categoryResult.rows[0]?.name || existingProduct.rows[0].category;
    }

    const result = await pool.query(
      'UPDATE products SET name = $1, category = $2, category_id = $3, subcategory_id = $4, price = $5, stock = $6, description = $7, image_url = $8, age_group = $9, skill_level = $10 WHERE id = $11 RETURNING *',
      [name || existingProduct.rows[0].name, categoryName, category_id || existingProduct.rows[0].category_id, subcategory_id !== undefined ? subcategory_id : existingProduct.rows[0].subcategory_id, price || existingProduct.rows[0].price, stock !== undefined ? stock : existingProduct.rows[0].stock, description || existingProduct.rows[0].description, image_url || existingProduct.rows[0].image_url, age_group || existingProduct.rows[0].age_group, skill_level || existingProduct.rows[0].skill_level, productId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product: ' + error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if product exists
    const existingProduct = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product: ' + error.message });
  }
});

export default router;
