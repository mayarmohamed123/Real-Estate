"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Heart } from "lucide-react";
import { useFavoriteToggle } from "@/hooks/useFavoriteToggle";
import { Property } from "@/types";
import { cn } from "@/lib/utils";

interface FavoritePropertyCardProps {
  property: Property;
}

export default function FavoritePropertyCard({
  property,
}: FavoritePropertyCardProps) {
  const { isFavorited, toggleFavorite, isLoading } = useFavoriteToggle(
    property.id
  );

  const imageUrl = property.photoUrls?.[0] ?? null;
  const locationLabel = property.location
    ? `${property.location.address}, ${property.location.city}`
    : "Location unavailable";

  return (
    <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary-300 transition-all duration-300 flex flex-col">
      {/* Photo */}
      <div className="relative aspect-4/3 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={property.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-400 text-sm">No photo</span>
          </div>
        )}

        {/* Property type badge */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full">
            {property.propertyType}
          </span>
        </div>

        {/* Heart button */}
        <button
          onClick={toggleFavorite}
          disabled={isLoading}
          className={cn(
            "absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-sm transition-all shadow-sm disabled:opacity-50 cursor-pointer",
            isFavorited
              ? "bg-primary-700 text-white hover:bg-primary-800"
              : "bg-white/80 text-primary-400 hover:text-primary-700 hover:bg-white"
          )}
          aria-label="Remove from favorites"
        >
          <Heart className={cn("size-4", isFavorited && "fill-current")} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name + Price */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-heading text-base font-semibold text-foreground leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">
            {property.name}
          </h3>
          <div className="shrink-0 text-right">
            <span className="font-heading text-base font-bold text-foreground block">
              ${property.pricePerMonth.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground">/ mo</span>
          </div>
        </div>

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
          <MapPin className="size-3 text-primary-500 shrink-0" />
          <span className="truncate">{locationLabel}</span>
        </p>

        {/* View Details CTA */}
        <div className="mt-auto">
          <Link
            href={`/properties/${property.id}`}
            className="flex items-center justify-center w-full h-10 rounded-xl bg-primary-800 hover:bg-primary-900 text-white text-sm font-semibold transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
