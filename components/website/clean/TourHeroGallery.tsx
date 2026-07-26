"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cldOptimize } from "@/lib/utils";
import styles from "./TourHeroGallery.module.css";

const TourGalleryLightbox = dynamic(() => import("./TourGalleryLightbox"), {
  ssr: false,
});

export default function TourHeroGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const usableImages = [...new Set(images.filter(Boolean))].slice(0, 8);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const closeLightbox = useCallback(() => setLightbox(false), []);

  function showSlide(index: number, behavior: ScrollBehavior = "smooth") {
    const safeIndex = Math.min(Math.max(index, 0), usableImages.length - 1);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    trackRef.current?.children[safeIndex]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : behavior,
      inline: "start",
      block: "nearest",
    });
    setActive(safeIndex);
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const index = visible ? Number((visible.target as HTMLElement).dataset.index) : -1;
        if (index >= 0) setActive(index);
      },
      { root: track, threshold: [0.55, 0.8] },
    );
    [...track.children].forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [usableImages.length]);

  if (!usableImages.length) return null;

  return (
    <div
      className={styles.gallery}
      role="region"
      aria-roledescription="carousel"
      aria-label={`Galeri ${title}`}
    >
      <div ref={trackRef} className={styles.track}>
        {usableImages.map((image, index) => (
          <figure key={`${image}-${index}`} data-index={index} className={styles.slide}>
            <button
              type="button"
              aria-label={`Buka foto ${index + 1} dari ${usableImages.length} dalam layar penuh`}
              onClick={(event) => {
                openerRef.current = event.currentTarget;
                setActive(index);
                setLightbox(true);
              }}
            >
              <Image
                src={cldOptimize(image, 1800)}
                alt={`${title}, gambar destinasi ${index + 1}`}
                fill
                priority={index === 0}
                fetchPriority={index === 0 ? "high" : "auto"}
                loading={index === 0 ? "eager" : "lazy"}
                quality={75}
                sizes="(max-width: 760px) 200vw, 1280px"
              />
            </button>
          </figure>
        ))}
      </div>

      {usableImages.length > 1 && (
        <>
          <button
            className={`${styles.arrow} ${styles.previous}`}
            type="button"
            aria-label="Foto sebelumnya"
            disabled={active === 0}
            onClick={() => showSlide(active - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            className={`${styles.arrow} ${styles.next}`}
            type="button"
            aria-label="Foto berikutnya"
            disabled={active === usableImages.length - 1}
            onClick={() => showSlide(active + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
          <div className={styles.dots} role="group" aria-label="Pilih foto">
            {usableImages.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Foto ${index + 1}`}
                aria-pressed={active === index}
                onClick={() => showSlide(index)}
              >
                <span />
              </button>
            ))}
          </div>
          <p className={styles.liveStatus} aria-live="polite">
            Foto {active + 1} dari {usableImages.length}
          </p>
        </>
      )}

      {lightbox && (
        <TourGalleryLightbox
          images={usableImages}
          title={title}
          active={active}
          openerRef={openerRef}
          onActiveChange={setActive}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}
