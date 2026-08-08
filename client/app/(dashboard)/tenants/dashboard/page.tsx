"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, LayoutList, Heart, CreditCard } from "lucide-react";
import {
  useGetAuthUserQuery,
  useGetLeasesQuery,
  useGetApplicationsQuery,
  useGetLeasePaymentsQuery,
} from "@/state/api";
import { Tenant } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

// ── Re‑use existing components ──────────────────────────────────────────────
import CurrentResidenceCard from "@/components/residence/CurrentResidenceCard";
import LeaseAgreementCard from "@/components/residence/LeaseAgreementCard";
import ApplicationsTable from "@/components/applications/ApplicationsTable";
import FavoritePropertyCard from "@/components/favorites/FavoritePropertyCard";
import BillingHistoryTable from "@/components/billing/BillingHistoryTable";

// ── Small Section Header with "View All" link ──────────────────────────────
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

// ── Stat Card ─────────────────────────────────────────────────────────────
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
        <p className="font-heading text-xl font-bold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Dashboard Skeleton ─────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function TenantDashboardPage() {
  const { data: authUser, isLoading: isAuthLoading } = useGetAuthUserQuery();
  const tenant = authUser?.userInfo as Tenant | undefined;
  const cognitoId = authUser?.cognitoInfo?.userId;
  const firstName = tenant?.name?.split(" ")[0] ?? "there";

  // Leases
  const { data: leases = [], isLoading: isLeasesLoading } = useGetLeasesQuery(
    { tenantCognitoId: cognitoId },
    { skip: !cognitoId }
  );
  const currentLease = leases[0];

  // Payments (only if there's an active lease)
  const { data: payments = [], isLoading: isPaymentsLoading } =
    useGetLeasePaymentsQuery(currentLease?.id ?? 0, {
      skip: !currentLease?.id,
    });

  // Applications
  const { data: applications = [], isLoading: isAppsLoading } =
    useGetApplicationsQuery(
      { userId: cognitoId!, userType: "tenant" },
      { skip: !cognitoId }
    );

  // Favorites from tenant object (already included)
  const favorites = tenant?.favorites ?? [];

  const isLoading =
    isAuthLoading ||
    (!!cognitoId && (isLeasesLoading || isAppsLoading)) ||
    (!!currentLease && isPaymentsLoading);

  if (isLoading) return <DashboardSkeleton />;

  // Derived stats
  const activeApplications = applications.filter(
    (a) => a.status === "Pending" || a.status === "Approved"
  ).length;

  const recentPayments = payments.slice(0, 3);
  const recentApplications = applications.slice(0, 3);
  const recentFavorites = favorites.slice(0, 3);

  return (
    <div className="space-y-12">
      {/* ── Welcome Header ────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
          Tenant Portal
        </p>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Welcome back, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s your portfolio summary for today.
        </p>
      </div>

      {/* ── Quick Stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<LayoutList className="size-5 text-primary-600" />}
          label="Active Applications"
          value={activeApplications}
          colorClass="bg-primary-50"
        />
        <StatCard
          icon={<Heart className="size-5 text-rose-500" />}
          label="Saved Properties"
          value={favorites.length}
          colorClass="bg-rose-50"
        />
        <StatCard
          icon={<CreditCard className="size-5 text-emerald-600" />}
          label="Monthly Rent"
          value={
            currentLease ? `$${currentLease.rent.toLocaleString()}` : "—"
          }
          colorClass="bg-emerald-50"
        />
      </div>

      {/* ── Current Residence ──────────────────────────────────────── */}
      {currentLease && (
        <section>
          <SectionHeader
            title="My Residence"
            subtitle="Your current lease at a glance."
            href="/tenants/residence"
            linkLabel="Full Details"
          />
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1 w-full">
              <CurrentResidenceCard lease={currentLease} />
            </div>
            <div className="w-full lg:w-72 shrink-0">
              <LeaseAgreementCard lease={currentLease} />
            </div>
          </div>
        </section>
      )}

      {/* ── Recent Applications ────────────────────────────────────── */}
      {recentApplications.length > 0 && (
        <section>
          <SectionHeader
            title="Recent Applications"
            subtitle="Your latest property applications."
            href="/tenants/applications"
          />
          <ApplicationsTable
            applications={recentApplications}
            pageSize={3}
          />
        </section>
      )}

      {/* ── Saved Properties ───────────────────────────────────────── */}
      {recentFavorites.length > 0 && (
        <section>
          <SectionHeader
            title="Saved Properties"
            subtitle="Your curated shortlist."
            href="/tenants/favorites"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentFavorites.map((property) => (
              <FavoritePropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}

      {/* ── Recent Billing ─────────────────────────────────────────── */}
      {recentPayments.length > 0 && (
        <section>
          <SectionHeader
            title="Recent Billing"
            subtitle="Your last 3 invoice records."
            href="/tenants/billing"
          />
          <BillingHistoryTable payments={recentPayments} />
        </section>
      )}

      {/* ── Empty state (new tenant with nothing yet) ──────────────── */}
      {!currentLease &&
        recentApplications.length === 0 &&
        recentFavorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-border">
            <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
              Start your journey
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Browse our exclusive listings and save properties to build your
              curated collection.
            </p>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-800 hover:bg-primary-900 text-white text-sm font-semibold transition-colors"
            >
              Explore Properties
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
    </div>
  );
}
