"use client";

import React from "react";
import Image from "next/image";
import {
  Users,
  Phone,
  Mail,
  CalendarDays,
  Building2,
  MapPin,
} from "lucide-react";
import { useGetAuthUserQuery, useGetApplicationsQuery } from "@/state/api";
import { Application } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

// ── Skeleton ─────────────────────────────────────────────────────────────────
function TenantsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-60" />
        <Skeleton className="h-14 w-36 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ── Tenant Card ──────────────────────────────────────────────────────────────
function TenantCard({ application }: { application: Application }) {
  const tenant = application.tenant;
  const property = application.property;
  const lease = application.lease;
  const imageUrl = property?.photoUrls?.[0] ?? null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const leaseEnd = lease?.endDate ? new Date(lease.endDate) : null;
  const isExpired = leaseEnd ? leaseEnd < new Date() : false;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
      {/* Property Banner */}
      <div className="relative h-28 bg-primary-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={property?.name ?? "Property"}
            fill
            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="size-8 text-primary-300" />
          </div>
        )}
        {/* Lease status badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm ${
              isExpired
                ? "bg-muted/80 text-muted-foreground border-border"
                : "bg-emerald-50/90 text-emerald-700 border-emerald-200"
            }`}
          >
            {isExpired ? "Expired" : "Active"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Tenant Name */}
        <div>
          <p className="font-heading text-base font-bold text-foreground leading-snug">
            {tenant?.name ?? application.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Building2 className="size-3 shrink-0" />
            <span className="line-clamp-1">
              {property?.name ?? `Property #${application.propertyId}`}
            </span>
          </p>
        </div>

        {/* Contact */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="size-3.5 shrink-0 text-primary-400" />
            <span className="line-clamp-1">
              {tenant?.email ?? application.email}
            </span>
          </div>
          {(tenant?.phoneNumber ?? application.phoneNumber) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="size-3.5 shrink-0 text-primary-400" />
              <span>{tenant?.phoneNumber ?? application.phoneNumber}</span>
            </div>
          )}
          {property?.location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0 text-primary-400" />
              <span className="line-clamp-1">
                {property.location.address}, {property.location.city}
              </span>
            </div>
          )}
        </div>

        {/* Lease Period */}
        {lease && (
          <div className="pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0 text-primary-400" />
            <span>
              {formatDate(lease.startDate)} → {formatDate(lease.endDate)}
            </span>
          </div>
        )}

        {/* Rent */}
        {property && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Monthly Rent</span>
            <span className="text-sm font-bold text-foreground">
              ${property.pricePerMonth.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground">
                /mo
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ManagerTenantsPage() {
  const { data: authUser, isLoading: isAuthLoading } = useGetAuthUserQuery();
  const cognitoId = authUser?.cognitoInfo?.userId;

  const { data: applications = [], isLoading: isAppsLoading } =
    useGetApplicationsQuery(
      { userId: cognitoId!, userType: "manager" },
      { skip: !cognitoId }
    );

  const isLoading = isAuthLoading || (!!cognitoId && isAppsLoading);

  if (isLoading) return <TenantsSkeleton />;

  // Only approved applications with a lease represent actual tenants
  const tenantApplications = applications.filter(
    (a) => a.status === "Approved" && a.leaseId
  );

  // De-duplicate by tenantCognitoId — if same tenant rents multiple units, show each lease
  // (keep all since each is a unique lease)
  const now = new Date();
  const activeTenants = tenantApplications.filter((a) => {
    const end = a.lease?.endDate ? new Date(a.lease.endDate) : null;
    return !end || end >= now;
  });
  const expiredTenants = tenantApplications.filter((a) => {
    const end = a.lease?.endDate ? new Date(a.lease.endDate) : null;
    return end && end < now;
  });

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Manager Portal
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            My Tenants
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-lg">
            Overview of all current and past tenants across your properties.
          </p>
        </div>

        {/* Stat Pill */}
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-border bg-card w-fit">
          <Users className="size-5 text-primary-600 shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Active Tenants
            </p>
            <p className="font-heading text-lg font-bold text-foreground leading-tight">
              {activeTenants.length}
            </p>
          </div>
        </div>
      </div>

      {/* ── Active Tenants ──────────────────────────────────────────── */}
      {activeTenants.length > 0 && (
        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
            Current Tenants
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTenants.map((app) => (
              <TenantCard key={app.id} application={app} />
            ))}
          </div>
        </section>
      )}

      {/* ── Past Tenants ────────────────────────────────────────────── */}
      {expiredTenants.length > 0 && (
        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
            Past Tenants
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {expiredTenants.map((app) => (
              <TenantCard key={app.id} application={app} />
            ))}
          </div>
        </section>
      )}

      {/* ── Empty State ──────────────────────────────────────────────── */}
      {tenantApplications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-border">
          <Users className="size-10 text-muted-foreground/40 mb-4" />
          <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
            No tenants yet
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Approve tenant applications to see your tenants appear here.
          </p>
        </div>
      )}
    </div>
  );
}
