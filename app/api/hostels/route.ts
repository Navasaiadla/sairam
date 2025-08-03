import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    // Check if hostels table exists, if not create it
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'hostels'
      )
    `;
    
    if (!tableExists[0].exists) {
      console.log('Hostels table does not exist, creating...');
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS hostels (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }
    
    const hostels = await sql`
      SELECT 
        id,
        name,
        TO_CHAR(created_at, 'YYYY-MM-DD') as "createdAt"
      FROM hostels
      ORDER BY name ASC
    `;
    
    return NextResponse.json(hostels);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hostels', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Hostel name is required' },
        { status: 400 }
      );
    }

    const [hostel] = await sql`
      INSERT INTO hostels (name)
      VALUES (${name.trim()})
      RETURNING id, name
    `;

    return NextResponse.json({ 
      success: true, 
      hostel: {
        id: hostel.id,
        name: hostel.name
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create hostel' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Hostel ID is required' },
        { status: 400 }
      );
    }

    // First check if hostel exists
    const existingHostel = await sql`
      SELECT id, name FROM hostels WHERE id = ${id}
    `;

    if (existingHostel.length === 0) {
      return NextResponse.json(
        { error: 'Hostel not found' },
        { status: 404 }
      );
    }

    // Delete the hostel
    await sql`
      DELETE FROM hostels WHERE id = ${id}
    `;

    return NextResponse.json({ 
      success: true, 
      message: `Hostel "${existingHostel[0].name}" deleted successfully` 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete hostel' },
      { status: 500 }
    );
  }
} 