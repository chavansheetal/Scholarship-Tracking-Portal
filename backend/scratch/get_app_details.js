const mongoose = require('mongoose');
const Application = require('../models/Application');

const uri = 'mongodb://127.0.0.1:27017/scholarship_db';

async function checkApp(appId) {
  try {
    await mongoose.connect(uri);
    const app = await Application.findOne({ appId });
    console.log(JSON.stringify(app, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkApp('NSP/2025/KA/96832');
