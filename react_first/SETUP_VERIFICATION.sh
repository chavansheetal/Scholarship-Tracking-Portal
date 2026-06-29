#!/bin/bash
# Document Verification System - Setup Script

echo "🚀 Installing Document Verification System..."
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js first."
    exit 1
fi

echo "📦 Installing tesseract.js dependency..."
npm install tesseract.js

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 What was installed:"
echo "  - documentVerificationService.js (Core verification logic)"
echo "  - Updated UploadDocuments.jsx (UI with verification)"
echo "  - tesseract.js library (FREE OCR engine)"
echo "  - Updated CSS for verification status display"
echo ""
echo "🎯 Features:"
echo "  ✅ Automatic document authenticity verification"
echo "  ✅ OCR text extraction using Tesseract.js"
echo "  ✅ Image quality analysis"
echo "  ✅ Document pattern matching"
echo "  ✅ Fake document detection"
echo "  ✅ Trust score calculation (0-100)"
echo "  ✅ Real-time verification feedback"
echo ""
echo "💰 Cost: COMPLETELY FREE (No API charges!)"
echo ""
echo "🚀 Ready to use! Start your dev server with:"
echo "   npm run dev"
echo ""
