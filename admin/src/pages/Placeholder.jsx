import { useLocation } from "react-router-dom";

const routeInfo = {
  "/analytics": { icon: "📊", desc: "View performance charts, conversion funnels, and revenue trends." },
  "/clients": { icon: "👥", desc: "Manage your full client directory, contacts, and account details." },
  "/leads": { icon: "📈", desc: "Track incoming inquiries and manage your sales pipeline." },
  "/contracts": { icon: "📄", desc: "Review, sign, and manage client contracts and agreements." },
  "/projects": { icon: "🗂️", desc: "Monitor active consulting projects, milestones, and deliverables." },
  "/invoices": { icon: "💳", desc: "Create, send, and track invoices and payment status." },
  "/reports": { icon: "📋", desc: "Generate detailed reports for clients and internal review." },
  "/team": { icon: "🤝", desc: "Manage team members, roles, and permissions." },
  "/settings": { icon: "⚙️", desc: "Configure your admin preferences, integrations, and account settings." },
};

const Placeholder = () => {
  const location = useLocation();
  const info = routeInfo[location.pathname] || { icon: "🔧", desc: "This page is under construction." };

  const pageName = location.pathname.slice(1).replace(/-/g, " ");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "3rem",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          background: "white",
          border: "1px solid var(--parchment-dark)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          marginBottom: "1.5rem",
          position: "relative",
        }}
      >
        {info.icon}
        <div
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: 12,
            border: "1px solid transparent",
            background: "linear-gradient(white, white) padding-box, linear-gradient(135deg, var(--gold), transparent) border-box",
          }}
        />
      </div>

      <h2
        className="font-display"
        style={{ fontSize: "1.8rem", fontWeight: 600, textTransform: "capitalize", margin: "0 0 0.6rem" }}
      >
        {pageName}
      </h2>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem", maxWidth: 400, lineHeight: 1.6, margin: "0 0 2rem" }}>
        {info.desc}
      </p>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 1.25rem",
          background: "rgba(184,151,90,0.08)",
          border: "1px solid rgba(184,151,90,0.25)",
          borderRadius: 20,
          fontSize: "0.78rem",
          color: "var(--gold-dark)",
          letterSpacing: "0.05em",
        }}
      >
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Coming Soon — Page Under Development
      </div>
    </div>
  );
};

export default Placeholder;