import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // Check if already subscribed
    const existing = await pool.query(
      'SELECT * FROM newsletter_subscriptions WHERE email = $1 AND subscribed = true',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already subscribed' });
    }

    const result = await pool.query(
      'INSERT INTO newsletter_subscriptions (email, subscribed) VALUES ($1, true) RETURNING *',
      [email]
    );

    res.status(201).json({
      message: 'Successfully subscribed to newsletter',
      subscription: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const result = await pool.query(
      'UPDATE newsletter_subscriptions SET subscribed = false, unsubscribed_at = CURRENT_TIMESTAMP WHERE email = $1 RETURNING *',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all subscriptions (admin)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM newsletter_subscriptions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
