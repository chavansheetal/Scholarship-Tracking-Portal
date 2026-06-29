import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getApplications,
  approveByMinistry,
  simulatePayment,
  updateApplicationStatus,
  getGrievances,
  updateGrievance,
} from "../store";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const STATUS_STYLE = {
  "Submitted":            { bg: "#EEF6FF", color: "#003580",  border: "#b3d4ff" },
  "Institute Verified":   { bg: "#E3F2FD", color: "#0d47a1",  border: "#90caf9" },
  "State Verified":       { bg: "#F0F4FF", color: "#2563EB",  border: "#BFDBFE" },
  "Approved for Payment": { bg: "#ECFDF5", color: "#059669",  border: "#A7F3D0" },
  "Payment Success":      { bg: "#E8F5E9", color: "#1b5e20",  border: "#81c784" },
  "Rejected":             { bg: "#FFF0F0", color: "#C0392B",  border: "#ffc0c0" },
  "Rejected - Seats Full":{ bg: "#FFF0F0", color: "#C0392B",  border: "#ffc0c0" },
};

const STATUS_FLOW = ["Submitted", "Institute Verified", "State Verified", "Approved for Payment", "Payment Success"];

const NAV = [
  { id: "final",      icon: "⚖️", label: "Final Approval"  },
  { id: "disburse",   icon: "💸", label: "Fund Disbursement" },
  { id: "grievances", icon: "📨", label: "Grievances"       },
  { id: "all",        icon: "📋", label: "All Applications" },
];

