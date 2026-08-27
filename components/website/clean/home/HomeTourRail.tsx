"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { getTourProductImage } from "@/lib/tour-product-images";
import { cldThumb, formatCurrency } from "@/lib/utils";
import type { CleanTour } from "../CleanTourCard";
import { appendCampaignToPath } from "@/lib/campaign-attribution";
import styles from "./CleanHome.module.css";

const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const MONTH_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

function validDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function statusLabel(tour: CleanTour) {
  if (tour.state === "sold") return "Penuh";
  if (/confirmed|terkonfirmasi/i.test(tour.badge || "")) return "Terkonfirmasi";
  if (tour.seatsLeft > 0 && tour.seatsLeft <= 3) return "Kursi terakhir";
  if (tour.seatsLeft > 0) return "Tersedia";
  return "Tanya ketersediaan";
}

function tripMeta(tour: CleanTour) {
  const date = validDate(tour.tripDate);
  const month = date ? MONTH_FORMATTER.format(date) : "Jadwal menyusul";
  return [tour.duration, month].filter(Boolean).join(" · ");
}

function departureLabel(tour: CleanTour) {
  const date = validDate(tour.tripDate);
  return date ? DATE_FORMATTER.format(date) : "Tanggal akan diumumkan";
}

function routeHighlight(value: string) {
  return value.split(/\s*•\s*/).map((part, index) => (
    <Fragment key={`${part}-${index}`}>
      {index > 0 ? (
        <>
          <span className={styles.routeSeparator} aria-hidden="true">•</span>
          <span className="sr-only">, </span>
        </>
      ) : null}
      {part}
    </Fragment>
  ));
}

export default function HomeTourRail({ tours }: { tours: CleanTour[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    canScrollBackward: false,
    canScrollForward: false,
    progress: 0,
  });

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const scrollLeft = Math.min(maxScroll, Math.max(0, rail.scrollLeft));

    setScrollState({
      canScrollBackward: scrollLeft > 4,
      canScrollForward: scrollLeft < maxScroll - 4,
      progress:
        rail.scrollWidth > 0
          ? Math.min(1, (scrollLeft + rail.clientWidth) / rail.scrollWidth)
          : 1,
    });
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let frame = 0;
    const requestUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    rail.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      rail.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [updateScrollState, tours.length]);

  const scrollRail = useCallback((direction: "backward" | "forward") => {
    const rail = railRef.current;
    if (!rail) return;

    const cards = rail.querySelectorAll<HTMLElement>(`.${styles.tourCard}`);
    const distance =
      cards.length > 1
        ? cards[1].offsetLeft - cards[0].offsetLeft
        : cards[0]?.getBoundingClientRect().width || rail.clientWidth * 0.85;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    rail.scrollBy({
      left: direction === "forward" ? distance : -distance,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, []);

  function handleRailKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    scrollRail(event.key === "ArrowRight" ? "forward" : "backward");
  }

  function preserveCampaign(
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    const attributedHref = appendCampaignToPath(href, window.location.search);
    if (attributedHref === href) return;
    event.preventDefault();
    window.location.assign(attributedHref);
  }

  return (
    <div
      className={styles.railStage}
      role="region"
      aria-roledescription="carousel"
      aria-label="Jadwal perjalanan Sundaf"
    >
      <div
        id="home-tour-rail"
        ref={railRef}
        className={styles.tourRail}
        role="group"
        aria-label="Daftar kartu perjalanan. Geser atau gunakan tombol navigasi."
        tabIndex={0}
        onKeyDown={handleRailKeyDown}
      >
        {tours.map((tour, index) => {
          const href = `/tours/${tour.slug || tour.id}`;
          const basePrice = tour.promoPrice || tour.price;
          const mandatoryTotal = Math.max(0, Number(tour.mandatoryTotal) || 0);
          const price = basePrice > 0 ? basePrice + mandatoryTotal : 0;
          return (
            <article
              className={styles.tourCard}
              data-state={tour.state}
              key={tour.id}
            >
              <span className="sr-only">
                Perjalanan {index + 1} dari {tours.length}: {tour.title}
              </span>
              <Link
                href={href}
                className={styles.tourMedia}
                data-analytics-event="tour_card_click"
                data-tour-id={tour.id}
                onClick={(event) => preserveCampaign(event, href)}
              >
                <Image
                  src={cldThumb(getTourProductImage(tour), 760, 510)}
                  alt=""
                  fill
                  sizes="(max-width: 699px) 82vw, (max-width: 1199px) 44vw, 360px"
                />
                <span className={styles.tourMediaShade} aria-hidden="true" />
                <span className={styles.tourBadge}>{statusLabel(tour)}</span>
                <h3 className={styles.tourMediaTitle}>{tour.title}</h3>
              </Link>

              <div className={styles.tourBody}>
                <p className={styles.tourMeta}>{tripMeta(tour)}</p>
                <p className={styles.routeLine}>
                  <MapPin aria-hidden="true" />
                  <span>{routeHighlight(tour.cityHighlight || tour.country)}</span>
                </p>
                <p className={styles.departureLine}>
                  <Calendar aria-hidden="true" />
                  <span>{departureLabel(tour)}</span>
                </p>
                <div className={styles.tourPrice}>
                  <span>{price > 0 ? (mandatoryTotal > 0 ? "Total wajib" : "Harga paket") : "Harga"}</span>
                  <strong>
                    {price > 0 ? (
                      <>
                        {formatCurrency(price)} <small>/orang</small>
                      </>
                    ) : (
                      "Hubungi tim"
                    )}
                  </strong>
                  {mandatoryTotal > 0 ? (
                    <small className={styles.tourMandatoryNote}>
                      Termasuk {formatCurrency(mandatoryTotal)} biaya wajib
                    </small>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {tours.length > 1 ? (
        <div
          className={styles.railControls}
          role="group"
          aria-label="Navigasi kartu perjalanan"
        >
          <button
            type="button"
            className={styles.railButton}
            onClick={() => scrollRail("backward")}
            disabled={!scrollState.canScrollBackward}
            aria-label="Lihat perjalanan sebelumnya"
            aria-controls="home-tour-rail"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <div className={styles.railProgress} aria-hidden="true">
            <span style={{ transform: `scaleX(${scrollState.progress})` }} />
          </div>
          <button
            type="button"
            className={styles.railButton}
            onClick={() => scrollRail("forward")}
            disabled={!scrollState.canScrollForward}
            aria-label="Lihat perjalanan berikutnya"
            aria-controls="home-tour-rail"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
