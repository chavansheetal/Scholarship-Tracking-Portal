import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { loginUser } from "../store";
import "../styles/Auth.css";

function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join(" ");
}

const QUICK_LINKS = [
  { icon: "📋", label: "Check Application Status" },
  { icon: "📄", label: "Download Scholarship Certificate" },
  { icon: "🏦", label: "Update Bank Details" },
  { icon: "🔔", label: "Renewal Notifications" },
];

const NOTICES = [
  { tag: "NEW", text: "Last date for Post-Matric scholarship renewal: 31 Mar 2026" },
  { tag: "INFO", text: "Aadhaar seeding mandatory for all fresh applicants from 2025-26" },
  { tag: "UPDATE", text: "Karnataka SNO helpline now available 9AM–6PM weekdays" },
];

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [type, setType]               = useState("Student");
  const [loginType, setLoginType]     = useState(location.state?.applicationType || "Fresh");
  const [appId, setAppId]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPwd, setShowPwd]         = useState(false);
  const [captcha, setCaptcha]         = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  const refreshCaptcha = () => { setCaptcha(generateCaptcha()); setCaptchaInput(""); };

  const handleLogin = () => {
    setError("");
    if (!appId.trim())    { setError("Please enter your Application ID."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }
    if (captchaInput.replace(/\s/g,"").toUpperCase() !== captcha.replace(/\s/g,"").toUpperCase()) {
      setError("Captcha does not match. Please try again.");
      refreshCaptcha();
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const user = await loginUser(appId.trim(), password);
        setLoading(false);

        const sessionUser = {
          name:   user.fullName,
          id:     user.id,
          email:  user.email,
          mobile: user.mobile,
          category: user.category,
          appId:  user.id,
          type,
        };
        onLogin(sessionUser);
        if (loginType === "Renewal") {
          navigate("/renewal");
        } else {
          navigate("/dashboard");
        }
      } catch (err) {
        setLoading(false);
        setError(err.message || "Login failed. Please check your credentials.");
        refreshCaptcha();
      }
    })();
  };

  return (
    <div className="page-wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />

      {/* ── Full-screen two-panel container ── */}
      <div style={{ flex: 1, display: "flex", minHeight: "calc(100vh - 120px)" }}>

        {/* ════════════════ LEFT PANEL ════════════════ */}
        <div style={{
          flex: "0 0 42%",
          background: "linear-gradient(155deg, #0a1628 0%, #0d2461 40%, #1a3a8f 70%, #0f2d6e 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "36px 40px 36px 40px",
          color: "#fff",
        }}>

          {/* Decorative circles */}
          <div style={{
            position: "absolute", top: -80, right: -80,
            width: 320, height: 320, borderRadius: "50%",
            background: "rgba(255,200,50,0.07)", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -100, left: -60,
            width: 380, height: 380, borderRadius: "50%",
            background: "rgba(100,160,255,0.08)", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: "38%", left: "55%",
            width: 180, height: 180, borderRadius: "50%",
            background: "rgba(255,180,0,0.05)", pointerEvents: "none",
          }} />

          {/* Dot grid */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }} />

          {/* Logo + Welcome */}
          <div style={{ position: "relative", zIndex: 1, marginBottom: 22 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #FFB800, #FF8C00)",
              fontSize: 24, marginBottom: 14,
              boxShadow: "0 6px 18px rgba(255,160,0,0.35)",
            }}>🔐</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
              Welcome Back<br />to USP
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.6 }}>
              Securely access your scholarship dashboard, track application status, and manage your documents — all in one place.
            </p>
          </div>

          {/* Quick links */}
          <div style={{ position: "relative", zIndex: 1, marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)", marginBottom: 12, textTransform: "uppercase" }}>
              After Login You Can
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {QUICK_LINKS.map((q) => (
                <div key={q.label} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 9, padding: "8px 12px",
                }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{q.icon}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{q.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notice board */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)", marginBottom: 12, textTransform: "uppercase" }}>
              Latest Notices
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {NOTICES.map((n) => (
                <div key={n.text} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 9, padding: "8px 12px",
                }}>
                  <span style={{
                    flexShrink: 0, fontSize: 10, fontWeight: 800,
                    padding: "2px 7px", borderRadius: 4,
                    background: n.tag === "NEW" ? "rgba(255,210,76,0.25)" : n.tag === "UPDATE" ? "rgba(100,200,120,0.2)" : "rgba(130,170,255,0.2)",
                    color: n.tag === "NEW" ? "#FFD24C" : n.tag === "UPDATE" ? "#7EEAA0" : "#A0BFFF",
                    letterSpacing: "0.06em",
                  }}>{n.tag}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{n.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom badge */}
          <div style={{
            position: "relative", zIndex: 1, marginTop: 18,
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,210,76,0.12)",
            border: "1px solid rgba(255,210,76,0.3)",
            borderRadius: 8, padding: "10px 14px",
          }}>
            <span style={{ fontSize: 18 }}>🇮🇳</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
              A <strong style={{ color: "#FFD24C" }}>Government of India</strong> initiative under the Ministry of Electronics & IT
            </span>
          </div>
        </div>

        {/* ════════════════ RIGHT PANEL (existing form, untouched) ════════════════ */}
        <div style={{
          flex: 1,
          background: "#EEF2FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflowY: "auto",
          padding: "32px 24px",
        }}>
          <div className="auth-card" style={{ maxWidth: 460, width: "100%", margin: "0 auto" }}>
            <div className="auth-header navy-head">
              <div className="auth-logo">🔐</div>
              <h2>{loginType === "Renewal" ? "Student Login (Renewal)" : "Student Login"}</h2>
              <p>Unified Scholarship Platform — Secure Access</p>
            </div>
            <div className="auth-body">


              <div className="alert alert-warning">
                ⚠️ This is a secure government portal. Unauthorized access is prohibited under IT Act 2000.
              </div>

              {error && <div className="alert alert-error">❌ {error}</div>}



              <div className="form-group">
                <label>Application ID *</label>
                <input
                  type="text"
                  placeholder="e.g. NSP/2025/KA/12345"
                  value={appId}
                  onChange={e => setAppId(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  autoComplete="username"
                />
                <div style={{fontSize:11,color:"#4a5568",marginTop:4}}>
                  Your Application ID was shown after registration (e.g. NSP/2025/KA/XXXXX)
                </div>
              </div>

              <div className="form-group">
                <label>Password *</label>
                <div className="password-input-wrap">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    autoComplete="current-password"
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPwd(p => !p)}>
                    {showPwd ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Enter Captcha *</label>
                <div className="captcha-row">
                  <div className="captcha-box">{captcha}</div>
                  <button className="captcha-refresh" onClick={refreshCaptcha} title="Refresh Captcha" type="button">🔄</button>
                  <input
                    type="text"
                    placeholder="Type captcha here"
                    value={captchaInput}
                    onChange={e => setCaptchaInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    maxLength={6}
                  />
                </div>
              </div>

              <button className="btn-gov" onClick={handleLogin} disabled={loading} style={{marginTop:4}}>
                {loading ? "⏳ Verifying..." : "🔐 Login Securely"}
              </button>



              <div className="auth-footer-links" style={{marginTop:14}}>
                <Link to="/register">New Registration?</Link>
                <Link to="/renewal" style={{ color: "#003580", fontWeight: 600 }}>Apply for Renewal?</Link>
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <div style={{textAlign:"center",marginTop:10,fontSize:11,color:"#4a5568"}}>
                Institute / Ministry login?{" "}
                <Link to="/admin" style={{color:"#003580",fontWeight:600}}>Admin Portal →</Link>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}