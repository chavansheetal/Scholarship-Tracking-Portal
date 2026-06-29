import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getApplications,
  updateApplicationStatus,
  getGrievances,
  updateGrievance,
  verifyByInstitute,
  verifyByState,
  approveByMinistry,
  simulatePayment
} from "../store";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import "../styles/AdminDashboard.css";

const STATUS_STYLE = {
  "Submitted": { bg: "#EEF6FF", color: "#003580", border: "#b3d4ff" },
  "Institute Verified": { bg: "#E3F2FD", color: "#0d47a1", border: "#90caf9" },
  "State Verified": { bg: "#F0F4FF", color: "#2563EB", border: "#BFDBFE" },
  "Approved for Payment": { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  "Payment Success": { bg: "#E8F5E9", color: "#1b5e20", border: "#81c784" },
  "Rejected": { bg: "#FFF0F0", color: "#C0392B", border: "#ffc0c0" },
  "Rejected - Seats Full": { bg: "#FFF0F0", color: "#C0392B", border: "#ffc0c0" },
  "Under Review": { bg: "#FFF8E1", color: "#6a4500", border: "#f0d060" },
  "Approved": { bg: "#E8F5E9", color: "#1b5e20", border: "#81c784" },
  "Amount Credited": { bg: "#E8F5E9", color: "#1b5e20", border: "#81c784" },
};

const STATUS_FLOW = ["Submitted", "Institute Verified", "State Verified", "Approved for Payment", "Payment Success"];
const ALL_STATUSES = [...STATUS_FLOW, "Rejected", "Rejected - Seats Full", "Under Review"];

export default function AdminDashboard({ adminUser, onLogout }) {
  const navigate = useNavigate();

  // ── Applications state ──
  const [apps, setApps] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterScheme, setFilterScheme] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");
  const [activeNav, setActiveNav] = useState("applications");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [viewingImage, setViewingImage] = useState(null);

  // ── Grievances state ──
  const [grievances, setGrievances] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [gFilter, setGFilter] = useState("All"); // All | Open | Resolved | In Progress

  const loadApps = async () => {
    try {
      const data = await getApplications();
      setApps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setApps([]);
    }
  };
  const loadGrievances = async () => {
    try {
      const data = await getGrievances();
      setGrievances(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setGrievances([]);
    }
  };

  useEffect(() => { loadApps(); loadGrievances(); }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(() => { loadApps(); loadGrievances(); }, 5000);
    return () => clearInterval(t);
  }, [autoRefresh]);

  const showToast = (msg, type = "success") => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(""), 3500);
  };

  const handleAction = async (status) => {
    const target = actionModal || selected;
    if (!target) return;

    if (status === "Rejected" && !rejectReason.trim()) {
      alert("Please provide a rejection reason before rejecting.");
      return;
    }
    try {
      let response;
      const appId = target.appId;

      // Use specific API calls based on the target status
      if (status === "Institute Verified") {
        response = await verifyByInstitute(appId, adminUser?.role === "Institute Nodal Officer" ? "institute" : "admin");
      } else if (status === "State Verified") {
        response = await verifyByState(appId, adminUser?.role === "State Nodal Officer" ? "state" : "admin");
      } else if (status === "Approved for Payment") {
        response = await approveByMinistry(appId, adminUser?.role === "Ministry Admin" ? "ministry" : "admin");
      } else if (status === "Payment Success") {
        response = await simulatePayment(appId);
      } else {
        // Fallback to legacy status update for other statuses (e.g. Rejected)
        response = await updateApplicationStatus(appId, status, status === "Rejected" ? rejectReason : "");
      }

      await loadApps();
      setActionModal(null);
      setRejectReason("");

      const allApps = await getApplications();
      const safeApps = Array.isArray(allApps) ? allApps : [];
      const updated = safeApps.find(a => a.appId === appId);
      setSelected(updated || null);

      let msg = status === "Rejected" ? "Application rejected" : `Application moved to ${status}`;
      if (response && response.message) msg = response.message;

      showToast(msg, status.includes("Rejected") ? "error" : "success");
    } catch (err) {
      showToast("Error updating application: " + err.message, "error");
    }
  };

  // Send reply to grievance
  const handleGrievanceReply = async (gid) => {
    const txt = replyText[gid];
    if (!txt?.trim()) return;

    try {
      await updateGrievance(gid, {
        status: "Resolved",
        adminReply: txt,
        repliedAt: new Date().toLocaleDateString("en-IN")
      });
      showToast("Reply sent & Grievance resolved!");
      setReplyText(prev => ({ ...prev, [gid]: "" }));
      loadGrievances();
    } catch (err) {
      showToast("Failed to reply: " + err.message, "error");
    }
  };

  const markInProgress = async (id) => {
    try {
      await updateGrievance(id, { status: "In Progress" });
      await loadGrievances();
      showToast("🔄 Marked as In Progress.");
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  const filtered = apps.filter(a => {
    let sMatch = false;
    if (filterStatus === "All") {
      sMatch = true;
    } else if (filterStatus === "PendingGroup") {
      sMatch = ["Submitted", "Renewal Submitted", "Institute Verified", "State Verified"].includes(a.status);
    } else if (filterStatus === "ApprovedGroup") {
      sMatch = ["Approved", "Amount Credited", "Approved for Payment", "Payment Success"].includes(a.status);
    } else if (filterStatus === "RejectedGroup") {
      sMatch = ["Rejected", "Rejected - Seats Full"].includes(a.status);
    } else {
      sMatch = a.status === filterStatus;
    }
    const schMatch = filterScheme === "All" || a.scheme === filterScheme;
    const srchMatch = !search ||
      a.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      a.appId?.toLowerCase().includes(search.toLowerCase()) ||
      a.scheme?.toLowerCase().includes(search.toLowerCase());
    return sMatch && schMatch && srchMatch;
  });

  const filteredGrievances = grievances
    .slice()
    .reverse()
    .filter(g => gFilter === "All" || g.status === gFilter);

  const schemes = [...new Set(apps.map(a => a.scheme).filter(Boolean))];

  const stats = {
    total:    apps.length,
    submitted: apps.filter(a => ["Submitted", "Renewal Submitted", "Institute Verified", "State Verified"].includes(a.status)).length,
    verified:  apps.filter(a => a.status === "Institute Verified").length,
    review:    apps.filter(a => a.status === "Under Review").length,
    approved:  apps.filter(a => ["Approved", "Amount Credited", "Approved for Payment", "Payment Success"].includes(a.status)).length,
    rejected:  apps.filter(a => ["Rejected", "Rejected - Seats Full"].includes(a.status)).length,
  };

  const openGrievances = grievances.filter(g => g.status === "Open").length;

  const NAV_ITEMS = [
    { id: "applications", icon: "📋", label: "All Applications", filter: "All" },
    { id: "pending", icon: "⏳", label: `Pending (${stats.submitted})`, filter: "PendingGroup" },
    { id: "review", icon: "🔍", label: `Under Review (${stats.review})`, filter: "Under Review" },
    { id: "approved", icon: "✅", label: `Approved (${stats.approved})`, filter: "ApprovedGroup" },
    { id: "rejected", icon: "❌", label: `Rejected (${stats.rejected})`, filter: "RejectedGroup" },
    { id: "grievances", icon: "📨", label: `Grievances (${openGrievances} Open)`, filter: null },
  ];

  // ── Charts ──
  const generateTrendData = () => {
    const data = [];
    let cur = 5;
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(today.getDate() - i);
      const label = i === 0 ? "Today" : d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      cur += Math.floor(Math.random() * 8) + 2;
      data.push({ name: label, actual: cur, predicted: null });
    }
    data[data.length - 1].actual += apps.length;
    let last = data[data.length - 1].actual;
    data[data.length - 1].predicted = last;
    for (let i = 1; i <= 4; i++) {
      const d = new Date(); d.setDate(today.getDate() + i);
      last += Math.floor(Math.random() * 12) + 5;
      data.push({ name: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }), actual: null, predicted: last });
    }
    return data;
  };
  const trendData = apps.length > 0 ? generateTrendData() : [];
  const STATUS_COLORS = {
    "Submitted": "#3b82f6", // Blue
    "Institute Verified": "#0ea5e9", // Light Blue
    "State Verified": "#8b5cf6", // Purple
    "Approved for Payment": "#f59e0b", // Amber
    "Payment Success": "#10b981", // Emerald
    "Rejected": "#ef4444", // Red
    "Rejected - Seats Full": "#b91c1c", // Dark Red
    "Under Review": "#f97316", // Orange
    "Approved": "#84cc16", // Lime
    "Amount Credited": "#15803d", // Dark Green
    "Renewal Submitted": "#6366f1", // Indigo
  };
  const FALLBACK_COLORS = ["#14b8a6", "#ec4899", "#a855f7", "#eab308", "#06b6d4"];

  const approvalData = Object.entries(
    apps.reduce((acc, app) => {
      const s = app.status || "Unknown";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value], idx) => ({
    name,
    value,
    color: STATUS_COLORS[name] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length]
  }));

  const generateInsights = () => {
    const insights = [];
    const rejRate = apps.length ? (stats.rejected / apps.length) * 100 : 0;
    if (stats.submitted > 5)
      insights.push({ icon: "⚠️", text: `High volume of pending (${stats.submitted}). Fast-track review recommended.`, color: "#b45309", bg: "#fef3c7" });
    else
      insights.push({ icon: "📈", text: "Application inflow is stable.", color: "#0f766e", bg: "#ccfbf1" });
    if (rejRate > 30)
      insights.push({ icon: "🚨", text: `High rejection rate (${rejRate.toFixed(1)}%). Review criteria.`, color: "#be123c", bg: "#ffe4e6" });
    else if (stats.approved > 0)
      insights.push({ icon: "✅", text: "Approval workflow is healthy.", color: "#15803d", bg: "#dcfce3" });
    if (openGrievances > 0)
      insights.push({ icon: "📨", text: `${openGrievances} open grievance(s) await your response.`, color: "#7c3aed", bg: "#ede9fe" });
    return insights;
  };
  const aiInsights = apps.length > 0 ? generateInsights() : [];

  const getFilesFromApp = (app) => {
    if (!app) return null;
    if (app.personalDetails?.files && Object.keys(app.personalDetails.files).length > 0) return app.personalDetails.files;
    if (app.files && Object.keys(app.files).length > 0) return app.files;
    if (app.academicDetails?.files && Object.keys(app.academicDetails.files).length > 0) return app.academicDetails.files;
    return null;
  };

  const gStatusStyle = (s) => ({
    background: s === "Resolved" ? "#F0FFF4" : s === "In Progress" ? "#FFFBEB" : "#EFF6FF",
    color: s === "Resolved" ? "#166534" : s === "In Progress" ? "#92400e" : "#1e40af",
    border: `1px solid ${s === "Resolved" ? "#4ade80" : s === "In Progress" ? "#fbbf24" : "#60a5fa"}`,
  });

  return (
    <div className="admin-layout">

      {toast && (
        <div className={`admin-toast ${toastType === "error" ? "admin-toast-error" : ""}`}>
          {toast}
        </div>
      )}

      {/* ══ SIDEBAR ══ */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">🏛</div>
          <div>
            <div className="admin-brand-title">USP Admin</div>
            <div className="admin-brand-sub">Ministry Portal</div>
          </div>
        </div>
        <div className="admin-profile">
          <div className="admin-avatar">{adminUser?.name?.[0] || "A"}</div>
          <div>
            <div className="admin-name">{adminUser?.name}</div>
            <div className="admin-role">{adminUser?.role}</div>
            <div className="admin-ministry">{adminUser?.ministry}</div>
          </div>
        </div>
        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              className={`admin-nav-link ${activeNav === item.id ? "active" : ""}`}
              onClick={() => {
                setActiveNav(item.id);
                if (item.filter !== null) setFilterStatus(item.filter);
                setSelected(null);
              }}
            >
              <span>{item.icon}</span> {item.label}
              {item.id === "grievances" && openGrievances > 0 && (
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>
                  {openGrievances}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-refresh-toggle">
            <label style={{ fontSize: 11, color: "#adc8ff", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
              Auto-refresh (5s)
            </label>
          </div>
          <Link to="/" className="admin-footer-link">🏠 Student Portal</Link>
          <button className="admin-logout-btn" onClick={() => { onLogout(); navigate("/admin"); }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Unified Scholarship Plarform — {adminUser?.ministry}</p>
          </div>
          <div className="admin-header-right">
            <div className="admin-date">
              📅 {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
            <button className="admin-refresh-btn" onClick={() => { loadApps(); loadGrievances(); }}>🔄 Refresh Now</button>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          {[
            { label: "Total", value: stats.total, icon: "📋", color: "#EEF6FF", border: "#b3d4ff", tc: "#003580" },
            { label: "Pending", value: stats.submitted, icon: "⏳", color: "#FFF8E1", border: "#f0d060", tc: "#6a4500" },
            { label: "Under Review", value: stats.review, icon: "🔍", color: "#E3F2FD", border: "#90caf9", tc: "#0d47a1" },
            { label: "Approved", value: stats.approved, icon: "✅", color: "#E8F5E9", border: "#81c784", tc: "#1b5e20" },
            { label: "Rejected", value: stats.rejected, icon: "❌", color: "#FFF0F0", border: "#ffc0c0", tc: "#C0392B" },
            { label: "Grievances", value: openGrievances, icon: "📨", color: "#F5F3FF", border: "#c4b5fd", tc: "#7c3aed" },
          ].map((s, i) => (
            <div key={i} className="admin-stat-card"
              style={{ background: s.color, borderColor: s.border }}
              onClick={() => {
                if (s.label === "Grievances") { setActiveNav("grievances"); }
                else {
                  let f = "All";
                  if (s.label === "Pending") f = "PendingGroup";
                  else if (s.label === "Approved") f = "ApprovedGroup";
                  else if (s.label === "Rejected") f = "RejectedGroup";
                  else if (s.label === "Under Review") f = "Under Review";
                  setFilterStatus(f); setActiveNav("applications");
                }
              }}>
              <div className="admin-stat-icon">{s.icon}</div>
              <div className="admin-stat-value" style={{ color: s.tc }}>{s.value}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ══ GRIEVANCES VIEW ══ */}
        {activeNav === "grievances" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ color: "#003580", margin: 0 }}>
                📨 Student Grievances
                {openGrievances > 0 && (
                  <span style={{ marginLeft: 10, background: "#ef4444", color: "#fff", borderRadius: 10, padding: "2px 10px", fontSize: 13, fontWeight: 700 }}>
                    {openGrievances} Open
                  </span>
                )}
              </h2>
              {/* Filter tabs */}
              <div style={{ display: "flex", gap: 6 }}>
                {["All", "Open", "In Progress", "Resolved"].map(f => (
                  <button key={f} onClick={() => setGFilter(f)}
                    style={{
                      padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                      cursor: "pointer", border: "none",
                      background: gFilter === f ? "#003580" : "#f1f5f9",
                      color: gFilter === f ? "#fff" : "#374151",
                    }}>{f}</button>
                ))}
              </div>
            </div>

            {filteredGrievances.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "#94a3b8", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                <h3 style={{ color: "#64748b" }}>No grievances found</h3>
                <p style={{ fontSize: 13 }}>
                  {gFilter === "All" ? "Students haven't submitted any queries yet." : `No ${gFilter} grievances.`}
                </p>
              </div>
            ) : (
              filteredGrievances.map(g => (
                <div key={g.id} style={{
                  background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
                  marginBottom: 16, overflow: "hidden",
                  boxShadow: g.status === "Open" ? "0 0 0 2px rgba(239,68,68,0.15)" : "0 1px 4px rgba(0,0,0,0.05)",
                }}>
                  {/* Header */}
                  <div style={{
                    background: "#f8fafc", padding: "12px 16px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    borderBottom: "1px solid #e2e8f0", flexWrap: "wrap", gap: 8
                  }}>
                    <div style={{ fontSize: 13 }}>
                      <strong style={{ color: "#003580" }}>{g.id}</strong>
                      &nbsp;|&nbsp; <strong>{g.fullName}</strong>
                      &nbsp;|&nbsp; {g.email}
                      {g.mobile && <>&nbsp;|&nbsp; 📱 {g.mobile}</>}
                      {g.applicationId && <>&nbsp;|&nbsp; App: <strong style={{ color: "#003580" }}>{g.applicationId}</strong></>}
                      <span style={{ color: "#94a3b8", marginLeft: 8, fontSize: 12 }}>{g.submittedAt}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {g.status === "Open" && (
                        <button onClick={() => markInProgress(g.id)}
                          style={{ padding: "4px 12px", fontSize: 12, borderRadius: 6, border: "1px solid #fbbf24", background: "#FFFBEB", color: "#92400e", cursor: "pointer", fontWeight: 600 }}>
                          🔄 Mark In Progress
                        </button>
                      )}
                      <span style={{ ...gStatusStyle(g.status), borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>
                        {g.status}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 700, color: "#003580", marginBottom: 8, fontSize: 14 }}>
                      📌 {g.subject}
                    </div>
                    <div style={{
                      fontSize: 13, color: "#374151", lineHeight: 1.65,
                      background: "#f8fafc", padding: "10px 14px",
                      borderRadius: 6, border: "1px solid #e2e8f0", marginBottom: 12
                    }}>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, marginBottom: 4 }}>STUDENT'S MESSAGE</div>
                      {g.message}
                    </div>

                    {/* Existing reply */}
                    {g.adminReply && (
                      <div style={{ background: "#EFF6FF", border: "1px solid #93c5fd", borderRadius: 6, padding: "10px 14px", marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                          <span>✅ YOUR REPLY</span>
                          <span style={{ fontWeight: 400, color: "#64748b" }}>{g.repliedAt}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#1e3a8a", lineHeight: 1.6 }}>{g.adminReply}</div>
                      </div>
                    )}

                    {/* Reply box — show if not resolved */}
                    {g.status !== "Resolved" && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                          💬 Reply to Student:
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <textarea
                            placeholder="Type your reply here. The student will see this immediately after you send it..."
                            value={replyText[g.id] || ""}
                            onChange={e => setReplyText(prev => ({ ...prev, [g.id]: e.target.value }))}
                            style={{
                              flex: 1, padding: "10px 12px", border: "1px solid #cbd5e1",
                              borderRadius: 6, fontSize: 13, resize: "vertical",
                              minHeight: 80, fontFamily: "inherit", outline: "none"
                            }}
                          />
                          <button
                            onClick={() => handleGrievanceReply(g.id)}
                            disabled={!replyText[g.id]?.trim()}
                            style={{
                              padding: "10px 18px",
                              background: replyText[g.id]?.trim() ? "#003580" : "#94a3b8",
                              color: "#fff", border: "none", borderRadius: 6,
                              fontWeight: 700, fontSize: 13, cursor: replyText[g.id]?.trim() ? "pointer" : "not-allowed",
                              whiteSpace: "nowrap", alignSelf: "flex-end"
                            }}>
                            📤 Send Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══ APPLICATIONS VIEW ══ */}
        {activeNav !== "grievances" && (
          <>

            {/* Charts */}
            {apps.length > 0 && filterStatus === "All" && (
              <div className="admin-charts-layout">
                <div className="admin-chart-card">
                  <h4>📈 Application Forecaster</h4>
                  <p className="chart-sub">Historical trends vs AI projected volumes</p>
                  <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer>
                      <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                        <Line type="monotone" dataKey="actual" name="Actual Apps" stroke="#003580" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="predicted" name="AI Predicted" stroke="#FF9933" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="admin-chart-card">
                  <h4>📊 Approval Distribution</h4>
                  <p className="chart-sub">Current status breakdown</p>
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={approvalData} cx="50%" cy="45%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value">
                          {approvalData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="admin-ai-insights-card">
                  <div className="ai-insights-head">
                    <span className="pulse-dot"></span>
                    <h4>USP AI Analyst</h4>
                  </div>
                  <p className="chart-sub">Automated anomalies & insights</p>
                  <div className="ai-insight-list">
                    {aiInsights.map((insight, idx) => (
                      <div key={idx} className="ai-insight-item" style={{ background: insight.bg, color: insight.color }}>
                        <span className="insight-icon">{insight.icon}</span>
                        <span className="insight-text">{insight.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className={`admin-context-header ${filterStatus !== "All" ? "active-filter" : ""}`}>
              {filterStatus === "All" ? (
                <>
                  <div>Showing <strong>{filtered.length}</strong> of <strong>{apps.length}</strong> total applications</div>
                  {autoRefresh && <div className="live-indicator">● Live Updates</div>}
                </>
              ) : (
                <div className="admin-focused-view"
                  style={{ borderLeftColor: STATUS_STYLE[filterStatus]?.border || "#003580", background: STATUS_STYLE[filterStatus]?.bg || "#f8fafc" }}>
                  <h2>📂 Filtered View: <span style={{ color: STATUS_STYLE[filterStatus]?.color || "#003580" }}>
                    {filterStatus === "PendingGroup" ? "Pending" : filterStatus === "ApprovedGroup" ? "Approved" : filterStatus === "RejectedGroup" ? "Rejected" : filterStatus}
                  </span></h2>
                  <p><strong>{filtered.length}</strong> applications in this category.</p>
                </div>
              )}
            </div>

            {filtered.length === 0 && (
              <div className="admin-empty">
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <h3>{apps.length === 0 ? "No applications yet" : "No applications match your filters"}</h3>
                <p>{apps.length === 0 ? "Students haven't submitted any applications yet." : "Try changing your search or filter criteria."}</p>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>App ID</th><th>Student Name</th><th>Scheme</th>
                      <th>Amount</th><th>Applied On</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(app => {
                      const ss = STATUS_STYLE[app.status] || STATUS_STYLE["Submitted"];
                      return (
                        <tr key={app.appId} className={selected?.appId === app.appId ? "selected-row" : ""}>
                          <td><code>{app.appId}</code></td>
                          <td><strong>{app.studentName}</strong></td>
                          <td style={{ maxWidth: 180 }}>{app.scheme}</td>
                          <td><strong style={{ color: "#138808" }}>{app.amount}</strong></td>
                          <td>{app.appliedOn}</td>
                          <td>
                            <span className="admin-status-badge"
                              style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                              {app.status}
                            </span>
                          </td>
                          <td>
                            <div className="admin-action-btns">
                              <button className="admin-btn-view"
                                onClick={() => setSelected(selected?.appId === app.appId ? null : app)}>
                                {selected?.appId === app.appId ? "▲ Hide" : "👁 View"}
                              </button>
                              <button className="admin-btn-action"
                                onClick={() => { setActionModal(app); setRejectReason(""); }}>
                                ⚖️ Action
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Detail Panel */}
            {selected && (
              <div className="admin-detail-panel">
                <div className="admin-detail-header">
                  <h3>📄 Application Details — {selected.appId}</h3>
                  <button onClick={() => setSelected(null)} className="admin-close-btn">✕ Close</button>
                </div>
                <div className="admin-detail-body">
                  <div className="admin-status-progress">
                    {STATUS_FLOW.map((s, i) => {
                      const currentIdx = STATUS_FLOW.indexOf(selected.status);
                      const isDone = i <= currentIdx;
                      const isCurrent = s === selected.status;
                      return (
                        <div key={s} className="asp-step">
                          <div className={`asp-dot ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}>{isDone ? "✓" : i + 1}</div>
                          {i < STATUS_FLOW.length - 1 && <div className={`asp-line ${isDone ? "done" : ""}`} />}
                          <div className={`asp-label ${isCurrent ? "current" : ""}`}>{s}</div>
                        </div>
                      );
                    })}
                  </div>

                  {selected.status === "Rejected" && (
                    <div className="alert alert-error" style={{ margin: "12px 0" }}>
                      ❌ <strong>Rejection Reason:</strong> {selected.rejectionReason || "Not specified"}
                    </div>
                  )}

                  <div className="admin-detail-grid">
                    <div className="admin-detail-section">
                      <h4>👤 Personal Details</h4>
                      {[["Full Name", selected.personalDetails?.fullName || selected.studentName],
                      ["Date of Birth", selected.personalDetails?.dob],
                      ["Gender", selected.personalDetails?.gender],
                      ["Category", selected.personalDetails?.category],
                      ["Mobile", selected.personalDetails?.mobile],
                      ["Email", selected.personalDetails?.email],
                      ].map(([k, v]) => (
                        <div key={k} className="admin-detail-row">
                          <span className="admin-detail-key">{k}</span>
                          <span className="admin-detail-val">{v || "—"}</span>
                        </div>
                      ))}
                    </div>

                    <div className="admin-detail-section">
                      <h4>🎓 Academic Details</h4>
                      {[["Institution", selected.academicDetails?.instituteName || selected.personalDetails?.instituteName],
                      ["Course", selected.academicDetails?.course || selected.personalDetails?.course],
                      ["Year", selected.academicDetails?.year || selected.personalDetails?.year],
                      ["Marks (%)", selected.academicDetails?.marks || selected.personalDetails?.marks],
                      ].map(([k, v]) => (
                        <div key={k} className="admin-detail-row">
                          <span className="admin-detail-key">{k}</span>
                          <span className="admin-detail-val">{v || "—"}</span>
                        </div>
                      ))}
                      <h4 style={{ marginTop: 14 }}>🏦 Bank Details</h4>
                      {[["Bank Name", selected.bankDetails?.bankName || selected.personalDetails?.bankName],
                      ["Account No.", selected.bankDetails?.accountNo || selected.personalDetails?.accountNo],
                      ["IFSC", selected.bankDetails?.ifsc || selected.personalDetails?.ifsc],
                      ["Holder Name", selected.bankDetails?.accountHolder || selected.personalDetails?.accountHolder],
                      ].map(([k, v]) => (
                        <div key={k} className="admin-detail-row">
                          <span className="admin-detail-key">{k}</span>
                          <span className="admin-detail-val">{v || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="admin-detail-section" style={{ marginTop: 24, width: "100%" }}>
                    <h4 style={{ marginBottom: 12, borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>📁 Uploaded Documents</h4>
                    {(() => {
                      const files = getFilesFromApp(selected);
                      if (files && Object.keys(files).length > 0) {
                        return (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                            {Object.entries(files).map(([docType, fileData]) => {
                              const fileName = typeof fileData === "string" ? fileData : fileData?.name;
                              const src = typeof fileData === "string" ? fileData : fileData?.base64 || fileData?.url;
                              return (
                                <div key={docType}
                                  onClick={() => src && setViewingImage({ title: docType, src })}
                                  style={{
                                    border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px",
                                    background: "#fff", display: "flex", alignItems: "center", gap: 12,
                                    cursor: src ? "pointer" : "default",
                                    transition: "all 0.2s",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                                  }}
                                  onMouseOver={e => src && (e.currentTarget.style.borderColor = "#003580")}
                                  onMouseOut={e => src && (e.currentTarget.style.borderColor = "#e2e8f0")}
                                >
                                  {src ? (
                                    <div style={{ width: 44, height: 44, borderRadius: 4, overflow: "hidden", background: "#f1f5f9", flexShrink: 0, border: "1px solid #e2e8f0" }}>
                                      <img src={src} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </div>
                                  ) : (
                                    <div style={{ width: 44, height: 44, borderRadius: 4, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                                      📎
                                    </div>
                                  )}
                                  <div style={{ overflow: "hidden" }}>
                                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{docType}</div>
                                    <div style={{ fontSize: 13, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fileName || "View Document"}</div>
                                  </div>
                                  {src && <div style={{ marginLeft: "auto", color: "#003580", fontSize: 14 }}>👁️</div>}
                                </div>
                              );
                            })}
                          </div>
                        );
                      }
                      return (
                        <div style={{ color: "#94a3b8", fontStyle: "italic", padding: 10, background: "#f1f5f9", borderRadius: 6, textAlign: "center" }}>
                          No documents uploaded.
                        </div>
                      );
                    })()}
                  </div>

                  <div className="admin-quick-actions">
                    <h4>Required Action</h4>
                    <div className="admin-quick-flow">
                      {(() => {
                        const currentIdx = STATUS_FLOW.indexOf(selected.status);
                        const nextStatus = STATUS_FLOW[currentIdx + 1];

                        if (!nextStatus || selected.status === "Rejected") return <span style={{ fontSize: 12, color: "#64748b" }}>No further actions required.</span>;

                        const role = adminUser?.role;
                        const canAct = (
                          (nextStatus === "Institute Verified" && role === "Institute Nodal Officer") ||
                          (nextStatus === "State Verified" && role === "State Nodal Officer") ||
                          (nextStatus === "Approved for Payment" && role === "Ministry Admin") ||
                          (nextStatus === "Payment Success" && role === "Ministry Admin") ||
                          (role === "Ministry Admin") // Allow global admin to act anyway for demo
                        );

                        if (!canAct) return <span style={{ fontSize: 12, color: "#64748b" }}>Waiting for {nextStatus.split(' ')[0]} Officer...</span>;

                        return (
                          <>
                            <button className="admin-flow-btn"
                              onClick={() => handleAction(nextStatus)}>
                              ✓ Move to {nextStatus}
                            </button>
                            <button className="admin-flow-btn admin-flow-reject"
                              onClick={() => { setActionModal(selected); setRejectReason(""); }}>
                              ❌ Reject with Reason
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Action Modal */}
      {actionModal && (
        <div className="admin-modal-overlay" onClick={() => setActionModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>⚖️ Update Application Status</h3>
              <button onClick={() => setActionModal(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-modal-app-info">
                <div><strong>App ID:</strong> <code>{actionModal.appId}</code></div>
                <div><strong>Student:</strong> {actionModal.studentName}</div>
                <div><strong>Scheme:</strong> {actionModal.scheme}</div>
                <div><strong>Current Status:</strong>
                  <span className="admin-status-badge"
                    style={{ marginLeft: 8, ...(() => { const s = STATUS_STYLE[actionModal.status]; return { background: s.bg, color: s.color, border: `1px solid ${s.border}` }; })() }}>
                    {actionModal.status}
                  </span>
                </div>
              </div>
              <div className="admin-modal-section-title">Move to Status:</div>
              <div className="admin-status-buttons">
                {(() => {
                  const currentIdx = STATUS_FLOW.indexOf(actionModal.status);
                  const nextStatus = STATUS_FLOW[currentIdx + 1];
                  if (!nextStatus) return null;
                  return <button className="admin-status-opt" onClick={() => handleAction(nextStatus)}>✓ Move to {nextStatus}</button>;
                })()}
              </div>
              <div className="admin-reject-section">
                <div className="admin-modal-section-title" style={{ color: "#C0392B" }}>❌ Reject Application</div>
                <div style={{ fontSize: 12, color: "#4a5568", marginBottom: 8 }}>Provide a clear reason — visible to student immediately.</div>
                <textarea placeholder="Enter rejection reason..." value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)} rows={3}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #ffc0c0", borderRadius: 4, fontFamily: "inherit", fontSize: 13, resize: "vertical" }} />
                <button className="admin-reject-btn" onClick={() => handleAction("Rejected")}>❌ Confirm Rejection</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}
          onClick={() => setViewingImage(null)}>
          <div style={{ background: "#fff", borderRadius: 8, maxWidth: "90%", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: "15px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", background: "#f8fafc" }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>📄 {viewingImage.title}</h3>
              <button onClick={() => setViewingImage(null)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: 20, background: "#f1f5f9", flex: 1, overflow: "auto", display: "flex", justifyContent: "center" }}>
              <img src={viewingImage.src} alt="Document" style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: 4 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}