// Test script to verify Cloudinary connection and test upload
// Run with: node backend/scripts/test-cloudinary.js

const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testCloudinary() {
  console.log('Testing Cloudinary connection...');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set');
  console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');
  console.log('');

  try {
    // Test 1: Verify credentials by listing resources
    console.log('Test 1: Checking Cloudinary connection...');
    const resources = await cloudinary.api.resources({
      type: 'upload',
      max_results: 1
    });
    console.log('✅ Cloudinary connection successful!');
    console.log('');

    // Test 2: Check if vocabulary-center folder exists
    console.log('Test 2: Checking for vocabulary-center folder...');
    const folderResources = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'vocabulary-center',
      max_results: 10
    });
    
    if (folderResources.resources.length === 0) {
      console.log('ℹ️  vocabulary-center folder does not exist yet (this is normal if no files have been uploaded)');
      console.log('   The folder will be created automatically when you upload your first PDF');
    } else {
      console.log(`✅ Found ${folderResources.resources.length} files in vocabulary-center folder:`);
      folderResources.resources.forEach(resource => {
        console.log(`   - ${resource.public_id} (${resource.resource_type})`);
      });
    }
    console.log('');

    // Test 3: List all folders
    console.log('Test 3: Listing all folders in Cloudinary...');
    try {
      const folders = await cloudinary.api.root_folders();
      console.log('Folders found:');
      if (folders.folders.length === 0) {
        console.log('   No folders found');
      } else {
        folders.folders.forEach(folder => {
          console.log(`   - ${folder.name}`);
        });
      }
    } catch (error) {
      console.log('   Could not list folders (this is okay)');
    }

    console.log('');
    console.log('✅ All tests completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to your admin dashboard at http://localhost:3000/admin');
    console.log('2. Click "Create New PDF"');
    console.log('3. Fill in the form and upload a PDF file');
    console.log('4. The vocabulary-center folder will be created automatically');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Possible issues:');
    console.error('1. Check your .env file has correct CLOUDINARY credentials');
    console.error('2. Verify your Cloudinary account is active');
    console.error('3. Check if API credentials have proper permissions');
    process.exit(1);
  }
}

testCloudinary();

