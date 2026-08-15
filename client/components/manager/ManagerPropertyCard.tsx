"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Bath, Square, Pencil, Trash2, Eye } from "lucide-react";
import { Property } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ManagerPropertyCard({ property, onEdit, onDelete }: Props) {
  const imageUrl = property.photoUrls?.[0] ?? null;
  const locationLabel = property.location
    ? `${property.location.address}, ${property.location.city}`
    : "Location unavailable";

  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300 flex flex-col">
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

        {/* Type badge */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full">
            {property.propertyType}
          </span>
        </div>

        {/* Overlay actions on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link
            href={`/properties/${property.id}`}
            className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-foreground transition-colors"
            aria-label="View property"
          >
            <Eye className="size-4" />
          </Link>
          <button
            onClick={() => onEdit(property)}
            className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-foreground transition-colors cursor-pointer"
            aria-label="Edit property"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => onDelete(property)}
            className="p-2.5 rounded-xl bg-white/90 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
            aria-label="Delete property"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-heading text-base font-semibold text-foreground leading-snug line-clamp-2">
            {property.name}
          </h3>
          <div className="shrink-0 text-right">
            <span className="font-heading text-base font-bold text-foreground block">
              {formatPrice(property.pricePerMonth)}
            </span>
            <span className="text-[10px] text-muted-foreground">/ mo</span>
          </div>
        </div>

        <p className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
          <MapPin className="size-3 text-primary-500 shrink-0" />
          <span className="truncate">{locationLabel}</span>
        </p>

        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span className={cn("flex items-center gap-1")}>
            <Bed className="size-3 text-primary-400" />
            <span className="font-semibold text-foreground">{property.beds}</span> Beds
          </span>
          <div className="h-3 w-px bg-border" />
          <span className="flex items-center gap-1">
            <Bath className="size-3 text-primary-400" />
            <span className="font-semibold text-foreground">{property.baths}</span> Baths
          </span>
          <div className="h-3 w-px bg-border" />
          <span className="flex items-center gap-1">
            <Square className="size-3 text-primary-400" />
            <span className="font-semibold text-foreground">{property.squareFeet.toLocaleString()}</span> sqft
          </span>
        </div>
      </div>
    </div>
  );
}
