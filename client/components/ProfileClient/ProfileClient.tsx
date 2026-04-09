"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  Bell,
  MessageSquare,
  Settings,
  Star,
  Clock,
} from "lucide-react";

import Sidebar from "@/components/sidebar";
import ProfileHeader from "@/components/profile-header";
import OverviewTab from "@/components/overview-tab";
import ApplicationsTab from "@/components/applications-tab";
import SavedTab from "@/components/saved-tab";
import MessagesTab from "@/components/messages-tab";
import NotificationsTab from "@/components/notifications-tab";
import RecommendationsTab from "@/components/recommendations-tab";
import SettingsTab from "@/components/settings-tab";
import { useAuthStore } from "@/store/auth.store";
import axios from "axios";
import { API_URL } from "@/constant/api";
import MyInterView from "../MyInterView";

axios.defaults.baseURL = API_URL;

const navItems = [
  { label: "Overview", icon: <LayoutDashboard size={20} />, tab: "overview" },
  { label: "My Applications", icon: <Briefcase size={20} />, tab: "applications" },
  { label: "Saved Jobs", icon: <Bookmark size={20} />, tab: "saved" },
  { label: "Interviews", icon: <Clock size={20} />, tab: "interviews" },
  { label: "Messages", icon: <MessageSquare size={20} />, tab: "messages" },
  // { label: "Notifications", icon: <Bell size={20} />, tab: "notifications" },
  // { label: "Recommended", icon: <Star size={20} />, tab: "recommendations" },
  { label: "Settings", icon: <Settings size={20} />, tab: "settings" },
];

export default function ProfileClient() {
  const searchParams = useSearchParams();
  const { profile, getProfile, token } = useAuthStore();
  const [unreadMessages, setUnreadMessages] = useState(0);

  // ✅ Memoized current tab (safe for rerenders)
  const currentTab = useMemo(() => {
    return searchParams.get("tab") || "overview";
  }, [searchParams]);


  const fetchUnreadMessages = async () => {
    try {
      const res = await axios.get("/auth/get-unread-message-count", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Unread count response:", res.data);
      if (res.data?.success) {
        setUnreadMessages(res.data.data.count);
      }
    } catch (error) {
      console.error("Unread count error:", error);
    }
  };

  useEffect(() => {
    fetchUnreadMessages()
    getProfile();
  }, [getProfile, token]);

  const renderTabContent = () => {
    switch (currentTab) {
      case "applications":
        return <ApplicationsTab />;
      case "saved":
        return <SavedTab />;
      case "messages":
        return <MessagesTab fetchUnreadMessages={fetchUnreadMessages} />;
      case "notifications":
        return <NotificationsTab />;
      case "recommendations":
        return <RecommendationsTab />;
      case "interviews":
        return <MyInterView />;
      case "settings":
        return <SettingsTab />;
      case "overview":
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-40 lg:z-30 w-72 transform transition-transform lg:translate-x-0">
          <Sidebar
            profile={profile}
            navItems={navItems}
            unreadMessages={unreadMessages || 0}
            unreadNotifications={3}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 min-w-0">
          {/* Header */}
          <ProfileHeader profile={profile} onEditClick={() => { }} />

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}