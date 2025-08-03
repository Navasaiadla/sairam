import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured', details: 'DATABASE_URL is not set' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const hostelId = searchParams.get('hostelId');

    if (!hostelId) {
      return NextResponse.json(
        { error: 'Hostel ID is required' },
        { status: 400 }
      );
    }

    // Test hostel ID processing
    let cleanedHostelId = hostelId.replace(/\s+/g, '');
    if (!cleanedHostelId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      cleanedHostelId = cleanedHostelId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    }

    // Test database connection and hostel existence
    const [hostel] = await sql`
      SELECT id, name FROM hostels WHERE id = ${cleanedHostelId}
    `;

    if (!hostel) {
      return NextResponse.json(
        { 
          error: 'Hostel not found',
          originalHostelId: hostelId,
          cleanedHostelId: cleanedHostelId,
          details: 'The hostel ID does not exist in the database'
        },
        { status: 404 }
      );
    }

    // Test rooms for this hostel
    const rooms = await sql`
      SELECT room_number, id FROM rooms WHERE hostel_id = ${cleanedHostelId}
    `;

    return NextResponse.json({
      success: true,
      hostel: {
        id: hostel.id,
        name: hostel.name
      },
      rooms: rooms,
      originalHostelId: hostelId,
      cleanedHostelId: cleanedHostelId
    });

  } catch (error) {
    console.error('Test customer error:', error);
    return NextResponse.json(
      { 
        error: 'Database test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 