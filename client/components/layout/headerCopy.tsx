"use client";

import { ArrowRight, X, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import logo from "../../assets/logo/logo.svg";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

interface MenuItem {
  label: string;
  href?: string;
  subItems?: MenuItem[];
}

const MENU_ITEMS: MenuItem[] = [
  { label: "Jobs", href: "Jobs" },
  { label: "Companies", href: "#companies" },
  {
    label: "Services",
     href: "#Services"
    // subItems: [
    //   { label: "Recruitment", href: "#recruitment" },
    //   { label: "Training", href: "#training" },
    //   { label: "Consulting", href: "#consulting" },
    // ],
  },
  // {
  //   label: "Industries We Serve",
  //   subItems: [
  //     { label: "IT & Software", href: "#it" },
  //     { label: "Healthcare", href: "#healthcare" },
  //     { label: "Finance", href: "#finance" },
  //     { label: "Manufacturing", href: "#manufacturing" },
  //   ],
  // },
  { label: "Why Us", href: "#why-us" },
  { label: "Clients", href: "#clients" },
  { label: "Contact", href: "#contact" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => {
    setIsOpen(false);
    setOpenSubmenu(null);
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top announcement bar */}
      <div className="w-full bg-red-50 border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-2.5 text-sm md:text-base gap-2 flex-wrap">
            <span className="font-medium text-gray-700">
              Get your dream job with
            </span>
            <Link
              href="#"
              className="group inline-flex underline items-center font-bold text-red-700 hover:text-red-800 transition-colors"
            >
              Career Kendra
              <ArrowRight
                size={16}
                className="ml-1.5 transition-transform duration-300 group-hover:translate-x-1.5"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="shrink-0">
              <Link href="/" className="block">
                <Image
                  src={logo}
                  alt="Career Kendra Logo"
                  className="h-8 md:h-10 w-auto"
                  priority
                />
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {MENU_ITEMS.map((item) => (
                <div key={item.label} className="group relative">
                  {item.subItems ? (
                    <>
                      <button className="flex items-center text-gray-700 hover:text-red-600 transition-colors duration-200 py-2 focus:outline-none">
                        {item.label}
                        <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
                      </button>

                      <div className="absolute left-0 top-full z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-sm  ring-opacity-5 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                        <div className="py-2">
                          {item.subItems.map((sub) => (
                            <a
                              key={sub.label}
                              href={sub.href}
                              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                            >
                              {sub.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                   <Link
  href={item.href ?? "#"}
  className="text-gray-700 hover:text-red-600 transition-colors duration-200 py-2 block"
>
  {item.label}
</Link>

                  )}
                </div>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href={"/auth/login"}>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                  Log in
                </button>
              </Link>
              <Link href={"/post-job"}>
                   <Button  variant="destructive">Post Job</Button>
              </Link>
         
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Slide in from right */}
        <div
          className={`fixed inset-y-0 right-0 z-50 w-4/5 max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="text-lg font-bold text-gray-900">Menu</div>
              <button
                onClick={closeMenu}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="h-6 w-6 text-gray-700" />
              </button>
            </div>

            {/* Mobile Menu items with Accordion */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <nav className="flex flex-col space-y-2">
                {MENU_ITEMS.map((item) => (
                  <div key={item.label}>
                    {item.subItems ? (
                      <>
                        <button
                          onClick={() => toggleSubmenu(item.label)}
                          className="flex items-center justify-between w-full px-4 py-1.5 text-gray-800 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200 text-lg font-medium"
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`h-5 w-5 transition-transform duration-300 ${
                              openSubmenu === item.label ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Accordion Submenu */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            openSubmenu === item.label ? "max-h-96" : "max-h-0"
                          }`}
                        >
                          <div className="bg-gray-50 py-3 pl-10 pr-4 flex flex-col space-y-3">
                            {item.subItems.map((sub) => (
                              <a
                                key={sub.label}
                                href={sub.href}
                                className="block py-2 text-gray-700 hover:text-red-700 transition-colors text-base"
                                onClick={closeMenu}
                              >
                                {sub.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <a
                        href={item.href}
                        className="block px-4 py-1.5 text-gray-800 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200 text-lg font-medium"
                        onClick={closeMenu}
                      >
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Mobile CTA */}
            <div className="border-t border-gray-100 p-6 space-y-4">
              <button
                onClick={closeMenu}
                className="w-full py-3 px-4 text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Log in
              </button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={closeMenu}
              >
                Post Job
              </Button>
            </div>
          </div>
        </div>

        {/* Overlay when mobile menu is open */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
            onClick={closeMenu}
          />
        )}
      </nav>
    </header>
  );
};

export default Header;
