const mongoose = require('mongoose');
const Application = require('../models/Application');

const uri = 'mongodb://127.0.0.1:27017/scholarship_db';

async function checkApps() {
  try {
    await mongoose.connect(uri);
    const apps = await Application.find();
    console.log(`Found ${apps.length} applications:`);
    apps.forEach(app => {
      console.log(`- ID: ${app.appId}, Status: ${app.status}, Student: ${app.studentName}`);
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkApps();
