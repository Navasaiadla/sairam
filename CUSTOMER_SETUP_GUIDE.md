# Customer Creation Setup Guide

## 🎯 What We've Fixed

✅ **Updated Database Schema**: All tables now use UUIDs and proper relationships  
✅ **Enhanced Customer Form**: Added all required fields (name, phone, father's phone, college, course, check-in date, room)  
✅ **Fixed API Endpoints**: Updated to work with new schema  
✅ **Improved Error Handling**: Better error messages and validation  

## 📋 Required Fields for Customer Creation

When creating a new customer, the following data is collected and stored:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | TEXT | ✅ | Full name of the customer |
| `phone` | TEXT | ✅ | Customer's phone number |
| `fatherPhone` | TEXT | ❌ | Father's phone number |
| `college` | TEXT | ✅ | College/University name |
| `course` | TEXT | ✅ | Course/Program name |
| `checkinDate` | DATE | ✅ | Check-in date |
| `checkoutDate` | DATE | ❌ | Check-out date (optional) |
| `roomNo` | TEXT | ✅ | Room number |
| `hostelId` | UUID | ✅ | Hostel ID (auto-filled) |

## 🚀 Setup Steps

### 1. Set Up Environment Variables
Create a `.env.local` file in your project root:
```env
DATABASE_URL="postgresql://[user]:[password]@[neon-database-url]?sslmode=require"
```

### 2. Initialize Database
Run the database setup script:
```bash
node scripts/setup-database.js
```

### 3. Test Customer Creation
Test the database connection and customer creation:
```bash
node scripts/test-customer-creation.js
```

### 4. Start the Application
```bash
npm run dev
```

## 🧪 Testing Customer Creation

### Option 1: Use the Test Script
```bash
node scripts/test-customer-creation.js
```

### Option 2: Use the Web Interface
1. Visit: `http://localhost:3000/debug`
2. Click "Test Connection" to verify database connectivity
3. Click "Initialize Database" if needed
4. Visit your hostel dashboard: `http://localhost:3000/hostel/[hostel-id]`
5. Click "Add Customer" and fill out the form

### Option 3: Use the API Directly
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "9876543210",
    "fatherPhone": "9876543211",
    "college": "ABC College",
    "course": "B.Tech Computer Science",
    "checkinDate": "2024-01-15",
    "checkoutDate": null,
    "roomNo": "A-101",
    "hostelId": "your-hostel-id-here"
  }'
```

## 🔧 Troubleshooting

### Common Issues:

1. **"Failed to create customer" error**
   - Check your DATABASE_URL in `.env.local`
   - Run `node scripts/setup-database.js` to initialize tables
   - Verify all required fields are filled

2. **"relation does not exist" error**
   - Run `node scripts/setup-database.js`
   - Visit `http://localhost:3000/debug` and click "Initialize Database"

3. **Connection timeout**
   - Check your internet connection
   - Verify your Neon database is active
   - Check your connection string format

### Debug Tools:
- **Debug Page**: `http://localhost:3000/debug`
- **API Test**: `GET /api/test` and `POST /api/test`
- **Console Logs**: Check browser console and terminal output

## 📊 Database Schema Overview

```sql
-- Customers table structure
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
```

## 🎉 Success Indicators

When customer creation works correctly, you should see:
- ✅ Form submission without errors
- ✅ Success message in console
- ✅ Customer data stored in database
- ✅ Room automatically created if it doesn't exist
- ✅ Proper relationships between hostel, room, and customer

## 📞 Support

If you're still having issues:
1. Check the debug page: `http://localhost:3000/debug`
2. Run the test script: `node scripts/test-customer-creation.js`
3. Check server logs for detailed error messages
4. Verify your Neon database connection string 