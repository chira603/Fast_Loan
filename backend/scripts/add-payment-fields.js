const { query } = require('../config/database');

async function addPaymentFields() {
  console.log('Starting migration: Adding bank and UPI fields to users table...');

  try {
    // Add bank account fields
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100)');
    console.log('✓ Added bank_name column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(100)');
    console.log('✓ Added account_holder_name column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS account_number VARCHAR(50)');
    console.log('✓ Added account_number column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(20)');
    console.log('✓ Added ifsc_code column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type VARCHAR(20)');
    console.log('✓ Added account_type column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_name VARCHAR(100)');
    console.log('✓ Added branch_name column');

    // Add UPI field
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100)');
    console.log('✓ Added upi_id column');

    // Add indexes
    await query('CREATE INDEX IF NOT EXISTS idx_users_account_number ON users(account_number)');
    console.log('✓ Created index on account_number');

    await query('CREATE INDEX IF NOT EXISTS idx_users_upi_id ON users(upi_id)');
    console.log('✓ Created index on upi_id');

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addPaymentFields();
