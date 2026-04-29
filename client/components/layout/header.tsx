"use client";

import { useEffect, useState } from "react";
import { X, LogOut, Menu, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import { useSettings } from "@/hooks/useSettings";

const MENU_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
  { label: "Find Jobs", href: "/jobs", highlight: true },
] as const;

export default function Header() {
  const { settings, fetchSettings } = useSettings();

  const {
    isAuthenticated: isEmployeeAuth,
    user: employeeUser,
    logout: employeeLogout,
  } = useAuthStore();

  const { isAuthenticated: isEmployerAuth, logout: employerLogout } =
    useEmployerAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);

  // Determine active auth state
  const isEmployeeLoggedIn = isEmployeeAuth;
  const isEmployerLoggedIn = isEmployerAuth;
  const isLoggedIn = isEmployeeLoggedIn || isEmployerLoggedIn;

  const activeUser = isEmployeeLoggedIn ? employeeUser : null;
  const activeLogout = isEmployeeLoggedIn
    ? employeeLogout
    : isEmployerLoggedIn
      ? employerLogout
      : undefined;

  const profileLink = isEmployeeLoggedIn
    ? "/auth/profile"
    : isEmployerLoggedIn
      ? "/employer/profile"
      : "/auth/login";

  const userDisplayName = activeUser?.name || "Profile";

  // Dynamic Logo
  const logoSrc = settings?.siteLogo || "/assets/logo/logo.svg";
  const siteName = settings?.siteName || "Career Kendra";

  // Handlers
  const closeMobileMenu = () => setMobileOpen(false);

  const handleHashScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href?: string,
  ) => {
    if (!href || !href.startsWith("#")) return;
    e.preventDefault();
    const targetId = href.slice(1);
    const target = document.getElementById(targetId);

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.href = `/#${targetId}`;
    }
    closeMobileMenu();
  };

  const handleLogout = () => {
    activeLogout?.();
    closeMobileMenu();
    window.location.reload();
  };

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const isMaintenanceMode = settings?.maintenanceMode === true;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      {/* Maintenance Mode Banner */}
      {isMaintenanceMode && (
        <div className="bg-amber-500 text-white py-2.5 text-center text-sm font-medium flex items-center justify-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>
            The website is currently under maintenance. Some features may be
            unavailable.
          </span>
        </div>
      )}

      {/* Main Navbar */}
      <nav className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="shrink-0 flex items-center gap-3 h-full">
              <div
                className="relative w-auto h-full"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={logoSrc}
                  alt={`${siteName} Logo`}
                  className="h-full w-auto object-contain"
                  width={180}
                  height={60}
                />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                {siteName}
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-10">
              {/* Navigation Links */}
              <div className="flex items-center gap-8">
                {MENU_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleHashScroll(e, item.href)}
                    className={
                      "highlight" in item && item.highlight
                        ? "bg-red-600 text-white px-4 py-1.5 rounded-full font-semibold hover:bg-red-700 transition-colors"
                        : "text-gray-700 hover:text-red-600 font-medium transition-colors"
                    }
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Auth Section */}
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <Link href={profileLink}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-[140px]"
                    >
                      {userDisplayName}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Register for Jobs
                    </Button>
                  </Link>
                  <Link href="/auth/login-employers">
                    <Button variant="destructive" size="sm">
                      Hire Staff
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[60] w-4/5 max-w-xs bg-white shadow-2xl transform transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b">
            <span className="text-lg font-bold text-gray-900">{siteName}</span>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <X className="h-6 w-6 text-gray-700" />
            </button>
          </div>

          {/* Menu Links */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <nav className="flex flex-col space-y-1">
              {MENU_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    handleHashScroll(e, item.href);
                    closeMobileMenu();
                  }}
                  className={
                    "highlight" in item && item.highlight
                      ? "block px-5 py-3.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
                      : "block px-5 py-3.5 text-gray-800 hover:bg-red-50 hover:text-red-700 rounded-xl font-medium transition-all"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile Auth Section */}
          <div className="border-t border-gray-100 p-6 space-y-4">
            {isLoggedIn ? (
              <>
                <Link href={profileLink} onClick={closeMobileMenu}>
                  <Button variant="outline" className="w-full justify-start">
                    {userDisplayName}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={closeMobileMenu}>
                  <Button variant="outline" className="w-full">
                    Register for Jobs
                  </Button>
                </Link>
                <Link href="/auth/login-employers" onClick={closeMobileMenu}>
                  <Button variant="destructive" className="w-full">
                    Hire Staff
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </header>
  );
}