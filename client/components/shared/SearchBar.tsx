import React from "react";
import { Button } from "../ui/button";

export default function SearchBar() {
  return (
    <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-background p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4 lg:p-5 xl:gap-6">
      <div className="flex flex-col gap-1 rounded-xl border border-stone-200 px-3 py-3 sm:min-w-35 sm:flex-1 lg:min-w-45">
        <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
          Location
        </div>
        <p className="text-sm text-stone-700">Where to?</p>
      </div>

      <div className="flex flex-col gap-1 rounded-xl border border-stone-200 px-3 py-3 sm:min-w-35 sm:flex-1 lg:min-w-45">
        <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
          Price Range
        </div>
        <p className="text-sm text-stone-700">$10K - $25K</p>
      </div>

      <div className="flex flex-col gap-1 rounded-xl border border-stone-200 px-3 py-3 sm:min-w-35 sm:flex-1 lg:min-w-45">
        <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
          Property Type
        </div>
        <p className="text-sm text-stone-700">Penthouse</p>
      </div>

      <Button size="lg" className="w-full px-6 py-5 sm:w-auto">
        Explore
      </Button>
    </div>
  );
}
