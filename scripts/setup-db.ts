import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function setupDatabase() {
  try {
    console.log('Initializing database tables...');
    await execAsync('npx tsx scripts/init-db.ts');
    console.log('Database tables created successfully');
    
    console.log('Seeding database with initial data...');
    await execAsync('npx tsx scripts/seed-db.ts');
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();