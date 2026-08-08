"use client";

import React from "react";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";

export default function DiscoverMoreCard() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border-2 border-dashed border-border bg-card/40 hover:bg-card hover:border-primary-300 transition-all duration-300 min-h-[340px]">
      <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <Plus className="size-6 text-primary-600" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
        Discover More
      </h3>
      <p className="text-xs text-muted-foreground max-w-xs mb-6 leading-relaxed">
        Continue exploring our exclusive listings to find your next
        architectural sanctuary.
      </p>
      <Link
        href="/properties"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
      >
        Explore Properties
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
