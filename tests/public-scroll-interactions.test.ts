import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import test from "node:test";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));

function source(relativePath: string) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

function sourceFiles(relativeDirectory: string): string[] {
  const absoluteDirectory = join(repoRoot, relativeDirectory);

  return readdirSync(absoluteDirectory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(absoluteDirectory, entry.name);
    const relativePath = relative(repoRoot, absolutePath);

    if (entry.isDirectory()) return sourceFiles(relativePath);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [relativePath] : [];
  });
}

test("uses one preserve-scroll link policy across the entire public website", () => {
  const sharedLink = source("components/website/clean/PreserveScrollLink.tsx");
  const publicSources = [
    ...sourceFiles("app/(website)"),
    ...sourceFiles("components/website"),
  ];
  const directNextLinkImports = publicSources.filter((relativePath) => (
    relativePath !== "components/website/clean/PreserveScrollLink.tsx"
    && /from ["']next\/link["']/.test(source(relativePath))
  ));

  assert.match(sharedLink, /scroll=\{scroll \?\? shouldScrollLinkToFragment\(href\)\}/);
  assert.deepEqual(directNextLinkImports, []);
});

test("keeps intentional public hash navigation working", () => {
  const pagination = source("components/website/Pagination.tsx");
  const tourFilter = source("components/website/TourFilter.tsx");
  const consoleSidebar = source("components/website/ConsoleSidebar.tsx");

  assert.match(pagination, /#tours/);
  assert.match(tourFilter, /#tours/);
  assert.match(consoleSidebar, /\/#contact/);
});

test("uses stable details across every public expandable section", () => {
  const publicSources = [
    ...sourceFiles("app/(website)"),
    ...sourceFiles("components/website"),
  ];
  const nativeDetailsOutsideWrapper = publicSources.filter((relativePath) => {
    if (relativePath === "components/website/clean/StableDetails.tsx") return false;

    const withoutComments = source(relativePath)
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
    return /<details(?:\s|>)/.test(withoutComments);
  });

  assert.deepEqual(nativeDetailsOutsideWrapper, []);
});

test("keeps primary tour-card and search navigation at the current scroll position", () => {
  const tourCard = source("components/website/clean/CleanTourCard.tsx");
  const themedTourSection = source("components/website/ToursSection.tsx");
  const globalSearch = source("components/website/clean/CleanGlobalSearch.tsx");

  assert.match(tourCard, /href=\{href\}\s+scroll=\{false\}/);
  assert.match(themedTourSection, /<Link key=\{tour\.id\} href=\{`\/tours\//);
  assert.doesNotMatch(themedTourSection, /<a key=\{tour\.id\} href=\{`\/tours\//);
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

test("keeps visa table navigation at the current touch scroll position", () => {
  const visaDatabase = source("app/(website)/visa/VisaDatabase.tsx");

  assert.equal(
    visaDatabase.match(/router\.push\(href, \{ scroll: false \}\)/g)?.length,
    2,
  );
  assert.doesNotMatch(visaDatabase, /router\.push\(href\);/);
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

test("marks every company-profile PDF trigger as an isolated download", () => {
  const b2b = source("components/website/B2BLandTour.tsx");
  const companyProfile = source("components/website/CompanyProfileContent.tsx");

  assert.match(
    b2b,
    /href=\{pdfHref\}[\s\S]{0,100}?download[\s\S]{0,100}?target="_blank"[\s\S]{0,100}?rel="noopener"/,
  );
  assert.equal(
    companyProfile.match(
      /href="\/sundaftrip-company-profile(?:-ru)?\.pdf"[\s\S]{0,100}?download[\s\S]{0,100}?target="_blank"[\s\S]{0,100}?rel="noopener"/g,
    )?.length,
    2,
  );
});

test("corrects details movement without a smooth window scroll call", () => {
  const stableDetails = source("components/website/clean/StableDetails.tsx");

  assert.match(stableDetails, /root\.style\.scrollBehavior = "auto"/);
  assert.match(stableDetails, /scrollingElement\.scrollTop \+= delta/);
  assert.doesNotMatch(stableDetails, /window\.scrollBy/);
});
