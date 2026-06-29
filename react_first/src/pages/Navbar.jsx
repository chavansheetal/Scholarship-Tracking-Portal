import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const FAQS_LIST = [
  { q: "Who is eligible for NSP scholarships?",        a: "Eligibility varies by scheme. Generally, students belonging to SC/ST/OBC/Minority communities with a certain family income threshold are eligible. Check the specific scheme guidelines." },
  { q: "Can I apply for more than one scholarship?",   a: "Yes, depending on the scheme rules. Typically only one scholarship is allowed per student per academic year from Central Schemes." },
  { q: "What documents are required?",                 a: "Common documents include Aadhaar Card, Income Certificate, Caste Certificate, Bank Passbook, and Marksheet." },
  { q: "How do I track my application status?",        a: "You can track your application status by logging into your dashboard and clicking on 'Track Application Status'." },
  { q: "Is Aadhaar Card mandatory for registration?",  a: "Yes, Aadhaar is mandatory for identification and Direct Benefit Transfer (DBT) of scholarship amounts into the student's bank account." },
];

const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 9999, padding: "16px",
};

const modalStyle = {
  background: "#fff", borderRadius: 10, width: "100%", maxWidth: 620,
  boxShadow: "0 8px 40px rgba(0,0,0,0.22)", overflow: "hidden",
  display: "flex", flexDirection: "column", maxHeight: "90vh",
};

const modalHeaderStyle = (bg) => ({
  background: bg, color: "#fff", padding: "14px 20px",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  fontSize: 16, fontWeight: 700,
});

const closeBtnStyle = {
  background: "none", border: "none", color: "#fff",
  fontSize: 20, cursor: "pointer", lineHeight: 1, padding: "0 4px",
};

const modalBodyStyle = {
  padding: "20px 24px", overflowY: "auto", lineHeight: 1.65,
  color: "#333", fontSize: 14,
};

