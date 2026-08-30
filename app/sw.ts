/* Service worker source untuk PWA Sundaf Trip — dibangun pakai @serwist/next.
   Strategi cache: precache hanya halaman offline, lalu gunakan runtime cache
   Serwist untuk aset publik. Rute privat selalu network-only dan dibersihkan
   dari cache lama ketika service worker baru aktif. */

/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";
import type { RuntimeCaching } from "serwist";
import { isItineraryPdfPathname } from "../lib/itinerary-pdf-download";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const SENSITIVE_PATH_PREFIXES = [
  "/admin",
  "/api",
  "/b2b-russia-catalog",
  "/lapor",
] as const;

const PAGE_CACHE_NAMES = new Set([
  "pages",
  "pages-rsc",
  "pages-rsc-prefetch",
]);

function isSensitivePathname(pathname: string) {
  return SENSITIVE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isPageDataRequest(request: Request) {
  return request.mode === "navigate"
    || request.destination === "document"
    || request.headers.get("RSC") === "1"
    || request.headers.get("Next-Router-Prefetch") === "1";
}

const sensitiveNetworkOnly: RuntimeCaching = {
  matcher: ({ sameOrigin, url: { pathname } }) =>
    sameOrigin && isSensitivePathname(pathname),
  handler: new NetworkOnly(),
};

const livePageNetworkOnly: RuntimeCaching = {
  matcher: ({ sameOrigin, request }) =>
    sameOrigin && isPageDataRequest(request),
  handler: new NetworkOnly(),
};

// Downloads can have an empty destination instead of document/navigation.
// Never let them fall through to Serwist's "others" cache, including offline.
const itineraryPdfNetworkOnly: RuntimeCaching = {
  matcher: ({ sameOrigin, url: { pathname } }) =>
    sameOrigin && isItineraryPdfPathname(pathname),
  handler: new NetworkOnly({ fetchOptions: { cache: "no-store" } }),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    cleanupOutdatedCaches: true,
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [sensitiveNetworkOnly, itineraryPdfNetworkOnly, livePageNetworkOnly, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher: ({ request }) => {
          const { pathname } = new URL(request.url);
          return request.destination === "document" && !isSensitivePathname(pathname)
            && !isItineraryPdfPathname(pathname);
        },
      },
    ],
  },
});

// Previous workers could cache authenticated responses and public RSC/HTML
// carrying seat or price claims. Purge those caches on activation; the current
// worker always fetches page data from the network and uses only /~offline as
// the document fallback.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await self.caches.keys();
      await Promise.all(
        cacheKeys.map(async (cacheKey) => {
          if (PAGE_CACHE_NAMES.has(cacheKey)) {
            await self.caches.delete(cacheKey);
            return;
          }
          const cache = await self.caches.open(cacheKey);
          const requests = await cache.keys();
          await Promise.all(
            requests.map((request) => {
              const url = new URL(request.url);
              if (url.origin === self.location.origin
                && (isSensitivePathname(url.pathname) || isItineraryPdfPathname(url.pathname))) {
                return cache.delete(request);
              }
              return Promise.resolve(false);
            }),
          );
        }),
      );
    })(),
  );
});

serwist.addEventListeners();
