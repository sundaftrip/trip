"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryZoom({ images }: { images: string[] }) {
  const [active, setActive] = useState<number | null>(null);

  const prev = useCallback(() => {
    setActive((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  }, [images.length]);

  const next = useCallback(() => {
    setActive((i) => (i !== null ? (i + 1) % images.length : null));
  }, [images.length]);

  /* keyboard + scroll-lock */
  useEffect(() => {
    if (active === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [active, prev, next]);

  /* ── GRID ── */
  const gridCount = Math.min(images.length, 5);
  const extras = images.length - gridCount;

  return (
    <>
      {/* Gallery grid — editorial layout */}
      {images.length === 1 && (
        <button
          onClick={() => setActive(0)}
          className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-zoom-in group block"
        >
          <Image src={images[0]} alt="Gallery" fill className="object-cover group-hover:scale-105 transition duration-500" />
        </button>
      )}

      {images.length === 2 && (
        <div className="grid grid-cols-2 gap-2 h-64 sm:h-80">
          {images.map((url, i) => (
            <button key={i} onClick={() => setActive(i)}
              className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-zoom-in group">
              <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover group-hover:scale-105 transition duration-500" />
            </button>
          ))}
        </div>
      )}

      {images.length >= 3 && (
        <div className="grid grid-cols-3 grid-rows-2 gap-2 h-64 sm:h-80">
          {/* Hero — 2 cols × 2 rows */}
          <button onClick={() => setActive(0)}
            className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-zoom-in group">
            <Image src={images[0]} alt="Gallery 1" fill className="object-cover group-hover:scale-105 transition duration-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center bg-black/10" />
          </button>

          {/* Side thumbnails */}
          {images.slice(1, 3).map((url, i) => {
            const idx = i + 1;
            const isLast = i === 1 && extras > 0;
            return (
              <button key={idx} onClick={() => setActive(idx)}
                className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-zoom-in group">
                <Image src={url} alt={`Gallery ${idx + 1}`} fill className="object-cover group-hover:scale-105 transition duration-500" />
                {isLast && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                    <span className="text-white font-bold text-base">+{extras + 1}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── LIGHTBOX ── */}
      {active !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col items-center justify-center"
          onClick={() => setActive(null)}
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10">
            <span className="text-white/50 text-xs font-medium">
              {active + 1} / {images.length}
            </span>
            <button
              onClick={() => setActive(null)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Image — adapts to any aspect ratio */}
          <div
            className="relative flex items-center justify-center px-16"
            style={{ width: "100%", height: "calc(100vh - 130px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={active}
              src={images[active]}
              alt={`Foto ${active + 1}`}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: "14px",
                display: "block",
              }}
            />
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              disabled={active === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition disabled:opacity-20"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              disabled={active === images.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition disabled:opacity-20"
            >
              <ChevronRight size={22} />
            </button>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div
              className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 px-4 py-4 overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`relative shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    i === active
                      ? "border-white opacity-100 scale-105"
                      : "border-transparent opacity-40 hover:opacity-70"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
