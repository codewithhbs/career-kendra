"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useJob } from "@/hooks/useJobs";
import { INDUSTRIES } from "@/lib/industries";

const Hero = () => {
  const { jobs } = useJob();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("search-job", keyword.trim());
    if (location.trim()) params.set("location", location.trim());
    if (industry.trim()) params.set("industry", industry.trim());
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#F1F5F9" }}
    >
      {/* Indigo blob top-right */}
      <div
        className="absolute -top-16 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "#6366F1", opacity: 0.07 }}
      />
      {/* Amber blob bottom-left */}
      <div
        className="absolute -bottom-20 -left-16 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "#F59E0B", opacity: 0.08 }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-12 items-center">
          <div>
            {/* Orange highlight tag */}
            <div
              className="inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded mb-4 border"
              style={{
                background: "#fe9a00",
                color: "#ffffff",
                borderColor: "#ffffff",
              }}
            >
              ✦ Now hiring across 12 cities
            </div>

            {/* Heading */}
            <h1
              className="text-[2.75rem] md:text-[4rem] leading-[1.1] font-bold tracking-tight mb-4 max-w-2xl"
              style={{ color: "#0F172A", textTransform: "uppercase" }}
            >
              Your career,{" "}
              <span
                className="relative inline-block"
                style={{ color: "#fe9a00" }}
              >
                your next move.
                {/* Amber underline accent */}
                {/* <span
                  className="absolute left-0 -bottom-1 w-full h-0.75 rounded-full"
                  style={{ background: "#F59E0B" }}
                /> */}
              </span>
            </h1>

            <p
              className="text-base md:text-lg leading-relaxed mb-10 max-w-lg"
              style={{ color: "#64748B" }}
            >
              Discover roles that match your skills and ambitions — from
              startups to Fortune 500s.
            </p>

            {/* Search Card */}
            <form
              onSubmit={handleSearch}
              className="rounded-2xl p-5"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 24px rgba(99,102,241,0.08)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                {/* Keyword */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: "#94A3B8" }}
                  >
                    Role / Keyword
                  </label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] pointer-events-none"
                      style={{ color: "#CBD5E1" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="e.g. Product Designer"
                      className="w-full pl-9 pr-4 py-[11px] rounded-xl text-sm outline-none transition-all"
                      style={{
                        border: "1.5px solid #E2E8F0",
                        background: "#F8FAFC",
                        color: "#0F172A",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#6366F1";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(99,102,241,0.1)";
                        e.target.style.background = "#FAFAFE";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#E2E8F0";
                        0;
                        e.target.style.boxShadow = "none";
                        e.target.style.background = "#F8FAFC";
                      }}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: "#94A3B8" }}
                  >
                    Location
                  </label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] pointer-events-none"
                      style={{ color: "#CBD5E1" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                      />
                    </svg>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City or postcode"
                      className="w-full pl-9 pr-4 py-[11px] rounded-xl text-sm outline-none transition-all"
                      style={{
                        border: "1.5px solid #E2E8F0",
                        background: "#F8FAFC",
                        color: "#0F172A",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#6366F1";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(99,102,241,0.1)";
                        e.target.style.background = "#FAFAFE";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#E2E8F0";
                        e.target.style.boxShadow = "none";
                        e.target.style.background = "#F8FAFC";
                      }}
                    />
                  </div>
                </div>

                {/* Industry */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: "#94A3B8" }}
                  >
                    Industry
                  </label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] pointer-events-none"
                      style={{ color: "#CBD5E1" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M3 7h18M3 12h18M3 17h18"
                      />
                    </svg>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.75 rounded-xl text-sm outline-none appearance-none cursor-pointer transition-all"
                      style={{
                        border: "1.5px solid #E2E8F0",
                        background: "#F8FAFC",
                        color: industry ? "#0F172A" : "#545454",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#6366F1";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(99,102,241,0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#E2E8F0";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <option value="">Any Industry</option>
                      {INDUSTRIES.map((ind, index) => (
                        <option key={index} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="#CBD5E1"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-[11px] rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                  style={{
                    background: "#fe9a00",
                    boxShadow: "0 4px 16px #fe9a004f",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fe9a00";
                    e.currentTarget.style.boxShadow = "0 6px 24px #fe9a004f";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fe9a00";
                    e.currentTarget.style.boxShadow = "0 4px 16px #fe9a004f";
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                    />
                  </svg>
                  Search {jobs.length || 148} Jobs
                </button>
              </div>
            </form>

            <div className="flex items-center gap-6 mt-7">
              {[
                { num: "10k+", label: "Companies hiring" },
                { num: jobs.length || 148, label: "Live jobs today" },
                { num: "98%", label: "Placement rate" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-6">
                  {i > 0 && (
                    <div
                      className="w-px h-8"
                      style={{ background: "#E2E8F0" }}
                    />
                  )}
                  <div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: "#0F172A" }}
                    >
                      {stat.num}
                    </div>
                    <div className="text-[11px]" style={{ color: "#94A3B8" }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-120">
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)",
                }}
              />
              <svg
                viewBox="0 0 500 400"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
              >
                <circle cx="380" cy="90" r="90" fill="#6366F1" opacity="0.08" />
                <circle
                  cx="120"
                  cy="320"
                  r="70"
                  fill="#F59E0B"
                  opacity="0.08"
                />

                <rect
                  x="180"
                  y="220"
                  width="160"
                  height="10"
                  rx="4"
                  fill="#CBD5E1"
                />
                <rect
                  x="200"
                  y="150"
                  width="140"
                  height="80"
                  rx="8"
                  fill="#1E293B"
                />
                <rect
                  x="205"
                  y="155"
                  width="130"
                  height="70"
                  rx="6"
                  fill="#334155"
                />

                <rect
                  x="215"
                  y="165"
                  width="70"
                  height="6"
                  rx="3"
                  fill="#6366F1"
                />
                <rect
                  x="215"
                  y="178"
                  width="90"
                  height="5"
                  rx="3"
                  fill="#94A3B8"
                />
                <rect
                  x="215"
                  y="188"
                  width="60"
                  height="5"
                  rx="3"
                  fill="#94A3B8"
                />

                <rect
                  x="215"
                  y="200"
                  width="100"
                  height="20"
                  rx="6"
                  fill="#F8FAFC"
                />
                <rect
                  x="220"
                  y="205"
                  width="50"
                  height="5"
                  rx="3"
                  fill="#0F172A"
                />
                <rect
                  x="220"
                  y="212"
                  width="35"
                  height="4"
                  rx="2"
                  fill="#94A3B8"
                />

                <rect
                  x="235"
                  y="230"
                  width="50"
                  height="60"
                  rx="12"
                  fill="#6366F1"
                />

                <circle cx="260" cy="200" r="22" fill="#FDE68A" />

                <path d="M238 195 Q260 170 282 195" fill="#1E293B" />

                <circle cx="252" cy="200" r="2" fill="#1E293B" />
                <circle cx="268" cy="200" r="2" fill="#1E293B" />

                <path
                  d="M252 210 Q260 215 268 210"
                  stroke="#1E293B"
                  strokeWidth="1.5"
                  fill="none"
                />

                <path
                  d="M235 250 Q210 260 200 250"
                  stroke="#FDE68A"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d="M285 250 Q310 260 320 250"
                  stroke="#FDE68A"
                  strokeWidth="10"
                  strokeLinecap="round"
                />

                <g transform="translate(80,130)">
                  <rect
                    width="120"
                    height="70"
                    rx="12"
                    fill="#ffffff"
                    stroke="#E2E8F0"
                  />
                  <rect
                    x="10"
                    y="12"
                    width="60"
                    height="6"
                    rx="3"
                    fill="#0F172A"
                  />
                  <rect
                    x="10"
                    y="24"
                    width="80"
                    height="4"
                    rx="2"
                    fill="#94A3B8"
                  />
                  <rect
                    x="10"
                    y="32"
                    width="70"
                    height="4"
                    rx="2"
                    fill="#94A3B8"
                  />
                  <rect
                    x="10"
                    y="48"
                    width="40"
                    height="6"
                    rx="3"
                    fill="#6366F1"
                    opacity="0.2"
                  />
                  <text x="30" y="54" fontSize="8" fill="#6366F1">
                    Resume
                  </text>
                </g>

                <g transform="translate(360,200)">
                  <circle
                    cx="20"
                    cy="20"
                    r="20"
                    fill="#22C55E"
                    opacity="0.15"
                  />
                  <path
                    d="M12 20 L18 26 L28 14"
                    stroke="#16A34A"
                    strokeWidth="2"
                    fill="none"
                  />
                </g>

                <g transform="translate(60,260)">
                  <circle cx="30" cy="30" r="30" fill="#6366F1" opacity="0.1" />
                  <circle
                    cx="28"
                    cy="28"
                    r="10"
                    stroke="#6366F1"
                    strokeWidth="2"
                    fill="none"
                  />
                  <line
                    x1="35"
                    y1="35"
                    x2="45"
                    y2="45"
                    stroke="#6366F1"
                    strokeWidth="2"
                  />
                </g>
              </svg>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
