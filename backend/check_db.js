const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarship_db');
  const users = await User.find({ email: 'chavansheetal0908@gmail.com' });
  console.log('Users with this email:', users.length);
  users.forEach(u => {
    console.log(`ID: ${u.id}, Name: ${u.fullName}`);
  });
  process.exit(0);
}
check();
