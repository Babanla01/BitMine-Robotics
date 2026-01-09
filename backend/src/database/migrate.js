import pool from '../config/database.js';

async function migrateDatabase() {
  try {
    console.log('🔄 Running database migrations...');

    // Add UNIQUE constraint to paystack_reference if it doesn't exist
    try {
      const constraintCheck = await pool.query(`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'orders' AND constraint_type = 'UNIQUE' AND constraint_name LIKE '%paystack%'
      `);

      if (constraintCheck.rows.length === 0) {
        console.log('Adding UNIQUE constraint to paystack_reference...');
        await pool.query(`
          ALTER TABLE orders 
          ADD CONSTRAINT orders_paystack_reference_unique UNIQUE (paystack_reference)
        `);
        console.log('✅ UNIQUE constraint added to paystack_reference');
      }
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✅ UNIQUE constraint already exists on paystack_reference');
      } else {
        console.error('Error adding UNIQUE constraint:', err.message);
      }
    }

    // Add phone column to users if it doesn't exist
    try {
      const phoneCheck = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
      `);

      if (phoneCheck.rows.length === 0) {
        console.log('Adding phone column to users...');
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN phone VARCHAR(20)
        `);
        console.log('✅ Phone column added to users');
      }
    } catch (err) {
      console.error('Error adding phone column:', err.message);
    }

    // Add profile_completed column to users if it doesn't exist
    try {
      const profileCheck = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'profile_completed'
      `);

      if (profileCheck.rows.length === 0) {
        console.log('Adding profile_completed column to users...');
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE
        `);
        console.log('✅ Profile_completed column added to users');
      }
    } catch (err) {
      console.error('Error adding profile_completed column:', err.message);
    }

    // Add account lockout columns to users if they don't exist
    try {
      const lockoutCheck = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name IN ('failed_login_attempts', 'locked_until')
      `);

      const existing = lockoutCheck.rows.map(r => r.column_name);
      if (!existing.includes('failed_login_attempts')) {
        console.log('Adding failed_login_attempts column to users...');
        await pool.query(`ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0`);
        console.log('✅ failed_login_attempts column added');
      }
      if (!existing.includes('locked_until')) {
        console.log('Adding locked_until column to users...');
        await pool.query(`ALTER TABLE users ADD COLUMN locked_until TIMESTAMP WITH TIME ZONE`);
        console.log('✅ locked_until column added');
      }
    } catch (err) {
      console.error('Error adding account lockout columns:', err.message);
    }

    // Create refresh_tokens table if it doesn't exist
    try {
      const refreshCheck = await pool.query(`
        SELECT table_name FROM information_schema.tables WHERE table_name = 'refresh_tokens'
      `);

      if (refreshCheck.rows.length === 0) {
        console.log('Creating refresh_tokens table...');
        await pool.query(`
          CREATE TABLE refresh_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            token TEXT NOT NULL,
            revoked BOOLEAN DEFAULT FALSE,
            expires_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `);
        await pool.query(`CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token)`);
        console.log('✅ refresh_tokens table created');
      }
    } catch (err) {
      console.error('Error creating refresh_tokens table:', err.message);
    }

    // Create categories table if it doesn't exist
    try {
      const categoriesCheck = await pool.query(`
        SELECT table_name FROM information_schema.tables WHERE table_name = 'categories'
      `);

      if (categoriesCheck.rows.length === 0) {
        console.log('Creating categories table...');
        await pool.query(`
          CREATE TABLE categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await pool.query(`CREATE INDEX idx_categories_name ON categories(name)`);
        console.log('✅ categories table created');
      }
    } catch (err) {
      console.error('Error creating categories table:', err.message);
    }

    // Create subcategories table if it doesn't exist
    try {
      const subcategoriesCheck = await pool.query(`
        SELECT table_name FROM information_schema.tables WHERE table_name = 'subcategories'
      `);

      if (subcategoriesCheck.rows.length === 0) {
        console.log('Creating subcategories table...');
        await pool.query(`
          CREATE TABLE subcategories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(name, category_id)
          )
        `);
        await pool.query(`CREATE INDEX idx_subcategories_category_id ON subcategories(category_id)`);
        console.log('✅ subcategories table created');
      }
    } catch (err) {
      console.error('Error creating subcategories table:', err.message);
    }

    // Add category_id and subcategory_id columns to products if they don't exist
    try {
      const categoryIdCheck = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'category_id'
      `);

      if (categoryIdCheck.rows.length === 0) {
        console.log('Adding category_id column to products...');
        await pool.query(`
          ALTER TABLE products 
          ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
        `);
        await pool.query(`CREATE INDEX idx_products_category_id ON products(category_id)`);
        console.log('✅ category_id column added to products');
      }
    } catch (err) {
      console.error('Error adding category_id column:', err.message);
    }

    try {
      const subcategoryIdCheck = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'subcategory_id'
      `);

      if (subcategoryIdCheck.rows.length === 0) {
        console.log('Adding subcategory_id column to products...');
        await pool.query(`
          ALTER TABLE products 
          ADD COLUMN subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL
        `);
        await pool.query(`CREATE INDEX idx_products_subcategory_id ON products(subcategory_id)`);
        console.log('✅ subcategory_id column added to products');
      }
    } catch (err) {
      console.error('Error adding subcategory_id column:', err.message);
    }

    console.log('✅ Database migrations complete');
  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
  }
}

export default migrateDatabase;
