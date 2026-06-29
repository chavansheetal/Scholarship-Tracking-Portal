const mongoose = require('mongoose');

const uri1 = 'mongodb://localhost:27017/scholarship_db';
const uri2 = 'mongodb://127.0.0.1:27017/scholarship_db';

async function testConnection(uri) {
  console.log(`Testing: ${uri}`);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ Success for ${uri}`);
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.log(`❌ Failed for ${uri}: ${err.message}`);
    return false;
  }
}

async function run() {
  const res1 = await testConnection(uri1);
  const res2 = await testConnection(uri2);
  process.exit(0);
}

run();
