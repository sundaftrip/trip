"use client";

import { useState } from "react";
import { Check, Download, Share2 } from "lucide-react";
import styles from "./CleanSite.module.css";

type TourDetailQuickActionsProps = {
  tourTitle: string;
  tourId: string;
  pdfHref: string;
};

export default function TourDetailQuickActions({
  tourTitle,
  tourId,
  pdfHref,
}: TourDetailQuickActionsProps) {
  const [copied, setCopied] = useState(false);

  async function shareTour() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: tourTitle, url });
        return;
      } catch {
        // A cancelled native share is intentionally a no-op.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard access can be unavailable in some embedded browsers.
    }
  }

  return (
    <aside className={styles.detailQuickActions} aria-label="Aksi perjalanan">
      <button
        type="button"
        onClick={shareTour}
        data-analytics-event="tour_share"
        data-tour-id={tourId}
        title={copied ? "Tautan tersalin" : "Bagikan perjalanan"}
        aria-label={copied ? "Tautan perjalanan tersalin" : "Bagikan perjalanan"}
      >
        {copied ? <Check aria-hidden="true" /> : <Share2 aria-hidden="true" />}
        <span>{copied ? "Tersalin" : "Bagikan"}</span>
      </button>
      <a
        href={pdfHref}
        data-analytics-event="itinerary_pdf_download"
        data-tour-id={tourId}
        title="Buka itinerary PDF"
        aria-label="Buka itinerary PDF"
      >
        <Download aria-hidden="true" />
        <span>Buka PDF</span>
      </a>
    </aside>
  );
}
