import { neon } from '@neondatabase/serverless';

// Only create the connection if DATABASE_URL is available
const sql = process.env.DATABASE_URL 
  ? neon(process.env.DATABASE_URL)
  : null;

export default sql; 