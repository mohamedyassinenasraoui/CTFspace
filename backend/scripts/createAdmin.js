import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ctf');
    console.log('Connected to MongoDB');

    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
      console.error('Usage: node createAdmin.js <email> <password>');
      console.error('Example: node createAdmin.js admin@example.com mypassword');
      process.exit(1);
    }

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing user to admin
      user.role = 'admin';
      user.passwordHash = await bcrypt.hash(password, 10);
      await user.save();
      console.log(`User ${email} updated to admin role`);
    } else {
      // Create new admin user
      const passwordHash = await bcrypt.hash(password, 10);
      user = await User.create({
        email,
        username: email.split('@')[0],
        passwordHash,
        role: 'admin'
      });
      console.log(`Admin user created: ${email}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();

