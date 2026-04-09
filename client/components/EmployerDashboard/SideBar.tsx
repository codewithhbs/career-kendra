"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LogOut,
  Menu,
  X,
  Building2,
  Briefcase,
  Users,
  FileText,
  Settings,
  LayoutDashboard,
  MessageSquare,
  Bell,
} from "lucide-react";
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import { IMAGE_URL } from "@/constant/api";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout, company, fetchCompanyProfile, loading } = useEmployerAuthStore();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!company) fetchCompanyProfile();
  }, [company, fetchCompanyProfile]);

  const currentTab = searchParams.get("tab") || "overview";

  const handleTabChange = (tab: string) => {
    router.push(`/employer/profile?tab=${tab}`);
    setIsOpen(false); // close drawer on mobile
  };

  const navItems = [
    { label: "Dashboard", tab: "overview", icon: <LayoutDashboard size={20} /> },
    { label: "Company Profile", tab: "company", icon: <Building2 size={20} /> },
    { label: "Post a Job", tab: "post-job", icon: <Briefcase size={20} /> },
    { label: "My Jobs", tab: "jobs", icon: <FileText size={20} /> },
    { label: "Applications", tab: "applications", icon: <Users size={20} /> },
    { label: "Messages", tab: "messages", icon: <MessageSquare size={20} /> },
    { label: "Notifications", tab: "notifications", icon: <Bell size={20} /> },
    { label: "Settings", tab: "settings", icon: <Settings size={20} /> },
  ];

  const companyLogoSrc = company?.companyLogo
    ? `${IMAGE_URL.replace(/\/$/, "")}/${company.companyLogo.replace(/^\//, "")}`
    : undefined;

  const getInitials = () => {
    const name = company?.companyName || "Co";
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-3 left-3 z-50 lg:hidden text-gray-700 hover:bg-orange-50"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {/* Sidebar / Drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-72 sm:w-80 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          overflow-y-auto
        `}
      >
        {/* Company header */}
        <div className="p-5 sm:p-6 border-b border-gray-100">
          {loading ? (
            <div className="animate-pulse flex items-center gap-3">
              <div className="w-14 h-14 bg-gray-200 rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-orange-100">
                {companyLogoSrc && (
                  <AvatarImage src={companyLogoSrc} alt={company?.companyName} className="object-contain" />
                )}
                <AvatarFallback className="text-xl sm:text-2xl font-semibold bg-gradient-to-br from-orange-50 to-amber-50 text-orange-800">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                  {company?.companyName || "Your Company"}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {company?.companyTagline || "Hiring made simple"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-3 py-5 sm:py-6">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = currentTab === item.tab;
              return (
                <li key={item.tab}>
                  <button
                    onClick={() => handleTabChange(item.tab)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm sm:text-base font-medium transition-all
                      ${isActive
                        ? "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200 shadow-sm font-semibold"
                        : "text-gray-700 hover:bg-orange-50/70 hover:text-orange-700"
                      }
                    `}
                  >
                    <span className={`flex-shrink-0 ${isActive ? "text-orange-600" : "text-gray-500"}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 mt-auto border-t border-gray-100 bg-gray-50/70">
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm sm:text-base font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay / backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}