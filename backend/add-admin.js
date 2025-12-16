import bcryptjs from 'bcryptjs';
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

async function addAdmin(name, email, password) {
  try {
    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('❌ User with this email already exists');
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Insert admin user
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
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Get credentials from command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: node add-admin.js <name> <email> <password>');
  console.log('Example: node add-admin.js "Admin User" admin@bitmine.com password123');
  process.exit(1);
}

const [name, email, password] = args;
addAdmin(name, email, password);
