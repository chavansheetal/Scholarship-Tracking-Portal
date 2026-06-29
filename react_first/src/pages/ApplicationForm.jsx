import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import StudentSidebar from "./StudentSidebar";
import { saveApplication, getApplicationsByUser, getUserByAppId, uploadDocument, checkAadhaarInApplications } from "../store";
import { verifyDocument } from "../documentVerificationService";
import { sendApplicationConfirmationEmail } from "../emailService";
import "../styles/Dashboard.css";
import "../styles/ApplicationForm.css";

const STEPS = ["Personal Details", "Academic Info", "Bank Details", "Upload Documents", "Preview & Submit"];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh",
];

// Income bracket options shown in dropdown
const INCOME_OPTIONS = [
  { label: "-- Select Annual Family Income --", value: "" },
  { label: "Below ₹1,00,000", value: 100000 },
  { label: "₹1,00,001 – ₹1,50,000", value: 150000 },
  { label: "₹1,50,001 – ₹2,00,000", value: 200000 },
  { label: "₹2,00,001 – ₹2,50,000", value: 250000 },
  { label: "₹2,50,001 – ₹3,50,000", value: 350000 },
  { label: "₹3,50,001 – ₹4,50,000", value: 450000 },
  { label: "₹4,50,001 – ₹6,00,000", value: 600000 },
  { label: "Above ₹6,00,000", value: 999999 },
  { label: "BPL (Below Poverty Line) Card Holder", value: "BPL" },
];

// Income limit per scholarship (null = no limit)
const SCHOLARSHIP_RULES = [
  { name: "Central Sector Scheme (CSSS) — ₹20,000/yr",               minMarks: 80, maxIncome: 450000,  incomLabel: "₹4,50,000" },
  { name: "National Means Cum Merit (NMMS) — ₹12,000/yr",            minMarks: 55, maxIncome: 350000,  incomLabel: "₹3,50,000" },
  { name: "PM YASASVI Scholarship (Class 9-10) — ₹75,000/yr",        minMarks: 60, maxIncome: 250000,  incomLabel: "₹2,50,000" },
  { name: "PM YASASVI Scholarship (Class 11-12) — ₹1,25,000/yr",     minMarks: 60, maxIncome: 250000,  incomLabel: "₹2,50,000" },
  { name: "Post-Matric Scholarship (SC) — ₹23,400/yr",               minMarks: 50, maxIncome: 250000,  incomLabel: "₹2,50,000" },
  { name: "Pre-Matric Scholarship (SC) — ₹5,400/yr",                 minMarks: 40, maxIncome: 250000,  incomLabel: "₹2,50,000" },
  { name: "National Fellowship for ST — ₹37,200/yr",                 minMarks: 55, maxIncome: null,    incomLabel: "No Limit" },
  { name: "Post-Matric Scholarship (ST) — ₹23,400/yr",               minMarks: 50, maxIncome: 250000,  incomLabel: "₹2,50,000" },
  { name: "Maulana Azad National Fellowship — ₹31,000/yr",           minMarks: 55, maxIncome: 600000,  incomLabel: "₹6,00,000" },
  { name: "Pre-Matric Minority (Class 1-8) — ₹10,000/yr",            minMarks: 50, maxIncome: 100000,  incomLabel: "₹1,00,000" },
  { name: "Pre-Matric Minority (Class 9-10) — ₹13,500/yr",           minMarks: 50, maxIncome: 100000,  incomLabel: "₹1,00,000" },
  { name: "Post-Matric Minority — ₹17,000/yr",                       minMarks: 50, maxIncome: 200000,  incomLabel: "₹2,00,000" },
  { name: "Merit-cum-Means Minority — ₹25,000/yr",                   minMarks: 50, maxIncome: 250000,  incomLabel: "₹2,50,000" },
  { name: "Top Class Education (SC) — Full Tuition",                  minMarks: 60, maxIncome: 600000,  incomLabel: "₹6,00,000" },
  { name: "Incentive to Girls (Secondary Education) — ₹3,000/yr",    minMarks: 50, maxIncome: "BPL",   incomLabel: "BPL Families" },
  { name: "Top Class Disability Scholarship — ₹2,00,000/yr",         minMarks: 40, maxIncome: 600000,  incomLabel: "₹6,00,000" },
  { name: "National Overseas Scholarship (SC/OBC) — Full Cost",       minMarks: 60, maxIncome: 600000,  incomLabel: "₹6,00,000" },
  { name: "Rajiv Gandhi National Fellowship (SC/ST) — ₹31,000/yr",   minMarks: 55, maxIncome: null,    incomLabel: "No Limit" },
  { name: "Ishan Uday (Special NE Region) — ₹7,800/yr",              minMarks: 70, maxIncome: 450000,  incomLabel: "₹4,50,000" },
  { name: "PG Scholarship for University Rank Holders — ₹3,100/mo",  minMarks: 60, maxIncome: null,    incomLabel: "No Limit" },
];

const SCHOLARSHIPS = SCHOLARSHIP_RULES.map(r => r.name);

// Bank name → valid IFSC prefix(es) mapping
const BANK_IFSC_PREFIX = {
  "State Bank of India":       ["SBIN"],
  "Punjab National Bank":      ["PUNB"],
  "Bank of Baroda":            ["BARB"],
  "Canara Bank":               ["CNRB"],
  "Union Bank of India":       ["UBIN"],
  "Bank of India":             ["BKID"],
  "Indian Bank":               ["IDIB"],
  "Central Bank of India":     ["CBIN"],
  "Indian Overseas Bank":      ["IOBA"],
  "UCO Bank":                  ["UCBA"],
  "Bank of Maharashtra":       ["MAHB"],
  "Punjab & Sind Bank":        ["PSIB"],
  "HDFC Bank":                 ["HDFC"],
  "ICICI Bank":                ["ICIC"],
  "Axis Bank":                 ["UTIB"],
  "Kotak Mahindra Bank":       ["KKBK"],
  "IndusInd Bank":             ["INDB"],
  "Yes Bank":                  ["YESB"],
};

const AMOUNT_MAP = {
  "Central Sector Scheme (CSSS) — ₹20,000/yr": "₹20,000",
  "National Means Cum Merit (NMMS) — ₹12,000/yr": "₹12,000",
  "PM YASASVI Scholarship (Class 9-10) — ₹75,000/yr": "₹75,000",
  "PM YASASVI Scholarship (Class 11-12) — ₹1,25,000/yr": "₹1,25,000",
  "Post-Matric Scholarship (SC) — ₹23,400/yr": "₹23,400",
  "Pre-Matric Scholarship (SC) — ₹5,400/yr": "₹5,400",
  "National Fellowship for ST — ₹37,200/yr": "₹37,200",
  "Post-Matric Scholarship (ST) — ₹23,400/yr": "₹23,400",
  "Maulana Azad National Fellowship — ₹31,000/yr": "₹31,000",
  "Pre-Matric Minority (Class 1-8) — ₹10,000/yr": "₹10,000",
  "Pre-Matric Minority (Class 9-10) — ₹13,500/yr": "₹13,500",
  "Post-Matric Minority — ₹17,000/yr": "₹17,000",
  "Merit-cum-Means Minority — ₹25,000/yr": "₹25,000",
  "Top Class Education (SC) — Full Tuition": "Full Tuition",
  "Incentive to Girls (Secondary Education) — ₹3,000/yr": "₹3,000",
  "Top Class Disability Scholarship — ₹2,00,000/yr": "₹2,00,000",
  "National Overseas Scholarship (SC/OBC) — Full Cost": "Full Cost",
  "Rajiv Gandhi National Fellowship (SC/ST) — ₹31,000/yr": "₹31,000",
  "Ishan Uday (Special NE Region) — ₹7,800/yr": "₹7,800",
  "PG Scholarship for University Rank Holders — ₹3,100/mo": "₹3,100/mo",
};

