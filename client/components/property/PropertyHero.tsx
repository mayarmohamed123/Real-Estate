"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Property } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  property: Property;
}

export default function PropertyHero({ property }: Props) {
  const photos = property.photoUrls ?? [];
  const [lightbox, setLightbox] = useState<number | null>(null);

  const main = photos[0] ?? null;
  const secondary = photos.slice(1, 3);

  const navigate = (dir: 1 | -1) => {
    setLightbox((prev) => {
      if (prev === null) return null;
      const next = prev + dir;
      if (next < 0) return photos.length - 1;
      if (next >= photos.length) return 0;
      return next;
    });
  };

  return (
    <>
      {/* ── Photo Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-2 h-72 sm:h-96 lg:h-120">
        {/* Main photo */}
        <div
          className="relative overflow-hidden lg:rounded-l-2xl cursor-zoom-in group"
          onClick={() => main && setLightbox(0)}
        >
          {main ? (
            <Image
              src={main}
              alt={property.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
          ) : (
            <div className="w-full h-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-400 text-sm">No photo</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent pointer-events-none" />
        </div>

        {/* Secondary photos stack */}
        <div className="hidden lg:flex flex-col gap-2">
          {[0, 1].map((i) => {
            const src = secondary[i] ?? null;
            const isLast = i === 1 && photos.length > 3;
            return (
              <div
                key={i}
                className={cn(
                  "relative flex-1 overflow-hidden cursor-zoom-in group",
                  i === 0 && "rounded-tr-2xl",
                  i === 1 && "rounded-br-2xl"
                )}
                onClick={() => setLightbox(i + 1)}
              >
                {src ? (
                  <Image
                    src={src}
                    alt={`${property.name} photo ${i + 2}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
                {isLast && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      +{photos.length - 3} more
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Lightbox ───────────────────────────────────────────────────── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="size-5" />
          </button>

          {/* Prev */}
          <button
            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
          >
            <ChevronLeft className="size-6" />
          </button>

          {/* Image */}
          <div
            className="relative w-full max-w-4xl aspect-4/3 mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            {photos[lightbox] && (
              <Image
                src={photos[lightbox]}
                alt={`Photo ${lightbox + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            )}
          </div>

          {/* Next */}
          <button
            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); navigate(1); }}
          >
            <ChevronRight className="size-6" />
          </button>

          {/* Counter */}
          <p className="absolute bottom-4 text-white/70 text-sm">
            {lightbox + 1} / {photos.length}
          </p>
        </div>
      )}
    </>
  );
}
