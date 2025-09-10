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

async function alterSuratMasukTable() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Add columns for file attachment to surat_masuk table
    const query = `
      ALTER TABLE surat_masuk 
      ADD COLUMN IF NOT EXISTS file_path VARCHAR(255),
      ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS file_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS file_size INTEGER
    `;
    
    await client.query(query);
    console.log('Table surat_masuk altered successfully');
  } catch (err) {
    console.error('Error altering table:', err);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

alterSuratMasukTable();