import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/Scholarships.css";

const ALL_SCHOLARSHIPS = [
  { id: 1,  tag: "all",      tagLabel: "Open to All",    title: "Central Sector Scheme of Scholarship (CSSS)",                    ministry: "Ministry of Education",                          marks: "80%",  income: "₹4,50,000", amount: "₹20,000",      deadline: "31 Oct 2026", level: "UG/PG",         category: "All",      desc: "For college & university students scoring above 80th percentile in Class XII board exams." },
  { id: 2,  tag: "all",      tagLabel: "Open to All",    title: "National Means Cum Merit Scholarship (NMMS)",                    ministry: "Ministry of Education",                          marks: "55%",  income: "₹3,50,000", amount: "₹12,000",      deadline: "15 Nov 2026", level: "Class 9-12",    category: "All",      desc: "For meritorious students from economically weaker sections studying in Class 9 to 12." },
  { id: 3,  tag: "obc",      tagLabel: "OBC / EBC / DNT",title: "PM YASASVI Scholarship (Class 9-10)",                            ministry: "Ministry of Social Justice & Empowerment",       marks: "60%",  income: "₹2,50,000", amount: "₹75,000",      deadline: "31 Oct 2026", level: "Class 9-10",    category: "OBC",      desc: "For OBC, EBC and DNT students. Provides up to ₹75,000 per year for residential school students." },
  { id: 4,  tag: "obc",      tagLabel: "OBC / EBC / DNT",title: "PM YASASVI Scholarship (Class 11-12)",                           ministry: "Ministry of Social Justice & Empowerment",       marks: "60%",  income: "₹2,50,000", amount: "₹1,25,000",    deadline: "31 Oct 2026", level: "Class 11-12",   category: "OBC",      desc: "Higher secondary level scholarship for OBC, EBC and DNT students." },
  { id: 5,  tag: "sc",       tagLabel: "SC Students",    title: "Post-Matric Scholarship for SC Students",                        ministry: "Ministry of Social Justice & Empowerment",       marks: "50%",  income: "₹2,50,000", amount: "₹23,400",      deadline: "31 Dec 2026", level: "Post-Matric",   category: "SC",       desc: "Assists SC students pursuing post-matriculation or post-secondary level education." },
  { id: 6,  tag: "sc",       tagLabel: "SC Students",    title: "Pre-Matric Scholarship for SC Students (Class 9-10)",            ministry: "Ministry of Social Justice & Empowerment",       marks: "45%",  income: "₹2,50,000", amount: "₹5,400",       deadline: "31 Oct 2026", level: "Class 9-10",    category: "SC",       desc: "For SC students studying in Class 9 and 10 in government or aided schools." },
  { id: 7,  tag: "st",       tagLabel: "ST Students",    title: "National Fellowship for ST Students (M.Phil/Ph.D)",             ministry: "Ministry of Tribal Affairs",                     marks: "55%",  income: "No Limit",  amount: "₹37,200",      deadline: "31 Dec 2026", level: "M.Phil/Ph.D",   category: "ST",       desc: "Financial support to ST students pursuing research degrees (M.Phil./Ph.D.)." },
  { id: 8,  tag: "st",       tagLabel: "ST Students",    title: "Post-Matric Scholarship for ST Students",                        ministry: "Ministry of Tribal Affairs",                     marks: "50%",  income: "₹2,50,000", amount: "₹23,400",      deadline: "31 Dec 2026", level: "Post-Matric",   category: "ST",       desc: "For ST students pursuing post-matriculation level education across India." },
  { id: 9,  tag: "minority", tagLabel: "Minority",       title: "Maulana Azad National Fellowship (M.Phil/Ph.D)",                ministry: "Ministry of Minority Affairs",                    marks: "55%",  income: "₹6,00,000", amount: "₹31,000",      deadline: "15 Oct 2026", level: "M.Phil/Ph.D",   category: "Minority", desc: "Fellowship for minority community students pursuing M.Phil/Ph.D under UGC." },
  { id: 10, tag: "minority", tagLabel: "Minority",       title: "Pre-Matric Scholarship for Minorities (Class 1-8)",             ministry: "Ministry of Minority Affairs",                    marks: "50%",  income: "₹1,00,000", amount: "₹10,000",      deadline: "31 Oct 2026", level: "Class 1-8",     category: "Minority", desc: "For students from minority communities studying in Class 1 to 8." },
  { id: 11, tag: "minority", tagLabel: "Minority",       title: "Pre-Matric Scholarship for Minorities (Class 9-10)",            ministry: "Ministry of Minority Affairs",                    marks: "50%",  income: "₹1,00,000", amount: "₹13,500",      deadline: "31 Oct 2026", level: "Class 9-10",    category: "Minority", desc: "For students from minority communities studying in Class 9 and 10." },
  { id: 12, tag: "minority", tagLabel: "Minority",       title: "Post-Matric Scholarship for Minorities",                        ministry: "Ministry of Minority Affairs",                    marks: "50%",  income: "₹2,00,000", amount: "₹17,000",      deadline: "31 Oct 2026", level: "Post-Matric",   category: "Minority", desc: "For minority students studying at post-matriculation level (Class 11 and above)." },
  { id: 13, tag: "minority", tagLabel: "Minority",       title: "Merit-cum-Means Scholarship for Minorities (Professional)",     ministry: "Ministry of Minority Affairs",                    marks: "50%",  income: "₹2,50,000", amount: "₹25,000",      deadline: "31 Oct 2026", level: "UG/PG",         category: "Minority", desc: "For minority students pursuing technical/professional courses like Engineering, Medicine, MBA." },
  { id: 14, tag: "all",      tagLabel: "Open to All",    title: "Top Class Education Scheme (SC Students)",                      ministry: "Ministry of Social Justice & Empowerment",       marks: "60%",  income: "₹6,00,000", amount: "Full Tuition",  deadline: "30 Nov 2026", level: "UG/PG",         category: "SC",       desc: "Full tuition fee waiver for SC students admitted to top institutions like IITs, IIMs, NITs." },
  { id: 15, tag: "all",      tagLabel: "Open to All",    title: "National Scheme of Incentive to Girls for Secondary Education", ministry: "Ministry of Education",                          marks: "Passed",income: "BPL",       amount: "₹3,000",       deadline: "30 Nov 2026", level: "Class 9-10",    category: "All",      desc: "For girls belonging to SC/ST communities or BPL families who pass Class 8 exams." },
  { id: 16, tag: "all",      tagLabel: "Open to All",    title: "Scholarship for Top Class Students with Disability",            ministry: "Dept. of Empowerment of Persons with Disabilities", marks: "60%", income: "₹6,00,000", amount: "₹2,00,000",  deadline: "30 Nov 2026", level: "UG/PG",         category: "All",      desc: "For students with disabilities admitted to top 200 institutions of higher learning." },
  { id: 17, tag: "all",      tagLabel: "Open to All",    title: "National Overseas Scholarship (NOS) for SC/OBC",               ministry: "Ministry of Social Justice & Empowerment",       marks: "60%",  income: "₹6,00,000", amount: "Full Cost",     deadline: "15 Jan 2026", level: "M.Phil/Ph.D",   category: "SC",       desc: "For SC/OBC students to pursue Masters and Ph.D. degrees abroad." },
  { id: 18, tag: "all",      tagLabel: "Open to All",    title: "Rajiv Gandhi National Fellowship (SC/ST Ph.D.)",               ministry: "UGC / Ministry of Education",                    marks: "55%",  income: "No Limit",  amount: "₹31,000",      deadline: "31 Jan 2026", level: "M.Phil/Ph.D",   category: "SC",       desc: "For SC and ST students pursuing M.Phil and Ph.D. degrees in universities across India." },
  { id: 19, tag: "all",      tagLabel: "Open to All",    title: "Ishan Uday (Special Scholarship for NE Region)",               ministry: "UGC / Ministry of Education",                    marks: "60%",  income: "₹4,50,000", amount: "₹7,800",       deadline: "31 Oct 2026", level: "UG/PG",         category: "All",      desc: "For students from the North East Region of India pursuing UG and PG courses." },
  { id: 20, tag: "all",      tagLabel: "Open to All",    title: "PG Scholarship for University Rank Holders (PG Indira Gandhi)", ministry: "UGC / Ministry of Education",                    marks: "Top Rank", income: "No Limit", amount: "₹3,100",    deadline: "31 Dec 2026", level: "Post-Graduation", category: "All",   desc: "For students who stood first or second in UG examination and are pursuing PG courses." },
];

