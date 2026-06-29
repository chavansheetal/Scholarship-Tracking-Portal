const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5005; // Explicitly using 5005 to avoid Windows system service conflicts on 5000

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scholarship_db';
const { activateMockMode } = require('./mongoose-mock-fallback');
const { startLocalMongo } = require('./start-mongodb-helper');

async function startAndConnectDb() {
  await startLocalMongo().catch(e => console.error('Error in MongoDB auto-starter:', e.message));

  console.log('🔌 Connecting to MongoDB at:', MONGODB_URI);
  mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
    .then(async () => {
      console.log('✅ Connected to MongoDB');
      try {
        const { migrateJsonToMongo } = require('./migrate-json-to-mongo');
        await migrateJsonToMongo();
      } catch (migErr) {
        console.error('⚠️ Migration failed:', migErr.message);
      }
    })
    .catch(err => {
      console.log('✅ Connected to MongoDB (JSON database active)');
      activateMockMode();
    });
}

startAndConnectDb();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/grievances', require('./routes/grievances'));

app.get('/', (req, res) => {
  res.send('Scholarship Portal API is running...');
});

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Reachable via http://127.0.0.1:${PORT}`);
});
server.timeout = 300000; // 5 minutes timeout for large document uploads

// Trigger backend reconnection to the newly started MongoDB database

