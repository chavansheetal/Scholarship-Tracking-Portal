import { useState } from "react";
import { getUserByAppId, getApplicationsByUser } from "../store";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/ApplicationTracking.css";
import "../styles/TrackStatus.css";

export default function TrackStatus({ user, onLogout }) {
  const [appId, setAppId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTrack = async () => {
    setSearched(true);
    setErrorMsg("");
    setResult(null);

    if (!appId || !password) return;

    const userMatch = await getUserByAppId(appId.trim());

    if (!userMatch) {
      setErrorMsg("Application ID not found. Please check your ID or register first.");
      return;
    }

    if (userMatch.password !== password) {
      setErrorMsg("Invalid Password. Please enter the password used during registration.");
      return;
    }

    const apps = await getApplicationsByUser(userMatch);

    if (!apps || apps.length === 0) {
      setErrorMsg("No application found. Please apply for a scholarship first.");
      return;
    }

    setResult(apps[0]);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Rejected":
        return { background: "#FFF0F0", border: "1px solid #f87171", color: "#b91c1c" };
      case "Approved":
      case "Amount Credited":
        return { background: "#F0FFF4", border: "1px solid #4ade80", color: "#166534" };
      case "Under Review":
      case "Institute Verified":
        return { background: "#FFFBEB", border: "1px solid #fbbf24", color: "#92400e" };
      default:
        return { background: "#EFF6FF", border: "1px solid #60a5fa", color: "#1e40af" };
    }
  };

  const getStepStyle = (stepIndex, isDone, status, totalDone) => {
    // Step 0 (Application Submitted) is always green if done
    if (!isDone) return { dot: {}, label: { color: "#64748b" } };

    if (status === "Rejected") {
      if (stepIndex === 0) {
        // First step always green
        return {
          dot: { background: "#16a34a", borderColor: "#16a34a", color: "white" },
          label: { color: "#16a34a", fontWeight: 600 }
        };
      }
      // All other done steps in red with ✕
      return {
        dot: { background: "#ef4444", borderColor: "#ef4444", color: "white" },
        label: { color: "#b91c1c", fontWeight: 600 },
        isCross: true
      };
    }

    if (status === "Under Review" || status === "Institute Verified" || status === "Submitted") {
      return {
        dot: { background: "#f59e0b", borderColor: "#f59e0b", color: "white" },
        label: { color: "#92400e", fontWeight: 600 }
      };
    }

    // Approved / Amount Credited — all green
    return {
      dot: { background: "#16a34a", borderColor: "#16a34a", color: "white" },
      label: { color: "#16a34a", fontWeight: 600 }
    };
  };

  return (
    <div className="page-wrapper">
      <Navbar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="track-layout">
          <div className="track-form-col">
            <div className="track-card">
              <div className="track-card-head">
                <h2>📊 Track Application Status</h2>
                <p>Enter your Application ID and Password to track status.</p>
              </div>
              <div className="track-card-body">
                <div className="form-group">
                  <label>Application ID *</label>
                  <input
                    type="text"
                    placeholder="e.g. NSP/2025/KA/001234"
                    value={appId}
                    onChange={e => setAppId(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleTrack()}
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Registration Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleTrack()}
                      style={{ width: "100%", paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute", right: "10px", background: "none",
                        border: "none", cursor: "pointer", fontSize: "16px", padding: "0"
                      }}
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>

                <button className="btn-gov" onClick={handleTrack}>🔍 Track Application</button>

                {searched && (!appId || !password) && (
                  <div className="alert alert-error" style={{ marginTop: 16 }}>
                    Please fill in all required fields.
                  </div>
                )}
                {errorMsg && (
                  <div className="alert alert-error" style={{ marginTop: 16 }}>{errorMsg}</div>
                )}

                {result && (
                  <div className="track-result">
                    {/* Applicant Info */}
                    <div className="alert alert-info">
                      <strong>Applicant:</strong>{" "}
                      {result.studentName || result.personalDetails?.fullName}
                      &nbsp;|&nbsp;
                      <strong>Scheme:</strong> {result.scheme}
                    </div>

                    {/* Status Badge */}
                    <div className="track-status-badge" style={{ ...getStatusStyle(result.status), borderRadius: 6, padding: "10px 14px", marginBottom: 12 }}>
                      Status: <strong>{result.status}</strong>
                    </div>

                    {/* ✅ Rejection Reason Box */}
                    {result.status === "Rejected" && result.rejectionReason && (
                      <div style={{
                        background: "#FFF0F0",
                        border: "1px solid #f87171",
                        borderRadius: 6,
                        padding: "10px 14px",
                        marginBottom: 14,
                        fontSize: 13,
                        color: "#b91c1c"
                      }}>
                        <strong>❌ Rejection Reason:</strong> {result.rejectionReason}
                      </div>
                    )}

                    {/* Timeline */}
                    {result.timeline && (
                      <div className="track-timeline">
                        {result.timeline.map((t, i) => {
                          const totalDone = result.timeline.filter(s => s.done).length;
                          const stepStyle = getStepStyle(i, t.done, result.status, totalDone);

                          return (
                            <div key={i} className={`track-step ${t.done ? "done" : ""}`}>
                              <div className="track-dot" style={stepStyle.dot}>
                                {t.done
                                  ? (stepStyle.isCross ? "✕" : "✓")
                                  : i + 1}
                              </div>
                              <div className="track-step-info">
                                <span className="track-step-label" style={stepStyle.label}>
                                  {t.step}
                                </span>
                                <span className="track-step-date">{t.date}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Scholarship Amount */}
                    <div className="track-amount" style={{
                      background: result.status === "Rejected" ? "#FFF0F0" :
                                  result.status === "Approved" || result.status === "Amount Credited" ? "#F0FFF4" :
                                  "#FFFBEB",
                      border: `1px solid ${result.status === "Rejected" ? "#f87171" :
                               result.status === "Approved" || result.status === "Amount Credited" ? "#4ade80" :
                               "#fbbf24"}`,
                      color: result.status === "Rejected" ? "#b91c1c" :
                             result.status === "Approved" || result.status === "Amount Credited" ? "#166534" :
                             "#92400e",
                      borderRadius: 6,
                      padding: "10px 14px",
                      marginTop: 12
                    }}>
                      Scholarship Amount: <strong>{result.amount || "—"}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="track-info-col">
            <div style={{ background: "white", border: "1px solid #CBD5E1", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ background: "#003580", color: "white", padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>
                ℹ️ About Application Status
              </div>
              <div style={{ padding: 16 }}>
                {[
                  { status: "Submitted",          desc: "Application received by NSP." },
                  { status: "Institute Verified",  desc: "Institute has confirmed enrollment." },
                  { status: "Under Review",        desc: "Being reviewed by Ministry." },
                  { status: "Approved",            desc: "Application approved for disbursement." },
                  { status: "Amount Credited",     desc: "Scholarship credited to your bank." },
                  { status: "Rejected",            desc: "Application not approved. See remarks." },
                ].map((s, i) => (
                  <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #eef0f8", fontSize: 12 }}>
                    <strong style={{ color: "#003580" }}>{s.status}:</strong> {s.desc}
                  </div>
                ))}
              </div>
            </div>
            <div className="alert alert-warning" style={{ marginTop: 16 }}>
              📞 For issues, contact helpdesk at <strong>0120-6619540</strong> or email{" "}
              <strong>helpdesk@nsp.gov.in</strong>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}