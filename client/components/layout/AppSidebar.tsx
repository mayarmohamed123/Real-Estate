"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";
import {
  LayoutDashboard,
  Home,
  FileText,
  Heart,
  CreditCard,
  Settings,
  Users,
  Building2,
  Headphones,
  HelpCircle,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
};

const managerNavItems: NavItem[] = [
  { title: "Dashboard", url: "/managers/dashboard", icon: LayoutDashboard },
  { title: "Properties", url: "/managers/properties", icon: Building2 },
  { title: "Applications", url: "/managers/applications", icon: FileText },
  { title: "Tenants", url: "/managers/tenants", icon: Users },
  { title: "Billing", url: "/managers/billing", icon: CreditCard },
  { title: "Settings", url: "/managers/settings", icon: Settings },
];

const tenantNavItems: NavItem[] = [
  { title: "Dashboard", url: "/tenants/dashboard", icon: LayoutDashboard },
  { title: "My Residence", url: "/tenants/residence", icon: Home },
  { title: "Applications", url: "/tenants/applications", icon: FileText },
  { title: "Favorites", url: "/tenants/favorites", icon: Heart },
  { title: "Billing", url: "/tenants/billing", icon: CreditCard },
  { title: "Settings", url: "/tenants/settings", icon: Settings },
];

interface AppSidebarProps {
  userRole: string;
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const { signOut } = useAuthenticator((context) => [context.signOut]);

  const navItems =
    userRole === "manager" ? managerNavItems : tenantNavItems;
  const portalLabel =
    userRole === "manager" ? "MANAGER PORTAL" : "TENANT PORTAL";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* ── Header: Brand ── */}
      <SidebarHeader className="px-4 py-6">
        <Link href="/" className="flex flex-col gap-0.5 group-data-[collapsible=icon]:items-center">
          <span className="font-heading text-xl font-bold leading-tight text-primary-900 group-data-[collapsible=icon]:text-sm">
            {isCollapsed ? "AE" : (
              <>
                Aura
                <br />
                Estates
              </>
            )}
          </span>
          {!isCollapsed && (
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600 mt-0.5">
              {portalLabel}
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ── Main Navigation ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600/80 px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className="rounded-xl px-3 py-2.5 text-sm font-medium transition-all data-[active=true]:bg-primary-200/70 data-[active=true]:text-primary-900 data-[active=true]:font-semibold hover:bg-primary-100/60"
                    >
                      <item.icon className="size-4.5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Contact Concierge CTA ── */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Contact Concierge"
                  className="rounded-xl bg-primary-700 text-white hover:bg-primary-800 px-3 py-2.5 font-semibold text-sm transition-colors mx-auto"
                >
                  <Headphones className="size-4.5" />
                  <span>Contact Concierge</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      {/* ── Footer: Help + Sign Out ── */}
      <SidebarFooter className="px-2 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Help Center"
              className="rounded-xl px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100/60 transition-colors"
            >
              <HelpCircle className="size-4.5" />
              <span>Help Center</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              onClick={() => signOut()}
              className="rounded-xl px-3 py-2 text-sm font-medium text-primary-700 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="size-4.5" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
