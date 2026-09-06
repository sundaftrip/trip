import assert from "node:assert/strict";
import test from "node:test";
import { formatCrawlTour, formatCrawlVisaFees } from "../lib/crawl-catalog";

const tour = {
  id: "tour-1", slug: "russia-tour", title: "Rusia Aurora", country: "Rusia",
  duration: "10 hari", tripDate: new Date("2027-01-14T00:00:00Z"),
  price: 31_000_000, promoPrice: null, status: "ACTIVE",
  addOns: [{ name: "Biaya wajib", tag: "wajib", price: 2_500_000 }, { name: "Asuransi", tag: "recommended", price: 500_000 }],
};
const now = new Date("2026-09-07T00:00:00Z");

test("crawler prices include required fees and exclude optional services", () => {
  const line = formatCrawlTour(tour, now);
  assert.match(line, /33\.500\.000/);
  assert.match(line, /termasuk .*2\.500\.000 biaya wajib/);
  assert.doesNotMatch(line, /34\.000\.000/);
  assert.match(line, /https:\/\/sundaftrip.com\/tours\/russia-tour/);
});

test("promotional prices retain mandatory fees", () => {
  assert.match(formatCrawlTour({ ...tour, promoPrice: 30_000_000 }, now), /32\.500\.000/);
});

test("flexible and departed tours are not described as upcoming open trips", () => {
  assert.match(formatCrawlTour({ ...tour, tripDate: null }, now), /land tour privat, tanggal sesuai permintaan/);
  assert.match(formatCrawlTour({ ...tour, tripDate: new Date("2026-09-04") }, now), /sudah berangkat, tidak tersedia untuk pemesanan/);
  assert.match(formatCrawlTour({ ...tour, tripDate: new Date("2025-01-01") }, now), /trip selesai, arsip/);
});

test("official visa fees and Sundaf service prices retain distinct labels", () => {
  assert.equal(formatCrawlVisaFees({ servicePrice: "Rp 1.600.000", officialFee: "USD 52" }), "layanan Sundaf: Rp 1.600.000; biaya resmi: USD 52");
  assert.equal(formatCrawlVisaFees({ cost: "USD 25" }), "biaya tercatat: USD 25");
  assert.equal(formatCrawlVisaFees({}), "");
});
