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

    console.log('✅ Database migrations complete');
  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
  }
}

export default migrateDatabase;
