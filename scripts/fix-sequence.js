const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'suratku',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function checkSequence() {
  try {
    await client.connect();
    
    // Check the current value of the sequence
    const res = await client.query("SELECT last_value FROM surat_id_seq");
    console.log('Current sequence value:', res.rows[0].last_value);
    
    // Check the maximum ID in the surat table
    const maxIdRes = await client.query("SELECT MAX(id) as max_id FROM surat");
    console.log('Maximum ID in surat table:', maxIdRes.rows[0].max_id);
    
    // If the sequence is behind the max ID, update it
    const maxId = maxIdRes.rows[0].max_id;
    const sequenceValue = res.rows[0].last_value;
    
    if (maxId > sequenceValue) {
      console.log('Updating sequence to match max ID');
      await client.query(`SELECT setval('surat_id_seq', ${maxId})`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkSequence();