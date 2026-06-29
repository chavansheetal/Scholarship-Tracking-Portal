const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Application = require('./models/Application');

async function migrateJsonToMongo() {
  const dbDir = path.join(__dirname, 'db_json');
  if (!fs.existsSync(dbDir)) return;

  const usersPath = path.join(dbDir, 'users.json');
  const appsPath = path.join(dbDir, 'applications.json');

  // 1. Migrate Users
  if (fs.existsSync(usersPath)) {
    try {
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      if (Array.isArray(usersData) && usersData.length > 0) {
        console.log(`📦 Found ${usersData.length} users in JSON database. Starting migration to MongoDB...`);
        let migratedCount = 0;
        for (const userData of usersData) {
          // Check if user already exists in MongoDB
          const existingUser = await User.findOne({
            $or: [{ id: userData.id }, { mobile: userData.mobile }]
          });
          
          if (!existingUser) {
            await User.create(userData);
            migratedCount++;
          }
        }
        console.log(`✅ Successfully migrated ${migratedCount}/${usersData.length} users to MongoDB.`);
        
        // Rename file as backup to prevent duplicate migration attempts
        const backupUsersPath = path.join(dbDir, `users_migrated_${Date.now()}.json.bak`);
        fs.renameSync(usersPath, backupUsersPath);
        console.log(`📁 Backed up users.json to ${path.basename(backupUsersPath)}`);
      }
    } catch (err) {
      console.error('❌ Error migrating users:', err.message);
    }
  }

  // 2. Migrate Applications
  if (fs.existsSync(appsPath)) {
    try {
      const appsData = JSON.parse(fs.readFileSync(appsPath, 'utf8'));
      if (Array.isArray(appsData) && appsData.length > 0) {
        console.log(`📦 Found ${appsData.length} applications in JSON database. Starting migration to MongoDB...`);
        let migratedCount = 0;
        for (const appData of appsData) {
          // Check if application already exists in MongoDB
          const existingApp = await Application.findOne({ appId: appData.appId });
          
          if (!existingApp) {
            await Application.create(appData);
            migratedCount++;
          }
        }
        console.log(`✅ Successfully migrated ${migratedCount}/${appsData.length} applications to MongoDB.`);
        
        // Rename file as backup to prevent duplicate migration attempts
        const backupAppsPath = path.join(dbDir, `applications_migrated_${Date.now()}.json.bak`);
        fs.renameSync(appsPath, backupAppsPath);
        console.log(`📁 Backed up applications.json to ${path.basename(backupAppsPath)}`);
      }
    } catch (err) {
      console.error('❌ Error migrating applications:', err.message);
    }
  }
}

module.exports = { migrateJsonToMongo };
