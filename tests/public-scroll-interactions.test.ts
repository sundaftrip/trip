import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(relativePath: string) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("keeps primary tour-card and search navigation at the current scroll position", () => {
  const tourCard = source("components/website/clean/CleanTourCard.tsx");
  const globalSearch = source("components/website/clean/CleanGlobalSearch.tsx");

  assert.match(tourCard, /href=\{href\}\s+scroll=\{false\}/);
  assert.match(globalSearch, /router\.push\(href, \{ scroll: false \}\)/);
  assert.doesNotMatch(globalSearch, /resetDocumentScroll/);
});

test("keeps attributed homepage-card navigation inside the App Router", () => {
  const homeTourRail = source("components/website/clean/home/HomeTourRail.tsx");

  assert.match(homeTourRail, /router\.push\(attributedHref, \{ scroll: false \}\)/);
  assert.doesNotMatch(homeTourRail, /window\.location\.assign/);
});

test("applies catalog sheet filters without a full-page navigation", () => {
  const catalog = source("components/website/clean/CleanToursCatalog.tsx");

  assert.match(catalog, /setSheetOpen\(false\);\s+router\.push\(nextHref, \{ scroll: false \}\)/);
  assert.doesNotMatch(catalog, /window\.location\.assign/);
});

test("marks every itinerary PDF trigger as an isolated download", () => {
  const cleanDetail = source("components/website/clean/CleanTourDetail.tsx");
  const legacyDetail = source("app/(website)/tours/[id]/page.tsx");
  const cleanPdfLinks = cleanDetail.match(
    /href=\{`\/tours\/\$\{tour\.id\}\/pdf`\}[\s\S]{0,100}?download[\s\S]{0,100}?target="_blank"/g,
  );

  assert.equal(cleanPdfLinks?.length, 2);
  assert.match(
    legacyDetail,
    /href=\{`\/tours\/\$\{tour\.id\}\/pdf`\}[\s\S]{0,100}?download[\s\S]{0,100}?target="_blank"/,
  );
});
