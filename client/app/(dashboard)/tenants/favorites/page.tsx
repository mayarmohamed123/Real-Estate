"use client";

import React from "react";
import { useGetAuthUserQuery } from "@/state/api";
import { Tenant } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import FavoritesHeader from "@/components/favorites/FavoritesHeader";
import FavoritePropertyCard from "@/components/favorites/FavoritePropertyCard";
import DiscoverMoreCard from "@/components/favorites/DiscoverMoreCard";

function FavoriteCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      <Skeleton className="aspect-4/3 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between gap-2">
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-5 w-1/5" />
        </div>
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function TenantFavoritesPage() {
  const { data: authUser, isLoading } = useGetAuthUserQuery();
  const tenant = authUser?.userInfo as Tenant | undefined;
  const favorites = tenant?.favorites ?? [];

  return (
    <div className="space-y-8">
      {/* Header Component */}
      <FavoritesHeader />

      {/* Grid Component */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <FavoriteCardSkeleton key={i} />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property) => (
            <FavoritePropertyCard key={property.id} property={property} />
          ))}
          <DiscoverMoreCard />
        </div>
      ) : (
        <div className="max-w-sm mx-auto">
          <DiscoverMoreCard />
        </div>
      )}
    </div>
  );
}
