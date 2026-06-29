const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Application = require('../models/Application');

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { id, fullName, mobile, email, password, aadhaar, dob, gender, category, state, scholarshipCategory, type, registeredAt } = req.body;
    
    // Check if user exists by ID, Mobile, Email, or Aadhaar
    let user = await User.findOne({ 
      $or: [
        { id }, 
        { mobile }, 
        { email }, 
        { aadhaar: aadhaar || '___NONE___' } 
      ] 
    });
    
    if (user) {
      let field = "record";
      if (user.id === id) field = "Application ID";
      else if (user.mobile === mobile) field = "Mobile Number";
      else if (user.email === email) field = "Email Address";
      else if (user.aadhaar === aadhaar) field = "Aadhaar Number";
      
      return res.status(400).json({ 
        message: `A student with this ${field} is already registered.`,
        existingAppId: user.id.substring(0, user.id.length - 5) + "*****",
        duplicateField: field        // ← now returned separately
      });
    }

    user = new User({ id, fullName, mobile, email, password, aadhaar, dob, gender, category, state, scholarshipCategory, type, registeredAt });
    await user.save();

    res.status(201).json({ success: true, message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body;
    const user = await User.findOne({ id, password });
    
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by appId
router.get('/user/:appId', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.appId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by aadhaar
router.get('/user/aadhaar/:aadhaar', async (req, res) => {
  try {
    const user = await User.findOne({ aadhaar: req.params.aadhaar });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by email
router.get('/user/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile
router.patch('/user/:appId', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { id: req.params.appId },
      { $set: req.body },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Sync with Applications
    try {
      const updates = req.body;
      const appUpdate = {
        studentName: updates.fullName || user.fullName,
        personalDetails: {
          fullName: updates.fullName || user.fullName,
          dob: updates.dob || user.dob,
          gender: updates.gender || user.gender,
          category: updates.category || user.category,
          religion: updates.religion || user.religion,
          aadhaar: updates.aadhaar || user.aadhaar,
          mobile: updates.mobile || user.mobile,
          email: updates.email || user.email,
          state: updates.state || user.state,
          district: updates.district || user.district,
          pincode: updates.pincode || user.pincode,
          // Academic Snapshot (if provided in body)
          instituteName: updates.instituteName,
          course: updates.course,
          year: updates.year,
          marks: updates.marks,
          // Bank Snapshot (if provided in body)
          bankName: updates.bankName,
          accountNo: updates.accountNo,
          ifsc: updates.ifsc,
          accountHolder: updates.accountHolder
        },
        academicDetails: updates.instituteName ? {
          instituteName: updates.instituteName,
          course: updates.course,
          year: updates.year,
          marks: updates.marks
        } : undefined,
        bankDetails: updates.bankName ? {
          bankName: updates.bankName,
          accountNo: updates.accountNo,
          ifsc: updates.ifsc,
          accountHolder: updates.accountHolder
        } : undefined,
        updatedAt: new Date()
      };

      // Remove undefined fields to avoid overwriting existing data with null
      Object.keys(appUpdate).forEach(key => {
        if (appUpdate[key] === undefined) delete appUpdate[key];
      });
      if (appUpdate.personalDetails) {
        Object.keys(appUpdate.personalDetails).forEach(key => {
          if (appUpdate.personalDetails[key] === undefined) delete appUpdate.personalDetails[key];
        });
      }

      await Application.updateMany(
        { userId: req.params.appId },
        { $set: appUpdate }
      );
    } catch (syncErr) {
      console.error("Failed to sync application data:", syncErr);
      // We don't fail the user update if app sync fails, but we log it
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user password
router.patch('/user/:appId/password', async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOneAndUpdate(
      { id: req.params.appId },
      { $set: { password } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check for duplicate before OTP
router.get('/check-duplicate', async (req, res) => {
  try {
    const { email, mobile } = req.query;
    const user = await User.findOne({ 
      $or: [
        { email: email || '___NONE___' }, 
        { mobile: mobile || '___NONE___' }
      ] 
    });

    if (user) {
      let field = "record";
      if (user.mobile === mobile) field = "Mobile Number";
      else if (user.email === email) field = "Email Address";

      return res.json({ 
        exists: true,
        existingAppId: user.id.substring(0, user.id.length - 5) + "*****",
        duplicateField: field,
        message: `A student with this ${field} is already registered.`
      });
    }

    res.json({ exists: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
