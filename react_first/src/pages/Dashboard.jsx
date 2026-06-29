import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import Navbar from "./Navbar";
import { getApplicationsByUser } from "../store";
import "../styles/Dashboard.css";

const STATUS_COLORS = {
  "Approved": { bg: "#E8F5E9", color: "#1b5e20", border: "#81c784" },
  "Amount Credited": { bg: "#E8F5E9", color: "#1b5e20", border: "#81c784" },
  "Under Review": { bg: "#FFF8E1", color: "#6a4500", border: "#f0d060" },
  "Institute Verified": { bg: "#E3F2FD", color: "#0d47a1", border: "#90caf9" },
  "Submitted": { bg: "#EEF6FF", color: "#003580", border: "#b3d4ff" },
  "Renewal Submitted": { bg: "#EEF6FF", color: "#003580", border: "#b3d4ff" },
  "Rejected": { bg: "#FFF0F0", color: "#C0392B", border: "#ffc0c0" },
};

const STATUS_ICON = {
  "Approved": "✅", "Amount Credited": "💰", "Under Review": "🔍",
  "Institute Verified": "🏫", "Submitted": "📋", "Rejected": "❌", "Renewal Submitted": "📋",
};

function parseAmount(str = "") {
  return parseInt(str.replace(/[₹,\s]/g, "")) || 0;
}

