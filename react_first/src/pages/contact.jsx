import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
  // 1. State to handle form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  // 2. Function to handle the Submit button click
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload

    const { name, email, message } = formData;

    // Simple Validation: Check if fields are empty
    if (!name || !email || !message) {
      alert("Please fill in all fields (Name, Email, and Message) before submitting.");
      return;
    }

    // Email Validation (Basic)
    if (!email.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }

    // Simulate "Real Portal" Submission
    alert(`Thank you, ${name}!\n\nYour message has been sent to the NSP Helpdesk successfully.\nReference ID: NSP-${Date.now()}`);

    // Clear the form after submission
    setFormData({ name: '', email: '', message: '' });
  };

  // 3. Function to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      color: "#333",
      backgroundColor: "#f0f4f8",
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh"
    }}>
      
      {/* 1. Tricolor Header Strip */}
      <div style={{ display: "flex", height: "6px" }}>
        <div style={{ flex: 1, backgroundColor: "#FF9933" }}></div>
        <div style={{ flex: 1, backgroundColor: "#FFFFFF" }}></div>
        <div style={{ flex: 1, backgroundColor: "#138808" }}></div>
      </div>

      {/* 2. Main Header */}
      <div style={{
        background: "linear-gradient(135deg, #003580 0%, #0055b3 100%)",
        color: "white",
        padding: "30px 20px",
        textAlign: "center",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>Contact Us</h2>
        <p style={{ margin: "5px 0 0", fontSize: "14px", opacity: 0.9 }}>National Scholarship Portal Support Center</p>
      </div>

      {/* 3. Content Body */}
      <div style={{ padding: "40px 20px", maxWidth: "1000px", margin: "0 auto", flex: 1, width: "100%" }}>
        
        {/* Main Contact Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          
          {/* Helpline Card */}
          <div style={{ 
              background: "white", 
              padding: "30px", 
              borderRadius: "8px", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
              textAlign: "center", 
              borderTop: "5px solid #003580",
              transition: "transform 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: "50px", marginBottom: "15px" }}>📞</div>
            <h3 style={{ margin: "0 0 15px 0", color: "#003580", fontSize: "20px" }}>Helpline</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "#333", marginBottom: "5px" }}>0120-6619540</p>
            <p style={{ color: "#777", fontSize: "13px", marginBottom: "15px" }}>Mon-Fri (8:00 AM to 8:00 PM)</p>
            <div style={{ fontSize: "12px", background: "#eef2f7", color: "#003580", padding: "5px 10px", borderRadius: "15px", display: "inline-block" }}>Toll Free</div>
          </div>

          {/* Email Card */}
          <div style={{ 
              background: "white", 
              padding: "30px", 
              borderRadius: "8px", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
              textAlign: "center", 
              borderTop: "5px solid #FF9933",
              transition: "transform 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: "50px", marginBottom: "15px" }}>✉️</div>
            <h3 style={{ margin: "0 0 15px 0", color: "#003580", fontSize: "20px" }}>Email Support</h3>
            <p style={{ fontSize: "16px", fontWeight: "bold", color: "#333", marginBottom: "5px" }}>helpdesk@nsp.gov.in</p>
            <p style={{ color: "#777", fontSize: "13px", marginBottom: "15px" }}>Response within 24 hours</p>
            <div style={{ fontSize: "12px", background: "#fff3e0", color: "#e65100", padding: "5px 10px", borderRadius: "15px", display: "inline-block" }}>For Technical Issues</div>
          </div>

          {/* Address Card */}
          <div style={{ 
              background: "white", 
              padding: "30px", 
              borderRadius: "8px", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
              textAlign: "center", 
              borderTop: "5px solid #138808",
              transition: "transform 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: "50px", marginBottom: "15px" }}>🏛</div>
            <h3 style={{ margin: "0 0 15px 0", color: "#003580", fontSize: "20px" }}>Registered Office</h3>
            <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.6" }}>
              <strong>National Informatics Centre</strong><br/>
              Ministry of Electronics & IT,<br/>
              Govt. of India,<br/>
              A-Block, CGO Complex, Lodhi Road, New Delhi - 110003
            </p>
          </div>

        </div>

        {/* 4. Social Media & Quick Links Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          
          {/* Social Media */}
          <div style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e1e4e8", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
            <h4 style={{ color: "#003580", margin: "0 0 15px 0", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Connect With Us</h4>
            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
              <div style={{ width: "40px", height: "40px", background: "#3b5998", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "20px", cursor: "pointer" }}>f</div>
              <div style={{ width: "40px", height: "40px", background: "#1da1f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "18px", cursor: "pointer" }}>𝕏</div>
              <div style={{ width: "40px", height: "40px", background: "#C13584", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "20px", cursor: "pointer" }}>📸</div>
              <div style={{ width: "40px", height: "40px", background: "#FF0000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "18px", cursor: "pointer" }}>▶</div>
            </div>
          </div>

          {/* Important Links */}
          <div style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e1e4e8", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
            <h4 style={{ color: "#003580", margin: "0 0 15px 0", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Important Links</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "14px" }}>
              <li style={{ marginBottom: "8px", borderBottom: "1px dashed #eee", paddingBottom: "5px" }}>🔗 <Link to="#" style={{ color: "#555", textDecoration: "none" }}>Grievance Redressal Mechanism</Link></li>
              <li style={{ marginBottom: "8px", borderBottom: "1px dashed #eee", paddingBottom: "5px" }}>🔗 <Link to="#" style={{ color: "#555", textDecoration: "none" }}>Right to Information (RTI)</Link></li>
              <li style={{ marginBottom: "8px", borderBottom: "1px dashed #eee", paddingBottom: "5px" }}>🔗 <Link to="#" style={{ color: "#555", textDecoration: "none" }}>Citizen's Charter</Link></li>
              <li style={{ marginBottom: "0" }}>🔗 <Link to="#" style={{ color: "#555", textDecoration: "none" }}>Nodal Officers Directory</Link></li>
            </ul>
          </div>
        </div>

        {/* 5. Write to Us Form (NOW WORKING) */}
        <div style={{ background: "#eef2f7", padding: "30px", borderRadius: "8px", border: "1px solid #d1d9e6" }}>
          <h4 style={{ color: "#003580", marginTop: 0, marginBottom: "20px", fontSize: "18px" }}>Send us a Message</h4>
          
          {/* Added state binding to inputs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <input 
              type="text" 
              name="name"
              placeholder="Your Name" 
              value={formData.name}
              onChange={handleChange}
              style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px", width: "100%" }} 
            />
            <input 
              type="email" 
              name="email"
              placeholder="Your Email" 
              value={formData.email}
              onChange={handleChange}
              style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px", width: "100%" }} 
            />
          </div>
          <textarea 
            name="message"
            placeholder="Type your message here..." 
            rows="4" 
            value={formData.message}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "15px", fontFamily: "inherit" }}
          ></textarea>
          
          {/* Added onClick handler to button */}
          <button 
            onClick={handleSubmit}
            style={{ 
              background: "#003580", 
              color: "white", 
              border: "none", 
              padding: "10px 25px", 
              borderRadius: "4px", 
              cursor: "pointer", 
              float: "right",
              transition: "background 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#0055b3"}
            onMouseOut={(e) => e.currentTarget.style.background = "#003580"}
          >
            Submit Request
          </button>
          <div style={{ clear: "both" }}></div>
        </div>

      </div>

      {/* 6. Sticky Bottom Action Bar */}
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