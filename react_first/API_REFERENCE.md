# 🔧 Document Verification API Reference

## Complete Function Documentation

### Import

```javascript
import {
  verifyFileType,
  extractImageMetadata,
  analyzeImageQuality,
  performOCR,
  verifyDocumentPattern,
  detectFakeDocumentIndicators,
  verifyDocument,
  verifyMultipleDocuments
} from './documentVerificationService';
```

---

## 1️⃣ `verifyFileType(file)`

**Purpose:** Validate file format, size, and type

**Input:**
- `file` (File) - JavaScript File object

**Output:**
```javascript
{
  isValid: boolean,              // true if valid
  issues: string[],              // Array of error messages
  fileType: string,              // MIME type (e.g., "image/jpeg")
  fileSize: number               // Size in bytes
}
```

**Example:**
```javascript
const result = verifyFileType(file);
if (result.isValid) {
  console.log("File is valid");
} else {
  console.log("Issues:", result.issues);
}
```

---

## 2️⃣ `extractImageMetadata(file)`

**Purpose:** Extract image dimensions and metadata

**Input:**
- `file` (File) - JavaScript File object

**Output:**
```javascript
{
  width: number,                 // Image width in pixels
  height: number,                // Image height in pixels
  aspectRatio: string,           // W/H ratio (e.g., "1.33")
  fileSize: number,              // File size in bytes
  uploadedAt: string             // ISO timestamp
}
```

**Example:**
```javascript
const metadata = await extractImageMetadata(file);
console.log(`Image: ${metadata.width}x${metadata.height}`);
```

---

## 3️⃣ `analyzeImageQuality(file)`

**Purpose:** Analyze image quality and detect blurriness

**Input:**
- `file` (File) - JavaScript File object

**Output:**
```javascript
{
  qualityScore: number,          // 0-1 (multiply by 100 for percentage)
  isHighQuality: boolean,        // true if score >= 0.6
  issues: string[]               // Quality issues found
}
```

**Example:**
```javascript
const quality = await analyzeImageQuality(file);
console.log(`Quality: ${(quality.qualityScore * 100).toFixed(0)}%`);
if (!quality.isHighQuality) {
  console.log("Image is too blurry");
}
```

---

## 4️⃣ `performOCR(file)`

**Purpose:** Extract text from image using Tesseract.js

**Input:**
- `file` (File) - JavaScript File object

**Output:**
```javascript
{
  success: boolean,              // true if OCR succeeded
  extractedText: string,         // Full extracted text
  confidence: number             // 0-100 confidence level
  error?: string                 // Error message if failed
}
```

**Example:**
```javascript
const ocr = await performOCR(file);
if (ocr.success) {
  console.log(`Extracted: ${ocr.extractedText}`);
  console.log(`Confidence: ${ocr.confidence}%`);
} else {
  console.log("OCR failed:", ocr.error);
}
```

---

## 5️⃣ `verifyDocumentPattern(extractedText, docType)`

**Purpose:** Verify document against type-specific patterns

**Input:**
- `extractedText` (string) - Text extracted from document
- `docType` (string) - Document type: "aadhaar", "marksheet", "income", "bank", "enrollment", "caste", "disability", "photo"

**Output:**
```javascript
{
  isValid: boolean,              // true if pattern matches
  keywordMatchRate: number,      // 0-100 percentage
  matchedKeywords: string,       // "3/5" format
  issues: string[],              // Pattern issues found
  score: number                  // 0-1 keyword match score
}
```

**Example:**
```javascript
const pattern = verifyDocumentPattern(text, "aadhaar");
console.log(`Match rate: ${pattern.keywordMatchRate}%`);
if (pattern.isValid) {
  console.log("Document pattern is valid");
}
```

---

## 6️⃣ `detectFakeDocumentIndicators(extractedText, file)`

**Purpose:** Detect fake document markers and suspicious content

**Input:**
- `extractedText` (string) - Text extracted from document
- `file` (File) - JavaScript File object

**Output:**
```javascript
{
  hasSuspiciousIndicators: boolean,  // true if fake markers found
  indicators: [                       // Array of suspicious markers
    {
      severity: string,              // "high", "medium", "low"
      issue: string                  // Description of issue
    }
  ]
}
```

