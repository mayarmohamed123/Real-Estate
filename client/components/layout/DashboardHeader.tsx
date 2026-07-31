"use client";

import React from "react";
import { useGetAuthUserQuery } from "@/state/api";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const { data: authUser } = useGetAuthUserQuery();
  const userName =
    authUser?.userInfo?.name || authUser?.cognitoInfo?.username || "Account";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/60 bg-background/90 backdrop-blur-md px-4 sm:px-6">
      {/* Sidebar Toggle */}
      <SidebarTrigger className="-ml-1 size-9 rounded-xl text-primary-700 hover:bg-primary-100/60 transition-colors" />

      <Separator orientation="vertical" className="h-6 bg-border/60" />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-xl text-primary-700 hover:bg-primary-100/60"
        >
          <Bell className="size-4.5" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Avatar */}
        <div className="flex items-center justify-center size-9 rounded-full bg-primary-600 text-white font-heading font-bold text-sm shadow-sm">
          {userInitial}
        </div>
      </div>
    </header>
  );
}
