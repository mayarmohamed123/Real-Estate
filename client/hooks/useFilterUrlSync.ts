"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { setFilters, FiltersState } from "@/state/index";
import debounce from "lodash/debounce";

export function useFilterUrlSync() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { filters } = useAppSelector((state) => state.global);

  const isInitialized = useRef(false);

  // 1. Initial Load: Read URL search params -> Redux state
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initialFilters: Partial<FiltersState> = {};

    const locationParam = searchParams.get("location");
    if (locationParam) initialFilters.location = locationParam;

    const bedsParam = searchParams.get("beds");
    if (bedsParam) initialFilters.beds = bedsParam;

    const bathsParam = searchParams.get("baths");
    if (bathsParam) initialFilters.baths = bathsParam;

    const propertyTypeParam = searchParams.get("propertyType");
    if (propertyTypeParam) initialFilters.propertyType = propertyTypeParam;

    const amenitiesParam = searchParams.get("amenities");
    if (amenitiesParam) {
      initialFilters.amenities = amenitiesParam.split(",").filter(Boolean);
    }

    const availableFromParam = searchParams.get("availableFrom");
    if (availableFromParam) initialFilters.availableFrom = availableFromParam;

    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    if (priceMin && priceMax) {
      initialFilters.priceRange = [Number(priceMin), Number(priceMax)];
    }

    const sqftMin = searchParams.get("squareFeetMin");
    const sqftMax = searchParams.get("squareFeetMax");
    if (sqftMin && sqftMax) {
      initialFilters.squareFeet = [Number(sqftMin), Number(sqftMax)];
    }

    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    if (lat && lng) {
      initialFilters.coordinates = { lat: Number(lat), lng: Number(lng) };
    }

    if (Object.keys(initialFilters).length > 0) {
      dispatch(setFilters(initialFilters));
    }
  }, [searchParams, dispatch]);

  // 2. Debounced URL Update when Redux state changes
  const debouncedUpdateUrl = useRef(
    debounce((currentFilters: FiltersState) => {
      const params = new URLSearchParams();

      if (currentFilters.location)
        params.set("location", currentFilters.location);
      if (currentFilters.beds && currentFilters.beds !== "any")
        params.set("beds", currentFilters.beds);
      if (currentFilters.baths && currentFilters.baths !== "any")
        params.set("baths", currentFilters.baths);
      if (currentFilters.propertyType && currentFilters.propertyType !== "any")
        params.set("propertyType", currentFilters.propertyType);
      if (currentFilters.amenities && currentFilters.amenities.length > 0)
        params.set("amenities", currentFilters.amenities.join(","));
      if (currentFilters.availableFrom)
        params.set("availableFrom", currentFilters.availableFrom);
      if (currentFilters.priceRange) {
        params.set("priceMin", currentFilters.priceRange[0].toString());
        params.set("priceMax", currentFilters.priceRange[1].toString());
      }
      if (currentFilters.squareFeet) {
        params.set("squareFeetMin", currentFilters.squareFeet[0].toString());
        params.set("squareFeetMax", currentFilters.squareFeet[1].toString());
      }
      if (currentFilters.coordinates) {
        params.set("lat", currentFilters.coordinates.lat.toString());
        params.set("lng", currentFilters.coordinates.lng.toString());
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    }, 400)
  ).current;

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateUrl.cancel();
    };
  }, [debouncedUpdateUrl]);

  // Trigger debounced update whenever Redux filters change
  useEffect(() => {
    if (!isInitialized.current) return;
    debouncedUpdateUrl(filters);
  }, [filters, debouncedUpdateUrl]);
}
