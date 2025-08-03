// Test script to verify customer creation
// Run this with: node scripts/test-customer-creation.js

const { neon } = require('@neondatabase/serverless');

async function testCustomerCreation() {
  try {
    console.log('🧪 Testing customer creation...');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      process.exit(1);
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // First, get or create a hostel
    console.log('🏠 Getting or creating hostel...');
    const [hostel] = await sql`
      INSERT INTO hostels (name)
      VALUES ('Test Hostel')
      ON CONFLICT DO NOTHING
      RETURNING id, name
    `;
    
    if (!hostel) {
      const [existingHostel] = await sql`SELECT id, name FROM hostels LIMIT 1`;
      if (!existingHostel) {
        throw new Error('No hostel found and could not create one');
      }
      console.log(`✅ Using existing hostel: ${existingHostel.name} (${existingHostel.id})`);
    } else {
      console.log(`✅ Created hostel: ${hostel.name} (${hostel.id})`);
    }
    
    const hostelId = hostel?.id || (await sql`SELECT id FROM hostels LIMIT 1`)[0].id;
    
    // Test customer creation
    console.log('👤 Testing customer creation...');
    const testCustomer = {
      name: 'Test Customer',
      phone: '9876543210',
      fatherPhone: '9876543211',
      college: 'Test College',
      course: 'Test Course',
      checkinDate: '2024-01-15',
      checkoutDate: null,
      roomNo: 'A-101',
      hostelId: hostelId
    };
    
    // First ensure the room exists
    const [room] = await sql`
      INSERT INTO rooms (hostel_id, room_no)
      VALUES (${hostelId}, ${testCustomer.roomNo})
      ON CONFLICT (hostel_id, room_no) 
      DO UPDATE SET room_no = EXCLUDED.room_no
      RETURNING id;
    `;
    
    console.log(`✅ Room created/found: ${testCustomer.roomNo} (${room.id})`);
    
    // Create the customer
    const [customer] = await sql`
      INSERT INTO customers (
        name, 
        phone, 
        father_phone, 
        college, 
        course, 
        checkin_date, 
        checkout_date, 
        hostel_id, 
        room_id
      )
      VALUES (
        ${testCustomer.name}, 
        ${testCustomer.phone}, 
        ${testCustomer.fatherPhone}, 
        ${testCustomer.college}, 
        ${testCustomer.course}, 
        ${testCustomer.checkinDate}, 
        ${testCustomer.checkoutDate}, 
        ${testCustomer.hostelId}, 
        ${room.id}
      )
      RETURNING id, name, phone;
    `;
    
    console.log(`✅ Customer created successfully!`);
    console.log(`   ID: ${customer.id}`);
    console.log(`   Name: ${customer.name}`);
    console.log(`   Phone: ${customer.phone}`);
    
    // Verify the customer was created
    const [verification] = await sql`
      SELECT 
        c.name,
        c.phone,
        c.father_phone,
        c.college,
        c.course,
        TO_CHAR(c.checkin_date, 'YYYY-MM-DD') as checkin_date,
        r.room_no
      FROM customers c
      LEFT JOIN rooms r ON c.room_id = r.id
      WHERE c.id = ${customer.id}
    `;
    
    console.log('\n📋 Customer details:');
    console.log(JSON.stringify(verification, null, 2));
    
    console.log('\n🎉 Test completed successfully!');
    console.log(`\n📋 Next steps:`);
    console.log(`1. Use hostel ID: ${hostelId}`);
    console.log(`2. Visit: http://localhost:3000/hostel/${hostelId}`);
    console.log(`3. Test adding customers through the web interface`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your DATABASE_URL is correct');
    console.log('2. Run the database setup first: node scripts/setup-database.js');
    console.log('3. Check that all tables exist with the correct schema');
    process.exit(1);
  }
}

testCustomerCreation(); 