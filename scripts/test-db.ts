import pool from '../lib/db';

// Test the database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database successfully!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as now');
    console.log('Current time from database:', result.rows[0].now);
    
    client.release();
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
  }
}

testConnection();