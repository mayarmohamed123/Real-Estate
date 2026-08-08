"use client";

import React from "react";
import { useGetAuthUserQuery, useGetLeasesQuery } from "@/state/api";
import { Tenant } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import CurrentResidenceCard from "@/components/residence/CurrentResidenceCard";
import LeaseAgreementCard from "@/components/residence/LeaseAgreementCard";

function ResidenceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-0 rounded-2xl overflow-hidden border border-border">
        <Skeleton className="w-full sm:w-56 h-52" />
        <div className="p-6 flex-1 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-40 mt-6" />
        </div>
      </div>
      <Skeleton className="h-52 w-full sm:w-72 rounded-2xl" />
    </div>
  );
}

export default function TenantResidencePage() {
  const { data: authUser, isLoading: isAuthLoading } = useGetAuthUserQuery();
  const tenant = authUser?.userInfo as Tenant | undefined;
  const cognitoId = authUser?.cognitoInfo?.userId;

  const { data: leases, isLoading: isLeasesLoading } = useGetLeasesQuery(
    { tenantCognitoId: cognitoId },
    { skip: !cognitoId }
  );

  const isLoading = isAuthLoading || isLeasesLoading;
  const currentLease = leases?.[0];

  return (
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          My Residence
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Manage your current lease details and financial obligations through
          our secure tenant portal.
        </p>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      {isLoading ? (
        <ResidenceSkeleton />
      ) : !currentLease ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm font-semibold text-foreground mb-2">
            No active residence found
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Once your application is approved and a lease is created, your
            residence details will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Current Residence Card */}
          <div className="flex-1 w-full">
            <CurrentResidenceCard lease={currentLease} />
          </div>

          {/* Lease Agreement Card */}
          <div className="w-full lg:w-72 shrink-0">
            <LeaseAgreementCard lease={currentLease} />
          </div>
        </div>
      )}

      {/* Tenant info footer */}
      {tenant && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Tenant:{" "}
            <span className="font-semibold text-foreground">{tenant.name}</span>{" "}
            &bull; {tenant.email}
          </p>
        </div>
      )}
    </div>
  );
}
