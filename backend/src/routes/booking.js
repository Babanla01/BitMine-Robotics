import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Submit class booking
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, courseType, level, duration, specialRequests } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !courseType || !level || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO class_bookings (name, email, phone, course_type, level, duration, special_requests, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    const values = [name, email, phone, courseType, level, duration, specialRequests || null];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Class booking submitted successfully',
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Error submitting class booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all class bookings (admin)
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM class_bookings ORDER BY created_at DESC;';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching class bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single class booking
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM class_bookings WHERE id = $1;';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching class booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update booking status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const query = `
      UPDATE class_bookings
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking status updated', booking: result.rows[0] });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM class_bookings WHERE id = $1 RETURNING *;';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully', booking: result.rows[0] });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
