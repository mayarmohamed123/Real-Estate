"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Bed, Bath, Square } from "lucide-react";
import { Property } from "@/types";
// import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  variant?: "grid" | "list";
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function PropertyCard({
  property,
  variant = "grid",
}: PropertyCardProps) {
  const imageUrl = property.photoUrls?.[0] ?? null;
  const locationLabel = property.location
    ? `${property.location.address}, ${property.location.city}`
    : "Location unavailable";

  if (variant === "list") {
    return (
      <Link
        href={`/properties/${property.id}`}
        className="group flex bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all duration-300"
      >
        {/* Photo */}
        <div className="relative w-52 shrink-0 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={property.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="208px"
            />
          ) : (
            <div className="w-full h-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-400 text-sm">No photo</span>
            </div>
          )}
          {/* Heart */}
          <button
            onClick={(e) => e.preventDefault()}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-primary-400 hover:text-primary-700 hover:bg-white transition-all shadow-sm"
            aria-label="Save to favorites"
          >
            <Heart className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between p-5 flex-1">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading text-lg font-semibold text-foreground leading-snug group-hover:text-primary-700 transition-colors">
                {property.name}
              </h3>
              <span className="font-heading text-lg font-bold text-foreground whitespace-nowrap">
                {formatPrice(property.pricePerMonth)}
              </span>
            </div>
            <p className="mt-1 text-sm text-primary-600 font-medium">
              {locationLabel}
            </p>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Bed className="size-4 text-primary-400" />
              <span className="font-semibold text-foreground">{property.beds}</span>
              <span>Beds</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Bath className="size-4 text-primary-400" />
              <span className="font-semibold text-foreground">{property.baths}</span>
              <span>Baths</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Square className="size-4 text-primary-400" />
              <span className="font-semibold text-foreground">
                {property.squareFeet.toLocaleString()}
              </span>
              <span>sqft</span>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // ── Grid variant ──────────────────────────────────────────────────────────
  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary-300 transition-all duration-300"
    >
      {/* Photo */}
      <div className="relative aspect-4/3 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={property.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-400 text-sm">No photo</span>
          </div>
        )}

        {/* Favorite heart */}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-primary-400 hover:text-primary-700 hover:bg-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
          aria-label="Save to favorites"
        >
          <Heart className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name + Price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold text-foreground leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">
            {property.name}
          </h3>
          <span className="font-heading text-base font-bold text-foreground whitespace-nowrap">
            {formatPrice(property.pricePerMonth)}
          </span>
        </div>

        {/* Location */}
        <p className="mt-1 text-sm text-primary-600 font-medium truncate">
          {locationLabel}
        </p>

        {/* Divider */}
        <div className="my-3 h-px bg-border" />

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex flex-col items-center gap-0.5">
            <span className="font-semibold text-foreground text-sm">
              {property.beds}
            </span>
            <span className="flex items-center gap-1">
              <Bed className="size-3 text-primary-400" />
              Beds
            </span>
          </span>
          <div className="h-6 w-px bg-border" />
          <span className="flex flex-col items-center gap-0.5">
            <span className="font-semibold text-foreground text-sm">
              {property.baths}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="size-3 text-primary-400" />
              Baths
            </span>
          </span>
          <div className="h-6 w-px bg-border" />
          <span className="flex flex-col items-center gap-0.5">
            <span className="font-semibold text-foreground text-sm">
              {property.squareFeet.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Square className="size-3 text-primary-400" />
              sqft
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
