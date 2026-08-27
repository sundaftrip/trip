"use client";

import { Fragment, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, MapPin } from "lucide-react";
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
  const router = useRouter();

  function preserveCampaign(
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    const attributedHref = appendCampaignToPath(href, window.location.search);
    if (attributedHref === href) return;
    event.preventDefault();
    router.push(attributedHref, { scroll: false });
  }

  return (
    <div className={styles.railStage}>
      <div
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
                scroll={false}
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
    </div>
  );
}
