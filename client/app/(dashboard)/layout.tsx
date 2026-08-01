"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useGetAuthUserQuery } from "@/state/api";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { useAppSelector } from "@/state/redux";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: authUser, isLoading } = useGetAuthUserQuery();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const userRole = authUser?.userRole?.toLowerCase();

  useEffect(() => {
    if (isLoading) return;

    if (!userRole) {
      router.push("/signin");
      return;
    }

    if (pathname.startsWith("/managers") && userRole !== "manager") {
      router.push("/tenants/dashboard");
    } else if (pathname.startsWith("/tenants") && userRole !== "tenant") {
      router.push("/managers/dashboard");
    }
  }, [pathname, userRole, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            Loading your portal...
          </p>
        </div>
      </div>
    );
  }

  // Prevent flash of unauthorized content during redirect
  if (!userRole) return null;
  if (pathname.startsWith("/managers") && userRole !== "manager") return null;
  if (pathname.startsWith("/tenants") && userRole !== "tenant") return null;

  return (
    <SidebarProvider defaultOpen={!isSidebarCollapsed}>
      <AppSidebar userRole={userRole} />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
