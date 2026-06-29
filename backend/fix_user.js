const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixUser() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarship_db');
  
  // Find the user by email
  const email = 'chavansheetal0908@gmail.com';
  const user = await User.findOne({ email });
  
  if (user) {
    console.log('Original User:', user.id, user.fullName);
    
    // Update ID to what the user wants
    user.id = 'NSP/2025/KA/10060';
    // Ensure password is what she thinks it is (she wrote Sheetalt in one msg but Sheetal in another)
    // I'll keep it as Sheetal@123 but notify her.
    
    await user.save();
    console.log('User Updated to ID: NSP/2025/KA/10060');
  } else {
    console.log('User with email not found');
  }
  process.exit(0);
}
fixUser();
