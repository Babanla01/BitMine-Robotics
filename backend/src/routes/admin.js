import express from 'express';
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const productCount = await pool.query('SELECT COUNT(*) FROM products');
    const orderCount = await pool.query('SELECT COUNT(*) FROM orders');
    const revenueResult = await pool.query('SELECT SUM(amount) as total FROM orders WHERE status = $1', ['completed']);

    const stats = {
      totalUsers: userCount.rows[0].count,
      totalProducts: productCount.rows[0].count,
      totalOrders: orderCount.rows[0].count,
      totalRevenue: parseFloat(revenueResult.rows[0].total) || 0,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin)
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password, role, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id, name, email, role, created_at;
    `;

    const result = await pool.query(query, [name, email, hashedPassword, role]);
    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      UPDATE users 
      SET name = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, email, role, created_at;
    `;

    const result = await pool.query(query, [name, email, role, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all products (admin)
router.get('/products', (req, res) => {
  try {
    // Mock products
    const products = [
      {
        id: 1,
        name: 'Robotics Kit - Beginner',
        price: 99.99,
        category: 'robotics-kits',
        stock: 50,
        created_at: '2025-01-01'
      },
      {
        id: 2,
        name: 'Advanced Robotics Kit',
        price: 249.99,
        category: 'robotics-kits',
        stock: 30,
        created_at: '2025-01-05'
      }
    ];

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post('/products', (req, res) => {
  try {
    const { name, description, price, category, age_group, skill_level, stock } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = {
      id: Math.random() * 1000,
      name,
      description,
      price,
      category,
      age_group,
      skill_level,
      stock,
      created_at: new Date()
    };

    // TODO: Save to database
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // TODO: Update in database
    res.json({ message: `Product ${id} updated successfully`, product: updateData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Delete from database
    res.json({ message: `Product ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (admin)
router.get('/orders', (req, res) => {
  try {
    // Mock orders
    const orders = [
      { id: 1, customer: 'John Doe', amount: 299.99, status: 'Completed', date: '2025-11-28' },
      { id: 2, customer: 'Jane Smith', amount: 149.50, status: 'Pending', date: '2025-11-27' }
    ];

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get analytics
router.get('/analytics', (req, res) => {
  try {
    // Mock analytics
    const analytics = {
      sales: [100, 150, 200, 180, 220, 250, 280],
      users: [10, 15, 20, 25, 30, 35, 40],
      revenue: [1000, 1500, 2000, 1800, 2200, 2500, 2800],
      topProducts: [
        { name: 'Robotics Kit', sales: 150 },
        { name: 'Coding Book', sales: 120 },
        { name: 'Arduino Board', sales: 100 }
      ]
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile status
router.get('/profile-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT id, name, email, phone, profile_completed FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userResult = await pool.query(
      'SELECT id, name, email, phone FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get default address
    const addressResult = await pool.query(
      'SELECT * FROM user_addresses WHERE user_id = $1 AND is_default = TRUE LIMIT 1',
      [userId]
    );

    const defaultAddress = addressResult.rows.length > 0 ? addressResult.rows[0] : null;

    res.json({
      user,
      defaultAddress
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user profile (complete profile setup)
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone, email, street_address, city, state, postal_code } = req.body;

    if (!name || !phone || !email || !street_address || !city || !state || !postal_code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update user info
    const userQuery = `
      UPDATE users 
      SET name = $1, phone = $2, email = $3, profile_completed = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, email, phone, profile_completed;
    `;

    const userResult = await pool.query(userQuery, [name, phone, email, userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = userResult.rows[0];

    // Save default address
    const addressQuery = `
      INSERT INTO user_addresses (user_id, street_address, city, state, postal_code, is_default)
      VALUES ($1, $2, $3, $4, $5, TRUE)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;

    const addressResult = await pool.query(addressQuery, [userId, street_address, city, state, postal_code]);

    res.json({
      message: 'Profile completed successfully',
      user: updatedUser,
      address: addressResult.rows.length > 0 ? addressResult.rows[0] : null
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
