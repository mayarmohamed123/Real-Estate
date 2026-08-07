"use client";

import React from "react";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import PropertyCard from "./PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";

function CardSkeleton({ variant }: { variant: "grid" | "list" }) {
  if (variant === "list") {
    return (
      <div className="flex bg-card border border-border rounded-2xl overflow-hidden h-36">
        <Skeleton className="w-52 shrink-0" />
        <div className="flex-1 p-5 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-5 pt-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <Skeleton className="aspect-4/3 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-3 w-24" />
        <div className="pt-1">
          <Skeleton className="h-px w-full" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </div>
  );
}

export default function PropertyListings() {
  const { filters, viewMode } = useAppSelector((state) => state.global);

  const { data: properties, isLoading, isError } = useGetPropertiesQuery(filters);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          "p-5",
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 gap-5"
            : "flex flex-col gap-4"
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} variant={viewMode} />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-96 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Building2 className="size-8 text-destructive/60" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
          Unable to load properties
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          There was a problem connecting to the server. Please try again later.
        </p>
      </div>
    );
  }

  // Empty state
  if (!properties || properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-96 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
          <Building2 className="size-8 text-primary-400" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
          No properties found
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Try adjusting your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-5",
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 gap-5"
          : "flex flex-col gap-4"
      )}
    >
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} variant={viewMode} />
      ))}
    </div>
  );
}
