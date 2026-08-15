"use client";

import React, { useState } from "react";
import { useGetAuthUserQuery, useGetApplicationsQuery } from "@/state/api";
import { Application } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutList, Clock, CheckCircle2, XCircle } from "lucide-react";
import ManagerApplicationsTable from "@/components/manager/ManagerApplicationsTable";

// ── Skeleton ────────────────────────────────────────────────────────────────
function ApplicationsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-40 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 bg-muted/40">
          <Skeleton className="h-3 w-48" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-5 border-t border-border"
          >
            <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-28 hidden sm:block" />
            <Skeleton className="h-6 w-20 rounded-full hidden sm:block" />
            <Skeleton className="h-8 w-16 rounded-lg hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({
  icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
      <div className={`shrink-0 ${colorClass}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="font-heading text-lg font-bold text-foreground leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Filter Tabs ──────────────────────────────────────────────────────────────
const FILTERS = ["All", "Pending", "Approved", "Denied"] as const;
type Filter = (typeof FILTERS)[number];

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ManagerApplicationsPage() {
  const { data: authUser, isLoading: isAuthLoading } = useGetAuthUserQuery();
  const cognitoId = authUser?.cognitoInfo?.userId;
  const [filter, setFilter] = useState<Filter>("All");

  const { data: applications = [], isLoading: isAppsLoading } =
    useGetApplicationsQuery(
      { userId: cognitoId!, userType: "manager" },
      { skip: !cognitoId }
    );

  const isLoading = isAuthLoading || (!!cognitoId && isAppsLoading);

  if (isLoading) return <ApplicationsSkeleton />;

  // Stats
  const total = applications.length;
  const pending = applications.filter((a) => a.status === "Pending").length;
  const approved = applications.filter((a) => a.status === "Approved").length;
  const denied = applications.filter((a) => a.status === "Denied").length;

  const filtered: Application[] =
    filter === "All" ? applications : applications.filter((a) => a.status === filter);

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Manager Portal
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            Tenant Applications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-lg">
            Review, approve, or deny incoming rental applications for your properties.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3">
          <StatPill
            icon={<LayoutList className="size-5" />}
            label="Total"
            value={total}
            colorClass="text-primary-600"
          />
          <StatPill
            icon={<Clock className="size-5" />}
            label="Pending"
            value={pending}
            colorClass="text-amber-500"
          />
          <StatPill
            icon={<CheckCircle2 className="size-5" />}
            label="Approved"
            value={approved}
            colorClass="text-emerald-600"
          />
          <StatPill
            icon={<XCircle className="size-5" />}
            label="Denied"
            value={denied}
            colorClass="text-red-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border transition-colors cursor-pointer ${
                filter === f
                  ? "bg-primary-800 text-white border-primary-800"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <ManagerApplicationsTable applications={filtered} pageSize={8} />
    </div>
  );
}
