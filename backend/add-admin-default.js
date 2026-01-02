import bcryptjs from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bitmine',
  user: process.env.DB_USER || 'bitminerobotics',
  password: process.env.DB_PASSWORD || 'SuperStrongPass@123',
});

async function addAdmin(name, email, password) {
  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('❌ User with this email already exists');
      process.exit(1);
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, 'admin']
    );

    console.log('✅ Admin user created successfully!');
    console.log('User Details:', {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      role: result.rows[0].role
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error && error.message ? error.message : error);
    process.exit(1);
  }
}

// Defaults provided by you
const DEFAULT_NAME = 'Admin';
const DEFAULT_EMAIL = 'bitmineroboticscw@gmail.com';
const DEFAULT_PASSWORD = 'bitmine@2026';

addAdmin(DEFAULT_NAME, DEFAULT_EMAIL, DEFAULT_PASSWORD);
