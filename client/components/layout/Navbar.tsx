"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useGetAuthUserQuery } from "@/state/api";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  LogOut,
  Building2,
  Heart,
  FileText,
  Home,
  Search,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { authStatus, signOut } = useAuthenticator((context) => [
    context.authStatus,
    context.signOut,
  ]);
  const isAuthenticated = authStatus === "authenticated";

  const { data: authUser } = useGetAuthUserQuery();
  const userRole = authUser?.userRole?.toLowerCase();
  const userName =
    authUser?.userInfo?.name || authUser?.cognitoInfo?.username || "Account";
  const userInitial = userName.charAt(0).toUpperCase();

  // Navigation Links based on Login Status and User Role
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { name: "Home", link: "/", icon: Home },
        { name: "Search Properties", link: "/properties", icon: Search },
      ];
    }

    if (userRole === "manager") {
      return [
        { name: "Home", link: "/", icon: Home },
        { name: "Search Properties", link: "/properties", icon: Search },
      ];
    }

    // Default for Tenant
    return [
      { name: "Home", link: "/", icon: Home },
      { name: "Search Properties", link: "/properties", icon: Search },
      { name: "My Favorites", link: "/tenants/favorites", icon: Heart },
      {
        name: "My Applications",
        link: "/tenants/applications",
        icon: FileText,
      },
      { name: "My Residence", link: "/tenants/residence", icon: Building2 },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/80 transition-all duration-300">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 xl:px-10">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-heading text-2xl font-bold tracking-tight text-primary-900 hover:text-primary-700 transition-colors sm:text-3xl"
          >
            AURA ESTATES
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => {
            const isActive = pathname === item.link;
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.link}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-full transition-all ${
                    isActive
                      ? "bg-primary-100 text-primary-900 font-semibold shadow-xs"
                      : "text-primary-800 hover:bg-primary-50 hover:text-primary-900"
                  }`}
                >
                  <Icon className="size-4 opacity-70" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right Section: Auth State / Profile */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 bg-card border border-border/70 rounded-full py-1.5 pl-2 pr-3 shadow-xs">
              {/* User Avatar Circle */}
              <div className="flex items-center justify-center size-8 rounded-full bg-primary-500 text-white font-heading font-bold text-sm shadow-xs">
                {userInitial}
              </div>

              {/* User Info & Role Badge */}
              <div className="flex flex-col text-left pr-1">
                <span className="text-xs font-semibold text-foreground truncate max-w-28">
                  {userName}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary-700">
                  {userRole === "manager" ? (
                    <Badge
                      variant="default"
                      className="text-[9px] px-1.5 py-0 bg-primary-600"
                    >
                      Manager
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-[9px] px-1.5 py-0 bg-primary-100 text-primary-800 border-none"
                    >
                      Tenant
                    </Badge>
                  )}
                </span>
              </div>

              {/* Sign Out Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="h-8 px-2.5 rounded-full text-stone-600 hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="size-4" />
                <span className="sr-only sm:not-sr-only text-xs font-medium">
                  Out
                </span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/signin">
                <Button
                  variant="ghost"
                  size="default"
                  className="rounded-full px-5"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="default"
                  className="rounded-full px-6 bg-primary-700 hover:bg-primary-800 text-white shadow-xs"
                >
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-primary-800 hover:bg-primary-50 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/80 bg-background px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2">
          {isAuthenticated && (
            <div className="flex items-center justify-between bg-card p-3 rounded-2xl border border-border/60">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-9 rounded-full bg-primary-500 text-white font-heading font-bold">
                  {userInitial}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {userName}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {userRole || "User"}
                  </div>
                </div>
              </div>
              <Badge variant={userRole === "manager" ? "default" : "secondary"}>
                {userRole === "manager" ? "Manager" : "Tenant"}
              </Badge>
            </div>
          )}

          <ul className="space-y-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.link;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.link}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                      isActive
                        ? "bg-primary-100 text-primary-900 font-semibold"
                        : "text-primary-800 hover:bg-primary-50"
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button
                variant="destructive"
                className="w-full rounded-xl justify-center gap-2"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
              >
                <LogOut className="size-4" />
                Sign Out
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-xl bg-primary-700 hover:bg-primary-800 text-white">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
