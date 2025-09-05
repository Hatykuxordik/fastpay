"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Moon,
  Sun,
  User,
  Menu,
  X,
  Bell,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/components/auth/AuthProvider";

interface HeaderProps {
  user?: any;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onMenuToggle }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useApp();
  const { signOut } = useAuth();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Check if user is in guest mode
  const isGuest =
    typeof window !== "undefined" &&
    localStorage.getItem("isGuestMode") === "true";

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    onMenuToggle?.();
  };

  const handleSignOut = async () => {
    try {
      if (isGuest) {
        // Clear guest mode data
        localStorage.removeItem("isGuestMode");
        localStorage.removeItem("guestAccount");
        localStorage.removeItem("guestName");
        localStorage.removeItem("fastpay-user-data");
        router.push("/");
      } else {
        await signOut();
        router.push("/");
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="fixed md:sticky top-0 left-0 right-0 z-50 bg-theme-card border-b border-theme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg text-theme-muted hover:text-theme-foreground hover:bg-theme-muted transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Logo and Brand */}
            <div className="flex items-center mr-4">
              <Link href="/" className="flex items-center -space-x-1.5">
                <div className="relative">
                  <Image
                    src="/fastpay-logo.svg"
                    alt="Fastpay"
                    width={40}
                    height={40}
                    className="h-8 w-8"
                  />
                </div>
                <span className="text-xl font-bold text-theme-foreground">
                  <span className="text-blue-600">ast</span>pay
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-theme-muted hover:text-blue-600 hover:bg-theme-muted font-medium transition-all duration-200"
              >
                Dashboard
              </Link>
              <Link
                href="/transactions"
                className="px-4 py-2 rounded-lg text-theme-muted hover:text-blue-600 hover:bg-theme-muted font-medium transition-all duration-200"
              >
                Transactions
              </Link>
              <Link
                href="/analytics"
                className="px-4 py-2 rounded-lg text-theme-muted hover:text-blue-600 hover:bg-theme-muted font-medium transition-all duration-200"
              >
                Analytics
              </Link>
              <Link
                href="/settings"
                className="px-4 py-2 rounded-lg text-theme-muted hover:text-blue-600 hover:bg-theme-muted font-medium transition-all duration-200"
              >
                Settings
              </Link>
            </nav>

            {/* Desktop Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-sm mx-6">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-muted" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2.5 border border-theme rounded-lg bg-theme-card text-theme-card-foreground placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="lg:hidden p-2 rounded-lg text-theme-muted hover:text-theme-foreground hover:bg-theme-muted transition-colors"
                aria-label="Toggle search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-theme-muted hover:text-theme-foreground hover:bg-theme-muted transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Notifications */}
              <NotificationCenter />

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg text-theme-muted hover:text-theme-foreground hover:bg-theme-muted transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden md:block text-sm font-medium">
                      {user.user_metadata?.name || user.email || "User"}
                      {isGuest && (
                        <span className="text-xs text-yellow-600 ml-1">
                          (Guest)
                        </span>
                      )}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-theme-card rounded-lg shadow-lg border border-theme py-1 z-50">
                      <div className="px-4 py-2 border-b border-theme">
                        <p className="text-sm font-medium text-theme-card-foreground">
                          {user.user_metadata?.name || user.email || "User"}
                        </p>
                        {isGuest ? (
                          <p className="text-xs text-yellow-600">Guest Mode</p>
                        ) : (
                          <p className="text-xs text-theme-muted">
                            {user.email}
                          </p>
                        )}
                      </div>

                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-theme-muted hover:bg-theme-muted hover:text-theme-foreground transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleSignOut();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-theme-muted transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {isGuest ? "Exit Guest Mode" : "Sign Out"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/signin">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="lg:hidden border-t border-theme p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-muted" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2.5 border border-theme rounded-lg bg-theme-card text-theme-card-foreground placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-gray-500/75"
          onClick={toggleMobileMenu}
        >
          <div
            className="fixed inset-y-0 left-0 w-64 bg-theme-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-theme">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg text-theme-muted hover:text-theme-foreground hover:bg-theme-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              <Link
                href="/dashboard"
                className="block px-4 py-3 rounded-lg text-theme-muted hover:text-blue-600 hover:bg-theme-muted font-medium transition-colors"
                onClick={toggleMobileMenu}
              >
                Dashboard
              </Link>
              <Link
                href="/transactions"
                className="block px-4 py-3 rounded-lg text-theme-muted hover:text-blue-600 hover:bg-theme-muted font-medium transition-colors"
                onClick={toggleMobileMenu}
              >
                Transactions
              </Link>
              <Link
                href="/analytics"
                className="block px-4 py-3 rounded-lg text-theme-muted hover:text-blue-600 hover:bg-theme-muted font-medium transition-colors"
                onClick={toggleMobileMenu}
              >
                Analytics
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-3 rounded-lg text-theme-muted hover:text-blue-600 hover:bg-theme-muted font-medium transition-colors"
                onClick={toggleMobileMenu}
              >
                Settings
              </Link>

              {/* Mobile User Section */}
              {user && (
                <>
                  <div className="border-t border-theme pt-4 mt-4">
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium text-theme-card-foreground">
                        {user.user_metadata?.name || user.email || "User"}
                      </p>
                      {isGuest ? (
                        <p className="text-xs text-yellow-600">Guest Mode</p>
                      ) : (
                        <p className="text-xs text-theme-muted">{user.email}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      toggleMobileMenu();
                      handleSignOut();
                    }}
                    className="flex items-center w-full px-4 py-3 rounded-lg text-red-600 hover:bg-theme-muted font-medium transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isGuest ? "Exit Guest Mode" : "Sign Out"}
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
