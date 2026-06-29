const mongoose = require('mongoose');
require('dotenv').config();

async function checkApp() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarship_db');
    const Application = require('../models/Application');
    
    const appId = 'NSP/2025/KA/96832';
    const app = await Application.findOne({ appId: appId });
    
    if (app) {
      console.log('Application found:');
      console.log('App ID:', app.appId);
      console.log('Student Name:', app.studentName);
      console.log('User ID:', app.userId);
    } else {
      console.log('Application not found with ID:', appId);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkApp();
