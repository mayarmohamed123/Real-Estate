"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Application } from "@/types";
import { cn } from "@/lib/utils";

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

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}

function ApplicationRow({ application }: { application: Application }) {
  const { date, time } = formatDateTime(application.applicationDate);
  const property = application.property;
  const imageUrl = property?.photoUrls?.[0] ?? null;
  const statusCfg =
    STATUS_CONFIG[application.status] ?? STATUS_CONFIG["Pending"];
  const locationLabel = property?.location
    ? `${property.location.address}, ${property.location.city}`
    : null;

  const actionLabel =
    application.status === "Denied" ? "VIEW DETAILS" : "VIEW APPLICATION";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-5 px-6 border-t border-border hover:bg-muted/20 transition-colors group">
      {/* Property Details */}
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

        {/* Name + Address */}
        <div className="min-w-0">
          <p className="text-sm font-bold text-primary-800 leading-snug line-clamp-2">
            {property?.name ?? `Application #${application.id}`}
          </p>
          {locationLabel && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {locationLabel}
            </p>
          )}
        </div>
      </div>

      {/* Submission Date */}
      <div className="sm:w-36 shrink-0">
        <p className="text-sm font-semibold text-foreground">{date}</p>
        <p className="text-xs text-muted-foreground">{time} EST</p>
      </div>

      {/* Status */}
      <div className="sm:w-32 shrink-0">
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

      {/* Action */}
      <div className="sm:w-36 shrink-0 text-right">
        <Link
          href={`/properties/${application.propertyId}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary-800 hover:text-primary-600 uppercase tracking-wider transition-colors group-hover:gap-2"
        >
          {actionLabel}
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function ApplicationsTable({
  applications,
  pageSize = 5,
}: Props) {
  const [page, setPage] = useState(1);
  const total = applications.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginated = applications.slice((page - 1) * pageSize, page * pageSize);
  const showingCount = paginated.length;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Table Header */}
      <div className="hidden sm:grid grid-cols-[1fr_144px_128px_144px] gap-4 px-6 py-4 bg-muted/40">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Property Details
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Submission Date
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Current Status
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
          Actions
        </p>
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

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
        <p className="text-xs text-amber-700 font-medium">
          Showing {showingCount} of {total} historical application
          {total !== 1 ? "s" : ""}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors cursor-pointer"
              aria-label="Previous page"
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
              aria-label="Next page"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
