import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Check if we already have data
    const existingHostels = await sql`SELECT COUNT(*) as count FROM hostels`;
    
    if (existingHostels[0].count > 0) {
      return NextResponse.json({
        message: 'Test data already exists',
        existingData: true
      });
    }

    // Create test hostel
    const [hostel] = await sql`
      INSERT INTO hostels (name) 
      VALUES ('Test Hostel') 
      RETURNING id, name
    `;

    // Create test rooms
    for (let i = 1; i <= 5; i++) {
      await sql`
        INSERT INTO rooms (hostel_id, room_no) 
        VALUES (${hostel.id}, ${`Room ${i}`})
      `;
    }

    // Create test customers
    const testCustomers = [
      { name: 'John Doe', phone: '1234567890', college: 'Test College', course: 'Computer Science' },
      { name: 'Jane Smith', phone: '0987654321', college: 'Test College', course: 'Engineering' },
      { name: 'Bob Johnson', phone: '5555555555', college: 'Test College', course: 'Business' }
    ];

    const customerIds = [];
    for (const customer of testCustomers) {
      const [newCustomer] = await sql`
        INSERT INTO customers (name, phone, college, course, hostel_id, checkin_date) 
        VALUES (${customer.name}, ${customer.phone}, ${customer.college}, ${customer.course}, ${hostel.id}, CURRENT_DATE)
        RETURNING id
      `;
      customerIds.push(newCustomer.id);
    }

    // Create test dues
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < customerIds.length; i++) {
      const customerId = customerIds[i];
      const dueDate = i === 0 ? today.toISOString().slice(0, 10) : 
                     i === 1 ? tomorrow.toISOString().slice(0, 10) : 
                     nextWeek.toISOString().slice(0, 10);
      
      const amount = 5000 + (i * 1000);
      
      await sql`
        INSERT INTO dues (customer_id, amount, due_date, paid) 
        VALUES (${customerId}, ${amount}, ${dueDate}, ${i === 0})
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      hostel: {
        id: hostel.id,
        name: hostel.name
      },
      created: {
        rooms: 5,
        customers: testCustomers.length,
        dues: customerIds.length
      }
    });

  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json(
      { error: 'Failed to create test data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 