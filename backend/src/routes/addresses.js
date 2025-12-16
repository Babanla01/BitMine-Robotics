import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all addresses for a user
router.get('/user/:userId/addresses', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get default address for a user
router.get('/user/:userId/address/default', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT * FROM user_addresses WHERE user_id = $1 AND is_default = TRUE LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No default address found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching default address:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new address
router.post('/user/:userId/addresses', async (req, res) => {
  try {
    const { userId } = req.params;
    const { street_address, city, state, postal_code, is_default } = req.body;

    if (!street_address || !city || !state) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If this is set as default, unset other default addresses
    if (is_default) {
      await pool.query(
        'UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1',
        [userId]
      );
    }

    const result = await pool.query(
      `INSERT INTO user_addresses (user_id, street_address, city, state, postal_code, is_default)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, street_address, city, state, postal_code, is_default || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update an address
router.put('/user/:userId/addresses/:addressId', async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const { street_address, city, state, postal_code, is_default } = req.body;

    if (!street_address || !city || !state) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If this is set as default, unset other default addresses
    if (is_default) {
      await pool.query(
        'UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1 AND id != $2',
        [userId, addressId]
      );
    }

    const result = await pool.query(
      `UPDATE user_addresses 
       SET street_address = $1, city = $2, state = $3, postal_code = $4, is_default = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [street_address, city, state, postal_code, is_default || false, addressId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete an address
router.delete('/user/:userId/addresses/:addressId', async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    const result = await pool.query(
      'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2 RETURNING *',
      [addressId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: error.message });
  }
});

// Set address as default
router.put('/user/:userId/addresses/:addressId/set-default', async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    // Unset all other default addresses
    await pool.query(
      'UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1',
      [userId]
    );

    // Set this address as default
    const result = await pool.query(
      `UPDATE user_addresses SET is_default = TRUE, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [addressId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
