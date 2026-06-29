import { useState, useEffect, Component } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { initStore } from "./store";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Scholarships from "./pages/Scholarships";
import ApplyScholarship from "./pages/Applyscholarship";
import ApplicationForm from "./pages/ApplicationForm";
import ApplicationTracker from "./pages/ApplicationTracker";
import EligibilityChecker from "./pages/EligibilityChecker";
import Profile from "./pages/Profile";
import TrackStatus from "./pages/TrackStatus";
import UploadDocuments from "./pages/UploadDocuments";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import DigiLockerLogin from "./pages/DigiLockerLogin";

import About from "./pages/AboutNSP";       
import Contact from "./pages/ContactUs";   
import FAQs from "./pages/FAQs";
import RenewalForm from "./pages/Renewalform";

import "./App.css";

// ── Error Boundary ──────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("NSP App Error:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FF", fontFamily: "sans-serif", padding: 20 }}>
          <div style={{ background: "white", border: "1px solid #CBD5E1", borderRadius: 8, padding: 32, maxWidth: 520, width: "100%", textAlign: "center", boxShadow: "0 4px 16px rgba(0,53,128,0.10)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ color: "#003580", marginBottom: 10, fontFamily: "Georgia, serif" }}>Something went wrong</h2>
            <p style={{ color: "#4a5568", fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>The application encountered an error.</p>
            <p style={{ color: "red", fontSize: 12, marginBottom: 16 }}>{this.state.error?.toString()}</p>
            <button onClick={() => { window.location.reload(); }} style={{ background: "#003580", color: "white", border: "none", padding: "10px 20px", borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: "pointer", marginRight: 10 }}>🔄 Try Again</button>
            <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} style={{ background: "#C0392B", color: "white", border: "none", padding: "10px 20px", borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>🗑️ Clear Data</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
// ─────────────────────────────────────────────────────────────────

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nsp_session_user")); } catch { return null; }
  });
  const [adminUser, setAdminUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nsp_session_admin")); } catch { return null; }
  });

  useEffect(() => { try { initStore(); } catch (e) {} }, []);

  const handleLogin = (userData) => { setUser(userData); localStorage.setItem("nsp_session_user", JSON.stringify(userData)); };
  const handleLogout = () => { setUser(null); localStorage.removeItem("nsp_session_user"); };
  const handleAdminLogin = (adminData) => { setAdminUser(adminData); localStorage.setItem("nsp_session_admin", JSON.stringify(adminData)); };
  const handleAdminLogout = () => { setAdminUser(null); localStorage.removeItem("nsp_session_admin"); };

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/digilocker-login" element={<DigiLockerLogin onLogin={handleLogin} />} />
          <Route path="/scholarships" element={<Scholarships user={user} onLogout={handleLogout} />} />
          <Route path="/eligibility" element={<EligibilityChecker user={user} onLogout={handleLogout} />} />
          <Route path="/apply/:id" element={<ApplyScholarship user={user} onLogout={handleLogout} />} />
          <Route path="/track-status" element={<TrackStatus />} />
          
          {/* ── FIXED: Added the missing Routes for About, Contact, FAQs ── */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/renewal" element={<RenewalForm user={user} onLogout={handleLogout} />} />

          {/* ── Student (protected) ── */}
          <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/application-form" element={user ? <ApplicationForm user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/track" element={user ? <ApplicationTracker user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/upload-documents" element={user ? <UploadDocuments user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />

          {/* ── Admin ── */}
          <Route path="/admin" element={<AdminLogin onAdminLogin={handleAdminLogin} />} />
          <Route path="/admin/dashboard" element={adminUser ? <AdminDashboard adminUser={adminUser} onLogout={handleAdminLogout} /> : <Navigate to="/admin" />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;