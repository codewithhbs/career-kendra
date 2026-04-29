"use client";

import React, { useEffect, useState } from "react";
import { Menu, Search, Bell, Settings, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { format } from "date-fns";
import axios from "axios";

const DASHBOARD_API = "https://api.careerkendra.com/api/v1/auth-employer/dashboard";

interface AdminHeaderProps {
  onMenuClick?: () => void;
  onLogout?: () => void;
  image?: string;
  companyEmail?: string;
  name?: string;
  companyName?: string;
  token?: string;                    // Add token prop
}

interface Notification {
  id: number;
  content: string;
  sentAt: string;
  isRead: boolean;
  applicationId?: number;
}

export function AdminHeader({
  onMenuClick,
  onLogout,
  image,
  companyEmail,
  name,
  companyName,
  token,                       // Receive token from parent
}: AdminHeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const { company, user } = useEmployerAuthStore();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch(DASHBOARD_API, {
        credentials: "include",
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.recentMessages) {
          setNotifications(result.recentMessages);
          const unread = result.recentMessages.filter((n: Notification) => !n.isRead).length;
          setUnreadCount(unread);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark message as read (using your logic)
  const markAsRead = async (msgId: number) => {
    if (!token) return;

    try {
      await axios.put(
        `/auth/mark-message-read/${msgId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update UI instantly
      setNotifications((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, isRead: true } : m
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Optional: Refresh full list
      // fetchNotifications();

    } catch (error) {
      console.error("Failed to mark message as read", error);
    }
  };

  const markAllAsRead = async () => {
    if (!token || notifications.length === 0) return;

    try {
      // Mark all unread messages as read
      const unreadMessages = notifications.filter(n => !n.isRead);
      
      await Promise.all(
        unreadMessages.map(msg =>
          axios.put(
            `/auth/mark-message-read/${msg.id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      // Update UI
      setNotifications((prev) => prev.map((m) => ({ ...m, isRead: true })));
      setUnreadCount(0);

    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">{company?.employer?.employerName?.charAt(0) || user?.employerName?.charAt(0) || "E"}</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-semibold text-lg tracking-tight text-gray-900">
                {company?.employer?.employerName || user?.employerName || "Employer"}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md ml-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search candidates, jobs..."
                className="pl-10 bg-gray-50 border-gray-200 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-9 w-9 border border-orange-200">
                  <AvatarImage src={image} />
                  <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold">
                    {companyName?.charAt(0)?.toUpperCase() || "E"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={image} />
                    <AvatarFallback className="bg-orange-600 text-white text-xl">
                      {companyName?.charAt(0)?.toUpperCase() || "E"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{name || "Admin User"}</p>
                    <p className="text-sm text-gray-500 truncate">{companyEmail}</p>
                    <p className="text-xs text-orange-600">{companyName}</p>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/" className="cursor-pointer">
                  <Home className="mr-3 h-4 w-4" />
                  Go to Homepage
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/employer/settings" className="cursor-pointer">
                  <Settings className="mr-3 h-4 w-4" />
                  Company Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem 
                onClick={onLogout} 
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}