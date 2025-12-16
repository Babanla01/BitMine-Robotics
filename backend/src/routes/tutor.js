import express from 'express';
import pool from '../config/database.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Submit tutor application
router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, education, experience, skills, message, cvFilename } = req.body;

    if (!fullName || !email || !phone || !experience) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cvUrl = cvFilename ? `http://localhost:5001/uploads/${cvFilename}` : null;

    const query = `
      INSERT INTO tutor_applications (name, email, phone, education, experience, skills, message, cv_url, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    const values = [fullName, email, phone, education, experience, skills, message, cvUrl];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Application submitted successfully',
      application: result.rows[0]
    });
  } catch (error) {
    console.error('Error submitting tutor application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all tutor applications (admin)
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM tutor_applications ORDER BY created_at DESC;';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tutor applications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single tutor application
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM tutor_applications WHERE id = $1;';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching tutor application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update application status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const query = `
      UPDATE tutor_applications
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
    console.error('Error updating tutor application status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download CV
router.get('/:id/download-cv', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT cv_url FROM tutor_applications WHERE id = $1;';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const cvUrl = result.rows[0].cv_url;
    if (!cvUrl) {
      return res.status(404).json({ error: 'CV not found' });
    }

    // Extract filename from URL
    const filename = path.basename(cvUrl);
    const filepath = path.join('./uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Send file for download
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error downloading file' });
        }
      }
    });
  } catch (error) {
    console.error('Error downloading CV:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
