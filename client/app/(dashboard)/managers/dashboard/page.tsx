"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Building2, Users, Clock, DollarSign } from "lucide-react";
import { useGetPropertiesQuery, useGetApplicationsQuery } from "@/state/api";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Skeleton } from "@/components/ui/skeleton";
import ManagerApplicationsTable from "@/components/manager/ManagerApplicationsTable";
import ManagerPropertyCard from "@/components/manager/ManagerPropertyCard";

// ── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "View All",
}: {
  title: string;
  subtitle?: string;
  href: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="font-heading text-xl font-semibold text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-xs font-bold text-primary-800 hover:text-primary-600 uppercase tracking-wider transition-colors"
      >
        {linkLabel}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="font-heading text-xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ── Skeleton ────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-72" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ManagerDashboardPage() {
  // Centralised auth hook — no more duplicated extraction logic
  const { isLoading: isAuthLoading, cognitoId, manager } = useAuthUser();
  const firstName = manager?.name?.split(" ")[0] ?? "there";

  const { data: properties = [], isLoading: isPropsLoading } =
    useGetPropertiesQuery(
      { managerCognitoId: cognitoId ?? undefined },
      { skip: !cognitoId }
    );

  const { data: applications = [], isLoading: isAppsLoading } =
    useGetApplicationsQuery(
      { userId: cognitoId!, userType: "manager" },
      { skip: !cognitoId }
    );

  const isLoading =
    isAuthLoading || (!!cognitoId && (isPropsLoading || isAppsLoading));

  if (isLoading) return <DashboardSkeleton />;

  // Derived stats
  const pendingApplications = applications.filter((a) => a.status === "Pending");
  const activeTenants = applications.filter((a) => a.status === "Approved").length;
  const monthlyRevenue = applications
    .filter((a) => a.status === "Approved")
    .reduce((sum, a) => sum + (a.property?.pricePerMonth ?? 0), 0);

  const recentApplications = applications.slice(0, 5);
  const recentProperties = properties.slice(0, 3);

  return (
    <div className="space-y-12">
      {/* ── Welcome Header ──────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
          Manager Portal
        </p>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Welcome back, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s your portfolio overview for today.
        </p>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Building2 className="size-5 text-primary-600" />}
          label="Total Properties"
          value={properties.length}
          colorClass="bg-primary-50"
        />
        <StatCard
          icon={<Users className="size-5 text-sky-600" />}
          label="Active Tenants"
          value={activeTenants}
          colorClass="bg-sky-50"
        />
        <StatCard
          icon={<Clock className="size-5 text-amber-500" />}
          label="Pending Applications"
          value={pendingApplications.length}
          colorClass="bg-amber-50"
        />
        <StatCard
          icon={<DollarSign className="size-5 text-emerald-600" />}
          label="Monthly Revenue"
          value={`$${monthlyRevenue.toLocaleString()}`}
          colorClass="bg-emerald-50"
        />
      </div>

      {/* ── Recent Applications ──────────────────────────────────────── */}
      {recentApplications.length > 0 && (
        <section>
          <SectionHeader
            title="Recent Applications"
            subtitle="Approve or deny incoming tenant requests."
            href="/managers/applications"
          />
          <ManagerApplicationsTable
            applications={recentApplications}
            pageSize={5}
          />
        </section>
      )}

      {/* ── Portfolio Preview (read-only — manage on Properties page) ── */}
      {recentProperties.length > 0 && (
        <section>
          <SectionHeader
            title="My Properties"
            subtitle="A snapshot of your current portfolio."
            href="/managers/properties"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProperties.map((property) => (
              // No onEdit / onDelete — dashboard is overview-only.
              // Full management (edit, delete, add) is on the Properties page.
              <ManagerPropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {properties.length === 0 && applications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-border">
          <Building2 className="size-10 text-muted-foreground/40 mb-4" />
          <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
            Your portfolio is empty
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Start by adding your first property to attract tenants.
          </p>
          <Link
            href="/managers/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-800 hover:bg-primary-900 text-white text-sm font-semibold transition-colors"
          >
            Add First Property
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
