"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Send, Clock, Sparkles, CheckCircle2 } from "lucide-react";
import axiosInstance from "@/lib/user_axios";
import { useSettings } from "@/hooks/useSettings";

// ── Styles ────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* ── Section ── */
  .cs-section {
    position: relative;
    width: 100%;
    padding: 5.5rem 0 6rem;
    background: #fff8ec;
    overflow: hidden;
    // font-family: 'DM Sans', sans-serif;
  }

  /* Dot grid */
  .cs-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(99,102,241,0.14) 1px, transparent 1px);
    background-size: 30px 30px;
    pointer-events: none;
    z-index: 0;
  }

  /* ── Blobs ── */
  .cs-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(90px);
    z-index: 0;
  }
  .cs-blob-1 {
    width: 500px; height: 500px;
    top: -180px; right: -140px;
    background: #fe9a001f;
  }
  .cs-blob-2 {
    width: 380px; height: 380px;
    bottom: -100px; left: -80px;
    background: rgba(245,158,11,0.09);
  }
  .cs-blob-3 {
    width: 240px; height: 240px;
    top: 55%; left: 40%;
    background: rgba(99,102,241,0.07);
  }

  /* ── Container ── */
  .cs-container {
    position: relative;
    z-index: 10;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  @media (min-width: 640px)  { .cs-container { padding: 0 2rem; } }
  @media (min-width: 1024px) { .cs-container { padding: 0 3rem; } }

  /* ── Header ── */
  .cs-header {
    max-width: 640px;
    margin: 0 auto 4rem;
    text-align: center;
  }

  .cs-eyebrow {
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

  .cs-heading {
    // font-family: 'Syne', sans-serif;
    font-size: clamp(2.1rem, 4.5vw, 3rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.03em;
    color: #0F172A;
    margin-bottom: 1rem;
  }
  .cs-heading-accent {
    background: linear-gradient(135deg, #fe9a00 0%, #fe9a00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .cs-heading-underline {
    position: relative;
    display: inline-block;
  }
  .cs-heading-underline::after {
    content: '';
    position: absolute;
    left: 0; bottom: -5px;
    width: 100%; height: 3px;
    background: #F59E0B;
    border-radius: 2px;
  }

  .cs-subtext {
    font-size: 1rem;
    line-height: 1.75;
    color: #64748B;
    font-weight: 300;
  }

  /* ── Two-col grid ── */
  .cs-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  @media (min-width: 1024px) {
    .cs-grid { grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: start; }
  }

  /* ── Shared card shell ── */
  .cs-card {
    position: relative;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 1.4rem;
    overflow: hidden;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .cs-card::before {
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
  .cs-card:hover {
    border-color: #fe9a00;
    box-shadow: 0 18px 48px #fff8ec;
  }
  .cs-card:hover::before { transform: scaleY(1); }

  /* ── Info card ── */
  .cs-info-card {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Icon row */
  .cs-info-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }
  .cs-icon-wrap {
    width: 52px; height: 52px;
    border-radius: 0.875rem;
    background: linear-gradient(135deg, #fff8ec, #fff8ec);
    border: 1px solid #fe9a00;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.3s, box-shadow 0.3s, border-color 0.3s;
  }
    .cs-icon-wrap svg { color: #fe9a00 !important; }
    .cs-info-card:hover .cs-icon-wrap svg { color: #FFFFFF !important; }
  .cs-card:hover .cs-icon-wrap {
    background: linear-gradient(135deg, #fe9a00, #fe9a00);
    border-color: #fe9a00;
    box-shadow: 0 6px 20px rgba(254, 154, 0, 0.35);
  }

  .cs-office-tag {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #ffcb7a;
    text-transform: uppercase;
    margin-bottom: 0.3rem;
  }
  .cs-office-title {
    // font-family: 'Syne', sans-serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: #0F172A;
    line-height: 1.3;
    transition: color 0.3s;
  }
  .cs-card:hover .cs-office-title { color: #fe9a00; }
  .cs-office-addr {
    font-size: 0.875rem;
    color: #64748B;
    line-height: 1.7;
    font-weight: 300;
    margin-top: 0.25rem;
  }

  /* Divider */
  .cs-divider {
    height: 1px;
    background: #E2E8F0;
    border: none;
    margin: 0;
  }

  /* Contact rows */
  .cs-contact-rows { display: flex; flex-direction: column; gap: 1.1rem; }
  .cs-contact-row {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }
  .cs-row-icon {
    width: 38px; height: 38px;
    border-radius: 0.75rem;
    background: #fff8ec;
    border: 1px solid #fe9a00;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
    .cs-row-icon svg { color: #fe9a00 !important; }
  .cs-row-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #ffcb7a;
    text-transform: uppercase;
    margin-bottom: 0.15rem;
  }
  .cs-row-value {
    font-size: 0.875rem;
    color: #0F172A;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s;
  }
  a.cs-row-value:hover { color: #6366F1; }

  /* Map */
  .cs-map-card {
    border-radius: 1.4rem;
    overflow: hidden;
    border: 1px solid #E2E8F0;
    height: 22rem;
    background: #E2E8F0;
    box-shadow: 0 4px 20px rgba(99,102,241,0.06);
  }
  .cs-map-card iframe { display: block; }

  /* ── Form card ── */
  .cs-form-card { padding: 2rem 2rem 2.25rem; }
  .cs-form-tag {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color:#ffcb7a;
    text-transform: uppercase;
    margin-bottom: 0.4rem;
  }
  .cs-form-title {
    // font-family: 'Syne', sans-serif;
    font-size: 1.35rem;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 1.75rem;
    line-height: 1.2;
  }
  .cs-form-title span {
    background: linear-gradient(135deg, #fe9a00 0%, #fe9a00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .cs-form { display: flex; flex-direction: column; gap: 1.1rem; }

  .cs-field-group { display: flex; flex-direction: column; gap: 0.4rem; }
  .cs-field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  @media (max-width: 540px) { .cs-field-row { grid-template-columns: 1fr; } }

  .cs-label {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #64748B;
    text-transform: uppercase;
  }

  .cs-input, .cs-textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.875rem;
    border: 1px solid #E2E8F0;
    background: #F8FAFC;
    // font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    color: #0F172A;
    font-weight: 400;
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
    box-sizing: border-box;
  }
  .cs-input::placeholder, .cs-textarea::placeholder { color: #94A3B8; }
  .cs-input:focus, .cs-textarea:focus {
    border-color: #6366F1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    background: #fff;
  }
  .cs-textarea { resize: none; }

  /* Submit btn */
  .cs-submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    width: 100%;
    padding: 0.9rem 2rem;
    border-radius: 0.875rem;
    background: linear-gradient(135deg, #fe9a00 0%, #fe9a00 100%);
    color: #fff;
    font-size: 0.92rem;
    font-weight: 700;
    // font-family: 'DM Sans', sans-serif;
    border: none;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(254, 154, 0, 0.35);
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    letter-spacing: -0.01em;
    margin-top: 0.35rem;
  }
  .cs-submit:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 14px 36px #fff8ec;
    background: linear-gradient(135deg, #fe9a00 0%, #fe9a00 100%);
  }
  .cs-submit:active:not(:disabled) { transform: scale(0.98); }
  .cs-submit:disabled { opacity: 0.65; cursor: not-allowed; }
  .cs-submit svg { transition: transform 0.2s; }
  .cs-submit:hover:not(:disabled) svg { transform: translateX(3px); }

  .cs-privacy {
    text-align: center;
    font-size: 0.75rem;
    color: #94A3B8;
    font-weight: 300;
    margin-top: 0.5rem;
  }

  /* Error */
  .cs-error {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 0.875rem;
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
    color: #DC2626;
    text-align: center;
  }

  /* Success */
  .cs-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3rem 2rem;
    gap: 0.75rem;
  }
  .cs-success-icon {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #EEF2FF, #E0E7FF);
    border: 1px solid #C7D2FE;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
  }
  .cs-success-title {
    // font-family: 'Syne', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    color: #0F172A;
  }
  .cs-success-sub {
    font-size: 0.875rem;
    color: #64748B;
    font-weight: 300;
    line-height: 1.7;
    max-width: 280px;
  }

  /* ── Staggered entrance ── */
  @keyframes cs-rise {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cs-rise { opacity: 0; animation: cs-rise 0.6s ease forwards; }
  .cs-rise-1 { animation-delay: 0.05s; }
  .cs-rise-2 { animation-delay: 0.15s; }
  .cs-rise-3 { animation-delay: 0.25s; }
  .cs-rise-4 { animation-delay: 0.38s; }
  .cs-rise-5 { animation-delay: 0.50s; }
`;

const ContactSection = () => {
  const { settings, loading, fetchSettings } = useSettings();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      setFormData({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err) {
      setError("Failed to send your message. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!settings) fetchSettings();
  }, [fetchSettings, settings]);

  if (loading) {
    return (
      <section className="cs-section">
        <div className="cs-container" style={{ textAlign: "center", color: "#64748B", paddingTop: "4rem" }}>
          Loading contact details…
        </div>
      </section>
    );
  }

  const info = settings || {};

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <section id="contact" className="cs-section">
        {/* Blobs */}
        <div className="cs-blob cs-blob-1" />
        <div className="cs-blob cs-blob-2" />
        <div className="cs-blob cs-blob-3" />

        <div className="cs-container">

          {/* ── Header ── */}
          <div className="cs-header">
            <div className="cs-eyebrow cs-rise cs-rise-1">
              <Sparkles size={11} />
              Contact Us
            </div>

            <h2 className="cs-heading cs-rise cs-rise-2">
              Get In{" "}
              <span className="cs-heading-underline">
                <span className="cs-heading-accent">Touch</span>
              </span>
            </h2>

            <p className="cs-subtext cs-rise cs-rise-3">
              We're here to help you find the perfect talent or career opportunity.
              Reach out today — we typically respond within 24 hours.
            </p>
          </div>

          {/* ── Two-col grid ── */}
          <div className="cs-grid">

            {/* Left: info card + map */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Office info card */}
              <div className="cs-card cs-rise cs-rise-4">
                <div className="cs-info-card">

                  {/* Header row */}
                  <div className="cs-info-header">
                    <div className="cs-icon-wrap">
                      <MapPin size={22} style={{ color: "#FFFFFF", transition: "color 0.3s" }} />
                    </div>
                    <div>
                      <div className="cs-office-tag">OUR LOCATION</div>
                      <div className="cs-office-title">Our Office</div>
                      <p className="cs-office-addr">
                        {info.address || "D16/327, 1st Floor, Sector 3, Rohini - 110085"}<br />
                        {info.city}, {info.state}, {info.country} – {info.pincode || "110034"}
                      </p>
                    </div>
                  </div>

                  <hr className="cs-divider" />

                  {/* Contact rows */}
                  <div className="cs-contact-rows">
                    <div className="cs-contact-row">
                      <div className="cs-row-icon">
                        <Phone size={16} style={{ color: "#6366F1" }} />
                      </div>
                      <div>
                        <div className="cs-row-label">Call Us</div>
                        <a
                          href={`tel:${info.contactPhone || "+919876543210"}`}
                          className="cs-row-value"
                        >
                          {info.contactPhone || "+91 98765 43210"}
                        </a>
                      </div>
                    </div>

                    <div className="cs-contact-row">
                      <div className="cs-row-icon">
                        <Mail size={16} style={{ color: "#6366F1" }} />
                      </div>
                      <div>
                        <div className="cs-row-label">Email Us</div>
                        <a
                          href={`mailto:${info.contactEmail || "hr@careerkendra.com"}`}
                          className="cs-row-value"
                        >
                          {info.contactEmail || "hr@careerkendra.com"}
                        </a>
                      </div>
                    </div>

                    <div className="cs-contact-row">
                      <div className="cs-row-icon">
                        <Clock size={16} style={{ color: "#6366F1" }} />
                      </div>
                      <div>
                        <div className="cs-row-label">Working Hours</div>
                        <span className="cs-row-value">
                          {info.workingDays || "Mon – Fri"} &nbsp;·&nbsp;{" "}
                          {info.officeOpenTime?.slice(0, 5) || "09:00"} –{" "}
                          {info.officeCloseTime?.slice(0, 5) || "18:00"}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Map */}
              <div className="cs-map-card cs-rise cs-rise-5">
                {info.googleMapsUrl && (
                  <iframe
                    src={info.googleMapsUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Our Office Location"
                  />
                )}
              </div>
            </div>

            {/* Right: form card */}
            <div className="cs-card cs-rise cs-rise-4" style={{ height: "fit-content" }}>
              <div className="cs-form-card">

                {submitted ? (
                  <div className="cs-success">
                    <div className="cs-success-icon">
                      <CheckCircle2 size={30} style={{ color: "#6366F1" }} />
                    </div>
                    <div className="cs-success-title">Message Sent!</div>
                    <p className="cs-success-sub">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="cs-form-tag">DIRECT MESSAGE</div>
                    <div className="cs-form-title">
                      Send Us a <span>Message</span>
                    </div>

                    <form onSubmit={handleSubmit} className="cs-form">
                      {error && <div className="cs-error">{error}</div>}

                      <div className="cs-field-group">
                        <label htmlFor="name" className="cs-label">Full Name *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="cs-input"
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="cs-field-row">
                        <div className="cs-field-group">
                          <label htmlFor="email" className="cs-label">Email *</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="cs-input"
                            placeholder="you@example.com"
                          />
                        </div>
                        <div className="cs-field-group">
                          <label htmlFor="phone" className="cs-label">Phone *</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="cs-input"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>

                      <div className="cs-field-group">
                        <label htmlFor="message" className="cs-label">Your Message *</label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className="cs-textarea"
                          placeholder="Tell us about your hiring needs or career goals…"
                        />
                      </div>

                      <button type="submit" disabled={submitting} className="cs-submit">
                        {submitting ? "Sending…" : "Send Message"}
                        {!submitting && <Send size={16} />}
                      </button>

                      <p className="cs-privacy">
                        We respect your privacy — your details are safe with us.
                      </p>
                    </form>
                  </>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default ContactSection;