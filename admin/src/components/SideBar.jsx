import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAuthStore from "../store/useAuthStore";
import {
  BicepsFlexed,
  Briefcase,
  Clock,
  ShieldCheck,
  Smile,
  UserCheck,
  UserCog,
  Users,

  XCircle,
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  Users as TeamIcon,
  Layers,
  FileText,
  Award,
  Building,
  Mail,
  Globe,
  UserCheckIcon,
  ArrowUpRightSquare
} from "lucide-react";
import { getUserRole } from "../utils/getRole";

const navItems = [

  {
    section: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: <LayoutDashboard size={18} />
      },
    ],
  },


  {
    section: "HR Management",
    visibleFor: ["Tech HR", "BPO HR", "Non-Tech HR", "General HR", "Admin"],
    items: [
      {
        label: "All Jobs",
        path: "/jobs/active",
        icon: <Briefcase size={18} />
      },
      {
        label: "Pending Jobs",
        path: "/jobs/pending",
        icon: <Clock size={18} />
      },
      {
        label: "Rejected Jobs",
        path: "/jobs/rejected",
        icon: <XCircle size={18} />
      },
      // {
      //   label: "Applications",
      //   path: "/applications",
      //   icon: <FileText size={18} />
      // }
    ],
  },


  {
    section: "Interviews",
    visibleFor: ["Tech HR", "BPO HR", "Non-Tech HR", "General HR", "Admin"],
    items: [
      {
        label: "All Interviews",
        path: "/interviews",
        icon: <UserCheck size={18} />
      }
    ],
  },


  {
    section: "Users & Teams",
    visibleFor: ["Admin"],
    items: [
      {
        label: "All Users",
        path: "/users",
        icon: <Users size={18} />
      },
      {
        label: "All Employers",
        path: "/employers",
        icon: <Users size={18} />
      },
      {
        label: "Company Employees",
        path: "/active/company-employees",
        icon: <TeamIcon size={18} />
      },
      {
        label: "Admins",
        path: "/active/admins",
        icon: <ShieldCheck size={18} />
      },
      {
        label: "Roles",
        path: "/active/roles",
        icon: <UserCheckIcon size={18} />
      },
      {
        label: "Permissions",
        path: "/active/permission",
        icon: <ArrowUpRightSquare size={18} />
      }
    ],
  },


  {
    section: "Content Management",
    visibleFor: ["Admin"],
    items: [
      {
        label: "Services",
        path: "/cms/services",
        icon: <Layers size={18} />
      },
      {
        label: "Pages",
        path: "/cms/pages",
        icon: <FileText size={18} />
      },
      // {
      //   label: "Why Choose Us",
      //   path: "/cms/why-choose-us",
      //   icon: <Award size={18} />
      // },
      {
        label: "Organization Logos",
        path: "/cms/organization-logos",
        icon: <Building size={18} />
      }
    ],
  },


  {
    section: "Website",
    visibleFor: ["Admin"],
    items: [
      {
        label: "Contact Messages",
        path: "/website/contact-messages",
        icon: <Mail size={18} />
      },
      {
        label: "Website Settings",
        path: "/website/settings",
        icon: <Globe size={18} />
      }
    ],
  },




];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const userRole = getUserRole();

  const isAdmin = userRole.toLowerCase().includes("admin")

  const filteredNav = navItems.filter(section =>
    !section.visibleFor ||
    section.visibleFor.includes(userRole) ||
    isAdmin
  );
  const handleLogout = () => {
    Swal.fire({
      title: "Sign Out?",
      text: "You will be returned to the login screen.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#b8975a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, sign out",
      background: "#f5f1ea",
      color: "#0f0e0c",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login");
      }
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #b8975a, #d4b483)",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f0e0c" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div
                className="font-display"
                style={{ color: "#f5f1ea", fontSize: "1.1rem", fontWeight: 600, lineHeight: 1.1 }}
              >
                Career Kendra
              </div>
              <div style={{ color: "#b8975a", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Consulting Group
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {filteredNav.map((section) => (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                  onClick={onClose}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid rgba(184,151,90,0.15)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #b8975a, #8a6e3e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#0f0e0c",
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: "#f5f1ea", fontSize: "0.82rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name || "Admin User"}
              </div>
              <div style={{ color: "#7a7268", fontSize: "0.7rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email || "hr@careerkendra.com"}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              background: "rgba(184,151,90,0.08)",
              border: "1px solid rgba(184,151,90,0.2)",
              color: "#9a9080",
              borderRadius: 4,
              padding: "0.5rem",
              fontSize: "0.78rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.2s",
              fontFamily: "DM Sans, sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#b8975a";
              e.currentTarget.style.borderColor = "rgba(184,151,90,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9a9080";
              e.currentTarget.style.borderColor = "rgba(184,151,90,0.2)";
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;