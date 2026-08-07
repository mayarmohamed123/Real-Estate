"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import FiltersBar from "@/components/search/FiltersBar";
import FiltersPanel from "@/components/search/FiltersPanel";
import PropertyListings from "@/components/search/PropertyListings";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { useFilterUrlSync } from "@/hooks/useFilterUrlSync";

// Dynamically import MapView to disable SSR for Mapbox
const MapView = dynamic(() => import("@/components/search/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-100 bg-muted/60 animate-pulse flex items-center justify-center text-muted-foreground text-sm">
      Loading map…
    </div>
  ),
});

function PropertiesSearchContent() {
  useFilterUrlSync();

  const { filters } = useAppSelector((state) => state.global);
  const { data: properties } = useGetPropertiesQuery(filters);

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col bg-background">
      {/* ── Top Filters Bar ────────────────────────────────────────── */}
      <FiltersBar totalCount={properties?.length} />

      {/* ── Split Layout: Map (Left) & Listings (Right) ────────────── */}
      <div className="relative flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Animated Filters Panel */}
        <FiltersPanel />

        {/* Left Map View (~45% width on desktop) */}
        <div className="w-full lg:w-[45%] h-87.5 lg:h-[calc(100vh-130px)] sticky top-32.5 border-r border-border shrink-0">
          <MapView />
        </div>

        {/* Right Properties List (~55% width on desktop) */}
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-130px)]">
          {/* Mobile Results Header */}
          <div className="p-4 border-b border-border sm:hidden">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {properties?.length ?? 0}
              </span>{" "}
              results for{" "}
              <span className="font-semibold text-primary-700">
                {filters.location}
              </span>
            </p>
          </div>

          <PropertyListings />
        </div>
      </div>
    </div>
  );
}

export default function PropertiesSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
          Loading properties…
        </div>
      }
    >
      <PropertiesSearchContent />
    </Suspense>
  );
}
