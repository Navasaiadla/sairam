// Script to check constraints on the rooms table
// Run this with: node scripts/check-constraints.js

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkConstraints() {
  try {
    console.log('🔍 Checking room table constraints...');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Check constraints on rooms table
    const constraints = await sql`
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint 
      WHERE conrelid = 'rooms'::regclass
    `;
    
    console.log('\n📋 Room table constraints:');
    constraints.forEach(constraint => {
      console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_definition}`);
    });
    
    // Check what values are allowed for max_capacity
    console.log('\n📋 Testing max_capacity values...');
    
    try {
      const test1 = await sql`
        INSERT INTO rooms (hostel_id, room_number, type, max_capacity)
        VALUES ('00000000-0000-0000-0000-000000000000', 'TEST-1', 'Standard', 1)
        RETURNING id;
      `;
      console.log('✅ max_capacity = 1 works');
      await sql`DELETE FROM rooms WHERE id = ${test1[0].id}`;
    } catch (error) {
      console.log('❌ max_capacity = 1 failed:', error.message);
    }
    
    try {
      const test2 = await sql`
        INSERT INTO rooms (hostel_id, room_number, type, max_capacity)
        VALUES ('00000000-0000-0000-0000-000000000000', 'TEST-2', 'Standard', 2)
        RETURNING id;
      `;
      console.log('✅ max_capacity = 2 works');
      await sql`DELETE FROM rooms WHERE id = ${test2[0].id}`;
    } catch (error) {
      console.log('❌ max_capacity = 2 failed:', error.message);
    }
    
    try {
      const test3 = await sql`
        INSERT INTO rooms (hostel_id, room_number, type, max_capacity)
        VALUES ('00000000-0000-0000-0000-000000000000', 'TEST-3', 'Standard', 4)
        RETURNING id;
      `;
      console.log('✅ max_capacity = 4 works');
      await sql`DELETE FROM rooms WHERE id = ${test3[0].id}`;
    } catch (error) {
      console.log('❌ max_capacity = 4 failed:', error.message);
    }
    
    try {
      const test4 = await sql`
        INSERT INTO rooms (hostel_id, room_number, type, max_capacity)
        VALUES ('00000000-0000-0000-0000-000000000000', 'TEST-4', 'Standard', 6)
        RETURNING id;
      `;
      console.log('✅ max_capacity = 6 works');
      await sql`DELETE FROM rooms WHERE id = ${test4[0].id}`;
    } catch (error) {
      console.log('❌ max_capacity = 6 failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking constraints:', error.message);
  }
}

checkConstraints(); 