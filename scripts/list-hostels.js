// Script to list all hostels with their IDs
// Run this with: node scripts/list-hostels.js

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function listHostels() {
  try {
    console.log('🏠 Listing all hostels...');
    
    const sql = neon(process.env.DATABASE_URL);
    
    const hostels = await sql`
      SELECT id, name
      FROM hostels
      ORDER BY name ASC
    `;
    
    if (hostels.length === 0) {
      console.log('❌ No hostels found in the database.');
      console.log('\n📝 Creating a sample hostel...');
      
      const [newHostel] = await sql`
        INSERT INTO hostels (name)
        VALUES ('Sample Hostel')
        RETURNING id, name, created_at
      `;
      
      console.log(`✅ Created hostel: ${newHostel.name}`);
      console.log(`   ID: ${newHostel.id}`);
      
      console.log('\n🌐 Access URLs:');
      console.log(`   Dashboard: http://localhost:3002/hostel/${newHostel.id}`);
      console.log(`   Add Customer: http://localhost:3002/hostel/${newHostel.id}/add-customer`);
      console.log(`   Rooms: http://localhost:3002/hostel/${newHostel.id}/rooms`);
      console.log(`   Dues: http://localhost:3002/hostel/${newHostel.id}/dues`);
      
    } else {
      console.log(`✅ Found ${hostels.length} hostel(s):\n`);
      
      hostels.forEach((hostel, index) => {
        console.log(`${index + 1}. ${hostel.name}`);
        console.log(`   ID: ${hostel.id}`);
        console.log(`   Dashboard: http://localhost:3002/hostel/${hostel.id}`);
        console.log(`   Add Customer: http://localhost:3002/hostel/${hostel.id}/add-customer`);
        console.log(`   Rooms: http://localhost:3002/hostel/${hostel.id}/rooms`);
        console.log(`   Dues: http://localhost:3002/hostel/${hostel.id}/dues`);
        console.log('');
      });
      
      console.log('📋 Quick Access:');
      console.log('   Copy any hostel ID above and use it in the URLs');
      console.log('   Example: http://localhost:3002/hostel/[paste-hostel-id-here]/add-customer');
    }
    
  } catch (error) {
    console.error('❌ Error listing hostels:', error.message);
  }
}

listHostels(); 