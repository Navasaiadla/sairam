# Neon Database Setup Guide

This guide will help you set up Neon.tech as your backend database for the hostel management system.

## Step 1: Create a Neon Project

1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Click "New Project"
3. Choose your project settings and click "Create Project"
4. Save your connection details including your password

## Step 2: Get Your Connection String

1. In your Neon Console, go to your project dashboard
2. Click the "Connect" button
3. Select "Next.js" from the connection options
4. Copy the connection string that looks like:
   ```
   postgresql://[user]:[password]@[neon-database-url]?sslmode=require
   ```

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in your project root
2. Add your Neon connection string:
   ```
   DATABASE_URL="postgresql://[user]:[password]@[neon-database-url]?sslmode=require"
   ```
3. Replace `[user]`, `[password]`, and `[neon-database-url]` with your actual values

## Step 4: Initialize Database Tables

The application will automatically create the required tables when you first run it. The tables include:

- `hostels` - Stores hostel information with UUID primary keys
- `rooms` - Stores room information linked to hostels
- `customers` - Stores customer/guest information linked to hostels
- `dues` - Stores payment dues information linked to customers

## Step 5: Test the Connection

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000/api/test` to test the database connection
3. You should see a success message with the PostgreSQL version

## Step 6: Verify Tables

You can verify that the tables were created by checking your Neon Console:

1. Go to your project dashboard
2. Click on "Tables" in the left sidebar
3. You should see `hostels`, `rooms`, `customers`, and `dues` tables

## Troubleshooting

### Connection Issues
- Make sure your `.env.local` file is in the project root
- Verify your connection string is correct
- Check that your Neon project is active

### Table Creation Issues
- The tables are created automatically on first run
- If tables don't exist, restart your development server
- Check the console for any error messages

### API Errors
- Test the connection at `/api/test` first
- Check the browser console and server logs for detailed error messages
- Ensure your Neon database is accessible from your current IP

## Database Schema

The application uses the following schema:

```sql
-- Hostels table
CREATE TABLE hostels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  room_no VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(hostel_id, room_no)
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  father_phone TEXT,
  college TEXT,
  course TEXT,
  checkin_date DATE NOT NULL,
  checkout_date DATE,
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL
);

-- Dues table
CREATE TABLE dues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Next Steps

Once your database is connected:

1. **Create a Hostel**: 
   - Use the API: `POST /api/hostels` with `{"name": "Your Hostel Name"}`
   - Or run the script: `node scripts/create-hostel.js`
   - Save the returned hostel ID (UUID)

2. **Use the Hostel ID**: 
   - Replace `[hostelId]` in URLs with your actual hostel UUID
   - Example: `/hostel/your-uuid-here/add-customer`

3. **Test the Features**:
   - Add customers through the `/hostel/[hostelId]/add-customer` page
   - View room guests at `/hostel/[hostelId]/rooms`
   - Check dues at `/hostel/[hostelId]/dues`
   - Edit customer information at `/hostel/[hostelId]/edit-customer`

The application will now use your Neon database for all data storage and retrieval with proper hostel isolation. 