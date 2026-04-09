"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, X, ChevronLeft, ChevronRight as ChevronRightIcon, ZoomIn, Images } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  category: string;
  title: string;
  span?: "wide" | "tall" | "normal";
}

type FilterCategory = "All" | "Office" | "Events" | "Team" | "Awards";

// ── Gallery Data ──────────────────────────────────────────────────────────────
// Replace src values with your actual image paths from /public folder
const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    src: "/images/gallery/office-1.jpg",
    alt: "Career Kendra Head Office",
    category: "Office",
    title: "Our Head Office — New Delhi",
    span: "wide",
  },
  {
    id: 2,
    src: "/images/gallery/team-1.jpg",
    alt: "Team Outing 2024",
    category: "Team",
    title: "Annual Team Outing 2024",
    span: "tall",
  },
  {
    id: 3,
    src: "/images/gallery/event-1.jpg",
    alt: "Job Fair Delhi 2024",
    category: "Events",
    title: "Job Fair — Pragati Maidan, Delhi",
    span: "normal",
  },
  {
    id: 4,
    src: "/images/gallery/award-1.jpg",
    alt: "Best Job Portal Award",
    category: "Awards",
    title: "Best Job Portal Award 2023",
    span: "normal",
  },
  {
    id: 5,
    src: "/images/gallery/office-2.jpg",
    alt: "Workspace",
    category: "Office",
    title: "Open Workspace & Collaboration Zone",
    span: "normal",
  },
  {
    id: 6,
    src: "/images/gallery/event-2.jpg",
    alt: "Campus Hiring Drive",
    category: "Events",
    title: "Campus Hiring Drive — IIT Delhi",
    span: "wide",
  },
  {
    id: 7,
    src: "/images/gallery/team-2.jpg",
    alt: "Founders Meet",
    category: "Team",
    title: "Founders & Leadership Meet",
    span: "normal",
  },
  {
    id: 8,
    src: "/images/gallery/award-2.jpg",
    alt: "Startup Award",
    category: "Awards",
    title: "Top HR Tech Startup — Inc42 Awards",
    span: "tall",
  },
  {
    id: 9,
    src: "/images/gallery/office-3.jpg",
    alt: "Conference Room",
    category: "Office",
    title: "State-of-the-art Conference Room",
    span: "normal",
  },
  {
    id: 10,
    src: "/images/gallery/event-3.jpg",
    alt: "Webinar 2024",
    category: "Events",
    title: "Career Growth Webinar — 5000+ Attendees",
    span: "normal",
  },
  {
    id: 11,
    src: "/images/gallery/team-3.jpg",
    alt: "Team Celebration",
    category: "Team",
    title: "Celebrating 1 Million Registrations",
    span: "wide",
  },
  {
    id: 12,
    src: "/images/gallery/office-4.jpg",
    alt: "Breakout Zone",
    category: "Office",
    title: "Creative Breakout & Lounge Zone",
    span: "normal",
  },
];

const FILTERS: FilterCategory[] = ["All", "Office", "Events", "Team", "Awards"];

// ── Category colors ───────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Office: "#3b82f6",
  Events: "#fe9a00",
  Team:   "#10b981",
  Awards: "#a855f7",
};

