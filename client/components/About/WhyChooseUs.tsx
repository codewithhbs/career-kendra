'use client';

import React, { useState } from 'react';
import { Award, Database, Users, DollarSign, Brain, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

type Feature = {
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number; className?: string; style?: React.CSSProperties }>;
  tag: string;
};

const features: Feature[] = [
  {
    title: "Quality Providers",
    description:
      "Rigorous screening and comprehensive evaluations ensure only the best candidates are matched with your organization — building a workforce that drives your business forward.",
    icon: Award,
    tag: "EXCELLENCE",
  },
  {
    title: "Candidate Database",
    description:
      "A robust network of qualified professionals across various industries. Our vast talent pool lets us quickly find the precise match for your specific requirements.",
    icon: Database,
    tag: "NETWORK",
  },
  {
    title: "Customer-Oriented Approach",
    description:
      "We forge strong partnerships with clients, understanding your specific requirements and tailoring our services to deliver a personalized experience that exceeds expectations.",
    icon: Users,
    tag: "PARTNERSHIP",
  },
  {
    title: "Cost Effectiveness",
    description:
      "Excellent value without compromising on quality. Our cost-effective solutions help you achieve HR objectives within your budget — maximum return on every investment.",
    icon: DollarSign,
    tag: "VALUE",
  },
  {
    title: "Expertise & Domain Knowledge",
    description:
      "Years of HR industry experience backed by deep domain knowledge. Our team stays ahead of the curve, offering innovative solutions that cater to your evolving business needs.",
    icon: Brain,
    tag: "EXPERTISE",
  },
  {
    title: "Statutory Compliance",
    description:
      "All processes adhere to relevant laws and regulations. Our compliance-first approach mitigates risk and provides peace of mind — letting you focus on core business activities.",
    icon: ShieldCheck,
    tag: "COMPLIANCE",
  },
];

const stats = [
  { num: "10K+", label: "Successful Placements" },
  { num: "500+", label: "Active Companies" },
  { num: "15+",  label: "Years Experience" },
  { num: "98%",  label: "Client Satisfaction" },
];

