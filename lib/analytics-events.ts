"use client";

export type SundafAnalyticsEvent =
  | "home_search_submit"
  | "tour_filter_open"
  | "tour_filter_apply"
  | "tour_card_click"
  | "tour_view"
  | "tour_tab_click"
  | "departure_select"
  | "booking_sheet_open"
  | "whatsapp_booking_click"
  | "whatsapp_consultation_click"
  | "itinerary_pdf_download"
  | "custom_trip_start"
  | "custom_trip_submit"
  | "visa_country_search";

type SafeAnalyticsValue = string | number | boolean | null | undefined;

export function trackSundafEvent(
  name: SundafAnalyticsEvent,
  parameters: Record<string, SafeAnalyticsValue> = {},
) {
  if (typeof window === "undefined") return;

  const safeParameters = Object.fromEntries(
    Object.entries(parameters).filter(([, value]) => value !== undefined && value !== ""),
  );

  try {
    window.gtag?.("event", name, safeParameters);
    if (name === "whatsapp_booking_click" || name === "whatsapp_consultation_click") {
      window.fbq?.("track", "Contact");
    }
  } catch {
    // Analytics must never block navigation or booking.
  }
}