const CATEGORIES = ["All", "Open to All", "OBC", "SC", "ST", "Minority"];
const LEVELS = ["All Levels", "Class 1-8", "Class 9-10", "Class 9-12", "Class 11-12", "Post-Matric", "UG/PG", "Post-Graduation", "M.Phil/Ph.D"];

export default function Scholarships({ user, onLogout }) {
  const [filter, setFilter] = useState({ category: "All", level: "All Levels", search: "" });
  const [hoveredId, setHoveredId] = useState(null);

  const filtered = ALL_SCHOLARSHIPS.filter(s => {
    const catMatch = filter.category === "All" || s.category === filter.category || s.tagLabel.includes(filter.category);
    const levelMatch = filter.level === "All Levels" || s.level === filter.level;
    const searchMatch = !filter.search || s.title.toLowerCase().includes(filter.search.toLowerCase()) || s.ministry.toLowerCase().includes(filter.search.toLowerCase());
    return catMatch && levelMatch && searchMatch;
  });

  return (
    <div className="page-wrapper">
      <Navbar user={user} onLogout={onLogout} />

      {/* HERO */}
      <div className="sch-page-hero">
        <div className="sch-hero-inner">
          <div className="sch-hero-badge">📋 Scholarship Directory</div>
          <h1>All 20 Government Scholarship Schemes</h1>
          <p>Browse all Central Government scholarship schemes. Select filters to instantly find eligible schemes.</p>
          <div className="sch-hero-stats">
            <div className="sh-stat"><span>20</span> Schemes</div>
            <div className="sh-stat"><span>₹75K</span> Max Award</div>
            <div className="sh-stat"><span>5 Cr+</span> Beneficiaries</div>
            <div className="sh-stat"><span>6</span> Categories</div>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* FILTERS */}
        <div className="sch-filters">
          <input
            type="text"
            placeholder="🔍 Search by scheme name or ministry..."
            className="sch-search"
            value={filter.search}
            onChange={e => setFilter({ ...filter, search: e.target.value })}
          />
          <div className="filter-tabs">
            <span className="filter-label">Category:</span>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-tab ${filter.category === cat ? "active" : ""}`}
                onClick={() => setFilter({ ...filter, category: cat })}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="filter-tabs">
            <span className="filter-label">Level:</span>
            <select
              value={filter.level}
              onChange={e => setFilter({ ...filter, level: e.target.value })}
              className="level-select"
            >
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="sch-count">
          Showing <strong>{filtered.length}</strong> of <strong>{ALL_SCHOLARSHIPS.length}</strong> scholarship schemes
          {filter.search && <span> for "<em>{filter.search}</em>"</span>}
        </div>

        {/* SCHOLARSHIP LIST */}
        <div className="sch-list">
          {filtered.map((sch, idx) => (
            <div
              key={sch.id}
              className={`sch-list-card ${hoveredId === sch.id ? "hovered" : ""}`}
              onMouseEnter={() => setHoveredId(sch.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              {/* Serial number */}
              <div className="sch-serial">#{sch.id}</div>

              <div className="sch-list-main">
                <div className="sch-list-top">
                  <span className={`tag tag-${sch.tag}`}>{sch.tagLabel}</span>
                  <span className="sch-ministry">🏛 {sch.ministry}</span>
                  <span className="sch-level-badge">📚 {sch.level}</span>
                </div>
                <h3>{sch.title}</h3>
                <p className="sch-desc">{sch.desc}</p>
                <div className="sch-list-meta">
                  <span>📊 Min Marks: <strong>{sch.marks}</strong></span>
                  <span>👨‍👩‍👧 Income: <strong>{sch.income}</strong></span>
                  <span>⏰ Deadline: <strong style={{ color: "#C0392B" }}>{sch.deadline}</strong></span>
                </div>
              </div>
              <div className="sch-list-right">
                <div className="sch-amount">
                  <div className="sch-amount-label">Per Year</div>
                  <div className="sch-amount-value">{sch.amount}</div>
                </div>
                <Link
                  to={user ? `/apply/${sch.id}` : "/login"}
                  className="btn-apply"
                >
                  Apply Now →
                </Link>
                <Link to={`/apply/${sch.id}`} className="btn-details">
                  View Details
                </Link>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="no-results">
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <h3>No scholarships found</h3>
              <p>Try changing category or search term.</p>
              <button className="btn-gov" style={{ width: "auto", marginTop: 16 }} onClick={() => setFilter({ category: "All", level: "All Levels", search: "" })}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
