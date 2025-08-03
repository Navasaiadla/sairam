const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

async function setupEnvironment() {
  console.log('🔧 Setting up environment and test data...\n');

  // Check if .env.local exists
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('❌ No .env.local file found!');
    console.log('\n📝 Please create a .env.local file in your project root with:');
    console.log('DATABASE_URL="postgresql://[user]:[password]@[neon-database-url]?sslmode=require"');
    console.log('\n🔗 Get your connection string from: https://console.neon.tech');
    console.log('   → Select your project → Connect → Next.js');
    return;
  }

  // Load environment variables
  require('dotenv').config({ path: envPath });

  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not found in .env.local file!');
    console.log('Please add your Neon database connection string to .env.local');
    return;
  }

  console.log('✅ Environment file found');
  console.log('🔗 Connecting to database...');

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Test connection
    const result = await sql`SELECT version()`;
    console.log('✅ Database connected successfully');

    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('hostels', 'customers', 'rooms', 'dues')
      ORDER BY table_name
    `;

    console.log(`📊 Found ${tables.length} tables: ${tables.map(t => t.table_name).join(', ')}`);

    // Check if we have any data
    const hostels = await sql`SELECT COUNT(*) as count FROM hostels`;
    const customers = await sql`SELECT COUNT(*) as count FROM customers`;
    const dues = await sql`SELECT COUNT(*) as count FROM dues`;

    console.log(`\n📈 Current data:`);
    console.log(`   Hostels: ${hostels[0].count}`);
    console.log(`   Customers: ${customers[0].count}`);
    console.log(`   Dues: ${dues[0].count}`);

    // If no hostels, create a test hostel
    if (hostels[0].count === 0) {
      console.log('\n🏠 Creating test hostel...');
      const [hostel] = await sql`
        INSERT INTO hostels (name) 
        VALUES ('Test Hostel') 
        RETURNING id, name
      `;
      console.log(`✅ Created hostel: ${hostel.name} (ID: ${hostel.id})`);

      // Create some test rooms
      console.log('🚪 Creating test rooms...');
      for (let i = 1; i <= 5; i++) {
        await sql`
          INSERT INTO rooms (hostel_id, room_no) 
          VALUES (${hostel.id}, ${`Room ${i}`})
        `;
      }
      console.log('✅ Created 5 test rooms');

      // Create some test customers
      console.log('👥 Creating test customers...');
      const testCustomers = [
        { name: 'John Doe', phone: '1234567890', college: 'Test College', course: 'Computer Science' },
        { name: 'Jane Smith', phone: '0987654321', college: 'Test College', course: 'Engineering' },
        { name: 'Bob Johnson', phone: '5555555555', college: 'Test College', course: 'Business' }
      ];

      for (const customer of testCustomers) {
        await sql`
          INSERT INTO customers (name, phone, college, course, hostel_id, checkin_date) 
          VALUES (${customer.name}, ${customer.phone}, ${customer.college}, ${customer.course}, ${hostel.id}, CURRENT_DATE)
        `;
      }
      console.log('✅ Created 3 test customers');

      // Create test dues
      console.log('💰 Creating test dues...');
      const customersForDues = await sql`SELECT id, name FROM customers WHERE hostel_id = ${hostel.id}`;
      
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      for (let i = 0; i < customersForDues.length; i++) {
        const customer = customersForDues[i];
        const dueDate = i === 0 ? today.toISOString().slice(0, 10) : 
                       i === 1 ? tomorrow.toISOString().slice(0, 10) : 
                       nextWeek.toISOString().slice(0, 10);
        
        const amount = 5000 + (i * 1000);
        
        await sql`
          INSERT INTO dues (customer_id, amount, due_date, paid) 
          VALUES (${customer.id}, ${amount}, ${dueDate}, ${i === 0})
        `;
      }
      console.log('✅ Created test dues');

      console.log('\n🎉 Setup complete! You can now:');
      console.log(`   1. Visit: http://localhost:3000`);
      console.log(`   2. Click on "Test Hostel"`);
      console.log(`   3. Check the dues page to see the test data`);
      console.log(`   4. Use hostel ID: ${hostel.id}`);

    } else {
      console.log('\n✅ Database already has data!');
      console.log('You can now run the application and view your existing data.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your DATABASE_URL in .env.local');
    console.log('   2. Make sure your Neon database is active');
    console.log('   3. Verify your connection string format');
  }
}

setupEnvironment(); 