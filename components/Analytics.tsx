"use client";

import { useEffect } from "react";

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
      const link = target?.closest?.('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
      if (!link) return;
      try {
        window.gtag?.("event", "whatsapp_click", {
          event_category: "engagement",
          event_label: (link as HTMLAnchorElement).href,
        });
        window.fbq?.("track", "Contact");
      } catch {
        /* no-op */
      }
      loadVendors();
    };

    const onFirstInteraction = () => loadVendors();
    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("pointerdown", onFirstInteraction, { once: true, passive: true });
    window.addEventListener("touchstart", onFirstInteraction, { once: true, passive: true });
    window.addEventListener("keydown", onFirstInteraction, { once: true });

    return () => {
      cancelled = true;
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, []);

  return null;
}
