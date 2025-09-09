import pool from '../lib/db';

async function createTables() {
  const client = await pool.connect();
  
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        nip VARCHAR(18) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        pangkat_gol VARCHAR(255),
        jabatan VARCHAR(255),
        role VARCHAR(50),
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(20) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sub JSONB
      )
    `);
    
    // Create surat table
    await client.query(`
      CREATE TABLE IF NOT EXISTS surat (
        id SERIAL PRIMARY KEY,
        nomor VARCHAR(255) NOT NULL,
        tanggal DATE NOT NULL,
        tujuan VARCHAR(255) NOT NULL,
        perihal TEXT,
        pembuat VARCHAR(255) NOT NULL,
        pembuat_id INTEGER REFERENCES users(id),
        kategori VARCHAR(20),
        full_kategori VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    client.release();
  }
}

createTables();