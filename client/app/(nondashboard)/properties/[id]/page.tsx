"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { useParams } from "next/navigation";
import { useGetPropertyQuery } from "@/state/api";
import type { Property } from "@/types";
import PropertyHero from "@/components/property/PropertyHero";
import PropertyDetailsSkeleton from "@/components/property/PropertyDetailsSkeleton";
import PropertyOverview from "@/components/property/PropertyOverview";
import PropertyDetailsTabs from "@/components/property/PropertyDetailsTabs";
import PropertySpecs from "@/components/property/PropertySpecs";
import PropertySidebar from "@/components/property/PropertySidebar";

const PropertyLocationMap = dynamic<{ property: Property }>(
  () =>
    import("@/components/property/PropertyLocationMap") as Promise<{
      default: ComponentType<{ property: Property }>;
    }>,
  {
    ssr: false,
    loading: () => (
      <div className="h-72 bg-muted/60 animate-pulse rounded-2xl flex items-center justify-center text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  }
);

function PropertyDetailsContent() {
  const params = useParams();
  const id = Number(params?.id);

  const { data: property, isLoading, isError } = useGetPropertyQuery(id, {
    skip: isNaN(id),
  });

  if (isLoading) return <PropertyDetailsSkeleton />;

  if (isError || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Property not found
        </h1>
        <p className="text-muted-foreground max-w-sm">
          This property may have been removed or the link is incorrect.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* ── Hero Photos ─────────────────────────────────────────────── */}
      <PropertyHero property={property} />

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* ── Left Column ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-12">
            {/* Overview: title, location, description */}
            <PropertyOverview property={property} />

            {/* Amenities / Highlights / Fees / Policies tabs */}
            <PropertyDetailsTabs property={property} />

            {/* Property Specifications */}
            <PropertySpecs property={property} />

            {/* Location Map */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-5">
                Location
              </h2>
              <PropertyLocationMap property={property} />
            </section>
          </div>

          {/* ── Right Sidebar (sticky) ───────────────────────── */}
          <aside className="w-full lg:w-80 lg:sticky lg:top-28 shrink-0">
            <PropertySidebar property={property} />
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function PropertyDetailsPage() {
  return (
    <Suspense fallback={<PropertyDetailsSkeleton />}>
      <PropertyDetailsContent />
    </Suspense>
  );
}
