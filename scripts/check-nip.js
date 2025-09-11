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

async function checkNip(nipToCheck) {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Check if NIP exists in database
    console.log(`Checking for NIP: ${nipToCheck}`);
    
    const result = await client.query(
      'SELECT id, nama, nip FROM users WHERE nip = $1',
      [nipToCheck]
    );
    
    if (result.rows.length > 0) {
      console.log('NIP found in database:');
      console.log('ID:', result.rows[0].id);
      console.log('Name:', result.rows[0].nama);
      console.log('NIP:', result.rows[0].nip);
      console.log('NIP length:', result.rows[0].nip.length);
    } else {
      console.log(`NIP ${nipToCheck} not found in database`);
      
      // Let's check all NIPs in the database to see what's actually stored
      console.log('\nAll NIPs in database:');
      const allNips = await client.query('SELECT id, nama, nip FROM users ORDER BY id');
      allNips.rows.forEach(row => {
        console.log(`ID: ${row.id}, Name: ${row.nama}, NIP: '${row.nip}' (length: ${row.nip.length})`);
      });
    }
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Check the specific NIP mentioned
checkNip('123456789012345678');