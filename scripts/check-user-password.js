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

async function checkUserPassword(nipToCheck) {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Check the user's password
    console.log(`Checking password for NIP: ${nipToCheck}`);
    
    const result = await client.query(
      'SELECT id, nama, nip, password FROM users WHERE nip = $1',
      [nipToCheck]
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('User found:');
      console.log('ID:', user.id);
      console.log('Name:', user.nama);
      console.log('NIP:', user.nip);
      console.log('Password:', user.password);
      console.log('Password length:', user.password.length);
      console.log('Is bcrypt hash:', user.password.startsWith('$2b$'));
    } else {
      console.log(`User with NIP ${nipToCheck} not found in database`);
    }
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Check the specific user
checkUserPassword('123456789012345678');