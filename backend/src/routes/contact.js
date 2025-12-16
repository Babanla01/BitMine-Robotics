import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const result = await pool.query(
      'INSERT INTO contact_submissions (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, subject, message]
    );

    const submission = result.rows[0];

    res.status(201).json({
      message: 'Contact form submitted successfully',
      submission
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all contact submissions (admin)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_submissions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
