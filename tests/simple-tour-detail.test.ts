import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../components/website/clean/CleanTourDetail.tsx", import.meta.url),
  "utf8",
);

test("tour detail opens with the photo carousel, then text-first information", () => {
  const gallery = source.indexOf('<TourHeroGallery images={heroImages} title={tour.title} variant="top" />');
  const hero = source.indexOf("<section className={styles.detailHero}");
  assert.ok(gallery > 0 && hero > gallery, "carousel sits above the title block");

  // Itinerary is a plain, always-open day list (no per-day accordion).
  assert.match(source, /<ol className=\{styles\.detailItinerary\}>/);
  assert.match(source, /<p className=\{styles\.detailDayPill\}>/);
  assert.doesNotMatch(source, /<StableDetails className=\{styles\.detailDay\}/);

  // Included / not included / notes are simple tinted boxes.
  assert.match(source, /className=\{styles\.detailIncludedBox\}/);
  assert.match(source, /className=\{styles\.detailExcludedBox\}/);
  assert.match(source, /className=\{styles\.detailNoteBox\}/);

  // No marketing intro under the title, and reviews only show when published.
  assert.doesNotMatch(source, /detailHeroIntro|detailSectionKicker/);
  assert.match(source, /\{reviews\.length > 0 && \(\s*<section className=\{styles\.detailContentSection\} id="ulasan"/);
});
