import React from 'react';

export default function About() {
  // Function to handle "Back to Home"
  // Since this is inside a popup, we reset the window to clear the modal state
  const handleBackToHome = () => {
    window.location.href = "/";
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      color: "#333",
      backgroundColor: "#f8f9fa",
      display: "flex",
      flexDirection: "column",
      height: "100%"
    }}>
      
      {/* 1. Tricolor Header Strip (Government Identity) */}
      <div style={{ display: "flex", height: "6px" }}>
        <div style={{ flex: 1, backgroundColor: "#FF9933" }}></div> {/* Saffron */}
        <div style={{ flex: 1, backgroundColor: "#FFFFFF" }}></div> {/* White */}
        <div style={{ flex: 1, backgroundColor: "#138808" }}></div> {/* Green */}
      </div>

      {/* 2. Main Header */}
      <div style={{
        background: "linear-gradient(135deg, #003580 0%, #0055b3 100%)",
        color: "white",
        padding: "30px 20px",
        textAlign: "center",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>Unified Scholarship Platform</h2>
        <p style={{ margin: "5px 0 0", fontSize: "14px", opacity: 0.9 }}>Ministry of Education, Government of India</p>
      </div>

      {/* 3. Content Body */}
      <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>
        
        {/* Introduction Card */}
        <div style={{
          background: "white",
          padding: "25px",
          borderRadius: "8px",
          marginBottom: "25px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          borderLeft: "5px solid #003580"
        }}>
          <h3 style={{ color: "#003580", marginTop: 0, fontSize: "18px" }}>Introduction</h3>
          <p style={{ lineHeight: "1.6", color: "#555", fontSize: "15px", marginBottom: "10px" }}>
            The Unified Scholarship Platform (NSP) is a one-stop solution for the end-to-end scholarship process. 
            It facilitates submission of student applications, verification, sanction, and disbursal of scholarships 
            offered by the Government of India to students across the country.
          </p>
          <p style={{ lineHeight: "1.6", color: "#555", fontSize: "15px", margin: 0 }}>
            This initiative aims to ensure timely disbursement of scholarships to students and prevent leakages through 
            a robust IT-driven system.
          </p>
        </div>

        {/* Vision & Mission Section (NEW) */}
        <div style={{
          background: "linear-gradient(to right, #eef2f7, #ffffff)",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "25px",
          border: "1px solid #d1d9e6",
          display: "flex",
          gap: "20px",
          alignItems: "flex-start"
        }}>
          <div style={{ fontSize: "40px" }}>🎯</div>
          <div>
            <h4 style={{ color: "#003580", margin: "0 0 8px 0", fontSize: "16px" }}>Our Mission</h4>
            <p style={{ margin: 0, fontSize: "14px", color: "#444", lineHeight: "1.5" }}>
              To provide a single window platform for various scholarship schemes offered by the Central and State Governments 
              to ensure efficient, transparent, and timely disbursement of scholarships to students.
            </p>
          </div>
        </div>

        {/* Services Offered (NEW) */}
        <h3 style={{ color: "#003580", marginBottom: "15px", fontSize: "18px" }}>Services Offered</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "25px" }}>
          {[
            { title: "Smart Application", icon: "📝", desc: "Single integrated application for scholarships." },
            { title: "Transparent Process", icon: "🔍", desc: "Real-time tracking of application status." },
            { title: "Direct Benefit", icon: "💳", desc: "Scholarship amount directly to bank account." },
            { title: "Simplified Renewal", icon: "🔄", desc: "Easy renewal process for existing students." }
          ].map((service, idx) => (
            <div key={idx} style={{ background: "white", padding: "15px", borderRadius: "8px", border: "1px solid #e1e4e8", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>{service.icon}</div>
              <h4 style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#333" }}>{service.title}</h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#666", lineHeight: "1.4" }}>{service.desc}</p>
            </div>
          ))}
        </div>

        {/* Key Objectives Grid (Expanded) */}
        <h3 style={{ color: "#003580", marginBottom: "15px", fontSize: "18px" }}>Key Objectives</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "25px" }}>
          
          <div style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e1e4e8", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: "24px", marginBottom: "10px" }}>⏱️</div>
            <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>Timely Disbursement</h4>
            <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>Ensure scholarships are disbursed to students on time without delay.</p>
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e1e4e8", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: "24px", marginBottom: "10px" }}>🏛️</div>
            <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>Unified Portal</h4>
            <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>Common platform for Central and State Government schemes to avoid duplication.</p>
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e1e4e8", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: "24px", marginBottom: "10px" }}>🔍</div>
            <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>Transparency</h4>
            <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>Create a transparent database of eligible students for all schemes.</p>
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e1e4e8", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: "24px", marginBottom: "10px" }}>🛡️</div>
            <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>Avoid Duplication</h4>
            <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>Harmonization of different scholarship schemes & norms to streamline processing.</p>
          </div>

        </div>

        

        {/* Ministry Info Footer Card */}
        <div style={{
          background: "#eef2f7",
          padding: "20px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          border: "1px solid #d1d9e6"
        }}>
          <div style={{ fontSize: "40px" }}>🇮🇳</div>
          <div>
            <h4 style={{ margin: "0 0 5px 0", color: "#003580" }}>Department of Higher Education</h4>
            <p style={{ margin: 0, fontSize: "14px", color: "#444" }}>Ministry of Education, Government of India</p>
            <span style={{ fontSize: "12px", background: "#003580", color: "white", padding: "2px 6px", borderRadius: "4px", marginTop: "5px", display: "inline-block" }}>Version 3.0</span>
          </div>
        </div>

      </div>

      {/* 4. Sticky Bottom Action Bar */}
      <div style={{
        background: "white",
        padding: "15px 30px",
        borderTop: "1px solid #ddd",
        textAlign: "right",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.05)"
      }}>
        <button 
          onClick={handleBackToHome}
          style={{
            background: "#003580",
            color: "white",
            border: "none",
            padding: "10px 24px",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#0055b3"}
          onMouseOut={(e) => e.currentTarget.style.background = "#003580"}
        >
          ← Back to Home
        </button>
      </div>

    </div>
  );
}