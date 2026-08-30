import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { assessTourVisas, type VisaAssessmentRecord } from "../lib/tour-visa-assessment";
import { buildTourVisaCatalogNotes, buildTourVisaPdfAddOns } from "../lib/tour-visa-catalog";

const now = new Date("2026-08-31T00:00:00Z");
const record: VisaAssessmentRecord = { id: "fr", name: "Prancis", en: "France", visa: "wajib", region: "Schengen", stay: "90 hari dalam 180 hari", servicePrice: "Rp 1.000.000", lastVerifiedAt: now, sourceUrl: "https://example.test/visa", conditions: ["Paspor masih berlaku.", "Paspor masih berlaku."], eligibility: ["Dokumen sesuai tujuan wisata."] };
const assess = (overrides: Partial<VisaAssessmentRecord> = {}) => assessTourVisas({ plan: { version: 1, passportCountry: "ID", passportType: "ordinary", purpose: "tourism", destinations: [{ countryId: "fr", kind: "visit", stayDays: 14, service: "offer" }] } }, [{ ...record, ...overrides }], now);

test("shared catalog notes retain profile, conditional requirements and rolling-stay caution", () => {
  const text = buildTourVisaCatalogNotes(assess());
  assert.match(text, /Paspor biasa Indonesia/);
  assert.match(text, /90 hari dalam 180 hari/);
  assert.match(text, /kunjungan sebelumnya/i);
  assert.match(text, /Dokumen sesuai tujuan wisata/);
  assert.equal(text.match(/Paspor masih berlaku/g)?.length, 1);
});

test("PDF adds only priced eligible optional services, charged per applicant not per group", () => {
  const addons = buildTourVisaPdfAddOns(assess());
  assert.equal(addons.length, 1);
  assert.equal(addons[0].name, "Visa Schengen");
  assert.equal(addons[0].price, 1_000_000);
  assert.match(addons[0].priceLabel, /pemohon/);
  assert.equal(addons[0].tag, "");
  assert.match(addons[0].desc, /belum termasuk/i);
  assert.deepEqual(buildTourVisaPdfAddOns(assess({ servicePrice: null })), []);
  assert.match(buildTourVisaCatalogNotes(assess({ servicePrice: null })), /harga|biaya/i);
});

test("unknown destination keeps consultation text without inventing a fee", () => {
  const assessment = assessTourVisas({ country: "Belum tercatat" }, [], now);
  assert.match(buildTourVisaCatalogNotes(assessment), /Hubungi tim|belum/i);
  assert.deepEqual(buildTourVisaPdfAddOns(assessment), []);
});

test("website and PDF use the same conditions presenter and PDF optional cost adapter", () => {
  for (const path of ["app/(website)/tours/[id]/page.tsx", "app/(website)/tours/[id]/pdf/route.ts"]) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    assert.match(source, /buildTourVisaCatalogNotes\(visaAssessment\)/);
  }
  const pdf = readFileSync(new URL("../app/(website)/tours/[id]/pdf/route.ts", import.meta.url), "utf8");
  assert.match(pdf, /buildTourVisaPdfAddOns\(visaAssessment\)/);
});
