"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Property } from "@/types";
import { MapPin } from "lucide-react";

interface Props {
  property: Property;
}

/** Extract lat/lng from any of the coordinate formats the server may return */
function extractCoords(
  property: Property
): { lat: number; lng: number } | null {
  const coords = property.location?.coordinates;
  if (!coords) return null;

  if ("latitude" in coords && "longitude" in coords) {
    return { lat: coords.latitude, lng: coords.longitude };
  }
  if ("coordinates" in coords && Array.isArray(coords.coordinates)) {
    const [lng, lat] = coords.coordinates;
    return { lat, lng };
  }
  return null;
}

export default function PropertyLocationMap({ property }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const position = extractCoords(property);

  useEffect(() => {
    if (!token || !containerRef.current || !position) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [position.lng, position.lat],
      zoom: 14,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-left");

    // Single property marker
    const el = document.createElement("div");
    el.className =
      "w-10 h-10 rounded-full bg-primary-800 border-4 border-white shadow-xl flex items-center justify-center cursor-pointer";
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="0"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

    new mapboxgl.Marker(el)
      .setLngLat([position.lng, position.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 30 }).setHTML(`
          <div style="font-family:var(--font-sans);padding:6px 2px">
            <strong style="font-size:13px;">${property.name}</strong>
            ${
              property.location
                ? `<p style="margin:4px 0 0;font-size:11px;color:#666;">${property.location.address}, ${property.location.city}</p>`
                : ""
            }
          </div>
        `)
      )
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token, position?.lat, position?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── No token fallback ─────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="h-72 rounded-2xl border border-border bg-[#e8e4df] flex flex-col items-center justify-center gap-3 text-center overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#4a443f 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative z-10 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-border max-w-xs">
          <MapPin className="size-6 text-primary-600 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Set{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">
              NEXT_PUBLIC_MAPBOX_TOKEN
            </code>{" "}
            to view the map.
          </p>
        </div>
      </div>
    );
  }

  // ── No coordinates fallback ───────────────────────────────────────────────
  if (!position) {
    return (
      <div className="h-72 rounded-2xl border border-border bg-muted/40 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Location coordinates not available.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden border border-border shadow-sm">
      <div ref={containerRef} className="w-full h-full" />

      {/* Neighbourhood info overlay */}
      {property.location && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-2xl border border-border shadow-lg p-4 max-w-55">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Neighbourhood
          </p>
          <p className="text-sm font-semibold text-foreground">
            {property.location.city}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {property.location.address}
          </p>
        </div>
      )}
    </div>
  );
}
