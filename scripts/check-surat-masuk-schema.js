const { Client } = require('pg');
require('dotenv').config();

// Create a PostgreSQL client
const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'suratku',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function checkSuratMasukTable() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Get table schema
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'surat_masuk' 
      ORDER BY ordinal_position
    `);
    
    console.log('surat_masuk table schema:');
    console.table(result.rows);
  } catch (err) {
    console.error('Error checking table schema:', err);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

checkSuratMasukTable();