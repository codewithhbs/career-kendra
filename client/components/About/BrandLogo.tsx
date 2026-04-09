"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/user_axios";

interface BrandLogoItem {
  id: number;
  image: string;
  position: number;
  status: string;
}

function splitIntoColumns<T>(arr: T[], cols: number): T[][] {
  const result: T[][] = Array.from({ length: cols }, () => []);
  arr.forEach((item, i) => result[i % cols].push(item));
  return result;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  @keyframes slide-up {
    0%   { transform: translateY(0); }
    100% { transform: translateY(-33.333%); }
  }
  @keyframes slide-down {
    0%   { transform: translateY(-33.333%); }
    100% { transform: translateY(0); }
  }

  /* ── Section ── */
  .bl-section {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: #0F172A;
    // font-family: 'DM Sans', sans-serif;
  }

  /* Dot grid */
  .bl-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(99,102,241,0.18) 1px, transparent 1px);
    background-size: 30px 30px;
    pointer-events: none;
    z-index: 0;
  }

  /* Radial top glow */
  .bl-section::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 70% 50% at 15% 50%, rgba(99,102,241,0.14) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── Blobs ── */
  .bl-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(90px);
    z-index: 0;
  }
  .bl-blob-1 {
    width: 420px; height: 420px;
    top: -150px; left: -120px;
    background: rgba(99,102,241,0.18);
  }
  .bl-blob-2 {
    width: 320px; height: 320px;
    bottom: -100px; right: -80px;
    background: rgba(245,158,11,0.10);
  }

  /* ── Container ── */
  .bl-container {
    position: relative;
    z-index: 10;
    max-width: 1280px;
    margin: 0 auto;
    padding: 5rem 1.5rem;
  }
  @media (min-width: 640px)  { .bl-container { padding: 6rem 2rem; } }
  @media (min-width: 1024px) { .bl-container { padding: 6rem 3rem; } }

  /* ── Inner layout ── */
  .bl-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3.5rem;
  }
  @media (min-width: 1024px) {
    .bl-inner {
      flex-direction: row;
      align-items: center;
      gap: 4rem;
    }
  }

  /* ── LEFT ── */
  .bl-left {
    width: 100%;
    text-align: center;
  }
  @media (min-width: 1024px) {
    .bl-left {
      width: 42%;
      text-align: left;
      padding-right: 2rem;
    }
  }

  /* Eyebrow */
  .bl-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 0.4rem 1rem;
    border-radius: 999px;
    background: rgba(99,102,241,0.15);
    color: #A5B4FC;
    border: 1px solid rgba(99,102,241,0.35);
    margin-bottom: 1.5rem;
  }
  .bl-eyebrow-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #818CF8;
    animation: bl-pulse 2.2s ease-in-out infinite;
  }
  @keyframes bl-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.35; transform: scale(1.6); }
  }

  /* Heading */
  .bl-heading {
    // font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.03em;
    color:#0f172a;
    margin-bottom: 1.2rem;
    padding: 10px 10px ;
    border-radius: 0.5rem;



    background-color: #fff;
  }
  .bl-heading-accent {
    background: linear-gradient(135deg, #fe9a00 0%, #0f172a 50%, #fe9a00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Body text */
  .bl-body {
    font-size: 0.97rem;
    line-height: 1.78;
    color: #64748B;
    font-weight: 300;
    max-width: 32rem;
    margin: 0 auto 1rem;
  }
  @media (min-width: 1024px) { .bl-body { margin: 0 0 1rem; } }

  /* Stats row */
  .bl-stats {
    display: flex;
    justify-content: center;
    gap: 0;
    margin-top: 2rem;
    flex-wrap: wrap;
    row-gap: 1rem;
  }
  @media (min-width: 1024px) { .bl-stats { justify-content: flex-start; } }

  .bl-stat {
    display: flex;
    flex-direction: column;
    padding-right: 2rem;
    margin-right: 2rem;
    border-right: 1px solid rgba(255,255,255,0.08);
  }
  .bl-stat:last-child { border-right: none; padding-right: 0; margin-right: 0; }

  .bl-stat-num {
    // font-family: 'Syne', sans-serif;
    font-size: 1.65rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #fe9a00, #fe9a00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .bl-stat-label {
    font-size: 0.73rem;
    color: #fff;
    font-weight: 500;
    margin-top: 0.25rem;
    letter-spacing: 0.04em;
  }

  /* ── RIGHT — logo columns ── */
  .bl-right {
    width: 100%;
    position: relative;
  }
  @media (min-width: 1024px) { .bl-right { width: 58%; } }

  .bl-columns-wrap {
    position: relative;
    height: 420px;
    overflow: hidden;
  }
  @media (max-width: 640px) { .bl-columns-wrap { height: 340px; } }

  /* top + bottom fade masks */
  .bl-fade-top,
  .bl-fade-bottom {
    pointer-events: none;
    position: absolute;
    left: 0; right: 0;
    z-index: 10;
    height: 100px;
  }
  .bl-fade-top {
    top: 0;
    background: linear-gradient(to bottom, #0F172A 0%, transparent 100%);
  }
  .bl-fade-bottom {
    bottom: 0;
    background: linear-gradient(to top, #0F172A 0%, transparent 100%);
  }

  .bl-columns-grid {
    display: flex;
    gap: 0.85rem;
    height: 100%;
    overflow: hidden;
  }
  .bl-col { flex: 1; overflow: hidden; }

  /* ── Logo card ── */
  .bl-logo-card {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 88px;
    border-radius: 1rem;
    background: rgb(255 255 255);
    border: 1px solid rgba(255,255,255,0.07);
    padding: 1rem;
    cursor: pointer;
    transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
    margin-bottom: 0.85rem;
    flex-shrink: 0;
  }
  .bl-logo-card:hover {
    background: rgb(254 154 0);
    border-color: rgba(99,102,241,0.35);
    box-shadow: 0 4px 20px rgba(99,102,241,0.18);
  }
  .bl-logo-card img {
    height: 100%;
    max-width: 100%;
    object-fit: contain;
    transition: opacity 0.3s, filter 0.3s;
  }
  .bl-logo-card:hover img {
    opacity: 0.85;
    // filter: brightness(0) invert(1) sepia(1) hue-rotate(220deg) saturate(2);
  }
    .bl-rise-3{
    color:#fff;
    }

  /* ── Staggered entrance ── */
  @keyframes bl-rise {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .bl-rise { opacity: 0; animation: bl-rise 0.6s ease forwards; }
  .bl-rise-1 { animation-delay: 0.05s; }
  .bl-rise-2 { animation-delay: 0.15s; }
  .bl-rise-3 { animation-delay: 0.26s; }
  .bl-rise-4 { animation-delay: 0.38s; }
`;

// ── Slide column component ────────────────────────────────────────────────────
const SlideColumn = ({
  logos,
  direction = "up",
  speed = 28,
}: {
  logos: BrandLogoItem[];
  direction?: "up" | "down";
  speed?: number;
}) => {
  const tripled = [...logos, ...logos, ...logos];

  return (
    <div className="bl-col">
      <div
        style={{
          animation: `slide-${direction} ${speed}s linear infinite`,
          willChange: "transform",
        }}
      >
        {tripled.map((logo, i) => (
          <div key={`${logo.id}-${i}`} className="bl-logo-card">
            <img src={logo.image} alt={`Partner ${logo.id}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const BrandLogo = () => {
  const [logos, setLogos] = useState<BrandLogoItem[]>([]);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const res = await axiosInstance.get("/organization-logo");
        // console.log("res",res.data.data)
        const active = res.data.data
          .filter((item: BrandLogoItem) => item.status === "active")
          .sort((a: BrandLogoItem, b: BrandLogoItem) => a.position - b.position);
        setLogos(active);
      } catch (err) {
        console.error("Error fetching logos", err);
      }
    };
    fetchLogos();
  }, []);

  // console.log("logos",logos)

  if (logos.length === 0) return null;

  const columns = splitIntoColumns(logos, 3);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <section className="bl-section">
        <div className="bl-blob bl-blob-1" />
        <div className="bl-blob bl-blob-2" />

        <div className="bl-container">
          <div className="bl-inner">

            {/* ── LEFT: Text ── */}
            <div className="bl-left">
              {/* Eyebrow */}
              <div className="bl-eyebrow bl-rise bl-rise-1">
                <div className="bl-eyebrow-dot" />
                Trusted Partners
              </div>

              {/* Heading */}
              <h2 className="bl-heading bl-rise bl-rise-2">
                Organizations That{" "}
                <span className="bl-heading-accent">Trust Our Vision</span>
                <br />
                
              </h2>

              {/* Body */}
              <p className="bl-body bl-rise bl-rise-3">
                We architect confidence by connecting visionary organizations with
                exceptional leadership. From Fortune 500 boardrooms to fast-growing
                innovators, our placements shape the future of global business.
              </p>
              <p className="bl-body bl-rise bl-rise-3">
                High-precision leadership placements grounded in trust, performance,
                and long-term shared success.
              </p>

              {/* Stats */}
              <div className="bl-stats bl-rise bl-rise-4">
                {[
                  { num: "15+", label: "Partners" },
                  { num: "98%", label: "Retention" },
                  { num: "9yr",  label: "Excellence" },
                ].map((stat) => (
                  <div key={stat.label} className="bl-stat">
                    <div className="bl-stat-num">{stat.num}</div>
                    <div className="bl-stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Sliding logo columns ── */}
            <div className="bl-right bl-rise bl-rise-4">
              <div className="bl-columns-wrap">
                {/* Fade masks */}
                <div className="bl-fade-top" />
                <div className="bl-fade-bottom" />

                <div className="bl-columns-grid">
                  <SlideColumn logos={columns[0]} direction="up"   speed={20} />
                  <SlideColumn logos={columns[1]} direction="down" speed={26} />
                  <SlideColumn logos={columns[2]} direction="up"   speed={22} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default BrandLogo;