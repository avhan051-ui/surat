const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'suratku',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function fixSequence() {
  try {
    await client.connect();
    
    console.log('Checking and fixing surat table sequence...');
    
    // Check the current value of the sequence
    const res = await client.query("SELECT last_value FROM surat_id_seq");
    const sequenceValue = res.rows[0].last_value;
    console.log('Current sequence value:', sequenceValue);
    
    // Check the maximum ID in the surat table
    const maxIdRes = await client.query("SELECT MAX(id) as max_id FROM surat");
    const maxId = maxIdRes.rows[0].max_id;
    console.log('Maximum ID in surat table:', maxId);
    
    // If the sequence is behind the max ID, update it
    if (maxId > sequenceValue) {
      console.log('Updating sequence to match max ID');
      await client.query(`SELECT setval('surat_id_seq', ${maxId})`);
      console.log('Sequence updated successfully');
    } else {
      console.log('Sequence is already correct');
    }
  } catch (err) {
    console.error('Error fixing sequence:', err);
  } finally {
    await client.end();
  }
}

fixSequence();