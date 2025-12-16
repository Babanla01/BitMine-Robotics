import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Submit partner application
router.post('/', async (req, res) => {
  try {
    console.log('Partner submission received:', req.body);
    
    const { name, company, email, phone, partnershipType, message } = req.body;

    if (!name || !company || !email || !partnershipType || !message) {
      console.log('Missing required fields:', { name, company, email, partnershipType, message });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO partner_applications (name, company, email, phone, partnership_type, message, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    const values = [name, company, email, phone, partnershipType, message];
    console.log('Query values:', values);
    
    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Partnership application submitted successfully',
      application: result.rows[0]
    });
  } catch (error) {
    console.error('Error submitting partner application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all partner applications (admin)
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM partner_applications ORDER BY created_at DESC;';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching partner applications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single partner application
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM partner_applications WHERE id = $1;';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching partner application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update application status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'under_review'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const query = `
      UPDATE partner_applications
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application status updated', application: result.rows[0] });
  } catch (error) {
    console.error('Error updating partner application status:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
