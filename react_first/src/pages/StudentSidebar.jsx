import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

const menuItems = [
  { icon: "🏠", label: "Dashboard",             path: "/dashboard" },
  { icon: "🎓", label: "Browse Scholarships",   path: "/scholarships" },
  { icon: "✅", label: "Check Eligibility",     path: "/eligibility" },
  { icon: "📝", label: "Apply for Scholarship", path: "/application-form" },
  { icon: "👤", label: "My Profile",            path: "/profile" },
  { icon: "📊", label: "Track Applications",    path: "/track" },
];

export default function StudentSidebar({ user, onLogout }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const initial   = user?.name?.[0]?.toUpperCase() || "S";

  return (
    <aside className="student-sidebar">
      <div className="sidebar-profile">
        <div className="sidebar-avatar">{initial}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-name">{user?.name || "Student"}</div>
          <div className="sidebar-id">{user?.appId || user?.id || "NSP/2025/XXXXX"}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={() => { onLogout(); navigate("/"); }}>
          🚪 Logout
        </button>
        <div className="sidebar-helpline">
          <div>📞 0120-6619540</div>
          <div>helpdesk@nsp.gov.in</div>
        </div>
      </div>
    </aside>
  );
}
