const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = process.env.DATABASE_URL 
  ? neon(process.env.DATABASE_URL)
  : null;

async function createTestDues() {
  try {
    if (!sql) {
      console.log('No DATABASE_URL found. Please check your .env file.');
      return;
    }

    console.log('Connecting to database...');
    
    // Check if dues table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dues'
      )
    `;
    
    if (!tableExists[0].exists) {
      console.log('Creating dues table...');
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
    
    // Get all customers
    const customers = await sql`SELECT id, name FROM customers LIMIT 5`;
    
    if (customers.length === 0) {
      console.log('No customers found. Please create customers first.');
      return;
    }
    
    console.log(`Found ${customers.length} customers. Creating test dues...`);
    
    // Create test dues for each customer
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const dueDate = i === 0 ? today.toISOString().slice(0, 10) : 
                     i === 1 ? tomorrow.toISOString().slice(0, 10) : 
                     nextWeek.toISOString().slice(0, 10);
      
      const amount = 5000 + (i * 1000); // Different amounts for each customer
      
      await sql`
        INSERT INTO dues (customer_id, amount, due_date, paid)
        VALUES (${customer.id}, ${amount}, ${dueDate}, ${i === 0})
        ON CONFLICT DO NOTHING
      `;
      
      console.log(`Created due for ${customer.name}: ₹${amount} due on ${dueDate}`);
    }
    
    // Check total dues
    const duesResult = await sql`SELECT COUNT(*) as count FROM dues`;
    console.log(`Total dues in database: ${duesResult[0].count}`);
    
    console.log('Test dues created successfully!');
    
  } catch (error) {
    console.error('Error creating test dues:', error);
  }
}

createTestDues(); 