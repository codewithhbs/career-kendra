"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./header";
import Footer from "./footer";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import { useSettings } from "@/hooks/useSettings";
import { TooltipProvider } from "../ui/tooltip";
import Link from "next/link";
import { MessageCircle, Home, Briefcase, User } from "lucide-react";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initAuth } = useAuthStore();
  const { EmployerInitAuth } = useEmployerAuthStore();
  const { settings, fetchSettings } = useSettings();

  const pathname = usePathname();

  const isAuthRoute = pathname.startsWith("/auth") || pathname.startsWith("/employer")  || pathname.startsWith("/job-posting");
  const showHeader = !isAuthRoute;
  const showFooter = !isAuthRoute;

  const whatsappNumber = settings?.whatsappNumber || "+91 9876541111";
  const siteName = settings?.siteName || "Career Kendra";

  // Initialize auth & settings
  useEffect(() => {
    initAuth();
    EmployerInitAuth();
    fetchSettings();
  }, [initAuth, EmployerInitAuth, fetchSettings]);

  // WhatsApp Click Handler
  const openWhatsApp = () => {
    const message = encodeURIComponent(`Hello ${siteName}, I need assistance.`);
    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${message}`, "_blank");
  };

  return (
    <>
      <TooltipProvider>
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

        {/* Header */}
        {showHeader && <Header />}

        {/* Main Content */}
        <main className={`min-h-screen ${showHeader ? "pt-0" : ""}`}>
          {children}
        </main>

        {/* Footer */}
        {showFooter && <Footer />}

        {/* Floating WhatsApp Button */}
        {showHeader && settings && (
          <button
            onClick={openWhatsApp}
            className="fixed bottom-26 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
            aria-label="Chat on WhatsApp"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="h-7 w-7" />
          </button>
        )}

        {/* Bottom Navigation for Mobile (Non-auth pages) */}
        {showHeader && (
          <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-around py-2">
                <Link
                  href="/"
                  className="flex flex-col items-center justify-center py-1 px-3 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Home className="h-6 w-6" />
                  <span className="text-[10px] mt-0.5 font-medium">Home</span>
                </Link>

                <Link
                  href="/jobs"
                  className="flex flex-col items-center justify-center py-1 px-3 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Briefcase className="h-6 w-6" />
                  <span className="text-[10px] mt-0.5 font-medium">Jobs</span>
                </Link>

                {settings?.maintenanceMode !== true && (
                  <Link
                    href="/#clients"
                    className="flex flex-col items-center justify-center py-1 px-3 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <User className="h-6 w-6" />
                    <span className="text-[10px] mt-0.5 font-medium">Clients</span>
                  </Link>
                )}

                <Link
                  href={pathname.startsWith("/auth") ? "/auth/login" : "/auth/profile"}
                  className="flex flex-col items-center justify-center py-1 px-3 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <User className="h-6 w-6" />
                  <span className="text-[10px] mt-0.5 font-medium">Account</span>
                </Link>
              </div>
            </div>
          </nav>
        )}

        {/* Extra padding for mobile bottom nav */}
        {showHeader && <div className="h-16 md:hidden" />}
      </TooltipProvider>
    </>
  );
}