import assert from "node:assert/strict";
import test from "node:test";
import { isValidElement, type ReactNode } from "react";
import { ItineraryPDF, type PdfAddOn } from "../components/pdf/ItineraryPDF";
import { preparePdfVisaAddOns } from "../lib/itinerary-pdf-visa-offers";
import { formatCurrency } from "../lib/utils";
import type { VisaServiceCatalogEntry } from "../lib/tour-visa-offers";

const russia: VisaServiceCatalogEntry = {
  name: "Rusia", en: "Russia", visa: "evisa", servicePrice: "Rp 1.600.000",
  variants: [{ name: "e-Visa", priceIDR: 1_500_000, processingTime: "5 hari kerja" }],
};
const china: VisaServiceCatalogEntry = {
  name: "China", en: "China", visa: "wajib", servicePrice: "Rp 2.000.000",
};
const source = { title: "Rusia Aurora", slug: "rusia-aurora-14-januari-2027", country: "Russia" };
const baggage: PdfAddOn = { name: "Bagasi domestik Rusia", tag: "wajib", price: 2_500_000, priceLabel: "Rp 2.500.000" };
const sami: PdfAddOn = {
  name: "Sami Village", price: 1_500_000, priceLabel: "Rp 1.500.000",
  desc: "Mencakup tiket masuk Sami Village dan naik kereta rusa. Pilihan tambahan berbayar di luar harga paket utama.",
};
const otherOptions: PdfAddOn[] = [
  sami,
  { name: "Husky Sledding", tag: "recommended", price: 1_400_000, priceLabel: "Rp 1.400.000", desc: "Aktivitas terpisah." },
  { name: "Snow Mobile", price: 1_500_000, priceLabel: "Rp 1.500.000" },
  { name: "Dokumen devisa", price: 100_000, priceLabel: "Rp 100.000" },
];
const legacyVisa: PdfAddOn = { name: "Visa Rusia", tag: "recommended", price: 1_400_000, priceLabel: "Rp 1.400.000", desc: "Harga lama visa Rp 1.400.000" };

test("PDF replaces stale optional visa with the HTML resolver's service price and preserves all other add-ons", () => {
  const addOns = [baggage, legacyVisa, ...otherOptions];
  const before = structuredClone(addOns);
  const prepared = preparePdfVisaAddOns(addOns, source, [russia]);
  assert.deepEqual(addOns, before, "source catalog data must not be mutated");
  assert.deepEqual(prepared.slice(0, 5), [baggage, ...otherOptions]);
  assert.strictEqual(prepared[0], baggage, "mandatory amount and object are unchanged");
  assert.strictEqual(prepared[1], sami, "Sami entry, amount and description are unchanged");
  const offers = prepared.filter((item) => item.name === "Visa Rusia");
  assert.equal(offers.length, 1);
  assert.equal(offers[0].price, 1_600_000);
  assert.equal(offers[0].priceLabel, formatCurrency(1_600_000));
  assert.match(offers[0].desc ?? "", /https:\/\/sundaftrip\.com\/visa\/russia/);
  assert.doesNotMatch(offers[0].desc ?? "", /1\.400\.000|5 hari kerja/);
  assert.deepEqual(prepared.filter((item) => item.tag === "wajib"), [baggage]);
});

test("unpriced or unavailable catalog entries preserve the existing CMS visa fallback", () => {
  for (const catalog of [[], [{ ...russia, servicePrice: "Konfirmasi harga", variants: [] }]]) {
    const original = [baggage, legacyVisa, ...otherOptions];
    assert.deepEqual(preparePdfVisaAddOns(original, source, catalog), original);
  }
  for (const name of ["e-Visa Rusia", "eVisa Rusia", "VISA RUSIA"]) {
    const original = [{ ...legacyVisa, name }, sami];
    assert.deepEqual(preparePdfVisaAddOns(original, source, []), original);
    const prepared = preparePdfVisaAddOns(original, source, [russia]);
    assert.strictEqual(prepared[0], sami);
    assert.equal(prepared[1].price, 1_600_000);
  }
});

test("unrelated-country visa services keep their CMS quotes beside authoritative destination offers", () => {
  const unmatched = { ...legacyVisa, name: "Visa China", desc: "Layanan terpisah yang tercatat di CMS." };
  const prepared = preparePdfVisaAddOns([unmatched, sami], source, [russia, china]);
  assert.strictEqual(prepared[0], unmatched);
  assert.strictEqual(prepared[1], sami);
  assert.equal(prepared[2].name, "Visa Rusia");
  assert.equal(prepared[2].price, 1_600_000);
});

test("combined visa quotes stay intact without duplicated components even when a country is unpriced or absent", () => {
  for (const name of ["Visa Rusia & China", "Visa Rusia dan China", "Visa Rusia China"]) {
    const bundle = { ...legacyVisa, name, price: 3_000_000, priceLabel: "Rp 3.000.000", desc: "Layanan gabungan." };
    for (const secondCountry of [undefined, china, { ...china, servicePrice: "Konfirmasi harga", variants: [] }]) {
      for (const destination of [source, { ...source, country: "Russia dan China" }]) {
        const catalog = secondCountry ? [russia, secondCountry] : [russia];
        assert.deepEqual(preparePdfVisaAddOns([baggage, bundle, sami], destination, catalog), [baggage, bundle, sami]);
      }
    }
  }
});

