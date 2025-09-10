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

async function createSuratMasukTable() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Create surat_masuk table
    const query = `
      CREATE TABLE IF NOT EXISTS surat_masuk (
        id SERIAL PRIMARY KEY,
        nomor VARCHAR(255) NOT NULL,
        tanggal DATE NOT NULL,
        pengirim VARCHAR(255) NOT NULL,
        perihal TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(query);
    console.log('Table surat_masuk created successfully');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

createSuratMasukTable();