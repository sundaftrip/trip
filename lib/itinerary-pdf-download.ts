// Bump when the published PDF format changes. A new URL cannot reuse a PDF
// stored by an older service worker under the previous, unversioned address.
export const ITINERARY_PDF_VERSION = "clean-visa-2026-08-31";

export function itineraryPdfHref(tourId: string) {
  return `/tours/${encodeURIComponent(tourId)}/pdf?v=${ITINERARY_PDF_VERSION}`;
}

export function isItineraryPdfPathname(pathname: string) {
  return /^\/tours\/[^/]+\/pdf\/?$/.test(pathname);
}

export const ITINERARY_PDF_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "X-Sundaf-PDF-Version": ITINERARY_PDF_VERSION,
} as const;
