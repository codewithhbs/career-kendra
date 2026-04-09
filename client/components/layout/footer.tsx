"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/user_axios";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Heart,
  ArrowRight,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

const Footer: React.FC = () => {
  const { settings, fetchSettings } = useSettings();
  const [pages, setPages] = useState<any[]>([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchSettings();
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await axiosInstance.get("/pages");

      const publishedPages = res.data.data.filter(
        (page: any) => page.status === "published",
      );

      setPages(publishedPages);
    } catch (error) {
      console.error("Pages fetch error:", error);
    }
  };

  const socialLinks = [
    { icon: Facebook, href: settings?.facebookUrl, label: "Facebook" },
    { icon: Twitter, href: settings?.twitterUrl, label: "Twitter" },
    { icon: Linkedin, href: settings?.linkedinUrl, label: "LinkedIn" },
    { icon: Instagram, href: settings?.instagramUrl, label: "Instagram" },
  ];

  return (
    <footer className="relative w-full bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-gray-300">
      <div className="relative z-10">
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16 pb-16 border-b border-gray-700/50">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {settings?.siteLogo && (
                    <img
                      src={settings.siteLogo}
                      alt={settings.siteName}
                      className="h-10 w-auto"
                    />
                  )}

                  <span className="text-xl font-bold text-white">
                    {settings?.siteName}
                  </span>
                </div>

                <p className="text-sm text-gray-400 leading-relaxed font-light max-w-md">
                  {settings?.siteTagline}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-400 hover:text-amber-500">
                  <Mail size={16} />
                  <a href={`mailto:${settings?.contactEmail}`}>
                    {settings?.contactEmail}
                  </a>
                </div>

                <div className="flex items-center gap-3 text-gray-400 hover:text-amber-500">
                  <Phone size={16} />
                  <a href={`tel:${settings?.contactPhone}`}>
                    {settings?.contactPhone}
                  </a>
                </div>

                <div className="flex items-start gap-3 text-gray-400">
                  <MapPin size={16} className="mt-1" />
                  <address className="not-italic">
                    {settings?.address}
                    <br />
                    {settings?.city}, {settings?.state} {settings?.pincode}
                    <br />
                    {settings?.country}
                  </address>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-3">
              <h4 className="text-lg font-bold text-white mb-4">
                Subscribe to Our Newsletter
              </h4>

              <p className="text-sm text-gray-400 mb-6 font-light">
                Get the latest insights and updates delivered to your inbox.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:border-amber-500 outline-none"
                />

                <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold flex items-center gap-2">
                  Subscribe <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-16 pb-16 border-b border-gray-700/50">
            {/* Dynamic Pages */}
            <div>
              <h5 className="text-white font-bold text-sm uppercase tracking-widest mb-6">
                Pages
              </h5>

              <ul className="space-y-3">
                {pages.map((page) => (
                  <li key={page.id}>
                    <Link
                      href={`/pages/${page.slug}`}
                      className="text-gray-400 hover:text-amber-500 text-sm"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="text-white font-bold text-sm uppercase tracking-widest mb-6">
                Quick Links
              </h5>

              <ul className="space-y-3 flex flex-col">
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-amber-500 text-sm"
                  >
                    Home
                  </Link>
                </li>

                <li>
                  <Link
                    href="/about"
                    className="text-gray-400 hover:text-amber-500 text-sm"
                  >
                    About Us
                  </Link>
                </li>

                <li>
                  <Link
                    href="/gallery"
                    className="text-gray-400 hover:text-amber-500 text-sm"
                  >
                    Gallery
                  </Link>
                </li>

                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-amber-500 text-sm"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h5 className="text-white font-bold text-sm uppercase tracking-widest mb-6">
                Follow Us
              </h5>

              <div className="flex items-center gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;

                  if (!social.href) return null;

                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-amber-500 hover:to-orange-600 text-gray-400 hover:text-white flex items-center justify-center transition-all"
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-gray-500">
              {settings?.footerText || `© ${currentYear} ${settings?.siteName}`}
            </div>

            <div className="text-sm text-gray-500">
              Made by{" "}
              <a
                href="https://hoverbusinessservices.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-400 font-medium"
              >
                Hover Business Services LLP
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
