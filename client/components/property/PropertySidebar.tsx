"use client";

import React from "react";
import { Heart, CalendarCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Property } from "@/types";
import { useFavoriteToggle } from "@/hooks/useFavoriteToggle";
import { cn } from "@/lib/utils";

interface Props {
  property: Property;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function PropertySidebar({ property }: Props) {
  const { isFavorited, toggleFavorite, isLoading } = useFavoriteToggle(
    property.id
  );

  return (
    <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
      {/* ── Pricing ─────────────────────────────────────────────── */}
      <div className="p-6 border-b border-border">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
          Starting From
        </p>
        <div className="flex items-end gap-1">
          <span className="font-heading text-3xl font-bold text-foreground">
            {formatPrice(property.pricePerMonth)}
          </span>
          <span className="text-muted-foreground text-sm mb-1">/month</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarCheck className="size-3.5 text-primary-500" />
            <span>Available Now</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5 text-primary-500" />
            <span>
              {property.numberOfReviews
                ? `${property.numberOfReviews} Inquiries`
                : "Be First to Inquire"}
            </span>
          </div>
        </div>
      </div>

      {/* ── CTA Buttons ─────────────────────────────────────────── */}
      <div className="p-6 space-y-3">
        <a
          href={`mailto:contact@auraestates.com?subject=Inquiry: ${property.name}`}
          className="flex items-center justify-center w-full rounded-xl bg-primary-800 hover:bg-primary-900 text-white h-12 text-sm font-semibold transition-colors"
        >
          Apply Now →
        </a>

        <Button
          variant="outline"
          onClick={toggleFavorite}
          disabled={isLoading}
          className={cn(
            "w-full rounded-xl h-12 text-sm font-semibold border-border cursor-pointer transition-all",
            isFavorited
              ? "bg-primary-50 border-primary-300 text-primary-800"
              : "hover:bg-muted"
          )}
        >
          <Heart
            className={cn(
              "size-4 mr-2",
              isFavorited && "fill-primary-700 text-primary-700"
            )}
          />
          {isFavorited ? "Saved to Favourites" : "Save to Favourites"}
        </Button>
      </div>

      {/* ── Fees summary ─────────────────────────────────────────── */}
      <div className="px-6 pb-6 space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground py-2 border-t border-border">
          <span>Security Deposit</span>
          <span className="font-semibold text-foreground">
            {formatPrice(property.securityDeposit)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground py-2 border-t border-border">
          <span>Application Fee</span>
          <span className="font-semibold text-foreground">
            {formatPrice(property.applicationFee)}
          </span>
        </div>
      </div>

      {/* ── Social Proof ─────────────────────────────────────────── */}
      {property.averageRating && (
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-primary-50 border border-primary-100">
          <p className="text-xs text-primary-700 leading-relaxed italic">
            &ldquo;This property has seen significant interest this week. Don&rsquo;t
            miss out on your perfect home.&rdquo;
          </p>
          <p className="mt-2 text-[11px] font-semibold text-primary-600">
            ★ {property.averageRating.toFixed(1)} avg. rating
          </p>
        </div>
      )}
    </div>
  );
}
