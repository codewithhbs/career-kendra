"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/lib/user_axios";
import {
  Star,
  Calendar,
  Tag,
  MessageSquare,
  CheckCircle,
  Home,
  ChevronRight,
  Quote,
  User,
  ThumbsUp,
} from "lucide-react";
import ContactSection from "../contact/ContactSection";

type Service = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  image: string;
  position: number;
  status: string;
  metaTitle: string;
  metaKeywords: string;
  tags: string[];
  comments: Array<{ message: string; commentedBy: string; status: string }>;
  reviews: {
    totalReviews: number;
    averageRating: number;
    items: Array<{ reviewer: string; rating: number; comment: string }>;
  };
  createdAt: string;
  updatedAt: string;
};

const StarRating = ({
  rating,
  size = 14,
}: {
  rating: number;
  size?: number;
}) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={size}
        className={
          n <= Math.round(rating)
            ? "fill-[#fe9a00] text-[#fe9a00]"
            : "fill-orange-100 text-orange-100"
        }
      />
    ))}
  </div>
);

/* ─── Breadcrumb ─── */
const Breadcrumb = ({ title }: { title: string }) => (
  <div
    style={{ background: "#fff8ec" }}
    className="border-b border-orange-100 sticky top-0 z-20"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-sm">
      <a
        href="/"
        className="flex items-center gap-1 text-[#fe9a00] hover:text-orange-600 transition-colors font-medium"
      >
        <Home size={14} className="text-[#fe9a00]" />
        <span>Home</span>
      </a>
      <ChevronRight size={13} className="text-orange-300" />
      <a
        href="/services"
        className="text-orange-400 hover:text-[#fe9a00] transition-colors"
      >
        Services
      </a>
      <ChevronRight size={13} className="text-orange-300" />
      <span className="text-gray-500 truncate max-w-[200px] sm:max-w-xs">
        {title}
      </span>
    </div>
  </div>
);

