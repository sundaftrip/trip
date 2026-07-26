"use client";

import { Fragment, type MouseEvent, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, MapPin } from "lucide-react";
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
  if (tour.seatsLeft > 0) return "Tersedia · konfirmasi tim";
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
  const track = useRef<HTMLDivElement>(null);
  const trackId = useId();
  const [scrollState, setScrollState] = useState({
    back: false,
    forward: tours.length > 1,
  });

  useEffect(() => {
    const element = track.current;
    if (!element) return;

    function update() {
      if (!element) return;
      const maximum = element.scrollWidth - element.clientWidth;
      const next = {
        back: element.scrollLeft > 3,
        forward: element.scrollLeft < maximum - 3,
      };
      setScrollState((current) =>
        current.back === next.back && current.forward === next.forward ? current : next,
      );
    }

    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(element);

    return () => {
      element.removeEventListener("scroll", update);
      observer?.disconnect();
    };
  }, [tours.length]);

  function move(direction: -1 | 1) {
    const element = track.current;
    if (!element) return;
    const first = element.children.item(0) as HTMLElement | null;
    const second = element.children.item(1) as HTMLElement | null;
    const distance =
      first && second ? second.offsetLeft - first.offsetLeft : element.clientWidth * 0.84;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollBy({
      left: distance * direction,
      behavior: reduceMotion ? "auto" : "smooth",
    });
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
    <div className={styles.railStage}>
      {tours.length > 1 ? (
        <div className={styles.railControls} role="group" aria-label="Navigasi perjalanan">
          <button
            type="button"
            aria-label="Perjalanan sebelumnya"
            aria-controls={trackId}
            disabled={!scrollState.back}
            onClick={() => move(-1)}
          >
            <ArrowLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Perjalanan berikutnya"
            aria-controls={trackId}
            disabled={!scrollState.forward}
            onClick={() => move(1)}
          >
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div
        ref={track}
        id={trackId}
        className={styles.tourRail}
        role="region"
        aria-roledescription="carousel"
        aria-label="Daftar kartu perjalanan Sundaf"
        tabIndex={0}
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
                aria-label={`Lihat ${tour.title}`}
                onClick={(event) => preserveCampaign(event, href)}
              >
                <Image
                  src={cldThumb(getTourProductImage(tour), 760, 510)}
                  alt={`Pemandangan destinasi untuk ${tour.title}`}
                  fill
                  sizes="(max-width: 699px) 82vw, (max-width: 1199px) 44vw, 360px"
                />
                <span className={styles.tourBadge}>{statusLabel(tour)}</span>
              </Link>

              <div className={styles.tourBody}>
                <p className={styles.tourMeta}>{tripMeta(tour)}</p>
                <h3>
                  <Link
                    href={href}
                    data-analytics-event="tour_card_click"
                    data-tour-id={tour.id}
                    onClick={(event) => preserveCampaign(event, href)}
                  >
                    {tour.title}
                  </Link>
                </h3>
                <p className={styles.routeLine}>
                  <MapPin aria-hidden="true" />
                  <span>{routeHighlight(tour.cityHighlight || tour.country)}</span>
                </p>
                <p className={styles.departureLine}>
                  <Calendar aria-hidden="true" />
                  <span>{departureLabel(tour)}</span>
                </p>
                <div className={styles.tourPrice}>
                  <span>{price > 0 ? (mandatoryTotal > 0 ? "Total mulai" : "Mulai dari") : "Harga"}</span>
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
    </div>
  );
}
