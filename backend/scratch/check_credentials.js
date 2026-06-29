const mongoose = require('mongoose');
require('dotenv').config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarship_db');
    const User = require('../models/User');
    
    const appId = 'NSP/2025/KA/96832';
    const user = await User.findOne({ id: appId });
    
    if (user) {
      console.log('User found:');
      console.log('ID:', user.id);
      console.log('Password in DB:', user.password);
      console.log('Full Name:', user.fullName);
    } else {
      console.log('User not found with ID:', appId);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUser();
