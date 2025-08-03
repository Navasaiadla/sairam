# Troubleshooting Guide - Fix Internal Server Error

## Quick Fix Steps

### 1. Check Database Connection
First, visit the debug page to test your database connection:
```
http://localhost:3000/debug
```

### 2. Set Up Environment Variables
Create a `.env.local` file in your project root:
```env
DATABASE_URL="postgresql://[user]:[password]@[neon-database-url]?sslmode=require"
```

### 3. Initialize Database
Run the database setup script:
```bash
node scripts/setup-database.js
```

## Common Issues and Solutions

### Issue 1: DATABASE_URL Not Set
**Error**: `DATABASE_URL environment variable is not set`

**Solution**:
1. Create a `.env.local` file in your project root
2. Add your Neon database connection string
3. Restart your development server

### Issue 2: Database Tables Don't Exist
**Error**: `relation "hostels" does not exist`

**Solution**:
1. Visit `http://localhost:3000/debug`
2. Click "Initialize Database"
3. Or run: `node scripts/setup-database.js`

### Issue 3: Neon Database Not Accessible
**Error**: `connection failed` or `timeout`

**Solution**:
1. Check your Neon database is active
2. Verify your connection string is correct
3. Check your internet connection
4. Ensure your IP is not blocked

### Issue 4: UUID Extension Missing
**Error**: `function gen_random_uuid() does not exist`

**Solution**:
The setup script will automatically create the required extensions.

## Step-by-Step Fix

### Step 1: Get Your Neon Connection String
1. Go to [neon.tech](https://neon.tech)
2. Open your project dashboard
3. Click "Connect"
4. Copy the connection string

### Step 2: Create Environment File
```bash
# Create .env.local file
echo 'DATABASE_URL="your-neon-connection-string-here"' > .env.local
```

### Step 3: Run Database Setup
```bash
# Install dependencies if needed
npm install

# Run database setup
node scripts/setup-database.js
```

### Step 4: Test the Application
1. Start the development server: `npm run dev`
2. Visit: `http://localhost:3000/debug`
3. Test the database connection
4. If successful, visit your hostel dashboard

## Debug Tools

### Debug Page
Visit `http://localhost:3000/debug` for:
- Database connection testing
- Database initialization
- Error diagnostics

### API Test Endpoints
- `GET /api/test` - Test database connection
- `POST /api/test` - Initialize database tables
- `GET /api/hostels` - List hostels (auto-creates table if missing)

### Console Logs
Check your terminal for detailed error messages when running:
```bash
npm run dev
```

## Manual Database Setup

If the automatic setup fails, you can manually create tables:

```sql
-- Create hostels table
CREATE TABLE IF NOT EXISTS hostels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  hostel_id UUID REFERENCES hostels(id),
  room_no VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(hostel_id, room_no)
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  hostel_id UUID REFERENCES hostels(id),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  room VARCHAR(50),
  check_in DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create dues table
CREATE TABLE IF NOT EXISTS dues (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Still Having Issues?

1. **Check the debug page**: `http://localhost:3000/debug`
2. **Check server logs**: Look at your terminal output
3. **Verify Neon setup**: Ensure your Neon database is active
4. **Test connection string**: Try connecting with a database client
5. **Check network**: Ensure you can access external services

## Getting Help

If you're still experiencing issues:
1. Check the error messages in the debug page
2. Look at the server console output
3. Verify your Neon database connection string
4. Ensure all environment variables are set correctly 