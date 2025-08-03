import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hostelId = searchParams.get('hostelId');
    const search = searchParams.get('search');

    if (!hostelId) {
      return NextResponse.json(
        { error: 'Hostel ID is required' },
        { status: 400 }
      );
    }

    let query;
    if (search) {
      // Search by name or phone
      query = sql`
        SELECT 
          c.id,
          c.name,
          c.phone,
          c.father_phone as "fatherPhone",
          c.college,
          c.course,
          TO_CHAR(c.checkin_date, 'YYYY-MM-DD') as "checkinDate",
          r.room_number as room,
          TO_CHAR(d.due_date, 'YYYY-MM-DD') as "dueDate"
        FROM customers c
        LEFT JOIN rooms r ON c.room_id = r.id
        LEFT JOIN dues d ON c.id = d.customer_id
        WHERE c.hostel_id = ${hostelId}
        AND (c.name ILIKE ${`%${search}%`} OR c.phone ILIKE ${`%${search}%`})
        ORDER BY c.name ASC
      `;
    } else {
      // Get all customers for the hostel
      query = sql`
        SELECT 
          c.id,
          c.name,
          c.phone,
          c.father_phone as "fatherPhone",
          c.college,
          c.course,
          TO_CHAR(c.checkin_date, 'YYYY-MM-DD') as "checkinDate",
          r.room_number as room,
          TO_CHAR(d.due_date, 'YYYY-MM-DD') as "dueDate"
        FROM customers c
        LEFT JOIN rooms r ON c.room_id = r.id
        LEFT JOIN dues d ON c.id = d.customer_id
        WHERE c.hostel_id = ${hostelId}
        ORDER BY c.name ASC
      `;
    }

    const customers = await query;
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { 
      name, 
      phone, 
      fatherPhone, 
      college, 
      course, 
      checkinDate, 
      dueDate,
      checkoutDate, 
      roomNo, 
      hostelId 
    } = await request.json();

    if (!hostelId) {
      return NextResponse.json(
        { error: 'Hostel ID is required' },
        { status: 400 }
      );
    }

    // Clean up hostel ID - remove spaces and ensure proper UUID format
    const originalHostelId = hostelId;
    hostelId = hostelId.replace(/\s+/g, '').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    
    console.log('Customer creation - Original hostel ID:', originalHostelId);
    console.log('Customer creation - Cleaned hostel ID:', hostelId);
    console.log('Customer creation - Due date provided:', dueDate);

    if (!name || !checkinDate) {
      return NextResponse.json(
        { error: 'Name and check-in date are required' },
        { status: 400 }
      );
    }

    // First ensure the room exists for this hostel
    let [room] = await sql`
      SELECT id FROM rooms 
      WHERE hostel_id = ${hostelId} AND room_number = ${roomNo}
    `;
    
    if (!room) {
      [room] = await sql`
        INSERT INTO rooms (hostel_id, room_number, type, max_capacity)
        VALUES (${hostelId}, ${roomNo}, 'triple', 3)
        RETURNING id;
      `;
    }

    // Then create the customer
    const [customer] = await sql`
      INSERT INTO customers (
        name, 
        phone, 
        father_phone, 
        college, 
        course, 
        checkin_date, 
        checkout_date, 
        hostel_id, 
        room_id
      )
      VALUES (
        ${name}, 
        ${phone || null}, 
        ${fatherPhone || null}, 
        ${college || null}, 
        ${course || null}, 
        ${checkinDate}, 
        ${checkoutDate || null}, 
        ${hostelId}, 
        ${room.id}
      )
      RETURNING id, name, phone;
    `;

    // Create a due record if due date is provided
    if (dueDate) {
      console.log('Creating due for customer:', customer.id, 'with due date:', dueDate);
      
      // Ensure dues table exists
      const tableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'dues'
        )
      `;
      
      if (!tableExists[0].exists) {
        console.log('Dues table does not exist, creating...');
        await sql.unsafe(`
          CREATE TABLE IF NOT EXISTS dues (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
            amount DECIMAL(10,2) NOT NULL,
            due_date DATE NOT NULL,
            paid BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      }

      try {
        // Create due record with default amount (you can modify this as needed)
        const [due] = await sql`
          INSERT INTO dues (customer_id, amount, due_date)
          VALUES (${customer.id}, 5000.00, ${dueDate})
          RETURNING id, customer_id, amount, due_date
        `;
        console.log('Due created successfully:', due);
      } catch (dueError) {
        console.error('Error creating due:', dueError);
        throw dueError;
      }
    } else {
      console.log('No due date provided, skipping due creation');
    }

    return NextResponse.json({ 
      success: true, 
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
