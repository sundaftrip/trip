import assert from "node:assert/strict";
import test from "node:test";
import {
  buildWhatsAppBookingHref,
  buildWhatsAppBookingMessage,
  extractCampaignFromUrl,
  getCommerceTourStatus,
  getCompatibleDeparture,
  getDestinationSlug,
  mandatoryAddOnsTotal,
  mandatoryFeesTotal,
  parseDurationDays,
} from "../lib/tour-commerce";

const NOW = new Date("2026-07-26T00:00:00.000Z");

test("maps legacy tour data to customer-facing availability states", () => {
  assert.equal(getCommerceTourStatus({ status: "ACTIVE", tripDate: "2026-09-04", seatsLeft: 15 }, NOW), "available");
  assert.equal(getCommerceTourStatus({ status: "ACTIVE", tripDate: "2026-09-04", seatsLeft: 3 }, NOW), "last_seats");
  assert.equal(getCommerceTourStatus({ status: "ACTIVE", tripDate: "2026-09-04", badge: "Terkonfirmasi" }, NOW), "confirmed");
  assert.equal(getCommerceTourStatus({ status: "FULL", tripDate: "2026-12-12" }, NOW), "sold_out");
  assert.equal(getCommerceTourStatus({ status: "ACTIVE", tripDate: "2026-02-02" }, NOW), "completed");
  assert.equal(
    getCommerceTourStatus(
      { status: "ACTIVE", tripDate: "2026-07-20", duration: "11 hari 9 malam" },
      NOW,
    ),
    "available",
  );
  assert.equal(getCommerceTourStatus({ status: "ACTIVE", tripDate: null }, NOW), "flexible");
});

test("creates a non-destructive single-departure adapter for current tour records", () => {
  assert.deepEqual(
    getCompatibleDeparture({
      id: "tour-1",
      tripDate: "2026-09-04T00:00:00.000Z",
      status: "ACTIVE",
      price: 33_400_000,
      seatsLeft: 15,
    }, NOW),
    {
      id: "tour-1-2026-09-04",
      startDate: "2026-09-04T00:00:00.000Z",
      price: 33_400_000,
      status: "available",
      seatsRemaining: 15,
    },
  );
});

test("extracts duration, destination, and mandatory totals safely", () => {
  assert.equal(parseDurationDays("11 hari 9 malam"), 11);
  assert.equal(parseDurationDays("9H7M"), 9);
  assert.equal(getDestinationSlug({ title: "Asia Tengah 4-TAN" }), "asia-tengah");
  assert.equal(getDestinationSlug({ title: "Rusia Aurora" }), "rusia-aurora");
  assert.equal(mandatoryFeesTotal([{ price: 1_700_000 }, { price: 500_000 }, { price: -10 }]), 2_200_000);
  assert.equal(
    mandatoryAddOnsTotal([
      { name: "Bagasi", tag: "wajib", price: 2_500_000 },
      { name: "Visa", tag: "recommended", price: 1_000_000 },
      null,
    ]),
    2_500_000,
  );
});

test("builds a fully contextual and URL-encoded WhatsApp handoff", () => {
  const sourceUrl = "https://sundaftrip.com/tours/central-asia-4-tan?utm_source=instagram&utm_campaign=aurora";
  const message = buildWhatsAppBookingMessage({
    tourName: "Asia Tengah 4-TAN",
    departureDate: "4 September 2026",
    formattedPrice: "Rp33.400.000",
    travelerCount: 2,
    childCount: 1,
    roomPreference: "Twin sharing",
    customerName: "Ayu",
    customerPhone: "0812 3456 7890",
    sourceUrl,
  });

  assert.match(message, /Tour: Asia Tengah 4-TAN/);
  assert.match(message, /Peserta: 2 dewasa, 1 anak/);
  assert.match(message, /Kamar: Twin sharing/);
  assert.match(message, /WhatsApp: 0812 3456 7890/);
  assert.match(message, /Source: https:\/\/sundaftrip\.com/);
  assert.match(message, /Campaign: utm_source=instagram&utm_campaign=aurora/);

  const href = buildWhatsAppBookingHref("+62 817-7520-2759", {
    tourName: "Asia Tengah 4-TAN",
    sourceUrl,
  });
  const url = new URL(href);
  assert.equal(url.hostname, "wa.me");
  assert.equal(url.pathname, "/6281775202759");
  assert.match(url.searchParams.get("text") || "", /Asia Tengah 4-TAN/);
});

test("extracts only UTM parameters from a source URL", () => {
  assert.equal(
    extractCampaignFromUrl("https://sundaftrip.com/tours/x?room=twin&utm_medium=social&utm_source=ig"),
    "utm_medium=social&utm_source=ig",
  );
  assert.equal(extractCampaignFromUrl("not a url"), "");
});
