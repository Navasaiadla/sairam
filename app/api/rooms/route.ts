import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hostelId = searchParams.get('hostelId');

    if (!hostelId) {
      return NextResponse.json(
        { error: 'Hostel ID is required' },
        { status: 400 }
      );
    }

    const rooms = await sql`
      SELECT 
        r.room_number as "roomNo",
        COALESCE(
          json_agg(
            json_build_object(
              'name', c.name,
              'phone', c.phone,
              'checkIn', TO_CHAR(c.checkin_date, 'YYYY-MM-DD')
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) as guests
      FROM rooms r
      LEFT JOIN customers c ON c.room_id = r.id AND c.hostel_id = r.hostel_id
      WHERE r.hostel_id = ${hostelId}
      GROUP BY r.room_number
      ORDER BY r.room_number;
    `;
    
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}
