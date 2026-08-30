import assert from "node:assert/strict";
import test from "node:test";
import { buildWhatsAppBookingHref } from "../lib/tour-commerce";
import {
  calculateVisaSelection,
  clampVisaTravelerCount,
  formatVisaSelectionPreference,
  getVisibleOptionalAddOns,
  updateVisaTravelerParty,
} from "../lib/tour-visa-selection";

const offers = [
  { id: "canada", name: "Visa Kanada", price: 2_000_000, href: "/visa/kanada", processingTime: null, countryIds: ["ca"] },
  { id: "usa", name: "Visa Amerika Serikat", price: 3_000_000, href: "/visa/amerika-serikat", processingTime: null, countryIds: ["us"] },
];

test("new catalogs start with no visa service selected", () => {
  assert.deepEqual(calculateVisaSelection(offers, {}, 3), { items: [], total: 0 });
});

test("prices visa assistance only for travelers who need it, separate from per-person package prices", () => {
  const result = calculateVisaSelection(offers, { canada: 2, usa: 1 }, 4);
  assert.equal(result.total, 7_000_000);
  assert.deepEqual(result.items.map(({ id, count, total }) => ({ id, count, total })), [
    { id: "canada", count: 2, total: 4_000_000 },
    { id: "usa", count: 1, total: 3_000_000 },
  ]);
});

test("decreasing traveler count clamps services and stale offer IDs never add a charge", () => {
  const result = calculateVisaSelection(offers, { canada: 9, usa: 2, schengen: 3 }, 1);
  assert.equal(result.total, 5_000_000);
  assert.deepEqual(result.items.map((item) => item.count), [1, 1]);
});

test("defends against negative, nonfinite, fractional counts and duplicate or invalid prices", () => {
  assert.equal(clampVisaTravelerCount(-4, 3), 0);
  assert.equal(clampVisaTravelerCount(Number.NaN, 3), 0);
  assert.equal(clampVisaTravelerCount(Infinity, 3), 0);
  assert.equal(clampVisaTravelerCount(2.8, 3), 2);
  assert.equal(clampVisaTravelerCount(2, Number.NaN), 0);
  assert.equal(calculateVisaSelection([...offers, offers[0]], { canada: 1 }, 2).total, 2_000_000);
  assert.equal(calculateVisaSelection([{ ...offers[0], price: -10 }], { canada: 1 }, 2).total, 0);
  assert.equal(calculateVisaSelection([{ ...offers[0], price: Infinity }], { canada: 1 }, 2).total, 0);
});

test("booking preference itemizes unit prices, number of travelers, line totals and group subtotal", () => {
  const preference = formatVisaSelectionPreference(calculateVisaSelection(offers, { canada: 2 }, 3));
  assert.match(preference, /Visa Kanada: Rp\s2\.000\.000 × 2 orang = Rp\s4\.000\.000/);
  assert.match(preference, /Total bantuan visa untuk grup: Rp\s4\.000\.000/);
  assert.match(preference, /terpisah dari harga paket per orang/);
  assert.match(formatVisaSelectionPreference(calculateVisaSelection(offers, {}, 3)), /tidak ditambahkan/);
});

test("only suppresses optional addons with an exact mapped service, never all visa addons", () => {
  const addons = [
    { name: "Visa Kanada", price: 2_000_000, visaHref: "/visa/kanada" },
    { name: "Visa Meksiko", visaHref: "/visa/meksiko" },
    { name: "Visa Kanada manual" },
    { name: "Makan malam" },
    { name: "Visa Kanada express", price: 4_000_000, visaHref: "/visa/kanada" },
    { name: "Visa Kanada", visaHref: "/visa/kanada" },
  ];
  assert.deepEqual(getVisibleOptionalAddOns(addons, offers), addons.slice(1));
});

test("WhatsApp handoff keeps a mixed group's visa subtotal apart from the per-person package", () => {
  const selection = calculateVisaSelection(offers, { canada: 1, usa: 2 }, 3);
  const href = buildWhatsAppBookingHref("628111620207", {
    tourName: "Kanada dan Amerika Serikat", travelerCount: 2, childCount: 1,
    formattedPrice: "Rp 40.000.000", priceCaption: "Per orang, di luar bantuan visa",
    addOnPreference: formatVisaSelectionPreference(selection), intent: "booking",
  });
  const message = new URL(href).searchParams.get("text") ?? "";
  assert.match(message, /2 dewasa/);
  assert.match(message, /1 anak/);
  assert.match(message, /Rp 40\.000\.000/);
  assert.match(message, /Visa Kanada: Rp\s2\.000\.000 × 1 orang/);
  assert.match(message, /Visa Amerika Serikat: Rp\s3\.000\.000 × 2 orang/);
  assert.match(message, /Total bantuan visa untuk grup: Rp\s8\.000\.000/);
});

test("party updates permanently clamp applicant counts and do not silently restore removed charges", () => {
  const initial = { adults: 3, childCount: 0, visaCounts: { canada: 3, usa: 2 } };
  const smaller = updateVisaTravelerParty(initial, "adults", 1);
  assert.deepEqual(smaller, { adults: 1, childCount: 0, visaCounts: { canada: 1, usa: 1 } });
  const larger = updateVisaTravelerParty(smaller, "adults", 3);
  assert.deepEqual(larger.visaCounts, { canada: 1, usa: 1 });
  assert.deepEqual(initial.visaCounts, { canada: 3, usa: 2 });
  assert.equal(updateVisaTravelerParty(initial, "adults", -1).adults, 1);
  assert.equal(updateVisaTravelerParty(initial, "childCount", 8).childCount, 4);
  assert.equal(updateVisaTravelerParty(initial, "childCount", Number.NaN).childCount, 0);
});
