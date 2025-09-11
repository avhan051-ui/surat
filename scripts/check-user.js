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

async function checkUser() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Get user by NIP
    const result = await client.query(
      'SELECT * FROM users WHERE nip = $1',
      ['196801011990031001']
    );
    
    if (result.rows.length > 0) {
      console.log('User found:', result.rows[0]);
    } else {
      console.log('User not found with NIP: 196801011990031001');
    }
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

checkUser();