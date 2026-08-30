import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";

const require = createRequire(import.meta.url);
require.extensions[".css"] = (module) => { module.exports = {}; };
const { TourRoomSelectionProvider } = require("../components/website/clean/TourRoomSelectionContext");
const { default: TourVisaServiceToggle } = require("../components/website/clean/TourVisaServiceToggle");

const country = {
  id: "peru", name: "Peru", status: "unknown", explanation: "Ketentuan perlu dikonfirmasi.",
  conditions: ["Paspor dan lama tinggal perlu diperiksa."], sourceUrl: null, checkedAt: null,
  serviceState: "consultation", href: "/visa/peru", stayDays: 4, kind: "visit",
};

function renderToggle(countries: unknown[], visaOffers: unknown[] = []) {
  return renderToStaticMarkup(createElement(TourRoomSelectionProvider, {
    roomPrices: [], visaOffers,
    visaAssessment: { countries, summary: [], issues: [], warnings: [], legacy: false },
  }, createElement(TourVisaServiceToggle, { compact: true })));
}

test("compact first-view controls explain passport scope and unresolved visa requirements without inventing a purchase", () => {
  const html = renderToggle([country]);
  assert.match(html, /Paspor biasa Indonesia/);
  assert.match(html, /Peru/);
  assert.match(html, /Ketentuan perlu dikonfirmasi/);
  assert.match(html, /Konsultasikan kebutuhan visa/);
  assert.doesNotMatch(html, /Perjalanan ini membutuhkan visa\./);
  assert.doesNotMatch(html, /type="checkbox"/);
});

test("visa-free routes remain visible as information, not silent absence or a paid offer", () => {
  const html = renderToggle([{ ...country, status: "visa_free", serviceState: "not_needed", explanation: "Bebas visa untuk kunjungan sesuai ketentuan." }]);
  assert.match(html, /Bebas visa/);
  assert.doesNotMatch(html, /type="checkbox"/);
});

test("available assistance is accessible, defaults off and explains that already held visas need destination and entry checks", () => {
  const html = renderToggle([{ ...country, status: "required", serviceState: "offered" }], [
    { id: "peru", name: "Visa Peru", price: 2_000_000, href: "/visa/peru", processingTime: null },
  ]);
  assert.match(html, /type="checkbox"/);
  assert.match(html, /aria-label="Tambahkan bantuan Visa Peru"/);
  assert.doesNotMatch(html, /checked=""/);
  assert.match(html, /negara tujuan/);
  assert.match(html, /jumlah masuk/);
  assert.match(html, /terpisah dari harga paket per orang/);
});

test("the whole pricing flow keeps group visa charges separate from per-person package totals", () => {
  const read = (name: string) => readFileSync(new URL(`../components/website/clean/${name}.tsx`, import.meta.url), "utf8");
  assert.match(read("TourRoomSelectionContext"), /optionalServicesTotal = selectableAddOnTotal;/);
  assert.match(read("CleanTourDetail"), /key=\{tour\.id\}/);
  assert.match(read("TourBookingExperience"), /useTourRoomSelection/);
  assert.match(read("TourBookingExperience"), /visaOfferTotal/);
  assert.match(read("TourBookingSheet"), /TourVisaGroupPrice/);
  assert.match(read("TourRoomBookingPanel"), /TourVisaGroupPrice/);
  assert.match(read("TourRoomBookingSidebar"), /TourVisaGroupPrice/);
});
