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

async function updatePassword() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Update user password with bcrypt hash
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('123', 10);
    
    const result = await client.query(
      'UPDATE users SET password = $1 WHERE nip = $2 RETURNING *',
      [hashedPassword, '196801011990031001']
    );
    
    console.log('Updated user:', result.rows[0]);
  } catch (err) {
    console.error('Error updating password:', err);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

updatePassword();