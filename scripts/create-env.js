// Script to help create .env.local file
// Run this with: node scripts/create-env.js

const fs = require('fs');
const path = require('path');

console.log('🔧 Environment Setup Helper');
console.log('===========================\n');

const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env.local file already exists!');
  console.log('📁 Location:', envPath);
  
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('\n📄 Current content:');
    console.log(content);
    
    if (content.includes('DATABASE_URL=')) {
      console.log('\n✅ DATABASE_URL is configured!');
      console.log('🧪 You can now run: node scripts/quick-setup.js');
    } else {
      console.log('\n❌ DATABASE_URL is missing from .env.local');
      console.log('📝 Please add your Neon database URL to the file.');
    }
  } catch (error) {
    console.log('❌ Error reading .env.local:', error.message);
  }
} else {
  console.log('❌ .env.local file not found!');
  console.log('\n📝 Creating .env.local template...');
  
  const template = `# Neon Database Configuration
# Replace with your actual Neon database connection string
DATABASE_URL="postgresql://username:password@your-neon-url?sslmode=require"

# Example:
# DATABASE_URL="postgresql://john:password123@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
`;
  
  try {
    fs.writeFileSync(envPath, template);
    console.log('✅ Created .env.local template!');
    console.log('📁 Location:', envPath);
    console.log('\n📋 Next steps:');
    console.log('1. Open .env.local in your text editor');
    console.log('2. Replace the placeholder with your actual Neon connection string');
    console.log('3. Save the file');
    console.log('4. Run: node scripts/quick-setup.js');
    console.log('\n🔗 To get your Neon connection string:');
    console.log('1. Go to https://neon.tech');
    console.log('2. Open your project dashboard');
    console.log('3. Click "Connect"');
    console.log('4. Select "Next.js"');
    console.log('5. Copy the connection string');
  } catch (error) {
    console.log('❌ Error creating .env.local:', error.message);
    console.log('\n📝 Please create .env.local manually with this content:');
    console.log(template);
  }
}

console.log('\n📚 For more help, see: SETUP_NOW.md'); 