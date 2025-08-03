import sql from './db';
import fs from 'fs';
import path from 'path';

export async function initializeDatabase() {
  try {
    if (!sql) {
      throw new Error('Database not configured');
    }

    console.log('🔄 Initializing database...');
    
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await sql.unsafe(statement);
        console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
      }
    }
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Function to check if tables exist
export async function checkTablesExist() {
  try {
    if (!sql) {
      return false;
    }

    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('hostels', 'rooms', 'customers', 'dues')
    `;
    
    const existingTables = result.map(row => row.table_name);
    const requiredTables = ['hostels', 'rooms', 'customers', 'dues'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`⚠️ Missing tables: ${missingTables.join(', ')}`);
      return false;
    }
    
    console.log('✅ All required tables exist');
    return true;
  } catch (error) {
    console.error('❌ Error checking tables:', error);
    return false;
  }
} 