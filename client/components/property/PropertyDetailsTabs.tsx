"use client";

import React from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Wifi,
  Wind,
  Flame,
  Car,
  Waves,
  Dumbbell,
  ArrowUp,
  ShieldCheck,
  Flower2,
  LayoutGrid,
  Sparkles,
  PawPrint,
  Sofa,
  ConciergeBell,
  UtensilsCrossed,
  CheckCircle2,
  DollarSign,
  ParkingSquare,
  Heart,
  FileText,
} from "lucide-react";
import { Property } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  property: Property;
}

// ── Amenity icon map ─────────────────────────────────────────────────────────
const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="size-5" />,
  "Air Conditioning": <Wind className="size-5" />,
  Heating: <Flame className="size-5" />,
  Parking: <Car className="size-5" />,
  Pool: <Waves className="size-5" />,
  Gym: <Dumbbell className="size-5" />,
  Elevator: <ArrowUp className="size-5" />,
  Security: <ShieldCheck className="size-5" />,
  Balcony: <Flower2 className="size-5" />,
  Garden: <LayoutGrid className="size-5" />,
  Dishwasher: <Sparkles className="size-5" />,
  "Washer/Dryer": <Sparkles className="size-5" />,
  "Pet Friendly": <PawPrint className="size-5" />,
  Furnished: <Sofa className="size-5" />,
  Concierge: <ConciergeBell className="size-5" />,
};

function AmenityChip({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-muted/40 hover:bg-muted/70 transition-colors">
      <span className="text-primary-700">
        {AMENITY_ICONS[name] ?? <UtensilsCrossed className="size-5" />}
      </span>
      <span className="text-sm font-medium text-foreground">{name}</span>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="text-muted-foreground text-sm py-4">
      No {label} information available.
    </p>
  );
}

function FeeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border last:border-b-0">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <DollarSign className="size-4 text-primary-500" />
        {label}
      </span>
      <span className="font-semibold text-foreground text-sm">{value}</span>
    </div>
  );
}

export default function PropertyDetailsTabs({ property }: Props) {
  const hasAmenities = property.amenities && property.amenities.length > 0;
  const hasHighlights = property.highlights && property.highlights.length > 0;

  return (
    <section>
      <Tabs defaultValue="amenities">
        <TabsList className="bg-muted/60 rounded-2xl h-auto p-1 flex-wrap gap-1 mb-6">
          <TabsTrigger
            value="amenities"
            className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-800 text-muted-foreground font-medium cursor-pointer"
          >
            Amenities
          </TabsTrigger>
          <TabsTrigger
            value="highlights"
            className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-800 text-muted-foreground font-medium cursor-pointer"
          >
            Highlights
          </TabsTrigger>
          <TabsTrigger
            value="fees"
            className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-800 text-muted-foreground font-medium cursor-pointer"
          >
            Fees
          </TabsTrigger>
          <TabsTrigger
            value="policies"
            className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-800 text-muted-foreground font-medium cursor-pointer"
          >
            Policies
          </TabsTrigger>
        </TabsList>

        {/* ── Amenities ────────────────────────────────────────── */}
        <TabsContent value="amenities">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
            World Class Amenities
          </h3>
          {hasAmenities ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {property.amenities.map((amenity) => (
                <AmenityChip key={amenity} name={amenity} />
              ))}
            </div>
          ) : (
            <EmptyState label="amenities" />
          )}
        </TabsContent>

        {/* ── Highlights ────────────────────────────────────────── */}
        <TabsContent value="highlights">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
            Property Highlights
          </h3>
          {hasHighlights ? (
            <ul className="space-y-3">
              {property.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-primary-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState label="highlights" />
          )}
        </TabsContent>

        {/* ── Fees ─────────────────────────────────────────────── */}
        <TabsContent value="fees">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
            Fees & Deposits
          </h3>
          <div className="rounded-2xl border border-border overflow-hidden bg-card">
            <FeeRow
              label="Monthly Rent"
              value={`$${property.pricePerMonth.toLocaleString()}/mo`}
            />
            <FeeRow
              label="Security Deposit"
              value={`$${property.securityDeposit.toLocaleString()}`}
            />
            <FeeRow
              label="Application Fee"
              value={`$${property.applicationFee.toLocaleString()}`}
            />
          </div>
        </TabsContent>

        {/* ── Policies ─────────────────────────────────────────── */}
        <TabsContent value="policies">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
            Property Policies
          </h3>
          <div className="space-y-4">
            {/* Pets */}
            <div
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border",
                property.isPetsAllowed
                  ? "border-green-200 bg-green-50"
                  : "border-red-100 bg-red-50"
              )}
            >
              <PawPrint
                className={cn(
                  "size-6 shrink-0",
                  property.isPetsAllowed ? "text-green-600" : "text-red-400"
                )}
              />
              <div>
                <p className="font-semibold text-sm text-foreground">Pets</p>
                <p className="text-xs text-muted-foreground">
                  {property.isPetsAllowed
                    ? "Pets are welcome in this property."
                    : "No pets allowed in this property."}
                </p>
              </div>
              <span
                className={cn(
                  "ml-auto text-xs font-semibold px-2.5 py-1 rounded-full",
                  property.isPetsAllowed
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                )}
              >
                {property.isPetsAllowed ? "Allowed" : "Not Allowed"}
              </span>
            </div>

            {/* Parking */}
            <div
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border",
                property.isParkingIncluded
                  ? "border-green-200 bg-green-50"
                  : "border-amber-100 bg-amber-50"
              )}
            >
              <ParkingSquare
                className={cn(
                  "size-6 shrink-0",
                  property.isParkingIncluded ? "text-green-600" : "text-amber-500"
                )}
              />
              <div>
                <p className="font-semibold text-sm text-foreground">Parking</p>
                <p className="text-xs text-muted-foreground">
                  {property.isParkingIncluded
                    ? "Dedicated parking space included."
                    : "Parking is not included — street parking available."}
                </p>
              </div>
              <span
                className={cn(
                  "ml-auto text-xs font-semibold px-2.5 py-1 rounded-full",
                  property.isParkingIncluded
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                {property.isParkingIncluded ? "Included" : "Not Included"}
              </span>
            </div>

            {/* General */}
            <div className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-muted/30">
              <FileText className="size-6 shrink-0 text-primary-500 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-foreground mb-1">
                  Lease Terms
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Standard lease agreements are available. Contact the property
                  manager for custom lease terms or short-term rental options.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-muted/30">
              <Heart className="size-6 shrink-0 text-primary-500 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-foreground mb-1">
                  Guest Policy
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Short-term guests permitted. Long-term guests (30+ days) require
                  landlord approval and may be subject to additional fees.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