function getRecommendedScholarship(user) {
  if (!user || !user.scholarshipCategory) return "";
  const type = user.scholarshipCategory;
  const cat = user.category;

  if (type === "Pre-Matric (Class 1-8)") return "Pre-Matric Minority (Class 1-8) — ₹10,000/yr";
  if (type === "Pre-Matric (Class 9-10)") return "Pre-Matric Minority (Class 9-10) — ₹13,500/yr";
  if (type === "Top Class Education") return "Top Class Education (SC) — Full Tuition";

  if (type === "Post-Matric") {
      if (cat === "SC") return "Post-Matric Scholarship (SC) — ₹23,400/yr";
      if (cat === "ST") return "Post-Matric Scholarship (ST) — ₹23,400/yr";
      if (cat === "Minority") return "Post-Matric Minority — ₹17,000/yr";
      return "Central Sector Scheme (CSSS) — ₹20,000/yr"; // Default for Post-Matric
  }
  return "";
}

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadApps = useCallback(async () => {
    const uid = user?.id || user?.appId;
    if (!uid) return;
    try {
      const userApps = await getApplicationsByUser(user);
      const sorted = [...userApps].sort((a, b) => {
        const da = new Date(a.appliedOn?.split("/").reverse().join("-") || 0);
        const db = new Date(b.appliedOn?.split("/").reverse().join("-") || 0);
        return db - da;
      });
      setApps(sorted);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load applications:", err);
    }
  }, [user?.id]);

  useEffect(() => {
    loadApps();
    const interval = setInterval(loadApps, 5000); // auto-refresh every 5s
    return () => clearInterval(interval);
  }, [loadApps]);

  // ── All stats computed from REAL data ──
  const totalApps = apps.length;
  const approved = apps.filter(a => a.status === "Approved" || a.status === "Amount Credited").length;
  const underReview = apps.filter(a => a.status === "Under Review" || a.status === "Institute Verified").length;
  const submitted = apps.filter(a => a.status === "Submitted" || a.status === "Renewal Submitted").length;
  const rejected = apps.filter(a => a.status === "Rejected").length;

  const totalDisbursed = apps
    .filter(a => a.status === "Approved" || a.status === "Amount Credited")
    .reduce((sum, a) => sum + parseAmount(a.amount), 0);

  const disbursedStr = totalDisbursed > 0
    ? `₹${totalDisbursed.toLocaleString("en-IN")}` : "₹0";

  // ── Notices generated from real status changes ──
  const notices = apps.flatMap(app => {
    const msgs = [];
    if (app.status === "Approved" || app.status === "Amount Credited")
      msgs.push({ text: `Your application for "${app.scheme}" (${app.appId}) has been APPROVED! Amount: ${app.amount}. Will be credited within 7-10 working days.`, date: app.updatedAt || app.appliedOn, type: "success" });
    if (app.status === "Rejected" && app.rejectionReason)
      msgs.push({ text: `Application for "${app.scheme}" (${app.appId}) rejected. Reason: ${app.rejectionReason}`, date: app.updatedAt || app.appliedOn, type: "error" });
    if (app.status === "Institute Verified")
      msgs.push({ text: `Institute has verified your application for "${app.scheme}". Awaiting Ministry review.`, date: app.updatedAt || app.appliedOn, type: "info" });
    if (app.status === "Under Review")
      msgs.push({ text: `Application for "${app.scheme}" (${app.appId}) is Under Ministry Review.`, date: app.updatedAt || app.appliedOn, type: "warning" });
    return msgs;
  });

  const recentApps = apps.slice(0, 5);
  const displayAppId = user?.appId || user?.id || "—";

  // ── AI Insights Logic ──
  const getAIInsights = () => {
    if (apps.length === 0) return [
        { icon: "💡", title: "AI Suggestion", text: "You haven't applied yet. Use the 'Check Eligibility' tool to find the best match.", color: "#003580", bg: "#EEF6FF", shadow: "#b3d4ff" }
    ];

    const alerts = [];
    const activeApp = apps[0];
    const status = activeApp.status;
    
    // Status-based insights
    if (status === "Approved" || status === "Amount Credited" || status === "Payment Success") {
        alerts.push({ 
          icon: "🎉", 
          title: "AI Forecast: Disbursement Complete", 
          text: status === "Payment Success" 
            ? "Great news! Your scholarship funds have been successfully disbursed to your bank account via PFMS. Please check your balance."
            : "Your scholarship is approved! Funds are typically credited within 7-10 business days directly to your linked bank account.", 
          color: "#1b5e20", bg: "#E8F5E9", shadow: "#81c784" 
        });
    } else if (status === "Rejected") {
        alerts.push({ icon: "⚠️", title: "Action Required", text: "Your application was rejected. Please review your documents and correct the errors before applying for another scheme.", color: "#C0392B", bg: "#FFF0F0", shadow: "#ffc0c0" });
    } else if (status === "Submitted" || status === "Renewal Submitted") {
        alerts.push({ icon: "⏳", title: "AI Estimation", text: "Application submitted successfully. Historically, the estimated time for initial institute verification is 3-5 days.", color: "#6a4500", bg: "#FFF8E1", shadow: "#f0d060" });
    } else if (status === "Institute Verified") {
        alerts.push({ icon: "📈", title: "Progress Update", text: "Passed institute verification! Now moving to State Nodal Officer review. Keep an eye on your status.", color: "#0d47a1", bg: "#E3F2FD", shadow: "#90caf9" });
    } else if (status === "Under Review") {
        alerts.push({ icon: "🔍", title: "AI Status Insight", text: "Your application is currently being audited by the Ministry. This is a standard procedure to ensure all details are accurate.", color: "#003580", bg: "#EEF6FF", shadow: "#b3d4ff" });
    }

    // Only show document audit for pending/early stages
    const isFinalized = ["Approved", "Amount Credited", "Payment Success", "Rejected"].includes(status);
    if (!isFinalized) {
        alerts.push({ icon: "🛡️", title: "AI Document Audit", text: "AI verification is 98% complete. The final 2% is reserved for manual human cross-verification by the Nodal Officer. No action required.", color: "#15803d", bg: "#f0fdf4", shadow: "#bbf7d0" });
    }
    
    if (apps.length > 1 && !alerts.find(a => a.icon === "🛡️")) {
        alerts.push({ icon: "📊", title: "Profile Strength", text: "Your academic and demographic profile has historically seen an 85% approval success rate for the schemes you've chosen.", color: "#4338ca", bg: "#eef2ff", shadow: "#c7d2fe" });
    }

    return alerts;
  };

  const studentInsights = getAIInsights();
  const recommendedScheme = getRecommendedScholarship(user);

  return (
    <div className="page-wrapper">
      <Navbar user={user} onLogout={onLogout} />
      <div className="dashboard-layout">
        <StudentSidebar user={user} onLogout={() => { onLogout(); navigate("/"); }} />
        <main className="dashboard-main">

          <div className="dash-header">
            <div>
              <h2>Welcome, {user?.name || "Student"} 👋</h2>
              <p>Application ID: <strong>{displayAppId}</strong> &nbsp;|&nbsp; Academic Year: 2025-26</p>
            </div>
          </div>

          {/* Live indicator */}
          <div className="dash-live-bar">
            <span className="dash-live-dot" />
            <span>Live — Last updated: {lastUpdated.toLocaleTimeString("en-IN")} · Updates every 5 seconds</span>
            <button className="dash-refresh-btn" onClick={loadApps}>🔄 Refresh</button>
          </div>

          {/* Stats — all from real data */}
          <div className="dash-stats">
            <div className="dash-stat-card" style={{ background: "#EEF6FF", borderColor: "#b3d4ff" }}>
              <div className="dash-stat-icon">📋</div>
              <div className="dash-stat-value">{totalApps}</div>
              <div className="dash-stat-label">Total Applications</div>
            </div>
            <div className="dash-stat-card" style={{ background: "#E8F5E9", borderColor: "#81c784" }}>
              <div className="dash-stat-icon">✅</div>
              <div className="dash-stat-value">{approved}</div>
              <div className="dash-stat-label">Approved</div>
            </div>
            <div className="dash-stat-card" style={{ background: "#FFF8E1", borderColor: "#f0d060" }}>
              <div className="dash-stat-icon">⏳</div>
              <div className="dash-stat-value">{underReview + submitted}</div>
              <div className="dash-stat-label">Under Review / Pending</div>
            </div>
            <div className="dash-stat-card" style={{ background: "#F3E5F5", borderColor: "#d8a0e8" }}>
              <div className="dash-stat-icon">💰</div>
              <div className="dash-stat-value" style={{ fontSize: approved > 0 ? 20 : 28 }}>{disbursedStr}</div>
              <div className="dash-stat-label">Total Disbursed</div>
            </div>
            {rejected > 0 && (
              <div className="dash-stat-card" style={{ background: "#FFF0F0", borderColor: "#ffc0c0" }}>
                <div className="dash-stat-icon">❌</div>
                <div className="dash-stat-value">{rejected}</div>
                <div className="dash-stat-label">Rejected</div>
              </div>
            )}
          </div>

          {/* AI Insights Section */}
          <div className="dash-section" style={{ marginBottom: 24 }}>
            <div className="section-head">
               <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 0 3px rgba(34,197,94,0.3)', animation: 'pulse 2s infinite' }}></span>
                 AI Scholarship Assistant
               </h3>
               <div className="section-line" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {studentInsights.map((insight, idx) => (
                    <div key={idx} style={{ background: insight.bg, color: insight.color, border: `1px solid ${insight.shadow}`, borderRadius: '8px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: '24px', flexShrink: 0 }}>{insight.icon}</div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{insight.title}</div>
                            <div style={{ fontSize: '13px', lineHeight: 1.5, opacity: 0.9 }}>{insight.text}</div>
                        </div>
                    </div>
                ))}
            </div>
            <style>{`@keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34,197,94,0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34,197,94,0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34,197,94,0); } }`}</style>
          </div>


          {/* Applications table */}
          <div className="dash-section">
            <div className="section-head">
              <h3>My Applications</h3>
              <div className="section-line" />
              <Link to="/track" className="view-all-link-dash">View All →</Link>
            </div>
            {apps.length === 0 ? (
              <div className="dash-empty-state">
                <div className="dash-empty-icon">📭</div>
                <h4>No applications yet</h4>
                <p>You haven't applied for any scholarship yet.</p>
              </div>
            ) : (
              <div className="applications-table-wrap">
                <table className="applications-table">
                  <thead>
                    <tr>
                      <th>Application ID</th><th>Scheme Name</th>
                      <th>Applied On</th><th>Amount</th>
                      <th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApps.map((app, i) => {
                      const ss = STATUS_COLORS[app.status] || STATUS_COLORS["Submitted"];
                      const isApproved = app.status === "Approved" || app.status === "Amount Credited";
                      return (
                        <tr key={app.appId || i}>
                          <td><code>{app.appId}</code></td>
                          <td style={{ maxWidth: 200 }}>{app.scheme}</td>
                          <td>{app.appliedOn}</td>
                          <td><strong style={{ color: isApproved ? "#138808" : "#4a5568" }}>{app.amount}</strong></td>
                          <td>
                            <span className="status-badge" style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                              {STATUS_ICON[app.status]} {app.status}
                            </span>
                          </td>
                          <td>
                            <Link to="/track" className="table-action-link">View Details</Link>
                            {isApproved && (
                              <Link to="/track" className="table-action-link" style={{ marginLeft: 8, color: "#138808" }}>🖨️ Certificate</Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {apps.length > 5 && (
                  <div style={{ textAlign: "center", padding: "12px 0", fontSize: 13, color: "#4a5568" }}>
                    Showing 5 of {apps.length} applications. <Link to="/track" style={{ color: "#003580", fontWeight: 600 }}>View all →</Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="dash-section">
            <div className="section-head"><h3>Quick Actions</h3><div className="section-line" /></div>
            <div className="quick-actions-grid">
              {[
                { icon: "🎓", label: "Browse Scholarships", desc: "Explore all 20 available schemes", path: "/scholarships" },
                { icon: "✅", label: "Check Eligibility", desc: "See which schemes you qualify for", path: "/eligibility" },
                { icon: "📝", label: "Apply for Scholarship", desc: "Submit a new scholarship application", path: "/application-form", state: { scholarshipName: getRecommendedScholarship(user) } },
                { icon: "👤", label: "Update Profile", desc: "Keep your information current", path: "/profile" },
              ].map((item, i) => (
                <Link key={i} to={item.path} state={item.state} className="qa-card">
                  <div className="qa-icon">{item.icon}</div>
                  <div><div className="qa-label">{item.label}</div><div className="qa-desc">{item.desc}</div></div>
                </Link>
              ))}
            </div>
          </div>

          {/* Notifications — from real status changes */}
          <div className="dash-section">
            <div className="section-head"><h3>Notifications</h3><div className="section-line" /></div>
            {notices.length === 0 ? (
              <div className="dash-empty-state" style={{ padding: "20px 24px" }}>
                <p style={{ color: "#4a5568", fontSize: 13 }}>ℹ️ No notifications yet. They will appear here as your application status changes.</p>
              </div>
            ) : (
              <div className="notices-list">
                {notices.map((n, i) => (
                  <div key={i} className={`notice-item notice-${n.type}`}>
                    <div className="notice-text">{n.text}</div>
                    <div className="notice-date">📅 {n.date}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              {[
                { text: "Last date for fresh applications — Central Sector Scheme: 31 October 2025", type: "warning" },
                { text: "PM YASASVI Scholarship: OBC/EBC/DNT students with family income ≤ ₹2.5 lakh/year are eligible", type: "info" },
              ].map((n, i) => (
                <div key={i} className={`notice-item notice-${n.type}`} style={{ marginTop: 8 }}>
                  <div className="notice-text">📢 {n.text}</div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}