export default function MNODashboard({ admin, onLogout }) {
  const navigate = useNavigate();
  const [apps,        setApps]        = useState([]);
  const [grievances,  setGrievances]  = useState([]);
  const [activeNav,   setActiveNav]   = useState("final");
  const [search,      setSearch]      = useState("");
  const [selected,    setSelected]    = useState(null);
  const [modal,       setModal]       = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [replyText,   setReplyText]   = useState({});
  const [gFilter,     setGFilter]     = useState("All");
  const [toast,       setToast]       = useState("");
  const [toastType,   setToastType]   = useState("success");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadApps = async () => {
    try {
      const data = await getApplications();
      setApps(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadGrievances = async () => {
    try {
      const data = await getGrievances();
      setGrievances(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadApps();
    loadGrievances();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(() => {
      loadApps();
      loadGrievances();
    }, 5000);
    return () => clearInterval(t);
  }, [autoRefresh]);

  const showToast = (msg, type = "success") => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(""), 3500);
  };

  const q = search.toLowerCase();
  const match = (a) =>
    !q ||
    a.studentName?.toLowerCase().includes(q) ||
    a.appId?.toLowerCase().includes(q) ||
    a.scheme?.toLowerCase().includes(q);

  // MNO only sees State-verified apps
  const stateVerified = apps.filter(a => a.status === "State Verified" || a.status === "Approved for Payment" || a.status === "Payment Success" || a.status === "Rejected - Seats Full");
  const forFinal      = apps.filter(a => a.status === "State Verified" && match(a));
  const forDisburse   = apps.filter(a => a.status === "Approved for Payment" && match(a));
  const allApps       = stateVerified.filter(match);

  const stats = {
    total:    stateVerified.length,
    pending:  forFinal.length,
    approved: apps.filter(a => a.status === "Approved for Payment").length,
    credited: apps.filter(a => a.status === "Payment Success").length,
    rejected: apps.filter(a => a.status === "Rejected" || a.status === "Rejected - Seats Full").length,
    openGrv:  grievances.filter(g => g.status === "Open").length,
  };

  // ── Charts (same as AdminDashboard) ──
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
  const approvalData = [
    { name: "Approved",  value: stats.approved,  color: "#1b5e20" },
    { name: "Rejected",  value: stats.rejected,  color: "#C0392B" },
    { name: "Pending",   value: stats.pending,   color: "#e6a100" },
    { name: "Credited",  value: stats.credited,  color: "#7c3aed" },
  ].filter(d => d.value > 0);

  // ── Actions ──
  const handleApprove = async (appId) => {
    try {
      const res = await approveByMinistry(appId, "ministry");
      await loadApps();
      showToast(res.message || "✅ Ministry Approval Successful!");
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  const openRejectModal = (app) => {
    setModal({ appId: app.appId, studentName: app.studentName });
    setRejectReason("");
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { alert("Please provide a rejection reason."); return; }
    try {
      await updateApplicationStatus(modal.appId, "Rejected", rejectReason.trim());
      await loadApps();
      setModal(null);
      setRejectReason("");
      showToast("❌ Application rejected.", "error");
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  const handleDisburse = async (appId) => {
    try {
      await simulatePayment(appId);
      await loadApps();
      showToast("💸 Funds disbursed to student's bank account!");
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  const handleGrievanceReply = (id) => {
    if (!replyText[id]?.trim()) return;
    updateGrievance(id, {
      adminReply: replyText[id].trim(),
      status: "Resolved",
      repliedAt: new Date().toLocaleString("en-IN"),
    });
    loadGrievances();
    setReplyText(prev => ({ ...prev, [id]: "" }));
    showToast("💬 Reply sent to student successfully!");
  };

  const markInProgress = (id) => {
    updateGrievance(id, { status: "In Progress" });
    loadGrievances();
    showToast("🔄 Marked as In Progress.");
  };

  const filteredGrievances = grievances.slice().reverse().filter(g => gFilter === "All" || g.status === gFilter);

  const ss = (status) => STATUS_STYLE[status] || STATUS_STYLE["Submitted"];
  const gStatusStyle = (s) => ({
    background: s === "Resolved" ? "#F0FFF4" : s === "In Progress" ? "#FFFBEB" : "#EFF6FF",
    color: s === "Resolved" ? "#166534" : s === "In Progress" ? "#92400e" : "#1e40af",
    border: `1px solid ${s === "Resolved" ? "#4ade80" : s === "In Progress" ? "#fbbf24" : "#60a5fa"}`,
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>

      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: toastType === "error" ? "#C0392B" : "#1b5e20",
          color: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}>{toast}</div>
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 240, minHeight: "100vh", flexShrink: 0,
        background: "linear-gradient(180deg,#5b21b6 0%,#0d2137 100%)",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 2 }}>🏢 MNO Portal</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>Ministry Nodal Officer</div>
        </div>

        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 15, flexShrink: 0 }}>
            {admin?.name?.[0] || "M"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{admin?.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>{admin?.role}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginTop: 1 }}>{admin?.ministry}</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 0" }}>
          {NAV.map(item => (
            <button key={item.id}
              onClick={() => { setActiveNav(item.id); setSelected(null); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 20px", background: activeNav === item.id ? "rgba(255,255,255,.12)" : "none",
                border: "none", borderLeft: `3px solid ${activeNav === item.id ? "#FFB800" : "transparent"}`,
                color: activeNav === item.id ? "#fff" : "rgba(255,255,255,.65)",
                fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left", fontFamily: "inherit",
              }}>
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
              {item.id === "final" && stats.pending > 0 && (
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{stats.pending}</span>
              )}
              {item.id === "grievances" && stats.openGrv > 0 && (
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{stats.openGrv}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,.08)", display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 11, color: "#adc8ff", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
            Auto-refresh (5s)
          </label>
          <Link to="/" style={{ fontSize: 12, color: "rgba(255,255,255,.6)", textDecoration: "none" }}>🏠 Student Portal</Link>
          <button onClick={() => { onLogout(); navigate("/admin"); }}
            style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)", borderRadius: 6, padding: "8px 12px", fontSize: 12, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, padding: "28px 32px", background: "#f0f4f8", overflowY: "auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0d2137", margin: 0 }}>Ministry Final Approval Dashboard</h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>Step 3 of 3 — Final approvals, rejections & fund disbursement · {admin?.ministry}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              📅 {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
            <button onClick={() => { loadApps(); loadGrievances(); }}
              style={{ padding: "8px 16px", background: "#0d2137", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              🔄 Refresh Now
            </button>
          </div>
        </div>

        {/* Hierarchy banner */}
        <div style={{ background: "linear-gradient(90deg,#5b21b6,#0d2137)", color: "#fff", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, marginBottom: 20, fontSize: 13 }}>
          <span style={{ fontSize: 22 }}>ℹ️</span>
          <div>
            <strong style={{ fontSize: 14, display: "block", marginBottom: 2 }}>Your Role: Step 3 — Ministry Final Decision</strong>
            You review applications that the District/State Officer has already approved. After final approval you can disburse scholarship funds directly to students.
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 14, marginBottom: 26 }}>
          {[
            { label: "DNO Approved",    value: stats.total,    icon: "🏛️", color: "#003580" },
            { label: "Awaiting Final",  value: stats.pending,  icon: "⚖️", color: "#92400e" },
            { label: "MNO Approved",    value: stats.approved, icon: "✅", color: "#1b5e20" },
            { label: "Funds Disbursed", value: stats.credited, icon: "💸", color: "#6d28d9" },
            { label: "MNO Rejected",    value: stats.rejected, icon: "❌", color: "#C0392B" },
            { label: "Open Grievances", value: stats.openGrv,  icon: "📨", color: "#7c3aed" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: "1.5px solid #e2e8f0", cursor: "pointer" }}
              onClick={() => { if (s.icon === "📨") setActiveNav("grievances"); }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ══ FINAL APPROVAL VIEW ══ */}
        {activeNav === "final" && (
          <>
            {/* Charts */}
            {apps.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "18px 20px" }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: "#0d2137", margin: "0 0 4px" }}>📈 Application Forecaster</h4>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px" }}>Historical trends vs AI projected volumes</p>
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                        <Line type="monotone" dataKey="actual" name="Actual Apps" stroke="#003580" strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="predicted" name="AI Predicted" stroke="#FF9933" strokeWidth={2.5} strokeDasharray="5 5" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "18px 20px" }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: "#0d2137", margin: "0 0 4px" }}>📊 Approval Distribution</h4>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px" }}>Current status breakdown</p>
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={approvalData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                          {approvalData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: "none" }} />
                        <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Search */}
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "0 12px", gap: 8 }}>
                <span>🔍</span>
                <input type="text" placeholder="Search by student name, App ID or scheme..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: 13, padding: "9px 0", flex: 1, fontFamily: "inherit", background: "transparent" }} />
                {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a5568" }}>✕</button>}
              </div>
            </div>

            {forFinal.length === 0 ? (
              <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 48, textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
                <h3 style={{ color: "#64748b", marginBottom: 6 }}>No applications awaiting final approval</h3>
                <p style={{ fontSize: 13, color: "#94a3b8" }}>District/State Officers haven't forwarded any approved applications yet.</p>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#0d2137" }}>
                      {["App ID", "Student Name", "Scheme", "Amount", "Applied On", "DNO Status", "Actions"].map(h => (
                        <th key={h} style={{ padding: "13px 14px", color: "#fff", fontWeight: 600, textAlign: "left", fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {forFinal.map(app => (
                      <tr key={app.appId} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "12px 14px" }}><code style={{ background: "#f1f5f9", borderRadius: 4, padding: "2px 6px", fontSize: 11, color: "#1a3a5c" }}>{app.appId}</code></td>
                        <td style={{ padding: "12px 14px" }}><strong>{app.studentName}</strong></td>
                        <td style={{ padding: "12px 14px", maxWidth: 180 }}>{app.scheme}</td>
                        <td style={{ padding: "12px 14px" }}><strong style={{ color: "#138808" }}>{app.amount}</strong></td>
                        <td style={{ padding: "12px 14px" }}>{app.appliedOn}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ display: "inline-block", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, border: "1px solid #81c784", background: "#E8F5E9", color: "#1b5e20" }}>
                            DNO Approved
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => handleApprove(app.appId)}
                              style={{ background: "#E8F5E9", color: "#1b5e20", border: "1px solid #81c784", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                              ✓ Final Approve
                            </button>
                            <button onClick={() => openRejectModal(app)}
                              style={{ background: "#FFF0F0", color: "#C0392B", border: "1px solid #ffc0c0", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                              ✕ Reject
                            </button>
                            <button onClick={() => setSelected(selected?.appId === app.appId ? null : app)}
                              style={{ background: "#EEF6FF", color: "#003580", border: "1px solid #b3d4ff", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                              {selected?.appId === app.appId ? "▲ Hide" : "👁 View"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Detail Panel */}
            {selected && (
              <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", marginTop: 20, overflow: "hidden" }}>
                <div style={{ background: "#0d2137", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 600, margin: 0 }}>📄 Application Details — {selected.appId}</h3>
                  <button onClick={() => setSelected(null)}
                    style={{ background: "rgba(255,255,255,.1)", border: "none", color: "#fff", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 13 }}>
                    ✕ Close
                  </button>
                </div>
                <div style={{ padding: 22 }}>
                  {/* Status progress */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 22, overflowX: "auto" }}>
                    {STATUS_FLOW.map((s, i) => {
                      const currentIdx = STATUS_FLOW.indexOf(selected.status);
                      const isDone = i <= currentIdx;
                      const isCurrent = s === selected.status;
                      return (
                        <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 80 }}>
                          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, fontWeight: 700, zIndex: 1,
                              background: isDone ? "#1b5e20" : isCurrent ? "#1565C0" : "#e2e8f0",
                              color: isDone || isCurrent ? "#fff" : "#64748b",
                              boxShadow: isCurrent ? "0 0 0 4px rgba(21,101,192,.2)" : "none",
                              flexShrink: 0,
                            }}>{isDone ? "✓" : i + 1}</div>
                            {i < STATUS_FLOW.length - 1 && (
                              <div style={{ flex: 1, height: 2, background: isDone ? "#1b5e20" : "#e2e8f0" }} />
                            )}
                          </div>
                          <div style={{ fontSize: 10, textAlign: "center", marginTop: 6, color: isCurrent ? "#1565C0" : "#64748b", fontWeight: isCurrent ? 700 : 400, maxWidth: 70 }}>{s}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    {[
                      { title: "👤 Personal Details", rows: [
                        ["Full Name", selected.personalDetails?.fullName || selected.studentName],
                        ["DOB", selected.personalDetails?.dob],
                        ["Gender", selected.personalDetails?.gender],
                        ["Category", selected.personalDetails?.category],
                        ["Mobile", selected.personalDetails?.mobile],
                        ["Email", selected.personalDetails?.email],
                      ]},
                      { title: "🏦 Bank Details", rows: [
                        ["Bank Name", selected.bankDetails?.bankName || selected.personalDetails?.bankName],
                        ["Account No.", selected.bankDetails?.accountNo || selected.personalDetails?.accountNo],
                        ["IFSC", selected.bankDetails?.ifsc || selected.personalDetails?.ifsc],
                        ["Holder Name", selected.bankDetails?.accountHolder || selected.personalDetails?.accountHolder],
                        ["Institution", selected.academicDetails?.instituteName || selected.personalDetails?.instituteName],
                        ["Course", selected.academicDetails?.course || selected.personalDetails?.course],
                      ]},
                    ].map(section => (
                      <div key={section.title}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0d2137", marginBottom: 12, borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>{section.title}</h4>
                        {section.rows.map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderBottom: "1px solid #f1f5f9" }}>
                            <span style={{ color: "#64748b" }}>{k}</span>
                            <span style={{ fontWeight: 600, color: "#0f172a" }}>{v || "—"}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══ FUND DISBURSEMENT VIEW ══ */}
        {activeNav === "disburse" && (
          <div>
            {forDisburse.length === 0 ? (
              <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 48, textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>💸</div>
                <h3 style={{ color: "#64748b", marginBottom: 6 }}>No Applications Ready for Disbursement</h3>
                <p style={{ fontSize: 13, color: "#94a3b8" }}>Approve applications first before disbursing funds.</p>
              </div>
            ) : (
              <>
                <div style={{ background: "#EEF6FF", border: "1px solid #b3d4ff", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#003580", marginBottom: 18 }}>
                  💡 These applications have received final Ministry approval and are ready for fund disbursement.
                </div>
                {forDisburse.map(app => (
                  <div key={app.appId} style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #e2e8f0", padding: "18px 20px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#0d2137" }}>{app.studentName}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{app.scheme} · <code style={{ background: "#f1f5f9", borderRadius: 4, padding: "1px 5px" }}>{app.appId}</code></div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                        {app.bankDetails?.bankName || app.personalDetails?.bankName || "Bank"} ·
                        Acc: {app.bankDetails?.accountNo || app.personalDetails?.accountNo || "—"} ·
                        IFSC: {app.bankDetails?.ifsc || app.personalDetails?.ifsc || "—"}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#1b5e20" }}>{app.amount}</div>
                      <button onClick={() => handleDisburse(app.appId)}
                        style={{ background: "#1b5e20", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        💸 Disburse Funds
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ══ ALL APPLICATIONS VIEW ══ */}
        {activeNav === "all" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "0 12px", gap: 8 }}>
                <span>🔍</span>
                <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: 13, padding: "9px 0", flex: 1, fontFamily: "inherit", background: "transparent" }} />
                {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a5568" }}>✕</button>}
              </div>
            </div>
            {allApps.length === 0 ? (
              <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 48, textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
                <h3 style={{ color: "#64748b" }}>No applications yet</h3>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#0d2137" }}>
                      {["App ID", "Student Name", "Scheme", "Amount", "Applied On", "Status", "MNO Status"].map(h => (
                        <th key={h} style={{ padding: "13px 14px", color: "#fff", fontWeight: 600, textAlign: "left", fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allApps.map(app => {
                      const s = ss(app.status);
                      return (
                        <tr key={app.appId} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "12px 14px" }}><code style={{ background: "#f1f5f9", borderRadius: 4, padding: "2px 6px", fontSize: 11, color: "#1a3a5c" }}>{app.appId}</code></td>
                          <td style={{ padding: "12px 14px" }}><strong>{app.studentName}</strong></td>
                          <td style={{ padding: "12px 14px", maxWidth: 180 }}>{app.scheme}</td>
                          <td style={{ padding: "12px 14px" }}><strong style={{ color: "#138808" }}>{app.amount}</strong></td>
                          <td style={{ padding: "12px 14px" }}>{app.appliedOn}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ display: "inline-block", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, border: `1px solid ${s.border}`, background: s.bg, color: s.color }}>{app.status}</span>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            {app.mnoStatus ? (
                              <span style={{ display: "inline-block", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, border: "1px solid #81c784", background: "#E8F5E9", color: "#1b5e20" }}>{app.mnoStatus}</span>
                            ) : (
                              <span style={{ fontSize: 12, color: "#94a3b8" }}>Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ══ GRIEVANCES VIEW — identical logic to AdminDashboard ══ */}
        {activeNav === "grievances" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ color: "#003580", margin: 0 }}>
                📨 Student Grievances
                {stats.openGrv > 0 && (
                  <span style={{ marginLeft: 10, background: "#ef4444", color: "#fff", borderRadius: 10, padding: "2px 10px", fontSize: 13, fontWeight: 700 }}>{stats.openGrv} Open</span>
                )}
              </h2>
              <div style={{ display: "flex", gap: 6 }}>
                {["All", "Open", "In Progress", "Resolved"].map(f => (
                  <button key={f} onClick={() => setGFilter(f)}
                    style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: gFilter === f ? "#003580" : "#f1f5f9", color: gFilter === f ? "#fff" : "#374151" }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {filteredGrievances.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "#94a3b8", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                <h3 style={{ color: "#64748b" }}>No grievances found</h3>
              </div>
            ) : (
              filteredGrievances.map(g => (
                <div key={g.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, marginBottom: 16, overflow: "hidden", boxShadow: g.status === "Open" ? "0 0 0 2px rgba(239,68,68,0.15)" : "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ background: "#f8fafc", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap", gap: 8 }}>
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
                      <span style={{ ...gStatusStyle(g.status), borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>{g.status}</span>
                    </div>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 700, color: "#003580", marginBottom: 8, fontSize: 14 }}>📌 {g.subject}</div>
                    <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.65, background: "#f8fafc", padding: "10px 14px", borderRadius: 6, border: "1px solid #e2e8f0", marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, marginBottom: 4 }}>STUDENT'S MESSAGE</div>
                      {g.message}
                    </div>
                    {g.adminReply && (
                      <div style={{ background: "#EFF6FF", border: "1px solid #93c5fd", borderRadius: 6, padding: "10px 14px", marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                          <span>✅ YOUR REPLY</span>
                          <span style={{ fontWeight: 400, color: "#64748b" }}>{g.repliedAt}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#1e3a8a", lineHeight: 1.6 }}>{g.adminReply}</div>
                      </div>
                    )}
                    {g.status !== "Resolved" && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>💬 Reply to Student:</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <textarea
                            placeholder="Type your reply here. The student will see this immediately after you send it..."
                            value={replyText[g.id] || ""}
                            onChange={e => setReplyText(prev => ({ ...prev, [g.id]: e.target.value }))}
                            style={{ flex: 1, padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, resize: "vertical", minHeight: 80, fontFamily: "inherit", outline: "none" }} />
                          <button onClick={() => handleGrievanceReply(g.id)} disabled={!replyText[g.id]?.trim()}
                            style={{ padding: "10px 18px", background: replyText[g.id]?.trim() ? "#003580" : "#94a3b8", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: replyText[g.id]?.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap", alignSelf: "flex-end" }}>
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
      </main>

      {/* Reject Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 8888, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setModal(null)}>
          <div style={{ background: "#fff", borderRadius: 16, width: 460, maxWidth: "95vw", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ background: "#0d2137", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ color: "#fff", fontSize: 15, margin: 0 }}>⚖️ Reject Application (Final Decision)</h3>
              <button onClick={() => setModal(null)} style={{ background: "rgba(255,255,255,.1)", border: "none", color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ fontSize: 13, marginBottom: 4 }}><strong>App ID:</strong> <code>{modal.appId}</code></div>
              <div style={{ fontSize: 13, marginBottom: 14 }}><strong>Student:</strong> {modal.studentName}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#C0392B", marginBottom: 6, textTransform: "uppercase" }}>Reason for Rejection</div>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>This is the final decision. The student will be notified immediately.</p>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                style={{ width: "100%", border: "1.5px solid #fca5a5", borderRadius: 6, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 80, outline: "none", boxSizing: "border-box" }} />
              <button onClick={handleReject}
                style={{ marginTop: 12, background: "#C0392B", color: "#fff", border: "none", borderRadius: 6, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%", fontFamily: "inherit" }}>
                ❌ Confirm Final Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}