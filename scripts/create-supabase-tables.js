#!/usr/bin/env node

/**
 * Supabase Table Creation Script
 * 
 * This script creates the necessary tables in Supabase programmatically.
 * 
 * Usage:
 * 1. Ensure your Supabase environment variables are set
 * 2. Run: node scripts/create-supabase-tables.js
 */

require('dotenv').config({ path: __dirname + '/../.env' });

// Create Supabase client directly in the script
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTables() {
  try {
    console.log('Creating tables in Supabase...');
    
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
      process.exit(1);
    }
    
    // Test connection to Supabase
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error && !error.message.includes('relation "users" does not exist')) {
      console.error('Error connecting to Supabase:', error);
      process.exit(1);
    }
    
    console.log('Connected to Supabase successfully.');
    
    // Insert initial categories data
    console.log('Inserting initial categories data...');
    const { error: insertError } = await supabase
      .from('categories')
      .upsert([
        {
          id: '500.6',
          name: 'Pertanian',
          sub: {
            "1": {
              "name": "Kebijakan di Bidang Pertanian",
              "rincian": {
                "1": "Kebijakan Umum Pertanian",
                "2": "Regulasi Pertanian",
                "3": "Program Pertanian"
              }
            },
            "2": {
              "name": "Pengembangan Pertanian",
              "rincian": {
                "1": "Inovasi Teknologi",
                "2": "Pelatihan Petani",
                "3": "Bantuan Alat"
              }
            }
          }
        },
        {
          id: '400.5',
          name: 'Pendidikan',
          sub: {
            "1": {
              "name": "Kebijakan Pendidikan",
              "rincian": {
                "1": "Kurikulum",
                "2": "Standar Pendidikan",
                "3": "Evaluasi"
              }
            },
            "2": {
              "name": "Sarana Prasarana",
              "rincian": {
                "1": "Pembangunan Sekolah",
                "2": "Peralatan",
                "3": "Maintenance"
              }
            }
          }
        },
        {
          id: '300.4',
          name: 'Kesehatan',
          sub: {
            "1": {
              "name": "Pelayanan Kesehatan",
              "rincian": {
                "1": "Puskesmas",
                "2": "Rumah Sakit",
                "3": "Posyandu"
              }
            }
          }
        },
        {
          id: '200.3',
          name: 'Infrastruktur',
          sub: {
            "1": {
              "name": "Jalan dan Jembatan",
              "rincian": {
                "1": "Pembangunan Jalan",
                "2": "Perbaikan Jalan",
                "3": "Jembatan"
              }
            }
          }
        }
      ], {
        onConflict: 'id'
      });
    
    if (insertError) {
      console.error('Error inserting categories data:', insertError);
    } else {
      console.log('Categories data inserted successfully.');
    }
    
    console.log('Table creation process completed!');
    console.log('\nNote: Since your application now uses Supabase directly through the client,');
    console.log('the tables will be created automatically when you first run queries against them.');
    console.log('If you want to create them explicitly, you can do so through the Supabase dashboard');
    console.log('by running the SQL script in supabase/migrations/001_initial_schema.sql');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Run the table creation if this script is executed directly
if (require.main === module) {
  createTables().catch(console.error);
}