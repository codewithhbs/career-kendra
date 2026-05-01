"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  Clock,
  Home,
  ChevronRight,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import axiosInstance from "@/lib/user_axios";
import { useSettings } from "@/hooks/useSettings";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const STYLES = `

  .cp-wrap {
    background: #ffffff;
    color: #1c1007;
    min-height: 100vh;
  }

  /* ── Breadcrumb ── */
  .cp-breadcrumb {
    background: #fff8ec;
    border-bottom: 1px solid #ffe0a8;
    padding: 13px 0;
  }
  .cp-bc-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    gap: 0;
  }
  .cp-bc-home {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #fe9a00;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;
  }
  .cp-bc-home:hover { color: #d97f00; }
  .cp-bc-home svg { width: 14px; height: 14px; stroke: #fe9a00; fill: none; stroke-width: 2; }
  .cp-bc-sep { margin: 0 10px; color: #d4b87a; font-size: 13px; display: flex; align-items: center; }
  .cp-bc-cur { font-size: 13px; color: #1c1007; font-weight: 600; }

  /* ── Hero ── */
  .cp-hero {
    background: #fff8ec;
    padding: 60px 2rem 52px;
    border-bottom: 1px solid #ffe0a8;
    text-align: center;
  }
  .cp-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #fe9a0015;
    border: 1px solid #fe9a0040;
    color: #c97200;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 6px 18px;
    border-radius: 100px;
    margin-bottom: 20px;
  }
  .cp-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #fe9a00;
    animation: cp-pulse 2s ease-in-out infinite;
  }
  @keyframes cp-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.85); }
  }
  .cp-hero-h1 {
    // font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 4vw, 52px);
    font-weight: 900;
    color: #1c1007;
    line-height: 1.1;
    margin-bottom: 16px;
  }
  .cp-hero-h1 span { color: #fe9a00; }
  .cp-hero-p {
    font-size: 16px;
    color: #6b5231;
    line-height: 1.8;
    max-width: 500px;
    margin: 0 auto 36px;
  }
  .cp-hero-stats {
    display: flex;
    gap: 0;
    justify-content: center;
    max-width: 440px;
    margin: 0 auto;
  }
  .cp-hstat { flex: 1; text-align: center; padding: 0 20px; }
  .cp-hstat + .cp-hstat { border-left: 1px solid #ffe0a8; }
  .cp-hstat-n {
    // font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700; color: #fe9a00;
  }
  .cp-hstat-l { font-size: 11px; color: #9c7a4a; font-weight: 500; margin-top: 3px; }

  /* ── Main layout ── */
  .cp-main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 56px 2rem 80px;
  }
  .cp-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    align-items: start;
  }
  @media (max-width: 900px) {
    .cp-grid { grid-template-columns: 1fr; }
  }

  /* ── Cards ── */
  .cp-card {
    background: #ffffff;
    border: 1px solid #ffe0a8;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    transition: border-color 0.3s;
  }
  .cp-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: #fe9a00;
    border-radius: 2px;
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 0.4s cubic-bezier(.34,1.56,.64,1);
  }
  .cp-card:hover { border-color: #fe9a0080; }
  .cp-card:hover::before { transform: scaleY(1); }

  /* ── Info card ── */
  .cp-info-body { padding: 32px; }
  .cp-card-eyebrow {
    font-size: 10px; font-weight: 700;
    letter-spacing: 2.5px; color: #fe9a00;
    text-transform: uppercase; margin-bottom: 6px;
  }
  .cp-card-title {
    // font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700;
    color: #1c1007; margin-bottom: 28px;
    line-height: 1.2;
  }
  .cp-card-title span { color: #fe9a00; }

  /* Contact items */
  .cp-contact-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #fff0d4;
  }
  .cp-contact-item:last-child { border-bottom: none; padding-bottom: 0; }
  .cp-ci-icon {
    width: 46px; height: 46px;
    border-radius: 12px;
    background: #fff8ec;
    border: 1px solid #ffe0a8;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: background 0.3s, border-color 0.3s;
  }
  .cp-card:hover .cp-ci-icon {
    background: #fe9a0015;
    border-color: #fe9a0060;
  }
  .cp-ci-icon svg { width: 18px; height: 18px; stroke: #fe9a00; fill: none; stroke-width: 2; }
  .cp-ci-label {
    font-size: 10px; font-weight: 700;
    letter-spacing: 2px; color: #c9983a;
    text-transform: uppercase; margin-bottom: 4px;
  }
  .cp-ci-value {
    font-size: 14px; font-weight: 600;
    color: #1c1007; text-decoration: none;
    transition: color 0.2s;
    line-height: 1.5;
  }
  a.cp-ci-value:hover { color: #fe9a00; }
  .cp-ci-sub {
    font-size: 12px; color: #9c7a4a;
    font-weight: 400; margin-top: 2px;
  }

  /* Map */
  .cp-map {
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid #ffe0a8;
    height: 220px;
    background: #fff8ec;
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cp-map-placeholder {
    text-align: center;
    color: #c9983a;
  }
  .cp-map-placeholder svg { width: 32px; height: 32px; stroke: #fe9a00; fill: none; stroke-width: 1.5; margin-bottom: 8px; }
  .cp-map-placeholder p { font-size: 13px; color: #9c7a4a; }
  .cp-map iframe { display: block; width: 100%; height: 100%; border: none; }

  /* ── Form card ── */
  .cp-form-body { padding: 32px; }

  .cp-form { display: flex; flex-direction: column; gap: 16px; }

  .cp-field { display: flex; flex-direction: column; gap: 6px; }
  .cp-field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  @media (max-width: 500px) { .cp-field-row { grid-template-columns: 1fr; } }

  .cp-label {
    font-size: 11px; font-weight: 700;
    letter-spacing: 1.5px; color: #8a6e3e;
    text-transform: uppercase;
  }
  .cp-input, .cp-textarea, .cp-select {
    width: 100%;
    padding: 11px 14px;
    border-radius: 12px;
    border: 1px solid #ffe0a8;
    background: #fff8ec;
    // font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    color: #1c1007;
    font-weight: 400;
    outline: none;
    transition: border-color 0.25s, background 0.25s;
    box-sizing: border-box;
    appearance: none;
  }
  .cp-input::placeholder, .cp-textarea::placeholder { color: #c9b08a; }
  .cp-input:focus, .cp-textarea:focus, .cp-select:focus {
    border-color: #fe9a00;
    background: #ffffff;
  }
  .cp-textarea { resize: none; }

  /* Submit */
  .cp-submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 13px 2rem;
    border-radius: 12px;
    background: #fe9a00;
    color: #ffffff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
    margin-top: 4px;
  }
  .cp-submit:hover:not(:disabled) { transform: translateY(-2px); opacity: 0.92; }
  .cp-submit:active:not(:disabled) { transform: scale(0.98); }
  .cp-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .cp-submit svg { width: 16px; height: 16px; stroke: #ffffff; fill: none; stroke-width: 2; transition: transform 0.2s; }
  .cp-submit:hover:not(:disabled) svg { transform: translateX(3px); }

  .cp-privacy {
    text-align: center;
    font-size: 12px;
    color: #b8956a;
    font-weight: 400;
    margin-top: 4px;
  }

  /* Error */
  .cp-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    color: #dc2626;
    text-align: center;
  }

  /* Success */
  .cp-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 48px 32px;
    gap: 12px;
  }
  .cp-success-icon {
    width: 68px; height: 68px;
    border-radius: 50%;
    background: #fff8ec;
    border: 2px solid #fe9a00;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 8px;
  }
  .cp-success-icon svg { width: 30px; height: 30px; stroke: #fe9a00; fill: none; stroke-width: 2; }
  .cp-success-title {
    // font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700; color: #1c1007;
  }
  .cp-success-sub {
    font-size: 14px; color: #8a6e3e;
    line-height: 1.7; max-width: 280px;
  }
  .cp-success-btn {
    margin-top: 8px;
    padding: 10px 28px;
    border-radius: 100px;
    background: #fe9a00;
    color: #ffffff;
    // font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 700;
    border: none; cursor: pointer;
    transition: opacity 0.2s;
  }
  .cp-success-btn:hover { opacity: 0.85; }

  /* ── Rise animation ── */
  @keyframes cp-rise {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cp-rise { opacity: 0; animation: cp-rise 0.55s ease forwards; }
  .cp-d1 { animation-delay: 0.05s; }
  .cp-d2 { animation-delay: 0.12s; }
  .cp-d3 { animation-delay: 0.20s; }
  .cp-d4 { animation-delay: 0.30s; }
  .cp-d5 { animation-delay: 0.40s; }

  /* ── Loading skeleton ── */
  .cp-loading {
    display: flex; align-items: center; justify-content: center;
    min-height: 400px;
    color: #9c7a4a; font-size: 15px; gap: 10px;
  }
  .cp-spinner {
    width: 20px; height: 20px;
    border: 2px solid #ffe0a8;
    border-top-color: #fe9a00;
    border-radius: 50%;
    animation: cp-spin 0.7s linear infinite;
  }
  @keyframes cp-spin { to { transform: rotate(360deg); } }
`;

