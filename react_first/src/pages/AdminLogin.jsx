import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/AdminLogin.css";
import "../styles/Auth.css";

const CREDENTIALS = {
  institute: [
    { id: "INST001",  password: "Inst@123",  name: "Prof. Anita Sharma", role: "Institute Nodal Officer", ministry: "Govt. First Grade College, Karnataka" },
    { id: "INST002",  password: "Inst@456",  name: "Dr. Ramesh Nair",    role: "Institute Nodal Officer", ministry: "KLE University, Belgaum" },
  ],
  state: [
    { id: "STATE001", password: "State@123", name: "Mr. Suresh Patil",   role: "State Nodal Officer",     ministry: "Karnataka State Dept. of Education" },
    { id: "STATE002", password: "State@456", name: "Ms. Priya Menon",    role: "State Nodal Officer",     ministry: "Kerala State Scholarship Board" },
  ],
  ministry: [
    { id: "ADMIN001", password: "Admin@123", name: "Dr. Rajesh Kumar",   role: "Ministry Admin",          ministry: "Ministry of Education, GoI" },
    { id: "ADMIN002", password: "Admin@456", name: "Mrs. Sunita Rao",    role: "Ministry Admin",          ministry: "Ministry of Social Justice, GoI" },
  ],
};

function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join(" ");
}

const TABS = [
  { id: "institute", icon: "🏫", label: "Institute Login",     fieldLabel: "Institute ID " },
  { id: "state",     icon: "🏛",  label: "State Nodal Officer", fieldLabel: "State Officer ID"          },
  { id: "ministry",  icon: "⚖️", label: "Ministry Login",      fieldLabel: "Ministry User ID"          },
];

/* Left panel content per tab */
const TAB_INFO = {
  institute: {
    icon: "🏫",
    title: "Institute Nodal Officer Portal",
    subtitle: "Manage student applications submitted through your institution.",
    responsibilities: [
      { icon: "✅", text: "Verify student scholarship applications" },
      { icon: "📄", text: "Review & forward documents to state" },
      { icon: "🔔", text: "Notify students of approval/rejection" },
      { icon: "📊", text: "Track disbursement for your institute" },
      { icon: "🏦", text: "Validate student bank account details" },
    ],
    notices: [
      { tag: "ACTION", text: "45 applications pending institute verification" },
      { tag: "INFO",   text: "Renewal window open till 30 Apr 2026" },
      { tag: "NEW",    text: "AISHE data update portal now live" },
    ],
    stat: { value: "3,200+", label: "Institutes on USP" },
  },
  state: {
    icon: "🏛",
    title: "State Nodal Officer Portal",
    subtitle: "Oversee all institute-level verifications across your state.",
    responsibilities: [
      { icon: "🔍", text: "Review institute-forwarded applications" },
      { icon: "📋", text: "Approve and sanction eligible scholarships" },
      { icon: "📤", text: "Forward sanctioned cases to ministry" },
      { icon: "📈", text: "Generate state-level disbursement reports" },
      { icon: "🛡", text: "Ensure fraud detection & eligibility audit" },
    ],
    notices: [
      { tag: "ACTION", text: "12 institutes pending state-level approval" },
      { tag: "INFO",   text: "State budget allocation updated for FY 2025-26" },
      { tag: "NEW",    text: "Grievance redressal portal integrated" },
    ],
    stat: { value: "36", label: "States & UTs on USP" },
  },
  ministry: {
    icon: "⚖️",
    title: "Ministry Administration Portal",
    subtitle: "Central oversight for all USP scholarship schemes across India.",
    responsibilities: [
      { icon: "🗂",  text: "Manage scholarship scheme configurations" },
      { icon: "💰", text: "Approve national-level fund disbursements" },
      { icon: "📊", text: "Monitor pan-India application analytics" },
      { icon: "🔐", text: "Manage institute & state user access" },
      { icon: "📢", text: "Publish national notices & deadlines" },
    ],
    notices: [
      { tag: "ACTION", text: "Budget approval pending for CSSS 2025-26" },
      { tag: "INFO",   text: "Cabinet approved ₹2,800 Cr for scholarships" },
      { tag: "NEW",    text: "New DBT reconciliation module deployed" },
    ],
    stat: { value: "127+", label: "Ministries & Depts" },
  },
};

const TAG_COLORS = {
  ACTION: { bg: "rgba(255,100,80,0.2)",  text: "#FF6B6B",  border: "rgba(255,100,80,0.3)"  },
  INFO:   { bg: "rgba(130,170,255,0.2)", text: "#A0BFFF",  border: "rgba(130,170,255,0.3)" },
  NEW:    { bg: "rgba(255,210,76,0.2)",  text: "#FFD24C",  border: "rgba(255,210,76,0.3)"  },
};

