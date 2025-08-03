// Script to check and fix database schema
// Run this with: node scripts/check-schema.js

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkAndFixSchema() {
  try {
    console.log('🔍 Checking database schema...');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Check the actual structure of each table
    console.log('\n📋 Checking rooms table structure...');
    const roomsStructure = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'rooms' 
      ORDER BY ordinal_position
    `;
    
    console.log('Rooms table columns:');
    roomsStructure.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('\n📋 Checking customers table structure...');
    const customersStructure = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'customers' 
      ORDER BY ordinal_position
    `;
    
    console.log('Customers table columns:');
    customersStructure.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check if we need to update the schema
    const roomsHasRoomNo = roomsStructure.some(col => col.column_name === 'room_no');
    const customersHasNewFields = customersStructure.some(col => col.column_name === 'father_phone');
    
    if (!roomsHasRoomNo || !customersHasNewFields) {
      console.log('\n⚠️ Schema mismatch detected!');
      console.log('🔄 The existing database has a different structure than expected.');
      console.log('📋 Using existing schema structure...');
    } else {
      console.log('\n✅ Schema is correct!');
    }
    
    // Test customer creation
    console.log('\n🧪 Testing customer creation...');
    await testCustomerCreation(sql);
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
    process.exit(1);
  }
}

async function testCustomerCreation(sql) {
  try {
    // Get or create a hostel
    const [hostel] = await sql`
      INSERT INTO hostels (name)
      VALUES ('Test Hostel')
      ON CONFLICT DO NOTHING
      RETURNING id, name
    `;
    
    if (!hostel) {
      const [existingHostel] = await sql`SELECT id, name FROM hostels LIMIT 1`;
      console.log(`✅ Using existing hostel: ${existingHostel.name}`);
    } else {
      console.log(`✅ Created hostel: ${hostel.name}`);
    }
    
    const hostelId = hostel?.id || (await sql`SELECT id FROM hostels LIMIT 1`)[0].id;
    
    // Create a test customer
    let [room] = await sql`
      SELECT id FROM rooms 
      WHERE hostel_id = ${hostelId} AND room_number = 'A-101'
    `;
    
    if (!room) {
      [room] = await sql`
        INSERT INTO rooms (hostel_id, room_number, type, max_capacity)
        VALUES (${hostelId}, 'A-101', 'triple', 3)
        RETURNING id;
      `;
    }
    
    const [customer] = await sql`
      INSERT INTO customers (
        name, phone, father_phone, college, course, 
        checkin_date, checkout_date, hostel_id, room_id
      )
      VALUES (
        'Test Customer', '9876543210', '9876543211', 
        'Test College', 'Test Course', '2024-01-15', 
        null, ${hostelId}, ${room.id}
      )
      RETURNING id, name, phone;
    `;
    
    console.log('✅ Customer created successfully!');
    console.log(`   ID: ${customer.id}`);
    console.log(`   Name: ${customer.name}`);
    console.log(`   Phone: ${customer.phone}`);
    
    console.log('\n🎉 All tests passed! Your database is ready.');
    console.log(`\n📋 Next steps:`);
    console.log(`1. Start the development server: npm run dev`);
    console.log(`2. Visit: http://localhost:3000/debug`);
    console.log(`3. Use hostel ID: ${hostelId}`);
    console.log(`4. Visit: http://localhost:3000/hostel/${hostelId}`);
    
  } catch (error) {
    console.error('❌ Customer creation test failed:', error.message);
    process.exit(1);
  }
}

checkAndFixSchema(); 