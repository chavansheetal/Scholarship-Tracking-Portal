const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Grievance Schema
const GrievanceSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // Ticket ID (e.g. GRV-...)
  fullName: String,
  mobile: String,
  email: String,
  subject: String,
  message: String,
  applicationId: String,
  status: { type: String, default: 'Open' },
  adminReply: { type: String, default: '' },
  repliedAt: String,
  submittedAt: String,
  createdAt: { type: Date, default: Date.now }
});

const Grievance = mongoose.model('Grievance', GrievanceSchema);

// Submit Grievance
router.post('/', async (req, res) => {
  try {
    const grievance = new Grievance(req.body);
    await grievance.save();
    res.status(201).json(grievance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Grievances
router.get('/', async (req, res) => {
  try {
    const list = await Grievance.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Grievance (Reply/Status)
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Grievance.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Grievance not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
