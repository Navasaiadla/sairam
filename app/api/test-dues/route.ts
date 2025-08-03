import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    let hostelId = searchParams.get('hostelId');

    if (!hostelId) {
      return NextResponse.json(
        { error: 'Hostel ID is required' },
        { status: 400 }
      );
    }

    // Clean up hostel ID - remove spaces and ensure proper UUID format
    hostelId = hostelId.replace(/\s+/g, '').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    
    console.log('Original hostel ID:', searchParams.get('hostelId'));
    console.log('Cleaned hostel ID:', hostelId);

    // Check if dues table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dues'
      )
    `;
    
    console.log('Dues table exists:', tableExists[0].exists);

    if (!tableExists[0].exists) {
      return NextResponse.json({
        error: 'Dues table does not exist',
        tableExists: tableExists[0].exists
      });
    }

         // Get all dues for debugging
     const allDues = await sql`
       SELECT 
         d.id,
         c.name,
         r.room_number as room,
         d.amount,
         d.due_date,
         TO_CHAR(d.due_date, 'YYYY-MM-DD') as "dueDateFormatted",
         c.hostel_id
       FROM dues d
       JOIN customers c ON d.customer_id = c.id
       LEFT JOIN rooms r ON c.room_id = r.id
       WHERE c.hostel_id = ${hostelId}
       ORDER BY d.due_date ASC
     `;

    // Get today and tomorrow dates
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    return NextResponse.json({
      debug: {
        today,
        tomorrow,
        hostelId,
        totalDues: allDues.length,
        tableExists: tableExists[0].exists
      },
      allDues,
      todayAndTomorrow: allDues.filter(due => 
        due.dueDateFormatted === today || due.dueDateFormatted === tomorrow
      )
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dues debug info', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 