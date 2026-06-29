const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

// Submit Application
router.post('/', async (req, res) => {
  try {
    const fs = require('fs');
    fs.appendFileSync('server_log.txt', `[${new Date().toISOString()}] Received POST request\n`);
    
    const appData = req.body;
    fs.appendFileSync('server_log.txt', `[${new Date().toISOString()}] Data: ${JSON.stringify(appData).slice(0, 100)}...\n`);
    
    console.log("📝 Saving application metadata for:", appData.studentName);
    
    // Check for duplicate Aadhaar (prevent same Aadhaar for different applications)
    if (appData.personalDetails && appData.personalDetails.aadhaar) {
      const duplicateAadhaar = await Application.findOne({ 
        "personalDetails.aadhaar": appData.personalDetails.aadhaar,
        appId: { $ne: appData.appId } 
      });
      if (duplicateAadhaar) {
        console.log("🚫 Duplicate Aadhaar blocked:", appData.personalDetails.aadhaar);
        return res.status(400).json({ 
          message: `Error: The Aadhaar number ${appData.personalDetails.aadhaar} is already registered with another scholarship application (Application ID: ${duplicateAadhaar.appId}). Please use your registered account or contact support.` 
        });
      }
    }

    let app = await Application.findOne({ appId: appData.appId });
    if (app) {
      app = await Application.findOneAndUpdate({ appId: appData.appId }, appData, { new: true });
      return res.json({ message: 'Application updated', application: app });
    }

    app = new Application(appData);
    await app.save();
    res.status(201).json({ message: 'Application submitted', application: app });
  } catch (err) {
    console.error("❌ Submit Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get all applications (Admin)
router.get('/', async (req, res) => {
  try {
    const apps = await Application.find();
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get applications by User ID
router.get('/user/:userId', async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.params.userId });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload Individual Document
router.patch('/:appId/document', async (req, res) => {
  try {
    const { docType, fileData } = req.body;
    const appId = req.params.appId;
    
    const update = {};
    update[`files.${docType}`] = fileData;
    update[`personalDetails.files.${docType}`] = fileData; // Sync both locations

    const app = await Application.findOneAndUpdate(
      { appId },
      { $set: update },
      { new: true }
    );

    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json({ message: `${docType} uploaded successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Application
router.delete('/:appId', async (req, res) => {
  try {
    const result = await Application.findOneAndDelete({ appId: req.params.appId });
    if (!result) return res.status(404).json({ message: 'Application not found' });
    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Application Status (Admin)
router.patch('/:appId/status', async (req, res) => {
  try {
    const { status, reason, timeline } = req.body;
    const updateData = { 
      status, 
      updatedAt: Date.now() 
    };
    
    if (reason) {
      updateData.rejectionReason = reason;
    }

    if (timeline) {
      updateData.timeline = timeline;
    } else {
      const app = await Application.findOne({ appId: req.params.appId });
      if (app && app.timeline) {
        let newTimeline = JSON.parse(JSON.stringify(app.timeline));
        const today = new Date().toLocaleDateString("en-IN");
        
        if (status === "Rejected") {
          const stepIndex = newTimeline.findIndex(t => !t.done);
          if (stepIndex !== -1) {
            newTimeline[stepIndex].done = true;
            newTimeline[stepIndex].rejected = true;
            newTimeline[stepIndex].date = today;
          }
        } else {
          newTimeline.forEach(t => delete t.rejected);
          if (status === "Institute Verified") {
            if (newTimeline[0]) { newTimeline[0].done = true; if (!newTimeline[0].date || newTimeline[0].date === "—") newTimeline[0].date = today; }
            if (newTimeline[1]) { newTimeline[1].done = true; newTimeline[1].date = today; }
          } else if (status === "Under Review") {
            if (newTimeline[0]) { newTimeline[0].done = true; }
            if (newTimeline[1]) { newTimeline[1].done = true; }
            if (newTimeline[2]) { newTimeline[2].done = false; newTimeline[2].date = "In Progress"; }
          } else if (status === "Approved") {
            for (let i = 0; i <= 3; i++) {
              if (newTimeline[i]) {
                newTimeline[i].done = true;
                if (!newTimeline[i].date || newTimeline[i].date === "—" || newTimeline[i].date === "Pending") newTimeline[i].date = today;
              }
            }
          } else if (status === "Amount Credited") {
            newTimeline.forEach(t => {
              t.done = true;
              if (!t.date || t.date === "—" || t.date === "Pending") t.date = today;
            });
          }
        }
        updateData.timeline = newTimeline;
      }
    }

    const app = await Application.findOneAndUpdate(
      { appId: req.params.appId },
      updateData,
      { new: true }
    );
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- STAGED VERIFICATION ROUTES ---

const MAX_SEATS = 1000;

// STAGE 2: INSTITUTE VERIFICATION
router.put('/verify-institute/:appId', async (req, res) => {
  try {
    const { role } = req.body;
    if (role !== "institute") return res.status(403).json({ message: "Access denied. Institute role required." });

    const application = await Application.findOne({ appId: req.params.appId });
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.status !== "Submitted") return res.status(400).json({ message: "Only Submitted applications can be verified by Institute." });

    // Check for Academic Records / Marksheet (Required for Institute Verification)
    const files = application.personalDetails?.files || application.files || {};
    const hasAcademicCert = Object.keys(files).some(key => 
      key.toLowerCase().includes('academic') || key.toLowerCase().includes('marksheet')
    );

    if (!hasAcademicCert) {
      return res.status(400).json({ message: "Verification failed: Academic Records/Marksheet is required for Institute verification." });
    }

    application.status = "Institute Verified";
    
    // Update timeline
    const idx = application.timeline.findIndex(t => t.step === "Institute Verification");
    if (idx !== -1) {
      application.timeline[idx].done = true;
      application.timeline[idx].date = new Date().toLocaleDateString("en-IN");
    }
    
    const nextIdx = application.timeline.findIndex(t => t.step === "State NOC");
    if (nextIdx !== -1) {
      application.timeline[nextIdx].date = "Pending at State";
    }

    application.updatedAt = new Date();
    application.markModified('timeline');
    await application.save();

    res.json({ message: "Application verified by Institute and forwarded to State.", application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// STAGE 3: STATE VERIFICATION
router.put('/verify-state/:appId', async (req, res) => {
  try {
    const { role } = req.body;
    if (role !== "state") return res.status(403).json({ message: "Access denied. State role required." });

    const application = await Application.findOne({ appId: req.params.appId });
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.status !== "Institute Verified") return res.status(400).json({ message: "Only Institute Verified applications can be verified by State." });

    // Check for Income Certificate / Financial Doc (Required for State Verification)
    const files = application.personalDetails?.files || application.files || {};
    const hasIncomeCert = Object.keys(files).some(key => 
      key.toLowerCase().includes('income') || key.toLowerCase().includes('financial')
    );
    
    if (!hasIncomeCert) {
      return res.status(400).json({ message: "Verification failed: Income Certificate/Financial Documentation is required for State verification." });
    }

    application.status = "State Verified";
    
    // Update timeline
    const idx = application.timeline.findIndex(t => t.step === "State NOC");
    if (idx !== -1) {
      application.timeline[idx].done = true;
      application.timeline[idx].date = new Date().toLocaleDateString("en-IN");
    }
    
    const nextIdx = application.timeline.findIndex(t => t.step === "Ministry Approval");
    if (nextIdx !== -1) {
      application.timeline[nextIdx].date = "Pending at Ministry";
    }

    application.updatedAt = new Date();
    application.markModified('timeline');
    await application.save();

    res.json({ message: "Application verified by State and forwarded to Ministry.", application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// STAGE 4: MINISTRY APPROVAL
router.put('/approve/:appId', async (req, res) => {
  try {
    const { role } = req.body;
    if (role !== "ministry") return res.status(403).json({ message: "Access denied. Ministry role required." });

    const application = await Application.findOne({ appId: req.params.appId });
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.status !== "State Verified") return res.status(400).json({ message: "Only State Verified applications can be approved by Ministry." });

    // Seat limit check
    const MAX_SEATS = 1000;
    const approvedCount = await Application.countDocuments({ status: "Approved for Payment" });

    if (approvedCount >= MAX_SEATS) {
      application.status = "Rejected - Seats Full";
      application.rejectionReason = "Merit list full: Seat limit reached for this session.";
      application.updatedAt = new Date();
      await application.save();
      return res.status(400).json({ message: "Approval failed: Maximum seat limit (1,000) reached.", application });
    }

    application.status = "Approved for Payment";
    
    // Update timeline
    const idx = application.timeline.findIndex(t => t.step === "Ministry Approval");
    if (idx !== -1) {
      application.timeline[idx].done = true;
      application.timeline[idx].date = new Date().toLocaleDateString("en-IN");
    }
    
    const nextIdx = application.timeline.findIndex(t => t.step === "Amount Credited");
    if (nextIdx !== -1) {
      application.timeline[nextIdx].date = "Ready for Disbursement";
    }

    application.updatedAt = new Date();
    application.markModified('timeline');
    await application.save();

    res.json({ message: "Application approved by Ministry and added to payment queue.", application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// STAGE 5: PAYMENT SIMULATION
router.post('/payment/:appId', async (req, res) => {
  try {
    const application = await Application.findOne({ appId: req.params.appId });
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.status !== "Approved for Payment") return res.status(400).json({ message: "Only Approved applications can be disbursed." });

    application.status = "Payment Success";
    application.paymentDetails = {
      transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`,
      date: new Date().toLocaleDateString("en-IN")
    };

    // Update timeline
    const idx = application.timeline.findIndex(t => t.step === "Amount Credited");
    if (idx !== -1) {
      application.timeline[idx].done = true;
      application.timeline[idx].date = new Date().toLocaleDateString("en-IN");
      application.timeline[idx].note = `TXN ID: ${application.paymentDetails.transactionId}`;
    }

    application.updatedAt = new Date();
    application.markModified('timeline');
    await application.save();

    res.json({ message: "Payment successful! Transaction ID generated.", application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check for duplicate Aadhaar
router.get('/check-aadhaar/:aadhaar', async (req, res) => {
  try {
    const aadhaar = req.params.aadhaar.trim();
    const excludeAppId = req.query.excludeAppId;
    console.log(`🔍 Checking Aadhaar: [${aadhaar}], Exclude: [${excludeAppId}]`);
    
    // Check in multiple possible locations and handle both string and potential number types
    const query = {
      $and: [
        {
          $or: [
            { "personalDetails.aadhaar": aadhaar },
            { "personalDetails.aadhaar": Number(aadhaar) },
            { "aadhaar": aadhaar },
            { "personalDetails.aadhar": aadhaar }
          ]
        }
      ]
    };

    if (excludeAppId) {
      query.$and.push({ appId: { $ne: excludeAppId } });
    }
    
    const duplicate = await Application.findOne(query);
    if (duplicate) {
      console.log(`⚠️ Duplicate found! AppID: ${duplicate.appId}, Name: ${duplicate.studentName}`);
      return res.json({ 
        exists: true, 
        appId: duplicate.appId, 
        studentName: duplicate.studentName 
      });
    }
    console.log(`✅ No duplicate found for Aadhaar: ${aadhaar}`);
    res.json({ exists: false });
  } catch (err) {
    console.error("❌ Check Aadhaar Error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
