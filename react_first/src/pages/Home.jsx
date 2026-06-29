import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/Home.css";

/* ─── Typewriter hook ─── */
function useTypewriter(words, typingSpeed = 80, pauseMs = 1800, deleteSpeed = 45) {
  const [displayed, setDisplayed] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState("typing"); // typing | pausing | deleting

  useEffect(() => {
    const word = words[wordIdx];
    let timer;
    if (phase === "typing") {
      if (displayed.length < word.length) {
        timer = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), typingSpeed);
      } else {
        timer = setTimeout(() => setPhase("pausing"), pauseMs);
      }
    } else if (phase === "pausing") {
      setPhase("deleting");
    } else if (phase === "deleting") {
      if (displayed.length > 0) {
        timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), deleteSpeed);
      } else {
        setWordIdx((i) => (i + 1) % words.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timer);
  }, [displayed, phase, wordIdx, words, typingSpeed, pauseMs, deleteSpeed]);

  return displayed;
}

/* ─── Floating particles canvas ─── */
function HeroParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 38 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.5,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      o: Math.random() * 0.5 + 0.15,
      gold: Math.random() > 0.65,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold ? `rgba(255,210,70,${p.o})` : `rgba(160,190,255,${p.o})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0,
    }} />
  );
}

const Reveal = ({ children, type = "fade", delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); }
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const getStyle = () => {
    switch(type) {
      case "fade":  return { opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)"  : "translateY(30px)" };
      case "left":  return { opacity: isVisible ? 1 : 0, transform: isVisible ? "translateX(0)"  : "translateX(-40px)" };
      case "right": return { opacity: isVisible ? 1 : 0, transform: isVisible ? "translateX(0)"  : "translateX(40px)" };
      case "zoom":  return { opacity: isVisible ? 1 : 0, transform: isVisible ? "scale(1)"       : "scale(0.9)" };
      default:      return { opacity: isVisible ? 1 : 0 };
    }
  };

  return (
    <div ref={ref} style={{
      ...getStyle(),
      transition: "opacity 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      transitionDelay: `${delay}s`, willChange: "opacity, transform",
    }}>
      {children}
    </div>
  );
};

const SCHOLARSHIPS = [
  { id: 1,  tag: "all",      tagLabel: "Open to All",    title: "Central Sector Scheme of Scholarship (CSSS)",                   ministry: "Ministry of Education",                          marks: "80%",  income: "₹4,50,000", amount: "₹20,000",      deadline: "31 Oct 2026", level: "UG/PG",         category: "All",      desc: "For college & university students scoring above 80th percentile in Class XII board exams." },
  { id: 2,  tag: "all",      tagLabel: "Open to All",    title: "National Means Cum Merit Scholarship (NMMS)",                   ministry: "Ministry of Education",                          marks: "55%",  income: "₹3,50,000", amount: "₹12,000",      deadline: "15 Nov 2026", level: "Class 9-12",    category: "All",      desc: "For meritorious students from economically weaker sections studying in Class 9 to 12." },
  { id: 3,  tag: "obc",      tagLabel: "OBC / EBC / DNT",title: "PM YASASVI Scholarship (Class 9-10)",                           ministry: "Ministry of Social Justice & Empowerment",       marks: "60%",  income: "₹2,50,000", amount: "₹75,000",      deadline: "31 Oct 2026", level: "Class 9-10",    category: "OBC",      desc: "For OBC, EBC and DNT students. Provides up to ₹75,000 per year for residential school students." },
  { id: 4,  tag: "obc",      tagLabel: "OBC / EBC / DNT",title: "PM YASASVI Scholarship (Class 11-12)",                          ministry: "Ministry of Social Justice & Empowerment",       marks: "60%",  income: "₹2,50,000", amount: "₹1,25,000",    deadline: "31 Oct 2026", level: "Class 11-12",   category: "OBC",      desc: "Higher secondary level scholarship for OBC, EBC and DNT students." },
  { id: 5,  tag: "sc",       tagLabel: "SC Students",    title: "Post-Matric Scholarship for SC Students",                       ministry: "Ministry of Social Justice & Empowerment",       marks: "50%",  income: "₹2,50,000", amount: "₹23,400",      deadline: "31 Dec 2026", level: "Post-Matric",   category: "SC",       desc: "Assists SC students pursuing post-matriculation or post-secondary level education." },
  { id: 6,  tag: "sc",       tagLabel: "SC Students",    title: "Pre-Matric Scholarship for SC Students (Class 9-10)",           ministry: "Ministry of Social Justice & Empowerment",       marks: "45%",  income: "₹2,50,000", amount: "₹5,400",       deadline: "31 Oct 2026", level: "Class 9-10",    category: "SC",       desc: "For SC students studying in Class 9 and 10 in government or aided schools." },
  { id: 7,  tag: "st",       tagLabel: "ST Students",    title: "National Fellowship for ST Students (M.Phil/Ph.D)",            ministry: "Ministry of Tribal Affairs",                     marks: "55%",  income: "No Limit",  amount: "₹37,200",      deadline: "31 Dec 2026", level: "M.Phil/Ph.D",   category: "ST",       desc: "Financial support to ST students pursuing research degrees (M.Phil./Ph.D.)." },
  { id: 8,  tag: "st",       tagLabel: "ST Students",    title: "Post-Matric Scholarship for ST Students",                       ministry: "Ministry of Tribal Affairs",                     marks: "50%",  income: "₹2,50,000", amount: "₹23,400",      deadline: "31 Dec 2026", level: "Post-Matric",   category: "ST",       desc: "For ST students pursuing post-matriculation level education across India." },
  { id: 9,  tag: "minority", tagLabel: "Minority",       title: "Maulana Azad National Fellowship (M.Phil/Ph.D)",               ministry: "Ministry of Minority Affairs",                    marks: "55%",  income: "₹6,00,000", amount: "₹31,000",      deadline: "15 Oct 2026", level: "M.Phil/Ph.D",   category: "Minority", desc: "Fellowship for minority community students pursuing M.Phil/Ph.D under UGC." },
  { id: 10, tag: "minority", tagLabel: "Minority",       title: "Pre-Matric Scholarship for Minorities (Class 1-8)",            ministry: "Ministry of Minority Affairs",                    marks: "50%",  income: "₹1,00,000", amount: "₹10,000",      deadline: "31 Oct 2026", level: "Class 1-8",     category: "Minority", desc: "For students from minority communities studying in Class 1 to 8." },
  { id: 11, tag: "minority", tagLabel: "Minority",       title: "Pre-Matric Scholarship for Minorities (Class 9-10)",           ministry: "Ministry of Minority Affairs",                    marks: "50%",  income: "₹1,00,000", amount: "₹13,500",      deadline: "31 Oct 2026", level: "Class 9-10",    category: "Minority", desc: "For students from minority communities studying in Class 9 and 10." },
  { id: 12, tag: "minority", tagLabel: "Minority",       title: "Post-Matric Scholarship for Minorities",                       ministry: "Ministry of Minority Affairs",                    marks: "50%",  income: "₹2,00,000", amount: "₹17,000",      deadline: "31 Oct 2026", level: "Post-Matric",   category: "Minority", desc: "For minority students studying at post-matriculation level (Class 11 and above)." },
  { id: 13, tag: "minority", tagLabel: "Minority",       title: "Merit-cum-Means Scholarship for Minorities (Professional)",    ministry: "Ministry of Minority Affairs",                    marks: "50%",  income: "₹2,50,000", amount: "₹25,000",      deadline: "31 Oct 2026", level: "UG/PG",         category: "Minority", desc: "For minority students pursuing technical/professional courses like Engineering, Medicine, MBA." },
  { id: 14, tag: "all",      tagLabel: "Open to All",    title: "Top Class Education Scheme (SC Students)",                     ministry: "Ministry of Social Justice & Empowerment",       marks: "60%",  income: "₹6,00,000", amount: "Full Tuition",  deadline: "30 Nov 2026", level: "UG/PG",         category: "SC",       desc: "Full tuition fee waiver for SC students admitted to top institutions like IITs, IIMs, NITs." },
  { id: 15, tag: "all",      tagLabel: "Open to All",    title: "National Scheme of Incentive to Girls for Secondary Education",ministry: "Ministry of Education",                          marks: "Passed",income: "BPL",       amount: "₹3,000",       deadline: "30 Nov 2026", level: "Class 9-10",    category: "All",      desc: "For girls belonging to SC/ST communities or BPL families who pass Class 8 exams." },
  { id: 16, tag: "all",      tagLabel: "Open to All",    title: "Scholarship for Top Class Students with Disability",           ministry: "Dept. of Empowerment of Persons with Disabilities",marks: "60%",income: "₹6,00,000", amount: "₹2,00,000",   deadline: "30 Nov 2026", level: "UG/PG",         category: "All",      desc: "For students with disabilities admitted to top 200 institutions of higher learning." },
  { id: 17, tag: "all",      tagLabel: "Open to All",    title: "National Overseas Scholarship (NOS) for SC/OBC",              ministry: "Ministry of Social Justice & Empowerment",       marks: "60%",  income: "₹6,00,000", amount: "Full Cost",     deadline: "15 Jan 2026", level: "M.Phil/Ph.D",   category: "SC",       desc: "For SC/OBC students to pursue Masters and Ph.D. degrees abroad." },
  { id: 18, tag: "all",      tagLabel: "Open to All",    title: "Rajiv Gandhi National Fellowship (SC/ST Ph.D.)",              ministry: "UGC / Ministry of Education",                    marks: "55%",  income: "No Limit",  amount: "₹31,000",      deadline: "31 Jan 2026", level: "M.Phil/Ph.D",   category: "SC",       desc: "For SC and ST students pursuing M.Phil and Ph.D. degrees in universities across India." },
  { id: 19, tag: "all",      tagLabel: "Open to All",    title: "Ishan Uday (Special Scholarship for NE Region)",              ministry: "UGC / Ministry of Education",                    marks: "60%",  income: "₹4,50,000", amount: "₹7,800",       deadline: "31 Oct 2026", level: "UG/PG",         category: "All",      desc: "For students from the North East Region of India pursuing UG and PG courses." },
  { id: 20, tag: "all",      tagLabel: "Open to All",    title: "PG Scholarship for University Rank Holders (PG Indira Gandhi)",ministry: "UGC / Ministry of Education",                   marks: "Top Rank",income: "No Limit",amount: "₹3,100",     deadline: "31 Dec 2026", level: "Post-Graduation",category: "All",     desc: "For students who stood first or second in UG examination and are pursuing PG courses." },
];

const FAQS_LIST = [
  { category: "General",     q: "Who is eligible for NSP scholarships?",           a: "Eligibility varies by scheme. Generally, students belonging to SC/ST/OBC/Minority communities with a certain family income threshold are eligible. Check the specific scheme guidelines." },
  { category: "Application", q: "Can I apply for more than one scholarship?",      a: "Yes, depending on the scheme rules. Typically only one scholarship is allowed per student per academic year from Central Schemes." },
  { category: "Documents",   q: "What documents are required?",                    a: "Common documents include Aadhaar Card, Income Certificate, Caste Certificate, Bank Passbook, and Marksheet." },
  { category: "Tracking",    q: "How do I track my application status?",           a: "You can track your application status by logging into your dashboard and clicking on 'Track Application Status'." },
  { category: "Application", q: "Is Aadhaar Card mandatory for registration?",     a: "Yes, Aadhaar is mandatory for identification and Direct Benefit Transfer (DBT) of scholarship amounts into the student's bank account." }
];

/* ── animated words cycling in the hero ── */
const HERO_WORDS = [
  "Across Bharat",
  "Into the Future",
  "Through Merit",
  "With Opportunity",
  "Beyond Barriers",
];

export default function Home({ user, onLogout }) {
  const navigate = useNavigate();
  const [showEligModal,     setShowEligModal]     = useState(false);
  const [showAboutModal,    setShowAboutModal]    = useState(false);
  const [showFaqModal,      setShowFaqModal]      = useState(false);
  const [eligResult,        setEligResult]        = useState(null);
  const [showAllScholarships, setShowAllScholarships] = useState(false);
  const [heroVisible,       setHeroVisible]       = useState(false);

  const typedWord = useTypewriter(HERO_WORDS);

  const [form, setForm] = useState({ cat: "General", income: "Below 1,00,000", marks: "", course: "Graduation" });

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const checkEligibility = () => {
    const marks = parseFloat(form.marks) || 0;
    const matched = [];
    if (marks >= 80) matched.push({ name: "Central Sector Scheme (CSSS)", amt: "₹20,000/year" });
    if (marks >= 55) matched.push({ name: "National Means Cum Merit (NMMS)", amt: "₹12,000/year" });
    if (form.cat === "OBC" && marks >= 60) matched.push({ name: "PM YASASVI Scholarship", amt: "₹75,000/year" });
    if (form.cat === "SC"  && marks >= 50) matched.push({ name: "Post-Matric Scholarship (SC)", amt: "₹23,400/year" });
    if (form.cat === "Minority" && marks >= 55) matched.push({ name: "Maulana Azad Fellowship", amt: "₹31,000/year" });
    if (form.cat === "ST") matched.push({ name: "National Fellowship for ST", amt: "₹37,200/year" });
    if (["General","All"].includes(form.cat) && marks >= 60) matched.push({ name: "State Merit Scholarship (Open)", amt: "₹15,000/year" });
    if (["General","All"].includes(form.cat) && marks >= 50 && form.course === "Graduation") matched.push({ name: "EWS Higher Education Grant", amt: "₹25,000/year" });
    setEligResult(matched);
  };

  /* ── inline keyframe styles injected once ── */
  const heroAnimStyles = `
    @keyframes badgeShimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes heroBadgePop {
      0%   { opacity:0; transform: translateY(-12px) scale(0.92); }
      100% { opacity:1; transform: translateY(0)     scale(1); }
    }
    @keyframes heroTitleSlide {
      0%   { opacity:0; transform: translateY(22px); }
      100% { opacity:1; transform: translateY(0); }
    }
    @keyframes heroSubSlide {
      0%   { opacity:0; transform: translateY(16px); }
      100% { opacity:1; transform: translateY(0); }
    }
    @keyframes heroActionsSlide {
      0%   { opacity:0; transform: translateY(14px); }
      100% { opacity:1; transform: translateY(0); }
    }
    @keyframes cursorBlink {
      0%,100% { opacity:1; } 50% { opacity:0; }
    }
    @keyframes statCardPop {
      0%   { opacity:0; transform: translateX(24px) scale(0.94); }
      100% { opacity:1; transform: translateX(0)    scale(1); }
    }
    @keyframes floatUp {
      0%,100% { transform: translateY(0px);  }
      50%      { transform: translateY(-6px); }
    }
    .hero-badge-animated {
      animation: heroBadgePop 0.55s cubic-bezier(0.34,1.56,0.64,1) both,
                 badgeShimmer 3.5s linear 0.6s infinite;
      background: linear-gradient(
        100deg,
        #FFD700 0%, #FFA500 30%, #fff8c0 50%, #FFA500 70%, #FFD700 100%
      ) !important;
      background-size: 200% auto !important;
    }
    .hero-title-animated {
      animation: heroTitleSlide 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s both;
    }
    .hero-sub-animated {
      animation: heroSubSlide 0.7s cubic-bezier(0.22,1,0.36,1) 0.45s both;
    }
    .hero-actions-animated {
      animation: heroActionsSlide 0.7s cubic-bezier(0.22,1,0.36,1) 0.65s both;
    }
    .typed-cursor {
      display: inline-block;
      width: 3px;
      background: #FFD700;
      margin-left: 3px;
      vertical-align: baseline;
      animation: cursorBlink 0.85s step-end infinite;
      border-radius: 2px;
    }
    .stat-card-animated:nth-child(1) { animation: statCardPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.4s both, floatUp 4s ease-in-out 1.2s infinite; }
    .stat-card-animated:nth-child(2) { animation: statCardPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.55s both, floatUp 4s ease-in-out 1.6s infinite; }
    .stat-card-animated:nth-child(3) { animation: statCardPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.70s both, floatUp 4s ease-in-out 2.0s infinite; }
    .hero-particles-wrap {
      position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0;
    }
  `;

  return (
    <div className="page-wrapper">
      <style>{heroAnimStyles}</style>

      <Navbar user={user} onLogout={onLogout} onAboutClick={() => setShowAboutModal(true)} onFaqClick={() => setShowFaqModal(true)} showReg={false} />

      {/* NOTICE BAR */}
      <div className="notice-bar">
        <div className="notice-inner">
          <span className="notice-label">📢 Notice</span>
          <div className="marquee-wrap">
            <div className="marquee">
              {SCHOLARSHIPS.map((sch, index) => (
                <span key={index}>⏰ {sch.title} (Deadline: {sch.deadline}) &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>
              ))}
              {SCHOLARSHIPS.map((sch, index) => (
                <span key={`dup-${index}`}>⏰ {sch.title} (Deadline: {sch.deadline}) &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ HERO ══ */}
      <div className="hero" style={{ position: "relative", overflow: "hidden" }}>

        {/* floating particles */}
        <div className="hero-particles-wrap">
          <HeroParticles />
        </div>

        <div className="hero-inner" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-text">

            {/* Badge — shimmer animation */}
            <div
              className="hero-badge hero-badge-animated"
              style={{
                color: "#000080",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                boxShadow: "0 4px 18px rgba(255,215,0,0.55)",
                border: "2px solid rgba(255,255,255,0.6)",
                padding: "8px 20px",
                borderRadius: "50px",
                fontSize: "0.9rem",
                marginBottom: "20px",
                display: "inline-block",
                textShadow: "0 1px 2px rgba(255,255,255,0.4)",
              }}
            >
              Scholarship Eligibility &amp; Tracking Portal
            </div>

            {/* Heading — slide-up + typewriter on the orange span */}
            <h2 className="hero-title-animated" style={{ lineHeight: 1.22 }}>
              Empowering Students{" "}
              <span style={{ display: "inline-block", minWidth: 200 }}>
                {typedWord}
                <span className="typed-cursor" style={{ height: "0.85em" }}>&nbsp;</span>
              </span>
              <br />
              Through Education &amp; Opportunity
            </h2>

            {/* Subtext */}
            <p className="hero-sub-animated">
              Discover, check eligibility, and apply for government scholarships — all in one secure, unified platform. Supporting meritorious and economically weaker students from Pre-Matric to Post-Doctoral level.
            </p>

            {/* CTA buttons */}
            <div className="hero-actions hero-actions-animated">
              <Link to="/register" className="btn-hero-primary">📝 New Registration</Link>
              <a href="#scholarships" className="btn-hero-secondary">🔍 Explore Scholarships</a>
              <button className="btn-hero-secondary" onClick={() => setShowEligModal(true)}>✅ Check Eligibility</button>
            </div>
          </div>

          {/* Stat cards — pop-in + float */}
          <div className="hero-stats">
            <div className="stat-card stat-card-animated"><div className="num">15+</div><div className="lbl">Scholarships Available</div></div>
            <div className="stat-card stat-card-animated"><div className="num">₹75K</div><div className="lbl">Max Annual Award</div></div>
            <div className="stat-card stat-card-animated"><div className="num">5 Cr+</div><div className="lbl">Students Benefited</div></div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="main-content">

        <div className="section-head" style={{ marginTop: 8 }}>
          <h3>Quick Access</h3>
          <div className="section-line" />
        </div>
        <div className="quick-links">
          {[
            { icon: "📝", label: "Fresh Registration", bg: "#EEF6FF", path: "/register" },
            { icon: "🔑", label: "Student Login",      bg: "#E8F5E9", path: "/login" },
            { icon: "🎓", label: "Browse Scholarships",bg: "#FFF3E0", path: "/scholarships" },
            { icon: "✅", label: "Check Eligibility",  bg: "#F3E5F5", onClick: () => setShowEligModal(true) },
            { icon: "📊", label: "Track Application",  bg: "#E3F2FD", path: "/track" },
            { icon: "📞", label: "Help & Support",     bg: "#FCE4EC", path: "#" },
          ].map((item, i) => (
            <Reveal key={i} type="zoom" delay={i * 0.1}>
              {item.onClick ? (
                <button className="ql-card" onClick={item.onClick} style={{ cursor:"pointer", width:"100%", height:"100%" }}>
                  <div className="ql-icon" style={{ background: item.bg }}>{item.icon}</div>
                  <div className="ql-label">{item.label}</div>
                </button>
              ) : (
                <Link to={item.path} className="ql-card" style={{ width:"100%", height:"100%" }}>
                  <div className="ql-icon" style={{ background: item.bg }}>{item.icon}</div>
                  <div className="ql-label">{item.label}</div>
                </Link>
              )}
            </Reveal>
          ))}
        </div>

        <div className="section-head">
          <h3>How to Apply</h3>
          <div className="section-line" />
        </div>
        <div className="steps-row">
          {[
            { icon: "📝", num: "1", title: "Register on USP",   desc: "Create your account using your Aadhaar number, email OTP, and basic academic details." },
            { icon: "🔍", num: "2", title: "Check Eligibility", desc: "Enter your category, income, marks, and course level to see which scholarships you qualify for." },
            { icon: "📁", num: "3", title: "Upload Documents",  desc: "Upload mark sheets, income certificate, caste certificate, and bank passbook via DigiLocker." },
            { icon: "💰", num: "4", title: "Receive Amount",    desc: "After institute and ministry verification, scholarship amount is directly credited to your bank account." },
          ].map((step, i) => (
            <Reveal key={i} type="fade" delay={i * 0.15}>
              <div className="step-card" style={{ height:"100%" }}>
                <div className="step-icon">{step.icon}</div>
                <div className="step-num">{step.num}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div id="scholarships">
          <div className="section-head">
            <h3>Available Scholarships</h3>
            <div className="section-line" />
            <button
              className="view-all-link"
              onClick={() => setShowAllScholarships(!showAllScholarships)}
              style={{ background:"none", border:"none", cursor:"pointer", fontSize:"inherit", fontFamily:"inherit" }}
            >
              {showAllScholarships ? "Show Less ←" : "View All 20 →"}
            </button>
          </div>
        </div>
        <div className="two-col">
          <div>
            <div className="scholarship-grid">
              {(showAllScholarships ? SCHOLARSHIPS : SCHOLARSHIPS.slice(0, 5)).map((sch, i) => (
                <Reveal key={sch.id} type="left" delay={(i % 2) * 0.1}>
                  <div className="sch-card" style={{ height:"100%" }}>
                    <span className={`tag tag-${sch.tag}`}>{sch.tagLabel}</span>
                    <span className="deadline-badge">⏰ {sch.deadline}</span>
                    <h4>{sch.title}</h4>
                    <p>{sch.desc}</p>
                    <div className="sch-meta">
                      <div className="meta-item"><div className="mk">Min Marks</div><div className="mv">{sch.marks}</div></div>
                      <div className="meta-item"><div className="mk">Income Limit</div><div className="mv">{sch.income}</div></div>
                      <div className="meta-item"><div className="mk">Per Year</div><div className="mv" style={{ color:"#138808" }}>{sch.amount}</div></div>
                      <div className="meta-item"><div className="mk">Category</div><div className="mv">{sch.tagLabel}</div></div>
                    </div>
                    <Link to={user ? `/apply/${sch.id}` : "/login"} className="apply-link">Apply Now →</Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="home-sidebar">
            <Reveal type="right" delay={0}>
              <div className="side-box">
                <div className="side-box-head">🔐 Student Login</div>
                <div className="side-box-body">
                  <div className="form-group"><label>Login Type</label><select><option>Student</option><option>Institute</option><option>Ministry</option></select></div>
                  <div className="form-group"><label>Application ID</label><input type="text" placeholder="Enter Application ID" /></div>
                  <div className="form-group"><label>Password</label><input type="password" placeholder="Enter Password" /></div>
                  <button className="btn-gov" onClick={() => navigate("/login")}>Login to Portal</button>
                  <div className="or-row">OR</div>
                  <button className="digilocker-btn">🔒 Login with DigiLocker</button>
                  <div className="form-links">
                    <Link to="/register">New Registration?</Link>
                    <a href="#">Forgot Password?</a>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal type="right" delay={0.15}>
              <div className="side-box">
                <div className="side-box-head orange">📌 Important Notices</div>
                <div className="side-box-body">
                  <ul className="notice-list">
                    <li><div><div>Fresh applications for CSSS open for academic year 2025-26</div><div className="notice-date">📅 01 Sep 2026</div></div></li>
                    <li><div><div>PM YASASVI Entrance Test (YET) result declared</div><div className="notice-date">📅 15 Aug 2026</div></div></li>
                    <li><div><div>Institute verification deadline extended to 30 Nov 2025</div><div className="notice-date">📅 10 Aug 2026</div></div></li>
                    <li><div><div>New Post-Matric Scholarship guidelines notified for SC students</div><div className="notice-date">📅 01 Jul 2026</div></div></li>
                  </ul>
                </div>
              </div>
            </Reveal>

            <Reveal type="right" delay={0.3}>
              <div className="side-box">
                <div className="side-box-head green-head">📞 Helpdesk</div>
                <div className="side-box-body helpdesk-body">
                  <div>📞 <strong>0120-6619540</strong></div>
                  <div>📧 <strong>helpdesk@nsp.gov.in</strong></div>
                  <div>🕐 Mon–Fri: 9:30 AM – 6:00 PM</div>
                  <div className="helpdesk-note">For DigiLocker issues, contact CDAC helpdesk at <strong>1800-3010-3333</strong></div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="stats-band">
          <div className="stats-band-inner">
            {[
              { big: "5.2 Cr+", desc: "Students Registered" },
              { big: "15+",     desc: "Scholarship Schemes" },
              { big: "₹3,200 Cr", desc: "Disbursed Annually" },
              { big: "127+",    desc: "Ministries & Depts" },
            ].map((s, i) => (
              <Reveal key={i} type="zoom" delay={i * 0.1}>
                <div className="stat-item" style={{ height:"100%" }}>
                  <div className="big">{s.big}</div>
                  <div className="desc">{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <Footer />

      {/* ELIGIBILITY MODAL */}
      {showEligModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowEligModal(false); }}>
          <div className="modal">
            <div className="modal-header" style={{ background:"#7b1fa2" }}>
              <h3>✅ Check Scholarship Eligibility</h3>
              <button className="modal-close" onClick={() => setShowEligModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Your Category</label><select value={form.cat} onChange={e => setForm({...form, cat: e.target.value})}>{["General","OBC","SC","ST","Minority","Disabled"].map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="form-group"><label>Annual Family Income (₹)</label><select value={form.income} onChange={e => setForm({...form, income: e.target.value})}>{["Below 1,00,000","1,00,000 – 2,50,000","2,50,000 – 3,50,000","3,50,000 – 4,50,000","Above 4,50,000"].map(i => <option key={i}>{i}</option>)}</select></div>
              <div className="form-group"><label>Last Exam Percentage (%)</label><input type="number" placeholder="e.g. 75" value={form.marks} onChange={e => setForm({...form, marks: e.target.value})} min="0" max="100" /></div>
              <div className="form-group"><label>Current Course Level</label><select value={form.course} onChange={e => setForm({...form, course: e.target.value})}>{["Class 9-10 (Pre-Matric)","Class 11-12","Graduation","Post-Graduation","M.Phil / Ph.D"].map(c => <option key={c}>{c}</option>)}</select></div>
              <button className="btn-gov" style={{ background:"#7b1fa2" }} onClick={checkEligibility}>Check My Eligibility</button>
              {eligResult !== null && (
                <div style={{ marginTop:14 }}>
                  {eligResult.length === 0 ? (
                    <div className="alert alert-error">No scholarships matched. Try adjusting your details.</div>
                  ) : (
                    <>
                      <div className="alert alert-success"><strong>✅ You may be eligible for {eligResult.length} scholarship(s):</strong></div>
                      {eligResult.map((s, i) => (
                        <div key={i} className="elig-result-item"><span><strong>{s.name}</strong></span><span style={{ color:"#138808", fontWeight:700 }}>{s.amt}</span></div>
                      ))}
                      <button className="btn-gov" style={{ marginTop:8 }} onClick={() => { setShowEligModal(false); navigate("/register"); }}>Register Now to Apply →</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABOUT MODAL */}
      {showAboutModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAboutModal(false); }}>
          <div className="modal" style={{ maxWidth:"600px" }}>
            <div className="modal-header" style={{ background:"#003580" }}>
              <h3>ℹ️ About Unified Scholarship Platform</h3>
              <button className="modal-close" onClick={() => setShowAboutModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ lineHeight:"1.6", color:"#333", maxHeight:"70vh" }}>
              <h4 style={{ color:"#003580", marginTop:0 }}>Introduction</h4>
              <p style={{ fontSize:"14px", marginBottom:"15px" }}>The Unified Scholarship Platform (USP) is a one-stop solution for the end-to-end scholarship process. It facilitates submission of student applications, verification, sanction, and disbursal of scholarships offered by the Government of India to students across the country.</p>
              <h4 style={{ color:"#003580", marginTop:0 }}>Our Mission</h4>
              <p style={{ fontSize:"14px", marginBottom:"15px" }}>To provide a single window platform for various scholarship schemes offered by the Central and State Governments to ensure efficient, transparent, and timely disbursement of scholarships to students.</p>
              <h4 style={{ color:"#003580", marginTop:0 }}>Key Objectives</h4>
              <ul style={{ fontSize:"14px", paddingLeft:"20px", marginBottom:"10px" }}>
                <li style={{ marginBottom:"6px" }}>Ensure scholarships are disbursed to students on time.</li>
                <li style={{ marginBottom:"6px" }}>Common platform for Central and State Government schemes to avoid duplication.</li>
                <li style={{ marginBottom:"6px" }}>Create a transparent database of eligible students for all schemes.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* FAQ MODAL */}
      {showFaqModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowFaqModal(false); }}>
          <div className="modal" style={{ maxWidth:"650px" }}>
            <div className="modal-header" style={{ background:"#FF9933" }}>
              <h3>❓ Frequently Asked Questions (FAQs)</h3>
              <button className="modal-close" onClick={() => setShowFaqModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight:"70vh", overflowY:"auto" }}>
              {FAQS_LIST.map((faq, i) => (
                <details key={i} style={{ marginBottom:"15px", borderBottom:"1px solid #eee", paddingBottom:"10px" }}>
                  <summary style={{ fontWeight:"600", cursor:"pointer", color:"#003580", outline:"none", listStyle:"inside" }}>{faq.q}</summary>
                  <div style={{ marginTop:"8px", fontSize:"13px", color:"#444", paddingLeft:"18px", lineHeight:"1.5" }}>{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}