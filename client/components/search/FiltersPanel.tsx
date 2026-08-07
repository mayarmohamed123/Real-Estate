"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { setFilters, toggleFiltersFullOpen } from "@/state/index";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const AMENITIES_LIST = [
  "WiFi",
  "Air Conditioning",
  "Heating",
  "Parking",
  "Pool",
  "Gym",
  "Elevator",
  "Security",
  "Balcony",
  "Garden",
  "Dishwasher",
  "Washer/Dryer",
  "Pet Friendly",
  "Furnished",
  "Concierge",
];

const BEDS_OPTIONS = ["any", "1", "2", "3", "4", "5+"];
const BATHS_OPTIONS = ["any", "1", "2", "3", "4+"];
const PROPERTY_TYPES = [
  "any",
  "Apartment",
  "House",
  "Villa",
  "Condo",
  "Studio",
  "Penthouse",
];

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="py-5 border-b border-border last:border-b-0">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
        {title}
      </p>
      {children}
    </div>
  );
}

export default function FiltersPanel() {
  const dispatch = useAppDispatch();
  const { filters, isFiltersFullOpen } = useAppSelector(
    (state) => state.global
  );

  const handleClearAll = () => {
    dispatch(
      setFilters({
        beds: "any",
        baths: "any",
        propertyType: "any",
        amenities: [],
        availableFrom: "",
        priceRange: null,
        squareFeet: null,
      })
    );
  };

  const toggleAmenity = (amenity: string) => {
    const current = filters.amenities;
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    dispatch(setFilters({ amenities: updated }));
  };

  return (
    <>
      {/* Backdrop */}
      {isFiltersFullOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => dispatch(toggleFiltersFullOpen())}
        />
      )}

      {/* Panel */}
      <aside
        className={cn(
          "absolute top-0 left-0 h-full z-50 bg-white border-r border-border shadow-2xl flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
          isFiltersFullOpen ? "w-80 opacity-100" : "w-0 opacity-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            All Filters
          </h2>
          <button
            onClick={() => dispatch(toggleFiltersFullOpen())}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close filters panel"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6">
          {/* Location */}
          <Section title="Location">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary-400" />
              <Input
                value={filters.location}
                onChange={(e) =>
                  dispatch(setFilters({ location: e.target.value }))
                }
                placeholder="City, neighbourhood…"
                className="pl-9 rounded-xl border-border bg-muted/50 focus:bg-white"
              />
            </div>
          </Section>

          {/* Price Range */}
          <Section title="Price Range (per month)">
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
            <div className="flex justify-between text-sm font-semibold text-foreground">
              <span>
                £{(filters.priceRange?.[0] ?? 500).toLocaleString()}
              </span>
              <span>
                £{(filters.priceRange?.[1] ?? 20000).toLocaleString()}
              </span>
            </div>
          </Section>

          {/* Bedrooms */}
          <Section title="Bedrooms">
            <div className="flex flex-wrap gap-2">
              {BEDS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => dispatch(setFilters({ beds: opt }))}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer",
                    filters.beds === opt
                      ? "bg-primary-800 text-white border-primary-800"
                      : "bg-white text-primary-700 border-border hover:border-primary-400"
                  )}
                >
                  {opt === "any" ? "Any" : `${opt}+`}
                </button>
              ))}
            </div>
          </Section>

          {/* Bathrooms */}
          <Section title="Bathrooms">
            <div className="flex flex-wrap gap-2">
              {BATHS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => dispatch(setFilters({ baths: opt }))}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer",
                    filters.baths === opt
                      ? "bg-primary-800 text-white border-primary-800"
                      : "bg-white text-primary-700 border-border hover:border-primary-400"
                  )}
                >
                  {opt === "any" ? "Any" : `${opt}+`}
                </button>
              ))}
            </div>
          </Section>

          {/* Property Type */}
          <Section title="Property Type">
            <Select
              value={filters.propertyType}
              onValueChange={(val) => {
                if (val !== null) {
                  dispatch(setFilters({ propertyType: val }));
                }
              }}
            >
              <SelectTrigger className="rounded-xl border-border">
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "any" ? "Any Type" : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Section>

          {/* Square Feet */}
          <Section title="Square Feet">
            <Slider
              min={200}
              max={10000}
              step={100}
              value={filters.squareFeet ?? [200, 10000]}
              onValueChange={(val) => {
                if (Array.isArray(val) && val.length >= 2) {
                  dispatch(setFilters({ squareFeet: [val[0], val[1]] }));
                }
              }}
              className="mb-3"
            />
            <div className="flex justify-between text-sm font-semibold text-foreground">
              <span>
                {(filters.squareFeet?.[0] ?? 200).toLocaleString()} sqft
              </span>
              <span>
                {(filters.squareFeet?.[1] ?? 10000).toLocaleString()} sqft
              </span>
            </div>
          </Section>

          {/* Available From */}
          <Section title="Available From">
            <Input
              type="date"
              value={filters.availableFrom}
              onChange={(e) =>
                dispatch(setFilters({ availableFrom: e.target.value }))
              }
              className="rounded-xl border-border"
            />
          </Section>

          {/* Amenities */}
          <Section title="Amenities">
            <div className="grid grid-cols-1 gap-2.5">
              {AMENITIES_LIST.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <Checkbox
                    checked={filters.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                    className="border-border data-[state=checked]:bg-primary-700 data-[state=checked]:border-primary-700"
                  />
                  <span className="text-sm text-foreground group-hover:text-primary-700 transition-colors">
                    {amenity}
                  </span>
                </label>
              ))}
            </div>
          </Section>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-xl text-sm cursor-pointer"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
          <Button
            className="flex-1 rounded-xl text-sm bg-primary-800 hover:bg-primary-900 text-white cursor-pointer"
            onClick={() => dispatch(toggleFiltersFullOpen())}
          >
            Apply Filters
          </Button>
        </div>
      </aside>
    </>
  );
}
