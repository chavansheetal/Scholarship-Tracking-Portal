const mongoose = require('mongoose');
const User = require('../models/User');

const uri = 'mongodb://127.0.0.1:27017/scholarship_db';

async function checkUsers() {
  try {
    await mongoose.connect(uri);
    const users = await User.find();
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
      console.log(`- ID: ${u.id || u.appId}, Mobile: ${u.mobile}, Role: ${u.role}`);
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkUsers();
