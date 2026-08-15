"use client";

import React from "react";
import { Plus } from "lucide-react";

interface Props {
  count: number;
  onAddClick: () => void;
}

export default function PropertiesHeader({ count, onAddClick }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
          Portfolio Management
        </p>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          My Properties
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {count > 0
            ? `Managing ${count} listing${count !== 1 ? "s" : ""} in your portfolio.`
            : "Start building your estate portfolio."}
        </p>
      </div>

      <button
        onClick={onAddClick}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-800 hover:bg-primary-900 text-white text-sm font-semibold transition-colors cursor-pointer shrink-0"
      >
        <Plus className="size-4" />
        Add Property
      </button>
    </div>
  );
}
