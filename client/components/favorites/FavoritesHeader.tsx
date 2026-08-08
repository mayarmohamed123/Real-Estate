"use client";

import React from "react";

export default function FavoritesHeader() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-foreground">
        Your Curated Collection
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-lg">
        Review and manage your shortlisted residences. Each property has been
        selected to reflect your preference for{" "}
        <span className="text-primary-600 font-medium">
          architectural excellence
        </span>{" "}
        and{" "}
        <span className="text-primary-600 font-medium">
          serene living environments
        </span>
        .
      </p>
    </div>
  );
}
