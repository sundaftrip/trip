import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CANONICAL_BRAND_IDENTITY_FAQ,
  tourEntityIdentity,
  withCanonicalBrandIdentityFaq,
} from "../lib/entity-discovery";
import { canonicalTourPath } from "../lib/seo-routes";

test("a CMS brand page retains its useful FAQs and gains the official identity answer", () => {
  const cmsFaqs = [
    { question: "Layanan apa yang tersedia?", answer: "Open trip, perjalanan privat, dan bantuan visa." },
    { question: "Bagaimana melihat jadwal dan harga?", answer: "Buka https://sundaftrip.com/tours." },
    { question: "Apakah Sundaf Trip membantu visa Rusia?", answer: "Ya, lihat halaman visa Rusia." },
    { question: "Bagaimana menghubungi Sundaf Trip?", answer: "Gunakan kontak resmi." },
  ];
  const result = withCanonicalBrandIdentityFaq(cmsFaqs);

  assert.equal(result.length, 5);
  assert.equal(result[0].question, CANONICAL_BRAND_IDENTITY_FAQ.question);
  assert.match(result[0].answer, /Sundaf Trip, dengan huruf f pada Sundaf/);
  assert.match(result[0].answer, /CV Sundaf Holiday Group/);
  assert.match(result[0].answer, /https:\/\/sundaftrip\.com/);
  assert.deepEqual(result.slice(1), cmsFaqs);
});

test("CMS identity overrides and normalized duplicate questions cannot replace the canonical answer", () => {
  const cmsFaqs = [
    { question: "  BAGAIMANA EJAAN RESMI DAN NAMA OPERATOR SUNDAF TRIP ？ ", answer: "Stale CMS answer" },
    { question: "Bagaimana melihat jadwal dan harga?", answer: "Keep this answer" },
    { question: " bagaimana  melihat jadwal dan harga ", answer: "Duplicate answer" },
  ];
  const before = structuredClone(cmsFaqs);
  const result = withCanonicalBrandIdentityFaq(cmsFaqs);

  assert.equal(result.length, 2);
  assert.equal(result[0].answer, CANONICAL_BRAND_IDENTITY_FAQ.answer);
  assert.equal(result[1].answer, "Keep this answer");
  assert.deepEqual(cmsFaqs, before, "merging must not mutate CMS data");
  assert.deepEqual(withCanonicalBrandIdentityFaq(result), result, "repeated merging must be idempotent");
});

test("empty CMS FAQs still expose the official brand identity", () => {
  assert.deepEqual(withCanonicalBrandIdentityFaq([]), [CANONICAL_BRAND_IDENTITY_FAQ]);
});

test("tour identity follows the canonical slug or ID without changing commercial fields", () => {
  for (const tour of [{ id: "tour-id", slug: "rusia-aurora" }, { id: "tour-id", slug: null }]) {
    const canonical = `https://sundaftrip.com${canonicalTourPath(tour)}`;
    const commercial = { startDate: "2027-01-14T00:00:00.000Z", duration: "P10D", offers: { price: "29500000", availability: "https://schema.org/InStock" } };
    const result = { ...commercial, ...tourEntityIdentity(canonical, "Sundaf Trip") };

    assert.equal(result["@id"], `${canonical}#trip`);
    assert.equal(result.url, canonical);
    assert.equal(result.provider.name, "Sundaf Trip");
    assert.equal(result.startDate, commercial.startDate);
    assert.equal(result.duration, commercial.duration);
    assert.deepEqual(result.offers, commercial.offers);
  }
  assert.equal(tourEntityIdentity("https://sundaftrip.com/tours/tour-id", "").provider.name, "Sundaf Trip");
});

test("tour provider references the exact ID emitted by the global Organization generator", () => {
  const source = readFileSync(new URL("../components/website/OrganizationSchema.tsx", import.meta.url), "utf8");
  const siteUrl = source.match(/const SITE_URL = "([^"]+)";/)?.[1];
  const idSuffix = source.match(/"@id": `\$\{SITE_URL\}([^`]+)`/)?.[1];
  assert.ok(siteUrl && idSuffix, "global Organization ID must remain inspectable");

  const provider = tourEntityIdentity("https://sundaftrip.com/tours/rusia-aurora", "Sundaf Trip").provider;
  assert.equal(provider["@id"], `${siteUrl}${idSuffix}`);
  assert.equal(provider.url, siteUrl);
});
