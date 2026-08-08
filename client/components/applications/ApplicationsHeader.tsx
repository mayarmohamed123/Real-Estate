"use client";

import React from "react";
import { LayoutList, Clock } from "lucide-react";
import { Application } from "@/types";

interface Props {
  applications: Application[];
}

export default function ApplicationsHeader({ applications }: Props) {
  const totalActive = applications.filter(
    (a) => a.status === "Pending" || a.status === "Approved"
  ).length;
  const pendingReview = applications.filter(
    (a) => a.status === "Pending"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Portfolio Overview
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground leading-tight">
          Manage your future residences.
        </h1>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
          <LayoutList className="size-5 text-primary-600 shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Active
            </p>
            <p className="font-heading text-lg font-bold text-foreground leading-tight">
              {totalActive} Application{totalActive !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
          <Clock className="size-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Pending Review
            </p>
            <p className="font-heading text-lg font-bold text-foreground leading-tight">
              {pendingReview} Application{pendingReview !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
