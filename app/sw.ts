/* Service worker source untuk PWA Sundaf Trip — dibangun pakai @serwist/next.
   Strategi cache: precache assets statis Next.js + runtime cache untuk
   navigasi (cache-first dengan revalidate). Offline fallback ke /~offline.
   File ini di-bundle ke /public/sw.js saat build. */

/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";
import type { RuntimeCaching } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const adminNetworkOnly: RuntimeCaching = {
  matcher: ({ sameOrigin, url: { pathname } }) => sameOrigin && pathname.startsWith("/admin"),
  handler: new NetworkOnly(),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [adminNetworkOnly, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher: ({ request }) => {
          const { pathname } = new URL(request.url);
          return request.destination === "document" && !pathname.startsWith("/admin");
        },
      },
    ],
  },
});

serwist.addEventListeners();
