const mongoose = require('mongoose');
const Application = require('../models/Application');

const uri = 'mongodb://127.0.0.1:27017/scholarship_db';

async function checkApp(appId) {
  try {
    await mongoose.connect(uri);
    const app = await Application.findOne({ appId });
    if (app) {
      console.log(`App ID: ${app.appId}`);
      console.log(`Status: ${app.status}`);
      console.log(`Amount: ${app.amount}`);
      console.log(`Keys: ${Object.keys(app.toObject())}`);
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkApp('NSP/2025/KA/96832');
