"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * Analytics ringan, opt-in via environment variables:
 *   NEXT_PUBLIC_GA_ID        → GA4 (mis. "G-XXXXXXXXXX")
 *   NEXT_PUBLIC_FB_PIXEL_ID  → Meta/Facebook Pixel (mis. "1234567890")
 *
 * Tanpa ID, komponen ini TIDAK merender apa pun (no-op) — aman di-deploy
 * walau ID belum dipasang. Cukup tambahkan env var di Vercel lalu redeploy.
 *
 * Bonus: melacak SEMUA klik tautan WhatsApp (a[href*="wa.me"]) sebagai
 * konversi — event "whatsapp_click" (GA4) + "Contact" (Meta Pixel).
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export default function Analytics() {
  // Lacak klik WhatsApp sebagai konversi (delegated listener, 1x pasang).
  useEffect(() => {
    if (!GA_ID && !FB_PIXEL_ID) return;
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
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!GA_ID && !FB_PIXEL_ID) return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { send_page_view: true });
            `}
          </Script>
        </>
      )}

      {FB_PIXEL_ID && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
