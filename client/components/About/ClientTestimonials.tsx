'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Star, Quote, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Rahul Sharma",
    position: "HR Manager",
    company: "TechNova Solutions Pvt Ltd",
    avatar: "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    rating: 5,
    tag: "HIRING",
    text: "Career Kendra has completely simplified our hiring process. We were able to connect with qualified candidates quickly and fill multiple positions without any hassle. Highly efficient platform for recruiters.",
  },
  {
    id: 2,
    name: "Priya Mehta",
    position: "HR Head",
    company: "Global HealthCare Ltd",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    rating: 5,
    tag: "RECRUITMENT",
    text: "The platform is very easy to use and provides access to a wide pool of candidates. We have successfully hired multiple professionals through Career Kendra in a short time.",
  },
  {
    id: 3,
    name: "Vikram Singh",
    position: "Job Seeker",
    company: "Placed at InfraBuild Constructions",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    rating: 5,
    tag: "JOB SEEKER",
    text: "I found my job through Career Kendra within just a few weeks. The application process was simple, and I received interview calls quickly. Great platform for job seekers.",
  },
  {
    id: 4,
    name: "Anjali Kapoor",
    position: "Talent Acquisition Lead",
    company: "FinSecure Bank",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    rating: 5,
    tag: "EFFICIENCY",
    text: "Career Kendra helped us reduce our hiring time significantly. The quality of applications and the filtering system made it easy to shortlist the right candidates.",
  },
  {
    id: 5,
    name: "Arjun Reddy",
    position: "Employer",
    company: "NextGen Manufacturing",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    rating: 5,
    tag: "TRUST",
    text: "We’ve been using Career Kendra regularly for hiring across departments. It’s reliable, easy to manage, and consistently delivers good candidate matches.",
  },
  {
  id: 6,
  name: "Sneha Verma",
  position: "Fresher",
  company: "Placed at Startup",
  rating: 5,
  tag: "FRESHER",
  text: "As a fresher, it was difficult to find the right opportunity. Career Kendra made it easy by showing relevant jobs and helping me apply quickly.",
}
];

