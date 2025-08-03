import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request) {
  try {
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
    
    console.log('Debugging hostel ID:', hostelId);

    // Get the latest customer for this hostel
    const latestCustomer = await sql`
      SELECT 
        c.id,
        c.name,
        c.phone,
        TO_CHAR(c.checkin_date, 'YYYY-MM-DD') as "checkinDate",
        r.room_number as room,
        c.hostel_id
      FROM customers c
      LEFT JOIN rooms r ON c.room_id = r.id
      WHERE c.hostel_id = ${hostelId}
      ORDER BY c.created_at DESC
      LIMIT 1
    `;

    console.log('Latest customer:', latestCustomer);

    if (latestCustomer.length === 0) {
      return NextResponse.json({
        error: 'No customers found for this hostel',
        hostelId
      });
    }

    const customer = latestCustomer[0];

    // Check if this customer has any dues
    const customerDues = await sql`
      SELECT 
        d.id,
        d.customer_id,
        d.amount,
        d.due_date,
        TO_CHAR(d.due_date, 'YYYY-MM-DD') as "dueDateFormatted",
        d.paid,
        d.created_at
      FROM dues d
      WHERE d.customer_id = ${customer.id}
      ORDER BY d.due_date ASC
    `;

    console.log('Customer dues:', customerDues);

    // Get today and tomorrow dates
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Check all dues for this hostel
    const allDues = await sql`
      SELECT 
        d.id,
        c.name,
        d.amount,
        d.due_date,
        TO_CHAR(d.due_date, 'YYYY-MM-DD') as "dueDateFormatted",
        d.paid,
        c.hostel_id
      FROM dues d
      JOIN customers c ON d.customer_id = c.id
      WHERE c.hostel_id = ${hostelId}
      ORDER BY d.due_date ASC
    `;

    console.log('All dues for hostel:', allDues);

    return NextResponse.json({
      success: true,
      debug: {
        hostelId,
        today,
        tomorrow,
        totalCustomers: latestCustomer.length,
        totalDues: allDues.length
      },
      latestCustomer: customer,
      customerDues: customerDues,
      allDues: allDues,
      tomorrowDues: allDues.filter(due => due.dueDateFormatted === tomorrow)
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Database connection failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 