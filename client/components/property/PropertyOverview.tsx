"use client";

import React from "react";
import { MapPin, Star } from "lucide-react";
import { Property } from "@/types";
import { Badge } from "@/components/ui/badge";

interface Props {
  property: Property;
}

export default function PropertyOverview({ property }: Props) {
  const locationLabel = property.location
    ? `${property.location.address}, ${property.location.city}, ${property.location.state}`
    : "Location unavailable";

  return (
    <section>
      {/* Type badge */}
      <Badge
        variant="secondary"
        className="mb-3 bg-primary-100 text-primary-800 border-0 font-medium"
      >
        {property.propertyType}
      </Badge>

      {/* Title */}
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-3">
        {property.name}
      </h1>

      {/* Location + Rating row */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 text-primary-500 shrink-0" />
          {locationLabel}
        </span>

        {property.averageRating !== undefined && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Star className="size-4 text-amber-400 fill-amber-400" />
            {property.averageRating.toFixed(1)}
            {property.numberOfReviews !== undefined && (
              <span className="text-muted-foreground font-normal">
                ({property.numberOfReviews} reviews)
              </span>
            )}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="mb-2">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-3">
          Architectural Philosophy
        </h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {property.description}
        </p>
      </div>
    </section>
  );
}
