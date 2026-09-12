import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRussiaTourSummarySection,
  formatRussiaTourSummary,
  isRussiaGuideTour,
  isRussiaTour,
  selectRussiaGuideTours,
  type RussiaSummaryTour,
} from "../lib/russia-tour-summary";

const NOW = new Date("2026-09-12T06:00:00Z");
const tour: RussiaSummaryTour = {
  id: "january-russia", slug: "rusia-aurora-januari", title: "Rusia Aurora",
  country: "Russia", cityHighlight: "Moskow, St. Petersburg, Murmansk",
  status: "ACTIVE", tripDate: new Date("2027-01-14T00:00:00Z"), duration: "10 Hari 7 Malam",
  seatsLeft: 16, badge: null, price: 30_000_000, promoPrice: 27_000_000,
  addOns: [{ name: "Bagasi domestik", price: 2_500_000, tag: "wajib" }, { name: "Aktivitas", price: 1_500_000, tag: "opsional" }],
  hotel: null,
};

test("Russia summaries require geographical evidence and respect an explicit country", () => {
  for (const country of ["Rusia", "Russia", "Russian Federation", "Rusia & Aurora"]) {
    assert.equal(isRussiaTour({ ...tour, country }), true, country);
  }
  for (const [country, title] of [
    ["Canada", "Aurora Kanada"], ["Finland", "Aurora Finlandia"],
    ["Kazakhstan", "Asia Tengah"], ["Canada", "Russia Aurora"],
    ["United States", "St. Petersburg"],
  ]) assert.equal(isRussiaTour({ ...tour, country, title }), false, `${country}: ${title}`);
  assert.equal(isRussiaTour({ country: "", title: "Murmansk dan Teriberka" }), true);
  assert.equal(isRussiaTour({ title: "Moscow and Saint Petersburg" }), true);
  assert.equal(isRussiaTour({ title: "Aurora", cityHighlight: "" }), false);
});

test("only active future departures can appear, regardless of legacy public URLs", () => {
  assert.equal(isRussiaGuideTour(tour, NOW), true);
  for (const status of ["DRAFT", "FULL", "CANCELLED"]) {
    assert.equal(isRussiaGuideTour({ ...tour, status }, NOW), false);
    assert.equal(selectRussiaGuideTours([{ ...tour, slug: "russia-aurora", status }], NOW).length, 0);
  }
  for (const badge of ["Penuh", "Sold out", "Daftar tunggu", "waitlist"]) {
    assert.equal(isRussiaGuideTour({ ...tour, badge }, NOW), false, badge);
  }
  for (const tripDate of [null, "invalid", NOW.toISOString(), "2026-09-11T00:00:00Z", "2020-01-01T00:00:00Z"]) {
    assert.equal(isRussiaGuideTour({ ...tour, tripDate }, NOW), false, String(tripDate));
  }
  assert.equal(isRussiaGuideTour({ ...tour, tripDate: new Date(NOW.getTime() + 1) }, NOW), true);
});

test("selection takes the nearest three after filtering, with stable ties and no mutation", () => {
  const rows = [
    { ...tour, id: "later", tripDate: "2027-03-01" },
    { ...tour, id: "b" }, { ...tour, id: "a" },
    { ...tour, id: "foreign-earliest", country: "Canada", tripDate: "2026-10-01" },
    { ...tour, id: "first", tripDate: "2026-12-01" },
    { ...tour, id: "full-earliest", status: "FULL", tripDate: "2026-10-01" },
  ];
  const before = structuredClone(rows);
  assert.deepEqual(selectRussiaGuideTours(rows, NOW).map((row) => row.id), ["first", "a", "b"]);
  assert.deepEqual(selectRussiaGuideTours([...rows].reverse(), NOW).map((row) => row.id), ["first", "a", "b"]);
  assert.deepEqual(rows, before);
});

test("summary uses promo plus mandatory fees once, excluding optional costs", () => {
  const summary = formatRussiaTourSummary(tour, NOW).replaceAll("\u00a0", " ");
  assert.match(summary, /Total wajib mulai Rp 29\.500\.000\/orang/);
  assert.match(summary, /termasuk Rp 2\.500\.000 biaya wajib/);
  assert.doesNotMatch(summary, /31\.000\.000|32\.000\.000/);
  assert.match(summary, /14 Januari 2027/);
  assert.match(summary, /10 Hari 7 Malam/);
  assert.match(summary, /Moskow, St\. Petersburg, Murmansk/);
  assert.match(summary, /Tersedia/);
  assert.ok(summary.endsWith("/tours/rusia-aurora-januari"));
});

test("room-tier authority follows the catalog, even when promo or another tier is cheaper", () => {
  const summary = formatRussiaTourSummary({
    ...tour, promoPrice: 10_000_000,
    hotel: { __room_price_quad: 40_000_000, __room_price_twin: 35_000_000 },
  }, NOW).replaceAll("\u00a0", " ");
  assert.match(summary, /Total wajib mulai Rp 42\.500\.000\/orang/);
  assert.doesNotMatch(summary, /12\.500\.000|37\.500\.000|45\.000\.000/);
});

test("summary preserves uncertainty, canonical fallback, and Jakarta date formatting", () => {
  const summary = formatRussiaTourSummary({
    ...tour, slug: "   ", seatsLeft: 0, price: 0, promoPrice: null,
    tripDate: "2027-01-13T18:00:00Z",
  }, NOW);
  assert.match(summary, /Konfirmasi harga/);
  assert.doesNotMatch(summary, /Rp|Tersedia/);
  assert.match(summary, /Cek ketersediaan/);
  assert.match(summary, /14 Januari 2027/);
  assert.ok(summary.endsWith("/tours/january-russia"));
  assert.match(formatRussiaTourSummary({ ...tour, badge: "confirmed" }, NOW), /Pasti berangkat/);
  assert.match(formatRussiaTourSummary({ ...tour, seatsLeft: 2 }, NOW), /Kursi terakhir/);
});

test("empty inventory and a failed read give distinct messages with useful links", () => {
  const empty = buildRussiaTourSummarySection([], NOW);
  const failed = buildRussiaTourSummarySection(null, NOW);
  assert.deepEqual(empty.items, []);
  assert.deepEqual(failed.items, []);
  assert.match(empty.body, /Belum ada jadwal mendatang/);
  assert.match(failed.body, /Jadwal belum dapat ditampilkan/);
  for (const section of [empty, failed]) {
    assert.match(section.body, /\/tours\?destination=rusia/);
    assert.match(section.body, /\/custom-trip/);
  }
  const populated = buildRussiaTourSummarySection([tour], NOW);
  assert.equal(populated.items.length, 1);
  assert.equal(populated.title, "Jadwal tour Rusia");
  assert.match(populated.items[0], /\/tours\/rusia-aurora-januari/);
});
