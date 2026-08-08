"use client";

import React from "react";
import { CreditCard } from "lucide-react";
import {
  useGetAuthUserQuery,
  useGetLeasesQuery,
  useGetLeasePaymentsQuery,
} from "@/state/api";
import { Skeleton } from "@/components/ui/skeleton";
import BillingHistoryTable from "@/components/billing/BillingHistoryTable";

function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <div className="bg-muted/50 px-6 py-3 flex gap-8">
        {["w-24", "w-40", "w-20", "w-20", "w-16"].map((w, i) => (
          <Skeleton key={i} className={`h-3 ${w}`} />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="px-6 py-4 flex gap-8 border-t border-border items-center"
        >
          <Skeleton className="h-4 w-24" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function TenantBillingPage() {
  const { data: authUser, isLoading: isAuthLoading } = useGetAuthUserQuery();
  const cognitoId = authUser?.cognitoInfo?.userId;

  const { data: leases, isLoading: isLeasesLoading } = useGetLeasesQuery(
    { tenantCognitoId: cognitoId },
    { skip: !cognitoId }
  );

  const currentLease = leases?.[0];

  const { data: payments = [], isLoading: isPaymentsLoading } =
    useGetLeasePaymentsQuery(currentLease?.id ?? 0, {
      skip: !currentLease?.id,
    });

  const isLoading =
    isAuthLoading || isLeasesLoading || (!!currentLease && isPaymentsLoading);

  return (
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Billing
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Track your payment history and upcoming invoices.
        </p>
      </div>

      {/* ── Summary Stats ────────────────────────────────────────── */}
      {currentLease && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
              <CreditCard className="size-5 text-primary-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Monthly Rent
              </p>
              <p className="font-heading text-xl font-bold text-foreground">
                ${currentLease.rent.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <CreditCard className="size-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Paid Invoices
              </p>
              <p className="font-heading text-xl font-bold text-foreground">
                {payments.filter((p) => p.paymentStatus === "Paid").length}
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <CreditCard className="size-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Pending / Overdue
              </p>
              <p className="font-heading text-xl font-bold text-foreground">
                {
                  payments.filter(
                    (p) =>
                      p.paymentStatus === "Pending" ||
                      p.paymentStatus === "Overdue"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Billing History ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Billing History
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track your payment history and upcoming invoices.
            </p>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : !currentLease ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border">
            <p className="text-sm font-semibold text-foreground mb-1">
              No active lease
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Billing history will appear once your lease is active.
            </p>
          </div>
        ) : (
          <BillingHistoryTable payments={payments} />
        )}
      </div>
    </div>
  );
}
