"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ArrowRight, TrendingUp, CheckCircle, Zap, ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import axiosInstance from "@/lib/user_axios";

type Service = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  image: string;
};

// ── Scoped styles ──────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* ── Section shell ── */
  .ts-section {
    position: relative;
    width: 100%;
    padding: 5.5rem 0 6rem;
    // background: #F1F5F9;
    overflow: hidden;
    // font-family: 'DM Sans', sans-serif;
  }

  /* ── Dot-grid bg ── */
  .ts-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(99,102,241,0.14) 1px, transparent 1px);
    background-size: 30px 30px;
    pointer-events: none;
    z-index: 0;
  }

  /* ── Ambient blobs ── */
  .ts-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(90px);
    z-index: 0;
  }
  .ts-blob-1 {
    width: 520px; height: 520px;
    top: -200px; right: -140px;
    background: #fff8ec;
  }
  .ts-blob-2 {
    width: 380px; height: 380px;
    bottom: -100px; left: -80px;
    background: rgba(245,158,11,0.10);
  }

  /* ── Container ── */
  .ts-container {
    position: relative;
    z-index: 10;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  @media (min-width: 640px)  { .ts-container { padding: 0 2rem; } }
  @media (min-width: 1024px) { .ts-container { padding: 0 3rem; } }

  /* ── Header ── */
  .ts-header {
    text-align: center;
    margin-bottom: 3.5rem;
  }

  .ts-eyebrow {
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

  .ts-heading {
    // font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 4.5vw, 3rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.03em;
    color: #0F172A;
    margin-bottom: 1rem;
  }
  .ts-heading-accent {
    background: linear-gradient(135deg, #fe9a00 0%, #fe9a00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .ts-subtext {
    font-size: 1rem;
    line-height: 1.75;
    color: #64748B;
    font-weight: 300;
    max-width: 36rem;
    margin: 0 auto 2rem;
  }

  /* Trust pills row */
  .ts-trust-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.65rem;
  }
  .ts-trust-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: #475569;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    padding: 0.4rem 1rem;
    border-radius: 999px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  .ts-trust-pill svg { color: #6366F1; }

  /* ── Carousel wrapper ── */
  .ts-carousel-wrap {
    position: relative;
  }

  /* ── Swiper override ── */
  .ts-swiper { padding-bottom: 3rem !important; }

  /* ── Card ── */
  .ts-card {
    position: relative;
    border-radius: 1.5rem;
    overflow: hidden;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    box-shadow: 0 4px 20px rgba(15,23,42,0.07);
    cursor: pointer;
    transition: border-color 0.35s, box-shadow 0.35s, transform 0.35s;
    display: block;
    height: 420px;
  }
  @media (max-width: 768px) { .ts-card { height: 360px; } }
  .ts-card:hover {
    border-color: #C7D2FE;
    box-shadow: 0 20px 56px rgba(99,102,241,0.18);
    transform: translateY(-4px);
  }

  /* Image layer */
  .ts-card-img {
    position: absolute;
    inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.7s ease, opacity 0.4s;
    opacity: 0.92;
  }
  .ts-card:hover .ts-card-img {
    transform: scale(1.06);
    opacity: 1;
  }

  /* Gradient overlay */
  .ts-card-overlay {
    position: absolute;
    inset: 0;
    background: #00000096;
    transition: opacity 0.4s;
  }
  .ts-card:hover .ts-card-overlay {
    background: linear-gradient(
      to top,
      rgba(15,23,42,0.96) 0%,
      rgba(15,23,42,0.65) 45%,
      rgba(99,102,241,0.25) 100%
    );
  }

  /* Top accent line */
  .ts-card-topline {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #6366F1, #818CF8, #A78BFA);
    opacity: 0;
    transition: opacity 0.4s;
    z-index: 5;
  }
  .ts-card:hover .ts-card-topline { opacity: 1; }

  /* Badge */
  .ts-card-badge {
    position: absolute;
    top: 1rem; right: 1rem;
    z-index: 10;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    background: #fff8ec;
    border: 1px solid #fe9a00;
    color: #fe9a00;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    backdrop-filter: blur(8px);
  }
  .ts-card-badge svg { color: #fe9a00; }

  /* Card content */
  .ts-card-content {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 1.75rem;
    z-index: 10;
  }

  .ts-card-title {
    // font-family: 'Syne', sans-serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: #F8FAFC;
    margin-bottom: 0.5rem;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .ts-card-desc {
    font-size: 0.85rem;
    color: rgba(248,250,252,0.72);
    line-height: 1.6;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: -webkit-line-clamp 0.3s;
  }
  .ts-card:hover .ts-card-desc { -webkit-line-clamp: 3; }

  .ts-card-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: #fe9a00;
    transition: gap 0.25s, color 0.25s;
  }
  .ts-card:hover .ts-card-cta { gap: 0.65rem; color: #A5B4FC; }
  .ts-card-cta svg { transition: transform 0.25s; }
  .ts-card:hover .ts-card-cta svg { transform: translateX(3px); }

  /* ── Navigation buttons ── */
  .ts-nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(calc(-50% - 1.5rem));
    z-index: 20;
    width: 44px; height: 44px;
    border-radius: 0.875rem;
    background: #FFFFFF;
    border: 1.5px solid #E2E8F0;
    box-shadow: 0 4px 16px rgba(15,23,42,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #475569;
    transition: border-color 0.2s, background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.2s;
  }
  .ts-nav-btn:hover {
    border-color: #6366F1;
    background: #6366F1;
    color: #fff;
    box-shadow: 0 6px 20px rgba(99,102,241,0.35);
    transform: translateY(calc(-50% - 1.5rem)) scale(1.06);
  }
  .ts-nav-prev { left: -1.5rem; }
  .ts-nav-next { right: -1.5rem; }
  @media (max-width: 768px) {
    .ts-nav-prev { left: -0.5rem; }
    .ts-nav-next { right: -0.5rem; }
  }

  /* ── Pagination ── */
  .ts-pagination {
    display: flex;
    justify-content: center;
    gap: 0.4rem;
    margin-top: 0.5rem;
  }

  :global(.ts-pagination .swiper-pagination-bullet) {
    width: 8px;
    height: 8px;
    background: #CBD5E1;
    opacity: 1;
    transition: all 0.3s;
    border-radius: 999px;
  }
  :global(.ts-pagination .swiper-pagination-bullet-active) {
    background: #6366F1;
    width: 28px;
  }

  /* ── Loading skeleton ── */
  .ts-skeleton-section {
    background: #F1F5F9;
    padding: 5rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 1rem;
  }
  .ts-spinner {
    width: 36px; height: 36px;
    border: 3px solid #C7D2FE;
    border-top-color: #6366F1;
    border-radius: 50%;
    animation: ts-spin 0.8s linear infinite;
  }
  @keyframes ts-spin { to { transform: rotate(360deg); } }
  .ts-spinner-label { font-size: 0.9rem; color: #64748B; // font-family: 'DM Sans', sans-serif; }

  /* ── Staggered entrance ── */
  @keyframes ts-rise {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ts-rise { opacity: 0; animation: ts-rise 0.6s ease forwards; }
  .ts-rise-1 { animation-delay: 0.05s; }
  .ts-rise-2 { animation-delay: 0.15s; }
  .ts-rise-3 { animation-delay: 0.25s; }
  .ts-rise-4 { animation-delay: 0.38s; }
`;

const TrendingServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchTrendingServices = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/services");
        const activeServices = res.data.data
          ?.filter((s: any) => s.status === "active")
          ?.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
          ?.slice(0, 8);
        setServices(activeServices || []);
      } catch (error) {
        console.error("Failed to fetch trending services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrendingServices();
  }, []);

  // ── Loading state ──
  if (loading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
        <section className="ts-skeleton-section">
          <div className="ts-spinner" />
          <span className="ts-spinner-label">Loading services…</span>
        </section>
      </>
    );
  }

  if (services.length === 0) return null;

  // ── Main render ──
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <section className="ts-section">
        {/* Blobs */}
        <div className="ts-blob ts-blob-1" />
        <div className="ts-blob ts-blob-2" />

        <div className="ts-container">

          {/* ── Header ── */}
          <div className="ts-header">
            <div className="ts-eyebrow ts-rise ts-rise-1">
              <TrendingUp size={11} />
              Featured Solutions
            </div>

            <h2 className="ts-heading ts-rise ts-rise-2">
              <span className="ts-heading-accent">In-Demand</span> Services
            </h2>

            <p className="ts-subtext ts-rise ts-rise-3">
              Access premium talent solutions that drive business growth — curated
              professionals ready to accelerate your success.
            </p>

            {/* Trust pills */}
            <div className="ts-trust-row ts-rise ts-rise-4">
              {["Vetted Professionals", "Fast Placement", "24/7 Support"].map((label) => (
                <div key={label} className="ts-trust-pill">
                  <CheckCircle size={13} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Carousel ── */}
          <div className="ts-carousel-wrap ts-rise ts-rise-4">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              loop
              autoplay={{ delay: 5000, disableOnInteraction: true }}
              navigation={{
                nextEl: ".ts-nav-next",
                prevEl: ".ts-nav-prev",
              }}
              pagination={{
                el: ".ts-pagination",
                clickable: true,
                dynamicBullets: true,
              }}
              breakpoints={{
                320:  { slidesPerView: 1,   spaceBetween: 20 },
                640:  { slidesPerView: 1.5, spaceBetween: 20 },
                768:  { slidesPerView: 2,   spaceBetween: 24 },
                1024: { slidesPerView: 3,   spaceBetween: 28 },
              }}
              className="ts-swiper"
            >
              {services.map((service) => (
                <SwiperSlide key={service.id}>
                  <Link href={`/services/${service.slug}`}>
                    <div className="ts-card">
                      {/* Top accent line */}
                      <div className="ts-card-topline" />

                      {/* Image */}
                      <img
                        src={service.image}
                        alt={service.title}
                        className="ts-card-img"
                      />

                      {/* Overlay */}
                      <div className="ts-card-overlay" />

                      {/* Badge */}
                      <div className="ts-card-badge">
                        <Zap size={10} />
                        In Demand
                      </div>

                      {/* Content */}
                      <div className="ts-card-content">
                        <h3 className="ts-card-title">{service.title}</h3>
                        <p className="ts-card-desc">{service.shortDescription}</p>
                        <div className="ts-card-cta">
                          <span>Learn More</span>
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Nav buttons */}
            <button className="ts-nav-btn ts-nav-prev" aria-label="Previous slide">
              <ChevronLeft size={18} />
            </button>
            <button className="ts-nav-btn ts-nav-next" aria-label="Next slide">
              <ChevronRight size={18} />
            </button>

            {/* Pagination */}
            <div className="ts-pagination" />
          </div>

        </div>
      </section>
    </>
  );
};

export default TrendingServices;