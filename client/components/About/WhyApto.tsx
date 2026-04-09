"use client";
import React, { useEffect, useRef } from "react";
import { Users, Briefcase, Trophy, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import aboutImage from "@/assets/images/about/ab05.jpg";
import millionBadge from "@/assets/images/about/1m+.png";

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

const WhyApto = () => {
  const sectionRef = useRef(null);

  // Subtle parallax orbs on mouse move
  useEffect(() => {
    const handleMove = (e : MouseEvent) => {
      const orbs = document.querySelectorAll(".wa-orb");
      const { clientX: x, clientY: y } = e;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 0.012;
        orb.style.transform = `translate(${(x - cx) * factor}px, ${(y - cy) * factor}px)`;
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <>
      <style>{`
        /* ── Fonts ── */
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── Section shell ── */
        .wa-section {
          position: relative;
          padding: 6rem 0 8rem;
          background: #fff8ec;
          overflow: hidden;
          // font-family: 'DM Sans', sans-serif;
        }

        /* ── Grid mesh background ── */
        .wa-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        /* ── Orbs ── */
        .wa-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          transition: transform 0.8s cubic-bezier(.25,.46,.45,.94);
          will-change: transform;
        }
        .wa-orb-1 {
          width: 560px; height: 560px;
          top: -200px; left: -160px;
          background: radial-gradient(circle, #fff8ec 0%, transparent 70%);
        }
        .wa-orb-2 {
          width: 400px; height: 400px;
          bottom: -100px; right: -80px;
          background: radial-gradient(circle, #fff8ec 0%, transparent 70%);
        }
        .wa-orb-3 {
          width: 280px; height: 280px;
          top: 40%; left: 50%;
          background: radial-gradient(circle, #fff8ec 0%, transparent 70%);
        }

        /* ── Container ── */
        .wa-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 10;
        }

        /* ── Layout grid ── */
        .wa-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3.5rem;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .wa-grid { grid-template-columns: 7fr 5fr; gap: 5rem; }
        }

        /* ── LEFT SIDE ── */
        .wa-left { order: 2; }
        @media (min-width: 1024px) { .wa-left { order: 1; } }

        /* Eyebrow chip */
        .wa-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #fff8ec;
          border: 1px solid #fe9a00;
          color: #fe9a00;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          margin-bottom: 1.5rem;
        }
        .wa-eyebrow svg { width: 12px; height: 12px; }

        /* Heading */
        .wa-heading {
          // font-family: 'Syne', sans-serif;
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          font-weight: 800;
          line-height: 1.06;
          letter-spacing: -0.03em;
          color: #0F172A;
          margin-bottom: 1.2rem;
        }
        .wa-heading-accent {
          background: linear-gradient(135deg, #fe9a00 0%, #fe9a00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Sub-copy */
        .wa-sub {
          font-size: 1.1rem;
          line-height: 1.75;
          color: #475569;
          font-weight: 300;
          max-width: 36rem;
          margin-bottom: 2.5rem;
        }

        /* ── Feature cards ── */
        .wa-cards { display: flex; flex-direction: column; gap: 1rem; }

        .wa-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 1.25rem;
          padding: 1.5rem 1.75rem;
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          position: relative;
          overflow: hidden;
          cursor: default;
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
        }
        .wa-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(135deg, #fe9a00 0%, #fe9a00 100%);
          border-radius: 2px;
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.4s cubic-bezier(.34,1.56,.64,1);
        }
        .wa-card:hover {
          border-color: #C7D2FE;
          box-shadow: 0 16px 40px -8px rgba(99,102,241,0.14);
          transform: translateY(-3px);
        }
        .wa-card:hover::before { transform: scaleY(1); }

        /* Card icon wrapper */
        .wa-icon-wrap {
          flex-shrink: 0;
          width: 48px; height: 48px;
          border-radius: 0.875rem;
          background: linear-gradient(135deg, #fff8ec 0%, #fff8ec 100%);
          border: 1px solid #fe9a00;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
        }
        .wa-card:hover .wa-icon-wrap {
          background: linear-gradient(135deg, #fe9a00 0%, #fe9a00 100%);
          border-color: #fe9a00;
        }
        .wa-icon-wrap svg {
          width: 22px; height: 22px;
          color: #fe9a00;
          transition: color 0.3s;
        }
        .wa-card:hover .wa-icon-wrap svg { color: #fff; }

        /* Card body */
        .wa-card-body {}
        .wa-card-tag {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #fe9a00;
          text-transform: uppercase;
          margin-bottom: 0.3rem;
        }
        .wa-card-title {
          // font-family: 'Syne', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 0.4rem;
          transition: color 0.3s;
        }
        .wa-card:hover .wa-card-title { color: #fe9a00; }
        .wa-card-desc {
          font-size: 0.88rem;
          color: #64748B;
          line-height: 1.65;
        }

        /* CTA link */
        .wa-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2rem;
          font-size: 0.92rem;
          font-weight: 500;
          color: #fe9a00;
          text-decoration: none;
          padding: 0.7rem 1.5rem;
          background: #fff8ec;
          border: 1px solid #fe9a00;
          border-radius: 999px;
          transition: background 0.25s, color 0.25s, box-shadow 0.25s;
          width: fit-content;
          cursor: pointer;
        }
        .wa-cta:hover {
          background: #fe9a00;
          color: #fff;
          box-shadow: 0 8px 24px #fff8ec;
          border-color: #fe9a00;
        }
        .wa-cta svg { width: 16px; height: 16px; transition: transform 0.25s; }
        .wa-cta:hover svg { transform: translateX(3px); }

        /* ── RIGHT SIDE – Image ── */
        .wa-right { order: 1; }
        @media (min-width: 1024px) { .wa-right { order: 2; } }

        .wa-image-wrap {
          position: relative;
        }

        /* Decorative square offset blocks */
        .wa-deco-block {
          position: absolute;
          border-radius: 1rem;
          z-index: 0;
        }
        .wa-deco-block-1 {
          width: 88%; height: 88%;
          bottom: -20px; right: -20px;
          background: linear-gradient(135deg, #fe9a00 0%, #fe9a00 100%);
          opacity: 0.12;
        }
        .wa-deco-block-2 {
          width: 60%; height: 60%;
          top: -18px; left: -18px;
          background: #F59E0B;
          opacity: 0.10;
        }

        /* Main image frame */
        .wa-image-frame {
          position: relative;
          z-index: 1;
          border-radius: 2rem;
          overflow: hidden;
          border: 1px solid #E2E8F0;
          box-shadow: 0 32px 80px -16px rgba(15,23,42,0.18);
          aspect-ratio: 4/5;
        }
        .wa-image-frame img,
        .wa-image-frame > div {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Overlay gradient */
        .wa-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(99,102,241,0.25) 0%, transparent 55%);
          pointer-events: none;
        }

        /* Floating stat pill */
        .wa-stat-pill {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 999px;
          padding: 0.65rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          white-space: nowrap;
          box-shadow: 0 8px 32px rgba(99,102,241,0.15);
        }
        .wa-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .wa-stat-number {
          // font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 800;
          color: #6366F1;
          line-height: 1;
        }
        .wa-stat-label {
          font-size: 0.62rem;
          color: #64748B;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .wa-stat-divider {
          width: 1px;
          height: 28px;
          background: #E2E8F0;
        }

        /* Floating badge – top right */
        .wa-badge {
          position: absolute;
          top: -14px;
          right: -14px;
          z-index: 20;
          background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
          color: #fff;
          // font-family: 'Syne', sans-serif;
          font-size: 0.78rem;
          font-weight: 800;
          padding: 0.55rem 1.1rem;
          border-radius: 0.75rem;
          letter-spacing: -0.01em;
          box-shadow: 0 8px 20px rgba(245,158,11,0.35);
          transform: rotate(6deg);
          border: 2px solid rgba(255,255,255,0.4);
        }

        /* Million badge */
        .wa-million-badge {
          position: absolute;
          top: 50%;
          left: -3rem;
          transform: translateY(-50%);
          width: 5.5rem;
          height: 5.5rem;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #E0E7FF;
          box-shadow: 0 12px 36px rgba(99,102,241,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          overflow: hidden;
        }
        @media (max-width: 640px) { .wa-million-badge { display: none; } }

        /* Pulse animation on badge */
        @keyframes wa-pulse {
          0%, 100% { box-shadow: 0 12px 36px rgba(99,102,241,0.18), 0 0 0 0 rgba(99,102,241,0.2); }
          50% { box-shadow: 0 12px 36px rgba(99,102,241,0.18), 0 0 0 10px rgba(99,102,241,0); }
        }
        .wa-million-badge { animation: wa-pulse 3s ease-in-out infinite; }

        /* Staggered fade-in */
        @keyframes wa-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .wa-animate { opacity: 0; animation: wa-fade-up 0.6s ease forwards; }
        .wa-animate:nth-child(1) { animation-delay: 0.05s; }
        .wa-animate:nth-child(2) { animation-delay: 0.15s; }
        .wa-animate:nth-child(3) { animation-delay: 0.25s; }
        .wa-animate:nth-child(4) { animation-delay: 0.35s; }
        .wa-animate:nth-child(5) { animation-delay: 0.45s; }
        .wa-animate:nth-child(6) { animation-delay: 0.55s; }
      `}</style>

      <section className="wa-section" ref={sectionRef}>
        {/* Orbs */}
        <div className="wa-orb wa-orb-1" />
        <div className="wa-orb wa-orb-2" />
        <div className="wa-orb wa-orb-3" />

        <div className="wa-container">
          <div className="wa-grid">
            {/* ── LEFT ── */}
            <div className="wa-left">
              {/* Eyebrow */}
              <div className="wa-eyebrow wa-animate">
                <Sparkles />
                Executive Search Excellence
              </div>

              {/* Heading */}
              <h2 className="wa-heading wa-animate">
                Why <span className="wa-heading-accent">Career Kendra</span>
                {/* <br /> */}
                {/* Stands Apart */}
              </h2>

              {/* Sub copy */}
              <p className="wa-sub wa-animate">
                Career Kendra helps job seekers find the right opportunities
                while enabling employers to connect with the best talent — all
                in one powerful platform.
              </p>

              {/* Cards */}
              <div className="wa-cards">
                {features.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="wa-card wa-animate">
                      <div className="wa-icon-wrap">
                        <Icon strokeWidth={2} />
                      </div>
                      <div className="wa-card-body">
                        <div className="wa-card-tag">{item.tag}</div>
                        <div className="wa-card-title">{item.title}</div>
                        <div className="wa-card-desc">{item.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <div className="wa-cta wa-animate">
                Explore Our Approach
                <ArrowRight />
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div className="wa-right">
              <div className="wa-image-wrap">
                {/* Decorative offset blocks */}
                <div className="wa-deco-block wa-deco-block-1" />
                <div className="wa-deco-block wa-deco-block-2" />

                {/* Floating left badge (million) */}
                <div className="wa-million-badge">
                  <Image
                    src={millionBadge}
                    alt="1M+ candidates network"
                    fill
                    className="object-contain p-2"
                  />
                </div>

                <div className="wa-image-frame">
                  <Image
                    src={aboutImage}
                    alt="Career Kendra — Executive leadership placement excellence"
                    fill
                    className="object-cover"
                    priority
                    quality={85}
                  />
                  {/* <div className="wa-image-overlay" /> */}

                  {/* <div className="wa-stat-pill">
                    <div className="wa-stat-item">
                      <span className="wa-stat-number">94%</span>
                      <span className="wa-stat-label">Retention</span>
                    </div>
                    <div className="wa-stat-divider" />
                    <div className="wa-stat-item">
                      <span className="wa-stat-number">1M+</span>
                      <span className="wa-stat-label">Network</span>
                    </div>
                    <div className="wa-stat-divider" />
                    <div className="wa-stat-item">
                      <span className="wa-stat-number">98.4%</span>
                      <span className="wa-stat-label">Excellence</span>
                    </div>
                  </div> */}
                </div>

                <div className="wa-badge">98.4% Client Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default WhyApto;
