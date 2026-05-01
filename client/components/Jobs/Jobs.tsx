"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Briefcase,
  X,
  Loader2,
  MapPin,
  Clock,
  Tag,
  Layers,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import JobCard from "../ui/JobCard";
import { INDUSTRIES, JOB_CATEGORIES } from "@/lib/industries";
import { isAxiosError } from "axios";
import axiosInstance from "@/lib/user_axios";

const JOBS_PER_PAGE = 9;

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  bg: "#F1F5F9",
  primary: "#6366F1",
  primaryDark: "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryBorder: "#C7D2FE",
  secondary: "#0F172A",
  accent: "#F59E0B",
  accentLight: "#FEF3C7",
  accentBorder: "#FDE68A",
  card: "#FFFFFF",
  border: "#E2E8F0",
  muted: "#64748B",
  hint: "#94A3B8",
  inputBg: "#F8FAFC",
};

// ── Inline styles object (scoped CSS via <style> tag) ─────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600&display=swap');

  .cw-section {
    position: relative;
    width: 100%;
    padding: 5rem 0 7rem;
    // background: #F1F5F9;
    overflow: hidden;
    // font-family: 'DM Sans', sans-serif;
  }

  /* ── Dot grid background ── */
  // .cw-section::before {
  //   content: '';
  //   position: absolute;
  //   inset: 0;
  //   background-image: radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px);
  //   background-size: 28px 28px;
  //   pointer-events: none;
  //   z-index: 0;
  // }

  /* ── Ambient blobs ── */
  .cw-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(80px);
    z-index: 0;
  }
  .cw-blob-1 {
    width: 500px; height: 500px;
    top: -180px; right: -120px;
    background: #fe9a001f;
  }
  .cw-blob-2 {
    width: 380px; height: 380px;
    bottom: -120px; left: -80px;
    background: rgba(245,158,11,0.09);
  }
  .cw-blob-3 {
    width: 260px; height: 260px;
    top: 40%; left: 25%;
    background: rgba(99,102,241,0.06);
  }

  /* ── Container ── */
  .cw-container {
    position: relative;
    z-index: 10;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  @media (min-width: 640px) { .cw-container { padding: 0 2rem; } }
  @media (min-width: 1024px) { .cw-container { padding: 0 3rem; } }

  /* ── Header ── */
  .cw-header {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 3rem;
  }
  @media (min-width: 768px) {
    .cw-header { flex-direction: row; align-items: flex-end; justify-content: space-between; }
  }

  .cw-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
    background: #FEF3C7;
    color: #D97706;
    border: 1px solid #FDE68A;
    margin-bottom: 1rem;
    width: fit-content;
  }

  .cw-heading {
    // font-family: 'Syne', sans-serif;
    font-size: clamp(2.2rem, 4.5vw, 3.2rem);
    font-weight: 800;
    line-height: 1.07;
    letter-spacing: -0.03em;
    color: #0F172A;
    margin-bottom: 0.9rem;
  }
  .cw-heading-accent {
    color: #fe9a00;
    position: relative;
    display: inline-block;
  }
  // .cw-heading-accent::after {
  //   content: '';
  //   position: absolute;
  //   left: 0; bottom: -4px;
  //   width: 100%; height: 3px;
  //   background: #F59E0B;
  //   border-radius: 2px;
  // }

  .cw-subtext {
    font-size: 1rem;
    line-height: 1.7;
    color: #64748B;
    font-weight: 300;
    max-width: 34rem;
  }

  /* Live pill */
  .cw-live-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 1.25rem;
    border-radius: 999px;
    background: #fff8ec;
    border: 1px solid #fe9a00;
    color: #fe9a00;
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
    align-self: flex-start;
  }
  @media (min-width: 768px) { .cw-live-pill { align-self: auto; } }
  .cw-live-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #fe9a00;
    animation: cw-pulse 2s ease-in-out infinite;
  }
  @keyframes cw-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.4); }
  }

  /* ── Search & filter card ── */
  .cw-filter-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 1.5rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 32px rgba(99,102,241,0.06);
  }

  /* Search row */
  .cw-search-wrap {
    position: relative;
    margin-bottom: 1rem;
  }
  .cw-search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94A3B8;
    pointer-events: none;
  }
  .cw-search-input {
    width: 100%;
    padding: 0.85rem 2.8rem 0.85rem 2.85rem;
    border-radius: 0.875rem;
    border: 1.5px solid #E2E8F0;
    background: #F8FAFC;
    font-size: 0.92rem;
    color: #0F172A;
    // font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .cw-search-input::placeholder { color: #94A3B8; }
  .cw-search-input:focus {
    border-color: #6366F1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    background: #fff;
  }
  .cw-search-clear {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94A3B8;
    cursor: pointer;
    background: none;
    border: none;
    display: flex;
    align-items: center;
    transition: color 0.2s;
  }
  .cw-search-clear:hover { color: #6366F1; }

  /* Filter row */
  .cw-filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    align-items: center;
  }

  /* Filter label row header */
  .cw-filter-label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #94A3B8;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-right: 0.25rem;
  }

  /* Clear btn */
  .cw-clear-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    background: #EEF2FF;
    color: #6366F1;
    border: 1.5px solid #C7D2FE;
    transition: background 0.2s, box-shadow 0.2s;
    // font-family: 'DM Sans', sans-serif;
  }
  .cw-clear-btn:hover {
    background: #6366F1;
    color: #fff;
    border-color: #6366F1;
    box-shadow: 0 4px 14px rgba(99,102,241,0.3);
  }

  /* ── Results meta ── */
  .cw-meta {
    font-size: 0.85rem;
    color: #94A3B8;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .cw-meta strong { color: #0F172A; font-weight: 600; }

  /* ── Job grid ── */
  .cw-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  @media (min-width: 640px) { .cw-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .cw-grid { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; } }

  /* ── Loading / Error / Empty states ── */
  .cw-state-box {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 2rem;
    text-align: center;
  }
  .cw-state-icon-wrap {
    width: 72px; height: 72px;
    border-radius: 1.25rem;
    background: #EEF2FF;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.25rem;
  }
  .cw-state-title {
    // font-family: 'Syne', sans-serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: #0F172A;
    margin-bottom: 0.5rem;
  }
  .cw-state-desc {
    font-size: 0.9rem;
    color: #64748B;
    max-width: 26rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }
  .cw-state-btn {
    padding: 0.65rem 1.5rem;
    border-radius: 0.875rem;
    background: #6366F1;
    color: #fff;
    font-size: 0.88rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    // font-family: 'DM Sans', sans-serif;
    transition: background 0.2s, box-shadow 0.2s;
  }
  .cw-state-btn:hover {
    background: #4F46E5;
    box-shadow: 0 6px 18px rgba(99,102,241,0.3);
  }

  /* ── Pagination ── */
  .cw-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.4rem;
    margin-top: 3rem;
    flex-wrap: wrap;
  }
  .cw-pg-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2.5rem;
    height: 2.5rem;
    padding: 0 0.9rem;
    border-radius: 0.75rem;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    border: 1.5px solid #E2E8F0;
    background: #FFFFFF;
    color: #64748B;
    // font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    gap: 0.3rem;
  }
  .cw-pg-btn:hover:not(:disabled) {
    border-color: #C7D2FE;
    color: #6366F1;
    background: #EEF2FF;
  }
  .cw-pg-btn.active {
    background: #6366F1;
    color: #fff;
    border-color: #6366F1;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }
  .cw-pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .cw-pg-dots {
    display: flex;
    align-items: center;
    padding: 0 0.3rem;
    color: #94A3B8;
    font-size: 0.85rem;
  }

  /* Active filter chips */
  .cw-filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .cw-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    background: #EEF2FF;
    color: #6366F1;
    border: 1px solid #C7D2FE;
  }
  .cw-chip button {
    background: none;
    border: none;
    cursor: pointer;
    color: #A5B4FC;
    display: flex;
    align-items: center;
    padding: 0;
    transition: color 0.15s;
  }
  .cw-chip button:hover { color: #6366F1; }

  /* Select trigger override */
  .cw-select-trigger {
    height: 2.5rem !important;
    border-radius: 0.75rem !important;
    border: 1.5px solid #E2E8F0 !important;
    background: #FFFFFF !important;
    font-size: 0.82rem !important;
    font-weight: 500 !important;
    color: #475569 !important;
    font-family: 'DM Sans', sans-serif !important;
    transition: border-color 0.2s, box-shadow 0.2s !important;
  }
  .cw-select-trigger:hover {
    border-color: #A5B4FC !important;
  }
  .cw-select-trigger:focus-within {
    border-color: #6366F1 !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
  }

  /* Staggered entrance */
  @keyframes cw-rise {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cw-rise { animation: cw-rise 0.55s ease both; }
  .cw-rise-1 { animation-delay: 0.05s; }
  .cw-rise-2 { animation-delay: 0.12s; }
  .cw-rise-3 { animation-delay: 0.20s; }
  .cw-rise-4 { animation-delay: 0.28s; }
`;

export default function CareerWithUs({
  singlePage = false,
}: {
  singlePage?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── State ──────────────────────────────────────────────────────────────────
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search-job") || "",
  );
  const [selectedLocation, setSelectedLocation] = useState(
    () => searchParams.get("location") || "",
  );
  const [selectedExperience, setSelectedExperience] = useState(
    () => searchParams.get("experience") || "",
  );
  const [selectedJobType, setSelectedJobType] = useState(
    () => searchParams.get("jobType") || "",
  );
  const [selectedIndustry, setSelectedIndustry] = useState(
    () => searchParams.get("industry") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get("jobCategory") || "",
  );
  const [filtersOpen, setFiltersOpen] = useState(true);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchJobs = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError("");
        const response = await axiosInstance.get("/jobs/for-user", {
          signal,
          params: {
            page,
            limit: JOBS_PER_PAGE,
            search: searchQuery,
            city: selectedLocation,
            experience: selectedExperience,
            jobType: selectedJobType,
            industry: selectedIndustry,
            jobCategory: selectedCategory,
            sortBy: "createdAt",
            order: "DESC",
          },
        });
        setJobs(response.data.jobs || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        if (isAxiosError(err) && err.code === "ERR_CANCELED") return;
        setError(
          isAxiosError(err)
            ? err?.response?.data?.message || "Failed to fetch jobs"
            : "An unexpected error occurred",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      page,
      searchQuery,
      selectedLocation,
      selectedExperience,
      selectedJobType,
      selectedIndustry,
      selectedCategory,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchJobs(controller.signal);
    return () => controller.abort();
  }, [fetchJobs]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [
    searchQuery,
    selectedLocation,
    selectedExperience,
    selectedJobType,
    selectedIndustry,
    selectedCategory,
  ]);

  const syncUrl = useCallback(() => {
    if (!singlePage) return;
    const params = new URLSearchParams();
    if (searchQuery) params.set("search-job", searchQuery);
    if (selectedLocation) params.set("location", selectedLocation);
    if (selectedExperience) params.set("experience", selectedExperience);
    if (selectedJobType) params.set("jobType", selectedJobType);
    if (selectedIndustry) params.set("industry", selectedIndustry);
    if (selectedCategory) params.set("jobCategory", selectedCategory);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    const target = query ? `${pathname}?${query}` : pathname;
    if (target !== `${pathname}${window.location.search}`)
      router.replace(target, { scroll: false });
  }, [
    searchQuery,
    selectedLocation,
    selectedExperience,
    selectedJobType,
    selectedIndustry,
    selectedCategory,
    page,
    pathname,
    router,
    singlePage,
  ]);

  useEffect(() => {
    const t = setTimeout(syncUrl, 300);
    return () => clearTimeout(t);
  }, [syncUrl]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const hasActiveFilters =
    !!searchQuery ||
    !!selectedLocation ||
    !!selectedExperience ||
    !!selectedJobType ||
    !!selectedIndustry ||
    !!selectedCategory;

  const clearAll = () => {
    setSearchQuery("");
    setSelectedLocation("");
    setSelectedExperience("");
    setSelectedJobType("");
    setSelectedIndustry("");
    setSelectedCategory("");
    setPage(1);
  };

  const formatSalary = (job: any) => {
    if (job.hideSalary) return "Confidential";
    if (!job.salaryMin && !job.salaryMax) return "Not disclosed";
    const min = job.salaryMin?.toLocaleString("en-IN") ?? "";
    const max = job.salaryMax?.toLocaleString("en-IN") ?? "";
    const range = min && max ? `${min} – ${max}` : min || max;
    return `${job.currency} ${range}${job.salaryType === "monthly" ? "/mo" : "/yr"}`;
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "Co";

  // Pagination range
  const paginationPages = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (page >= totalPages - 3)
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  // Active filter chips data
  const activeChips = [
    selectedLocation && {
      label: selectedLocation,
      clear: () => setSelectedLocation(""),
    },
    selectedExperience && {
      label: `${selectedExperience} yrs`,
      clear: () => setSelectedExperience(""),
    },
    selectedJobType && {
      label: selectedJobType,
      clear: () => setSelectedJobType(""),
    },
    selectedIndustry && {
      label: selectedIndustry,
      clear: () => setSelectedIndustry(""),
    },
    selectedCategory && {
      label: selectedCategory,
      clear: () => setSelectedCategory(""),
    },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <section className="cw-section">
        {/* Blobs */}
        <div className="cw-blob cw-blob-1" />
        <div className="cw-blob cw-blob-2" />
        <div className="cw-blob cw-blob-3" />

        <div className="cw-container">
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="cw-header">
            <div className="cw-rise cw-rise-1">
              <div className="cw-eyebrow">
                <Sparkles size={10} />
                Open Positions
              </div>
              <h1 className="cw-heading">
                Career <span className="cw-heading-accent">With Us</span>
              </h1>
              <p className="cw-subtext">
                Discover exciting opportunities and join a dynamic team shaping
                the future of leadership.
              </p>
            </div>

            {/* Live count pill */}
            <div
              className="cw-live-pill cw-rise cw-rise-2"
              style={{ color: "" }}
            >
              <div className="cw-live-dot" />
              {jobs.length || 148} live positions
            </div>
          </div>

          {/* ── Filter card ─────────────────────────────────────────────────── */}
          <div className="cw-filter-card cw-rise cw-rise-3">
            {/* Search bar */}
            <div className="cw-search-wrap">
              <Search className="cw-search-icon" size={17} />
              <input
                type="text"
                className="cw-search-input"
                placeholder="Search by title, department, skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="cw-search-clear"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filters row */}
            <div className="cw-filter-row">
              <span className="cw-filter-label">
                <SlidersHorizontal size={12} /> Filters
              </span>

              {/* Location */}
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger className="cw-select-trigger w-[150px]">
                  <MapPin size={12} style={{ marginRight: 4, opacity: 0.5 }} />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bengaluru">Bengaluru</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                </SelectContent>
              </Select>

              {/* Experience */}
              {/* <Select
                value={selectedExperience}
                onValueChange={setSelectedExperience}
              >
                <SelectTrigger className="cw-select-trigger w-[150px]">
                  <Clock size={12} style={{ marginRight: 4, opacity: 0.5 }} />
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-2">0–2 years</SelectItem>
                  <SelectItem value="3-5">3–5 years</SelectItem>
                  <SelectItem value="6-10">6–10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select> */}

              {/* Job Type */}
              <Select
                value={selectedJobType}
                onValueChange={setSelectedJobType}
              >
                <SelectTrigger className="cw-select-trigger w-[145px]">
                  <Briefcase
                    size={12}
                    style={{ marginRight: 4, opacity: 0.5 }}
                  />
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-Time</SelectItem>
                  <SelectItem value="part-time">Part-Time</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>

              {/* Category */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="cw-select-trigger w-[155px]">
                  <Tag size={12} style={{ marginRight: 4, opacity: 0.5 }} />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Industry */}
              <Select
                value={selectedIndustry}
                onValueChange={setSelectedIndustry}
              >
                <SelectTrigger className="cw-select-trigger w-[155px]">
                  <Layers size={12} style={{ marginRight: 4, opacity: 0.5 }} />
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <button className="cw-clear-btn" onClick={clearAll}>
                  <X size={12} /> Clear all
                </button>
              )}
            </div>

            {/* Active chips */}
            {activeChips.length > 0 && (
              <div className="cw-filter-chips" style={{ marginTop: "0.85rem" }}>
                {activeChips.map((chip, i) => (
                  <span key={i} className="cw-chip">
                    {chip.label}
                    <button onClick={chip.clear}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Result count ─────────────────────────────────────────────────── */}
          <div className="cw-meta cw-rise cw-rise-4">
            {loading ? (
              <>
                <Loader2
                  size={15}
                  style={{
                    color: C.primary,
                    animation: "spin 1s linear infinite",
                  }}
                />
                Loading positions…
              </>
            ) : (
              <>
                Showing <strong>{jobs.length}</strong>&nbsp;
                {jobs.length === 1 ? "position" : "positions"}
                {hasActiveFilters && (
                  <span style={{ color: "#C7D2FE" }}> · filtered</span>
                )}
              </>
            )}
          </div>

          {/* ── Content ──────────────────────────────────────────────────────── */}
          {loading ? (
            <div className="cw-state-box">
              <Loader2
                size={36}
                style={{
                  color: C.primary,
                  marginBottom: "1rem",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p style={{ color: C.muted, fontSize: "0.9rem" }}>
                Fetching open positions…
              </p>
            </div>
          ) : error ? (
            <div className="cw-state-box">
              <div className="cw-state-icon-wrap">
                <Briefcase
                  size={32}
                  style={{ color: C.primary }}
                  strokeWidth={1.5}
                />
              </div>
              <div className="cw-state-title">Couldn't load positions</div>
              <p className="cw-state-desc">{error}</p>
              <button className="cw-state-btn" onClick={() => fetchJobs()}>
                Try Again
              </button>
            </div>
          ) : jobs.length > 0 ? (
            <>
              <div className="cw-grid">
                {jobs.map((job: any) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    formatSalary={formatSalary}
                    getInitials={getInitials}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="cw-pagination" aria-label="Pagination">
                  <button
                    className="cw-pg-btn"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={15} /> Prev
                  </button>

                  {paginationPages().map((p, i) =>
                    p === "..." ? (
                      <span key={`d${i}`} className="cw-pg-dots">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        className={`cw-pg-btn${p === page ? " active" : ""}`}
                        onClick={() => setPage(Number(p))}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    className="cw-pg-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next <ChevronRight size={15} />
                  </button>
                </nav>
              )}
            </>
          ) : (
            /* Empty state */
            <div className="cw-state-box">
              <div className="cw-state-icon-wrap">
                <Briefcase
                  size={32}
                  style={{ color: C.primary }}
                  strokeWidth={1.5}
                />
              </div>
              <div className="cw-state-title">No matching positions</div>
              <p className="cw-state-desc">
                Try adjusting your filters or search terms to discover more
                opportunities.
              </p>
              {hasActiveFilters && (
                <button className="cw-state-btn" onClick={clearAll}>
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
