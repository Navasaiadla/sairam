# Quick Database Setup Guide

## The Issue
Your hostel management system is not showing any hostels because the database is not configured. Here's how to fix it:

## Step 1: Create a Neon Database
1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Click "New Project"
3. Choose your project settings and click "Create Project"

## Step 2: Get Your Connection String
1. In your Neon Console, go to your project dashboard
2. Click the "Connect" button
3. Select "Next.js" from the connection options
4. Copy the connection string

## Step 3: Create Environment File
1. Create a file named `.env.local` in your project root directory
2. Add this line to the file (replace with your actual connection string):
   ```
   DATABASE_URL="postgresql://username:password@your-neon-url?sslmode=require"
   ```

## Step 4: Test the Setup
1. Run the quick setup script:
   ```bash
   node scripts/quick-setup.js
   ```
2. This will test your connection and create the required tables

## Step 5: Create a Test Hostel
1. Run the create hostel script:
   ```bash
   node scripts/create-hostel.js
   ```
2. Follow the prompts to create your first hostel

## Alternative: Use the Web Interface
1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/create-hostel`
3. Create a hostel through the web interface

## What This Will Fix
- Hostels will appear on the main dashboard
- You can add customers, manage rooms, and track dues
- All the buttons will work properly

## Need Help?
- Check the `NEON_SETUP.md` file for detailed instructions
- Look at `TROUBLESHOOTING.md` for common issues
- The database tables will be created automatically when you first connect 