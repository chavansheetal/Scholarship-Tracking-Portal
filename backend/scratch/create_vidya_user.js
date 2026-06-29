const mongoose = require('mongoose');
require('dotenv').config();

async function createVidyaUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarship_db');
    const User = require('../models/User');
    const Application = require('../models/Application');
    
    const appId = 'NSP/2025/KA/96832';
    const password = 'Vidya@123'; // From user's screenshot
    
    // Check if application exists
    const app = await Application.findOne({ appId });
    if (!app) {
      console.log('Application not found. Cannot create user.');
      process.exit(1);
    }
    
    // Check if user already exists (to be safe)
    const existingUser = await User.findOne({ id: appId });
    if (existingUser) {
      console.log('User already exists. Updating password.');
      existingUser.password = password;
      await existingUser.save();
    } else {
      console.log('Creating new User record for Vidya...');
      const newUser = new User({
        id: appId,
        fullName: app.studentName.trim(),
        mobile: app.personalDetails.mobile || '9999999999', // Fallback if missing
        email: app.personalDetails.email,
        dob: app.personalDetails.dob,
        gender: app.personalDetails.gender,
        aadhaar: app.personalDetails.aadhaar,
        category: app.personalDetails.category,
        state: app.personalDetails.state,
        password: password,
        role: 'student'
      });
      await newUser.save();
      console.log('User created successfully!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createVidyaUser();