// ── Styles ────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* ── Section ── */
  .ct-section {
    position: relative;
    width: 100%;
    padding: 5.5rem 0 6rem;
    // background: #F1F5F9;
    overflow: hidden;
    // font-family: 'DM Sans', sans-serif;
  }

  /* Dot grid — same as WhyChooseUs */
  .ct-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(99,102,241,0.14) 1px, transparent 1px);
    background-size: 30px 30px;
    pointer-events: none;
    z-index: 0;
  }

  /* ── Blobs ── */
  .ct-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(90px);
    z-index: 0;
  }
  .ct-blob-1 {
    width: 560px; height: 560px;
    top: -200px; left: -160px;
    background: #fff8ec;
  }
  .ct-blob-2 {
    width: 400px; height: 400px;
    bottom: -120px; right: -100px;
    background: #fff8ec;
  }
  .ct-blob-3 {
    width: 260px; height: 260px;
    top: 40%; right: 30%;
    background: #fff8ec;
  }

  /* ── Container ── */
  .ct-container {
    position: relative;
    z-index: 10;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  @media (min-width: 640px)  { .ct-container { padding: 0 2rem; } }
  @media (min-width: 1024px) { .ct-container { padding: 0 3rem; } }

  /* ── Header ── */
  .ct-header {
    max-width: 640px;
    margin: 0 auto 4rem;
    text-align: center;
  }

  .ct-eyebrow {
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

  .ct-heading {
    // font-family: 'Syne', sans-serif;
    font-size: clamp(2.1rem, 4.5vw, 3rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.03em;
    color: #0F172A;
    margin-bottom: 1rem;
  }
  .ct-heading-accent {
    background: linear-gradient(135deg, #fe9a00 0%, #fe9a00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ct-heading-underline {
    position: relative;
    display: inline-block;
  }
  // .ct-heading-underline::after {
  //   content: '';
  //   position: absolute;
  //   left: 0; bottom: -5px;
  //   width: 100%; height: 3px;
  //   background: #F59E0B;
  //   border-radius: 2px;
  // }

  .ct-subtext {
    font-size: 1rem;
    line-height: 1.75;
    color: #64748B;
    font-weight: 300;
  }

  /* ── Carousel track ── */
  .ct-carousel-wrap {
    position: relative;
    overflow: hidden;
  }

  .ct-track {
    display: flex;
    gap: 1.25rem;
    transition: transform 0.5s cubic-bezier(.4,0,.2,1);
    will-change: transform;
  }

  /* ── Card ── */
  .ct-card {
    position: relative;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 1.4rem;
    padding: 2rem 2rem 1.75rem;
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
  }
  .ct-card::before {
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
  .ct-card:hover {
    border-color: #fe9a00;
    box-shadow: 0 18px 48px rgba(99,102,241,0.13);
    transform: translateY(-4px);
  }
  .ct-card:hover::before { transform: scaleY(1); }

  /* Card index watermark */
  .ct-card-num {
    position: absolute;
    bottom: 1rem;
    right: 1.5rem;
    // font-family: 'Syne', sans-serif;
    font-size: 4rem;
    font-weight: 800;
    color: #fff8ec;
    line-height: 1;
    pointer-events: none;
    transition: color 0.3s;
    user-select: none;
  }
  .ct-card:hover .ct-card-num { color: rgba(254, 154, 0, 0.08); }

  /* Quote icon */
  .ct-quote-wrap {
    width: 44px; height: 44px;
    border-radius: 0.875rem;
    background: linear-gradient(135deg, #fff8ec, #fff8ec);
    border: 1px solid #fe9a00;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.25rem;
    flex-shrink: 0;
    transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
  }
  .ct-card:hover .ct-quote-wrap {
    background: linear-gradient(135deg, #fe9a00, #fe9a00);
    border-color: #fe9a00;
    box-shadow: 0 6px 20px #fff8ec;
  }

  /* Tag */
  .ct-card-tag {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #fe9a00;
    text-transform: uppercase;
    margin-bottom: 0.75rem;
  }

  /* Text */
  .ct-card-text {
    font-size: 0.9rem;
    color: #475569;
    line-height: 1.75;
    font-weight: 300;
    flex-grow: 1;
    margin-bottom: 1.5rem;
    font-style: italic;
  }

  /* Divider */
  .ct-card-divider {
    height: 1px;
    background: #E2E8F0;
    margin-bottom: 1.25rem;
    border: none;
  }

  /* Author */
  .ct-author {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }
  .ct-avatar-wrap {
    position: relative;
    width: 52px; height: 52px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #E0E7FF;
    flex-shrink: 0;
    transition: border-color 0.3s;
  }
  .ct-card:hover .ct-avatar-wrap { border-color: #A5B4FC; }

  .ct-author-info {}
  .ct-author-name {
    // font-family: 'Syne', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    color: #0F172A;
    margin-bottom: 0.15rem;
    line-height: 1.3;
    transition: color 0.3s;
  }
  .ct-card:hover .ct-author-name { color: #fe9a00; }

  .ct-author-role {
    font-size: 0.78rem;
    color: #64748B;
    font-weight: 400;
    line-height: 1.4;
  }

  .ct-stars {
    display: flex;
    gap: 2px;
    margin-top: 0.3rem;
  }

  /* ── Navigation ── */
  .ct-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2.5rem;
  }

  .ct-nav-btn {
    width: 44px; height: 44px;
    border-radius: 0.875rem;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fe9a00;
    transition: background 0.25s, border-color 0.25s, box-shadow 0.25s, transform 0.2s;
    box-shadow: 0 2px 8px rgba(99,102,241,0.06);
  }
  .ct-nav-btn:hover {
    background: #fe9a00;
    border-color: #fff8ec;
    color: #fff;
    box-shadow: 0 8px 24px rgba(99,102,241,0.3);
    transform: translateY(-1px);
  }
  .ct-nav-btn:active { transform: scale(0.95); }
  .ct-nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  /* Dots */
  .ct-dots {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .ct-dot {
    width: 8px; height: 8px;
    border-radius: 999px;
    background: #fff8ec;
    transition: background 0.3s, width 0.3s;
    cursor: pointer;
    border: none;
    padding: 0;
  }
  .ct-dot.active {
    background: #fe9a00;
    width: 24px;
  }

  /* ── Staggered entrance ── */
  @keyframes ct-rise {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ct-rise { opacity: 0; animation: ct-rise 0.6s ease forwards; }
  .ct-rise-1 { animation-delay: 0.05s; }
  .ct-rise-2 { animation-delay: 0.15s; }
  .ct-rise-3 { animation-delay: 0.25s; }
  .ct-rise-4 { animation-delay: 0.40s; }
  .ct-rise-5 { animation-delay: 0.55s; }
`;

// ── Helper: how many cards fit at current width ──────────────────────────────
function getVisibleCount() {
  if (typeof window === 'undefined') return 1;
  if (window.innerWidth >= 1280) return 3;
  if (window.innerWidth >= 768)  return 2;
  return 1;
}

const CARD_WIDTH_PCT  = { 1: 100, 2: 48.5, 3: 31.8 }; // approximate % per card
const GAP_PX = 20;

const ClientTestimonials: React.FC = () => {
  const [activeIndex, setActiveIndex]   = useState(0);
  const [hoveredCard, setHoveredCard]   = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(1);
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);

  // Update visible count on resize
  useEffect(() => {
    const update = () => setVisibleCount(getVisibleCount());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = testimonials.length - visibleCount;

  const goTo = useCallback((idx: number) => {
    setActiveIndex(Math.max(0, Math.min(idx, maxIndex)));
  }, [maxIndex]);

  // Auto-advance
  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, 5500);
    return () => clearInterval(id);
  }, [maxIndex]);

  // Compute card width from wrapper
  const [cardWidth, setCardWidth] = useState(300);
  useEffect(() => {
    const measure = () => {
      if (!wrapRef.current) return;
      const totalGap = (visibleCount - 1) * GAP_PX;
      setCardWidth((wrapRef.current.offsetWidth - totalGap) / visibleCount);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [visibleCount]);

  const translateX = activeIndex * (cardWidth + GAP_PX);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <section id="clients" className="ct-section">
        {/* Blobs */}
        <div className="ct-blob ct-blob-1" />
        <div className="ct-blob ct-blob-2" />
        <div className="ct-blob ct-blob-3" />

        <div className="ct-container">

          {/* ── Header ── */}
          <div className="ct-header">
            <div className="ct-eyebrow ct-rise ct-rise-1">
              <Sparkles size={11} />
              Client Stories
            </div>

            <h2 className="ct-heading ct-rise ct-rise-2">
              What Our{" "}
              <span className="ct-heading-underline">
                <span className="ct-heading-accent">Clients Say</span>
              </span>
            </h2>

            <p className="ct-subtext ct-rise ct-rise-3">
              Trusted by leading organisations across industries for reliable,
              high-impact HR and staffing solutions.
            </p>
          </div>

          {/* ── Carousel ── */}
          <div className="ct-carousel-wrap ct-rise ct-rise-4" ref={wrapRef}>
            <div
              ref={trackRef}
              className="ct-track"
              style={{ transform: `translateX(-${translateX}px)` }}
            >
              {testimonials.map((t, index) => {
                const isHovered = hoveredCard === index;
                return (
                  <div
                    key={t.id}
                    className="ct-card"
                    style={{ width: cardWidth }}
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Ghost number */}
                    <div className="ct-card-num">0{t.id}</div>

                    {/* Quote icon */}
                    <div className="ct-quote-wrap">
                      <Quote
                        size={18}
                        style={{
                          color: isHovered ? '#fff' : '#fe9a00',
                          transition: 'color 0.3s',
                        }}
                      />
                    </div>

                    {/* Tag */}
                    <div className="ct-card-tag">{t.tag}</div>

                    {/* Text */}
                    <p className="ct-card-text">"{t.text}"</p>

                    {/* Divider */}
                    <hr className="ct-card-divider" />

                    {/* Author */}
                    <div className="ct-author">
                      <div className="ct-avatar-wrap">
                        <Image
                          src={t.avatar}
                          alt={`${t.name} photo`}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div className="ct-author-info">
                        <div className="ct-author-name">{t.name}</div>
                        <div className="ct-author-role">
                          {t.position}, {t.company}
                        </div>
                        <div className="ct-stars">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              style={{ color: '#F59E0B', fill: '#F59E0B' }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Navigation ── */}
          <div className="ct-nav ct-rise ct-rise-5">
            <button
              className="ct-nav-btn"
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="ct-dots">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  className={`ct-dot${activeIndex === i ? ' active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              className="ct-nav-btn"
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex >= maxIndex}
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>

        </div>
      </section>
    </>
  );
};

export default ClientTestimonials;