// ─── Income eligibility checker ───────────────────────────────────────────────
function checkIncomeEligibility(scholarshipName, selectedIncomeValue) {
  if (!scholarshipName || selectedIncomeValue === "") return null;
  const rule = SCHOLARSHIP_RULES.find(r => r.name === scholarshipName);
  if (!rule) return null;

  const { maxIncome, incomLabel } = rule;
  const schemeName = scholarshipName.split(" — ")[0];

  if (maxIncome === null) return null;

  if (maxIncome === "BPL") {
    if (selectedIncomeValue !== "BPL") {
      return `Income Eligibility Failed for "${schemeName}".\n\nThis scholarship is exclusively for BPL (Below Poverty Line) card holders.\n\nYour selected income: ${INCOME_OPTIONS.find(o => o.value === selectedIncomeValue)?.label || selectedIncomeValue}\nRequired: BPL Card Holder`;
    }
    return null;
  }

  if (selectedIncomeValue === "BPL") return null;

  if (typeof selectedIncomeValue === "number" && selectedIncomeValue > maxIncome) {
    const selectedLabel = INCOME_OPTIONS.find(o => o.value === selectedIncomeValue)?.label || selectedIncomeValue;
    return `Income Eligibility Failed for "${schemeName}".\n\nMaximum annual family income allowed: ${incomLabel}\nYour selected income: ${selectedLabel}\n\nYour family income exceeds the eligibility limit for this scholarship. Please select a different scholarship that matches your income bracket.`;
  }

  return null;
}

// ─── Aadhaar Verhoeff Checksum ──────────────────────────────────────────────
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1], [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];
const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1], [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];
const VERHOEFF_INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

function validateAadhaar(aadhaar) {
  if (!/^\d{12}$/.test(aadhaar)) return false;
  if (aadhaar.startsWith("0") || aadhaar.startsWith("1")) return false;
  // Check for repeating digits (e.g. 888888888888)
  if (/^(\d)\1{11}$/.test(aadhaar)) return false;
  
  let c = 0;
  let invertedAadhaar = aadhaar.split("").reverse().map(Number);
  for (let i = 0; i < invertedAadhaar.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][invertedAadhaar[i]]];
  }
  return c === 0;
}

// ─── Inline income eligibility hint ──
function getIncomeHint(scholarshipName) {
  if (!scholarshipName) return null;
  const rule = SCHOLARSHIP_RULES.find(r => r.name === scholarshipName);
  if (!rule) return null;
  if (rule.maxIncome === null) return { text: "✅ No income limit for this scholarship.", color: "#16a34a" };
  if (rule.maxIncome === "BPL") return { text: "⚠️ Only BPL card holders are eligible for this scholarship.", color: "#b45309" };
  return { text: `ℹ️ Maximum annual family income for this scholarship: ${rule.incomLabel}`, color: "#1d4ed8" };
}