test("material visa qualifiers are preserved while harmless person-unit suffixes allow current prices", () => {
  for (const name of ["Visa Rusia Multiple Entry 1 tahun", "Visa Rusia express", "Visa Rusia China", "Visa Rusia 30 hari"]) {
    const qualified = { ...legacyVisa, name };
    assert.deepEqual(preparePdfVisaAddOns([qualified, sami], source, [russia]), [qualified, sami]);
  }
  for (const name of ["Visa Rusia / orang", "Visa Rusia per orang", "e-Visa Russia / pax", "Pengurusan visa Rusia (per pax)"]) {
    const prepared = preparePdfVisaAddOns([{ ...legacyVisa, name }, sami], source, [russia]);
    assert.strictEqual(prepared[0], sami);
    assert.equal(prepared.length, 2);
    assert.equal(prepared[1].name, "Visa Rusia");
    assert.equal(prepared[1].price, 1_600_000);
  }
});

test("catalog variant fallback retains authoritative amount and service timing, with duplicate offers removed", () => {
  const record = { ...russia, servicePrice: null };
  const prepared = preparePdfVisaAddOns([legacyVisa], source, [record, record]);
  assert.equal(prepared.length, 1);
  assert.equal(prepared[0].price, 1_500_000);
  assert.match(prepared[0].desc ?? "", /Estimasi layanan: 5 hari kerja/);
});

test("mandatory visa remains untouched and is not quoted a second time as optional", () => {
  const mandatoryVisa = { ...legacyVisa, tag: "wajib" as const };
  const prepared = preparePdfVisaAddOns([baggage, mandatoryVisa, sami], { ...source, country: "Russia dan China" }, [russia, china]);
  assert.deepEqual(prepared.slice(0, 3), [baggage, mandatoryVisa, sami]);
  assert.strictEqual(prepared[1], mandatoryVisa);
  assert.equal(prepared.filter((item) => item.name === "Visa Rusia").length, 1);
  assert.equal(prepared.find((item) => item.name === "Visa China")?.price, 2_000_000);
  assert.deepEqual(prepared.filter((item) => item.tag === "wajib"), [baggage, mandatoryVisa]);
  const unspecified = { ...mandatoryVisa, name: "Pengurusan visa" };
  assert.deepEqual(preparePdfVisaAddOns([baggage, unspecified, sami], source, [russia]), [baggage, unspecified, sami]);
});

test("an unpriced or absent named mandatory China visa does not suppress the current Russia offer", () => {
  const mandatoryChina = { ...legacyVisa, name: "Visa China", tag: "wajib" as const };
  for (const catalog of [[russia], [russia, { ...china, servicePrice: "Konfirmasi harga", variants: [] }]]) {
    const prepared = preparePdfVisaAddOns([mandatoryChina, legacyVisa, sami], { ...source, country: "Russia dan China" }, catalog);
    assert.strictEqual(prepared[0], mandatoryChina);
    assert.strictEqual(prepared[1], sami);
    assert.equal(prepared.length, 3);
    assert.equal(prepared[2].name, "Visa Rusia");
    assert.equal(prepared[2].price, 1_600_000);
    assert.deepEqual(prepared.filter((item) => item.tag === "wajib"), [mandatoryChina]);
  }
});

function text(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(text).join(" ");
  if (!isValidElement<{ children?: ReactNode }>(node)) return "";
  if (typeof node.type === "function") return text((node.type as (props: unknown) => ReactNode)(node.props));
  return text(node.props.children);
}

test("active PDF shows the resolved visa, intact Sami scope and unchanged package subtotal", () => {
  // Husky has the same 1.4m price as the old visa; omitting it from this fixture
  // makes the absence of the obsolete visa quote unambiguous.
  const prepared = preparePdfVisaAddOns([baggage, legacyVisa, sami], source, [russia]);
  const output = text(ItineraryPDF({
    tour: {
      title: "Rusia Aurora", country: "Russia", seatsLeft: 16, itinerary: [],
      inclusions: ["Hotel dan sarapan"], exclusions: ["Visa Rusia", "Bagasi pesawat domestik Rusia"],
      addOns: prepared.filter((item) => item.tag !== "wajib"),
    },
    mandatoryAddOns: prepared.filter((item) => item.tag === "wajib"),
    priceLabel: "Rp 27.000.000", inclusivePriceLabel: "Rp 29.500.000",
    company: { name: "Sundaf Trip" },
  })).replaceAll("\u00a0", " ").replace(/\s+/g, " ");
  assert.match(output, /Subtotal paket \+ tambahan wajib/);
  assert.equal(output.match(/Rp 29\.500\.000/g)?.length, 1);
  assert.match(output, /Visa Rusia Rp 1\.600\.000|Visa Rusia .*Rp 1\.600\.000/);
  assert.doesNotMatch(output, /Rp 1\.400\.000|Total wajib|Harga normal total/);
  assert.ok(output.includes(sami.desc!));
  assert.match(output, /Opsional, belum masuk subtotal di atas/);
  assert.match(output, /Tambahan wajib yang dirinci di atas sudah dihitung dalam subtotal/);
});
