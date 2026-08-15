"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Application } from "@/types";
import { useUpdateApplicationStatusMutation } from "@/state/api";
import { cn, withToast } from "@/lib/utils";

interface Props {
  applications: Application[];
  pageSize?: number;
}

const STATUS_CONFIG = {
  Approved: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "APPROVED",
  },
  Pending: {
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "PENDING",
  },
  Denied: {
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-700 border-red-200",
    label: "DENIED",
  },
} as const;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function ApplicationRow({ application }: { application: Application }) {
  const [updateStatus, { isLoading }] = useUpdateApplicationStatusMutation();
  const statusCfg =
    STATUS_CONFIG[application.status] ?? STATUS_CONFIG["Pending"];
  const property = application.property;
  const imageUrl = property?.photoUrls?.[0] ?? null;
  const location = property?.location
    ? `${property.location.address}, ${property.location.city}`
    : null;

  const handleApprove = () =>
    withToast(
      updateStatus({ id: application.id, status: "Approved" }).unwrap(),
      {
        success: "Application approved — lease created!",
        error: "Failed to approve application.",
      }
    );

  const handleDeny = () =>
    withToast(
      updateStatus({ id: application.id, status: "Denied" }).unwrap(),
      {
        success: "Application denied.",
        error: "Failed to deny application.",
      }
    );

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-5 px-6 border-t border-border hover:bg-muted/20 transition-colors group">
      {/* Property + Tenant */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Thumbnail */}
        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-border">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={property?.name ?? "Property"}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <div className="w-full h-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-400 text-xs">—</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0">
          <p className="text-sm font-bold text-primary-800 leading-snug line-clamp-1">
            {property?.name ?? `Application #${application.id}`}
          </p>
          {location && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {location}
            </p>
          )}
        </div>
      </div>

      {/* Tenant */}
      <div className="sm:w-44 shrink-0">
        <p className="text-sm font-semibold text-foreground line-clamp-1">
          {application.tenant?.name ?? application.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {application.tenant?.email ?? application.email}
        </p>
      </div>

      {/* Date */}
      <div className="sm:w-28 shrink-0">
        <p className="text-sm text-muted-foreground">
          {formatDate(application.applicationDate)}
        </p>
      </div>

      {/* Status */}
      <div className="sm:w-28 shrink-0">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border",
            statusCfg.badge
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", statusCfg.dot)} />
          {statusCfg.label}
        </span>
      </div>

      {/* Actions */}
      <div className="sm:w-24 shrink-0 flex items-center gap-2 justify-end">
        {application.status === "Pending" && (
          <>
            <button
              onClick={handleApprove}
              disabled={isLoading}
              title="Approve"
              className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Check className="size-4" />
            </button>
            <button
              onClick={handleDeny}
              disabled={isLoading}
              title="Deny"
              className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ManagerApplicationsTable({
  applications,
  pageSize = 8,
}: Props) {
  const [page, setPage] = useState(1);
  const total = applications.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginated = applications.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Table Header */}
      <div className="hidden sm:grid grid-cols-[1fr_176px_112px_112px_96px] gap-4 px-6 py-4 bg-muted/40">
        {["Property", "Tenant", "Date", "Status", "Actions"].map((h) => (
          <p
            key={h}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground last:text-right"
          >
            {h}
          </p>
        ))}
      </div>

      {/* Rows */}
      {paginated.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No applications found.
          </p>
        </div>
      ) : (
        paginated.map((app) => (
          <ApplicationRow key={app.id} application={app} />
        ))
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Showing {paginated.length} of {total} application
          {total !== 1 ? "s" : ""}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={cn(
                  "w-8 h-8 rounded-lg text-sm font-semibold transition-colors cursor-pointer",
                  page === i + 1
                    ? "bg-primary-800 text-white"
                    : "border border-border hover:bg-muted text-foreground"
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
