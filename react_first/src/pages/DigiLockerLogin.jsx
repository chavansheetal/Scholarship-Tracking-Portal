import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { getUserByAadhaar, getUserByAppId, getUserByEmail } from "../store";
import { sendOTPEmail } from "../emailService";
import "../styles/Auth.css";

function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join(" ");
}

export default function DigiLockerLogin({ onLogin }) {
  const navigate = useNavigate();
  const [method, setMethod]             = useState("email");
  const [aadhaar, setAadhaar]           = useState("");
  const [digiId, setDigiId]             = useState("");
  const [step, setStep]                 = useState(1);
  const [enteredOtp, setEnteredOtp]     = useState("");
  const [captcha, setCaptcha]           = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [emailOtp, setEmailOtp]         = useState("");
  const [loginEmail, setLoginEmail]     = useState("");

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  };

  const handleSendOtp = async () => {
    setError("");
    if (method === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(digiId.trim())) {
      setError("Please enter a valid registered email address.");
      return;
    }
    if (method === "aadhaar" && aadhaar.replace(/\s/g, "").length < 12) {
      setError("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    if (method === "digi_id" && digiId.trim().length < 4) {
      setError("Please enter a valid DigiLocker ID / Username.");
      return;
    }
    if (
      captchaInput.replace(/\s/g, "").toUpperCase() !==
      captcha.replace(/\s/g, "").toUpperCase()
    ) {
      setError("Captcha does not match. Please try again.");
      refreshCaptcha();
      return;
    }

    let user = null;
    if (method === "aadhaar") {
      user = await getUserByAadhaar(aadhaar.replace(/\s/g, ""));
    } else if (method === "email") {
      user = await getUserByEmail(digiId.trim());
    } else if (method === "digi_id") {
      const cleanId = digiId.trim();
      user = (await getUserByAppId(cleanId)) || (await getUserByAadhaar(cleanId.replace(/\s/g, "")));
    }

    if (!user) {
      setError("Account not found. Please ensure you are registered.");
      refreshCaptcha();
      return;
    }

    if (!user.email) {
      setError("Registered user does not have a valid email address.");
      return;
    }

    setLoading(true);
    try {
      // Generate random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setEmailOtp(otp);
      setLoginEmail(user.email);

      // Send OTP via email
      const emailResult = await sendOTPEmail(user.email, otp);
      if (!emailResult.success) {
        setError("Failed to send OTP email. Please try again.");
        return;
      }

      setStep(2);
      setError("");
    } catch (error) {
      console.error("Error generating/sending OTP:", error);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    if (!enteredOtp.trim()) {
      setError("Please enter the OTP.");
      return;
    }
    if (enteredOtp.trim() !== emailOtp) {
      setError("Invalid OTP. Please check your email and try again.");
      return;
    }

    try {
      // Find user by email
      const user = await getUserByEmail(loginEmail);
      if (!user) {
        setError("User not found. Please try again.");
        return;
      }

      // Set login session
      localStorage.setItem("nsp_logged_in", "true");
      localStorage.setItem("nsp_user_name", user.fullName);
      localStorage.setItem("nsp_user_email", user.email);
      localStorage.setItem("nsp_app_id", user.appId);

      setError("");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* ── Full-page split layout ── */}
      <div style={styles.pageContainer}>

        {/* ── LEFT PANEL ── */}
        <div style={styles.leftPanel}>
          {/* Lock icon */}
          <div style={styles.lockIconWrap}>
            <span style={{ fontSize: 36 }}>🔒</span>
          </div>

          <h2 style={styles.leftTitle}>Email Authentication Login</h2>
          <p style={styles.leftSubtitle}>
            Secure login via Government of India DigiLocker
          </p>

          {/* What you can do */}
          <div style={styles.leftSection}>
            <p style={styles.leftSectionLabel}>WITH DIGILOCKER YOU CAN</p>
            {[
              { icon: "🪪", text: "Verify identity via Aadhaar" },
              { icon: "📄", text: "Access govt-issued documents" },
              { icon: "🔐", text: "Login without a password" },
              { icon: "📧", text: "Authenticate securely using email OTP" },
            ].map(({ icon, text }) => (
              <div key={text} style={styles.leftFeatureRow}>
                <div style={styles.featureIcon}>{icon}</div>
                <span style={styles.featureText}>{text}</span>
              </div>
            ))}
          </div>

          {/* Prerequisites */}
          <div style={styles.prereqBox}>
            <p style={styles.prereqTitle}>📝 Prerequisites for DigiLocker Login:</p>
            <ul style={styles.prereqList}>
              <li>A <strong>DigiLocker account</strong></li>
              <li><strong>Registered email address</strong> OR <strong>Aadhaar</strong> OR <strong>Application ID</strong></li>
              <li><strong>OTP</strong> for verification</li>
            </ul>
            <p style={styles.prereqNote}>🔐 Your data is securely encrypted. We only verify your identity.</p>
          </div>

          {/* Notices */}
          <div style={{ marginTop: 24 }}>
            {[
              { tag: "INFO", text: "Aadhaar seeding mandatory for all fresh applicants from 2025-26" },
              { tag: "UPDATE", text: "DigiLocker login now supports App ID verification" },
            ].map(({ tag, text }) => (
              <div key={tag} style={styles.noticeRow}>
                <span style={{ ...styles.noticeBadge, background: tag === "INFO" ? "#2979ff" : "#00897b" }}>{tag}</span>
                <span style={styles.noticeText}>{text}</span>
              </div>
            ))}
          </div>

          {/* GOI note */}
          <div style={styles.goiNote}>
            🇮🇳 A <strong>Government of India</strong> initiative under the Ministry of Electronics &amp; IT
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>

            {/* Card header */}
            <div style={styles.cardHeader}>
              <div style={{ fontSize: 32 }}>🔒</div>
              <h2 style={styles.cardTitle}>DigiLocker / Aadhaar Login</h2>
              <p style={styles.cardSubtitle}>Secure login via Government of India DigiLocker</p>
            </div>

            <div style={styles.cardBody}>

              {/* Security notice */}
              <div style={styles.securityNotice}>
                ⚠️ This is a secure government portal. Unauthorized access is prohibited under IT Act 2000.
              </div>

              {error && (
                <div style={styles.errorBox}>❌ {error}</div>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <>
                  {/* Method tabs */}
                  <div style={styles.tabs}>
                    {[
                      { key: "email", label: "📧 Email" },
                      { key: "aadhaar", label: "🪪 Aadhaar" },
                      { key: "digi_id", label: "👤 ID/User" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        style={{ ...styles.tabBtn, ...(method === key ? styles.tabBtnActive : {}) }}
                        onClick={() => { setMethod(key); setError(""); setAadhaar(""); setDigiId(""); }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {method === "email" && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>REGISTERED EMAIL *</label>
                      <input
                        style={styles.input}
                        type="email"
                        placeholder="Enter your registered email address"
                        value={digiId}
                        onChange={e => setDigiId(e.target.value)}
                        autoFocus
                      />
                      <div style={styles.hint}>OTP will be sent to this email address</div>
                    </div>
                  )}

                  {method === "aadhaar" && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>AADHAAR NUMBER *</label>
                      <input
                        style={styles.input}
                        type="text"
                        placeholder="Enter 12-digit Aadhaar number"
                        maxLength={12}
                        value={aadhaar}
                        onChange={e => setAadhaar(e.target.value.replace(/\D/g, ""))}
                        autoFocus
                      />
                      <div style={styles.hint}>OTP will be sent to your registered email address</div>
                    </div>
                  )}

                  {method === "digi_id" && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>DIGILOCKER ID / USERNAME *</label>
                      <input
                        style={styles.input}
                        type="text"
                        placeholder="Enter DigiLocker ID (e.g. NSP App ID)"
                        value={digiId}
                        onChange={e => setDigiId(e.target.value)}
                        autoFocus
                      />
                    </div>
                  )}

                  <div style={styles.formGroup}>
                    <label style={styles.label}>ENTER CAPTCHA *</label>
                    <div style={styles.captchaRow}>
                      <div style={styles.captchaBox}>{captcha}</div>
                      <button style={styles.captchaRefreshBtn} onClick={refreshCaptcha} type="button">🔄</button>
                      <input
                        style={{ ...styles.input, flex: 1, marginBottom: 0 }}
                        type="text"
                        placeholder="Type captcha here"
                        value={captchaInput}
                        onChange={e => setCaptchaInput(e.target.value)}
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <button
                    style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }}
                    onClick={handleSendOtp}
                    disabled={loading}
                  >
                    {loading ? "⏳ Connecting to DigiLocker..." : "🔒 Send Email OTP"}
                  </button>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <div style={styles.successBox}>
                    ✅ OTP sent to Email: {loginEmail}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>ENTER OTP *</label>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={e => e.key === "Enter" && handleVerify()}
                      autoFocus
                    />
                    <div style={styles.hint}>Check your email for the 6-digit OTP and enter it here.</div>
                  </div>

                  <button style={styles.primaryBtn} onClick={handleVerify}>
                    ✓ Verify &amp; Login
                  </button>

                  <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                    <button
                      style={styles.linkBtn}
                      onClick={() => { setStep(1); setEnteredOtp(""); setError(""); refreshCaptcha(); }}
                    >
                      ← Change Details
                    </button>
                  </div>
                </>
              )}

              {/* DigiLocker brand note */}
              <div style={styles.brandNote}>
                <div>🔐 Secured by <strong>DigiLocker</strong> — MeitY, Government of India</div>
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>256-bit SSL Encrypted</div>
              </div>

              <div style={{ textAlign: "center", marginTop: 14 }}>
                <Link to="/login" style={{ fontSize: 12, color: "#1565C0", textDecoration: "none" }}>
                  ← Back to Normal Login
                </Link>
              </div>

            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}

/* ── Inline styles ── */
const styles = {
  pageContainer: {
    display: "flex",
    minHeight: "calc(100vh - 120px)",
    background: "#f0f4f8",
  },

  /* LEFT */
  leftPanel: {
    flex: "0 0 42%",
    background: "linear-gradient(160deg, #0d2b6e 0%, #1565C0 60%, #0d47a1 100%)",
    color: "#fff",
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
  },
  lockIconWrap: {
    width: 64,
    height: 64,
    background: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  leftTitle: {
    fontSize: 26,
    fontWeight: 700,
    margin: "0 0 8px",
    lineHeight: 1.2,
  },
  leftSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 32,
  },
  leftSection: {
    marginBottom: 28,
  },
  leftSectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    opacity: 0.6,
    marginBottom: 12,
  },
  leftFeatureRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 18,
    width: 28,
    textAlign: "center",
  },
  featureText: {
    fontSize: 14,
    opacity: 0.92,
  },
  prereqBox: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 10,
    padding: "14px 16px",
    fontSize: 13,
  },
  prereqTitle: {
    fontWeight: 700,
    marginBottom: 8,
    fontSize: 13,
  },
  prereqList: {
    margin: "0 0 8px 18px",
    padding: 0,
    lineHeight: 1.8,
    opacity: 0.9,
  },
  prereqNote: {
    fontSize: 11,
    opacity: 0.65,
    borderTop: "1px solid rgba(255,255,255,0.15)",
    paddingTop: 8,
    marginTop: 4,
  },
  noticeRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 6,
    padding: "8px 10px",
  },
  noticeBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 4,
    color: "#fff",
    letterSpacing: "0.05em",
    flexShrink: 0,
    marginTop: 1,
  },
  noticeText: {
    fontSize: 12,
    opacity: 0.85,
    lineHeight: 1.4,
  },
  goiNote: {
    marginTop: "auto",
    paddingTop: 24,
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 1.5,
  },

  /* RIGHT */
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    background: "#eef2f7",
  },
  formCard: {
    width: "100%",
    maxWidth: 460,
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
    overflow: "hidden",
  },
  cardHeader: {
    background: "linear-gradient(135deg, #1565C0, #0D47A1)",
    color: "#fff",
    padding: "28px 28px 24px",
    textAlign: "center",
  },
  cardTitle: {
    margin: "8px 0 4px",
    fontSize: 22,
    fontWeight: 700,
  },
  cardSubtitle: {
    margin: 0,
    fontSize: 13,
    opacity: 0.85,
  },
  cardBody: {
    padding: "24px 28px 28px",
  },
  securityNotice: {
    background: "#fff8e1",
    border: "1px solid #ffe082",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#5d4037",
    marginBottom: 16,
    lineHeight: 1.5,
  },
  errorBox: {
    background: "#ffebee",
    border: "1px solid #ef9a9a",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#c62828",
    marginBottom: 14,
  },
  successBox: {
    background: "#e8f5e9",
    border: "1px solid #a5d6a7",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#2e7d32",
    marginBottom: 16,
  },

  /* Tabs */
  tabs: {
    display: "flex",
    gap: 6,
    marginBottom: 18,
    background: "#f1f4f9",
    borderRadius: 10,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    padding: "8px 4px",
    fontSize: 13,
    border: "none",
    borderRadius: 7,
    background: "transparent",
    color: "#555",
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.2s",
  },
  tabBtnActive: {
    background: "#1565C0",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(21,101,192,0.35)",
  },

  /* Form elements */
  formGroup: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.07em",
    color: "#4a5568",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1.5px solid #d0d9e8",
    borderRadius: 8,
    fontSize: 14,
    color: "#1a202c",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    background: "#fafbfd",
  },
  hint: {
    fontSize: 11,
    color: "#718096",
    marginTop: 4,
  },
  captchaRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  captchaBox: {
    background: "#e8eaf6",
    border: "1.5px solid #9fa8da",
    borderRadius: 8,
    padding: "8px 14px",
    fontFamily: "monospace",
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: "6px",
    color: "#1a237e",
    flexShrink: 0,
    userSelect: "none",
  },
  captchaRefreshBtn: {
    background: "none",
    border: "1.5px solid #ccc",
    borderRadius: 8,
    padding: "8px 10px",
    cursor: "pointer",
    fontSize: 16,
    flexShrink: 0,
  },

  /* Buttons */
  primaryBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #1565C0, #0D47A1)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 4,
    letterSpacing: "0.02em",
    boxShadow: "0 4px 14px rgba(21,101,192,0.35)",
  },
  linkBtn: {
    flex: 1,
    background: "none",
    border: "1px solid #cdd5e0",
    borderRadius: 6,
    padding: "7px 10px",
    fontSize: 12,
    color: "#1565C0",
    cursor: "pointer",
    textAlign: "center",
  },

  brandNote: {
    marginTop: 20,
    background: "#E3F2FD",
    border: "1px solid #90caf9",
    borderRadius: 6,
    padding: "10px 14px",
    textAlign: "center",
    fontSize: 12,
    color: "#0d47a1",
    lineHeight: 1.8,
  },
};