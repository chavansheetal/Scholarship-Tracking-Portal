const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect('mongodb://localhost:27017/scholarship_db');
    console.log('Connected to scholarship_db successfully.');
    
    // List databases
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('Databases list:', dbs.databases.map(d => d.name));
    
    // List collections in scholarship_db
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in scholarship_db:');
    for (let col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments({});
      console.log(`- ${col.name}: ${count} documents`);
    }
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
