import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const SCHOLARSHIPS = {
  1: { tag: "all", tagLabel: "Open to All", title: "Central Sector Scheme of Scholarship (CSSS)", ministry: "Ministry of Education", marks: "80%", income: "₹4,50,000", amount: "₹20,000", deadline: "31 Oct 2025", level: "UG/PG", category: "All", desc: "The Central Sector Scheme of Scholarships (CSS) for College and University Students is a scholarship scheme by the Ministry of Education. It provides financial assistance to meritorious students from low income families to meet a part of their day-to-day expenses while pursuing higher studies.", eligibility: ["Must have scored above 80th percentile in Class XII board examination", "Annual family income should not exceed ₹4,50,000", "Currently enrolled in UG/PG programme (not distance/correspondence)", "Not availing any other Central Government scholarship"] },
  2: { tag: "all", tagLabel: "Open to All", title: "National Means Cum Merit Scholarship (NMMS)", ministry: "Ministry of Education", marks: "55%", income: "₹3,50,000", amount: "₹12,000", deadline: "15 Nov 2025", level: "Class 9-12", category: "All", desc: "National Means-cum-Merit Scholarship Scheme (NMMSS) is to award scholarships to meritorious students of economically weaker sections to arrest their drop out at class VIII and encourage them to continue the study at secondary stage.", eligibility: ["Must be studying in Class IX in State Government or Government-aided school", "Annual parental income should not exceed ₹3,50,000", "Must have scored at least 55% marks in Class VIII exam", "SC/ST students get 5% relaxation in marks"] },
  3: { tag: "obc", tagLabel: "OBC / EBC / DNT", title: "PM YASASVI Scholarship", ministry: "Ministry of Social Justice & Empowerment", marks: "60%", income: "₹2,50,000", amount: "₹75,000", deadline: "31 Oct 2025", level: "Class 9-12", category: "OBC", desc: "PM Young Achievers Scholarship Award Scheme for Vibrant India (PM YASASVI) is a scholarship for OBC, EBC and DNT students.", eligibility: ["Must belong to OBC, EBC or DNT category", "Annual family income below ₹2,50,000", "Must have scored at least 60% in previous exam", "Studying in Class 9-12 in an eligible school"] },
};

export default function ApplyScholarship({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const sch = SCHOLARSHIPS[id] || SCHOLARSHIPS[1];

  return (
    <div className="page-wrapper">
      <Navbar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div style={{ marginBottom: 16 }}>
          <Link to="/scholarships" style={{ color: "#003580", fontSize: 13, textDecoration: "none" }}>← Back to Scholarships</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
          <div>
            <div className="card" style={{ overflow: "hidden", marginBottom: 20 }}>
              <div style={{ background: "linear-gradient(135deg, #00225A, #003580)", color: "white", padding: 24 }}>
                <span className={`tag tag-${sch.tag}`} style={{ marginBottom: 12, display: "inline-block" }}>{sch.tagLabel}</span>
                <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 8 }}>{sch.title}</h2>
                <div style={{ fontSize: 13, opacity: 0.8 }}>🏛 {sch.ministry}</div>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Per Year", value: sch.amount, color: "#138808" },
                    { label: "Min Marks", value: sch.marks, color: "#003580" },
                    { label: "Income Limit", value: sch.income, color: "#003580" },
                    { label: "Deadline", value: sch.deadline, color: "#C0392B" },
                  ].map((item, i) => (
                    <div key={i} style={{ background: "#F8FAFF", border: "1px solid #dde8ff", borderRadius: 6, padding: "10px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#003580", marginBottom: 10 }}>About this Scholarship</h3>
                <p style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.7, marginBottom: 20 }}>{sch.desc}</p>

                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#003580", marginBottom: 10 }}>Eligibility Criteria</h3>
                <ul style={{ listStyle: "none", marginBottom: 20 }}>
                  {sch.eligibility.map((e, i) => (
                    <li key={i} style={{ fontSize: 13, color: "#1a2340", padding: "6px 0", borderBottom: "1px solid #eef0f8", display: "flex", gap: 8, lineHeight: 1.5 }}>
                      <span style={{ color: "#138808", fontWeight: 700, flexShrink: 0 }}>✓</span> {e}
                    </li>
                  ))}
                </ul>

                {user ? (
                  <button className="btn-primary" onClick={() => navigate("/application-form")} style={{ fontSize: 15, padding: "12px 32px" }}>
                    📝 Apply for this Scholarship
                  </button>
                ) : (
                  <div className="alert alert-info">
                    Please <Link to="/login" style={{ color: "#003580", fontWeight: 600 }}>login</Link> or <Link to="/register" style={{ color: "#003580", fontWeight: 600 }}>register</Link> to apply for this scholarship.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ background: "#FF9933", color: "white", padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>📋 How to Apply</div>
              <div style={{ padding: 16 }}>
                {["Register on NSP portal", "Fill personal & academic details", "Upload required documents", "Submit application before deadline", "Wait for institute verification", "Receive amount in bank account"].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #eef0f8", fontSize: 12, color: "#1a2340", alignItems: "flex-start" }}>
                    <span style={{ width: 20, height: 20, background: "#003580", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ background: "#138808", color: "white", padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>📁 Documents Required</div>
              <div style={{ padding: 16 }}>
                {["Aadhaar Card", "Class XII Mark Sheet", "Income Certificate", "Bank Passbook", "College Enrollment Proof", "Caste Certificate (if applicable)"].map((doc, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#1a2340", padding: "7px 0", borderBottom: "1px solid #eef0f8", display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: "#138808" }}>📄</span> {doc}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
