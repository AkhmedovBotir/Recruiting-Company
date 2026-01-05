const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const readline = require('readline');
const Admin = require('../models/Admin');
const connectDB = require('../config/database');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to get user input
const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const createAdmin = async () => {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('\n❌ Error: MONGODB_URI is not defined in .env file');
      console.error('Please create a .env file in the root directory with MONGODB_URI');
      process.exit(1);
    }

    // Connect to database
    await connectDB();

    console.log('\n=== Admin User Creation Script ===\n');

    // Get admin details from user
    const username = await question('Enter username: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password (min 6 characters): ');
    const role = await question('Enter role (admin/super_admin) [default: admin]: ') || 'admin';

    // Validate inputs
    if (!username || username.trim().length < 3) {
      console.error('\n❌ Error: Username must be at least 3 characters');
      process.exit(1);
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      console.error('\n❌ Error: Please provide a valid email');
      process.exit(1);
    }

    if (!password || password.length < 6) {
      console.error('\n❌ Error: Password must be at least 6 characters');
      process.exit(1);
    }

    if (!['admin', 'super_admin'].includes(role)) {
      console.error('\n❌ Error: Role must be either "admin" or "super_admin"');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.trim() }],
    });

    if (existingAdmin) {
      console.error('\n❌ Error: Admin with this email or username already exists');
      process.exit(1);
    }

    // Create admin
    const admin = await Admin.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: role,
    });

    console.log('\n✅ Admin created successfully!');
    console.log('\nAdmin Details:');
    console.log(`  ID: ${admin._id}`);
    console.log(`  Username: ${admin.username}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  Created At: ${admin.createdAt}\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    mongoose.connection.close();
  }
};

// Run the script
createAdmin();

