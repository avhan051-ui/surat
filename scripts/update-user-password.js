const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Create a PostgreSQL client
const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'suratku',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function updateUserPassword(nipToUpdate) {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Hash the password
    const plainPassword = '123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    console.log(`Hashing password for NIP: ${nipToUpdate}`);
    console.log(`Plain password: ${plainPassword}`);
    console.log(`Hashed password: ${hashedPassword}`);
    
    // Update the user's password
    const result = await client.query(
      'UPDATE users SET password = $1 WHERE nip = $2 RETURNING id, nama, nip',
      [hashedPassword, nipToUpdate]
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('User password updated successfully:');
      console.log('ID:', user.id);
      console.log('Name:', user.nama);
      console.log('NIP:', user.nip);
    } else {
      console.log(`User with NIP ${nipToUpdate} not found in database`);
    }
  } catch (err) {
    console.error('Error updating user password:', err);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Update the specific user
updateUserPassword('123456789012345678');