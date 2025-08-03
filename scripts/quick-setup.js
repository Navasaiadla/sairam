// Quick setup script to configure environment and test database
// Run this with: node scripts/quick-setup.js

const fs = require('fs');
const path = require('path');

console.log('🚀 Quick Setup for Hostel Management System');
console.log('===========================================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env.local file not found!');
  console.log('\n📝 Please create a .env.local file with your Neon database URL:');
  console.log('\nExample .env.local content:');
  console.log('DATABASE_URL="postgresql://username:password@your-neon-url?sslmode=require"');
  console.log('\n🔗 To get your Neon connection string:');
  console.log('1. Go to https://neon.tech');
  console.log('2. Open your project dashboard');
  console.log('3. Click "Connect"');
  console.log('4. Copy the connection string');
  console.log('\n📁 Create the file in your project root directory');
  process.exit(1);
}

// Read and check the environment file
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasDatabaseUrl = envContent.includes('DATABASE_URL=');
  
  if (!hasDatabaseUrl) {
    console.log('❌ DATABASE_URL not found in .env.local');
    console.log('\n📝 Please add your Neon database URL to .env.local:');
    console.log('DATABASE_URL="postgresql://username:password@your-neon-url?sslmode=require"');
    process.exit(1);
  }
  
  console.log('✅ .env.local file found with DATABASE_URL');
  
  // Extract the DATABASE_URL for testing (handle both quoted and unquoted formats)
  let match = envContent.match(/DATABASE_URL="([^"]+)"/);
  if (!match) {
    match = envContent.match(/DATABASE_URL=([^\s]+)/);
  }
  
  if (match) {
    const dbUrl = match[1];
    console.log('✅ DATABASE_URL is configured');
    console.log(`🔗 URL: ${dbUrl.substring(0, 20)}...`);
    
    // Test the connection
    console.log('\n🧪 Testing database connection...');
    testConnection(dbUrl);
  } else {
    console.log('❌ Could not parse DATABASE_URL from .env.local');
    console.log('📝 Please ensure DATABASE_URL is properly formatted in .env.local');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Error reading .env.local:', error.message);
  process.exit(1);
}

async function testConnection(dbUrl) {
  try {
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });
    
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(dbUrl);
    
    // Test basic connection
    const result = await sql`SELECT version()`;
    console.log('✅ Database connection successful!');
    console.log(`📊 PostgreSQL version: ${result[0].version}`);
    
    // Check if tables exist
    console.log('\n📋 Checking existing tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('hostels', 'rooms', 'customers', 'dues')
      ORDER BY table_name
    `;
    
    const tableNames = tables.map(row => row.table_name);
    console.log(`Found tables: ${tableNames.join(', ') || 'none'}`);
    
    if (tableNames.length === 0) {
      console.log('\n⚠️ No tables found. Running database setup...');
      await setupDatabase(sql);
    } else if (tableNames.length < 4) {
      console.log('\n⚠️ Some tables missing. Running database setup...');
      await setupDatabase(sql);
    } else {
      console.log('✅ All required tables exist!');
      await testCustomerCreation(sql);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your DATABASE_URL in .env.local');
    console.log('2. Ensure your Neon database is active');
    console.log('3. Verify your connection string format');
    console.log('4. Check your internet connection');
    process.exit(1);
  }
}

async function setupDatabase(sql) {
  try {
    console.log('📖 Reading schema file...');
    const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} schema statements...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sql.unsafe(statement);
          console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`⚠️ Table already exists: ${statement.substring(0, 50)}...`);
          } else {
            throw error;
          }
        }
      }
    }
    
    console.log('✅ Database setup completed!');
    await testCustomerCreation(sql);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

async function testCustomerCreation(sql) {
  try {
    console.log('\n🧪 Testing customer creation...');
    
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
    const [room] = await sql`
      INSERT INTO rooms (hostel_id, room_no)
      VALUES (${hostelId}, 'A-101')
      ON CONFLICT (hostel_id, room_no) 
      DO UPDATE SET room_no = EXCLUDED.room_no
      RETURNING id;
    `;
    
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
    
    console.log('\n🎉 All tests passed! Your setup is working correctly.');
    console.log(`\n📋 Next steps:`);
    console.log(`1. Start the development server: npm run dev`);
    console.log(`2. Visit: http://localhost:3000/debug`);
    console.log(`3. Use hostel ID: ${hostelId}`);
    console.log(`4. Visit: http://localhost:3000/hostel/${hostelId}`);
    
  } catch (error) {
    console.error('❌ Customer creation test failed:', error.message);
    console.log('\n🔧 This might indicate a schema issue. Check the error details above.');
    process.exit(1);
  }
} 