// ── Styles ────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* ── Section ── */
  .wcu-section {
    position: relative;
    width: 100%;
    padding: 5.5rem 0 6rem;
    background: #fff8ec;
    overflow: hidden;
    // font-family: 'DM Sans', sans-serif;
  }

  /* Dot grid */
  .wcu-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(99,102,241,0.14) 1px, transparent 1px);
    background-size: 30px 30px;
    pointer-events: none;
    z-index: 0;
  }

  /* ── Blobs ── */
  .wcu-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(90px);
    z-index: 0;
  }
  .wcu-blob-1 {
    width: 560px; height: 560px;
    top: -200px; right: -160px;
    background: #fe9a001f;
  }
  .wcu-blob-2 {
    width: 400px; height: 400px;
    bottom: -120px; left: -100px;
    background: rgba(245,158,11,0.09);
  }
  .wcu-blob-3 {
    width: 260px; height: 260px;
    top: 50%; left: 45%;
    background: rgba(99,102,241,0.07);
  }

  /* ── Container ── */
  .wcu-container {
    position: relative;
    z-index: 10;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  @media (min-width: 640px)  { .wcu-container { padding: 0 2rem; } }
  @media (min-width: 1024px) { .wcu-container { padding: 0 3rem; } }

  /* ── Header ── */
  .wcu-header {
    max-width: 640px;
    margin: 0 auto 4rem;
    text-align: center;
  }

  .wcu-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.4rem 1rem;
    border-radius: 999px;
    background: #fff8ec;
    color: #fe9a00;
    border: 1px solid #fe9a00;
    margin-bottom: 1.4rem;
  }

  .wcu-heading {
    // font-family: 'Syne', sans-serif;
    font-size: clamp(2.1rem, 4.5vw, 3rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.03em;
    color: #0F172A;
    margin-bottom: 1rem;
  }
  .wcu-heading-accent {
    background: linear-gradient(135deg, #fe9a00 0%, #fe9a00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .wcu-heading-underline {
    position: relative;
    display: inline-block;
  }
  .wcu-heading-underline::after {
    content: '';
    position: absolute;
    left: 0; bottom: -5px;
    width: 100%; height: 3px;
    background: #F59E0B;
    border-radius: 2px;
  }

  .wcu-subtext {
    font-size: 1rem;
    line-height: 1.75;
    color: #64748B;
    font-weight: 300;
  }

  /* ── Feature grid ── */
  .wcu-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.1rem;
  }
  @media (min-width: 640px) { .wcu-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .wcu-grid { grid-template-columns: repeat(3, 1fr); gap: 1.25rem; } }

  /* ── Feature card ── */
  .wcu-card {
    position: relative;
    background: #FFFFFF;
    border: 1px solid #fe9a00;
    border-radius: 1.4rem;
    padding: 1.75rem 2rem;
    overflow: hidden;
    cursor: default;
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
  }
  .wcu-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, #fe9a00, #fe9a00, #fe9a00);
    border-radius: 2px;
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 0.4s cubic-bezier(.34,1.56,.64,1);
  }
  .wcu-card:hover {
    border-color: #fe9a00;
    box-shadow: 0 18px 48px rgba(99,102,241,0.13);
    transform: translateY(-4px);
  }
  .wcu-card:hover::before { transform: scaleY(1); }

  /* Card number watermark */
  .wcu-card-num {
    position: absolute;
    top: 1.25rem;
    right: 1.5rem;
    // font-family: 'Syne', sans-serif;
    font-size: 4rem;
    font-weight: 800;
    color: rgba(99,102,241,0.05);
    line-height: 1;
    pointer-events: none;
    transition: color 0.3s;
    user-select: none;
  }
  .wcu-card:hover .wcu-card-num { color: rgba(99,102,241,0.08); }

  /* Icon */
  .wcu-icon-wrap {
    width: 48px; height: 48px;
    border-radius: 0.875rem;
    background: linear-gradient(135deg, #fff8ec, #fff8ec);
    border: 1px solid #fe9a00;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.25rem;
    transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
    flex-shrink: 0;
  }
  .wcu-card:hover .wcu-icon-wrap {
    background: linear-gradient(135deg, #fe9a00, #fe9a00);
    border-color: #fe9a00;
    box-shadow: 0 6px 20px rgba(99,102,241,0.35);
  }

  /* Tag */
  .wcu-card-tag {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #fe9a00;
    text-transform: uppercase;
    margin-bottom: 0.4rem;
  }

  /* Title */
  .wcu-card-title {
    // font-family: 'Syne', sans-serif;
    font-size: 1.08rem;
    font-weight: 700;
    color: #0F172A;
    margin-bottom: 0.65rem;
    line-height: 1.3;
    transition: color 0.3s;
  }
  .wcu-card:hover .wcu-card-title { color: #fe9a00; }

  /* Description */
  .wcu-card-desc {
    font-size: 0.875rem;
    color: #64748B;
    line-height: 1.7;
    font-weight: 300;
  }

  /* ── Stats band ── */
  .wcu-stats-wrap {
    margin-top: 4rem;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 1.5rem;
    padding: 2.5rem 2rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    box-shadow: 0 4px 20px rgba(99,102,241,0.06);
    position: relative;
    overflow: hidden;
  }
  @media (min-width: 768px) { .wcu-stats-wrap { grid-template-columns: repeat(4, 1fr); } }

  /* Stats inner line glow */
  .wcu-stats-wrap::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #fe9a00, #fe9a00, #fe9a00, #fe9a00);
    border-radius: 2px;
  }

  .wcu-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
  }
  .wcu-stat:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -1rem;
    top: 10%;
    height: 80%;
    width: 1px;
    background: #E2E8F0;
  }
  @media (max-width: 767px) { .wcu-stat:not(:last-child)::after { display: none; } }

  .wcu-stat-num {
    // font-family: 'Syne', sans-serif;
    font-size: clamp(1.8rem, 3.5vw, 2.6rem);
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, #fe9a00 0%, #fe9a00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.35rem;
  }
  .wcu-stat-label {
    font-size: 0.78rem;
    color: #64748B;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  /* ── CTA block ── */
  .wcu-cta-block {
    margin-top: 4rem;
    text-align: center;
  }
  .wcu-cta-text {
    font-size: 1rem;
    color: #64748B;
    font-weight: 300;
    margin-bottom: 1.5rem;
  }
  .wcu-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.85rem 2rem;
    border-radius: 0.875rem;
    background: linear-gradient(135deg, #fe9a00 0%, #fe9a00 100%);
    color: #fff;
    font-size: 0.92rem;
    font-weight: 700;
    // font-family: 'DM Sans', sans-serif;
    border: none;
    cursor: pointer;
    box-shadow: 0 8px 24px #fff8ec;
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    letter-spacing: -0.01em;
  }
  .wcu-cta-btn:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 14px 36px #fff8ec;
    background: linear-gradient(135deg, #fe9a00 0%, #fe9a00 100%);
  }
  .wcu-cta-btn:active { transform: scale(0.98); }
  .wcu-cta-btn svg { transition: transform 0.2s; }
  .wcu-cta-btn:hover svg { transform: translateX(3px); }

  /* ── Staggered entrance ── */
  @keyframes wcu-rise {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .wcu-rise { opacity: 0; animation: wcu-rise 0.6s ease forwards; }
  .wcu-rise-1 { animation-delay: 0.05s; }
  .wcu-rise-2 { animation-delay: 0.15s; }
  .wcu-rise-3 { animation-delay: 0.25s; }
  .wcu-rise-4 { animation-delay: 0.38s; }
  .wcu-rise-5 { animation-delay: 0.50s; }
`;

const WhyChooseUs: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <section id="why-us" className="wcu-section">
        {/* Blobs */}
        <div className="wcu-blob wcu-blob-1" />
        <div className="wcu-blob wcu-blob-2" />
        <div className="wcu-blob wcu-blob-3" />

        <div className="wcu-container">

          {/* ── Header ── */}
          <div className="wcu-header">
            <div className="wcu-eyebrow wcu-rise wcu-rise-1">
              <Sparkles size={11} />
              Our Advantage
            </div>

            <h2 className="wcu-heading wcu-rise wcu-rise-2">
              Why{" "}
              <span className="wcu-heading-underline">
                <span className="wcu-heading-accent">Choose Us</span>
              </span>
            </h2>

            <p className="wcu-subtext wcu-rise wcu-rise-3">
              Our commitment to excellence, expertise, and client success makes us
              your ideal partner for HR and recruitment solutions.
            </p>
          </div>

          {/* ── Feature grid ── */}
          <div className="wcu-grid wcu-rise wcu-rise-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={index}
                  className="wcu-card"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Ghost number watermark */}
                  <div className="wcu-card-num">0{index + 1}</div>

                  {/* Icon */}
                  <div className="wcu-icon-wrap">
                    <Icon
                      size={22}
                      style={{ color: isHovered ? "#fff" : "#fe9a00", transition: "color 0.3s" }}
                    />
                  </div>

                  {/* Tag */}
                  <div className="wcu-card-tag">{feature.tag}</div>

                  {/* Title */}
                  <h3 className="wcu-card-title">{feature.title}</h3>

                  {/* Desc */}
                  <p className="wcu-card-desc">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* ── Stats band ── */}
          <div className="wcu-stats-wrap wcu-rise wcu-rise-5">
            {stats.map((stat) => (
              <div key={stat.label} className="wcu-stat">
                <div className="wcu-stat-num">{stat.num}</div>
                <div className="wcu-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ── CTA ── */}
          <div className="wcu-cta-block wcu-rise wcu-rise-5">
            <p className="wcu-cta-text">Ready to partner with us for your HR success?</p>
            <button className="wcu-cta-btn">
              Get Started Today
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>
    </>
  );
};

export default WhyChooseUs;