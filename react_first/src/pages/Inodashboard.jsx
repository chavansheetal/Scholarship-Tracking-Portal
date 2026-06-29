import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getApplications,
  verifyByInstitute,
  updateApplicationStatus,
  getGrievances,
} from "../store";

const STATUS_STYLE = {
  "Submitted":          { bg: "#EEF6FF", color: "#003580",  border: "#b3d4ff" },
  "Institute Verified": { bg: "#E3F2FD", color: "#0d47a1",  border: "#90caf9" },
  "Rejected":           { bg: "#FFF0F0", color: "#C0392B",  border: "#ffc0c0" },
  "Verified":           { bg: "#E8F5E9", color: "#1b5e20",  border: "#81c784" },
};

const NAV = [
  { id: "pending",  icon: "⏳", label: "Pending Verification" },
  { id: "verified", icon: "✅", label: "Verified by Me"       },
  { id: "all",      icon: "📋", label: "All Applications"     },
];

export default function INODashboard({ admin, onLogout }) {
  const navigate = useNavigate();
  const [apps,        setApps]        = useState([]);
  const [activeNav,   setActiveNav]   = useState("pending");
  const [search,      setSearch]      = useState("");
  const [selected,    setSelected]    = useState(null);
  const [modal,       setModal]       = useState(null);   // { appId, studentName }
  const [rejectReason, setRejectReason] = useState("");
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

  useEffect(() => {
    loadApps();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(loadApps, 5000);
    return () => clearInterval(t);
  }, [autoRefresh]);

  const showToast = (msg, type = "success") => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(""), 3500);
  };

  // ── Filtering ──
  const q = search.toLowerCase();
  const match = (a) =>
    !q ||
    a.studentName?.toLowerCase().includes(q) ||
    a.appId?.toLowerCase().includes(q) ||
    a.scheme?.toLowerCase().includes(q);

  const pending  = apps.filter(a => a.status === "Submitted" && match(a));
  const verified = apps.filter(a => a.status === "Institute Verified" && match(a));
  const rejected = apps.filter(a => a.status === "Rejected" && match(a));
  const all      = apps.filter(match);

  const displayed = activeNav === "pending" ? pending : activeNav === "verified" ? verified : all;

  // ── Stats ──
  const stats = {
    total:    apps.length,
    pending:  pending.length,
    verified: verified.length,
    rejected: rejected.length,
  };

  // ── Actions ──
  const handleVerify = async (appId) => {
    try {
      await verifyByInstitute(appId, "institute");
      await loadApps();
      showToast("✅ Application verified & forwarded to District/State Officer!");
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  const openRejectModal = (app) => {
    setModal({ appId: app.appId, studentName: app.studentName });
    setRejectReason("");
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
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

  const ss = (status) => STATUS_STYLE[status] || STATUS_STYLE["Submitted"];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Toast */}
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
        background: "linear-gradient(180deg,#1565C0 0%,#0d2137 100%)",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        {/* Brand */}
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 2 }}>🏫 INO Portal</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>Institute Nodal Officer</div>
        </div>

        {/* Profile */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 15, flexShrink: 0 }}>
            {admin?.name?.[0] || "I"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{admin?.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>{admin?.role}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginTop: 1 }}>{admin?.ministry}</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {NAV.map(item => (
            <button key={item.id}
              onClick={() => { setActiveNav(item.id); setSelected(null); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "10px 20px", background: activeNav === item.id ? "rgba(255,255,255,.12)" : "none",
                border: "none", borderLeft: `3px solid ${activeNav === item.id ? "#FFB800" : "transparent"}`,
                color: activeNav === item.id ? "#fff" : "rgba(255,255,255,.65)",
                fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left",
                fontFamily: "inherit",
              }}>
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
              {item.id === "pending" && stats.pending > 0 && (
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
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

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "inherit", fontSize: 22, fontWeight: 800, color: "#0d2137", margin: 0 }}>Institute Verification Dashboard</h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>Step 1 of 3 — Verify student documents & enrolment details before forwarding</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              📅 {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
            <button onClick={loadApps}
              style={{ padding: "8px 16px", background: "#0d2137", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Hierarchy banner */}
        <div style={{ background: "linear-gradient(90deg,#1565C0,#0d2137)", color: "#fff", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, marginBottom: 20, fontSize: 13 }}>
          <span style={{ fontSize: 22 }}>ℹ️</span>
          <div>
            <strong style={{ fontSize: 14, display: "block", marginBottom: 2 }}>Your Role: Step 1 — Institute Verification</strong>
            After you verify an application, it moves to the District/State Nodal Officer (Step 2) for further review and approval.
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 14, marginBottom: 26 }}>
          {[
            { label: "Total Received", value: stats.total,    icon: "📋", color: "#003580" },
            { label: "Pending My Action", value: stats.pending,  icon: "⏳", color: "#92400e" },
            { label: "I Verified",     value: stats.verified, icon: "✅", color: "#1b5e20" },
            { label: "Rejected (INO)", value: stats.rejected, icon: "❌", color: "#C0392B" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: "1.5px solid #e2e8f0", cursor: "pointer" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

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

        {/* Table */}
        {displayed.length === 0 ? (
          <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
            <h3 style={{ color: "#64748b", marginBottom: 6 }}>{activeNav === "pending" ? "No pending applications" : "No applications found"}</h3>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>
              {activeNav === "pending" ? "All submissions have been processed." : "Try changing your search criteria."}
            </p>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#0d2137" }}>
                  {["App ID", "Student Name", "Scheme", "Amount", "Applied On", "INO Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "13px 14px", color: "#fff", fontWeight: 600, textAlign: "left", fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map(app => {
                  const style = ss(app.inoStatus || app.status);
                  return (
                    <tr key={app.appId} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "12px 14px" }}><code style={{ background: "#f1f5f9", borderRadius: 4, padding: "2px 6px", fontSize: 11, color: "#1a3a5c" }}>{app.appId}</code></td>
                      <td style={{ padding: "12px 14px" }}><strong>{app.studentName}</strong></td>
                      <td style={{ padding: "12px 14px", maxWidth: 180 }}>{app.scheme}</td>
                      <td style={{ padding: "12px 14px" }}><strong style={{ color: "#138808" }}>{app.amount}</strong></td>
                      <td style={{ padding: "12px 14px" }}>{app.appliedOn}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ display: "inline-block", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, border: "1px solid", background: style.bg, color: style.color, borderColor: style.border }}>
                          {app.inoStatus || app.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {(app.status === "Submitted" && app.inoStatus !== "Verified") ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => handleVerify(app.appId)}
                              style={{ background: "#E8F5E9", color: "#1b5e20", border: "1px solid #81c784", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                              ✓ Verify
                            </button>
                            <button onClick={() => openRejectModal(app)}
                              style={{ background: "#FFF0F0", color: "#C0392B", border: "1px solid #ffc0c0", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                              ✕ Reject
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setSelected(selected?.appId === app.appId ? null : app)}
                            style={{ background: "#EEF6FF", color: "#003580", border: "1px solid #b3d4ff", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            {selected?.appId === app.appId ? "▲ Hide" : "👁 View"}
                          </button>
                        )}
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
          <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", marginTop: 20, overflow: "hidden" }}>
            <div style={{ background: "#0d2137", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 600, margin: 0 }}>📄 Application Details — {selected.appId}</h3>
              <button onClick={() => setSelected(null)}
                style={{ background: "rgba(255,255,255,.1)", border: "none", color: "#fff", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 13 }}>
                ✕ Close
              </button>
            </div>
            <div style={{ padding: 22 }}>
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
                  { title: "🎓 Academic Details", rows: [
                    ["Institution", selected.academicDetails?.instituteName || selected.personalDetails?.instituteName],
                    ["Course", selected.academicDetails?.course || selected.personalDetails?.course],
                    ["Year", selected.academicDetails?.year || selected.personalDetails?.year],
                    ["Marks (%)", selected.academicDetails?.marks || selected.personalDetails?.marks],
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

              {selected.status !== "Submitted" && (
                <div style={{ marginTop: 20, padding: "10px 14px", background: "#E8F5E9", borderRadius: 8, fontSize: 13, color: "#1b5e20", border: "1px solid #81c784" }}>
                  ✅ This application has been verified and forwarded to the District/State Officer.
                </div>
              )}
            </div>
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
              <h3 style={{ color: "#fff", fontSize: 15, margin: 0 }}>❌ Reject Application</h3>
              <button onClick={() => setModal(null)} style={{ background: "rgba(255,255,255,.1)", border: "none", color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ fontSize: 13, marginBottom: 4 }}><strong>App ID:</strong> <code>{modal.appId}</code></div>
              <div style={{ fontSize: 13, marginBottom: 14 }}><strong>Student:</strong> {modal.studentName}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#C0392B", marginBottom: 6, textTransform: "uppercase" }}>Reason for Rejection</div>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>This reason will be visible to the student immediately.</p>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                style={{ width: "100%", border: "1.5px solid #fca5a5", borderRadius: 6, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 80, outline: "none", boxSizing: "border-box" }} />
              <button onClick={handleReject}
                style={{ marginTop: 12, background: "#C0392B", color: "#fff", border: "none", borderRadius: 6, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%", fontFamily: "inherit" }}>
                ❌ Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}