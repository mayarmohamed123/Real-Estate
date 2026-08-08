"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { Compass, MapPin } from "lucide-react";

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const { filters } = useAppSelector((state) => state.global);
  const { data: properties } = useGetPropertiesQuery(filters);

  const [mapLoaded, setMapLoaded] = useState(false);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !mapContainerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [filters.coordinates.lng, filters.coordinates.lat],
      zoom: 11,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-left");

    map.on("load", () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token, filters.coordinates.lat, filters.coordinates.lng]);

  // Center map on filter coordinates change
  useEffect(() => {
    if (mapRef.current && filters.coordinates) {
      mapRef.current.flyTo({
        center: [filters.coordinates.lng, filters.coordinates.lat],
        essential: true,
      });
    }
  }, [filters.coordinates]);

  // Update property price markers
  useEffect(() => {
    const currentMap = mapRef.current;
    if (!currentMap || !properties) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    properties.forEach((property) => {
      const coords = property.location?.coordinates;
      if (!coords) return;

      let lng: number | undefined;
      let lat: number | undefined;

      if ("coordinates" in coords && Array.isArray(coords.coordinates)) {
        [lng, lat] = coords.coordinates;
      } else if ("latitude" in coords && "longitude" in coords) {
        lat = coords.latitude;
        lng = coords.longitude;
      }

      if (lng === undefined || lat === undefined) return;

      const el = document.createElement("div");
      el.className =
        "cursor-pointer bg-foreground text-background text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg border border-white/20 hover:scale-110 hover:bg-primary-700 transition-all duration-200 flex items-center gap-1";
      el.innerText = `$${(property.pricePerMonth / 1000).toFixed(1)}k`;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="font-family: var(--font-sans); padding: 4px;">
              <strong style="font-size: 14px;">${property.name}</strong>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: #666;">$${property.pricePerMonth.toLocaleString()}/mo</p>
            </div>
          `),
        )
        .addTo(currentMap);

      markersRef.current.push(marker);
    });
  }, [properties, mapLoaded]);

  if (!token) {
    return (
      <div className="relative w-full h-full min-h-100 bg-[#e8e4df] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {/* Decorative map grid background effect */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#4a443f 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Mock Map Markers for visual excellence matching screenshot aesthetic */}
        <div className="absolute top-1/4 left-1/3 bg-foreground text-background font-bold text-xs px-3 py-1.5 rounded-full shadow-lg border border-white/20 animate-bounce">
          $4.2M
        </div>
        <div className="absolute top-1/2 right-1/4 bg-foreground text-background font-bold text-xs px-3 py-1.5 rounded-full shadow-lg border border-white/20">
          $12.5M
        </div>
        <div className="absolute bottom-1/3 left-1/4 bg-foreground text-background font-bold text-xs px-3 py-1.5 rounded-full shadow-lg border border-white/20">
          $8.9M
        </div>

        {/* Center Pill / Notice */}
        <div className="relative z-10 bg-white/90 backdrop-blur-md border border-border p-6 rounded-2xl max-w-sm shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto text-primary-700">
            <MapPin className="size-6" />
          </div>
          <h4 className="font-heading text-base font-semibold text-foreground">
            Interactive Map View
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Set{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">
              NEXT_PUBLIC_MAPBOX_TOKEN
            </code>{" "}
            in your environment file to view live interactive Mapbox maps.
          </p>
        </div>

        {/* Bottom Floating Pill matching screenshot design */}
        <div className="absolute bottom-6 z-10">
          <button className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-border px-5 py-2.5 rounded-full shadow-md text-xs font-semibold text-foreground uppercase tracking-wider hover:bg-white transition-all cursor-pointer">
            <Compass className="size-4 text-primary-600" />
            Browse Neighborhoods
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-100">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Bottom Button matching design */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <button className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-border px-5 py-2.5 rounded-full shadow-md text-xs font-semibold text-foreground uppercase tracking-wider hover:bg-white transition-all cursor-pointer">
          <Compass className="size-4 text-primary-600" />
          Browse Neighborhoods
        </button>
      </div>
    </div>
  );
}
