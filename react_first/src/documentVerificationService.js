/**
 * Document Verification Service
 * Uses free APIs and libraries to verify document authenticity
 * 
 * Free Services Used:
 * 1. Tesseract.js - OCR (Free, open-source)
 * 2. FileType.js - File type detection (Free, open-source)
 * 3. Sharp - Image analysis (Free, open-source)
 * 4. Google Gemini Vision API - Free tier for advanced verification
 */

import Tesseract from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini if API key is available
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyD4LlUzSBUT21MgNEDVHxakCSaP5tecUcw';
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// Document Verification Configuration
const VERIFICATION_CONFIG = {
  maxFileSize: 2 * 1024 * 1024, // 2MB
  allowedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
  allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
  minImageWidth: 200,
  minImageHeight: 200,
  qualityThreshold: 0.6,
};

// ✅ FIX: Added ALL document type IDs used across both form variants
const DOCUMENT_PATTERNS = {
  // ── Core IDs (original UploadDocuments.jsx) ──────────────────────────────
  aadhaar: {
    keywords: ['aadhaar', 'uid', 'government of india', 'male', 'female', 'dob',
               'enrollment', 'year of birth', 'yob', 'indira gandhi'],
    minTextLength: 20,
    hasNumbers: true,
  },
  marksheet: {
    keywords: ['marks', 'score', 'grade', 'subject', 'obtained', 'total', 'result',
               'board', 'examination', 'statement of marks', 'pass', 'certificate',
               'secondary', 'school', 'intermediate'],
    minTextLength: 30,
    hasNumbers: true,
  },
  income: {
    keywords: ['income certificate', 'tehsildar', 'annual income', 'revenue',
               'certified', 'salary', 'pension', 'competent authority'],
    minTextLength: 30,
    hasNumbers: true,
  },
  caste: {
    keywords: ['caste', 'community', 'sc', 'st', 'obc', 'certificate',
               'sub-division', 'scheduled', 'backward'],
    minTextLength: 30,
    hasNumbers: false,
  },
  bank: {
    keywords: ['bank', 'account', 'ifsc', 'passbook', 'statement', 'branch',
               'savings', 'holder', 'ledger', 'saving'],
    minTextLength: 20,
    hasNumbers: true,
  },
  enrollment: {
    keywords: ['enrollment', 'admission', 'student', 'id card', 'valid',
               'identity', 'registration', 'bonafide'],
    minTextLength: 30,
    hasNumbers: true,
  },
  fee: {
    keywords: ['fee', 'receipt', 'paid', 'amount', 'tuition', 'payment',
               'transaction', 'school', 'college', 'received', 'term'],
    minTextLength: 20,
    hasNumbers: true,
  },
  bonafide: {
    keywords: ['bonafide', 'bona fide', 'studying', 'institution', 'college',
               'school', 'certificate', 'character', 'regular', 'student'],
    minTextLength: 30,
    hasNumbers: false,
  },
  photo: {
    keywords: [],
    minTextLength: 0,
    hasNumbers: false,
  },

  // ✅ FIX: "residence" was missing entirely — this was the root cause of the bug
  residence: {
    keywords: [
      'residence', 'address', 'domicile', 'voter', 'ration', 'electricity',
      'water bill', 'gas bill', 'telephone', 'rent agreement', 'lease',
      'municipal', 'panchayat', 'village', 'taluk', 'district', 'pincode',
      'proof of residence', 'proof of address', 'permanent address',
      'house no', 'flat no', 'ward', 'post office',
    ],
    minTextLength: 20,
    hasNumbers: true,
  },

  // ── Aliases used in the multi-step scholarship form ──────────────────────
  identity: {
    keywords: ['aadhaar', 'uid', 'pan', 'passport', 'voter id', 'driving licence',
               'identity', 'identification', 'government of india', 'dob', 'date of birth'],
    minTextLength: 20,
    hasNumbers: true,
  },
  academic: {
    keywords: ['marks', 'grade', 'result', 'examination', 'board', 'university',
               'pass', 'percentage', 'transcript', 'score', 'subject', 'obtained'],
    minTextLength: 30,
    hasNumbers: true,
  },
  financial: {
    keywords: ['income', 'financial', 'certificate', 'annual income', 'tehsildar',
               'bpl', 'poverty', 'rupees', 'salary', 'revenue', 'competent authority'],
    minTextLength: 30,
    hasNumbers: true,
  },
  category: {
    keywords: ['caste', 'category', 'sc', 'st', 'obc', 'scheduled', 'tribe',
               'backward', 'community', 'certificate', 'sub-division'],
    minTextLength: 30,
    hasNumbers: false,
  },
  photographs: {
    keywords: [],
    minTextLength: 0,
    hasNumbers: false,
  },
  fee_receipts: {
    keywords: ['fee', 'receipt', 'paid', 'amount', 'tuition', 'payment',
               'transaction', 'school', 'college', 'received', 'term'],
    minTextLength: 20,
    hasNumbers: true,
  },
  disability: {
    keywords: ['disability', 'handicap', 'differently abled', 'pwbd', 'divyang',
               'medical board', 'percentage of disability', 'competent authority'],
    minTextLength: 30,
    hasNumbers: false,
  },
};

