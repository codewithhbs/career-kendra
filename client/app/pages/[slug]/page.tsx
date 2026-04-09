"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/user_axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

interface PageData {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export default function DynamicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      const res = await axiosInstance.get(`/pages/slug/${slug}`);
      const pageData = res.data.data;
      setPage(pageData);

      if (pageData.metaTitle) document.title = pageData.metaTitle;
      setMeta("description", pageData.metaDescription || "");
      setMeta("keywords", pageData.metaKeywords || "");
      if (pageData.ogImage) setMeta("og:image", pageData.ogImage);
    } catch (error) {
      console.error("Page fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const setMeta = (name: string, content: string) => {
    if (!content) return;
    let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
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

  /* ── Not Found ── */
  if (!page) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        style={{ background: "#fff8ec" }}
      >
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-white border border-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-2xl">😕</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-1">
            Page Not Found
          </h2>
          <p className="text-gray-400 text-sm">
            The page you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ══ Breadcrumb Bar ══ */}
      <div
        className="sticky top-0 z-20 border-b border-orange-100"
        style={{ background: "#fff8ec" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1 text-[#fe9a00] hover:text-orange-600 transition-colors font-medium"
                >
                  <Home size={14} className="text-[#fe9a00]" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <ChevronRight size={13} className="text-orange-300" />
              </li>
              <li>
                <span className="text-gray-500 truncate max-w-[220px] sm:max-w-xs block">
                  {page.title}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ══ Hero / Title Section (cream) ══ */}
      <div
        style={{ background: "#fff8ec" }}
        className="border-b border-orange-100 py-5"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          {/* Decorative top pill */}
          {/* <div className="inline-flex items-center gap-1.5 bg-white border border-orange-200 text-[#fe9a00] text-xs font-semibold px-3 py-1 rounded-full mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fe9a00] inline-block" />
            Page
          </div> */}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            {page.title}
          </h1>

          {/* orange underline accent */}
          <div className="mt-5 flex justify-center">
            <span
              className="block h-1 w-16 rounded-full"
              style={{ background: "#fe9a00" }}
            />
          </div>
        </div>
      </div>

      {/* ══ Main Content (white) ══ */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div
            className="
prose max-w-none

/* Typography Base */
prose-base sm:prose-lg
prose-p:leading-7 prose-p:text-gray-700
prose-strong:text-gray-900 prose-strong:font-semibold

/* Headings */
prose-headings:text-gray-900 prose-headings:font-bold
prose-headings:tracking-tight
prose-h1:text-3xl sm:prose-h1:text-4xl prose-h1:mb-6
prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-5
prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4

/* Links */
prose-a:text-[#fe9a00] prose-a:font-medium
hover:prose-a:text-[#d97706] hover:prose-a:underline

/* Lists */
prose-ul:my-5 prose-ol:my-5
prose-li:mb-2 prose-li:text-gray-700

/* Blockquote (Premium Card Style) */
prose-blockquote:border-none
prose-blockquote:bg-gradient-to-r prose-blockquote:from-orange-50 prose-blockquote:to-orange-100
prose-blockquote:rounded-2xl
prose-blockquote:px-6 prose-blockquote:py-5
prose-blockquote:text-gray-700
prose-blockquote:shadow-sm
prose-blockquote:relative

/* Add accent line */
prose-blockquote:before:content-['']
prose-blockquote:before:absolute
prose-blockquote:before:left-0
prose-blockquote:before:top-0
prose-blockquote:before:h-full
prose-blockquote:before:w-1.5
prose-blockquote:before:bg-[#fe9a00]
prose-blockquote:before:rounded-l-2xl

/* Images */
prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8

/* HR */
prose-hr:my-10 prose-hr:border-gray-200

/* Tables (if any) */
prose-table:border prose-table:border-gray-200
prose-th:bg-gray-50 prose-th:text-gray-800
prose-td:text-gray-600

/* Code */
prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded-md
prose-pre:bg-gray-900 prose-pre:text-white prose-pre:rounded-xl
"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>

      {/* ══ CTA Strip (cream) ══ */}
      <div
        style={{ background: "#fff8ec" }}
        className="border-t border-orange-100"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-0.5">
              Have questions?
            </p>
            <p className="text-xs text-gray-400">
              Reach out — we'd love to help you.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 shadow-sm"
            style={{ background: "#fe9a00" }}
          >
            Contact Us
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* scrollbar */}
      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #fff8ec; }
        ::-webkit-scrollbar-thumb { background: #fed7a0; border-radius: 99px; }
      `}</style>
    </div>
  );
}
