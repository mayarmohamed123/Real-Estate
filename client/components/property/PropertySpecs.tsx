"use client";

import React from "react";
import { Bed, Bath, Square, Calendar, Layers } from "lucide-react";
import { Property } from "@/types";

interface Props {
  property: Property;
}

interface SpecRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function SpecRow({ icon, label, value }: SpecRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="text-primary-500">{icon}</span>
        <span className="uppercase tracking-wider text-xs font-semibold">
          {label}
        </span>
      </div>
      <span className="font-semibold text-foreground text-sm">{value}</span>
    </div>
  );
}

export default function PropertySpecs({ property }: Props) {
  const postedYear = property.postedDate
    ? new Date(property.postedDate).getFullYear()
    : "—";

  return (
    <section>
      <h2 className="font-heading text-xl font-semibold text-foreground mb-5">
        Property Specifications
      </h2>
      <div className="rounded-2xl border border-border bg-card overflow-hidden p-5">
        <SpecRow
          icon={<Bed className="size-4" />}
          label="Bedrooms"
          value={property.beds === 1 ? "1 Suite" : `${property.beds} Suites`}
        />
        <SpecRow
          icon={<Bath className="size-4" />}
          label="Bathrooms"
          value={
            property.baths === 1
              ? "1 En-suite"
              : `${property.baths} En-suites`
          }
        />
        <SpecRow
          icon={<Square className="size-4" />}
          label="Square Footage"
          value={`${property.squareFeet.toLocaleString()} ft²`}
        />
        <SpecRow
          icon={<Calendar className="size-4" />}
          label="Year Built"
          value={postedYear}
        />
        <SpecRow
          icon={<Layers className="size-4" />}
          label="Property Type"
          value={property.propertyType}
        />
      </div>
    </section>
  );
}