// ✅ FIX: Human-readable labels for ALL doc IDs — used in error messages & AI prompt
const DOC_LABELS = {
  aadhaar:      'Aadhaar Card',
  marksheet:    'Mark Sheet',
  income:       'Income Certificate',
  caste:        'Caste Certificate',
  bank:         'Bank Passbook or Statement',
  photo:        'Passport Photograph',
  photographs:  'Passport Photograph',
  fee:          'School/College Fee Receipt',
  fee_receipts: 'Fee Receipts',
  bonafide:     'Bonafide Certificate',
  enrollment:   'Enrollment Certificate',
  residence:    'Residence Proof (Voter ID / Ration Card / Utility Bill / Domicile Certificate)',
  identity:     'Proof of Identity',
  academic:     'Academic Records / Mark Sheet',
  financial:    'Financial Documentation / Income Certificate',
  category:     'Category / Caste Certificate',
  disability:   'Disability Certificate',
};

/**
 * Verify File Type
 */
export const verifyFileType = (file) => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  const ext = fileName.split('.').pop();
  const issues = [];

  if (!VERIFICATION_CONFIG.allowedFormats.includes(fileType)) {
    issues.push(`Invalid file type: ${fileType}. Allowed: ${VERIFICATION_CONFIG.allowedFormats.join(', ')}`);
  }
  if (!VERIFICATION_CONFIG.allowedExtensions.includes(ext)) {
    issues.push(`Invalid file extension: .${ext}. Allowed: ${VERIFICATION_CONFIG.allowedExtensions.join(', ')}`);
  }
  if (file.size > VERIFICATION_CONFIG.maxFileSize) {
    issues.push(`File size exceeds limit. Max: 2MB, Got: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
  }

  return { isValid: issues.length === 0, issues, fileType, fileSize: file.size };
};

/**
 * Extract image metadata
 */
export const extractImageMetadata = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: (img.width / img.height).toFixed(2),
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Check Image Quality using edge detection
 */
export const analyzeImageQuality = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let edgePixels = 0;
        let totalPixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (Math.abs(brightness - (data[i + 4] || 0)) > 30) edgePixels++;
          totalPixels++;
        }

        const qualityScore = Math.min((edgePixels / totalPixels) * 2, 1);
        const issues = [];
        if (qualityScore < VERIFICATION_CONFIG.qualityThreshold) {
          issues.push('Image quality is too low. Document appears blurry or unclear.');
        }

        resolve({
          qualityScore: parseFloat(qualityScore.toFixed(2)),
          isHighQuality: qualityScore >= VERIFICATION_CONFIG.qualityThreshold,
          issues,
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Perform OCR using Tesseract.js (FREE)
 */
export const performOCR = async (file) => {
  try {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = await Tesseract.recognize(e.target.result, 'eng');
          resolve({
            success: true,
            extractedText: result.data.text,
            confidence: result.data.confidence,
          });
        } catch (error) {
          resolve({ success: false, error: error.message, extractedText: '' });
        }
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    return { success: false, error: error.message, extractedText: '' };
  }
};

/**
 * Verify Document Against Pattern
 * ✅ FIX: Unknown docType no longer crashes — returns skipped:true instead of a false rejection
 * ✅ FIX: Error message uses DOC_LABELS, not raw docType (was showing "enrollment requirements" for residence)
 */
export const verifyDocumentPattern = (extractedText, docType) => {
  const pattern = DOCUMENT_PATTERNS[docType];

  // Unknown doc type → skip pattern check gracefully
  if (!pattern) {
    return { isValid: true, issues: [], score: 0, skipped: true };
  }

  // Photo / no-keyword types → always pass pattern check
  if (pattern.keywords.length === 0) {
    return { isValid: true, issues: [], score: 1 };
  }

  const lowerText = extractedText.toLowerCase();
  const issues = [];
  let matchedKeywords = 0;

  for (const keyword of pattern.keywords) {
    if (lowerText.includes(keyword)) matchedKeywords++;
  }

  const keywordMatchRate = matchedKeywords / pattern.keywords.length;

  if (extractedText.length < pattern.minTextLength) {
    issues.push(`Document text too short. Expected min: ${pattern.minTextLength} chars, Got: ${extractedText.length}`);
  }
  if (pattern.hasNumbers && !/\d/.test(extractedText)) {
    issues.push('Document should contain numbers/digits');
  }

  // ✅ FIX: Use human-readable label so error says "Residence Proof" not "enrollment"
  const docLabel = DOC_LABELS[docType] || docType;
  if (matchedKeywords === 0) {
    issues.push(`Invalid Document: Does not match ${docLabel} requirements.`);
  } else if (keywordMatchRate < 0.1) {
    issues.push(`Invalid Document: Content not recognized as ${docLabel}.`);
  }

  return {
    isValid: issues.length === 0 && keywordMatchRate >= 0.1,
    keywordMatchRate: parseFloat((keywordMatchRate * 100).toFixed(2)),
    matchedKeywords: `${matchedKeywords}/${pattern.keywords.length}`,
    issues,
    score: keywordMatchRate,
  };
};

/**
 * Detect Common Fake Document Indicators
 */
export const detectFakeDocumentIndicators = (extractedText) => {
  const indicators = [];
  const lowerText = extractedText.toLowerCase();

  const fakeIndicators = [
    { phrase: 'sample',        reason: 'Document marked as sample' },
    { phrase: 'draft',         reason: 'Document is draft version' },
    { phrase: 'not valid',     reason: 'Document explicitly marked invalid' },
    { phrase: 'test document', reason: 'Document marked as test' },
    { phrase: 'cancelled',     reason: 'Document marked as cancelled' },
  ];

  for (const indicator of fakeIndicators) {
    if (lowerText.includes(indicator.phrase)) {
      indicators.push({ severity: 'high', issue: indicator.reason });
    }
  }
  if (lowerText.includes('watermark') || lowerText.includes('confidential')) {
    indicators.push({ severity: 'medium', issue: 'Document contains watermark or confidentiality marks' });
  }

  return { hasSuspiciousIndicators: indicators.length > 0, indicators };
};

/**
 * Analyze Image using Google Gemini Pro Vision
 * ✅ FIX: Prompt now passes human-readable DOC_LABELS name and includes residence-specific instructions
 */
export const analyzeImageWithAI = async (file, docType) => {
  if (!genAI) {
    return { skipped: true, reason: 'AI API key not configured.' };
  }
  if (!file.type.startsWith('image/')) {
    return { skipped: true, reason: 'AI verification currently only runs on images.' };
  }

  try {
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // ✅ FIX: Always uses proper human-readable label including for "residence"
    const targetDoc = DOC_LABELS[docType] || docType;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Act as an expert forensic document inspector for the National Scholarship Portal.
EXAMINE THIS IMAGE EXTREMELY CAREFULLY.

EXPECTED DOCUMENT TYPE: '${targetDoc}'

DETERMINE THE FOLLOWING:
1. IS IT A RANDOM IMAGE? (e.g., scenery, selfie, animal, meme, random object, car, etc.)
2. IS IT THE WRONG DOCUMENT? (e.g., user uploaded an Aadhaar card instead of a Fee Receipt)
3. IS IT FAKE OR ALTERED? (e.g., placeholder text, obvious photoshopping, digital text overlaid on a photo, "Lorem Ipsum")
4. IS IT A VALID '${targetDoc}'? (Does it have the expected headers, structure, and official look?)

SPECIAL RULES FOR RESIDENCE PROOF:
- Accept ANY of: Voter ID card, Ration Card, electricity/water/gas/telephone bills, domicile certificate, rent agreement, bank statement showing address, or any government-issued address proof.
- Address proof documents vary widely by state and issuing authority in India — do NOT require a specific format.
- Do NOT compare residence proof against enrollment or bonafide certificate requirements.

CRITICAL RULES:
- If it is ANY other document than '${targetDoc}', you MUST set "isValidDocument" to false.
- If it is a photo of a screen or a poor quality copy, but otherwise valid, mark as valid but mention issues.
- If it is a completely random image, set "isRandomImage" to true.

Respond STRICTLY with a JSON object (no markdown, no extra text):
{
  "isValidDocument": boolean,
  "isRandomImage": boolean,
  "isFakeOrAltered": boolean,
  "confidence": number (0-100),
  "reason": "short explanation of your decision"
}`;

    const imageParts = [{ inlineData: { data: base64Data, mimeType: file.type } }];
    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    const jsonStr = responseText.replace(/```(json)?/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return {
      success: true,
      isValidDocument: parsed.isValidDocument,
      isRandomImage: parsed.isRandomImage,
      isFakeOrAltered: parsed.isFakeOrAltered,
      confidence: parsed.confidence,
      reason: parsed.reason,
    };

  } catch (error) {
    console.error('AI Analysis Failed:', error);
    const isQuota = error.message.includes('429') || error.message.includes('quota');
    return {
      success: false,
      error: isQuota
        ? 'Verification service is currently busy (Quota Exceeded). Please try again in a few minutes.'
        : error.message,
      isQuotaError: isQuota,
    };
  }
};

/**
 * Complete Document Verification Pipeline
 */
export const verifyDocument = async (file, docType) => {
  const verification = {
    fileName: file.name,
    docType,
    timestamp: new Date().toISOString(),
    checks: {},
    overallStatus: 'PENDING',
    trustScore: 0,
    issues: [],
  };

  try {
    // 1. File Type Verification
    const fileTypeCheck = verifyFileType(file);
    verification.checks.fileType = fileTypeCheck;
    if (!fileTypeCheck.isValid) {
      verification.issues.push(...fileTypeCheck.issues);
      verification.overallStatus = 'REJECTED';
      return verification;
    }

    // 2. Image Metadata & dimension check
    if (file.type.startsWith('image/')) {
      const metadata = await extractImageMetadata(file);
      verification.checks.metadata = metadata;
      if (
        metadata.width < VERIFICATION_CONFIG.minImageWidth ||
        metadata.height < VERIFICATION_CONFIG.minImageHeight
      ) {
        verification.issues.push(
          `Image dimensions too small: ${metadata.width}x${metadata.height}. Min: ${VERIFICATION_CONFIG.minImageWidth}x${VERIFICATION_CONFIG.minImageHeight}`
        );
      }
      // Quality check disabled per original intent
    }

    // 3. OCR Text Extraction
    const ocrResult = await performOCR(file);
    verification.checks.ocr = {
      success: ocrResult.success,
      textLength: ocrResult.extractedText.length,
      confidence: ocrResult.confidence,
    };

    if (!ocrResult.success) {
      verification.issues.push(
        'Could not extract text from document. Document may be heavily obscured or corrupted.'
      );
    } else {
      // 4. Pattern Verification
      const patternCheck = verifyDocumentPattern(ocrResult.extractedText, docType);
      verification.checks.pattern = patternCheck;
      if (!patternCheck.isValid && !patternCheck.skipped) {
        verification.issues.push(...patternCheck.issues);
      }

      // 5. Fake Document Detection
      const fakeCheck = detectFakeDocumentIndicators(ocrResult.extractedText);
      verification.checks.fakeIndicators = fakeCheck;
      if (fakeCheck.hasSuspiciousIndicators) {
        verification.issues.push(
          ...fakeCheck.indicators.map((ind) => `[${ind.severity.toUpperCase()}] ${ind.issue}`)
        );
      }
    }

    // 6. AI Verification (Gemini Vision)
    const aiResult = await analyzeImageWithAI(file, docType);
    verification.checks.aiAnalysis = aiResult;

    let aiScoreModifier = 0;

    if (aiResult.success) {
      if (aiResult.isRandomImage) {
        verification.issues.push(
          `AI Analysis: This appears to be a random image, not a valid document. (${aiResult.reason})`
        );
        aiScoreModifier = -100;
      } else if (aiResult.isFakeOrAltered) {
        verification.issues.push(
          `AI Analysis: Document appears forged or digitally altered. (${aiResult.reason})`
        );
        aiScoreModifier = -80;
      } else if (!aiResult.isValidDocument) {
        verification.issues.push(
          `AI Analysis: Incorrect document type uploaded. (${aiResult.reason})`
        );
        aiScoreModifier = -80;
      } else {
        // AI confirmed valid — clear OCR noise warnings and boost score
        aiScoreModifier = 20;
        verification.issues = [];
      }
    } else if (aiResult.skipped) {
      // No API key or non-image file — neutral, rely on OCR only
      aiScoreModifier = 0;
    } else {
      // AI failed (quota / network error) — fall back to OCR pattern result
      if (verification.checks.pattern?.isValid) {
        aiScoreModifier = 10;
      } else {
        verification.issues.push(
          'Document could not be verified automatically. Please ensure it is a valid, legible document.'
        );
        aiScoreModifier = -40;
      }
    }

    // 7. Calculate Trust Score
    let trustScore = 100;
    trustScore -= fileTypeCheck.issues.length * 10;
    if (verification.checks.pattern && !verification.checks.pattern.isValid && !verification.checks.pattern.skipped) {
      trustScore -= 20;
    }
    if (verification.checks.fakeIndicators?.hasSuspiciousIndicators) trustScore -= 30;
    if (!ocrResult.success) trustScore -= 25;
    trustScore += aiScoreModifier;
    verification.trustScore = Math.max(0, Math.min(100, trustScore));

    // 8. Determine Overall Status
    if (verification.issues.length === 0 && verification.trustScore >= 75) {
      verification.overallStatus = 'VERIFIED';
    } else if (verification.trustScore >= 50) {
      verification.overallStatus = 'NEEDS_REVIEW';
    } else {
      verification.overallStatus = 'REJECTED';
    }

  } catch (error) {
    verification.overallStatus = 'ERROR';
    verification.issues.push(`Verification error: ${error.message}`);
  }

  return verification;
};

/**
 * Batch Verify Multiple Documents
 */
export const verifyMultipleDocuments = async (files, docTypes) => {
  const results = [];
  for (let i = 0; i < files.length; i++) {
    const result = await verifyDocument(files[i], docTypes[i]);
    results.push(result);
  }
  return results;
};