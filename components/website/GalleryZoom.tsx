"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cldOptimize } from "@/lib/utils";

/* Batasi resolusi yang DISAJIKAN (Cloudinary di-cap via URL, file lokal lewat
   apa adanya) → original full-res tak pernah ikut ke browser. */
const grid = (u: string) => cldOptimize(u, 1100);
const big = (u: string) => cldOptimize(u, 1366);

export default function GalleryZoom({
  images,
  altPrefix = "Dokumentasi perjalanan Sundaf Trip",
}: {
  images: string[];
  altPrefix?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const altFor = useCallback((index: number) => `${altPrefix} ${index + 1}`, [altPrefix]);

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
      {/* Gallery grid, editorial layout.
          select-none + blokir klik-kanan + drag mati = anti-curi kasual. */}
      <div onContextMenu={(e) => e.preventDefault()} className="select-none">
      {images.length === 1 && (
        <button
          onClick={() => setActive(0)}
          aria-label="Buka dokumentasi foto 1"
          className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-zoom-in group block"
        >
          <Image src={grid(images[0])} alt={altFor(0)} fill draggable={false} loading="eager" fetchPriority="high" className="object-cover pointer-events-none group-hover:scale-105 transition duration-500" />
        </button>
      )}

      {images.length === 2 && (
        <div className="grid grid-cols-2 gap-2 h-64 sm:h-80">
          {images.map((url, i) => (
            <button key={i} onClick={() => setActive(i)}
              aria-label={`Buka dokumentasi foto ${i + 1}`}
              className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-zoom-in group">
              <Image src={grid(url)} alt={altFor(i)} fill draggable={false} loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} className="object-cover pointer-events-none group-hover:scale-105 transition duration-500" />
            </button>
          ))}
        </div>
      )}

      {images.length >= 3 && (
        <div className="grid grid-cols-3 grid-rows-2 gap-2 h-64 sm:h-80">
          {/* Hero, 2 cols × 2 rows */}
          <button onClick={() => setActive(0)}
            aria-label="Buka dokumentasi foto 1"
            className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-zoom-in group">
            <Image src={grid(images[0])} alt={altFor(0)} fill draggable={false} loading="eager" fetchPriority="high" className="object-cover pointer-events-none group-hover:scale-105 transition duration-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center bg-black/10" />
          </button>

          {/* Side thumbnails */}
          {images.slice(1, 3).map((url, i) => {
            const idx = i + 1;
            const isLast = i === 1 && extras > 0;
            return (
              <button key={idx} onClick={() => setActive(idx)}
                aria-label={`Buka dokumentasi foto ${idx + 1}`}
                className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-zoom-in group">
                <Image src={grid(url)} alt={altFor(idx)} fill draggable={false} className="object-cover pointer-events-none group-hover:scale-105 transition duration-500" />
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
      </div>

      {/* ── LIGHTBOX ── */}
      {active !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col items-center justify-center select-none"
          onClick={() => setActive(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10">
            <span className="text-white/50 text-xs font-medium">
              {active + 1} / {images.length}
            </span>
            <button
              onClick={() => setActive(null)}
              aria-label="Tutup galeri"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Image, adapts to any aspect ratio */}
          <div
            className="relative flex items-center justify-center px-16"
            style={{ width: "100%", height: "calc(100vh - 130px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={active}
              src={big(images[active])}
              alt={altFor(active)}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: "14px",
                display: "block",
                userSelect: "none",
                WebkitUserSelect: "none",
                WebkitTouchCallout: "none",
              }}
            />
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              disabled={active === 0}
              aria-label="Foto sebelumnya"
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
              aria-label="Foto berikutnya"
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
                  type="button"
                  aria-label={`Lihat foto ke-${i + 1}`}
                  className={`relative shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    i === active
                      ? "border-white opacity-100 scale-105"
                      : "border-transparent opacity-40 hover:opacity-70"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cldOptimize(url,160)} alt={altFor(i)} draggable={false} className="w-full h-full object-cover pointer-events-none" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
