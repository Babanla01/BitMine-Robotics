import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bitmine_db',
  user: process.env.DB_USER || 'bitmine_user',
  password: process.env.DB_PASSWORD || 'password',
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Test connection
try {
  const result = await pool.query('SELECT NOW()');
  console.log('✅ Database connection test successful:', result.rows[0]);
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
}

export default pool;
