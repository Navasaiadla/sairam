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

    // Test 1: Check if we can connect to database
    console.log('Testing database connection...');
    
    // Test 2: Check if customers table exists and has data
    const customers = await sql`
      SELECT id, name FROM customers WHERE hostel_id = ${hostelId} LIMIT 5
    `;
    
    console.log('Customers found:', customers);

    // Test 3: Check if dues table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dues'
      )
    `;
    
    console.log('Dues table exists:', tableExists[0].exists);

    // Test 4: If dues table exists, try to get some data
    let duesData: any[] = [];
    
    if (tableExists[0].exists) {
      try {
        duesData = await sql`
          SELECT 
            d.id,
            c.name,
            d.amount,
            d.due_date,
            d.paid
          FROM dues d
          JOIN customers c ON d.customer_id = c.id
          WHERE c.hostel_id = ${hostelId}
          LIMIT 5
        `;
        console.log('Dues data found:', duesData);
      } catch (error) {
        console.log('Error fetching dues:', error);
      }
    }

    return NextResponse.json({
      success: true,
      debug: {
        hostelId,
        customersCount: customers.length,
        duesTableExists: tableExists[0].exists,
        duesCount: duesData.length
      },
      customers: customers,
      dues: duesData
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Database connection failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 