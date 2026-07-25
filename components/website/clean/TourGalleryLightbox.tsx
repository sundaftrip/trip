"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { cldOptimize } from "@/lib/utils";
import styles from "./TourHeroGallery.module.css";

const focusableSelector = [
  "button:not([disabled])",
  "a[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function TourGalleryLightbox({
  images,
  title,
  active,
  openerRef,
  onActiveChange,
  onClose,
}: {
  images: string[];
  title: string;
  active: number;
  openerRef: RefObject<HTMLButtonElement | null>;
  onActiveChange: Dispatch<SetStateAction<number>>;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = openerRef.current;
    const previousOverflow = document.body.style.overflow;
    const layer = dialogRef.current?.parentElement;
    const backgroundTargets = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement
        && element !== layer
        && element.tagName !== "SCRIPT"
        && element.tagName !== "STYLE",
    );
    const backgroundState = backgroundTargets.map((target) => ({
      target,
      inert: target.inert,
      ariaHidden: target.getAttribute("aria-hidden"),
    }));

    document.body.style.overflow = "hidden";
    backgroundTargets.forEach((target) => {
      target.inert = true;
      target.setAttribute("aria-hidden", "true");
    });
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onActiveChange((value) => (value - 1 + images.length) % images.length);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onActiveChange((value) => (value + 1) % images.length);
      } else if (event.key === "Tab" && dialogRef.current) {
        const controls = [...dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)]
          .filter((element) => element.offsetParent !== null);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      backgroundState.forEach(({ target, inert, ariaHidden }) => {
        target.inert = inert;
        if (ariaHidden === null) target.removeAttribute("aria-hidden");
        else target.setAttribute("aria-hidden", ariaHidden);
      });
      window.requestAnimationFrame(() => {
        if (opener?.isConnected) opener.focus();
      });
    };
  }, [images.length, onActiveChange, onClose, openerRef]);

  return createPortal((
    <div
      className={styles.lightboxBackdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.lightbox}
        role="dialog"
        aria-modal="true"
        aria-label={`Foto ${active + 1} dari ${images.length}: ${title}`}
      >
        <div className={styles.lightboxTop}>
          <span aria-live="polite">{active + 1} / {images.length}</span>
          <button ref={closeRef} type="button" aria-label="Tutup galeri" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </div>
        <div className={styles.lightboxMedia}>
          <Image
            src={cldOptimize(images[active], 1600)}
            alt={`${title}, gambar destinasi ${active + 1}`}
            fill
            sizes="100vw"
          />
        </div>
        {images.length > 1 && (
          <>
            <button
              className={`${styles.lightboxArrow} ${styles.lightboxPrevious}`}
              type="button"
              aria-label="Foto sebelumnya"
              onClick={() => onActiveChange((value) => (value - 1 + images.length) % images.length)}
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <button
              className={`${styles.lightboxArrow} ${styles.lightboxNext}`}
              type="button"
              aria-label="Foto berikutnya"
              onClick={() => onActiveChange((value) => (value + 1) % images.length)}
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  ), document.body);
}
