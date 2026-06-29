const mongoose = require('mongoose');
const mongoURI = 'mongodb://127.0.0.1:27017/scholarship_db';

async function run() {
  await mongoose.connect(mongoURI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  const Application = mongoose.model('Application', new mongoose.Schema({}, { strict: false }));
  
  const apps = await Application.find();
  console.log(`Found ${apps.length} applications:`);
  apps.forEach(app => {
    console.log(`- AppID: ${app.appId}`);
    console.log(`  Name: ${app.studentName}`);
    console.log(`  Aadhaar (top): ${app.aadhaar}`);
    console.log(`  Aadhaar (personal): ${app.personalDetails?.aadhaar}`);
    console.log(`  Aadhaar (another): ${app.personalDetails?.aadhar}`); // Check for typo
  });
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
