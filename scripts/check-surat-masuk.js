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

async function checkSuratMasukData() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Query the surat_masuk table
    const result = await client.query('SELECT * FROM surat_masuk');
    console.log('Surat Masuk data:', result.rows);
  } catch (err) {
    console.error('Error querying data:', err);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

checkSuratMasukData();