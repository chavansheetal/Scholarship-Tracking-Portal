import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { saveGrievance, generateGrievanceId, getGrievances } from "../store";
import "../styles/ContactUs.css";

export default function ContactUs({ user, onLogout }) {
  const [tab, setTab] = useState("submit");
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: user?.name || "",
    mobile: user?.mobile || "",
    email: user?.email || "",
    subject: "",
    message: "",
    applicationId: user?.appId || "",
  });

  const [checkInput, setCheckInput] = useState("");
  const [replies, setReplies] = useState(null);
  const [checkErr, setCheckErr] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    if (!form.subject) e.subject = "Please select a subject.";
    if (!form.message.trim()) e.message = "Message cannot be empty.";
    if (form.mobile && !/^\d{10}$/.test(form.mobile))
      e.mobile = "Enter a valid 10-digit mobile number.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    const id = generateGrievanceId();
    try {
      await saveGrievance({
        id,
        fullName: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
        applicationId: form.applicationId.trim(),
        status: "Open",
        adminReply: "",
        repliedAt: "",
        submittedAt: new Date().toLocaleString("en-IN"),
      });

      setTicketId(id);
      setSubmitted(true);
      setErrors({});
    } catch (err) {
      alert("Failed to submit grievance: " + err.message);
    }
  };

  const handleCheckReplies = async () => {
    setCheckErr("");
    setReplies(null);
    const q = checkInput.trim().toLowerCase();
    if (!q) {
      setCheckErr("Please enter your Grievance ID, Email, or Application ID.");
      return;
    }
    try {
      const all = await getGrievances();
      const found = all.filter(
        (g) =>
          g.id?.toLowerCase() === q ||
          g.email?.toLowerCase() === q ||
          g.applicationId?.toLowerCase() === q
      );
      if (found.length === 0) {
        setCheckErr("No grievances found. Please check your Grievance ID or Email.");
      } else {
        setReplies(found.slice().reverse());
      }
    } catch (err) {
      setCheckErr("Failed to fetch grievances: " + err.message);
    }
  };

  const statusStyle = (s) => {
    if (s === "Resolved") return { background: "#F0FFF4", color: "#166534", border: "1px solid #4ade80" };
    if (s === "In Progress") return { background: "#FFFBEB", color: "#92400e", border: "1px solid #fbbf24" };
    return { background: "#EFF6FF", color: "#1e40af", border: "1px solid #60a5fa" };
  };

  const inp = (hasErr) => ({
    width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: "inherit",
    border: `1px solid ${hasErr ? "#dc2626" : "#cbd5e1"}`, borderRadius: 6,
    outline: "none", boxSizing: "border-box",
  });

  return (
    <div className="page-wrapper">
      <Navbar user={user} onLogout={onLogout} />

      {/* Hero */}
      <div className="contact-hero">
        <div className="about-badge">📞 Get in Touch</div>
        <h1>Contact Us</h1>
        <p>We are here to help you. Reach out to our helpdesk for any scholarship-related queries.</p>
      </div>

      <div className="main-content">
        <div className="contact-layout">

          {/* ── LEFT: FORM / TABS ── */}
          <div className="contact-form-col">

            {/* Tab switcher */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[
                { key: "submit", label: "📩 Submit a Query" },
                { key: "check", label: "🔍 Check Reply Status" },
              ].map(t => (
                <button key={t.key}
                  onClick={() => { setTab(t.key); setSubmitted(false); setErrors({}); }}
                  style={{
                    padding: "9px 20px", borderRadius: 6, fontWeight: 600,
                    fontSize: 13, cursor: "pointer", border: "none",
                    background: tab === t.key ? "#003580" : "#fff",
                    color: tab === t.key ? "#fff" : "#003580",
                    boxShadow: tab === t.key
                      ? "0 2px 8px rgba(0,53,128,0.2)"
                      : "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >{t.label}</button>
              ))}
            </div>

            <div className="contact-card">

              {/* ══ SUBMIT TAB ══ */}
              {tab === "submit" && !submitted && (
                <>
                  <h2>📧 Send Us a Message</h2>
                  <div className="form-row-2c">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input style={inp(errors.name)} placeholder="Your name"
                        value={form.name} onChange={e => set("name", e.target.value)} />
                      {errors.name && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 3 }}>{errors.name}</div>}
                    </div>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input style={inp(errors.mobile)} placeholder="10-digit mobile"
                        maxLength={10} value={form.mobile}
                        onChange={e => set("mobile", e.target.value)} />
                      {errors.mobile && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 3 }}>{errors.mobile}</div>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email ID *</label>
                    <input style={inp(errors.email)} placeholder="Your email address"
                      value={form.email} onChange={e => set("email", e.target.value)} />
                    {errors.email && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 3 }}>{errors.email}</div>}
                  </div>

                  <div className="form-group">
                    <label>Subject *</label>
                    <select style={inp(errors.subject)} value={form.subject}
                      onChange={e => set("subject", e.target.value)}>
                      <option value="">-- Select Subject --</option>
                      {["Application Status Query", "Login / Registration Issue",
                        "Document Upload Problem", "Scholarship Amount Not Received",
                        "Institute Verification Pending", "Aadhaar / DigiLocker Issue", "Other"
                      ].map(s => <option key={s}>{s}</option>)}
                    </select>
                    {errors.subject && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 3 }}>{errors.subject}</div>}
                  </div>

                  <div className="form-group">
                    <label>Message *</label>
                    <textarea style={{ ...inp(errors.message), minHeight: 110, resize: "vertical" }}
                      placeholder="Describe your issue in detail..."
                      value={form.message} onChange={e => set("message", e.target.value)} />
                    {errors.message && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 3 }}>{errors.message}</div>}
                  </div>

                  <div className="form-group">
                    <label>Application ID (if applicable)</label>
                    <input style={inp(false)} placeholder="e.g. NSP/2025/KA/001234"
                      value={form.applicationId} onChange={e => set("applicationId", e.target.value)} />
                  </div>

                  <button className="btn-gov" onClick={handleSubmit}>📨 Submit Grievance</button>
                </>
              )}

              {/* ══ SUCCESS STATE ══ */}
              {tab === "submit" && submitted && (
                <div style={{ padding: "32px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
                  <h3 style={{ color: "#166534", marginBottom: 8 }}>Grievance Submitted Successfully!</h3>
                  <p style={{ color: "#555", marginBottom: 20, fontSize: 14 }}>
                    Your query has been sent to the admin. You will receive a reply within 1–2 working days.
                  </p>
                  <div style={{
                    background: "#F0FFF4", border: "1px solid #4ade80", borderRadius: 8,
                    padding: "16px 24px", display: "inline-block", marginBottom: 24
                  }}>
                    <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>Your Grievance ID</div>
                    <div style={{ fontWeight: 800, fontSize: 20, color: "#003580", letterSpacing: 1 }}>{ticketId}</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
                      💡 Save this ID to check reply status anytime
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    <button className="btn-gov" style={{ width: "auto", padding: "10px 24px" }}
                      onClick={() => { setSubmitted(false); setForm({ name: "", mobile: "", email: "", subject: "", message: "", applicationId: "" }); }}>
                      Submit Another Query
                    </button>
                    <button className="btn-gov" style={{ width: "auto", padding: "10px 24px", background: "#166534" }}
                      onClick={() => { setTab("check"); setSubmitted(false); setCheckInput(ticketId); }}>
                      🔍 Check My Reply
                    </button>
                  </div>
                </div>
              )}

              {/* ══ CHECK REPLY TAB ══ */}
              {tab === "check" && (
                <>
                  <h2>🔍 Check Reply Status</h2>
                  <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                    Enter your Grievance ID, registered Email, or Application ID to view your query and admin's reply.
                  </p>

                  <div className="form-group">
                    <label>Grievance ID / Email / Application ID</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input style={{ ...inp(!!checkErr), flex: 1 }}
                        placeholder="e.g. GRV-... or your@email.com or NSP/2025/KA/..."
                        value={checkInput}
                        onChange={e => { setCheckInput(e.target.value); setCheckErr(""); setReplies(null); }}
                        onKeyDown={e => e.key === "Enter" && handleCheckReplies()}
                      />
                      <button className="btn-gov" style={{ width: "auto", padding: "10px 20px", whiteSpace: "nowrap" }}
                        onClick={handleCheckReplies}>
                        🔍 Search
                      </button>
                    </div>
                    {checkErr && (
                      <div style={{ color: "#dc2626", fontSize: 13, marginTop: 6, padding: "8px 12px", background: "#FFF0F0", borderRadius: 6, border: "1px solid #f87171" }}>
                        {checkErr}
                      </div>
                    )}
                  </div>

                  {replies && replies.map((g, i) => (
                    <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", marginTop: 16 }}>

                      {/* Grievance header */}
                      <div style={{
                        background: "#f8fafc", padding: "10px 14px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        borderBottom: "1px solid #e2e8f0"
                      }}>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          <strong style={{ color: "#003580" }}>{g.id}</strong>
                          &nbsp;|&nbsp; Submitted: {g.submittedAt}
                        </div>
                        <span style={{ ...statusStyle(g.status), borderRadius: 20, padding: "2px 12px", fontSize: 12, fontWeight: 600 }}>
                          {g.status}
                        </span>
                      </div>

                      <div style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 600, color: "#003580", marginBottom: 6, fontSize: 14 }}>
                          📌 {g.subject}
                        </div>
                        <div style={{
                          fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 12,
                          background: "#f8fafc", padding: "10px 12px", borderRadius: 6, border: "1px solid #e2e8f0"
                        }}>
                          <strong style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>YOUR MESSAGE</strong>
                          {g.message}
                        </div>

                        {/* Admin Reply */}
                        {g.adminReply ? (
                          <div style={{
                            background: "#EFF6FF", border: "1px solid #93c5fd",
                            borderRadius: 6, padding: "12px 14px"
                          }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                              <span>💬 ADMIN REPLY</span>
                              <span style={{ fontWeight: 400, color: "#64748b" }}>{g.repliedAt}</span>
                            </div>
                            <div style={{ fontSize: 13, color: "#1e3a8a", lineHeight: 1.6 }}>{g.adminReply}</div>
                          </div>
                        ) : (
                          <div style={{ background: "#FFFBEB", border: "1px solid #fbbf24", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#92400e" }}>
                            ⏳ Awaiting admin reply. Typical response time: 1–2 working days.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* ── RIGHT: Info boxes ── */}
          <div className="contact-info-col">
            {[
              {
                head: "📞 Helpline Numbers", color: "#003580",
                items: [
                  { label: "USP Helpdesk", val: "0120-6619540" },
                  { label: "DigiLocker / CDAC", val: "1800-3010-3333" },
                  { label: "Scholarship Grievance", val: "1800-11-8002" },
                ]
              },
              {
                head: "📧 Email Support", color: "#138808",
                items: [
                  { label: "General Queries", val: "helpdesk@nsp.gov.in" },
                  { label: "Technical Issues", val: "support.nsp@gov.in" },
                  { label: "Grievances", val: "grievance.nsp@gov.in" },
                ]
              },
              {
                head: "🕐 Working Hours", color: "#FF9933",
                items: [
                  { label: "Mon – Fri", val: "9:30 AM – 6:00 PM" },
                  { label: "Saturday", val: "9:30 AM – 2:00 PM" },
                  { label: "Sunday & Holidays", val: "Closed" },
                ]
              },
            ].map((box, i) => (
              <div key={i} className="contact-info-box">
                <div className="contact-info-head" style={{ background: box.color }}>{box.head}</div>
                <div className="contact-info-body">
                  {box.items.map((item, j) => (
                    <div key={j} className="contact-info-row">
                      <span className="ci-label">{item.label}</span>
                      <span className="ci-val">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Tip box */}
            <div style={{ background: "#FFF8E1", border: "1px solid #fbbf24", borderRadius: 8, padding: "14px 16px", fontSize: 13 }}>
              <strong style={{ color: "#92400e" }}>💡 Tip:</strong>
              <p style={{ margin: "6px 0 0", color: "#7a4f00", lineHeight: 1.6, fontSize: 12 }}>
                After submitting, save your <strong>Grievance ID</strong>. Use "Check Reply Status" tab anytime to see if admin has responded.
              </p>
            </div>

            <div className="contact-address">
              <div className="contact-info-head" style={{ background: "#7b1fa2" }}>📍 USP Headquarters</div>
              <div className="contact-info-body" style={{ fontSize: 13, lineHeight: 1.8, color: "#1a2340" }}>
                Ministry of Electronics & Information Technology<br />
                Electronics Niketan, 6, CGO Complex,<br />
                Lodhi Road, New Delhi – 110003<br />
                <strong>CIN:</strong> L72200DL1991GOI046444
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}