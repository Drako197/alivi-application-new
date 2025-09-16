#!/usr/bin/env node

/**
 * Gemini AI Setup Script
 * Helps configure the Gemini API key for MILA
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 MILA Gemini AI Setup');
console.log('======================\n');

console.log('This script will help you configure the Gemini API key for MILA.');
console.log('Get your API key from: https://makersuite.google.com/app/apikey\n');

rl.question('Enter your Gemini API key: ', (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    console.log('❌ No API key provided. Exiting...');
    rl.close();
    return;
  }

  const envContent = `# Environment Variables for Alivi Application

# Gemini AI Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=${apiKey.trim()}

# Memory Service Configuration (if using external memory service)
MEMORY_SERVICE_URL=http://localhost:3001

# Other API Keys (add as needed)
# VITE_ICD10_API_KEY=your_icd10_key_here
# VITE_NPPES_API_KEY=your_nppes_key_here
`;

  try {
    fs.writeFileSync('.env', envContent);
    console.log('✅ .env file created successfully!');
    console.log('📝 Your API key has been saved to .env');
    console.log('🚀 You can now run: npm run dev');
    console.log('\n📋 For production deployment:');
    console.log('1. Go to your Netlify dashboard');
    console.log('2. Navigate to Site Settings > Environment Variables');
    console.log('3. Add: VITE_GEMINI_API_KEY = "' + apiKey.trim() + '"');
    console.log('4. Redeploy your site');
  } catch (error) {
    console.log('❌ Error creating .env file:', error.message);
  }

  rl.close();
});

rl.on('close', () => {
  console.log('\n🎉 Setup complete! Check GEMINI_SETUP_INSTRUCTIONS.md for more details.');
  process.exit(0);
});