// ── Styles ────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  .gp-wrap {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #ffffff;
    color: #1c1007;
    min-height: 100vh;
  }

  /* ── Breadcrumb ── */
  .gp-bc {
    background: #fff8ec;
    border-bottom: 1px solid #ffe0a8;
    padding: 13px 0;
  }
  .gp-bc-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: center;
  }
  .gp-bc-home {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; color: #fe9a00; font-weight: 600;
    text-decoration: none; transition: color 0.2s;
  }
  .gp-bc-home:hover { color: #d97f00; }
  .gp-bc-sep { margin: 0 8px; color: #d4b87a; display: flex; align-items: center; }
  .gp-bc-cur { font-size: 13px; color: #1c1007; font-weight: 600; }

  /* ── Hero ── */
  .gp-hero {
    background: #fff8ec;
    border-bottom: 1px solid #ffe0a8;
    padding: 56px 2rem 48px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .gp-hero-pattern {
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, #fe9a0012 1.5px, transparent 1.5px);
    background-size: 28px 28px;
    pointer-events: none;
  }
  .gp-hero-inner { position: relative; z-index: 1; }
  .gp-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: #fe9a0015; border: 1px solid #fe9a0040;
    color: #c97200; font-size: 11px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    padding: 6px 18px; border-radius: 100px; margin-bottom: 18px;
  }
  .gp-badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #fe9a00;
    animation: gp-pulse 2s ease-in-out infinite;
  }
  @keyframes gp-pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.5; transform:scale(0.8); }
  }
  .gp-h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(30px, 4vw, 50px);
    font-weight: 900; color: #1c1007;
    line-height: 1.1; margin-bottom: 14px;
  }
  .gp-h1 span { color: #fe9a00; }
  .gp-sub {
    font-size: 15px; color: #6b5231;
    line-height: 1.8; max-width: 480px;
    margin: 0 auto;
  }

  /* ── Filter bar ── */
  .gp-filters-wrap {
    position: sticky; top: 0; z-index: 50;
    background: #ffffff;
    border-bottom: 1px solid #ffe0a8;
    padding: 0;
  }
  .gp-filters {
    max-width: 1200px; margin: 0 auto;
    padding: 0 2rem;
    display: flex; align-items: center;
    gap: 4px; overflow-x: auto;
    scrollbar-width: none;
  }
  .gp-filters::-webkit-scrollbar { display: none; }
  .gp-filter-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 14px 20px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    color: #8a6e3e; background: transparent;
    border: none; border-bottom: 3px solid transparent;
    cursor: pointer; white-space: nowrap;
    transition: color 0.2s, border-color 0.2s;
  }
  .gp-filter-btn:hover { color: #fe9a00; }
  .gp-filter-btn.active {
    color: #fe9a00;
    border-bottom-color: #fe9a00;
  }
  .gp-filter-count {
    background: #fff8ec; border: 1px solid #ffe0a8;
    color: #c97200; font-size: 10px; font-weight: 700;
    padding: 2px 7px; border-radius: 100px;
    transition: background 0.2s, color 0.2s;
  }
  .gp-filter-btn.active .gp-filter-count {
    background: #fe9a00; color: #ffffff; border-color: #fe9a00;
  }

  /* ── Gallery grid ── */
  .gp-main {
    max-width: 1200px; margin: 0 auto;
    padding: 40px 2rem 80px;
  }
  .gp-count-row {
    display: flex; align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .gp-count-text {
    font-size: 13px; color: #9c7a4a; font-weight: 500;
  }
  .gp-count-text span { color: #fe9a00; font-weight: 700; }

  .gp-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 220px;
    gap: 14px;
  }
  @media (max-width: 1024px) {
    .gp-grid {
      grid-template-columns: repeat(3, 1fr);
      grid-auto-rows: 200px;
    }
  }
  @media (max-width: 700px) {
    .gp-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-auto-rows: 180px;
    }
  }
  @media (max-width: 480px) {
    .gp-grid {
      grid-template-columns: 1fr;
      grid-auto-rows: 240px;
    }
  }

  .gp-item {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    background: #fff8ec;
    border: 1px solid #ffe0a8;
  }
  .gp-item.span-wide { grid-column: span 2; }
  .gp-item.span-tall { grid-row: span 2; }

  .gp-item-img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .gp-item:hover .gp-item-img { transform: scale(1.07); }

  /* Placeholder when no image */
  .gp-placeholder {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 10px; background: #fff8ec;
    color: #c9b08a;
  }
  .gp-placeholder svg {
    width: 32px; height: 32px;
    stroke: #fe9a0050; fill: none; stroke-width: 1.5;
  }
  .gp-placeholder span { font-size: 12px; color: #d4b87a; }

  /* Overlay */
  .gp-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(28,16,7,0.85) 0%, transparent 55%);
    opacity: 0;
    transition: opacity 0.3s;
    display: flex; flex-direction: column;
    justify-content: flex-end;
    padding: 18px;
  }
  .gp-item:hover .gp-overlay { opacity: 1; }

  .gp-overlay-cat {
    font-size: 9px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: #fe9a00; margin-bottom: 5px;
  }
  .gp-overlay-title {
    font-size: 13px; font-weight: 600;
    color: #ffffff; line-height: 1.4;
    margin-bottom: 10px;
  }
  .gp-overlay-zoom {
    display: inline-flex; align-items: center; gap: 5px;
    background: #fe9a00; color: #ffffff;
    font-size: 11px; font-weight: 700;
    padding: 5px 12px; border-radius: 100px;
    width: fit-content;
  }
  .gp-overlay-zoom svg { width: 12px; height: 12px; stroke: #ffffff; fill: none; stroke-width: 2.5; }

  /* Category badge top-right */
  .gp-cat-badge {
    position: absolute; top: 12px; right: 12px;
    font-size: 9px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase;
    padding: 4px 10px; border-radius: 100px;
    color: #ffffff;
  }

  /* Empty state */
  .gp-empty {
    grid-column: 1/-1;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 20px; gap: 14px;
    color: #9c7a4a;
  }
  .gp-empty svg { width: 48px; height: 48px; stroke: #ffe0a8; fill: none; stroke-width: 1.5; }
  .gp-empty-title { font-size: 18px; font-weight: 700; color: #1c1007; }
  .gp-empty-sub { font-size: 14px; color: #9c7a4a; }

  /* ── Lightbox ── */
  .gp-lb {
    position: fixed; inset: 0; z-index: 999;
    background: rgba(10, 6, 1, 0.95);
    display: flex; align-items: center; justify-content: center;
    animation: gp-lb-in 0.2s ease;
  }
  @keyframes gp-lb-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .gp-lb-close {
    position: fixed; top: 20px; right: 24px;
    width: 44px; height: 44px; border-radius: 50%;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s; z-index: 10;
    color: #ffffff;
  }
  .gp-lb-close:hover { background: rgba(254,154,0,0.3); }

  .gp-lb-arrow {
    position: fixed; top: 50%; transform: translateY(-50%);
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s; z-index: 10;
    color: #ffffff;
  }
  .gp-lb-arrow:hover { background: #fe9a00; border-color: #fe9a00; }
  .gp-lb-prev { left: 20px; }
  .gp-lb-next { right: 20px; }

  .gp-lb-content {
    display: flex; flex-direction: column;
    align-items: center; gap: 16px;
    max-width: 900px; width: 90%;
    padding: 0 72px;
  }
  .gp-lb-img-wrap {
    position: relative;
    width: 100%; border-radius: 16px;
    overflow: hidden; background: #1c1007;
    min-height: 300px; max-height: 70vh;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid rgba(254,154,0,0.2);
  }
  .gp-lb-img-wrap img {
    max-width: 100%; max-height: 70vh;
    object-fit: contain; display: block;
  }

  /* placeholder in lightbox */
  .gp-lb-ph {
    width: 100%; height: 400px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 14px; color: #6b5231;
  }
  .gp-lb-ph svg { width: 56px; height: 56px; stroke: #fe9a0040; fill: none; stroke-width: 1.2; }
  .gp-lb-ph span { font-size: 13px; color: #6b5231; }

  .gp-lb-info { text-align: center; }
  .gp-lb-cat {
    font-size: 10px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: #fe9a00; margin-bottom: 6px;
  }
  .gp-lb-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px; font-weight: 700; color: #fff8ec;
  }
  .gp-lb-counter {
    font-size: 12px; color: rgba(255,255,255,0.4);
    margin-top: 6px;
  }

  /* ── Animations ── */
  @keyframes gp-rise {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .gp-rise { opacity: 0; animation: gp-rise 0.5s ease forwards; }
  .gp-d1 { animation-delay: 0.05s; }
  .gp-d2 { animation-delay: 0.12s; }
  .gp-d3 { animation-delay: 0.20s; }

  @keyframes gp-item-in {
    from { opacity: 0; transform: scale(0.96) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .gp-item-anim {
    animation: gp-item-in 0.4s ease forwards;
    opacity: 0;
  }
`;

// ── Component ─────────────────────────────────────────────────────────────────
const GalleryPage = () => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered =
    activeFilter === "All"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeFilter);

  const getCount = (cat: FilterCategory) =>
    cat === "All"
      ? GALLERY_ITEMS.length
      : GALLERY_ITEMS.filter((i) => i.category === cat).length;

  const openLightbox = useCallback((idx: number) => {
    setLightboxIndex(idx);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = "";
  }, []);

  const prevItem = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i - 1 + filtered.length) % filtered.length : 0));
  }, [filtered.length]);

  const nextItem = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i + 1) % filtered.length : 0));
  }, [filtered.length]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") prevItem();
      if (e.key === "ArrowRight") nextItem();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, prevItem, nextItem, closeLightbox]);

  const currentItem = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="gp-wrap">

        {/* ── Breadcrumb ── */}
        <nav className="gp-bc">
          <div className="gp-bc-inner">
            <Link href="/" className="gp-bc-home">
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#fe9a00" strokeWidth={2}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </Link>
            <span className="gp-bc-sep"><ChevronRight size={14} color="#d4b87a" /></span>
            <span className="gp-bc-cur">Gallery</span>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="gp-hero">
          <div className="gp-hero-pattern" />
          <div className="gp-hero-inner">
            <div className="gp-badge gp-rise gp-d1">
              <span className="gp-badge-dot" />
              Our Gallery
            </div>
            <h1 className="gp-h1 gp-rise gp-d2">
              Life at <span>Career Kendra</span>
            </h1>
            <p className="gp-sub gp-rise gp-d3">
              A glimpse into our offices, events, team moments, and milestones
              that make Career Kendra the place we are proud to build every day.
            </p>
          </div>
        </section>

        {/* ── Sticky Filter Bar ── */}
        <div className="gp-filters-wrap">
          <div className="gp-filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`gp-filter-btn${activeFilter === f ? " active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
                <span className="gp-filter-count">{getCount(f)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Gallery Grid ── */}
        <main className="gp-main">
          <div className="gp-count-row">
            <p className="gp-count-text">
              Showing <span>{filtered.length}</span> of {GALLERY_ITEMS.length} photos
            </p>
          </div>

          <div className="gp-grid">
            {filtered.length === 0 && (
              <div className="gp-empty">
                <Images />
                <div className="gp-empty-title">No photos found</div>
                <div className="gp-empty-sub">Try a different category filter</div>
              </div>
            )}

            {filtered.map((item, idx) => (
              <div
                key={item.id}
                className={`gp-item gp-item-anim${item.span === "wide" ? " span-wide" : ""}${item.span === "tall" ? " span-tall" : ""}`}
                style={{ animationDelay: `${idx * 0.04}s` }}
                onClick={() => openLightbox(idx)}
                role="button"
                tabIndex={0}
                aria-label={`View ${item.title}`}
                onKeyDown={(e) => e.key === "Enter" && openLightbox(idx)}
              >
                {/* Category badge */}
                <span
                  className="gp-cat-badge"
                  style={{ background: CATEGORY_COLORS[item.category] ?? "#fe9a00" }}
                >
                  {item.category}
                </span>

                {/* Image — replace with next/image in production */}
                <div className="gp-placeholder">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>{item.title}</span>
                </div>

                {/* Hover overlay */}
                <div className="gp-overlay">
                  <div className="gp-overlay-cat">{item.category}</div>
                  <div className="gp-overlay-title">{item.title}</div>
                  <div className="gp-overlay-zoom">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                    View Photo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* ── Lightbox ── */}
        {lightboxIndex !== null && currentItem && (
          <div className="gp-lb" onClick={closeLightbox}>

            {/* Close */}
            <button className="gp-lb-close" onClick={closeLightbox} aria-label="Close">
              <X size={20} />
            </button>

            {/* Prev */}
            <button
              className="gp-lb-arrow gp-lb-prev"
              onClick={(e) => { e.stopPropagation(); prevItem(); }}
              aria-label="Previous"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Content */}
            <div className="gp-lb-content" onClick={(e) => e.stopPropagation()}>
              <div className="gp-lb-img-wrap">
                {/* 
                  Replace the placeholder div below with:
                  <Image
                    src={currentItem.src}
                    alt={currentItem.alt}
                    fill
                    className="object-contain"
                    priority
                  />
                */}
                <div className="gp-lb-ph">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>{currentItem.alt}</span>
                </div>
              </div>

              <div className="gp-lb-info">
                <div className="gp-lb-cat">{currentItem.category}</div>
                <div className="gp-lb-title">{currentItem.title}</div>
                <div className="gp-lb-counter">
                  {lightboxIndex + 1} / {filtered.length}
                </div>
              </div>
            </div>

            {/* Next */}
            <button
              className="gp-lb-arrow gp-lb-next"
              onClick={(e) => { e.stopPropagation(); nextItem(); }}
              aria-label="Next"
            >
              <ChevronRightIcon size={22} />
            </button>

          </div>
        )}

      </div>
    </>
  );
};

export default GalleryPage;