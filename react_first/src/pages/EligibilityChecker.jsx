import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/EligibilityChecker.css";

const SCHOLARSHIPS_DATA = [
  { name: "Central Sector Scheme (CSSS)", amount: "₹20,000/year", minMarks: 80, maxIncome: 450000, categories: ["All"], levels: ["Graduation", "Post-Graduation"] },
  { name: "National Means Cum Merit (NMMS)", amount: "₹12,000/year", minMarks: 55, maxIncome: 350000, categories: ["All"], levels: ["Class 9-10", "Class 11-12"] },
  { name: "PM YASASVI Scholarship", amount: "₹75,000/year", minMarks: 60, maxIncome: 250000, categories: ["OBC"], levels: ["Class 9-10", "Class 11-12"] },
  { name: "Post-Matric Scholarship (SC)", amount: "₹23,400/year", minMarks: 50, maxIncome: 250000, categories: ["SC"], levels: ["Class 11-12", "Graduation", "Post-Graduation", "M.Phil/Ph.D"] },
  { name: "Maulana Azad National Fellowship", amount: "₹31,000/year", minMarks: 55, maxIncome: 600000, categories: ["Minority"], levels: ["M.Phil/Ph.D"] },
  { name: "National Fellowship for ST", amount: "₹37,200/year", minMarks: 55, maxIncome: 9999999, categories: ["ST"], levels: ["M.Phil/Ph.D"] },
  { name: "Pre-Matric Scholarship (Minority)", amount: "₹10,000/year", minMarks: 50, maxIncome: 100000, categories: ["Minority"], levels: ["Class 1-8", "Class 9-10"] },
  { name: "State Merit Scholarship (Open)", amount: "₹15,000/year", minMarks: 60, maxIncome: 500000, categories: ["All", "General"], levels: ["Class 11-12", "Graduation", "Post-Graduation"] },
  { name: "EWS Higher Education Grant", amount: "₹25,000/year", minMarks: 50, maxIncome: 250000, categories: ["All", "General"], levels: ["Graduation"] },
];

const INCOME_MAP = { "Below 1,00,000": 100000, "1,00,000 – 2,50,000": 250000, "2,50,000 – 3,50,000": 350000, "3,50,000 – 4,50,000": 450000, "Above 4,50,000": 9999999 };
const INCOME_OPTIONS = Object.keys(INCOME_MAP);

export default function EligibilityChecker({ user, onLogout }) {
  const [form, setForm] = useState({ cat: "General", income: INCOME_OPTIONS[1], marks: "", level: "Graduation" });
  const [results, setResults] = useState(null);

  const LEVELS = ["Class 1-8", "Class 9-10", "Class 11-12", "Graduation", "Post-Graduation", "M.Phil/Ph.D"];

  const checkEligibility = () => {
    const marks = parseFloat(form.marks) || 0;
    const income = INCOME_MAP[form.income] || 0;
    const matched = SCHOLARSHIPS_DATA.filter(s => {
      const catOk = s.categories.includes("All") || s.categories.includes(form.cat);
      const marksOk = marks >= s.minMarks;
      const incomeOk = income <= s.maxIncome;
      const levelOk = s.levels.includes(form.level);
      return catOk && marksOk && incomeOk && levelOk;
    });
    setResults(matched);
  };

  return (
    <div className="page-wrapper">
      <Navbar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="elig-layout">
          <div className="elig-form-col">
            <div className="elig-card">
              <div className="elig-card-head">
                <h2>✅ Scholarship Eligibility Checker</h2>
                <p>Fill in your details to instantly find scholarships you qualify for.</p>
              </div>
              <div className="elig-card-body">
                <div className="form-group">
                  <label>Your Category</label>
                  <select value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })}>
                    {["General", "OBC", "SC", "ST", "Minority", "Disabled"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Annual Family Income</label>
                  <select value={form.income} onChange={e => setForm({ ...form, income: e.target.value })}>
                    {INCOME_OPTIONS.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Last Examination Percentage (%)</label>
                  <input type="number" placeholder="e.g. 75" min="0" max="100" value={form.marks} onChange={e => setForm({ ...form, marks: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Current Course / Level</label>
                  <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <button className="btn-gov" style={{ background: "#7b1fa2" }} onClick={checkEligibility}>Check My Eligibility</button>

                {results !== null && (
                  <div className="elig-results">
                    {results.length === 0 ? (
                      <div className="alert alert-error">No scholarships matched. Try changing your details or <Link to="/scholarships">browse all schemes</Link>.</div>
                    ) : (
                      <>
                        <div className="alert alert-success"><strong>✅ {results.length} scholarship(s) you may be eligible for:</strong></div>
                        {results.map((s, i) => (
                          <div key={i} className="elig-result-card">
                            <div className="elig-result-name">{s.name}</div>
                            <div className="elig-result-amount">{s.amount}</div>
                          </div>
                        ))}
                        <Link to={user ? "/application-form" : "/register"} className="btn-gov" style={{ marginTop: 10, display: "block", background: "#138808", textAlign: "center", textDecoration: "none" }}>
                          Register &amp; Apply Now →
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="elig-info-col">
            <div className="info-box">
              <h3>📋 Documents Required</h3>
              <ul>
                {["Aadhaar Card (mandatory)", "Latest Mark Sheet / Grade Card", "Income Certificate from Tehsildar/SDM", "Caste Certificate (for SC/ST/OBC)", "Bank Account Passbook (linked to Aadhaar)", "College / Institution Enrollment Certificate", "Passport-size Photograph"].map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
            </div>
            <div className="info-box" style={{ marginTop: 16 }}>
              <h3>ℹ️ Important Points</h3>
              <ul>
                {["One student can apply to multiple scholarships.", "Fresh applications and renewal are separate.", "Institute verification is mandatory for disbursal.", "Amount is credited directly to Aadhaar-linked bank account.", "Wrong Information: If a scholarship is awarded based on false information, it can be cancelled at the discretion of the State Government."].map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