// ── Page Component ────────────────────────────────────────────────────────────
const ContactPage = () => {
  const { settings, loading, fetchSettings } = useSettings();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!settings) fetchSettings();
  }, [fetchSettings, settings]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await axiosInstance.post("/contact", formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setError("Failed to send your message. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const info = settings || {};

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="cp-wrap">

        {/* ── Breadcrumb ── */}
        <nav className="cp-breadcrumb">
          <div className="cp-bc-inner">
            <Link href="/" className="cp-bc-home">
              <svg viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </Link>
            <span className="cp-bc-sep">
              <ChevronRight size={14} color="#d4b87a" />
            </span>
            <span className="cp-bc-cur">Contact Us</span>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="cp-hero">
          <div className="cp-badge cp-rise cp-d1">
            <span className="cp-badge-dot" />
            Get In Touch
          </div>
          <h1 className="cp-hero-h1 cp-rise cp-d2">
            We Are Here <span>to Help You</span>
          </h1>
          <p className="cp-hero-p cp-rise cp-d3">
            Whether you are a job seeker exploring opportunities or an employer looking for top
            talent — our team is ready to assist you every step of the way.
          </p>
          <div className="cp-hero-stats cp-rise cp-d4">
            <div className="cp-hstat">
              <div className="cp-hstat-n">24h</div>
              <div className="cp-hstat-l">Response Time</div>
            </div>
            <div className="cp-hstat">
              <div className="cp-hstat-n">98%</div>
              <div className="cp-hstat-l">Satisfaction Rate</div>
            </div>
            <div className="cp-hstat">
              <div className="cp-hstat-n">Mon–Fri</div>
              <div className="cp-hstat-l">Available</div>
            </div>
          </div>
        </section>

        {/* ── Main content ── */}
        {loading ? (
          <div className="cp-loading">
            <div className="cp-spinner" />
            Loading contact details…
          </div>
        ) : (
          <main className="cp-main">
            <div className="cp-grid">

              {/* ── Left: Info + Map ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* Info card */}
                <div className="cp-card cp-rise cp-d3">
                  <div className="cp-info-body">
                    <div className="cp-card-eyebrow">Our Details</div>
                    <div className="cp-card-title">
                      Contact <span>Information</span>
                    </div>

                    {/* Address */}
                    <div className="cp-contact-item">
                      <div className="cp-ci-icon">
                        <MapPin />
                      </div>
                      <div>
                        <div className="cp-ci-label">Our Location</div>
                        <div className="cp-ci-value">
                          {info.address || "D16/327, 1st Floor, Sector 3, Rohini"}
                        </div>
                        <div className="cp-ci-sub">
                          {[info.city, info.state, info.country].filter(Boolean).join(", ")}
                          {info.pincode ? ` – ${info.pincode}` : " – 110085"}
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="cp-contact-item">
                      <div className="cp-ci-icon">
                        <Phone />
                      </div>
                      <div>
                        <div className="cp-ci-label">Call Us</div>
                        <a
                          href={`tel:${info.contactPhone || "+919876543210"}`}
                          className="cp-ci-value"
                        >
                          {info.contactPhone || "+91 98765 43210"}
                        </a>
                        <div className="cp-ci-sub">Mon – Fri, 9 AM to 6 PM</div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="cp-contact-item">
                      <div className="cp-ci-icon">
                        <Mail />
                      </div>
                      <div>
                        <div className="cp-ci-label">Email Us</div>
                        <a
                          href={`mailto:${info.contactEmail || "hello@careerkendra.com"}`}
                          className="cp-ci-value"
                        >
                          {info.contactEmail || "hello@careerkendra.com"}
                        </a>
                        <div className="cp-ci-sub">We reply within 24 hours</div>
                      </div>
                    </div>

                    {/* Working hours */}
                    <div className="cp-contact-item">
                      <div className="cp-ci-icon">
                        <Clock />
                      </div>
                      <div>
                        <div className="cp-ci-label">Working Hours</div>
                        <div className="cp-ci-value">
                          {info.workingDays || "Monday – Friday"}
                        </div>
                        <div className="cp-ci-sub">
                          {info.officeOpenTime?.slice(0, 5) || "09:00"} –{" "}
                          {info.officeCloseTime?.slice(0, 5) || "18:00"} IST
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Map */}
                <div className="cp-map cp-rise cp-d4">
                  {info.googleMapsUrl ? (
                    <iframe
                      src={info.googleMapsUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Career Kendra Office Location"
                    />
                  ) : (
                    <div className="cp-map-placeholder">
                      <svg viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <p>Map will appear here</p>
                    </div>
                  )}
                </div>

              </div>

              {/* ── Right: Form ── */}
              <div className="cp-card cp-rise cp-d4">
                {submitted ? (
                  <div className="cp-success">
                    <div className="cp-success-icon">
                      <CheckCircle2 />
                    </div>
                    <div className="cp-success-title">Message Sent!</div>
                    <p className="cp-success-sub">
                      Thank you for reaching out. Our team will get back to you within 24 hours.
                    </p>
                    <button className="cp-success-btn" onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <div className="cp-form-body">
                    <div className="cp-card-eyebrow">Direct Message</div>
                    <div className="cp-card-title">
                      Send Us a <span>Message</span>
                    </div>

                    <form onSubmit={handleSubmit} className="cp-form">
                      {error && <div className="cp-error">{error}</div>}

                      {/* Name */}
                      <div className="cp-field">
                        <label htmlFor="name" className="cp-label">Full Name *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="cp-input"
                          placeholder="e.g. Rahul Kumar"
                        />
                      </div>

                      {/* Email + Phone */}
                      <div className="cp-field-row">
                        <div className="cp-field">
                          <label htmlFor="email" className="cp-label">Email *</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="cp-input"
                            placeholder="you@example.com"
                          />
                        </div>
                        <div className="cp-field">
                          <label htmlFor="phone" className="cp-label">Phone *</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="cp-input"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="cp-field">
                        <label htmlFor="subject" className="cp-label">I Am A *</label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="cp-select"
                        >
                          <option value="" disabled>Select your role…</option>
                          <option value="job_seeker">Job Seeker</option>
                          <option value="employer">Employer / Recruiter</option>
                          <option value="looking_staff">Looking To Hire Staff</option>
                          <option value="partner">Business Partner</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Message */}
                      <div className="cp-field">
                        <label htmlFor="message" className="cp-label">Your Message *</label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className="cp-textarea"
                          placeholder="Tell us about your hiring needs or career goals…"
                        />
                      </div>

                      <button type="submit" disabled={submitting} className="cp-submit">
                        {submitting ? (
                          "Sending…"
                        ) : (
                          <>
                            Send Message
                            <svg viewBox="0 0 24 24">
                              <line x1="22" y1="2" x2="11" y2="13" />
                              <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                          </>
                        )}
                      </button>

                      <p className="cp-privacy">
                        🔒 Your information is 100% secure and will never be shared.
                      </p>
                    </form>
                  </div>
                )}
              </div>

            </div>
          </main>
        )}

      </div>
    </>
  );
};

export default ContactPage;