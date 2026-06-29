import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import StudentSidebar from "./StudentSidebar";
import { verifyDocument } from "../documentVerificationService";
import "../styles/Dashboard.css";
import "../styles/UploadDocuments.css";

const REQUIRED_DOCS = [
  { id: "aadhaar", label: "Aadhaar Card", desc: "Front and back of Aadhaar card", required: true, formats: "PDF/JPG/PNG", maxSize: "2MB" },
  { id: "marksheet", label: "Latest Mark Sheet", desc: "Mark sheet of last qualifying exam", required: true, formats: "PDF/JPG/PNG", maxSize: "2MB" },
  { id: "income", label: "Income Certificate", desc: "Issued by Tehsildar/SDM/Revenue Officer", required: true, formats: "PDF/JPG/PNG", maxSize: "2MB" },
  { id: "caste", label: "Caste Certificate", desc: "For SC/ST/OBC applicants only", required: false, formats: "PDF/JPG/PNG", maxSize: "2MB" },
  { id: "bank", label: "Bank Passbook / Statement", desc: "First page showing name and account number", required: true, formats: "PDF/JPG/PNG", maxSize: "2MB" },
  { id: "photo", label: "Passport Photograph", desc: "Recent passport-size colour photograph", required: true, formats: "JPG/PNG", maxSize: "500KB" },
  { id: "enrollment", label: "Enrollment Certificate", desc: "Issued by current institution", required: true, formats: "PDF/JPG/PNG", maxSize: "2MB" },
  { id: "disability", label: "Disability Certificate", desc: "If applicable — from competent authority", required: false, formats: "PDF/JPG/PNG", maxSize: "2MB" },
];