export default function Navbar({ user, onLogout, onAboutClick, onFaqClick }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Internal modal state — works on every page
  const [showAbout, setShowAbout] = useState(false);
  const [showFaq,   setShowFaq]   = useState(false);

  const handleLogout = () => { onLogout?.(); navigate("/"); };
  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  const handleAbout = (e) => {
    e.preventDefault();
    if (onAboutClick) onAboutClick(); // let Home.jsx handle if it wants to
    else setShowAbout(true);           // otherwise Navbar handles it
  };

  const handleFaq = (e) => {
    e.preventDefault();
    if (onFaqClick) onFaqClick();
    else setShowFaq(true);
  };

  return (
    <>
      {/* GOV STRIP */}
      <div className="gov-strip">
        <div className="gov-strip-inner">
          <div className="gov-left">
            <span>🏛</span>
            <span>Government of India &nbsp;|&nbsp; Ministry of Education &nbsp;|&nbsp; Department of Higher Education</span>
          </div>
          <div className="gov-right">
            <a href="#">Screen Reader Access</a>
            <a href="#">A-</a><a href="#">A</a><a href="#">A+</a>
            <a href="#">English</a>
            <a href="#">हिंदी</a>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="main-header">
        <div className="header-inner">
          <div className="logo-block">
            <div className="logo-circle-container">
              <img src="/logo.png" alt="Portal Logo" className="portal-logo" />
            </div>
            <div className="portal-title">
              <h1>Unified Scholarship Platform</h1>
              <div className="sub">एकीकृत छात्रवृत्ति मंच &nbsp;|&nbsp; Unified Platform for Scholarships</div>
              <div className="ministry">Ministry of Education, Government of India &nbsp;|&nbsp; Version 3.0</div>
            </div>
          </div>
          <div className="header-right">
            
            {user ? (
              <>
                <span className="user-greeting">👤 {user.name}</span>
                <Link to="/dashboard" className="login-btn">Dashboard</Link>
                <button className="register-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <Link to="/login" className="login-btn">🔐 Login</Link>
            )}
          </div>
        </div>
      </header>
      <div className="tricolor" />

      {/* NAV */}
      <nav className="main-nav">
        <div className="nav-inner">
          <Link to="/"             className={isActive("/")}>🏠 Home</Link>
          <Link to="/scholarships" className={isActive("/scholarships")}>📋 Scholarships</Link>
          <Link to="/track-status" className={isActive("/track-status")}>📊 Application Status</Link>
          <Link to="/eligibility"  className={isActive("/eligibility")}>✅ Eligibility Checker</Link>

          {/* About USP — always opens modal */}
          <a href="#" className="nav-link" onClick={handleAbout}>ℹ️ About USP</a>

          <Link to="/contact" className={isActive("/contact")}>📞 Contact Us</Link>

          {/* FAQs — always opens modal */}
          <a href="#" className="nav-link" onClick={handleFaq}>❓ FAQs</a>

          <div className="nav-spacer" />
          <div className="helpline">Helpline: <span>0120-6619540</span></div>
        </div>
      </nav>

      {/* ── ABOUT USP MODAL ── */}
      {showAbout && (
        <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) setShowAbout(false); }}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle("#003580")}>
              <span>ℹ️ About Unified Scholarship Platform</span>
              <button style={closeBtnStyle} onClick={() => setShowAbout(false)}>✕</button>
            </div>
            <div style={modalBodyStyle}>
              <h4 style={{ color: "#003580", marginTop: 0 }}>Introduction</h4>
              <p>The Unified Scholarship Platform (USP) is a one-stop solution for the end-to-end scholarship process. It facilitates submission of student applications, verification, sanction, and disbursal of scholarships offered by the Government of India to students across the country.</p>
              <p>This initiative aims to ensure timely disbursement of scholarships to students and prevent leakages through a robust IT-driven system.</p>

              <h4 style={{ color: "#003580" }}>Our Mission</h4>
              <p>To provide a single window platform for various scholarship schemes offered by the Central and State Governments to ensure efficient, transparent, and timely disbursement of scholarships to students.</p>

              <h4 style={{ color: "#003580" }}>Key Objectives</h4>
              <ul style={{ paddingLeft: 20 }}>
                <li style={{ marginBottom: 6 }}>Ensure scholarships are disbursed to students on time without delay.</li>
                <li style={{ marginBottom: 6 }}>Common platform for Central and State Government schemes to avoid duplication.</li>
                <li style={{ marginBottom: 6 }}>Create a transparent database of eligible students for all schemes.</li>
                <li style={{ marginBottom: 6 }}>Harmonization of different scholarship schemes &amp; norms to streamline processing.</li>
              </ul>

              <div style={{ marginTop: 16, padding: "10px 14px", background: "#EFF6FF", borderRadius: 6, fontSize: 13, color: "#1e40af" }}>
                <strong>Department of Higher Education</strong><br />
                Ministry of Education, Government of India &nbsp;|&nbsp;
                <span style={{ background: "#003580", color: "#fff", borderRadius: 4, padding: "1px 8px", fontSize: 11, marginLeft: 4 }}>Version 3.0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FAQ MODAL ── */}
      {showFaq && (
        <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) setShowFaq(false); }}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle("#FF9933")}>
              <span>❓ Frequently Asked Questions (FAQs)</span>
              <button style={closeBtnStyle} onClick={() => setShowFaq(false)}>✕</button>
            </div>
            <div style={modalBodyStyle}>
              {FAQS_LIST.map((faq, i) => (
                <details
                  key={i}
                  style={{ marginBottom: 14, borderBottom: "1px solid #eee", paddingBottom: 12 }}
                >
                  <summary style={{
                    fontWeight: 600, cursor: "pointer", color: "#003580",
                    outline: "none", listStyle: "inside", fontSize: 14
                  }}>
                    {faq.q}
                  </summary>
                  <div style={{ marginTop: 8, fontSize: 13, color: "#444", paddingLeft: 18, lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}