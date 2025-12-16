import pool from '../config/database.js';

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database tables...');

    // Create tutor_applications table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tutor_applications (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        education VARCHAR(255),
        experience TEXT,
        skills VARCHAR(500),
        message TEXT,
        cv_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add missing columns if they don't exist
    const columnsToAdd = [
      { column: 'education', type: 'VARCHAR(255)' },
      { column: 'experience', type: 'TEXT' },
      { column: 'skills', type: 'VARCHAR(500)' },
      { column: 'message', type: 'TEXT' },
      { column: 'cv_url', type: 'VARCHAR(500)' },
      { column: 'status', type: "VARCHAR(50) DEFAULT 'pending'" }
    ];

    for (const { column, type } of columnsToAdd) {
      try {
        await pool.query(`
          ALTER TABLE tutor_applications 
          ADD COLUMN IF NOT EXISTS ${column} ${type};
        `);
      } catch (err) {
        // Ignore if column already exists
      }
    }

    console.log('✅ tutor_applications table ready');

    // Create other tables if needed
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        profile_image VARCHAR(500),
        profile_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ users table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        age_group VARCHAR(50),
        skill_level VARCHAR(50),
        image_url VARCHAR(500),
        stock INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ products table ready');

    // Check if partner_applications table exists and has wrong schema
    try {
      const checkTable = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='partner_applications' AND column_name='company_name';
      `);
      
      if (checkTable.rows.length > 0) {
        // Table has old schema, drop it
        console.log('🔄 Dropping old partner_applications table...');
        await pool.query('DROP TABLE IF EXISTS partner_applications CASCADE;');
      }
    } catch (err) {
      // Ignore errors
    }

    // Create partner_applications table with correct schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS partner_applications (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        partnership_type VARCHAR(100) NOT NULL,
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ partner_applications table ready');

    // Create orders table with complete schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        street_address VARCHAR(500) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'Nigeria',
        subtotal DECIMAL(10, 2) NOT NULL,
        delivery_fee DECIMAL(10, 2) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
        order_status VARCHAR(50) DEFAULT 'processing' CHECK (order_status IN ('processing', 'shipped', 'delivered', 'cancelled')),
        paystack_reference VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ orders table ready');

    // Create order_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ order_items table ready');

    // Create delivery_zones table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS delivery_zones (
        id SERIAL PRIMARY KEY,
        state VARCHAR(100) UNIQUE NOT NULL,
        delivery_fee DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default Nigerian states and delivery fees
    const states = [
      { state: 'Lagos', fee: 2500 },
      { state: 'Abuja', fee: 3000 },
      { state: 'Port Harcourt', fee: 3500 },
      { state: 'Kano', fee: 3500 },
      { state: 'Ibadan', fee: 2800 },
      { state: 'Kaduna', fee: 3000 },
      { state: 'Enugu', fee: 3200 },
      { state: 'Calabar', fee: 3500 },
      { state: 'Warri', fee: 3500 },
      { state: 'Ilorin', fee: 3000 },
      { state: 'Benin City', fee: 3000 },
      { state: 'Akure', fee: 2800 },
      { state: 'Abeokuta', fee: 2800 },
      { state: 'Gusau', fee: 3200 },
      { state: 'Yola', fee: 3500 },
      { state: 'Bauchi', fee: 3500 },
      { state: 'Zaria', fee: 3000 },
      { state: 'Lafia', fee: 3200 },
      { state: 'Jos', fee: 3200 },
      { state: 'Okada', fee: 3000 },
      { state: 'Other', fee: 4000 }
    ];

    for (const { state, fee } of states) {
      try {
        await pool.query(
          `INSERT INTO delivery_zones (state, delivery_fee) VALUES ($1, $2) 
           ON CONFLICT (state) DO UPDATE SET delivery_fee = $2`,
          [state, fee]
        );
      } catch (err) {
        // Ignore if already exists
      }
    }

    console.log('✅ delivery_zones table ready with Nigerian states');

    // Create class_bookings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS class_bookings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        course_type VARCHAR(100) NOT NULL,
        level VARCHAR(50) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        special_requests TEXT,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ class_bookings table ready');


    // Create user_addresses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        street_address VARCHAR(500) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20),
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ user_addresses table ready');

    // Create password_reset_otps table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_otps (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        is_used BOOLEAN DEFAULT false,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ password_reset_otps table ready');

    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
}

export default initializeDatabase;
