// Navbar.tsx (ENHANCED WITH ANIMATED BELL INDICATOR)
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import toast from "react-hot-toast";
import GlobalSearch from "@/app/(protected)/profile/[[...params]]/components/common/GlobalSearch";
import NotificationDropdown from "../notifications/NotificationDropdown";
import { useNotifications } from "@/hooks/useNotifications"; // ENHANCED: Import updated hook
import {
  UserCircleIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BriefcaseIcon,
  UserGroupIcon,
  TrophyIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellIconSolid } from "@heroicons/react/24/solid";

const Navbar: React.FC = () => {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  // ENHANCED: Get both unread count AND new notification indicator
  const { unreadCount, hasNewNotifications, clearNewNotificationIndicators } =
    useNotifications();

  // State management
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Refs for dropdown management
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // NEW: Handle notification dropdown opening
  const handleNotificationDropdownToggle = () => {
    const wasOpen = isNotificationDropdownOpen;
    setIsNotificationDropdownOpen(!wasOpen);

    // If opening dropdown, clear the new notification indicators
    if (!wasOpen && hasNewNotifications) {
      // Small delay to allow dropdown to open first
      setTimeout(() => {
        clearNewNotificationIndicators();
      }, 100);
    }
  };

  // Navigation items
  const navigationItems = [
    {
      name: "Profile",
      href: "/profile",
      icon: UserCircleIcon,
      active: pathname === "/profile" || pathname.startsWith("/profile/"),
    },
    {
      name: "Athletes",
      href: "/athletes",
      icon: UserGroupIcon,
      active: pathname === "/athletes" || pathname.startsWith("/athletes/"),
      onClick: () => toast("Athletes page coming soon! 🚀", { icon: "👥" }),
    },
    {
      name: "Business",
      href: "/business",
      icon: BriefcaseIcon,
      active: pathname === "/Business" || pathname.startsWith("/business/"),
      onClick: () =>
        toast("Sparta Business Accounts Opens! 🚀", { icon: "👥" }),
    },
  ];

  // Loading state
  if (!isLoaded) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              onClick={() => toast.success("Welcome to Dashboard! 🏠")}
            >
              <TrophyIcon className="w-8 h-8 text-blue-600" />
              <span>Sparta</span>
            </Link>

            <nav className="hidden md:flex space-x-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={item.onClick}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center - Page Title (Mobile) */}
          <div className="md:hidden">
            <h1 className="text-lg font-semibold text-gray-900">Sparta</h1>
          </div>

          {/* Right side - Search & User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Bar (Desktop) */}
            <div className="hidden sm:block w-80">
              <GlobalSearch placeholder="Search athletes..." />
            </div>

            {/* ENHANCED: Notification Button with Animated Indicator */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={handleNotificationDropdownToggle}
                className={`relative p-2 rounded-lg transition-all duration-200 ${
                  hasNewNotifications
                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100 shadow-sm"
                    : unreadCount > 0
                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                title={
                  hasNewNotifications
                    ? "You have new notifications!"
                    : unreadCount > 0
                    ? `${unreadCount} unread notifications`
                    : "Notifications"
                }
              >
                {/* Bell Icon - Changes based on state */}
                {unreadCount > 0 ? (
                  <BellIconSolid
                    className={`w-6 h-6 transition-transform duration-200 ${
                      hasNewNotifications ? "animate-pulse" : ""
                    }`}
                  />
                ) : (
                  <BellIcon className="w-6 h-6" />
                )}

                {/* NEW: Animated Red Indicator Dot for New Notifications */}
                {hasNewNotifications && (
                  <div className="absolute -top-1 -right-1">
                    {/* Pulsing Ring Effect */}
                    <div className="absolute inset-0 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-75"></div>
                    {/* Solid Red Dot */}
                    <div className="relative w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm">
                      {/* Inner Glow Effect */}
                      <div className="absolute inset-0.5 bg-red-300 rounded-full opacity-60 animate-pulse"></div>
                    </div>
                  </div>
                )}

                {/* Unread Count Badge (Only show if no new indicator) */}
                {unreadCount > 0 && !hasNewNotifications && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              <NotificationDropdown
                isOpen={isNotificationDropdownOpen}
                onClose={() => setIsNotificationDropdownOpen(false)}
              />
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.firstName || "User"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-gray-600" />
                )}
                <ChevronDownIcon className="w-4 h-4 text-gray-600" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {user?.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      toast.success("Opening profile! 👤");
                    }}
                  >
                    <UserCircleIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">My Profile</span>
                  </Link>

                  <Link
                    href="/settings"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      toast("Settings coming soon! ⚙️", { icon: "🚀" });
                    }}
                  >
                    <Cog6ToothIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Settings</span>
                  </Link>

                  <div className="border-t border-gray-200 mt-1 pt-1">
                    <SignOutButton>
                      <button
                        onClick={() => toast.success("See you later! 👋")}
                        className="flex items-center space-x-2 px-4 py-2 w-full text-left hover:bg-gray-100 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Sign Out</span>
                      </button>
                    </SignOutButton>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pb-4">
            <div className="px-4 py-3 border-b border-gray-200">
              <GlobalSearch placeholder="Search athletes..." />
            </div>
            <nav className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (item.onClick) item.onClick();
                    }}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                      item.active
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* NEW: CSS Animations for the indicator */}
      <style jsx>{`
        @keyframes pulse-soft {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes ping-custom {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-pulse-soft {
          animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-ping-custom {
          animation: ping-custom 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </header>
  );
};

export default Navbar;
