#!/usr/bin/env node

/**
 * Setup Verification Script
 * This script checks if your environment is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verifying AI Text Generator Setup...\n');

let hasErrors = false;

// Check 1: Node.js version
console.log('1️⃣  Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 14) {
  console.log('   ✅ Node.js version is compatible:', nodeVersion);
} else {
  console.log('   ❌ Node.js version is too old:', nodeVersion);
  console.log('   Please upgrade to Node.js 14 or higher');
  hasErrors = true;
}

// Check 2: .env file exists
console.log('\n2️⃣  Checking for .env file...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file found');
} else {
  console.log('   ❌ .env file not found');
  console.log('   Please create a .env file in the root directory');
  console.log('   Copy .env.example to .env and add your API key');
  hasErrors = true;
}

// Check 3: API key is set in .env
console.log('\n3️⃣  Checking API key configuration...');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  let apiKeyLine = null;

  for (const line of lines) {
    if (line.trim().startsWith('REACT_APP_GEMINI_API_KEY=')) {
      apiKeyLine = line.trim();
      break;
    }
  }

  if (apiKeyLine) {
    const apiKey = apiKeyLine.split('=')[1];
    if (apiKey && apiKey.length > 10 && !apiKey.includes('your_')) {
      console.log('   ✅ API key is configured');
      console.log('   Key length:', apiKey.length, 'characters');
    } else {
      console.log('   ❌ API key appears to be invalid or placeholder');
      console.log('   Current value:', apiKey ? `"${apiKey.substring(0, 20)}..."` : '(empty)');
      console.log('   Please set a valid Gemini API key');
      console.log('   Get your key from: https://makersuite.google.com/app/apikey');
      hasErrors = true;
    }
  } else {
    console.log('   ❌ REACT_APP_GEMINI_API_KEY not found in .env');
    console.log('   Add this line to your .env file:');
    console.log('   REACT_APP_GEMINI_API_KEY=your_actual_api_key_here');
    hasErrors = true;
  }
}

// Check 4: node_modules exists
console.log('\n4️⃣  Checking dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules found');
} else {
  console.log('   ❌ node_modules not found');
  console.log('   Please run: npm install');
  hasErrors = true;
}

// Check 5: package.json exists
console.log('\n5️⃣  Checking package.json...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('   ✅ package.json found');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log('   Project:', packageJson.name);
  console.log('   Version:', packageJson.version);
} else {
  console.log('   ❌ package.json not found');
  hasErrors = true;
}

// Check 6: Required source files
console.log('\n6️⃣  Checking source files...');
const requiredFiles = [
  'src/App.js',
  'src/index.js',
  'src/config/API.js',
  'src/components/Sidebar.js',
  'src/components/SearchBar.js',
  'src/pages/Profile.js',
  'src/pages/Settings.js'
];

let missingFiles = [];
for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
}

if (missingFiles.length === 0) {
  console.log('   ✅ All required source files found');
} else {
  console.log('   ❌ Missing files:', missingFiles.join(', '));
  hasErrors = true;
}

// Final result
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('\n❌ SETUP INCOMPLETE - Please fix the issues above\n');
  console.log('📚 For help, check README.md or run: npm start\n');
  process.exit(1);
} else {
  console.log('\n✅ SETUP COMPLETE - You\'re ready to go!\n');
  console.log('🚀 Run "npm start" to launch the app\n');
  console.log('⚠️  IMPORTANT: If you just added/changed your .env file,');
  console.log('   you MUST restart the development server!\n');
  process.exit(0);
}