/* ─── Rating Bar ─── */
const RatingBar = ({ value, total }: { value: number; total: number }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="w-2">{""}</span>
      <div className="flex-1 h-1.5 bg-orange-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#fe9a00] rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right">{pct}%</span>
    </div>
  );
};

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/services/${id}`);
        const data = res.data.data || res.data;

        // ✅ Fix parsing
        data.comments =
          typeof data.comments === "string"
            ? JSON.parse(data.comments)
            : data.comments;

        data.tags =
          typeof data.tags === "string" ? JSON.parse(data.tags) : data.tags;

        data.reviews =
          typeof data.reviews === "string"
            ? JSON.parse(data.reviews)
            : data.reviews;
        if (data.image?.includes("https://api.careerkendra.comhttp")) {
          data.image = data.image.replace("https://api.careerkendra.com", "");
        }
        setService(data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load service details.");
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#fff8ec" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#fe9a00] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-orange-400 tracking-widest uppercase font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !service) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#fff8ec" }}
      >
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😕</span>
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-1">
            Service Not Found
          </p>
          <p className="text-gray-400 text-sm">
            {error ?? "The requested service could not be found."}
          </p>
        </div>
      </div>
    );
  }

  const publishedComments = service.comments.filter(
    (c) => c.status === "published",
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Breadcrumb ── */}
      <Breadcrumb title={service.title} />

      {/* ── Hero ── */}
      <div className="w-full h-56 sm:h-72 md:h-[400px] overflow-hidden relative">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover"
        />
        {/* subtle light overlay only at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
        {/* status badge on image */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
          <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-green-200 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm capitalize">
            <CheckCircle size={11} />
            {service.status}
          </span>
        </div>
      </div>

      {/* ── Main content wrapper ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 -mt-10 relative z-10 flex flex-col gap-0">
        {/* ══ 1. Title Card (white) ══ */}
        <section className="bg-white rounded-2xl shadow-md border border-orange-50 p-6 sm:p-8 mb-5">
          <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 leading-tight mb-3 tracking-tight">
            {service.title}
          </h1>

          <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
            {service.shortDescription}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <StarRating rating={service.reviews.averageRating} size={15} />
              <span className="text-sm font-bold text-[#fe9a00]">
                {service.reviews.averageRating}
              </span>
              <span className="text-xs text-gray-400">
                ({service.reviews.totalReviews} reviews)
              </span>
            </div>

            <span className="hidden sm:block w-px h-4 bg-orange-100" />

            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <Calendar size={12} className="text-[#fe9a00]" />
              <span>
                Updated{" "}
                {new Date(service.updatedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </section>

        {/* ══ 2. About / Long Description (cream) ══ */}
        <section
          style={{ background: "#fff8ec" }}
          className="rounded-2xl border border-orange-100 p-6 sm:p-8 mb-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1 h-5 rounded-full bg-[#fe9a00] inline-block" />
            <h2 className="text-base sm:text-lg font-bold text-gray-800">
              About This Service
            </h2>
          </div>
          <div
            className="prose prose-sm sm:prose max-w-none text-gray-600
              prose-headings:text-gray-800 prose-headings:font-bold
              prose-a:text-[#fe9a00] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-700
              prose-li:text-gray-600"
            dangerouslySetInnerHTML={{ __html: service.longDescription }}
          />
        </section>

        {/* ══ 3. Tags (white) ══ */}
        {service.tags?.length > 0 && (
          <section className="bg-white rounded-2xl border border-orange-50 shadow-sm p-6 sm:p-8 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={14} className="text-[#fe9a00]" />
              <h2 className="text-base font-bold text-gray-800">Key Areas</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {service.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-default"
                  style={{
                    background: "#fff8ec",
                    borderColor: "#fed7a0",
                    color: "#c97a00",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ══ 4. Reviews (cream) ══ */}
        {service.reviews.items.length > 0 && (
          <section
            style={{ background: "#fff8ec" }}
            className="rounded-2xl border border-orange-100 p-6 sm:p-8 mb-5"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Star size={15} className="text-[#fe9a00] fill-[#fe9a00]" />
                <h2 className="text-base font-bold text-gray-800">
                  Customer Reviews
                </h2>
              </div>

              {/* Summary box */}
              <div className="flex items-center gap-4 bg-white border border-orange-100 rounded-xl px-5 py-3 shadow-sm">
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-[#fe9a00] leading-none">
                    {service.reviews.averageRating}
                  </p>
                  <StarRating
                    rating={service.reviews.averageRating}
                    size={12}
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {service.reviews.totalReviews} reviews
                  </p>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[100px]">
                  {[5, 4, 3].map((star) => {
                    const count = service.reviews.items.filter(
                      (r) => Math.round(r.rating) === star,
                    ).length;
                    return (
                      <RatingBar
                        key={star}
                        value={count}
                        total={service.reviews.items.length}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Review cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {service.reviews.items.map((rev, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-orange-50 p-4 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-orange-100 text-[#fe9a00] font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {rev.reviewer[0].toUpperCase()}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {rev.reviewer}
                      </p>
                    </div>
                    <StarRating rating={rev.rating} size={12} />
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══ 5. Client Comments (white) ══ */}
        {publishedComments.length > 0 && (
          <section className="bg-white rounded-2xl border border-orange-50 shadow-sm p-6 sm:p-8 mb-5">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare size={14} className="text-[#fe9a00]" />
              <h2 className="text-base font-bold text-gray-800">
                What Clients Say
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {publishedComments.map((c, i) => (
                <div
                  key={i}
                  style={{ background: "#fff8ec" }}
                  className="rounded-xl border border-orange-100 p-5 flex flex-col gap-4 relative overflow-hidden"
                >
                  {/* decorative quote mark */}
                  <Quote
                    size={40}
                    className="absolute -top-2 -right-2 text-orange-100 rotate-180"
                    strokeWidth={1}
                  />
                  <p className="text-sm text-gray-600 leading-relaxed relative z-10">
                    {c.message}
                  </p>
                  <div className="flex items-center gap-2.5 pt-2 border-t border-orange-100">
                    <div className="w-8 h-8 rounded-full bg-[#fe9a00] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {c.commentedBy[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        {c.commentedBy}
                      </p>
                      <p className="text-[10px] text-orange-400 font-medium">
                        Verified Client
                      </p>
                    </div>
                    <ThumbsUp size={12} className="ml-auto text-orange-300" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Contact ── */}
      <ContactSection />

      {/* ── Global prose & scrollbar styles ── */}
      <style>{`
        * { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #fff8ec; }
        ::-webkit-scrollbar-thumb { background: #fed7a0; border-radius: 99px; }
      `}</style>
    </div>
  );
};

export default ServiceDetails;
