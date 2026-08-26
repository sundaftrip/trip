"use client";

import { useEffect } from "react";
import {
  trackSundafEvent,
  type SundafAnalyticsEvent,
} from "@/lib/analytics-events";
import { oneF916AttributionFromLocation } from "@/lib/campaign-attribution";

/**
 * Analytics ringan, opt-in via environment variables:
 *   NEXT_PUBLIC_GA_ID        → GA4 (mis. "G-XXXXXXXXXX")
 *   NEXT_PUBLIC_FB_PIXEL_ID  → Meta/Facebook Pixel (mis. "1234567890")
 *
 * GA/Meta vendor scripts sengaja tidak dimuat di jalur render awal. Event tetap
 * masuk ke queue lebih dulu, lalu vendor script dimuat saat interaksi pertama.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[][];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
    };
    _fbq?: Window["fbq"];
    dataLayer?: unknown[];
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-G7P7VLBDYV";
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
type Fbq = NonNullable<Window["fbq"]>;

function appendScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export default function Analytics() {
  useEffect(() => {
    if (!GA_ID && !FB_PIXEL_ID) return;

    let cancelled = false;

    const loadVendors = () => {
      if (cancelled) return;
      if (GA_ID) appendScript("ga4-src", `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
      if (FB_PIXEL_ID) appendScript("fb-pixel-src", "https://connect.facebook.net/en_US/fbevents.js");
    };

    if (GA_ID) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || ((...args: unknown[]) => {
        window.dataLayer?.push(args);
      });
      window.gtag("js", new Date());
      window.gtag("config", GA_ID, { send_page_view: true });
    }

    const oneF916 = oneF916AttributionFromLocation(window.location.search, document.referrer);
    if (oneF916.matched) {
      trackSundafEvent("onef916_visit", {
        detection_method: oneF916.detectionMethod,
        campaign_source: oneF916.source,
        campaign_medium: oneF916.medium,
        campaign_name: oneF916.campaign,
        campaign_content: oneF916.content,
        page_path: window.location.pathname,
      });
    }

    if (FB_PIXEL_ID && !window.fbq) {
      const fbq = ((...args: unknown[]) => {
        fbq.queue = fbq.queue || [];
        fbq.queue.push(args);
      }) as Fbq;
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      window.fbq = fbq;
      window._fbq = fbq;
      window.fbq("init", FB_PIXEL_ID);
      window.fbq("track", "PageView");
    }

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const eventTarget = target?.closest?.<HTMLElement>("[data-analytics-event]");
      const link = target?.closest?.<HTMLAnchorElement>(
        'a[href*="wa.me"], a[href*="api.whatsapp.com"]',
      );
      const validatedLink = link?.dataset.analyticsValidated === "true";

      if (eventTarget?.dataset.analyticsEvent) {
        trackSundafEvent(
          eventTarget.dataset.analyticsEvent as SundafAnalyticsEvent,
          {
            tour_id: eventTarget.dataset.tourId,
            departure_id: eventTarget.dataset.departureId,
            destination: eventTarget.dataset.destination,
            placement: eventTarget.dataset.analyticsPlacement,
            campaign_source: eventTarget.dataset.campaignSource,
            campaign_content: eventTarget.dataset.campaignContent,
            format: eventTarget.dataset.analyticsFormat,
            record_id: eventTarget.dataset.analyticsRecordId,
          },
        );
      } else if (link && !validatedLink) {
        trackSundafEvent("whatsapp_consultation_click", {
          placement: link.dataset.analyticsPlacement || "site",
        });
      }

      if (eventTarget || (link && !validatedLink)) loadVendors();
    };

    let oneF916Interacted = false;
    const onOneF916Engagement = () => {
      if (!oneF916.matched || oneF916Interacted || document.visibilityState !== "visible") return;
      oneF916Interacted = true;
      trackSundafEvent("onef916_interaction", {
        detection_method: oneF916.detectionMethod,
        campaign_source: oneF916.source,
        campaign_medium: oneF916.medium,
        campaign_name: oneF916.campaign,
        campaign_content: oneF916.content,
        page_path: window.location.pathname,
      });
      loadVendors();
      window.removeEventListener("scroll", onOneF916Engagement);
      window.removeEventListener("pointerdown", onOneF916Engagement);
      window.removeEventListener("keydown", onOneF916Engagement);
    };

    const onFirstInteraction = () => loadVendors();
    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("pointerdown", onFirstInteraction, { once: true, passive: true });
    window.addEventListener("touchstart", onFirstInteraction, { once: true, passive: true });
    window.addEventListener("keydown", onFirstInteraction, { once: true });
    if (oneF916.matched) {
      window.addEventListener("scroll", onOneF916Engagement, { passive: true });
      window.addEventListener("pointerdown", onOneF916Engagement, { passive: true });
      window.addEventListener("keydown", onOneF916Engagement);
    }

    return () => {
      cancelled = true;
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("scroll", onOneF916Engagement);
      window.removeEventListener("pointerdown", onOneF916Engagement);
      window.removeEventListener("keydown", onOneF916Engagement);
    };
  }, []);

  return null;
}
