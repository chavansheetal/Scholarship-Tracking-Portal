const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  appId: { type: String, required: true, unique: true },
  userId: { type: String, required: true }, // Links to User.id or User.mobile
  studentName: { type: String, required: true },
  scheme: { type: String, required: true },
  status: { type: String, default: 'Submitted' },
  appliedOn: { type: String, required: true },
  personalDetails: { type: Object },
  academicDetails: { type: Object },
  bankDetails: { type: Object },
  files: { type: Object },
  timeline: { type: Array },
  renewalHistory: { type: Array, default: [] },
  remarks: { type: String },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.model('Application', ApplicationSchema);
