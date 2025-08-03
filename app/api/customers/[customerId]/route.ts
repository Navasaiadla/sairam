import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    const { 
      name, 
      phone, 
      fatherPhone, 
      college, 
      course, 
      checkinDate, 
      room, 
      dueDate 
    } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    if (!name || !checkinDate) {
      return NextResponse.json(
        { error: 'Name and check-in date are required' },
        { status: 400 }
      );
    }

    // First check if customer exists
    const existingCustomer = await sql`
      SELECT id, hostel_id FROM customers WHERE id = ${customerId}
    `;

    if (existingCustomer.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Update the customer
    const [updatedCustomer] = await sql`
      UPDATE customers 
      SET 
        name = ${name},
        phone = ${phone || null},
        father_phone = ${fatherPhone || null},
        college = ${college || null},
        course = ${course || null},
        checkin_date = ${checkinDate}
      WHERE id = ${customerId}
      RETURNING id, name, phone, father_phone, college, course, checkin_date
    `;

    // If room number changed, update room assignment
    if (room) {
      // First ensure the room exists
      let [roomRecord] = await sql`
        SELECT id FROM rooms 
        WHERE hostel_id = ${existingCustomer[0].hostel_id} AND room_number = ${room}
      `;
      
      if (!roomRecord) {
        [roomRecord] = await sql`
          INSERT INTO rooms (hostel_id, room_number, type, max_capacity)
          VALUES (${existingCustomer[0].hostel_id}, ${room}, 'triple', 3)
          RETURNING id;
        `;
      }

      // Update customer's room assignment
      await sql`
        UPDATE customers 
        SET room_id = ${roomRecord.id}
        WHERE id = ${customerId}
      `;
    }

    // Update due date if provided
    if (dueDate) {
      // Ensure dues table exists
      const tableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'dues'
        )
      `;
      
      if (!tableExists[0].exists) {
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

      // Check if due record exists for this customer
      const existingDue = await sql`
        SELECT id FROM dues WHERE customer_id = ${customerId}
      `;

      if (existingDue.length > 0) {
        // Update existing due record
        await sql`
          UPDATE dues 
          SET due_date = ${dueDate}
          WHERE customer_id = ${customerId}
        `;
      } else {
        // Create new due record
        await sql`
          INSERT INTO dues (customer_id, amount, due_date)
          VALUES (${customerId}, 5000.00, ${dueDate})
        `;
      }
    }

    return NextResponse.json({ 
      success: true, 
      customer: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        phone: updatedCustomer.phone,
        fatherPhone: updatedCustomer.father_phone,
        college: updatedCustomer.college,
        course: updatedCustomer.course,
        checkinDate: updatedCustomer.checkin_date,
        room: room
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
} 