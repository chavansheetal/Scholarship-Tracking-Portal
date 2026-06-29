# Document Verification - Quick Reference for Admins

## Understanding Verification Results

### Status Indicators

#### ✅ **VERIFIED** (Green)
- **Trust Score:** 75-100
- **Meaning:** Document appears authentic
- **Action:** Accept and proceed with application
- **What passed:** File type, image quality, OCR text, pattern matching

---

#### ⚠️ **NEEDS_REVIEW** (Yellow)
- **Trust Score:** 50-74
- **Meaning:** Document might be authentic but has minor issues
- **Action:** Manual review required - compare with original if possible
- **Common reasons:**
  - Low image quality (but still readable)
  - Missing some keyword patterns
  - Partial text extraction
  - Minor watermarks or marks

---

#### ❌ **REJECTED** (Red)
- **Trust Score:** 0-49
- **Meaning:** Document appears to be fake or heavily tampered
- **Action:** Request re-upload with clear, original document
- **Common reasons:**
  - Blurry/pixelated image
  - No readable text (OCR failed)
  - Missing required document information
  - Contains phrases like "SAMPLE", "DRAFT", "NOT VALID"
  - Edited/photoshopped elements detected

---

## Trust Score Breakdown

```
Base Score: 100 points

Deductions:
├─ File Type Issues: -10 per issue
├─ Low Image Quality: -15
├─ Invalid Pattern Match: -20
├─ Fake Document Indicators: -30
└─ OCR Failure: -25

Formula: Max(0, Min(100, 100 - total_deductions))
```

### Examples:

**Example 1: Clear Aadhaar Card**
- File type ✅ (0 deductions)
- Image quality ✅ (0 deductions)
- Pattern matches ✅ (0 deductions)
- No fake indicators ✅ (0 deductions)
- OCR successful ✅ (0 deductions)
- **Result: 100/100 → VERIFIED ✅**

**Example 2: Blurry Mark Sheet**
- File type ✅ (0 deductions)
- Image quality ❌ (-15 deductions)
- Pattern matches ✅ (0 deductions)
- No fake indicators ✅ (0 deductions)
- OCR successful ✅ (0 deductions)
- **Result: 85/100 → VERIFIED ✅**

**Example 3: Photoshopped Bank Passbook**
- File type ✅ (0 deductions)
- Image quality ⚠️ (-15 deductions)
- Pattern matches ✅ (0 deductions)
- Fake indicators detected ❌ (-30 deductions)
- OCR partial ⚠️ (-10 deductions)
- **Result: 45/100 → REJECTED ❌**

---

## What Each Check Looks For

### 1. File Type Check
```
✅ Accepts: PDF, JPG, JPEG, PNG
✅ Max size: 2MB
❌ Rejects: BMP, GIF, WEBP, etc.
❌ Rejects: Corrupted or empty files
```

### 2. Image Quality Check
```
✅ Min resolution: 200x200 pixels
✅ Quality score: Must be ≥60%
✅ Detects: Clear edges and details
❌ Rejects: Heavily pixelated images
❌ Rejects: Blurry/unfocused documents
```

### 3. OCR Text Extraction
```
✅ Extracts readable text from image
✅ Measures extraction confidence
❌ Fails: Completely unreadable documents
❌ Fails: Heavily corrupted images
```

### 4. Document Pattern Verification

**For Aadhaar Card:**
- Must contain: aadhaar, uid, issued, government of india
- Must have numbers/digits
- Minimum readable text: 50 characters

**For Mark Sheet:**
- Must contain: roll, marks, grade, subject, score
- Must have numbers
- Minimum readable text: 100 characters

**For Income Certificate:**
- Must contain: income certificate, tehsildar, sdm, revenue
- Must have numbers
- Minimum readable text: 80 characters

**For Bank Passbook:**
- Must contain: bank, account, ifsc, statement
- Must have numbers
- Minimum readable text: 50 characters

**For Enrollment Certificate:**
- Must contain: enrollment, institution, university, college
- Must have numbers
- Minimum readable text: 80 characters

### 5. Fake Document Detection
```
HIGH RISK FLAGS ❌ (-30 points):
├─ Contains: "SAMPLE", "DRAFT", "TEST DOCUMENT"
├─ Contains: "NOT VALID", "CANCELLED"
├─ Contains: "CONFIDENTIAL", "WATERMARK"
└─ Shows: Clear photoshop/edit artifacts

WARNINGS ⚠️ (-15 points):
├─ Multiple correction marks
├─ Scratched or heavily worn appearance
└─ Unusual aspect ratio
```

---

## Admin Decision Flow

```
Student Uploads Document
         ↓
    Verification Runs (2-5 seconds)
         ↓
    ┌────────────────────────────────┐
    │   What's the Trust Score?      │
    └────────────────────────────────┘
    ↙                 ↓                  ↘
  75-100            50-74              0-49
   ↓                 ↓                  ↓
VERIFIED      NEEDS_REVIEW           REJECTED
   ↓                 ↓                  ↓
Accept        Manual Review        Request Re-upload
Proceed       (Compare if          (Ask student to
              available)            upload clearer
                                   original copy)
```

---

## Common Issues & Solutions

### Issue: "Image quality is too low"
**Solution:** Ask student to:
- Use better camera/scanner
- Ensure good lighting
- Hold document flat
- Take clear, focused photo
- Avoid shadows or glare

### Issue: "Missing required keywords"
**Solution:** Verify:
- Document is correct type (e.g., not enrollment cert uploaded as income cert)
- Document is complete (not partial/cropped)
- Text is in same language as configured

### Issue: "Document marked as draft/sample"
**Solution:** Ask student to:
- Upload original document
- Check if certificate is in draft state
- Contact issuing authority for final version

### Issue: "OCR failed - cannot read text"
**Solution:**
- Reject and ask for re-upload
- Ensure document is clear and legible
- Check if document is damaged/faded

---

## Verification Workflow for Admins

1. **Student Uploads Documents** → System auto-verifies
2. **Check Verification Status:**
   - Green (✅) → Auto-accept
   - Yellow (⚠️) → Manual review
   - Red (❌) → Request re-upload
3. **For Yellow Status:** Compare with original if available
4. **Approve/Reject** based on confidence
5. **Notify Student** of status

---

## Best Practices

✅ **DO:**
- Accept VERIFIED documents immediately
- For NEEDS_REVIEW, ask students to resubmit if unsure
- Keep detailed notes on manual reviews
- Monitor rejection rates (should be <5%)
- Update document patterns if needed for your region

❌ **DON'T:**
- Over-rely on system alone for manual verification
- Accept documents below 50 trust score
- Ignore multiple rejections from same student (investigate)
- Change verification settings without testing

---

## Troubleshooting

**Q: Why is a clear document showing low trust score?**
A: Could be language issue. Verify OCR language setting matches document.

**Q: System keeps rejecting real documents?**
A: Patterns might need adjustment for your region/institution.

**Q: Can I override verification results?**
A: Yes, but log reason for audit trail.

**Q: How to check verification results?**
A: Each document shows:
- Status (Verified/Needs Review/Rejected)
- Trust Score (0-100)
- Issues found
- Verification details

---

## Contact Support

For issues with:
- **Verification logic:** Check DOCUMENT_VERIFICATION_GUIDE.md
- **Integration issues:** Check UploadDocuments.jsx
- **Custom patterns:** Modify documentVerificationService.js

---

**Version:** 1.0
**Last Updated:** 2024
**System:** NSP Scholar Platform
**Technology:** Tesseract.js OCR + Canvas API
