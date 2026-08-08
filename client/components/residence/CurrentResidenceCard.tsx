"use client";

import React from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Lease } from "@/types";

interface Props {
  lease: Lease;
}

export default function CurrentResidenceCard({ lease }: Props) {
  const property = lease.property;
  const imageUrl = property?.photoUrls?.[0] ?? null;
  const locationLabel = property?.location
    ? `${property.location.address}, ${property.location.city}, ${property.location.state} ${property.location.postalCode}`
    : "Location unavailable";

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col sm:flex-row">
      {/* Photo */}
      <div className="relative w-full sm:w-56 shrink-0 h-52 sm:h-auto overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={property?.name ?? "Property"}
            fill
            className="object-cover"
            sizes="224px"
          />
        ) : (
          <div className="w-full h-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-400 text-sm">No photo</span>
          </div>
        )}
        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full">
            Current Residence
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground leading-tight">
            {property?.name ?? "—"}
          </h2>
          <p className="flex items-start gap-1.5 mt-2 text-sm text-muted-foreground">
            <MapPin className="size-3.5 text-primary-500 mt-0.5 shrink-0" />
            {locationLabel}
          </p>
        </div>

        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Monthly Rent
          </p>
          <p className="font-heading text-3xl font-bold text-foreground">
            ${lease.rent.toLocaleString()}
            <span className="text-base font-normal text-muted-foreground ml-1">
              /mo
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
