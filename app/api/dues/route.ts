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
    
    console.log('Original hostel ID:', searchParams.get('hostelId'));
    console.log('Cleaned hostel ID:', hostelId);

    // Check if dues table exists, if not create it
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
    } else {
      // Check if paid column exists, if not add it
      try {
        await sql`SELECT paid FROM dues LIMIT 1`;
      } catch (error) {
        console.log('Paid column does not exist, adding it...');
        await sql.unsafe(`
          ALTER TABLE dues 
          ADD COLUMN paid BOOLEAN DEFAULT FALSE
        `);
      }
    }

        // Simple dues fetch
    try {
      console.log('Fetching dues for hostel:', hostelId);
      
      const dues = await sql`
        SELECT 
          d.id,
          c.name,
          COALESCE(r.room_number, 'No Room') as room,
          d.amount,
          TO_CHAR(d.due_date, 'YYYY-MM-DD') as "dueDate",
          COALESCE(d.paid, false) as paid
        FROM dues d
        JOIN customers c ON d.customer_id = c.id
        LEFT JOIN rooms r ON c.room_id = r.id
        WHERE c.hostel_id = ${hostelId}
        ORDER BY d.due_date ASC, c.name ASC
      `;
      
      console.log('Dues found:', dues.length, dues);
      
      return NextResponse.json(dues);
    } catch (queryError) {
      // If the query fails (e.g., no dues table or no data), return empty array
      console.log('No dues found or table not ready, returning empty array');
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dues' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { dueId, paid, dueDate } = await request.json();

    if (!dueId) {
      return NextResponse.json(
        { error: 'Due ID is required' },
        { status: 400 }
      );
    }

    // Update the due record
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (paid !== undefined) {
      updateFields.push('paid = $1');
      updateValues.push(paid);
    }

    if (dueDate) {
      updateFields.push(`due_date = $${updateValues.length + 1}`);
      updateValues.push(dueDate);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const [updatedDue] = await sql`
      UPDATE dues 
      SET ${sql.unsafe(updateFields.join(', '))}
      WHERE id = ${dueId}
      RETURNING id, paid, due_date
    `;

    if (!updatedDue) {
      return NextResponse.json(
        { error: 'Due record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      due: updatedDue 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update due' },
      { status: 500 }
    );
  }
} 