// ─── Income popup modal ────────────────────────────────────────────────────────
function IncomeErrorModal({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 14,
        maxWidth: 460,
        width: "90%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        overflow: "hidden",
        animation: "slideUp 0.2s ease",
      }}>
        <div style={{
          background: "linear-gradient(135deg, #dc2626, #b91c1c)",
          padding: "18px 22px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 28 }}>🚫</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>Income Eligibility Check Failed</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>National Scholarship Portal — Automated Verification</div>
          </div>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {message.split("\n").map((line, i) => (
            <p key={i} style={{
              margin: "0 0 6px",
              fontSize: line.startsWith("Income Eligibility Failed") ? 14 : 13,
              fontWeight: line.startsWith("Income Eligibility Failed") ? 700 : 400,
              color: line.startsWith("Income Eligibility Failed") ? "#991b1b" : "#374151",
            }}>{line || <br />}</p>
          ))}

          <div style={{
            marginTop: 14,
            background: "#fef3c7",
            border: "1px solid #fbbf24",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12,
            color: "#92400e",
          }}>
            💡 <strong>Tip:</strong> Use the <em>Check Eligibility</em> section in the sidebar to find scholarships matching your income bracket before applying.
          </div>
        </div>

        <div style={{
          padding: "14px 24px",
          borderTop: "1px solid #f3f4f6",
          display: "flex", justifyContent: "flex-end", gap: 10,
        }}>
          <button
            onClick={onClose}
            style={{
              background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "9px 22px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Change Selection
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}

function DuplicateAadhaarModal({ details, onClose }) {
  if (!details) return null;
  return (
    <div className="aadhaar-modal-overlay" style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(15, 23, 42, 0.75)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20
    }}>
      <div className="aadhaar-modal-card" style={{
        background: "#fff",
        borderRadius: 20,
        maxWidth: 500,
        width: "100%",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        animation: "modalZoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
      }}>
        <div style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
          padding: "24px 30px",
          position: "relative"
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.1 }}>
             <span style={{ fontSize: 120 }}>🛡️</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <div style={{ 
              width: 50, height: 50, background: "rgba(255,255,255,0.2)", 
              borderRadius: "50%", display: "flex", alignItems: "center", 
              justifyContent: "center", fontSize: 28, border: "1px solid rgba(255,255,255,0.3)"
            }}>
              🪪
            </div>
            <div>
              <h3 style={{ color: "#fff", margin: 0, fontSize: 18, fontWeight: 800 }}>Duplicate Aadhaar Detected</h3>
              <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: 12, fontWeight: 500 }}>National Scholarship Portal — Security Protocol</p>
            </div>
          </div>
        </div>

        <div style={{ padding: "30px" }}>
          <div style={{ 
            background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 12, 
            padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12
          }}>
            <span style={{ fontSize: 20 }}>🚫</span>
            <div style={{ fontSize: 14, color: "#9f1239", lineHeight: 1.6 }}>
              <strong>Policy Violation:</strong> One Aadhaar per student policy is strictly enforced.
              <p style={{ margin: "8px 0 0", fontSize: 13, opacity: 0.9 }}>
                The Aadhaar number you entered is already registered with another application.
              </p>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Conflict Details</div>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 15, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>Reference ID:</span>
                <span style={{ color: "#1e293b", fontSize: 13, fontWeight: 700 }}>{details.appId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>Status:</span>
                <span style={{ color: "#059669", fontSize: 13, fontWeight: 700 }}>Already Registered</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, background: "#f1f5f9", padding: 12, borderRadius: 10 }}>
            💡 <strong>What to do?</strong> If you believe this is an error, please login with your original Application ID or contact the NSP Helpdesk.
          </div>
        </div>

        <div style={{ padding: "20px 30px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
          <button 
            onClick={onClose}
            style={{
              background: "#1e3a8a", color: "#fff", border: "none", 
              padding: "12px 30px", borderRadius: 10, fontWeight: 700, 
              fontSize: 14, cursor: "pointer", transition: "all 0.2s",
              boxShadow: "0 4px 10px rgba(30, 58, 138, 0.25)"
            }}
          >
            Go Back & Correct
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalZoom {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Student Type Toggle (School / College) ────────────────────────────────────
function StudentTypeToggle({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 24 }}>
      <button
        type="button"
        onClick={() => onChange("school")}
        style={{
          padding: "9px 28px",
          border: "1.5px solid #1a3563",
          borderRight: value === "school" ? "1.5px solid #1a3563" : "none",
          borderRadius: "6px 0 0 6px",
          background: value === "school" ? "#1a3563" : "#fff",
          color: value === "school" ? "#fff" : "#1a3563",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        🏫 School Student
      </button>
      <button
        type="button"
        onClick={() => onChange("college")}
        style={{
          padding: "9px 28px",
          border: "1.5px solid #1a3563",
          borderLeft: value === "college" ? "1.5px solid #1a3563" : "none",
          borderRadius: "0 6px 6px 0",
          background: value === "college" ? "#1a3563" : "#fff",
          color: value === "college" ? "#fff" : "#1a3563",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        🎓 College Student
      </button>
    </div>
  );
}

export default function ApplicationForm({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [incomeError, setIncomeError] = useState("");
  const [aadhaarDuplicateDetails, setAadhaarDuplicateDetails] = useState(null);

  // ── NEW: student type state for Step 1 ──
  const [studentType, setStudentType] = useState("college"); // "school" | "college"
  const [generatedAppId, setGeneratedAppId] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  useEffect(() => {
    if (user && (user.id || user.appId)) {
      (async () => {
        try {
          const uid = user.id || user.appId;
          const apps = await getApplicationsByUser(user);
          if (apps && apps.length > 0) setHasExistingApplication(true);

          // Fetch full registration details and pre-fill the form
          const regUser = await getUserByAppId(uid);
          if (regUser) {
            setForm(prev => ({
              ...prev,
              fullName: regUser.fullName || prev.fullName,
              mobile: regUser.mobile || prev.mobile,
              email: regUser.email || prev.email,
            }));
          }
        } catch (err) {
          console.error("Error pre-filling form:", err);
        }
      })();
    }
  }, [user]);

  const preSelectedScholarship = location.state?.scholarshipName || "";

  const [form, setForm] = useState({
    scholarship: preSelectedScholarship,
    fullName: user?.name || "", dob: "", gender: "", aadhaar: "",
    mobile: user?.mobile || "", email: "", category: "", religion: "",
    state: "", district: "",
    disability: "No",
    annualIncome: "",
    // ── Shared academic fields ──
    instituteName: "", marks: "", boardUniv: "",
    // ── College-specific ──
    course: "", year: "", specialisation: "", courseDuration: "", courseDurationOther: "", academicYear: "", collegeState: "",
    // ── School-specific ──
    schoolClass: "", stream: "", lastExamClass: "", gradingSystem: "", schoolState: "", schoolAcademicYear: "",
    // ── Bank ──
    bankName: "", accountNo: "", ifsc: "", accountHolder: "",
    files: {},
    declaration: false,
  });



  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: false }));
  };

  // When student type changes, clear academic fields to avoid leftover data

  // When student type changes, clear academic fields to avoid leftover data
  const handleStudentTypeChange = (type) => {
    setStudentType(type);
    setErrors({});
    setForm(f => ({
      ...f,
      instituteName: "", marks: "", boardUniv: "",
      course: "", year: "", specialisation: "", courseDuration: "", courseDurationOther: "", academicYear: "", collegeState: "",
      schoolClass: "", stream: "", lastExamClass: "", gradingSystem: "", schoolState: "", schoolAcademicYear: "",
    }));
  };

  const handleIncomeChange = (val) => {
    const parsed = val === "BPL" ? "BPL" : val === "" ? "" : Number(val);
    set("annualIncome", parsed);
  };

  const handleFileUpload = async (e, docName) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Check for duplicates
      const existingDocs = Object.values(form.files || {});
      if (existingDocs.some(d => d && d.name === file.name)) {
        playErrorSound();
        alert(`🔔 AI Duplicate Detection: The document "${file.name}" has already been uploaded.`);
        e.target.value = "";
        return;
      }

      const fileUrl = URL.createObjectURL(file);
      
      // Update state to "scanning"
      setForm(prev => ({
        ...prev,
        files: { 
          ...prev.files, 
          [docName]: { name: file.name, status: "scanning", url: fileUrl } 
        }
      }));

      try {
        // Map UI name to service docType
        const docTypeMap = {
          "Proof of Identity": "aadhaar",
          "Academic Records": "marksheet",
          "Financial Documentation": "income",
          "Bank Account Details": "bank",
          "Residence Proof": "enrollment",
          "Photographs": "photo",
          "Category Certificate": "caste",
          "Disability Certificate": "marksheet",
          "Bonafide Certificate": "bonafide",
          "Fee Receipts": "fee"
        };
        const docType = docTypeMap[docName] || "enrollment";

        // Call the REAL verification service (Gemini + OCR)
        const result = await verifyDocument(file, docType);
        
        if (result.overallStatus === 'VERIFIED') {
          // Success - Document is what it claims to be
          setForm(prev => ({
            ...prev,
            files: {
              ...prev.files,
              [docName]: { 
                ...prev.files[docName], 
                status: "verified", 
                trustScore: result.trustScore
              }
            }
          }));
          
          // Process file for storage (compression for images)
          if (file.type.startsWith("image/")) {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              let { width, height } = img;
              const MAX = 480; // Ultra-compact but readable
              if (width > height && width > MAX) { height *= MAX / width; width = MAX; }
              else if (height > MAX) { width *= MAX / height; height = MAX; }
              canvas.width = width; canvas.height = height;
              canvas.getContext("2d").drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL("image/jpeg", 0.4);
              setForm(prev => ({
                ...prev,
                files: {
                  ...prev.files,
                  [docName]: { ...prev.files[docName], base64: compressed }
                }
              }));
            };
            img.src = fileUrl;
          } else {
            const reader = new FileReader();
            reader.onload = (ev) => {
              setForm(prev => ({
                ...prev,
                files: {
                  ...prev.files,
                  [docName]: { ...prev.files[docName], base64: ev.target.result }
                }
              }));
            };
            reader.readAsDataURL(file);
          }

        } else {
          // Failure - AI detected random image or wrong document
          playErrorSound();
          const reason = result.issues.length > 0 ? result.issues[0] : "Document content does not match requirements.";
          alert(`❌ Verification Failed for ${docName}:\n\n${reason}`);
          
          setForm(prev => ({
            ...prev,
            files: {
              ...prev.files,
              [docName]: { ...prev.files[docName], status: "rejected", reason: result.issues }
            }
          }));
          e.target.value = ""; 
        }
      } catch (err) {
        console.error("Verification Error:", err);
        alert("An error occurred during document scanning. Please check your internet connection and try again.");
        setForm(prev => ({
          ...prev,
          files: { ...prev.files, [docName]: null }
        }));
      }
    }
  };

  const playErrorSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
    } catch (e) { }
  };

  const validate = async () => {
    let newErrors = {};
    let msg = "";
    const missingErrors = [];

    if (step === 0) {
      // 1. Scholarship Selection
      if (!form.scholarship) { newErrors.scholarship = true; missingErrors.push("- Select a Scholarship Scheme"); }
      
      // 2. Full Name (Min 3 chars, no numbers/special chars)
      const nameRegex = /^[A-Za-z\s]{3,50}$/;
      if (!nameRegex.test(form.fullName)) { 
        newErrors.fullName = true; 
        missingErrors.push("- Enter a valid Full Name (min 3 letters, no numbers)"); 
      }
      
      // 3. Date of Birth (Age check: 3 to 35 years)
      if (!form.dob) { 
        newErrors.dob = true; missingErrors.push("- Date of Birth is required"); 
      } else {
        const birthDate = new Date(form.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
        if (age < 3 || age > 35) {
          newErrors.dob = true; 
          missingErrors.push("- Invalid Date of Birth (Age must be between 3 and 35 years)");
        }
      }
      
      // 4. Gender
      if (!form.gender) { newErrors.gender = true; missingErrors.push("- Select Gender"); }
      
      // 5. Aadhaar (Verhoeff Checksum + Sanity + Duplicate Check)
      const cleanAadhaar = form.aadhaar.trim();
      if (!validateAadhaar(cleanAadhaar)) { 
        newErrors.aadhaar = true; 
        missingErrors.push("- Enter a valid 12-digit Aadhaar Number (Check digit failed)"); 
      } else {
        try {
          const currentUserId = user?.id || user?.appId;
          
          // Check 1: Check in User Profiles
          const existingUser = await getUserByAadhaar(cleanAadhaar);
          if (existingUser && existingUser.id !== currentUserId) {
            newErrors.aadhaar = true;
            missingErrors.push(`- Aadhaar ${cleanAadhaar} is already linked to another account (ID: ${existingUser.id.substring(0, 4)}***).`);
          } else {
            // Check 2: Check in Applications (Crucial for blocking duplicates)
            const appDup = await checkAadhaarInApplications(cleanAadhaar, currentUserId);
            if (appDup && appDup.exists) {
              newErrors.aadhaar = true;
              setAadhaarDuplicateDetails(appDup);
              return "__AADHAAR_MODAL__";
            }
          }
        } catch (err) {
          console.error("Aadhaar duplicate check failed:", err);
        }
      }
      
      // 6. Mobile Number (Strict 10 digits starting with 6-9)
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(form.mobile)) { 
        newErrors.mobile = true; 
        missingErrors.push("- Enter a valid 10-digit Mobile Number (starts with 6-9)"); 
      }
      
      // 7. Email ID (Improved Regex)
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(form.email)) { 
        newErrors.email = true; 
        missingErrors.push("- Enter a valid Email ID (e.g. name@example.com)"); 
      }
      
      // 8. Category
      if (!form.category) { newErrors.category = true; missingErrors.push("- Select Category"); }

      // 9. State of Domicile
      if (!form.state) { newErrors.state = true; missingErrors.push("- Select State of Domicile"); }

      // 10. Religion
      if (!form.religion) { newErrors.religion = true; missingErrors.push("- Select Religion"); }

      // 11. Annual Family Income
      if (form.annualIncome === "" || form.annualIncome === null || form.annualIncome === undefined) {
        newErrors.annualIncome = true;
        missingErrors.push("- Select Annual Family Income");
      }

      if (missingErrors.length > 0) {
        msg = "Please correct the following errors:\n\n" + missingErrors.join("\n");
      } else {
        const incomeErr = checkIncomeEligibility(form.scholarship, form.annualIncome);
        if (incomeErr) {
          setErrors(newErrors);
          setIncomeError(incomeErr);
          return "__INCOME_MODAL__";
        }

      }
    }

    else if (step === 1) {
      const rule = SCHOLARSHIP_RULES.find(r => r.name === form.scholarship);

      if (studentType === "college") {
        // College validations
        if (form.instituteName.length < 2) { newErrors.instituteName = true; missingErrors.push("- Institution Name is required"); }
        if (form.course.length < 2) { newErrors.course = true; missingErrors.push("- Course / Programme is required"); }
        if (!form.year) { newErrors.year = true; missingErrors.push("- Select Year of Study"); }
        if (!form.boardUniv || form.boardUniv.length < 2) { newErrors.boardUniv = true; missingErrors.push("- University / Board is required"); }
        if (!form.courseDuration) { newErrors.courseDuration = true; missingErrors.push("- Select Course Duration"); }
        if (form.courseDuration === "Other" && (!form.courseDurationOther || form.courseDurationOther.length < 2)) {
          newErrors.courseDurationOther = true; missingErrors.push("- Specify 'Other' Course Duration"); 
        }
        // Academic Year Format (e.g. 2024-25 or 2024-2025)
        const ayRegex = /^20\d{2}-(20)?\d{2}$/;
        if (!ayRegex.test(form.academicYear)) {
          newErrors.academicYear = true;
          missingErrors.push("- Academic Year must be in YYYY-YY format (e.g. 2024-25)");
        } else {
          // Verify continuity (e.g. 2024-25 is ok, 2024-26 is not)
          const parts = form.academicYear.split("-");
          const start = parseInt(parts[0]);
          const endStr = parts[1];
          const end = endStr.length === 2 ? parseInt("20" + endStr) : parseInt(endStr);
          if (end !== start + 1) {
            newErrors.academicYear = true;
            missingErrors.push("- Academic Year range must be exactly one year (e.g. 2024-25)");
          }
        }
        if (!form.collegeState || form.collegeState.length < 2) { 
          newErrors.collegeState = true; 
          missingErrors.push("- State / UT is required for College/University"); 
        }

        if (!form.gradingSystem) { newErrors.gradingSystem = true; missingErrors.push("- Select Grading System"); }

        const marksVal = parseFloat(form.marks);
        if (!form.marks || isNaN(marksVal) || marksVal < 0 || marksVal > 100) {
          newErrors.marks = true; missingErrors.push("- Enter valid Percentage / CGPA");
        } else if (rule && marksVal < rule.minMarks) {
          newErrors.marks = true;
          const schemeName = form.scholarship.split(" — ")[0];
          msg = `Error:\n\n${schemeName} Eligibility Failed.\n\nRequired Minimum: ${rule.minMarks}%\nYour Marks: ${marksVal}%\n\nYour entered marks do not meet the eligibility conditions.`;
        }
      } else {
        // School validations
        if (form.instituteName.length < 2) { newErrors.instituteName = true; missingErrors.push("- School Name is required"); }
        if (!form.schoolClass) { newErrors.schoolClass = true; missingErrors.push("- Select Current Class / Grade"); }
        if (!form.boardUniv) { newErrors.boardUniv = true; missingErrors.push("- Select Board"); }
        if (!form.schoolState || form.schoolState.length < 2) { newErrors.schoolState = true; missingErrors.push("- State / UT is required"); }
        if (!form.lastExamClass) { newErrors.lastExamClass = true; missingErrors.push("- Select Last Exam Class"); }
        if (!form.gradingSystem) { newErrors.gradingSystem = true; missingErrors.push("- Select Grading System"); }
        if (!form.schoolAcademicYear || form.schoolAcademicYear.length < 4) { 
          newErrors.schoolAcademicYear = true; missingErrors.push("- Academic Year is required"); 
        } else if (!/^20\d{2}-(20)?\d{2}$/.test(form.schoolAcademicYear)) {
          newErrors.schoolAcademicYear = true; missingErrors.push("- Academic Year format invalid (e.g. 2024-25)");
        }

        const marksVal = parseFloat(form.marks);
        if (!form.marks || isNaN(marksVal) || marksVal < 0 || marksVal > 100) {
          newErrors.marks = true; missingErrors.push("- Enter valid Percentage / CGPA");
        } else if (rule && marksVal < rule.minMarks) {
          newErrors.marks = true;
          const schemeName = form.scholarship.split(" — ")[0];
          msg = `Error:\n\n${schemeName} Eligibility Failed.\n\nRequired Minimum: ${rule.minMarks}%\nYour Marks: ${marksVal}%\n\nYour entered marks do not meet the eligibility conditions.`;
        }
      }

      if (missingErrors.length > 0 && !msg) {
        msg = "Please correct the following errors:\n\n" + missingErrors.join("\n");
      }
      if (Object.keys(newErrors).length > 0 && !msg) msg = "Please fill all required Academic Information fields.";
    }

    else if (step === 2) {
      // 1. Account Holder (Letters only)
      const nameRegex = /^[A-Za-z\s]{3,50}$/;
      if (!nameRegex.test(form.accountHolder)) {
        newErrors.accountHolder = true;
        missingErrors.push("- Account Holder Name is required (letters only)");
      }

      // 2. Bank Name
      if (form.bankName.length < 3) {
        newErrors.bankName = true;
        missingErrors.push("- Select or enter a valid Bank Name");
      }

      // 3. Account Number (9 to 18 digits + Repetition Check)
      const accRegex = /^\d{9,18}$/;
      if (!accRegex.test(form.accountNo)) {
        newErrors.accountNo = true;
        missingErrors.push("- Enter a valid Bank Account Number (9-18 digits)");
      } else if (/^(\d)\1{5,}/.test(form.accountNo)) {
        // Reject if more than 5 identical digits repeat (e.g. 888888...)
        newErrors.accountNo = true;
        missingErrors.push("- Invalid Account Number (repetitive patterns detected)");
      }

      // 4. IFSC Code (Strict 11 chars: 4 letters, 0, 6 alpha-numeric)
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      const ifscUpper = form.ifsc.trim().toUpperCase();
      if (!ifscRegex.test(ifscUpper)) {
        newErrors.ifsc = true;
        missingErrors.push("- Enter a valid 11-digit IFSC Code (e.g. SBIN0001234)");
      } else {
        // 5. IFSC prefix must match the selected bank
        const expectedPrefixes = BANK_IFSC_PREFIX[form.bankName];
        if (expectedPrefixes && expectedPrefixes.length > 0) {
          const enteredPrefix = ifscUpper.substring(0, 4);
          if (!expectedPrefixes.includes(enteredPrefix)) {
            newErrors.ifsc = true;
            missingErrors.push(
              `- IFSC Code does not match "${form.bankName}". Expected prefix: ${expectedPrefixes.join(" or ")} (e.g. ${expectedPrefixes[0]}0001234)`
            );
          }
        }
      }

      if (missingErrors.length > 0) {
        msg = "Invalid Bank details:\n\n" + missingErrors.join("\n");
      }
    }

    else if (step === 3) {
      const requiredDocs = ["Proof of Identity", "Academic Records", "Financial Documentation", "Bank Account Details", "Residence Proof", "Photographs"];
      for (let doc of requiredDocs) {
        if (!form.files[doc] || form.files[doc].status !== "verified") {
          newErrors.files = true;
          msg = `Mandatory documents missing or still scanning: ${doc}`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return msg;
  };

  const handleNext = async () => {
    const errorMsg = await validate();
    if (errorMsg === "__INCOME_MODAL__" || errorMsg === "__MISMATCH_MODAL__" || errorMsg === "__AADHAAR_MODAL__") return;
    if (errorMsg) { alert(errorMsg); return; }
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    if (!form.declaration) { alert("You must accept the declaration."); return; }
    const appId = user?.id || user?.appId || `NSP/2025/KA/${Math.floor(10000 + Math.random() * 90000)}`;
    setGeneratedAppId(appId);
    const today = new Date().toLocaleDateString("en-IN");
    const incomeLabel = INCOME_OPTIONS.find(o => o.value === form.annualIncome)?.label || "—";

    // Build academic details based on student type
    const academicDetails = studentType === "college"
      ? {
          studentType: "College",
          instituteName: form.instituteName,
          course: form.course,
          specialisation: form.specialisation,
          year: form.year,
          marks: form.marks,
          gradingSystem: form.gradingSystem,
          boardUniv: form.boardUniv,
          courseDuration: form.courseDuration === "Other" ? form.courseDurationOther : form.courseDuration,
          academicYear: form.academicYear,
          state: form.collegeState,
        }
      : {
          studentType: "School",
          instituteName: form.instituteName,
          schoolClass: form.schoolClass,
          stream: form.stream,
          board: form.boardUniv,
          state: form.schoolState,
          lastExamClass: form.lastExamClass,
          marks: form.marks,
          gradingSystem: form.gradingSystem,
          academicYear: form.schoolAcademicYear,
        };


    const app = {
      appId, userId: user.id || user.appId,
      studentName: form.fullName,
      scheme: form.scholarship.split(" — ")[0],
      amount: AMOUNT_MAP[form.scholarship] || "—",
      status: "Submitted", appliedOn: today, updatedAt: new Date(), rejectionReason: "",
      personalDetails: {
        fullName: form.fullName, dob: form.dob, gender: form.gender,
        aadhaar: form.aadhaar, mobile: form.mobile, email: form.email,
        category: form.category, religion: form.religion,
        disability: form.disability,
        annualIncome: incomeLabel,
        fatherName: "",
        files: Object.fromEntries(Object.entries(form.files).map(([k, v]) => [k, { name: v.name, base64: v.base64 }]))
      },
      academicDetails,
      bankDetails: { accountHolder: form.accountHolder, bankName: form.bankName, accountNo: form.accountNo, ifsc: form.ifsc },
      timeline: [
        { step: "Application Submitted", date: today, done: true },
        { step: "Institute Verification", date: "Pending", done: false },
        { step: "State NOC", date: "—", done: false },
        { step: "Ministry Approval", date: "—", done: false },
        { step: "Amount Credited", date: "—", done: false },
      ],
    };
    const metadataOnly = {
      ...app,
      files: {}, 
      personalDetails: { ...app.personalDetails, files: {} }
    };

    (async () => {
      try {
        setUploadingFiles(true);
        setUploadProgress("Saving Application Details...");
        
        const result = await saveApplication(metadataOnly);
        if (result && (result.message === 'Application submitted' || result.message === 'Application updated' || result.application)) {
          
          const fileEntries = Object.entries(form.files);
          for (let i = 0; i < fileEntries.length; i++) {
            const [docType, fileInfo] = fileEntries[i];
            setUploadProgress(`Uploading ${docType} (${i+1}/${fileEntries.length})...`);
            await uploadDocument(appId, docType, { name: fileInfo.name, base64: fileInfo.base64 });
          }

          setSubmitted(true);
          
          // Send confirmation email
          sendApplicationConfirmationEmail(form.email, {
            appId,
            studentName: form.fullName,
            scheme: app.scheme,
            date: today
          });
        } else {
          alert("⚠️ Server Response: " + (result?.message || "Failed to save application."));
        }
      } catch (err) {
        console.error("Submit Error:", err);
        alert(`❌ Failed to submit: ${err.message}\n\nPlease refresh and try again.`);
      } finally {
        setUploadingFiles(false);
      }
    })();
  };

  const errorStyle = (key) => ({ borderColor: errors[key] ? "#d93025" : "", backgroundColor: errors[key] ? "#fff4f4" : "" });
  const incomeHint = getIncomeHint(form.scholarship);

  // ── Inline student type badge styles ──
  const schoolBadgeStyle = {
    display: "inline-block", fontSize: 12, fontWeight: 600,
    padding: "3px 14px", borderRadius: 20, marginBottom: 18,
    background: "#e6f1fb", color: "#185fa5",
  };
  const collegeBadgeStyle = {
    display: "inline-block", fontSize: 12, fontWeight: 600,
    padding: "3px 14px", borderRadius: 20, marginBottom: 18,
    background: "#e1f5ee", color: "#0f6e56",
  };

  if (submitted) return (
    <div className="page-wrapper">
      <Navbar user={user} onLogout={onLogout} />
      <div className="dashboard-layout">
        <StudentSidebar user={user} onLogout={() => { onLogout(); navigate("/"); }} />
        <main className="dashboard-main">
          <div className="submit-success">
            <div className="success-icon">🎉</div>
            <h2>Application Submitted Successfully!</h2>
            <div className="app-ref">Your Application ID: {generatedAppId}</div>
            <div className="success-actions">
              <Link to="/track" className="btn-gov" style={{ width: "auto", display: "inline-block", textDecoration: "none" }}>📊 Track Status</Link>
              <Link to="/dashboard" className="btn-gov" style={{ width: "auto", background: "#138808", display: "inline-block", textDecoration: "none" }}>🏠 Home</Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  if (hasExistingApplication) return (
    <div className="page-wrapper">
      <Navbar user={user} onLogout={onLogout} />
      <div className="dashboard-layout">
        <StudentSidebar user={user} onLogout={() => { onLogout(); navigate("/"); }} />
        <main className="dashboard-main">
          <div className="submit-success" style={{ textAlign: "center", marginTop: "50px", padding: "40px", background: "white", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            <div className="success-icon">⚠️</div>
            <h2 style={{ color: "#333", marginBottom: "15px" }}>Application Already Submitted</h2>
            <p style={{ margin: "15px 0", color: "#666", fontSize: "16px" }}>You have already submitted a scholarship application. Multiple applications are not allowed.</p>
            <p style={{ margin: "15px 0", color: "#666", fontSize: "16px" }}>If you need to update any details or uploaded documents, you can automatically update them by editing your profile.</p>
            <div className="success-actions" style={{ marginTop: "30px", display: "flex", gap: "15px", justifyContent: "center" }}>
              <Link to="/profile" className="btn-gov" style={{ width: "auto", display: "inline-block", textDecoration: "none" }}>👤 Go to My Profile</Link>
              <Link to="/dashboard" className="btn-gov" style={{ width: "auto", background: "#138808", display: "inline-block", textDecoration: "none" }}>🏠 Back to Home</Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Navbar user={user} onLogout={onLogout} />
      <div className="dashboard-layout">
        <StudentSidebar user={user} onLogout={() => { onLogout(); navigate("/"); }} />
        <main className="dashboard-main">

          {/* Income eligibility error modal */}
          <IncomeErrorModal message={incomeError} onClose={() => setIncomeError("")} />

          {/* Aadhaar Duplicate Modal */}
          <DuplicateAadhaarModal 
            details={aadhaarDuplicateDetails} 
            onClose={() => setAadhaarDuplicateDetails(null)} 
          />

          <div className="appform-header">
            <h2>📝 Scholarship Registration & Application Form</h2>
            <p>Academic Year 2026-27 | Fresh Application</p>
          </div>

          <div className="appform-steps">
            {STEPS.map((s, i) => (
              <div key={i} className={`appform-step ${i === step ? "active" : i < step ? "done" : ""}`}>
                <div className="appform-step-num">{i < step ? "✓" : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>

          <div className="appform-card">

            {/* ══ STEP 0 — Personal Details ══ */}
            {step === 0 && (
              <div className="appform-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ margin: 0 }}>Personal Details</h3>
                </div>

                <div className="form-group">
                  <label>Select Scholarship Scheme *</label>
                  <select style={errorStyle("scholarship")} value={form.scholarship} onChange={e => set("scholarship", e.target.value)}>
                    <option value="">-- Select Scholarship --</option>
                    {SCHOLARSHIPS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>


                <div className="form-row-2">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      style={errorStyle("fullName")}
                      type="text"
                      value={form.fullName}
                      onChange={e => set("fullName", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input
                      style={errorStyle("dob")}
                      type="date"
                      value={form.dob}
                      onChange={e => set("dob", e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      style={errorStyle("gender")}
                      value={form.gender}
                      onChange={e => set("gender", e.target.value)}
                    >
                      <option value="">-- Select --</option><option>Male</option><option>Female</option><option>Others</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Aadhaar Number (12 digits) *</label>
                    <input
                      style={errorStyle("aadhaar")}
                      type="text"
                      maxLength={12}
                      placeholder="12-digit Aadhaar Number"
                      value={form.aadhaar}
                      onChange={e => set("aadhaar", e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <input
                      style={errorStyle("mobile")}
                      type="tel"
                      maxLength={10}
                      value={form.mobile}
                      onChange={e => set("mobile", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email ID *</label>
                    <input
                      style={errorStyle("email")}
                      type="email"
                      value={form.email}
                      onChange={e => set("email", e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>State of Domicile *</label>
                    <select
                      style={errorStyle("state")}
                      value={form.state}
                      onChange={e => set("state", e.target.value)}
                    >
                      <option value="">-- Select State --</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Religion *</label>
                    <select style={errorStyle("religion")} value={form.religion} onChange={e => set("religion", e.target.value)}>
                      <option value="">-- Select --</option>
                      {["Hindu","Muslim","Christian","Sikh","Buddhist","Jain","Others"].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      style={errorStyle("category")}
                      value={form.category}
                      onChange={e => set("category", e.target.value)}
                    >
                      <option value="">-- Select --</option><option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>Minority</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Differently Abled</label>
                    <select value={form.disability} onChange={e => set("disability", e.target.value)}>
                      <option>No</option><option>Yes</option>
                    </select>
                  </div>
                </div>

                {/* Annual Family Income */}
                <div className="form-group">
                  <label>Annual Family Income *</label>
                  <select
                    style={errorStyle("annualIncome")}
                    value={form.annualIncome === "" ? "" : String(form.annualIncome)}
                    onChange={e => handleIncomeChange(e.target.value)}
                  >
                    {INCOME_OPTIONS.map(opt => (
                      <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
                    ))}
                  </select>

                  {incomeHint && form.annualIncome !== "" && (
                    <div style={{
                      marginTop: 6, fontSize: 12, color: incomeHint.color,
                      background: incomeHint.color === "#991b1b" ? "#fef2f2" : incomeHint.color === "#b45309" ? "#fffbeb" : "#eff6ff",
                      border: `1px solid ${incomeHint.color === "#991b1b" ? "#fca5a5" : incomeHint.color === "#b45309" ? "#fcd34d" : "#bfdbfe"}`,
                      borderRadius: 6, padding: "6px 10px", display: "flex", alignItems: "flex-start", gap: 6,
                    }}>
                      {incomeHint.text}
                    </div>
                  )}
                  {incomeHint && form.annualIncome === "" && (
                    <div style={{
                      marginTop: 6, fontSize: 12, color: "#4b5563",
                      background: "#f9fafb", border: "1px solid #e5e7eb",
                      borderRadius: 6, padding: "6px 10px",
                    }}>
                      {incomeHint.text}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ STEP 1 — Academic Info (School / College toggle) ══ */}
            {step === 1 && (
              <div className="appform-section">
                <h3>Academic Information</h3>

                {/* ── Toggle ── */}
                <StudentTypeToggle value={studentType} onChange={handleStudentTypeChange} />

                {/* ════ SCHOOL STUDENT FIELDS ════ */}
                {studentType === "school" && (
                  <>
                    <span style={schoolBadgeStyle}>🏫 School details</span>

                    <div className="form-group">
                      <label>School Name *</label>
                      <input
                        style={errorStyle("instituteName")}
                        type="text"
                        placeholder="Enter your school name"
                        value={form.instituteName}
                        onChange={e => set("instituteName", e.target.value)}
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Current Class / Grade *</label>
                        <select style={errorStyle("schoolClass")} value={form.schoolClass} onChange={e => set("schoolClass", e.target.value)}>
                          <option value="">-- Select --</option>
                          <option>Class 1</option><option>Class 2</option><option>Class 3</option><option>Class 4</option><option>Class 5</option><option>Class 6</option><option>Class 7</option><option>Class 8</option>
                          <option>Class 9</option><option>Class 10</option>
                          <option>Class 11</option><option>Class 12</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Stream <span style={{ color: "#6b7280", fontWeight: 400 }}>(Class 11 &amp; 12 only)</span></label>
                        <select value={form.stream} onChange={e => set("stream", e.target.value)}>
                          <option value="">-- Select --</option>
                          <option>Science (PCM)</option>
                          <option>Science (PCB)</option><option>Commerce</option><option>Arts / Humanities</option><option>Not applicable</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Board *</label>
                        <select style={errorStyle("boardUniv")} value={form.boardUniv} onChange={e => set("boardUniv", e.target.value)}>
                          <option value="">-- Select --</option>
                          <option>CBSE</option><option>ICSE / ISC</option><option>State Board</option><option>IB</option><option>IGCSE</option><option>Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>State / UT *</label>
                        <select
                          style={errorStyle("schoolState")}
                          value={form.schoolState}
                          onChange={e => set("schoolState", e.target.value)}
                        >
                          <option value="">-- Select State --</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Last exam performance */}
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: "#6b7280",
                      margin: "20px 0 12px", paddingBottom: 6,
                      borderBottom: "1px solid #e5e7eb",
                    }}>
                      Last exam performance
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Last Exam Class *</label>
                        <select style={errorStyle("lastExamClass")} value={form.lastExamClass} onChange={e => set("lastExamClass", e.target.value)}>
                          <option value="">-- Select --</option>
                          {/* FIX: Added Kindergarten and lower classes for Class 1-4 students */}
                          <option>Kindergarten / Pre-School (KG/LKG/UKG)</option>
                          <option>Class 1</option><option>Class 2</option><option>Class 3</option><option>Class 4</option>
                          <option>Class 5</option><option>Class 6</option><option>Class 7</option>
                          <option>Class 8</option><option>Class 9</option><option>Class 10</option><option>Class 11</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Percentage / CGPA *</label>
                        <input
                          style={errorStyle("marks")}
                          type="number"
                          placeholder="E.g. 85.5 (Enter 0 if not applicable)"
                          value={form.marks}
                          onChange={e => set("marks", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Grading System *</label>
                        <select style={errorStyle("gradingSystem")} value={form.gradingSystem} onChange={e => set("gradingSystem", e.target.value)}>
                          <option value="">-- Select --</option>
                          <option>Percentage (%)</option>
                          <option>CGPA (out of 10)</option>
                          <option>Grade (A, B, C…)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Academic Year *</label>
                        <select
                          style={errorStyle("schoolAcademicYear")}
                          value={form.schoolAcademicYear}
                          onChange={e => set("schoolAcademicYear", e.target.value)}
                        >
                          <option value="">-- Select --</option>
                          <option value="2026-27">2026-27</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* ════ COLLEGE STUDENT FIELDS ════ */}
                {studentType === "college" && (
                  <>
                    <span style={collegeBadgeStyle}>🎓 College details</span>

                    <div className="form-group">
                      <label>Institution Name *</label>
                      <input
                        style={errorStyle("instituteName")}
                        type="text"
                        placeholder="Enter your college / university name"
                        value={form.instituteName}
                        onChange={e => set("instituteName", e.target.value)}
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Course / Programme *</label>
                        <input
                          style={errorStyle("course")}
                          type="text"
                          placeholder="E.g. B.Tech, B.Com, BA"
                          value={form.course}
                          onChange={e => set("course", e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Specialisation / Branch</label>
                        <input
                          type="text"
                          placeholder="E.g. Computer Science, Finance"
                          value={form.specialisation}
                          onChange={e => set("specialisation", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Year of Study *</label>
                        <select style={errorStyle("year")} value={form.year} onChange={e => set("year", e.target.value)}>
                          <option value="">-- Select --</option>
                          <option>1st Year</option><option>2nd Year</option>
                          <option>3rd Year</option><option>4th Year</option><option>5th Year</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>University / Board *</label>
                        <input
                          style={errorStyle("boardUniv")}
                          type="text"
                          placeholder="Affiliated university or board"
                          value={form.boardUniv}
                          onChange={e => set("boardUniv", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>State / UT *</label>
                        <select
                          style={errorStyle("collegeState")}
                          value={form.collegeState}
                          onChange={e => set("collegeState", e.target.value)}
                        >
                          <option value="">-- Select State --</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Course Duration *</label>
                        <select style={errorStyle("courseDuration")} value={form.courseDuration} onChange={e => set("courseDuration", e.target.value)}>
                          <option value="">-- Select --</option>
                          <option>2 years (Diploma)</option>
                          <option>2 years (PG / Masters)</option>
                          <option>3 years (UG)</option>
                          <option>4 years (UG / B.Tech)</option>
                          <option>5 years (Integrated)</option>
                          <option>Other</option>
                        </select>
                        {form.courseDuration === "Other" && (
                          <div style={{ marginTop: 8 }}>
                            <input
                              style={errorStyle("courseDurationOther")}
                              type="text"
                              placeholder="E.g. 1 Year (PG Diploma) or PhD"
                              value={form.courseDurationOther}
                              onChange={e => set("courseDurationOther", e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Academic Year *</label>
                        <select
                          style={errorStyle("academicYear")}
                          value={form.academicYear}
                          onChange={e => set("academicYear", e.target.value)}
                        >
                          <option value="">-- Select --</option>
                          <option value="2026-27">2026-27</option>
                        </select>
                      </div>
                    </div>

                    {/* Last exam performance */}
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: "#6b7280",
                      margin: "20px 0 12px", paddingBottom: 6,
                      borderBottom: "1px solid #e5e7eb",
                    }}>
                      Last exam performance
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Percentage / CGPA *</label>
                        <input
                          style={errorStyle("marks")}
                          type="number"
                          placeholder="Enter last exam percentage"
                          value={form.marks}
                          onChange={e => set("marks", e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Grading System *</label>
                        <select style={errorStyle("gradingSystem")} value={form.gradingSystem} onChange={e => set("gradingSystem", e.target.value)}>
                          <option value="">-- Select --</option>
                          <option>Percentage (%)</option>
                          <option>CGPA (out of 10)</option>
                          <option>CGPA (out of 4)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ══ STEP 2 — Bank Details ══ */}
            {step === 2 && (
              <div className="appform-section">
                <h3>Bank Account Details</h3>
                <div className="form-group"><label>Account Holder Name *</label><input style={errorStyle("accountHolder")} type="text" value={form.accountHolder} onChange={e => set("accountHolder", e.target.value)} /></div>
                <div className="form-group"><label>Bank Name *</label>
                  <select style={errorStyle("bankName")} value={form.bankName} onChange={e => set("bankName", e.target.value)}>
                    <option value="">-- Select Bank --</option>
                    <optgroup label="Public Sector Banks">
                      <option>State Bank of India</option><option>Punjab National Bank</option><option>Bank of Baroda</option><option>Canara Bank</option><option>Union Bank of India</option><option>Bank of India</option><option>Indian Bank</option><option>Central Bank of India</option><option>Indian Overseas Bank</option><option>UCO Bank</option><option>Bank of Maharashtra</option><option>Punjab & Sind Bank</option>
                    </optgroup>
                    <optgroup label="Private Sector Banks">
                      <option>HDFC Bank</option><option>ICICI Bank</option><option>Axis Bank</option><option>Kotak Mahindra Bank</option><option>IndusInd Bank</option><option>Yes Bank</option>
                    </optgroup>
                  </select>
                </div>
                <div className="form-row-2">
                  <div className="form-group"><label>Account Number *</label><input style={errorStyle("accountNo")} type="text" maxLength={18} placeholder="Enter 9 to 18 digit account number" value={form.accountNo} onChange={e => set("accountNo", e.target.value.replace(/\D/g, ""))} /></div>
                  <div className="form-group"><label>IFSC Code *</label><input style={errorStyle("ifsc")} type="text" maxLength={11} placeholder="Enter 11-char IFSC (e.g. SBIN0001234)" value={form.ifsc} onChange={e => set("ifsc", e.target.value.toUpperCase())} />
                    {form.bankName && BANK_IFSC_PREFIX[form.bankName] && (
                      <div style={{ marginTop: 5, fontSize: 12, color: "#1d4ed8", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "5px 10px" }}>
                        ℹ️ IFSC for <strong>{form.bankName}</strong> must start with <strong>{BANK_IFSC_PREFIX[form.bankName].join(" or ")}</strong> (e.g. {BANK_IFSC_PREFIX[form.bankName][0]}0001234)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══ STEP 3 — Upload Documents ══ */}
            {step === 3 && (
              <div className="appform-section">
                <h3>Upload Required Documents (AI Scanned)</h3>
                <div className="upload-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  {[
                    "Proof of Identity", "Academic Records", "Financial Documentation",
                    "Bank Account Details", "Residence Proof", "Photographs",
                    "Category Certificate", "Disability Certificate", "Bonafide Certificate", "Fee Receipts"
                  ].filter(doc => doc !== "Disability Certificate" || form.disability === "Yes").map((doc) => {
                    const fileObj = form.files[doc];
                    return (
                      <div key={doc} className="form-group" style={{
                        border: "1px solid #eee", padding: "16px", borderRadius: "8px",
                        boxShadow: fileObj?.status === "verified" ? "0 0 0 2px #22c55e, 0 4px 12px rgba(34,197,94,0.1)" : "none",
                        transition: "all 0.3s", position: "relative", overflow: "hidden"
                      }}>
                        <label style={{ fontWeight: 600 }}>{doc} {["Category Certificate", "Disability Certificate", "Bonafide Certificate", "Fee Receipts"].includes(doc) ? "" : "*"}</label>
                        <input type="file" onChange={(e) => handleFileUpload(e, doc)} style={{ marginTop: "8px" }} />
                        {fileObj?.status === "scanning" && (
                          <div style={{ marginTop: 10, color: "#eab308", fontSize: "13px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #eab308", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span>
                            AI Scanning Document...
                          </div>
                        )}
                        {fileObj?.status === "verified" && (
                          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: "12px", background: "#f0fdf4", padding: "8px", borderRadius: "6px" }}>
                            {fileObj.url && <img src={fileObj.url} alt="Preview" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "4px", border: "1px solid #bbf7d0" }} />}
                            <div style={{ flex: 1 }}>
                              <div style={{ color: "#16a34a", fontSize: "12px", fontWeight: "bold" }}>✅ Document Verified</div>
                              <div style={{ fontSize: "11px", color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>{fileObj.name}</div>
                            </div>
                          </div>
                        )}
                        {fileObj?.status === "rejected" && (
                          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", padding: "8px", borderRadius: "6px" }}>
                            {fileObj.url && <img src={fileObj.url} alt="Preview" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "4px", border: "1px solid #fecaca" }} />}
                            <div style={{ flex: 1 }}>
                              <div style={{ color: "#dc2626", fontSize: "12px", fontWeight: "bold" }}>❌ Invalid Document</div>
                              <button onClick={() => set("files", { ...form.files, [doc]: null })} style={{ background: "none", border: "none", color: "#dc2626", fontSize: "11px", fontWeight: "bold", cursor: "pointer", padding: 0, marginTop: "6px", textDecoration: "underline" }}>Remove & Try Again</button>
                            </div>
                          </div>
                        )}
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══ STEP 4 — Preview & Submit ══ */}
            {step === 4 && (
              <div className="appform-section">
                <h3>Preview & Submit</h3>
                <div className="preview-grid">
                  {[
                    ["Scholarship", form.scholarship?.split(" — ")[0]],
                    ["Full Name", form.fullName],
                    ["Date of Birth", form.dob],
                    ["Gender", form.gender],
                    ["Category", form.category],
                    ["Annual Family Income", INCOME_OPTIONS.find(o => o.value === form.annualIncome)?.label || "—"],
                    ["Mobile", form.mobile],
                    // Show academic preview based on student type
                    studentType === "school"
                      ? ["School Name", form.instituteName]
                      : ["Institution", form.instituteName],
                    studentType === "school"
                      ? ["Class / Grade", form.schoolClass]
                      : ["Course", form.course],
                    studentType === "school"
                      ? ["Board", form.boardUniv]
                      : ["Year of Study", form.year],
                    ["Marks / CGPA (%)", form.marks],
                    ["Bank Name", form.bankName],
                    ["Account No.", form.accountNo],
                    ["IFSC", form.ifsc],
                  ].map(([label, value], i) => (
                    <div key={i} className="preview-item">
                      <div className="preview-label">{label}</div>
                      <div className="preview-value">{value || "—"}</div>
                    </div>
                  ))}
                </div>
                <div className="declaration-box">
                  <label className="declaration-label">
                    <input type="checkbox" checked={form.declaration} onChange={e => set("declaration", e.target.checked)} />
                    <span>I hereby declare that the information provided is true and valid.</span>
                  </label>
                </div>
              </div>
            )}

            <div className="appform-nav">
              {step > 0 && <button className="btn-secondary" style={{ width: "auto" }} onClick={() => setStep(step - 1)}>← Previous</button>}
              <div style={{ flex: 1 }} />
              <button className="btn-gov" style={{ width: "auto" }} onClick={handleNext} disabled={uploadingFiles}>
                {step === STEPS.length - 1 ? (uploadingFiles ? "Uploading..." : "Submit Application ✓") : "Save & Continue →"}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Uploading Progress Overlay */}
      {uploadingFiles && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(255,255,255,0.9)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)"
        }}>
          <div className="spinner" style={{ 
            width: 60, height: 60, border: "6px solid #f3f3f3", 
            borderTop: "6px solid #003580", borderRadius: "50%", 
            animation: "spin 1s linear infinite", marginBottom: 20 
          }}></div>
          <h2 style={{ color: "#003580", margin: "0 0 10px" }}>Secure Upload in Progress</h2>
          <p style={{ color: "#475569", fontSize: 16, fontWeight: 600 }}>{uploadProgress}</p>
          <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 20 }}>Please do not close or refresh this page.</p>
        </div>
      )}
    </div>
  );
}