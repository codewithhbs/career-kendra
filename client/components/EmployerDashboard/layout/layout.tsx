"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { AdminHeader } from "./header";
import { AdminSidebar } from "./Sidebar";
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import { IMAGE_URL } from "@/constant/api";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const {
    company,
    isAuthenticated,
    token,
    loading: authLoading,
    error: authError,
    logout,
    EmployerInitAuth,
    fetchCompanyProfile,
  } = useEmployerAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        setIsCheckingAuth(true);

        await EmployerInitAuth();

        const authState = useEmployerAuthStore.getState().isAuthenticated;


        if (authState) {
          await fetchCompanyProfile();
        } else {
          router.replace("/auth/login-employers");
        }
      } catch (err: any) {
        toast.error("Session expired. Please login again.");
        logout();
        router.replace("/auth/login-employers");
      } finally {
        console.log("🏁 Auth initialization complete");
        setIsCheckingAuth(false);
      }
    };

    init();
  }, []); // ❗ IMPORTANT: Empty dependency
  // Redirect if not authenticated (after init check)
  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      toast.error("Please login to access this page");
      logout();
      router.replace("/auth/login-employers");
    }
  }, []);

  // Show full-screen loader during initial auth check
  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50/80 z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If somehow still not authenticated after checks → redirect (safety net)
  if (!isAuthenticated) {
    return null; // will be caught by the effect above
  }

  const companyLogoSrc = company?.companyLogo
    ? `${IMAGE_URL.replace(/\/$/, "")}/${company.companyLogo.replace(/^\//, "")}`
    : undefined;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - mobile controlled by state */}
      <AdminSidebar
        image={companyLogoSrc}
        companyName={company?.companyName}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header with mobile menu toggle */}
        <AdminHeader
          onLogout={() => {
            logout();
            toast.success("Logged out successfully");
            router.replace("/");
          }}
          image={companyLogoSrc}
          token={token ? token : undefined}
          name={company?.employer?.employerName || "Employer"}
          companyName={company?.companyName || "Your Company"}
          companyEmail={company?.companyEmail}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {/* Optional padding wrapper */}
          <div className="h-full px-4 py-6 sm:px-6 lg:px-8">
            {authError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {authError || "Failed to load company profile. Some features may be limited."}
              </div>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}