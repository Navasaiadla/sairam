import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { checkTablesExist, initializeDatabase } from '@/lib/init-db';

export async function GET() {
  try {
    // Test the database connection
    const result = await sql`SELECT version()`;
    
    // Check if tables exist
    const tablesExist = await checkTablesExist();
    
    return NextResponse.json({ 
      success: true, 
      version: result[0].version,
      tablesExist,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Initialize database tables
    await initializeDatabase();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully'
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 