**Example:**
```javascript
const fakeCheck = detectFakeDocumentIndicators(text, file);
if (fakeCheck.hasSuspiciousIndicators) {
  fakeCheck.indicators.forEach(ind => {
    console.log(`[${ind.severity.toUpperCase()}] ${ind.issue}`);
  });
}
```

---

## 7️⃣ `verifyDocument(file, docType)` ⭐

**Purpose:** Complete document verification (main function)

**Input:**
- `file` (File) - JavaScript File object
- `docType` (string) - Document type

**Output:**
```javascript
{
  fileName: string,
  docType: string,
  timestamp: string,             // ISO timestamp
  overallStatus: string,         // "VERIFIED", "NEEDS_REVIEW", "REJECTED"
  trustScore: number,            // 0-100
  issues: string[],              // All issues found
  checks: {
    fileType: {
      isValid: boolean,
      issues: string[]
    },
    metadata: {
      width: number,
      height: number,
      aspectRatio: string,
      fileSize: number,
      uploadedAt: string
    },
    quality: {
      qualityScore: number,
      isHighQuality: boolean,
      issues: string[]
    },
    ocr: {
      success: boolean,
      textLength: number,
      confidence: number
    },
    pattern: {
      isValid: boolean,
      keywordMatchRate: number,
      matchedKeywords: string
    },
    fakeIndicators: {
      hasSuspiciousIndicators: boolean,
      indicators: []
    }
  }
}
```

**Example:**
```javascript
const result = await verifyDocument(file, "aadhaar");

switch(result.overallStatus) {
  case "VERIFIED":
    console.log("✅ Document approved");
    break;
  case "NEEDS_REVIEW":
    console.log("⚠️ Manual review needed");
    break;
  case "REJECTED":
    console.log("❌ Document rejected");
    result.issues.forEach(issue => console.log(`  - ${issue}`));
    break;
}

console.log(`Trust Score: ${result.trustScore}/100`);
```

---

## 8️⃣ `verifyMultipleDocuments(files, docTypes)`

**Purpose:** Verify multiple documents in batch

**Input:**
- `files` (File[]) - Array of File objects
- `docTypes` (string[]) - Array of document types (same length as files)

**Output:**
```javascript
Array of verification results (same format as verifyDocument)
```

**Example:**
```javascript
const files = [aadhaarFile, marksheetFile, incomeFile];
const types = ["aadhaar", "marksheet", "income"];

const results = await verifyMultipleDocuments(files, types);

results.forEach(result => {
  const status = result.overallStatus;
  console.log(`${result.fileName}: ${status} (${result.trustScore})`);
});
```

---

## 📊 Document Types

Supported document types:

| Type | ID | Pattern Keywords |
|------|----|----|
| Aadhaar Card | "aadhaar" | aadhaar, uid, issued, government |
| Mark Sheet | "marksheet" | marks, grade, score, subject, roll |
| Income Certificate | "income" | income, tehsildar, sdm, revenue |
| Bank Passbook | "bank" | bank, account, ifsc, statement |
| Enrollment Certificate | "enrollment" | enrollment, institution, university |
| Caste Certificate | "caste" | caste, sc, st, obc, community |
| Disability Certificate | "disability" | disability, certificate, authority |
| Passport Photo | "photo" | (image quality focused) |

---

## 🎯 Trust Score Calculation

```javascript
Base: 100 points

Deductions:
- File type issue: -10 per issue
- Low image quality: -15
- Invalid pattern: -20
- Fake indicators: -30
- OCR failure: -25

Formula: Max(0, Min(100, 100 - total_deductions))

Result Categories:
- 75-100: VERIFIED ✅
- 50-74: NEEDS_REVIEW ⚠️
- 0-49: REJECTED ❌
```

---

## ⚙️ Configuration Constants

Edit in `documentVerificationService.js`:

```javascript
const VERIFICATION_CONFIG = {
  maxFileSize: 2 * 1024 * 1024,        // 2MB
  allowedFormats: [
    'image/jpeg',
    'image/png',
    'application/pdf'
  ],
  minImageWidth: 200,
  minImageHeight: 200,
  qualityThreshold: 0.6,               // 60% minimum
};
```

---

## 🔗 Real-World Integration Examples

