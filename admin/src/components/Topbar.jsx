import { useState } from "react";
import { useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const routeTitles = {
  "/dashboard": "Dashboard",
  "/analytics": "Analytics",
  "/clients": "All Clients",
  "/users": "All Users",

  "/leads": "Leads",
  "/contracts": "Contracts",
  "/projects": "Active Projects",
  "/invoices": "Invoices",
  "/reports": "Reports",
  "/team": "Team",
  "/settings": "Settings",
};

const Topbar = ({ onMenuClick }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [notifOpen, setNotifOpen] = useState(false);

  const pageTitle = routeTitles[location.pathname] || "Admin";

  return (
    <header className="topbar">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.25rem",
            color: "var(--ink)",
          }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page title */}
        <div>
          <h1
            className="font-display"
            style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--ink)", margin: 0, lineHeight: 1 }}
          >
            {pageTitle}
          </h1>
          <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0, marginTop: 2 }}>
            Career Kendra — Admin Portal
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "white",
            border: "1px solid var(--parchment-dark)",
            borderRadius: 4,
            padding: "0.4rem 0.75rem",
            fontSize: "0.82rem",
            color: "var(--muted)",
          }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden sm:inline">Search...</span>
        </div>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              background: "white",
              border: "1px solid var(--parchment-dark)",
              borderRadius: 4,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 7,
                height: 7,
                background: "var(--gold)",
                borderRadius: "50%",
                border: "1.5px solid white",
              }}
            />
          </button>

          {notifOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 280,
                background: "white",
                border: "1px solid var(--parchment-dark)",
                borderRadius: 6,
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--parchment-dark)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>Notifications</span>
                <span className="badge badge-amber">3 new</span>
              </div>
              {[
                { title: "New client inquiry", time: "2m ago", type: "lead" },
                { title: "Contract #142 signed", time: "1h ago", type: "contract" },
                { title: "Invoice overdue — TechCorp", time: "3h ago", type: "invoice" },
              ].map((n, i) => (
                <div
                  key={i}
                  style={{ padding: "0.75rem 1rem", borderBottom: i < 2 ? "1px solid var(--parchment-dark)" : "none", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--parchment)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                >
                  <div style={{ fontSize: "0.82rem", fontWeight: 500 }}>{n.title}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>{n.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #b8975a, #8a6e3e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "#0f0e0c",
            cursor: "pointer",
            border: "2px solid var(--parchment-dark)",
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
      </div>
    </header>
  );
};

export default Topbar;