"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20 animate-pulse">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-2 h-72 sm:h-96 lg:h-120">
        <Skeleton className="h-full lg:rounded-l-2xl" />
        <div className="hidden lg:flex flex-col gap-2">
          <Skeleton className="flex-1 rounded-tr-2xl" />
          <Skeleton className="flex-1 rounded-br-2xl" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left */}
          <div className="flex-1 space-y-10">
            <div className="space-y-4">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2 mt-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-24 rounded-xl" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-2xl" />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>

            <Skeleton className="h-72 sm:h-96 rounded-2xl" />
          </div>

          {/* Right */}
          <div className="w-full lg:w-80 shrink-0">
            <Skeleton className="h-96 rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
