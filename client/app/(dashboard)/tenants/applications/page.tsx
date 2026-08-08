"use client";

import React from "react";
import { useGetAuthUserQuery, useGetApplicationsQuery } from "@/state/api";
import { Skeleton } from "@/components/ui/skeleton";
import ApplicationsHeader from "@/components/applications/ApplicationsHeader";
import ApplicationsTable from "@/components/applications/ApplicationsTable";

function ApplicationsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <div className="flex gap-3">
          <Skeleton className="h-16 w-44 rounded-xl" />
          <Skeleton className="h-16 w-44 rounded-xl" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 bg-muted/40">
          <Skeleton className="h-3 w-48" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-5 border-t border-border"
          >
            <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-6 w-20 rounded-full hidden sm:block" />
            <Skeleton className="h-4 w-28 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TenantApplicationsPage() {
  const { data: authUser, isLoading: isAuthLoading } = useGetAuthUserQuery();
  const cognitoId = authUser?.cognitoInfo?.userId;

  const { data: applications = [], isLoading: isAppsLoading } =
    useGetApplicationsQuery(
      { userId: cognitoId!, userType: "tenant" },
      { skip: !cognitoId }
    );

  const isLoading = isAuthLoading || (!!cognitoId && isAppsLoading);

  if (isLoading) return <ApplicationsSkeleton />;

  return (
    <div className="space-y-8">
      {/* Header + Stats */}
      <ApplicationsHeader applications={applications} />

      {/* Applications Table */}
      <ApplicationsTable applications={applications} pageSize={5} />
    </div>
  );
}
