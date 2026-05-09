"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryZoom({ images }: { images: string[] }) {
  const [active, setActive] = useState<number | null>(null);

  function prev() {
    setActive((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  }
  function next() {
    setActive((i) => (i !== null ? (i + 1) % images.length : null));
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {images.slice(0, 6).map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className="relative h-28 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-zoom-in group"
          >
            <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover group-hover:scale-105 transition duration-300" />
            {i === 5 && images.length > 6 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold text-sm">
                +{images.length - 6} foto
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setActive(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white transition"
            >
              <X size={24} />
            </button>

            {/* Image */}
            <div className="relative w-full" style={{ aspectRatio: "16/10" }}>
              <Image
                src={images[active]}
                alt={`Foto ${active + 1}`}
                fill
                className="object-contain rounded-xl"
              />
            </div>

            {/* Nav prev */}
            {images.length > 1 && (
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-black/70 text-white rounded-full transition"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Nav next */}
            {images.length > 1 && (
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-black/70 text-white rounded-full transition"
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* Counter */}
            <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs">
              {active + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
