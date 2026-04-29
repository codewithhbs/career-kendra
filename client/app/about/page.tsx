"use client";
import { Briefcase, Trophy, Users } from "lucide-react";

const features = [
  {
    title: "Verified Job Opportunities",
    description:
      "Explore trusted and verified job listings from top companies across multiple industries.",
    icon: Briefcase,
    tag: "TRUST",
  },
  {
    title: "Faster Hiring Process",
    description:
      "Apply easily and get connected with recruiters quickly to accelerate your career growth.",
    icon: Trophy,
    tag: "RESULTS",
  },
  {
    title: "Wide Career Network",
    description:
      "Access opportunities from startups to top organizations with a growing network of employers.",
    icon: Users,
    tag: "REACH",
  },
];

const page = () => {
  return (
    <>
      <style>
        {`
.ck{background:#ffffff;color:#1c1007;}

.ck-breadcrumb{background:#fff8ec;border-bottom:1px solid #ffe0a8;padding:14px 48px;}
.ck-bc-inner{display:flex;align-items:center;gap:0; max-width:1100px;margin:0 auto;}
.ck-bc-home{display:flex;align-items:center;gap:6px;font-size:13px;color:#fe9a00;font-weight:500;text-decoration:none;cursor:pointer;}
.ck-bc-home:hover{color:#d97f00;}
.ck-bc-home svg{width:14px;height:14px;stroke:#fe9a00;fill:none;stroke-width:2;}
.ck-bc-sep{margin:0 10px;color:#d4b87a;font-size:14px;}
.ck-bc-item{font-size:13px;color:#8a6e3e;font-weight:400;}
.ck-bc-item-active{font-size:13px;color:#1c1007;font-weight:600;}

.ck-hero{background:#fff8ec;padding:72px 48px 64px;border-bottom:1px solid #ffe0a8;}
.ck-hero-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 420px;gap:64px;align-items:center;}
.ck-badge{display:inline-flex;align-items:center;gap:8px;background:#fe9a0015;border:1px solid #fe9a0040;color:#c97200;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:6px 16px;border-radius:100px;margin-bottom:24px;}
.ck-badge-dot{width:6px;height:6px;border-radius:50%;background:#fe9a00;}
.ck-hero-h1{font-size:clamp(36px,4.5vw,60px);font-weight:900;color:#1c1007;line-height:1.1;margin-bottom:20px;}
.ck-hero-h1 span{color:#fe9a00;}
.ck-hero-p{font-size:16px;color:#6b5231;line-height:1.8;margin-bottom:36px;max-width:520px;}
.ck-hero-stats{display:flex;gap:32px;}
.ck-stat{border-left:3px solid #fe9a00;padding-left:16px;}
.ck-stat-n{font-size:28px;font-weight:700;color:#1c1007;}
.ck-stat-l{font-size:12px;color:#9c7a4a;margin-top:2px;font-weight:500;}

.ck-hero-right{display:flex;flex-direction:column;gap:16px;}
.ck-hcard{background:#ffffff;border:1px solid #ffe0a8;border-radius:16px;padding:20px 24px;}
.ck-hcard-top{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
.ck-hcard-icon{width:40px;height:40px;border-radius:10px;background:#fff8ec;border:1px solid #ffe0a8;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ck-hcard-icon svg{width:18px;height:18px;stroke:#fe9a00;fill:none;stroke-width:2;}
.ck-hcard-label{font-size:11px;font-weight:700;color:#fe9a00;text-transform:uppercase;letter-spacing:1.5px;}
.ck-hcard-title{font-size:15px;font-weight:600;color:#1c1007;margin-bottom:4px;}
.ck-hcard-desc{font-size:13px;color:#8a6e3e;line-height:1.6;}
.ck-hcard-accent{background:#fe9a00;border:none;}
.ck-hcard-accent .ck-hcard-label{color:#7a3d00;}
.ck-hcard-accent .ck-hcard-title{color:#1c1007;}
.ck-hcard-accent .ck-hcard-desc{color:#5a2e00;}
.ck-hcard-accent .ck-hcard-icon{background:#ffffff30;border-color:#ffffff30;}
.ck-hcard-accent .ck-hcard-icon svg{stroke:#1c1007;}

.ck-section{padding:72px 48px;max-width:1100px;margin:0 auto;}
.ck-section-full{padding:72px 48px;}
.ck-eyebrow{font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#fe9a00;margin-bottom:14px;}
.ck-h2{font-size:clamp(26px,3vw,42px);font-weight:700;color:#1c1007;line-height:1.15;margin-bottom:18px;}
.ck-body{font-size:15px;color:#6b5231;line-height:1.85;}

.ck-mission-grid{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center;}
.ck-quote{font-size:clamp(16px,2vw,22px);font-style:italic;font-weight:600;color:#1c1007;line-height:1.55;border-left:4px solid #fe9a00;border-radius:0;padding-left:24px;margin:28px 0;}
.ck-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px;}
.ck-tag{background:#fff8ec;color:#a05e00;font-size:11px;font-weight:700;letter-spacing:1px;padding:6px 14px;border-radius:100px;border:1px solid #ffe0a8;text-transform:uppercase;}
.ck-free-box{background:#fff8ec;border:1px solid #ffe0a8;border-radius:16px;padding:24px 28px;margin-top:28px;}
.ck-free-num{font-size:42px;font-weight:900;color:#fe9a00;}
.ck-free-lbl{font-size:13px;color:#8a6e3e;margin-top:4px;font-weight:500;}

.ck-features-bg{background:#fff8ec;border-top:1px solid #ffe0a8;border-bottom:1px solid #ffe0a8;}
.ck-features-inner{max-width:1100px;margin:0 auto;padding:72px 48px;}
.ck-feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px;}
.ck-feat-card{background:#ffffff;border:1px solid #ffe0a8;border-radius:16px;padding:28px 24px;}
.ck-feat-card:hover{border-color:#fe9a0060;}
.ck-feat-icon{width:48px;height:48px;border-radius:12px;background:#fff8ec;border:1px solid #ffe0a8;display:flex;align-items:center;justify-content:center;margin-bottom:16px;}
.ck-feat-icon svg{width:20px;height:20px;stroke:#fe9a00;fill:none;stroke-width:2;}
.ck-feat-tag{font-size:10px;font-weight:700;letter-spacing:2px;color:#fe9a00;text-transform:uppercase;margin-bottom:8px;}
.ck-feat-title{font-size:16px;font-weight:700;color:#1c1007;margin-bottom:10px;}
.ck-feat-desc{font-size:13px;color:#8a6e3e;line-height:1.7;}

.ck-values-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:40px;}
.ck-val{background:#fff8ec;border:1px solid #ffe0a8;border-radius:16px;padding:28px 20px;position:relative;overflow:hidden;}
.ck-val-bg{position:absolute;top:8px;right:12px;font-size:56px;font-weight:900;color:#fe9a0018;line-height:1;}
.ck-val-icon{width:36px;height:36px;border-radius:8px;background:#fe9a00;display:flex;align-items:center;justify-content:center;margin-bottom:14px;}
.ck-val-icon svg{width:16px;height:16px;stroke:#ffffff;fill:none;stroke-width:2;}
.ck-val-title{font-size:15px;font-weight:700;color:#1c1007;margin-bottom:8px;}
.ck-val-desc{font-size:13px;color:#8a6e3e;line-height:1.6;}

.ck-story-bg{background:#fff8ec;border-top:1px solid #ffe0a8;border-bottom:1px solid #ffe0a8;}
.ck-story-inner{max-width:1100px;margin:0 auto;padding:72px 48px;}
.ck-story-grid{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:start;}
.ck-tl{margin-top:40px;}
.ck-tl-item{display:flex;gap:20px;margin-bottom:28px;}
.ck-tl-left{display:flex;flex-direction:column;align-items:center;}
.ck-tl-dot{width:36px;height:36px;border-radius:50%;background:#fe9a00;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ck-tl-dot svg{width:14px;height:14px;stroke:#ffffff;fill:none;stroke-width:2.5;}
.ck-tl-line{flex:1;width:1px;background:#ffe0a8;margin-top:4px;}
.ck-tl-year{font-size:12px;font-weight:700;color:#fe9a00;letter-spacing:1px;margin-bottom:4px;}
.ck-tl-event{font-size:15px;font-weight:600;color:#1c1007;margin-bottom:4px;}
.ck-tl-detail{font-size:13px;color:#8a6e3e;line-height:1.6;}
.ck-big-n{font-size:72px;font-weight:900;color:#fe9a00;line-height:1;}
.ck-big-nl{font-size:15px;color:#6b5231;font-weight:500;margin-top:8px;}
.ck-nums-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:36px;}
.ck-num-card{background:#ffffff;border:1px solid #ffe0a8;border-radius:12px;padding:20px;}
.ck-num-val{font-size:30px;font-weight:700;color:#1c1007;}
.ck-num-lbl{font-size:12px;color:#9c7a4a;margin-top:4px;font-weight:500;}
.ck-press{background:#ffffff;border:1px solid #ffe0a8;border-radius:12px;padding:20px 24px;margin-top:20px;}
.ck-press-lbl{font-size:11px;font-weight:700;color:#fe9a00;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;}
.ck-press-list{display:flex;gap:20px;flex-wrap:wrap;}
.ck-press-name{font-size:13px;font-weight:600;color:#b8956a;}

.ck-team-inner{max-width:1100px;margin:0 auto;}
.ck-team-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;}
.ck-team-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.ck-member{background:#ffffff;border:1px solid #ffe0a8;border-radius:16px;overflow:hidden;}
.ck-member-img{padding:32px;background:#fff8ec;display:flex;align-items:center;justify-content:center;}
.ck-member-av{width:72px;height:72px;border-radius:50%;background:#fe9a00;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#ffffff;}
.ck-member-info{padding:20px 24px;border-top:1px solid #fff0d4;}
.ck-member-name{font-size:16px;font-weight:700;color:#1c1007;margin-bottom:4px;}
.ck-member-role{font-size:12px;font-weight:700;color:#fe9a00;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;}
.ck-member-bio{font-size:13px;color:#8a6e3e;line-height:1.65;}

.ck-cta-wrap{background:#fe9a00;padding:72px 48px;text-align:center;}
.ck-cta-h2{font-size:clamp(28px,3.5vw,48px);font-weight:900;color:#1c1007;margin-bottom:16px;}
.ck-cta-sub{font-size:16px;color:#5a2e00;max-width:480px;margin:0 auto 36px;line-height:1.75;}
.ck-cta-btns{display:flex;gap:14px;justify-content:center;}
.ck-btn-dark{background:#1c1007;color:#fff8ec;font-size:14px;font-weight:700;padding:14px 32px;border-radius:100px;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;}
.ck-btn-lite{background:#ffffff;color:#1c1007;font-size:14px;font-weight:700;padding:14px 32px;border-radius:100px;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;}

@media(max-width:720px){
  .ck-hero-inner,.ck-mission-grid,.ck-story-grid{grid-template-columns:1fr;}
  .ck-feat-grid,.ck-values-grid{grid-template-columns:1fr 1fr;}
  .ck-team-grid{grid-template-columns:1fr 1fr;}
  .ck-breadcrumb,.ck-hero,.ck-section,.ck-section-full,.ck-features-inner,.ck-story-inner{padding-left:20px;padding-right:20px;}
  .ck-team-head{flex-direction:column;gap:12px;align-items:flex-start;}
}
`}
      </style>

      <div className="ck">
        {/* <!-- BREADCRUMB --> */}
        <nav className="ck-breadcrumb">
          <div className="ck-bc-inner">
            <span className="ck-bc-home">
              <svg viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </span>
            <span className="ck-bc-sep">›</span>
            <span className="ck-bc-item-active">About Us</span>
          </div>
        </nav>

        {/* <!-- HERO --> */}
        <section className="ck-hero">
          <div className="ck-hero-inner">
            <div>
              <div className="ck-badge">
                <div className="ck-badge-dot"></div>About Career Kendra
              </div>
              <h1 className="ck-hero-h1">
                India's Most Trusted
                <br />
                <span>Job Portal</span>
              </h1>
              <p className="ck-hero-p">
                Career Kendra connects talented job seekers with top employers
                across India — making hiring faster, smarter, and more reliable
                for everyone.
              </p>
              <div className="ck-hero-stats">
                <div className="ck-stat">
                  <div className="ck-stat-n">1M+</div>
                  <div className="ck-stat-l">Registered Candidates</div>
                </div>
                <div className="ck-stat">
                  <div className="ck-stat-n">50K+</div>
                  <div className="ck-stat-l">Active Job Listings</div>
                </div>
                <div className="ck-stat">
                  <div className="ck-stat-n">98%</div>
                  <div className="ck-stat-l">Client Satisfaction</div>
                </div>
              </div>
            </div>
            <div className="ck-hero-right">
              <div className="ck-hcard">
                <div className="ck-hcard-top">
                  <div className="ck-hcard-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div>
                    <div className="ck-hcard-label">Network</div>
                    <div className="ck-hcard-title">Wide Employer Reach</div>
                  </div>
                </div>
                <div className="ck-hcard-desc">
                  15,000+ companies actively hiring — from funded startups to
                  Fortune 500 enterprises across every sector.
                </div>
              </div>
              <div className="ck-hcard ck-hcard-accent">
                <div className="ck-hcard-top">
                  <div className="ck-hcard-icon">
                    <svg viewBox="0 0 24 24">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                  </div>
                  <div>
                    <div className="ck-hcard-label">Placements</div>
                    <div className="ck-hcard-title">
                      12,000+ Hires This Year
                    </div>
                  </div>
                </div>
                <div className="ck-hcard-desc">
                  Our platform has successfully placed over 12,000 candidates in
                  their dream roles in 2024 alone.
                </div>
              </div>
              <div className="ck-hcard">
                <div className="ck-hcard-top">
                  <div className="ck-hcard-icon">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <div>
                    <div className="ck-hcard-label">Smart</div>
                    <div className="ck-hcard-title">
                      AI-Powered Job Matching
                    </div>
                  </div>
                </div>
                <div className="ck-hcard-desc">
                  Our intelligent algorithm matches your skills and experience
                  to the most relevant opportunities available.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* <!-- MISSION --> */}
        <div className="ck-section">
          <div className="ck-mission-grid">
            <div>
              <div className="ck-eyebrow">Our Mission</div>
              <h2 className="ck-h2">
                Why We Built
                <br />
                Career Kendra
              </h2>
              <p className="ck-body">
                India is home to millions of talented professionals who deserve
                better access to quality career opportunities. At the same time,
                thousands of companies struggle to find the right people
                quickly. Career Kendra was built to bridge this gap —
                efficiently, transparently, and at scale.
              </p>
              <p className="ck-body" style={{ marginTop: "14px" }}>
                We believe that every person, regardless of their city or
                background, deserves a fair shot at a fulfilling career. That
                belief drives everything we build.
              </p>
              <div className="ck-tags">
                <span className="ck-tag">Transparency</span>
                <span className="ck-tag">Speed</span>
                <span className="ck-tag">Trust</span>
                <span className="ck-tag">Equal Opportunity</span>
              </div>
            </div>
            <div>
              <blockquote className="ck-quote">
                "Our goal is to become the most trusted career platform in India
                — reaching every job seeker in every city, across every industry
                and experience level."
              </blockquote>
              <div
                style={{ fontSize: "13px", color: "#9c7a4a", marginTop: "8px" }}
              >
                — Founding Team, Career Kendra
              </div>
              <div className="ck-free-box">
                <div className="ck-free-num">₹0</div>
                <div className="ck-free-lbl">
                  Always free for job seekers — no hidden charges, ever
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- FEATURES --> */}
        <div className="ck-features-bg">
          <div className="ck-features-inner">
            <div className="ck-eyebrow">What We Offer</div>
            <h2 className="ck-h2">
              Everything You Need
              <br />
              to Grow Your Career
            </h2>
            <div className="ck-feat-grid">
              <div className="ck-feat-card">
                <div className="ck-feat-icon">
                  <svg viewBox="0 0 24 24">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  </svg>
                </div>
                <div className="ck-feat-tag">Trust</div>
                <div className="ck-feat-title">Verified Job Listings</div>
                <div className="ck-feat-desc">
                  Every job posting is reviewed and verified by our team. No
                  scams, no fake roles — just genuine opportunities you can
                  trust.
                </div>
              </div>
              <div className="ck-feat-card">
                <div className="ck-feat-icon">
                  <svg viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                  </svg>
                </div>
                <div className="ck-feat-tag">Smart</div>
                <div className="ck-feat-title">AI-Powered Matching</div>
                <div className="ck-feat-desc">
                  Enter your skills and experience, and our smart algorithm
                  suggests the best-fit jobs across all industries
                  automatically.
                </div>
              </div>
              <div className="ck-feat-card">
                <div className="ck-feat-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="ck-feat-tag">Reach</div>
                <div className="ck-feat-title">Wide Employer Network</div>
                <div className="ck-feat-desc">
                  From early-stage startups to established enterprises — 15,000+
                  companies are actively looking for talent on our platform.
                </div>
              </div>
              <div className="ck-feat-card">
                <div className="ck-feat-icon">
                  <svg viewBox="0 0 24 24">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <div className="ck-feat-tag">Growth</div>
                <div className="ck-feat-title">Career Growth Tools</div>
                <div className="ck-feat-desc">
                  Resume builder, interview preparation guides, salary insights,
                  and skill assessments — all in one place to accelerate your
                  growth.
                </div>
              </div>
              <div className="ck-feat-card">
                <div className="ck-feat-icon">
                  <svg viewBox="0 0 24 24">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </div>
                <div className="ck-feat-tag">Easy</div>
                <div className="ck-feat-title">Mobile-First Platform</div>
                <div className="ck-feat-desc">
                  Apply to jobs on the go with our fast, intuitive mobile app.
                  Available in multiple languages for a truly accessible
                  experience.
                </div>
              </div>
              <div className="ck-feat-card">
                <div className="ck-feat-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="ck-feat-tag">Support</div>
                <div className="ck-feat-title">Dedicated HR Support</div>
                <div className="ck-feat-desc">
                  Our experienced HR team is available to guide both candidates
                  and employers through every stage of the hiring journey.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- VALUES --> */}
        <div className="ck-section">
          <div className="ck-eyebrow">Core Values</div>
          <h2 className="ck-h2">
            The Principles We
            <br />
            Stand By
          </h2>
          <div className="ck-values-grid">
            <div className="ck-val">
              <div className="ck-val-bg">01</div>
              <div className="ck-val-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <div className="ck-val-title">Trust First</div>
              <div className="ck-val-desc">
                Every interaction is built on honesty, transparency, and respect
                — for both candidates and employers.
              </div>
            </div>
            <div className="ck-val">
              <div className="ck-val-bg">02</div>
              <div className="ck-val-icon">
                <svg viewBox="0 0 24 24">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div className="ck-val-title">Speed Matters</div>
              <div className="ck-val-desc">
                We know time is precious. Our platform is designed to move fast
                — from application to interview to offer.
              </div>
            </div>
            <div className="ck-val">
              <div className="ck-val-bg">03</div>
              <div className="ck-val-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div className="ck-val-title">India for India</div>
              <div className="ck-val-desc">
                From Tier 1 metros to Tier 3 towns — we are committed to
                reaching every job seeker across the country.
              </div>
            </div>
            <div className="ck-val">
              <div className="ck-val-bg">04</div>
              <div className="ck-val-icon">
                <svg viewBox="0 0 24 24">
                  <line x1="12" y1="2" x2="12" y2="6" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                  <line x1="2" y1="12" x2="6" y2="12" />
                  <line x1="18" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                </svg>
              </div>
              <div className="ck-val-title">Always Innovating</div>
              <div className="ck-val-desc">
                We use technology to continuously make hiring simpler, smarter,
                and more human — every single day.
              </div>
            </div>
          </div>
        </div>

        {/* <!-- STORY --> */}
        <div className="ck-story-bg">
          <div className="ck-story-inner">
            <div className="ck-story-grid">
              <div>
                <div className="ck-eyebrow">Our Story</div>
                <h2 className="ck-h2">
                  How Career Kendra
                  <br />
                  Came to Be
                </h2>
                <p className="ck-body">
                  Career Kendra began with a simple but powerful observation —
                  millions of talented people in India struggle to find the
                  right job, not because of a lack of skills, but because of a
                  lack of the right platform. We set out to change that.
                </p>
                <div className="ck-tl">
                  <div className="ck-tl-item">
                    <div className="ck-tl-left">
                      <div className="ck-tl-dot">
                        <svg viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className="ck-tl-line"></div>
                    </div>
                    <div>
                      <div className="ck-tl-year">2019</div>
                      <div className="ck-tl-event">Foundation</div>
                      <div className="ck-tl-detail">
                        Career Kendra launched with a vision to democratize job
                        opportunities and make quality hiring accessible for all
                        of India.
                      </div>
                    </div>
                  </div>
                  <div className="ck-tl-item">
                    <div className="ck-tl-left">
                      <div className="ck-tl-dot">
                        <svg viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className="ck-tl-line"></div>
                    </div>
                    <div>
                      <div className="ck-tl-year">2021</div>
                      <div className="ck-tl-event">1 Lakh Users</div>
                      <div className="ck-tl-detail">
                        Reached 1 lakh registered users and expanded operations
                        to 50+ cities across India.
                      </div>
                    </div>
                  </div>
                  <div className="ck-tl-item">
                    <div className="ck-tl-left">
                      <div className="ck-tl-dot">
                        <svg viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className="ck-tl-line"></div>
                    </div>
                    <div>
                      <div className="ck-tl-year">2023</div>
                      <div className="ck-tl-event">AI Integration</div>
                      <div className="ck-tl-detail">
                        Launched smart AI-powered job matching, helping
                        candidates find relevant roles 3x faster than before.
                      </div>
                    </div>
                  </div>
                  <div className="ck-tl-item">
                    <div className="ck-tl-left">
                      <div
                        className="ck-tl-dot"
                        style={{
                          background: "#fff8ec",
                          border: "2px solid #fe9a00",
                        }}
                      >
                        <svg viewBox="0 0 24 24" style={{ stroke: "#fe9a00" }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div className="ck-tl-year" style={{ color: "#1c1007" }}>
                        Today
                      </div>
                      <div className="ck-tl-event">1M+ and Growing</div>
                      <div className="ck-tl-detail">
                        Over 10 lakh candidates, 15,000+ employer partners, and
                        a community that keeps growing every day.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ paddingTop: "48px" }}>
                <div className="ck-big-n">10L+</div>
                <div className="ck-big-nl">
                  Successful placements since 2019
                </div>
                <div className="ck-nums-grid">
                  <div className="ck-num-card">
                    <div className="ck-num-val">15K+</div>
                    <div className="ck-num-lbl">Partner Companies</div>
                  </div>
                  <div className="ck-num-card">
                    <div className="ck-num-val">250+</div>
                    <div className="ck-num-lbl">Cities Covered</div>
                  </div>
                  <div className="ck-num-card">
                    <div className="ck-num-val">40+</div>
                    <div className="ck-num-lbl">Industry Sectors</div>
                  </div>
                  <div className="ck-num-card">
                    <div className="ck-num-val">4.8★</div>
                    <div className="ck-num-lbl">App Store Rating</div>
                  </div>
                </div>
                <div className="ck-press">
                  <div className="ck-press-lbl">As Featured In</div>
                  <div className="ck-press-list">
                    <span className="ck-press-name">Economic Times</span>
                    <span className="ck-press-name">YourStory</span>
                    <span className="ck-press-name">Inc42</span>
                    <span className="ck-press-name">Mint</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- TEAM --> */}
        {/* <div className="ck-section">
    <div className="ck-team-inner">
      <div className="ck-team-head">
        <div>
          <div className="ck-eyebrow">Our Team</div>
          <h2 className="ck-h2" style={{ marginBottom: "0" }}>The People Behind<br/>the Platform</h2>
        </div>
        <p style={{ fontSize: "14px", color: "#8a6e3e", maxWidth: "280px", textAlign: "right", lineHeight: "1.7" }}>Passionate professionals building a better future for India's workforce.</p>
      </div>
      <div className="ck-team-grid">
        <div className="ck-member">
          <div className="ck-member-img"><div className="ck-member-av">RK</div></div>
          <div className="ck-member-info">
            <div className="ck-member-name">Rahul Kumar</div>
            <div className="ck-member-role">Founder & CEO</div>
            <div className="ck-member-bio">10+ years in HR technology. Previously at Naukri.com. IIT Delhi alumnus. Passionate about building equal career opportunities across India.</div>
          </div>
        </div>
        <div className="ck-member">
          <div className="ck-member-img" style={{ background: "#fff0e4" }}><div className="ck-member-av" style={{ background: "#e07830" }}>PS</div></div>
          <div className="ck-member-info">
            <div className="ck-member-name">Priya Sharma</div>
            <div className="ck-member-role">Co-Founder & COO</div>
            <div className="ck-member-bio">Expert in scaling operations for high-growth platforms. MBA from IIM Ahmedabad. Loves solving complex hiring challenges with elegant systems.</div>
          </div>
        </div>
        <div className="ck-member">
          <div className="ck-member-img" style={{ background: "#e8f5ee" }}><div className="ck-member-av" style={{ background: "#2a9060" }}>AM</div></div>
          <div className="ck-member-info">
            <div className="ck-member-name">Arjun Mehta</div>
            <div className="ck-member-role">Co-Founder & CTO</div>
            <div className="ck-member-bio">Full-stack engineer and AI enthusiast. Built the matching engine powering 60% of our successful placements. BITS Pilani graduate.</div>
          </div>
        </div>
      </div>
    </div>
  </div> */}
      </div>
    </>
  );
};

export default page;
