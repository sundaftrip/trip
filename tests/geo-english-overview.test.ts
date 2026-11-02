import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { englishCountry, englishDepartureDate, englishDuration, englishRoute, formatIdrEnglish } from "../lib/english-overview";
import { itineraryFromCityHighlight } from "../lib/tour-itinerary-schema";
import { CRAWL_PROFILE } from "../lib/crawl-catalog";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("English overview formats durations, countries, dates and IDR prices", () => {
  assert.equal(englishDuration("10 Hari 7 Malam"), "10 days, 7 nights");
  assert.equal(englishDuration("11 Hari • 8 Malam Hotel"), "11 days, 8 nights");
  assert.equal(englishDuration("9 hari"), "9 days");
  assert.equal(englishDuration("Fleksibel"), "Fleksibel");
  assert.equal(englishDuration(null), null);
  assert.equal(englishCountry("Rusia"), "Russia");
  assert.equal(englishCountry("Jepang"), "Japan");
  assert.equal(englishCountry("Mongolia"), "Mongolia");
  assert.equal(englishDepartureDate(new Date("2027-01-13T17:00:00.000Z")), "14 January 2027");
  assert.equal(englishDepartureDate(null), "Private trip, dates on request");
  assert.equal(formatIdrEnglish(29500000), "IDR 29,500,000");
  assert.equal(englishRoute("Moskow•, St Petersburg•, Murmansk•, Moskow"), "Moskow – St Petersburg – Murmansk – Moskow");
  assert.equal(englishRoute("Hanoi – Ninh Binh"), "Hanoi – Ninh Binh");
  assert.equal(englishRoute(null), null);
});

test("tour itinerary keeps the travelled order and drops separators and back-to-back duplicates", () => {
  const itinerary = itineraryFromCityHighlight("Moskow•, St Petersburg•, Murmansk•, Moskow");
  assert.deepEqual(
    itinerary?.itemListElement.map((entry) => entry.item.name),
    ["Moskow", "St Petersburg", "Murmansk", "Moskow"],
  );
  assert.equal(itinerary?.itemListElement[0].position, 1);
  assert.deepEqual(
    itineraryFromCityHighlight("Tokyo, Hokkaido sapporo, otaru, biei & furano")?.itemListElement.map((entry) => entry.item.name),
    ["Tokyo", "Hokkaido sapporo", "otaru", "biei", "furano"],
  );
  assert.deepEqual(
    itineraryFromCityHighlight("Almaty, Almaty, Bishkek")?.itemListElement.map((entry) => entry.item.name),
    ["Almaty", "Bishkek"],
  );
  assert.equal(itineraryFromCityHighlight("Moskow"), null);
  assert.equal(itineraryFromCityHighlight(""), null);
  assert.equal(itineraryFromCityHighlight(null), null);
});

test("llms.txt carries an English summary, the AHU registration and the sister brand", () => {
  assert.match(CRAWL_PROFILE, /## English summary/);
  assert.match(CRAWL_PROFILE, /AHU-0001183-AH\.01\.14 Tahun 2026/);
  assert.match(CRAWL_PROFILE, /https:\/\/sundaftrip\.com\/en/);
  assert.match(CRAWL_PROFILE, /SUNDAF DMC \(https:\/\/sundafdmc\.com\)/);
});

test("the English overview is server-rendered, discoverable and keeps the no-walk-in policy", () => {
  const page = read("app/(website)/en/page.tsx");
  assert.doesNotMatch(page, /^"use client"/m, "the page must render on the server for crawlers");
  assert.match(page, /<div lang="en"/);
  assert.match(page, /inLanguage: "en"/);
  assert.match(page, /canonical: PAGE_URL/);
  assert.doesNotMatch(page, /"@type"\s*:\s*"(?:TravelAgency|LocalBusiness|PostalAddress)"/);
  assert.match(read("app/sitemap.ts"), /\$\{base\}\/en`/);
  assert.match(read("components/website/OrganizationSchema.tsx"), /\/en#webpage/);
  assert.match(read("app/(website)/tours/[id]/page.tsx"), /itinerary: tourItinerary/);
});
