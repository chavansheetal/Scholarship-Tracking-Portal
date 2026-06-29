const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String },
  dob: { type: String },
  gender: { type: String },
  aadhaar: { type: String },
  category: { type: String },
  state: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.model('User', UserSchema);