export default function AdminLogin({ onAdminLogin }) {
  const navigate = useNavigate();
  const [tab, setTab]                   = useState("institute");
  const [userId, setUserId]             = useState("");
  const [password, setPassword]         = useState("");
  const [showPwd, setShowPwd]           = useState(false);
  const [captcha, setCaptcha]           = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);

  const refreshCaptcha = () => { setCaptcha(generateCaptcha()); setCaptchaInput(""); };

  const switchTab = (newTab) => {
    setTab(newTab);
    setUserId(""); setPassword(""); setCaptchaInput(""); setError("");
    refreshCaptcha();
  };

  const currentTab = TABS.find(t => t.id === tab);
  const info = TAB_INFO[tab];

  const handleLogin = () => {
    setError("");
    if (!userId.trim())   { setError("Please enter your User ID."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }
    if (captchaInput.replace(/\s/g,"").toUpperCase() !== captcha.replace(/\s/g,"").toUpperCase()) {
      setError("Captcha does not match. Please try again.");
      refreshCaptcha(); return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const list  = CREDENTIALS[tab] || [];
      const admin = list.find(a => a.id === userId.trim() && a.password === password);
      if (!admin) {
        setError("Invalid ID or Password. Please contact the helpdesk if you are unable to login.");
        refreshCaptcha(); return;
      }
      onAdminLogin(admin);
      navigate("/admin/dashboard");
    }, 600);
  };

  return (
    <div className="page-wrapper" style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
      <Navbar />

      {/* ── Two-panel container ── */}
      <div style={{ flex:1, display:"flex", minHeight:"calc(100vh - 120px)" }}>

        {/* ════════════ LEFT PANEL ════════════ */}
        <div style={{
          flex: "0 0 42%",
          background: "linear-gradient(155deg, #0a1628 0%, #0d2461 40%, #1a3a8f 70%, #0f2d6e 100%)",
          position: "relative",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          color: "#fff",
        }}>
          {/* Top accent bar */}
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:3,
            background:"linear-gradient(90deg,#FFB800,#FF8C00,#FFB800)", zIndex:10,
          }} />

          {/* Decorative circles */}
          <div style={{ position:"absolute", top:-80, right:-80, width:300, height:300, borderRadius:"50%", background:"rgba(255,200,50,0.07)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-100, left:-60, width:340, height:340, borderRadius:"50%", background:"rgba(100,160,255,0.08)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:"40%", left:"55%", width:160, height:160, borderRadius:"50%", background:"rgba(255,180,0,0.05)", pointerEvents:"none" }} />

          {/* Dot grid */}
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize:"28px 28px", pointerEvents:"none",
          }} />

          {/* Content */}
          <div style={{ position:"relative", zIndex:1, padding:"44px 36px 36px", display:"flex", flexDirection:"column" }}>

            {/* Icon + Title — changes per tab */}
            <div style={{ marginBottom:20 }}>
              <div style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                width:48, height:48, borderRadius:13,
                background:"linear-gradient(135deg,#FFB800,#FF8C00)",
                fontSize:22, marginBottom:12,
                boxShadow:"0 6px 16px rgba(255,160,0,0.4)",
              }}>{info.icon}</div>
              <h1 style={{ fontSize:19, fontWeight:800, margin:"0 0 6px", letterSpacing:"-0.3px", lineHeight:1.25 }}>
                {info.title}
              </h1>
              <p style={{ fontSize:12.5, color:"rgba(255,255,255,0.6)", margin:0, lineHeight:1.6 }}>
                {info.subtitle}
              </p>
            </div>

            {/* Tab switcher pills on left panel */}
            <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => switchTab(t.id)} style={{
                  background: tab === t.id ? "rgba(255,210,76,0.2)" : "rgba(255,255,255,0.06)",
                  border: tab === t.id ? "1px solid rgba(255,210,76,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  color: tab === t.id ? "#FFD24C" : "rgba(255,255,255,0.65)",
                  borderRadius:20, padding:"5px 12px", fontSize:11.5,
                  fontWeight: tab === t.id ? 700 : 400,
                  cursor:"pointer", transition:"all 0.2s",
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Stat highlight */}
            <div style={{
              display:"flex", alignItems:"center", gap:14,
              background:"rgba(255,255,255,0.07)",
              border:"1px solid rgba(255,255,255,0.12)",
              borderRadius:10, padding:"10px 14px", marginBottom:18,
            }}>
              <div>
                <div style={{ fontSize:22, fontWeight:800, color:"#FFD24C", letterSpacing:"-0.5px" }}>{info.stat.value}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>{info.stat.label}</div>
              </div>
              <div style={{ width:1, height:36, background:"rgba(255,255,255,0.15)" }} />
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight:1.5 }}>
                Registered and active on the Unified Scholarship Platform
              </div>
            </div>

            {/* Responsibilities */}
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", color:"rgba(255,255,255,0.4)", marginBottom:8, textTransform:"uppercase" }}>
              Your Responsibilities
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:18 }}>
              {info.responsibilities.map((r) => (
                <div key={r.text} style={{
                  display:"flex", alignItems:"center", gap:10,
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.09)",
                  borderRadius:9, padding:"7px 11px",
                }}>
                  <span style={{ fontSize:14, flexShrink:0 }}>{r.icon}</span>
                  <span style={{ fontSize:12.5, color:"rgba(255,255,255,0.8)" }}>{r.text}</span>
                </div>
              ))}
            </div>

            {/* Notices */}
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", color:"rgba(255,255,255,0.4)", marginBottom:8, textTransform:"uppercase" }}>
              Portal Notices
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:18 }}>
              {info.notices.map((n) => {
                const c = TAG_COLORS[n.tag] || TAG_COLORS.INFO;
                return (
                  <div key={n.text} style={{
                    display:"flex", alignItems:"flex-start", gap:9,
                    background:"rgba(255,255,255,0.04)",
                    border:"1px solid rgba(255,255,255,0.08)",
                    borderRadius:9, padding:"7px 11px",
                  }}>
                    <span style={{
                      flexShrink:0, fontSize:9.5, fontWeight:800,
                      padding:"2px 6px", borderRadius:4,
                      background:c.bg, color:c.text, border:`1px solid ${c.border}`,
                      letterSpacing:"0.06em",
                    }}>{n.tag}</span>
                    <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.6)", lineHeight:1.5 }}>{n.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom badge */}
            <div style={{
              display:"flex", alignItems:"center", gap:9,
              background:"rgba(255,210,76,0.11)",
              border:"1px solid rgba(255,210,76,0.28)",
              borderRadius:8, padding:"9px 13px",
            }}>
              <span style={{ fontSize:16 }}>🇮🇳</span>
              <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.75)", lineHeight:1.5 }}>
                A <strong style={{ color:"#FFD24C" }}>Government of India</strong> initiative — Ministry of Electronics & IT
              </span>
            </div>

          </div>
        </div>

        {/* ════════════ RIGHT PANEL (existing form, untouched) ════════════ */}
        <div style={{
          flex:1, background:"#EEF2FF",
          display:"flex", alignItems:"center", justifyContent:"center",
          overflowY:"auto", padding:"32px 24px",
        }}>
          <div className="admin-auth-card" style={{ width:"100%", maxWidth:480, margin:"0 auto", boxShadow:"0 4px 24px rgba(0,0,0,0.10)" }}>

            {/* Header */}
            <div className="admin-auth-header">
              <div style={{ fontSize:44, marginBottom:8 }}>🏛</div>
              <h2>USP Admin / Institute Portal</h2>
              <p>Unified Scholarship Platform — Administrative Access</p>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
              {TABS.map(t => (
                <button key={t.id} className={`admin-tab ${tab === t.id ? "active" : ""}`} onClick={() => switchTab(t.id)}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div className="admin-body">
              <div className="alert alert-warning">
                ⚠️ This section is for authorised institutes, state nodal officers, and ministry officials only.
              </div>



              {error && <div className="alert alert-error" style={{ marginBottom:12 }}>❌ {error}</div>}

              <div className="form-group">
                <label>{currentTab?.fieldLabel} *</label>
                <input type="text" placeholder={`Enter ${currentTab?.fieldLabel}`}
                  value={userId} onChange={e => setUserId(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <div className="password-input-wrap">
                  <input type={showPwd ? "text" : "password"} placeholder="Enter password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()} />
                  <button type="button" className="password-toggle" onClick={() => setShowPwd(p => !p)}>
                    {showPwd ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Captcha *</label>
                <div className="captcha-row">
                  <div className="captcha-box">{captcha}</div>
                  <button className="captcha-refresh" onClick={refreshCaptcha} type="button">🔄</button>
                  <input type="text" placeholder="Enter captcha"
                    value={captchaInput} onChange={e => setCaptchaInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()} maxLength={6} />
                </div>
              </div>

              <button className="btn-gov" onClick={handleLogin} disabled={loading}>
                {loading ? "⏳ Verifying..." : "🔐 Login Securely"}
              </button>

              <div style={{ textAlign:"center", marginTop:14 }}>
                <Link to="/" style={{ fontSize:12, color:"#003580" }}>← Back to Student Portal</Link>
              </div>
            </div>

            <div className="admin-helpdesk">
              <strong>Institute Helpdesk:</strong> For login issues, contact <strong>0120-6619540</strong>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}