export default function UploadDocuments({ user, onLogout }) {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState({});
  const [saved, setSaved] = useState(false);
  const [verificationResults, setVerificationResults] = useState({});
  const [verifyingDocs, setVerifyingDocs] = useState({});

  const handleFileChange = async (docId, file) => {
    if (!file) return;
    
    // Show uploading status
    setUploads(prev => ({ ...prev, [docId]: { name: file.name, size: (file.size / 1024).toFixed(0) + " KB", status: "verifying" } }));
    setVerifyingDocs(prev => ({ ...prev, [docId]: true }));

    try {
      // Perform document verification
      const result = await verifyDocument(file, docId);
      
      // Update verification results
      setVerificationResults(prev => ({ ...prev, [docId]: result }));
      
      // Update upload status
      const isApproved = result.overallStatus === "VERIFIED";
      setUploads(prev => ({ ...prev, [docId]: { 
        name: file.name, 
        size: (file.size / 1024).toFixed(0) + " KB", 
        status: isApproved ? "verified" : "needs_review",
        trustScore: result.trustScore,
        verificationStatus: result.overallStatus
      } }));
    } catch (error) {
      console.error("Verification error:", error);
      setUploads(prev => ({ ...prev, [docId]: { name: file.name, size: (file.size / 1024).toFixed(0) + " KB", status: "error" } }));
    } finally {
      setVerifyingDocs(prev => ({ ...prev, [docId]: false }));
    }
  };

  const handleSave = () => {
    const required = REQUIRED_DOCS.filter(d => d.required);
    const uploaded = required.filter(d => uploads[d.id]);
    
    // Check if all required documents are uploaded
    if (uploaded.length < required.length) {
      alert(`Please upload all required documents. Missing ${required.length - uploaded.length} required document(s).`);
      return;
    }

    // Check verification status
    let rejectedCount = 0;
    let needsReviewCount = 0;
    const rejectedDocs = [];

    for (const doc of uploaded) {
      const verification = verificationResults[doc.id];
      if (verification) {
        if (verification.overallStatus === "REJECTED") {
          rejectedCount++;
          rejectedDocs.push(doc.label);
        } else if (verification.overallStatus === "NEEDS_REVIEW") {
          needsReviewCount++;
        }
      }
    }

    if (rejectedCount > 0) {
      alert(`⚠️ ${rejectedCount} document(s) failed verification and cannot be submitted:\n${rejectedDocs.join('\n')}\n\nPlease re-upload with clear, original documents.`);
      return;
    }

    if (needsReviewCount > 0) {
      const proceed = confirm(`⚠️ ${needsReviewCount} document(s) need manual review. Continue anyway?`);
      if (!proceed) return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-wrapper">
      <Navbar user={user} onLogout={onLogout} />
      <div className="dashboard-layout">
        <StudentSidebar user={user} onLogout={() => { onLogout(); navigate("/"); }} />
        <main className="dashboard-main">
          <div className="dash-header">
            <div>
              <h2>📁 Upload Documents</h2>
              <p>Upload all required documents in PDF/Image format. Max file size: 2MB per document.</p>
            </div>
          </div>

          {saved && <div className="alert alert-success" style={{ marginBottom: 16 }}>✅ Documents saved successfully!</div>}

          <div className="alert alert-warning" style={{ marginBottom: 20 }}>
            ⚠️ Documents must be clear, legible, and in the applicant's name. Blurry or incomplete documents will be rejected.
          </div>

          <div className="docs-grid">
            {REQUIRED_DOCS.map((doc) => {
              const uploaded = uploads[doc.id];
              const verification = verificationResults[doc.id];
              const isVerifying = verifyingDocs[doc.id];
              
              return (
                <div key={doc.id} className={`doc-card ${uploaded ? "uploaded" : ""}`}>
                  <div className="doc-card-top">
                    <div className="doc-icon">
                      {isVerifying ? "⏳" : uploaded ? "✅" : "📄"}
                    </div>
                    <div className="doc-info">
                      <div className="doc-label">
                        {doc.label}
                        {doc.required && <span className="doc-required">*</span>}
                      </div>
                      <div className="doc-desc">{doc.desc}</div>
                      <div className="doc-meta">
                        <span>Format: {doc.formats}</span>
                        <span>Max: {doc.maxSize}</span>
                      </div>
                    </div>
                  </div>

                  {uploaded ? (
                    <div className="doc-uploaded">
                      <div className="doc-file-info">
                        <span className="doc-filename">📎 {uploaded.name}</span>
                        <span className="doc-filesize">{uploaded.size}</span>
                      </div>

                      {isVerifying && (
                        <div style={{ marginTop: 12, padding: 8, background: "#FEF3C7", borderRadius: 4, fontSize: 12, color: "#92400E" }}>
                          ⏳ Verifying document authenticity...
                        </div>
                      )}

                      {verification && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ 
                            padding: 8, 
                            borderRadius: 4, 
                            marginBottom: 8,
                            background: verification.overallStatus === "VERIFIED" ? "#DBEAFE" : 
                                       verification.overallStatus === "REJECTED" ? "#FEE2E2" : "#FEF3C7",
                            border: verification.overallStatus === "VERIFIED" ? "1px solid #0284C7" : 
                                   verification.overallStatus === "REJECTED" ? "1px solid #DC2626" : "1px solid #CA8A04"
                          }}>
                            <div style={{ 
                              fontSize: 12, 
                              fontWeight: 600,
                              color: verification.overallStatus === "VERIFIED" ? "#0C4A6E" : 
                                     verification.overallStatus === "REJECTED" ? "#7F1D1D" : "#713F12"
                            }}>
                              {verification.overallStatus === "VERIFIED" ? "✅ Verified" : 
                               verification.overallStatus === "REJECTED" ? "❌ Rejected" : 
                               "⚠️ Needs Review"}
                            </div>
                            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.9 }}>
                              Trust Score: {verification.trustScore}/100
                            </div>
                          </div>

                          {verification.issues.length > 0 && (
                            <div style={{ 
                              fontSize: 11, 
                              background: "#F3F4F6", 
                              padding: 8, 
                              borderRadius: 4, 
                              marginBottom: 8,
                              color: "#374151"
                            }}>
                              <strong>Issues:</strong>
                              <ul style={{ margin: "4px 0 0 16px", paddingLeft: 0 }}>
                                {verification.issues.map((issue, idx) => (
                                  <li key={idx} style={{ marginTop: 2 }}>
                                    {issue}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      <button className="btn-remove" onClick={() => {
                        setUploads(prev => { const n = { ...prev }; delete n[doc.id]; return n; });
                        setVerificationResults(prev => { const n = { ...prev }; delete n[doc.id]; return n; });
                      }}>
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <label className="doc-upload-label">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{ display: "none" }}
                        onChange={e => handleFileChange(doc.id, e.target.files[0])}
                        disabled={isVerifying}
                      />
                      <span className="doc-upload-btn">{isVerifying ? "⏳ Verifying..." : "⬆ Choose File"}</span>
                      <span className="doc-upload-hint">or drag &amp; drop here</span>
                    </label>
                  )}
                </div>
              );
            })}
          </div>

          <div className="docs-footer">
            <div className="docs-progress">
              <span>Uploaded: <strong>{Object.keys(uploads).length}</strong> / {REQUIRED_DOCS.length} documents</span>
              <span>Required: <strong>{REQUIRED_DOCS.filter(d => d.required && !uploads[d.id]).length}</strong> pending</span>
            </div>
            <button className="btn-gov" style={{ width: "auto" }} onClick={handleSave}>💾 Save All Documents</button>
          </div>

          <div style={{ marginTop: 20, background: "white", border: "1px solid #CBD5E1", borderRadius: 8, padding: 16, fontSize: 12, color: "#4a5568", lineHeight: 1.7 }}>
            <strong style={{ color: "#003580" }}>📋 Guidelines:</strong><br />
            • All documents must be self-attested by the applicant.<br />
            • Documents can also be uploaded via DigiLocker — click "Fetch from DigiLocker" during application.<br />
            • Ensure file names do not contain special characters.<br />
            • Do not upload password-protected PDF files.
          </div>
        </main>
      </div>
    </div>
  );
}
