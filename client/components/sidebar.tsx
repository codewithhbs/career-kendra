"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { IMAGE_URL } from "@/constant/api";

// Import shadcn/ui Avatar components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  tab: string;
  badge?: number;
}

interface SidebarProps {
  navItems: NavItem[];
  unreadMessages?: number;
  unreadNotifications?: number;
  profile?: any;
}

export default function Sidebar({
  profile,
  navItems,
  unreadMessages = 0,
  unreadNotifications = 0,
}: SidebarProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";
  const [isOpen, setIsOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    router.push(`/auth/profile?tab=${tab}`);
    setIsOpen(false);
  };

  const getNavItems = () => {
    return navItems.map((item) => {
      if (item.tab === "messages") {
        return { ...item, badge: unreadMessages };
      }
      if (item.tab === "notifications") {
        return { ...item, badge: unreadNotifications };
      }
      return item;
    });
  };

  // Clean image URL
  const profileImageSrc = profile?.profileImage
    ? `${IMAGE_URL.replace(/\/$/, "")}/${profile.profileImage.replace(/^\//, "")}`
    : undefined; // ← undefined = no image → fallback activates

  // Generate initials (e.g. "John Doe" → "JD")
  const getInitials = () => {
    const name = profile?.user?.userName || "User";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 lg:z-auto lg:static lg:block w-72 bg-white border-r border-gray-200 shadow-lg lg:shadow-none transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Header */}
        <Link href={"/"}>
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                AJ
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">CareerKandraJobs</p>
                <p className="text-xs text-gray-600">Find Your Dream Job</p>
              </div>
            </div>
          </div></Link>

   

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {getNavItems().map((item) => {
              const isActive = currentTab === item.tab;
              return (
                <li key={item.tab}>
                  <button
                    onClick={() => handleTabChange(item.tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${isActive
                        ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 font-semibold border border-amber-200"
                        : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <span
                      className={`flex-shrink-0 ${isActive ? "text-amber-600" : "text-gray-500"
                        }`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                    {isActive && !item.badge && (
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                logout();
                router.push("/");
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}