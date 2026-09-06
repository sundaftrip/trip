import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeEnglishTranslation,
  REVIEWED_ENGLISH_COPY,
  reviewedEnglishFor,
} from "../lib/reviewed-english-copy";

test("uses the approved travel and visa terminology", () => {
  assert.equal(reviewedEnglishFor("Kelayakan"), "Requirements");
  assert.equal(reviewedEnglishFor("Syarat Kelayakan"), "Application Requirements");
  assert.equal(reviewedEnglishFor("Pemimpin tur & pengemudi"), "Tour Leader & Driver");
  assert.equal(reviewedEnglishFor("Pemandu wisata"), "Local guide");
  assert.equal(reviewedEnglishFor("Pilih jumlah orang per kamar"), "Choose room occupancy");
  assert.equal(reviewedEnglishFor("Harga paket (3 orang/kamar)"), "Package price (3 guests/room)");
  assert.equal(reviewedEnglishFor("Total per orang"), "Total per guest");
  assert.equal(reviewedEnglishFor("DIREKOMENDASIKAN"), "RECOMMENDED");
  assert.equal(reviewedEnglishFor("Termasuk"), "Included");
  assert.equal(reviewedEnglishFor("Tidak termasuk"), "Not included");
  assert.equal(reviewedEnglishFor("Sertakan asuransi perjalanan"), "Include travel insurance");
});

test("keeps shared English copy free from the rejected house style", () => {
  const values = Object.values(REVIEWED_ENGLISH_COPY);
  const combined = values.join("\n");

  assert.ok(values.length >= 100);
  assert.doesNotMatch(combined, /[—–]/u);
  assert.doesNotMatch(
    combined,
    /\b(curated|crafted|seamless|unforgettable|immersive|world-class|unlock|elevate|embark)\b/i,
  );
  values.forEach((value) => assert.equal(value, value.trim()));
});

test("ships reviewed copy for the shared shell and homepage", () => {
  assert.equal(reviewedEnglishFor("Destinasi"), "Destinations");
  assert.equal(reviewedEnglishFor("JELAJAHI SUNDAF"), "SEARCH SUNDAF");
  assert.equal(
    reviewedEnglishFor("Pergi jauh. Pulang bawa cerita yang berbeda."),
    "Go far. Come home with a different story.",
  );
});

test("removes long dashes from cached and generated English copy", () => {
  assert.equal(normalizeEnglishTranslation("14–23 January 2027"), "14 to 23 January 2027");
  assert.equal(normalizeEnglishTranslation("Visa—subject to approval"), "Visa, subject to approval");
});

test("translates the actual split hero nodes without an external provider", () => {
  assert.equal(reviewedEnglishFor("Jelajahi Rusia, Asia Tengah &"), "Explore Russia, Central Asia &");
  assert.equal(reviewedEnglishFor("Aurora."), "the Northern Lights.");
});

test("handles standalone dates, exact amounts, and contact identifiers deterministically", () => {
  assert.equal(reviewedEnglishFor("10 November 2026"), "10 November 2026");
  assert.equal(reviewedEnglishFor("April 2027"), "April 2027");
  assert.equal(reviewedEnglishFor("14–23 Januari 2027"), "14–23 January 2027");
  for (const value of ["Rp\u00a033.500.000", "Rp 2.500.000", "info@sundaftrip.com", "WhatsApp 6281775202759", "Instagram @sundaf.trip", "· NIB 1601260060842"]) {
    assert.equal(reviewedEnglishFor(value), value);
  }
  assert.equal(reviewedEnglishFor("Rp 2.500.000 belum termasuk visa"), undefined);
  assert.equal(reviewedEnglishFor("Perjalanan khusus yang belum ditinjau"), undefined);
  assert.equal(reviewedEnglishFor("Peserta trip Rusia"), undefined);
  assert.equal(reviewedEnglishFor("Vietnam Privat"), "Private Vietnam trip");
});

test("localizes known visa labels without treating unknown descriptions as English", () => {
  assert.equal(reviewedEnglishFor("Mulai Rp 1.650.000"), "From Rp 1.650.000");
  assert.equal(reviewedEnglishFor("Terakhir diverifikasi 29 Jun 2026"), "Last verified 29 Jun 2026");
  assert.equal(reviewedEnglishFor("Bendera Korea Selatan"), "Flag of South Korea");
  assert.equal(reviewedEnglishFor("Lihat informasi visa Singapura"), "View visa information for Singapore");
  assert.equal(reviewedEnglishFor("Bendera negara yang belum ditinjau"), undefined);
  assert.equal(reviewedEnglishFor("Mulai Rp 1.650.000 dengan layanan tambahan"), undefined);
});