### Example 1: Upload Form
```javascript
async function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  setIsLoading(true);
  try {
    const result = await verifyDocument(file, 'aadhaar');
    
    if (result.overallStatus === 'REJECTED') {
      alert('Document rejected: ' + result.issues.join(', '));
    } else if (result.overallStatus === 'NEEDS_REVIEW') {
      alert('Document needs manual review');
    } else {
      alert('Document verified successfully!');
    }
    
    setVerificationResult(result);
  } finally {
    setIsLoading(false);
  }
}
```

### Example 2: Admin Dashboard
```javascript
function DocumentReviewPanel({ applicationId }) {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    loadApplicationDocuments(applicationId).then(async (docs) => {
      const verified = await Promise.all(
        docs.map(doc => verifyDocument(doc.file, doc.type))
      );
      setDocuments(verified);
    });
  }, [applicationId]);

  return (
    <div>
      {documents.map(doc => (
        <DocumentCard
          key={doc.fileName}
          status={doc.overallStatus}
          score={doc.trustScore}
          issues={doc.issues}
          onApprove={() => approveDocument(doc.fileName)}
          onReject={() => rejectDocument(doc.fileName)}
        />
      ))}
    </div>
  );
}
```

### Example 3: Batch Processing
```javascript
async function processApplicationDocuments(applicationId) {
  const app = await getApplication(applicationId);
  const requiredDocs = [
    { file: app.aadhaar, type: 'aadhaar' },
    { file: app.marksheet, type: 'marksheet' },
    { file: app.income, type: 'income' }
  ];

  const results = await verifyMultipleDocuments(
    requiredDocs.map(d => d.file),
    requiredDocs.map(d => d.type)
  );

  const summary = {
    verified: results.filter(r => r.overallStatus === 'VERIFIED').length,
    needsReview: results.filter(r => r.overallStatus === 'NEEDS_REVIEW').length,
    rejected: results.filter(r => r.overallStatus === 'REJECTED').length,
    avgTrustScore: results.reduce((sum, r) => sum + r.trustScore, 0) / results.length
  };

  return summary;
}
```

---

## 🐛 Error Handling

```javascript
try {
  const result = await verifyDocument(file, 'aadhaar');
  
  if (!result) {
    console.error('Verification returned null');
  }
  
  if (result.issues && result.issues.length > 0) {
    console.warn('Issues found:', result.issues);
  }
  
} catch (error) {
  console.error('Verification error:', error);
  // Handle error - maybe show fallback option
}
```

---

## 📈 Performance Tips

```javascript
// ✅ Good: Process one at a time with feedback
for (const file of files) {
  const result = await verifyDocument(file, type);
  updateUI(result);
}

// ✅ Better: Batch process all
const results = await verifyMultipleDocuments(files, types);
updateUI(results);

// ❌ Avoid: Parallel processing (too many OCR models)
// Promise.all(files.map(f => verifyDocument(f, type)))
```

---

## 📚 Type Definitions (if using TypeScript)

```typescript
interface VerificationResult {
  fileName: string;
  docType: string;
  timestamp: string;
  overallStatus: 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED';
  trustScore: number;
  issues: string[];
  checks: {
    fileType: FileTypeCheck;
    metadata: ImageMetadata;
    quality: ImageQuality;
    ocr: OCRResult;
    pattern: PatternMatch;
    fakeIndicators: FakeIndicators;
  };
}

interface FileTypeCheck {
  isValid: boolean;
  issues: string[];
  fileType: string;
  fileSize: number;
}

interface ImageMetadata {
  width: number;
  height: number;
  aspectRatio: string;
  fileSize: number;
  uploadedAt: string;
}

interface ImageQuality {
  qualityScore: number;
  isHighQuality: boolean;
  issues: string[];
}

interface OCRResult {
  success: boolean;
  textLength: number;
  confidence: number;
}

interface PatternMatch {
  isValid: boolean;
  keywordMatchRate: number;
  matchedKeywords: string;
}

interface FakeIndicators {
  hasSuspiciousIndicators: boolean;
  indicators: Array<{
    severity: 'high' | 'medium' | 'low';
    issue: string;
  }>;
}
```

---

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** ✅ Production Ready  
**License:** Free to use
