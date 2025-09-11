#!/usr/bin/env node

/**
 * Data Migration Script from PostgreSQL to Supabase
 * 
 * This script helps migrate existing data from your PostgreSQL database to Supabase.
 * 
 * Usage:
 * 1. Update the PostgreSQL connection details in the script
 * 2. Ensure your Supabase environment variables are set
 * 3. Run: node scripts/migrate-data.js
 */

const { Client } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });

// Create Supabase client directly in the script
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);

// PostgreSQL connection details (update these with your actual details)
const pgConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'suratku',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
};

async function migrateUsers(pgClient) {
  try {
    console.log('Migrating users...');
    
    // Fetch users from PostgreSQL
    const pgResult = await pgClient.query('SELECT * FROM users ORDER BY id');
    const users = pgResult.rows;
    
    console.log(`Found ${users.length} users to migrate.`);
    
    if (users.length === 0) {
      console.log('No users to migrate.');
      return;
    }
    
    // Insert users to Supabase
    const usersToInsert = users.map(user => ({
      id: user.id,
      nama: user.nama,
      email: user.email,
      nip: user.nip,
      password: user.password,
      pangkat_gol: user.pangkat_gol,
      jabatan: user.jabatan,
      role: user.role,
      last_login: user.last_login,
      created_at: user.created_at
    }));
    
    const { error } = await supabase
      .from('users')
      .insert(usersToInsert);
    
    if (error) {
      console.error('Error migrating users:', error);
    } else {
      console.log('Users migration completed.');
    }
  } catch (error) {
    console.error('Error during users migration:', error);
  }
}

async function migrateSurat(pgClient) {
  try {
    console.log('Migrating surat...');
    
    // Fetch surat from PostgreSQL
    const pgResult = await pgClient.query('SELECT * FROM surat ORDER BY id');
    const surat = pgResult.rows;
    
    console.log(`Found ${surat.length} surat to migrate.`);
    
    if (surat.length === 0) {
      console.log('No surat to migrate.');
      return;
    }
    
    // Insert surat to Supabase
    const suratToInsert = surat.map(s => ({
      id: s.id,
      nomor: s.nomor,
      tanggal: s.tanggal,
      tujuan: s.tujuan,
      perihal: s.perihal,
      pembuat: s.pembuat,
      pembuat_id: s.pembuat_id,
      kategori: s.kategori,
      full_kategori: s.full_kategori
    }));
    
    const { error } = await supabase
      .from('surat')
      .insert(suratToInsert);
    
    if (error) {
      console.error('Error migrating surat:', error);
    } else {
      console.log('Surat migration completed.');
    }
  } catch (error) {
    console.error('Error during surat migration:', error);
  }
}

async function migrateSuratMasuk(pgClient) {
  try {
    console.log('Migrating surat masuk...');
    
    // Fetch surat masuk from PostgreSQL
    const pgResult = await pgClient.query('SELECT * FROM surat_masuk ORDER BY id');
    const suratMasuk = pgResult.rows;
    
    console.log(`Found ${suratMasuk.length} surat masuk to migrate.`);
    
    if (suratMasuk.length === 0) {
      console.log('No surat masuk to migrate.');
      return;
    }
    
    // Insert surat masuk to Supabase
    const suratMasukToInsert = suratMasuk.map(sm => ({
      id: sm.id,
      nomor: sm.nomor,
      tanggal: sm.tanggal,
      pengirim: sm.pengirim,
      perihal: sm.perihal,
      created_at: sm.created_at,
      file_path: sm.file_path,
      file_name: sm.file_name,
      file_type: sm.file_type,
      file_size: sm.file_size
    }));
    
    const { error } = await supabase
      .from('surat_masuk')
      .insert(suratMasukToInsert);
    
    if (error) {
      console.error('Error migrating surat masuk:', error);
    } else {
      console.log('Surat masuk migration completed.');
    }
  } catch (error) {
    console.error('Error during surat masuk migration:', error);
  }
}

async function migrateCategories(pgClient) {
  try {
    console.log('Migrating categories...');
    
    // Fetch categories from PostgreSQL
    const pgResult = await pgClient.query('SELECT * FROM categories');
    const categories = pgResult.rows;
    
    console.log(`Found ${categories.length} categories to migrate.`);
    
    if (categories.length === 0) {
      console.log('No categories to migrate.');
      return;
    }
    
    // Insert categories to Supabase
    const categoriesToInsert = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      sub: cat.sub
    }));
    
    const { error } = await supabase
      .from('categories')
      .insert(categoriesToInsert);
    
    if (error) {
      console.error('Error migrating categories:', error);
    } else {
      console.log('Categories migration completed.');
    }
  } catch (error) {
    console.error('Error during categories migration:', error);
  }
}

async function main() {
  // Check if Supabase is configured
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
    process.exit(1);
  }
  
  const pgClient = new Client(pgConfig);
  
  try {
    // Connect to PostgreSQL
    await pgClient.connect();
    console.log('Connected to PostgreSQL database');
    
    // Migrate data
    await migrateUsers(pgClient);
    await migrateSurat(pgClient);
    await migrateSuratMasuk(pgClient);
    await migrateCategories(pgClient);
    
    console.log('All data migration completed!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await pgClient.end();
    console.log('PostgreSQL connection closed');
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { migrateUsers, migrateSurat, migrateSuratMasuk, migrateCategories };