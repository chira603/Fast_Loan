const { query } = require('../config/database');

async function addProfileFields() {
  console.log('Starting migration: Adding profile fields to users table...');

  try {
    // Add personal information fields
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE');
    console.log('✓ Added date_of_birth column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20)');
    console.log('✓ Added gender column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation VARCHAR(100)');
    console.log('✓ Added occupation column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(200)');
    console.log('✓ Added company_name column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS annual_income DECIMAL(12,2)');
    console.log('✓ Added annual_income column');

    // Add ID proof fields
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS pan_number VARCHAR(10)');
    console.log('✓ Added pan_number column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhar_number VARCHAR(12)');
    console.log('✓ Added aadhar_number column');

    // Add emergency contact fields
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100)');
    console.log('✓ Added emergency_contact_name column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20)');
    console.log('✓ Added emergency_contact_phone column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_relation VARCHAR(50)');
    console.log('✓ Added emergency_contact_relation column');

    // Add document URL fields
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT');
    console.log('✓ Added profile_photo_url column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhar_front_url TEXT');
    console.log('✓ Added aadhar_front_url column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhar_back_url TEXT');
    console.log('✓ Added aadhar_back_url column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS pan_card_url TEXT');
    console.log('✓ Added pan_card_url column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_statement_url TEXT');
    console.log('✓ Added bank_statement_url column');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS salary_slip_url TEXT');
    console.log('✓ Added salary_slip_url column');

    // Add indexes
    await query('CREATE INDEX IF NOT EXISTS idx_users_pan ON users(pan_number)');
    console.log('✓ Created index on pan_number');

    await query('CREATE INDEX IF NOT EXISTS idx_users_aadhar ON users(aadhar_number)');
    console.log('✓ Created index on aadhar_number');

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addProfileFields();
