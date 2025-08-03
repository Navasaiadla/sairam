// Simple script to create a hostel in the database
// Run this with: node scripts/create-hostel.js

const { neon } = require('@neondatabase/serverless');

async function createHostel() {
  try {
    // You'll need to set your DATABASE_URL environment variable
    const sql = neon(process.env.DATABASE_URL);
    
    // Create a sample hostel
    const [hostel] = await sql`
      INSERT INTO hostels (name)
      VALUES ('Sai Ram Hostel')
      RETURNING id, name
    `;
    
    console.log('✅ Hostel created successfully!');
    console.log('Hostel ID:', hostel.id);
    console.log('Hostel Name:', hostel.name);
    console.log('\nYou can now use this hostel ID in your application.');
    
  } catch (error) {
    console.error('❌ Error creating hostel:', error.message);
    console.log('\nMake sure to:');
    console.log('1. Set your DATABASE_URL environment variable');
    console.log('2. Run the database schema first');
  }
}

createHostel(); 