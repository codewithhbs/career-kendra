"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Briefcase,
  MessageSquare,
  Bell,
  Building2,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
interface AdminSidebarProps {
  open?: boolean;
  image?: string;
  companyName?: string;
  onClose?: () => void;
}

const navigationItems = [
  {
    title: "Overview",
    items: [{ icon: LayoutDashboard, label: "Dashboard", href: "/employer/profile" }],
  },
  {
    title: "Company",
    items: [
      { icon: Building2, label: "Company Profile", href: "/employer/profile?tab=company" },
    ],
  },
  {
    title: "Jobs",
    items: [
      { icon: Briefcase, label: "Post a Job", href: "/employer/profile?tab=post-jobs" },
      { icon: FileText, label: "My Jobs", href: "/employer/profile?tab=my-jobs" },
      { icon: Users, label: "Applications", href: "/employer/profile?tab=applications" },
    ],
  },
  {
    title: "Communication",
    items: [
      { icon: MessageSquare, label: "Messages", href: "/employer/profile?tab=messages" },
      { icon: Bell, label: "Interviews", href: "/employer/profile?tab=interviews" },
    ],
  },
  {
    title: "Account",
    items: [{ icon: Settings, label: "Settings", href: "/employer/profile?tab=settings" }],
  },
];

export function AdminSidebar({
  open = true,
  onClose,
  image,
  companyName,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative md:translate-x-0 inset-y-0 left-0 z-50 w-64 bg-white border-r border-orange-100 transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <ScrollArea className="h-full">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-orange-100 px-5 gap-2 sticky top-0 bg-white">
            <h1 className="text-lg font-bold text-orange-600 flex items-center gap-2.5">
              <Avatar className="shadow-sm rounded-none bg-transparent border-0">
                <AvatarImage src={image || ""} className="object-contain bg-transparent border-0" width={12} height={12} alt="Company Logo" />
                <AvatarFallback className="bg-orange-600 text-white text-xs font-semibold">
                  {companyName?.charAt(0)?.toUpperCase() || "E"}
                </AvatarFallback>
              </Avatar>

              <span className="hidden sm:inline">{companyName}</span>
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden text-orange-600 hover:bg-orange-50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="space-y-6 px-3 py-6">
            {navigationItems.map((section) => (
              <div key={section.title}>
                <p className="px-3 text-xs font-semibold text-orange-600/80 uppercase tracking-wider mb-2">
                  {section.title}
                </p>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <li key={item.href}>
                        <Link href={item.href}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-3 h-10 px-4 text-sm font-medium transition-all rounded-lg",
                              isActive
                                ? "bg-orange-50 text-orange-700 border border-orange-200 font-medium shadow-sm"
                                : "text-gray-700 hover:bg-orange-50/70 hover:text-orange-700",
                            )}
                            onClick={onClose}
                          >
                            <Icon
                              className={cn(
                                "h-4.5 w-4.5 flex-shrink-0",
                                isActive
                                  ? "text-orange-600"
                                  : "text-orange-500/80",
                              )}
                            />
                            <span className="flex-1 text-left">
                              {item.label}
                            </span>
                            {isActive && (
                              <ChevronRight className="h-4 w-4 text-orange-500 opacity-90" />
                            )}
                          </Button>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}
