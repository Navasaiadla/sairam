import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { customerId, amount = 5000.00, dueDate } = await request.json();

    if (!customerId || !dueDate) {
      return NextResponse.json(
        { error: 'Customer ID and due date are required' },
        { status: 400 }
      );
    }

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

    // Create due record
    const [due] = await sql`
      INSERT INTO dues (customer_id, amount, due_date)
      VALUES (${customerId}, ${amount}, ${dueDate})
      RETURNING id, customer_id, amount, due_date, paid
    `;

    return NextResponse.json({ 
      success: true, 
      due: {
        id: due.id,
        customerId: due.customer_id,
        amount: due.amount,
        dueDate: due.due_date,
        paid: due.paid
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create due', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 