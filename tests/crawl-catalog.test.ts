import assert from "node:assert/strict";
import test from "node:test";
import { formatCrawlTour, formatCrawlVisaFees, isCrawlTourBookable } from "../lib/crawl-catalog";

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
  assert.match(line, /Subtotal paket \+ tambahan wajib mulai .*33\.500\.000/);
  assert.match(line, /tambahan wajib terhitung .*2\.500\.000/);
  assert.doesNotMatch(line, /34\.000\.000/);
  assert.match(line, /https:\/\/sundaftrip.com\/tours\/russia-tour/);
});

test("crawler distinguishes package exclusions and actual optional activities without exporting stale visa prices", () => {
  const input = {
    ...tour, price: 32_500_000, promoPrice: 27_000_000,
    exclusions: ["Visa Rusia", "Bagasi pesawat domestik Rusia", "Tipping", "Makan selain sarapan"],
    addOns: [
      { name: "Bagasi domestik Rusia", tag: "wajib", price: 2_500_000 },
      { name: "Visa Rusia", tag: "recommended", price: 1_400_000 },
      { name: "Sami Village", tag: "", price: 1_500_000, desc: "Tiket masuk dan naik kereta rusa. Pilihan tambahan di luar paket utama." },
    ],
  };
  const before = structuredClone(input);
  const line = formatCrawlTour(input, now);
  assert.match(line, /Subtotal paket \+ tambahan wajib mulai .*29\.500\.000/);
  assert.match(line, /Belum termasuk dalam harga paket: Visa Rusia; Bagasi pesawat domestik Rusia; Tipping; Makan selain sarapan/);
  assert.match(line, /Tambahan wajib yang ditampilkan sudah dihitung dalam subtotal/);
  assert.match(line, /Tambahan opsional di luar subtotal: Sami Village \(Rp\s*1\.500\.000\): Tiket masuk dan naik kereta rusa/);
  assert.doesNotMatch(line, /1\.400\.000|31\.000\.000|Total wajib/);
  assert.deepEqual(input, before);
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

test("crawler room-tier prices stay authoritative over a conflicting legacy promo", () => {
  const line = formatCrawlTour({
    ...tour, price: 40_900_000, promoPrice: 39_000_000,
    hotel: { __room_price_quad: "40900000" },
    addOns: [{ name: "Biaya wajib", tag: "wajib", price: 5_400_000 }],
  }, now);
  assert.match(line, /46\.300\.000/);
  assert.doesNotMatch(line, /44\.400\.000/);
});

test("crawler availability respects sold-out and waitlist badges", () => {
  assert.equal(isCrawlTourBookable({ ...tour, badge: "Daftar tunggu" }, now), false);
  assert.equal(isCrawlTourBookable({ ...tour, badge: "Penuh" }, now), false);
  assert.equal(isCrawlTourBookable({ ...tour, badge: "Pasti berangkat" }, now), true);
  assert.match(formatCrawlTour({ ...tour, badge: "Daftar tunggu" }, now), /daftar tunggu/);
});
