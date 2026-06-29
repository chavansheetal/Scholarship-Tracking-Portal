import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-logo">
            <h3>🏛 Unified Scholarship Platform</h3>
            <p>USP is a one-stop solution through which various services starting from student application, application receipt, processing, sanction and disbursal of various scholarships to Students are enabled.</p>
            <div className="footer-ministry">Ministry of Electronics &amp; Information Technology<br />Government of India</div>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/scholarships">Browse Scholarships</a></li>
              <li><a href="/register">New Registration</a></li>
              <li><a href="/track">Track Application</a></li>
              <li><a href="/admin">Institute Login</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Policies</h4>
            <ul>
              <li><a href="#">Terms &amp; Conditions</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Cookie Policy</a></li>
              <li><a href="#">Disclaimer</a></li>
              <li><a href="#">Accessibility</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Grievance Portal</a></li>
              <li><a href="#">Sitemap</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Unified Scholarship Platform. All Rights Reserved. | Best viewed in Chrome/Firefox at 1280×800</span>
          <span>Website belongs to Ministry of Education, Government of India</span>
        </div>
      </div>
    </footer>
  );
}
