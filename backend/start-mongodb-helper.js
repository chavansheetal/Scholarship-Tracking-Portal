const fs = require('fs');
const path = require('path');
const net = require('net');
const { spawn, execSync } = require('child_process');

/**
 * Checks if port 27017 is already active/listening.
 */
function isMongoRunning() {
  return new Promise((resolve) => {
    const client = new net.Socket();
    client.setTimeout(800);
    client.once('connect', () => {
      client.destroy();
      resolve(true);
    });
    client.once('error', () => {
      resolve(false);
    });
    client.once('timeout', () => {
      client.destroy();
      resolve(false);
    });
    client.connect(27017, '127.0.0.1');
  });
}

/**
 * Scans standard paths for mongod.exe on Windows.
 */
function findMongodPath() {
  // 1. Check common Program Files versions
  const versions = ['8.2', '8.0', '7.0', '6.0'];
  for (const ver of versions) {
    const p = `C:\\Program Files\\MongoDB\\Server\\${ver}\\bin\\mongod.exe`;
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // 2. Try executing 'where mongod' to see if it is in PATH
  try {
    const whereOutput = execSync('where mongod', { encoding: 'utf8' }).trim();
    const firstPath = whereOutput.split('\n')[0].trim();
    if (fs.existsSync(firstPath)) {
      return firstPath;
    }
  } catch (e) {
    // Ignore error
  }

  return null;
}

/**
 * Safely removes lock files in the specified database directory.
 */
function cleanLockFiles(dbPath) {
  const locks = ['mongod.lock', 'WiredTiger.lock'];
  locks.forEach(lock => {
    const lockPath = path.join(dbPath, lock);
    if (fs.existsSync(lockPath)) {
      try {
        fs.unlinkSync(lockPath);
        console.log(`🧹 Cleared stale lock file: ${lock}`);
      } catch (err) {
        console.log(`⚠️ Note: Could not delete ${lock} (might be active): ${err.message}`);
      }
    }
  });
}

/**
 * Auto-starts MongoDB if it is not already running.
 */
async function startLocalMongo() {
  console.log('🔍 Checking if MongoDB is already running...');
  
  const running = await isMongoRunning();
  if (running) {
    console.log('✅ MongoDB is already running on port 27017.');
    return true;
  }

  console.log('🔌 MongoDB is not running. Attempting to start it automatically...');
  const mongodPath = findMongodPath();
  if (!mongodPath) {
    console.warn('⚠️ Could not find mongod.exe in standard Windows paths or PATH. Please start MongoDB manually.');
    return false;
  }

  console.log(`💡 Found MongoDB executable at: ${mongodPath}`);
  
  // Set data path to the project's local 'mongodb_data' directory
  const rootDir = path.dirname(__dirname); // Parent of backend
  const localDbPath = path.join(rootDir, 'mongodb_data');
  
  // Ensure local db directory exists
  if (!fs.existsSync(localDbPath)) {
    fs.mkdirSync(localDbPath, { recursive: true });
  }

  // Clear stale lock files in the local db folder to prevent startup crash
  cleanLockFiles(localDbPath);

  try {
    console.log('🚀 Starting MongoDB service in the background...');
    const child = spawn(mongodPath, ['--dbpath', localDbPath, '--port', '27017'], {
      detached: true,
      stdio: 'ignore'
    });
    
    // Prevent parent from waiting for child to exit
    child.unref();

    console.log('⏳ Waiting for database to initialize (1.5 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const doubleCheck = await isMongoRunning();
    if (doubleCheck) {
      console.log('🎉 MongoDB started successfully in background!');
      return true;
    } else {
      console.log('⚠️ MongoDB started but did not respond on port 27017 yet.');
      return false;
    }
  } catch (err) {
    console.error('❌ Failed to start background MongoDB:', err.message);
    return false;
  }
}

module.exports = { startLocalMongo };
