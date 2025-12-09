const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

(async () => {
  const connectionString = process.env.DATABASE_URL;
  const pool = connectionString ? new Pool({ connectionString }) : new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'fastloan_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  const seedsPath = path.resolve(__dirname, '..', '..', 'database', 'seeds.sql');

  try {
    const sql = fs.readFileSync(seedsPath, 'utf8');
    console.log(`Applying seeds from: ${seedsPath}`);
    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log('✅ Seeding completed: sample data inserted');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
