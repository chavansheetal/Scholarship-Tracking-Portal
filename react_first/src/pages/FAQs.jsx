import React, { useState } from 'react';

export default function FAQs() {
  const faqs = [
    { 
      category: "General",
      q: "Who is eligible for USP scholarships?", 
      a: "Eligibility varies by scheme. Generally, students belonging to SC/ST/OBC/Minority communities with a certain family income threshold are eligible. Check the specific scheme guidelines." 
    },
    { 
      category: "Application",
      q: "Can I apply for more than one scholarship?", 
      a: "No, typically only one scholarship is allowed per student per academic year from Central Schemes to ensure equitable distribution." 
    },
    { 
      category: "Documents",
      q: "What documents are required?", 
      a: "Common documents include Aadhaar Card, Income Certificate, Caste Certificate, Bank Passbook, and Marksheet. Some schemes may require Domicile Certificate or Disability Certificate." 
    },
    { 
      category: "Tracking",
      q: "How do I track my application status?", 
      a: "You can track your application status by logging into your dashboard and clicking on 'Track Application Status' or using your Application ID on the homepage." 
    },
    { 
      category: "Issues",
      q: "What if my application is rejected?", 
      a: "If your application is rejected, a reason will be provided. You can rectify the issue and re-apply in the next cycle or contact the helpline for clarification." 
    },
    { 
      category: "Application",
      q: "Is Aadhaar Card mandatory for registration?", 
      a: "Yes, Aadhaar is mandatory for identification and Direct Benefit Transfer (DBT) of scholarship amounts into the student's bank account." 
    },
    { 
      category: "Bank",
      q: "Can I use a joint bank account?", 
      a: "No, the scholarship amount is credited only to the student's individual bank account. Joint accounts are not accepted." 
    },
    { 
      category: "Schemes",
      q: "What is the difference between Pre-Matric and Post-Matric?", 
      a: "Pre-Matric scholarships are for students studying in Class 9th and 10th. Post-Matric scholarships are for students studying in Class 11th, 12th, and higher education (college/university)." 
    },
    { 
      category: "Ministries",
      q: "Which ministries offer scholarships on NSP?", 
      a: "Major participating ministries include Ministry of Education, Ministry of Social Justice, Ministry of Tribal Affairs, Ministry of Minority Affairs, and Ministry of Labour & Employment." 
    },
    { 
      category: "Renewal",
      q: "How can I renew my scholarship next year?", 
      a: "If you have received a scholarship in the previous year, you can apply for renewal through the same portal using your previous Application ID as Fresh/Renewal." 
    }
  ];

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
      
      {/* 1. Tricolor Header Strip */}
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
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>Frequently Asked Questions (FAQs)</h2>
        <p style={{ margin: "5px 0 0", fontSize: "14px", opacity: 0.9 }}>Get answers to common scholarship queries</p>
      </div>

      {/* 3. Search Bar Visual */}
      <div style={{ padding: "20px 30px", background: "#fff", borderBottom: "1px solid #e1e4e8" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative" }}>
          <input 
            type="text" 
            placeholder="🔍 Search for a question..." 
            style={{
              width: "100%",
              padding: "12px 15px 12px 40px",
              border: "1px solid #ccc",
              borderRadius: "25px",
              fontSize: "14px",
              outline: "none",
              background: "#f9f9f9"
            }}
          />
          <div style={{ position: "absolute", left: "15px", top: "12px", color: "#999" }}>🔍</div>
        </div>
      </div>

      {/* 4. Content Body */}
      <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>
        
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>
          
          {faqs.map((item, index) => (
            <div key={index} style={{ 
                background: "white", 
                border: "1px solid #e1e4e8", 
                borderRadius: "8px", 
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                transition: "box-shadow 0.2s",
                overflow: "hidden"
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,53,128,0.15)"}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)"}
            >
              <details style={{ width: "100%" }}>
                <summary style={{
                  padding: "15px 20px",
                  cursor: "pointer",
                  backgroundColor: "#fff",
                  listStyle: "none", 
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontWeight: "bold",
                  color: "#003580",
                  fontSize: "15px",
                  borderBottom: "1px solid #f0f0f0"
                }}>
                  <span>Q: {item.q}</span>
                  <span style={{ fontSize: "12px", color: "#999" }}>▼</span>
                </summary>
                <div style={{ 
                    padding: "15px 20px", 
                    backgroundColor: "#fafbfc", 
                    color: "#444", 
                    lineHeight: "1.6", 
                    fontSize: "14px",
                    borderTop: "1px solid #e1e4e8"
                  }}>
                  <div style={{ marginBottom: "5px", fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700" }}>
                    {item.category}
                  </div>
                  <strong>Answer:</strong> {item.a}
                </div>
              </details>
            </div>
          ))}

        </div>

        {/* --- CHANGED: Resources & Guidelines Section --- */}
        <div style={{ 
            maxWidth: "900px", 
            margin: "40px auto 0", 
            background: "#eef2f7", 
            padding: "25px", 
            borderRadius: "8px", 
            textAlign: "center",
            border: "1px solid #d1d9e6"
          }}>
          <h4 style={{ margin: "0 0 15px 0", color: "#003580", fontSize: "16px" }}>Resources & Guidelines</h4>
          <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#555" }}>
            Access official documents and check eligibility for various schemes.
          </p>
          
          <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            
            <div style={{
                background: "white",
                padding: "10px 20px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "13px",
                fontWeight: "600",
                color: "#003580",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.2s"
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "#003580"; e.currentTarget.style.background = "#f9f9f9"; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = "#ccc"; e.currentTarget.style.background = "white"; }}
            >
              <span>📄</span> User Manual
            </div>

            <div style={{
                background: "white",
                padding: "10px 20px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "13px",
                fontWeight: "600",
                color: "#003580",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.2s"
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "#003580"; e.currentTarget.style.background = "#f9f9f9"; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = "#ccc"; e.currentTarget.style.background = "white"; }}
            >
              <span>📜</span> Scheme Guidelines
            </div>

            <div style={{
                background: "white",
                padding: "10px 20px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "13px",
                fontWeight: "600",
                color: "#003580",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.2s"
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "#003580"; e.currentTarget.style.background = "#f9f9f9"; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = "#ccc"; e.currentTarget.style.background = "white"; }}
            >
              <span>✅</span> Check Eligibility
            </div>

          </div>
        </div>

      </div>

      {/* 5. Sticky Bottom Action Bar */}
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