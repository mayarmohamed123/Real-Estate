"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import {
  setFilters,
  toggleFiltersFullOpen,
  setViewMode,
} from "@/state/index";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  ChevronDown,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BEDS_OPTIONS = ["any", "1", "2", "3", "4", "5+"];
const PROPERTY_TYPES = ["any", "Apartment", "House", "Villa", "Condo", "Studio", "Penthouse"];

interface FilterPillProps {
  label: string;
  active?: boolean;
  children: React.ReactNode;
}

function FilterPill({ label, active, children }: FilterPillProps) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer",
          active
            ? "bg-primary-800 text-white border-primary-800 shadow-sm"
            : "bg-white text-primary-800 border-border hover:border-primary-400 hover:bg-primary-50"
        )}
      >
        {label}
        <ChevronDown className="size-3.5 opacity-60" />
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-4 bg-white border-border shadow-xl rounded-2xl"
        align="start"
        sideOffset={8}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

export default function FiltersBar({ totalCount }: { totalCount?: number }) {
  const dispatch = useAppDispatch();
  const { filters, viewMode, isFiltersFullOpen } = useAppSelector(
    (state) => state.global
  );

  const priceLabel =
    filters.priceRange
      ? `$${filters.priceRange[0].toLocaleString()} – $${filters.priceRange[1].toLocaleString()}`
      : "Price Range";

  const bedsLabel = filters.beds === "any" ? "Bedrooms" : `${filters.beds}+ Beds`;
  const typeLabel =
    filters.propertyType === "any" ? "Property Type" : filters.propertyType;

  return (
    <div className="sticky top-16.5 z-40 bg-background/95 backdrop-blur-md border-b border-border/70 px-4 py-3 sm:px-6 lg:px-8">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        {/* ── Filter Pills ──────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Price Range */}
          <FilterPill
            label={priceLabel}
            active={!!filters.priceRange}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Price Range (per month)
            </p>
            <Slider
              min={500}
              max={20000}
              step={250}
              value={filters.priceRange ?? [500, 20000]}
              onValueChange={(val) => {
                if (Array.isArray(val) && val.length >= 2) {
                  dispatch(setFilters({ priceRange: [val[0], val[1]] }));
                }
              }}
              className="mb-3"
            />
            <div className="flex justify-between text-sm font-medium text-foreground">
              <span>${(filters.priceRange?.[0] ?? 500).toLocaleString()}</span>
              <span>${(filters.priceRange?.[1] ?? 20000).toLocaleString()}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-xs text-muted-foreground hover:text-destructive"
              onClick={() => dispatch(setFilters({ priceRange: null }))}
            >
              Clear
            </Button>
          </FilterPill>

          {/* Bedrooms */}
          <FilterPill
            label={bedsLabel}
            active={filters.beds !== "any"}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Bedrooms
            </p>
            <div className="flex flex-wrap gap-2">
              {BEDS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => dispatch(setFilters({ beds: opt }))}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer",
                    filters.beds === opt
                      ? "bg-primary-800 text-white border-primary-800"
                      : "bg-white text-primary-700 border-border hover:border-primary-400"
                  )}
                >
                  {opt === "any" ? "Any" : `${opt}+`}
                </button>
              ))}
            </div>
          </FilterPill>

          {/* Property Type */}
          <FilterPill
            label={typeLabel}
            active={filters.propertyType !== "any"}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Property Type
            </p>
            <div className="flex flex-col gap-1">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => dispatch(setFilters({ propertyType: type }))}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer",
                    filters.propertyType === type
                      ? "bg-primary-100 text-primary-900 font-semibold"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {type === "any" ? "Any Type" : type}
                </button>
              ))}
            </div>
          </FilterPill>

          {/* More Filters */}
          <button
            onClick={() => dispatch(toggleFiltersFullOpen())}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer",
              isFiltersFullOpen
                ? "bg-primary-800 text-white border-primary-800"
                : "bg-white text-primary-800 border-border hover:border-primary-400 hover:bg-primary-50"
            )}
          >
            <SlidersHorizontal className="size-3.5" />
            More Filters
          </button>
        </div>

        {/* ── Right: Count + View Mode ──────────────────────── */}
        <div className="flex items-center gap-4">
          {totalCount !== undefined && (
            <p className="text-sm text-muted-foreground hidden sm:block">
              Showing{" "}
              <span className="font-semibold text-foreground">{totalCount}</span>{" "}
              results for{" "}
              <span className="font-semibold text-primary-700">
                {filters.location}
              </span>
            </p>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted rounded-xl p-1 gap-0.5">
            <button
              onClick={() => dispatch(setViewMode("grid"))}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                viewMode === "grid"
                  ? "bg-white text-primary-800 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => dispatch(setViewMode("list"))}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                viewMode === "list"
                  ? "bg-white text-primary-800 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="List view"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
