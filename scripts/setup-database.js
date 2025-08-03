// Database setup script
// Run this with: node scripts/setup-database.js

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      console.log('Please create a .env.local file with your Neon database URL');
      process.exit(1);
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Test connection
    console.log('🔗 Testing database connection...');
    const version = await sql`SELECT version()`;
    console.log(`✅ Connected to: ${version[0].version}`);
    
    // Check if tables exist
    console.log('📋 Checking existing tables...');
    const existingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('hostels', 'rooms', 'customers', 'dues')
    `;
    
    const tableNames = existingTables.map(row => row.table_name);
    console.log(`Found tables: ${tableNames.join(', ') || 'none'}`);
    
    // Read and execute schema
    console.log('📖 Reading schema file...');
    const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split and execute statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} schema statements...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sql.unsafe(statement);
          console.log(`✅ Executed: ${statement.substring(0, 60)}...`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`⚠️ Table already exists: ${statement.substring(0, 60)}...`);
          } else {
            throw error;
          }
        }
      }
    }
    
    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const finalTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('hostels', 'rooms', 'customers', 'dues')
    `;
    
    const finalTableNames = finalTables.map(row => row.table_name);
    console.log(`✅ Final tables: ${finalTableNames.join(', ')}`);
    
         // Create a sample hostel
     console.log('🏠 Creating sample hostel...');
     const [hostel] = await sql`
       INSERT INTO hostels (name)
       VALUES ('Sai Ram Hostel')
       ON CONFLICT DO NOTHING
       RETURNING id, name
     `;
     
     if (hostel) {
       // Create a sample room
       console.log('🏠 Creating sample room...');
       const [room] = await sql`
         INSERT INTO rooms (hostel_id, room_no)
         VALUES (${hostel.id}, 'A-101')
         ON CONFLICT (hostel_id, room_no) DO NOTHING
         RETURNING id, room_no
       `;
       
       if (room) {
         console.log(`✅ Created room: ${room.room_no} (ID: ${room.id})`);
       }
     }
    
    if (hostel) {
      console.log(`✅ Created hostel: ${hostel.name} (ID: ${hostel.id})`);
      console.log('\n🎉 Database setup completed successfully!');
      console.log(`\n📋 Next steps:`);
      console.log(`1. Use hostel ID: ${hostel.id}`);
      console.log(`2. Visit: http://localhost:3000/hostel/${hostel.id}`);
      console.log(`3. Test the application features`);
    } else {
      console.log('ℹ️ Hostel already exists');
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your DATABASE_URL in .env.local');
    console.log('2. Ensure your Neon database is active');
    console.log('3. Check your internet connection');
    process.exit(1);
  }
}

setupDatabase(); 