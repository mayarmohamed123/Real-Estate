"use client";

import React from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Clock,
  Building2,
  ArrowRight,
} from "lucide-react";
import { useGetAuthUserQuery, useGetApplicationsQuery } from "@/state/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function BillingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 bg-muted/40">
          <Skeleton className="h-3 w-48" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 items-center px-6 py-5 border-t border-border"
          >
            <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-20 hidden sm:block" />
            <Skeleton className="h-6 w-16 rounded-full hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
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

const LEASE_STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Expired: "bg-muted text-muted-foreground border-border",
};

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ManagerBillingPage() {
  const { data: authUser, isLoading: isAuthLoading } = useGetAuthUserQuery();
  const cognitoId = authUser?.cognitoInfo?.userId;

  const { data: applications = [], isLoading: isAppsLoading } =
    useGetApplicationsQuery(
      { userId: cognitoId!, userType: "manager" },
      { skip: !cognitoId }
    );

  const isLoading = isAuthLoading || (!!cognitoId && isAppsLoading);

  if (isLoading) return <BillingSkeleton />;

  // Active leases = approved applications with a lease
  const activeLeases = applications.filter(
    (a) => a.status === "Approved" && a.leaseId
  );

  const totalMonthlyRevenue = activeLeases.reduce(
    (sum, a) => sum + (a.property?.pricePerMonth ?? 0),
    0
  );
  const totalDeposits = activeLeases.reduce(
    (sum, a) => sum + (a.property?.securityDeposit ?? 0),
    0
  );

  const now = new Date();

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
          Manager Portal
        </p>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Billing Overview
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Track monthly revenue and lease activity across your property portfolio.
        </p>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<DollarSign className="size-5 text-emerald-600" />}
          label="Monthly Revenue"
          value={`$${totalMonthlyRevenue.toLocaleString()}`}
          colorClass="bg-emerald-50"
        />
        <StatCard
          icon={<TrendingUp className="size-5 text-primary-600" />}
          label="Active Leases"
          value={activeLeases.length}
          colorClass="bg-primary-50"
        />
        <StatCard
          icon={<Clock className="size-5 text-sky-600" />}
          label="Security Deposits Held"
          value={`$${totalDeposits.toLocaleString()}`}
          colorClass="bg-sky-50"
        />
      </div>

      {/* ── Lease Table ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Active Leases
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Monthly rent obligations from approved tenants.
            </p>
          </div>
          <Link
            href="/managers/tenants"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-800 hover:text-primary-600 uppercase tracking-wider transition-colors"
          >
            View Tenants
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {activeLeases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border">
            <Building2 className="size-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">
              No active leases yet
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Approve tenant applications to start generating revenue.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-[1fr_160px_120px_120px_100px] gap-4 px-6 py-4 bg-muted/40">
              {["Property / Tenant", "Lease Period", "Monthly Rent", "Deposit", "Status"].map((h) => (
                <p
                  key={h}
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  {h}
                </p>
              ))}
            </div>

            {/* Rows */}
            {activeLeases.map((app) => {
              const lease = app.lease;
              const leaseEnd = lease?.endDate ? new Date(lease.endDate) : null;
              const isExpired = leaseEnd ? leaseEnd < now : false;
              const statusLabel = isExpired ? "Expired" : "Active";

              return (
                <div
                  key={app.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-5 px-6 border-t border-border hover:bg-muted/20 transition-colors"
                >
                  {/* Property + Tenant */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-primary-800 line-clamp-1">
                      {app.property?.name ?? `Property #${app.propertyId}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {app.tenant?.name ?? app.name}
                    </p>
                  </div>

                  {/* Lease Period */}
                  <div className="sm:w-40 shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(lease?.startDate)} →
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(lease?.endDate)}
                    </p>
                  </div>

                  {/* Rent */}
                  <div className="sm:w-30 shrink-0">
                    <p className="text-sm font-bold text-foreground">
                      ${(app.property?.pricePerMonth ?? 0).toLocaleString()}
                      <span className="text-xs font-normal text-muted-foreground">
                        /mo
                      </span>
                    </p>
                  </div>

                  {/* Deposit */}
                  <div className="sm:w-30 shrink-0">
                    <p className="text-sm text-muted-foreground">
                      ${(app.property?.securityDeposit ?? 0).toLocaleString()}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="sm:w-25 shrink-0">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border",
                        LEASE_STATUS_STYLES[statusLabel] ??
                          "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Footer total */}
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {activeLeases.length} active lease
                {activeLeases.length !== 1 ? "s" : ""}
              </p>
              <p className="text-sm font-bold text-foreground">
                Total:{" "}
                <span className="text-emerald-700">
                  ${totalMonthlyRevenue.toLocaleString()}
                  <span className="text-xs font-normal text-muted-foreground">
                    /mo
                  </span>
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
