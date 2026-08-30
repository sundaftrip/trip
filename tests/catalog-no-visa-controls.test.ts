import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { Children, createElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";

const require = createRequire(import.meta.url);
require.extensions[".css"] = (module) => { module.exports = {}; };
const { default: CleanTourDetail } = require("../components/website/clean/CleanTourDetail");
const { TourRoomSelectionProvider, useTourRoomSelection } = require("../components/website/clean/TourRoomSelectionContext");
const { default: TourVisaServiceToggle, TourVisaGroupPrice } = require("../components/website/clean/TourVisaServiceToggle");
const { default: TourRecommendedAddOnToggle } = require("../components/website/clean/TourRecommendedAddOnToggle");
const { default: TourRoomRecoveryLink } = require("../components/website/clean/TourRoomRecoveryLink");

function nodes(node: ReactNode): ReactElement<Record<string, unknown>>[] {
  return Children.toArray(node).flatMap((child) => {
    if (!isValidElement<Record<string, unknown>>(child)) return [];
    return [child, ...nodes(child.props.children as ReactNode)];
  });
}
function text(node: ReactNode): string {
  return Children.toArray(node).map((child) => typeof child === "string" || typeof child === "number"
    ? String(child) : isValidElement<{ children?: ReactNode }>(child) ? text(child.props.children) : "").join(" ");
}
const insurance = { name: "Asuransi perjalanan usia sampai 69 tahun", price: 1_000_000, tag: "recommended" };
const manualVisa = { name: "Visa Kanada", price: 2_000_000, visaHref: "/visa/canada" };

function catalog(withInsurance = false) {
  return CleanTourDetail({
    tour: { id: "qa", slug: "qa", title: "Katalog uji", country: "Kanada", cityHighlight: null, duration: "5 hari", description: "Program uji", visaInfo: "Visa belum termasuk paket.", notes: null, heroImg: null, badge: null, gallery: [], inclusions: [], exclusions: [], hotel: null, price: 10_000_000, promoPrice: null, priceLandTour: null, seatsLeft: 10, status: "ACTIVE", tripDate: new Date("2027-04-15T00:00:00Z") },
    itinerary: [], mandatoryAddOns: [], roomPrices: [], optionalAddOns: [manualVisa, ...(withInsurance ? [insurance] : [])],
    // Stale callers/data must not be able to re-enable the removed feature.
    visaOffers: [{ id: "visa-ca", name: manualVisa.name, price: manualVisa.price, href: manualVisa.visaHref, processingTime: null }],
    visaAssessment: { countries: [], issues: [], warnings: [], summary: ["Automatic assessment"], legacy: false },
    paymentPlan: null, relatedTours: [], reviews: [], ratingValue: 0, bookingPhone: "628111620207", bookingWaHref: "https://wa.me/628111620207", bookingSummary: "Katalog uji", basePrice: 10_000_000, startingTotal: 10_000_000, departureLabel: "15 April 2027", capacityLabel: "10 peserta", isExpired: false, isFlexibleDate: false,
  });
}
function provider(tree: ReactNode) {
  const result = nodes(tree).find((node) => node.type === TourRoomSelectionProvider);
  assert.ok(result, "Catalog booking provider is present");
  return result;
}

test("all catalog booking surfaces receive no automatic visa data, controls or subtotal", () => {
  function Probe() {
    const state = useTourRoomSelection();
    assert.equal(state.hasVisaInformation, false);
    assert.equal(state.hasOptionalServices, false);
    assert.equal(state.visaOfferTotal, 0);
    assert.equal(state.visaOfferPreference, "");
    assert.equal(state.optionalServicesPreference, "");
    return null;
  }
  const boundary = provider(catalog());
  const html = renderToStaticMarkup(createElement(TourRoomSelectionProvider, boundary.props,
    createElement(Probe), createElement(TourVisaServiceToggle), createElement(TourVisaGroupPrice)));
  assert.equal(html, "");
});

test("manual visa information and optional fees remain visible rather than being silently filtered", () => {
  const content = text(catalog());
  assert.match(content, /Visa belum termasuk paket/);
  assert.match(content, /Visa Kanada/);
  assert.match(content, /2\.000\.000/);
});

test("insurance remains selectable with its existing price and no visa wording in booking preferences", () => {
  const boundary = provider(catalog(true));
  const html = renderToStaticMarkup(createElement(TourRoomSelectionProvider, boundary.props,
    createElement(TourRecommendedAddOnToggle), createElement(TourVisaServiceToggle),
    createElement(TourRoomRecoveryLink, { fallbackHref: "https://wa.me/628111620207", phone: "628111620207", startingTotal: 10_000_000, hasPrice: true, tourName: "Katalog uji", departureLabel: "15 April 2027", bookingMode: "available", analyticsPlacement: "qa" })));
  assert.match(html, /type="checkbox"/);
  assert.match(html, /1\.000\.000/);
  const decoded = decodeURIComponent(html);
  assert.doesNotMatch(decoded, /Tambahkan bantuan Visa|Hapus bantuan Visa|Jumlah pemohon|Bantuan visa|Visa grup|di luar bantuan visa/i);
  assert.match(decoded, /Asuransi perjalanan usia sampai 69 tahun tidak disertakan/);
});

test("website uses existing catalog notes instead of injecting the automatic assessment", () => {
  const source = readFileSync(new URL("../app/(website)/tours/[id]/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /assessCatalogVisas|buildTourVisaCatalogNotes|visaOffers=|visaAssessment=/);
  assert.match(source, /displayVisaInfo = localizePdfText\(tour\.visaInfo\)/);
});
