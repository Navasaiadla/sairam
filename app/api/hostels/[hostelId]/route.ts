import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ hostelId: string }> }
) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { hostelId } = await params;

    const [hostel] = await sql`
      SELECT 
        id,
        name,
        TO_CHAR(created_at, 'YYYY-MM-DD') as "createdAt"
      FROM hostels
      WHERE id = ${hostelId}
    `;

    if (!hostel) {
      return NextResponse.json(
        { error: 'Hostel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(hostel);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hostel' },
      { status: 500 }
    );
  }
} 