import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const rootLayout = source("../app/layout.tsx");
const websiteLayout = source("../app/(website)/layout.tsx");
const globalStyles = source("../app/globals.css");
const cleanSiteStyles = source("../components/website/clean/CleanSite.module.css");
const homeStyles = source("../components/website/clean/home/CleanHome.module.css");
const catalogStyles = source("../components/website/clean/ToursCatalog.module.css");
const shellStyles = source("../components/website/clean/CleanShell.module.css");
const supportStyles = source("../components/website/clean/SupportPages.module.css");
const destinationIndexStyles = source("../components/website/clean/DestinationIndex.module.css");
const destinationHubStyles = source("../components/website/clean/DestinationHub.module.css");
const customTripStyles = source("../components/website/clean/CustomTripWizard.module.css");
const visaStyles = source("../app/(website)/visa/VisaPages.module.css");

const publicPageStyles = [
  cleanSiteStyles,
  homeStyles,
  catalogStyles,
  shellStyles,
  supportStyles,
  destinationIndexStyles,
  destinationHubStyles,
  customTripStyles,
  visaStyles,
];

test("loads variable Jost and Plus Jakarta Sans families", () => {
  assert.match(rootLayout, /const jost\s*=\s*Jost\(\{ subsets: \["latin"\], variable: "--font-jost"/);
  assert.doesNotMatch(rootLayout, /const jost\s*=\s*Jost\(\{ weight:/);
  assert.match(rootLayout, /const plusJakarta\s*=\s*Plus_Jakarta_Sans\(\{ subsets: \["latin"\], variable: "--font-plus-jakarta"/);
  assert.match(rootLayout, /jost\.variable, plusJakarta\.variable/);
});

test("publishes separate UI and editorial display font tokens", () => {
  assert.match(websiteLayout, /const uiFontFamily =\s*\n\s*'var\(--font-plus-jakarta\)/);
  assert.match(websiteLayout, /const displayFontFamily =\s*\n\s*'var\(--font-jost\)/);
  assert.match(websiteLayout, /--site-font-family: \$\{uiFontFamily\}/);
  assert.match(websiteLayout, /--site-display-font-family: \$\{displayFontFamily\}/);
  assert.match(globalStyles, /font-family: var\(--site-font-family, ui-sans-serif/);
});

test("uses Plus Jakarta Sans for public navigation, body copy, and commerce UI", () => {
  for (const styles of publicPageStyles) {
    assert.match(styles, /font-family:[\s\S]{0,100}var\(\s*--site-font-family[\s\S]{0,140}var\(--font-plus-jakarta/);
  }
  assert.match(cleanSiteStyles, /font-weight: 400;\s*\n\s*letter-spacing: 0;/);
  assert.match(homeStyles, /font-weight: 400;\s*\n\s*letter-spacing: 0;/);
});

test("reserves Jost for major editorial headings", () => {
  assert.match(homeStyles, /\.heroCopy h1 \{[\s\S]{0,180}--site-display-font-family/);
  assert.match(homeStyles, /\.sectionHeading h2,[\s\S]{0,180}--site-display-font-family/);
  assert.match(catalogStyles, /\.hero h1,[\s\S]{0,240}--site-display-font-family/);
  assert.match(cleanSiteStyles, /\.detailHero h1 \{[\s\S]{0,220}--site-display-font-family/);
  assert.match(cleanSiteStyles, /\.detailSummary h2,[\s\S]{0,180}--site-display-font-family/);
  assert.match(supportStyles, /\.title \{[\s\S]{0,180}--site-display-font-family/);
  assert.match(destinationIndexStyles, /\.hero h1 \{[\s\S]{0,180}--site-display-font-family/);
  assert.match(destinationHubStyles, /\.hero h1 \{[\s\S]{0,180}--site-display-font-family/);
  assert.match(customTripStyles, /\.hero h1,[\s\S]{0,180}--site-display-font-family/);
  assert.match(visaStyles, /\.heroTitle \{[\s\S]{0,180}--site-display-font-family/);
});

test("does not introduce a third editorial font in the clean site", () => {
  for (const styles of publicPageStyles) {
    assert.doesNotMatch(styles, /font-family:\s*(?:Georgia|"Times New Roman")/);
  }
});
