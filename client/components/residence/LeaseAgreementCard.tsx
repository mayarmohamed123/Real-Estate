"use client";

import React from "react";
import { CalendarDays, FileText } from "lucide-react";
import { Lease } from "@/types";

interface Props {
  lease: Lease;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
}

export default function LeaseAgreementCard({ lease }: Props) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
          Lease Agreement
        </p>
        <div className="h-px bg-border mt-3" />
      </div>

      {/* Dates */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
            <CalendarDays className="size-4 text-primary-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Start Date
            </p>
            <p className="text-sm font-semibold text-foreground">
              {formatDate(lease.startDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
            <CalendarDays className="size-4 text-primary-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              End Date
            </p>
            <p className="text-sm font-semibold text-foreground">
              {formatDate(lease.endDate)}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto pt-2">
        <button className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer">
          <FileText className="size-4" />
          View Digital Lease
        </button>
      </div>
    </div>
  );
}
