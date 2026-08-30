import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const componentSource = readFileSync(
  new URL("../components/website/AuroraText.tsx", import.meta.url),
  "utf8",
);
const stylesSource = readFileSync(
  new URL("../components/website/AuroraText.module.css", import.meta.url),
  "utf8",
);
const homeSource = readFileSync(
  new URL("../components/website/clean/CleanHome.tsx", import.meta.url),
  "utf8",
);
const tourDetailSource = readFileSync(
  new URL("../components/website/clean/CleanTourDetail.tsx", import.meta.url),
  "utf8",
);
const teriberkaSource = readFileSync(
  new URL("../app/(website)/destinations/teriberka/page.tsx", import.meta.url),
  "utf8",
);
const murmanskSource = readFileSync(
  new URL("../app/(website)/destinations/murmansk/page.tsx", import.meta.url),
  "utf8",
);
const globalStylesSource = readFileSync(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);

test("exposes a reusable span component and a single-phrase text helper", () => {
  assert.match(componentSource, /export interface AuroraTextProps/);
  assert.match(componentSource, /ComponentPropsWithoutRef<"span">/);
  assert.match(componentSource, /export function AuroraText/);
  assert.match(componentSource, /export function TextWithAuroraAccent/);
  assert.match(componentSource, /export default AuroraText/);
  assert.match(componentSource, /glow\?: boolean/);
  assert.match(componentSource, /className/);
});

test("accents one literal phrase case-insensitively without hiding readable text", () => {
  assert.match(componentSource, /new RegExp\(escapeRegExp\(phrase\), "iu"\)\.exec\(text\)/);
  assert.match(componentSource, /const matchedPhrase = match\[0\]/);
  assert.match(componentSource, /\{text\.slice\(0, start\)\}/);
  assert.match(componentSource, /\{matchedPhrase\}/);
  assert.match(componentSource, /\{text\.slice\(start \+ matchedPhrase\.length\)\}/);
  assert.doesNotMatch(componentSource, /aria-hidden/);
  assert.doesNotMatch(componentSource, /dangerouslySetInnerHTML/);
});

test("keeps an accessible solid-color fallback when gradient text is unsupported", () => {
  assert.match(stylesSource, /\.auroraText \{[\s\S]*?color: #f4fffd;/);
  assert.match(
    stylesSource,
    /@supports \(\(background-clip: text\) or \(-webkit-background-clip: text\)\) \{[\s\S]*?-webkit-text-fill-color: transparent;/,
  );
});

test("animates slowly only on motion-enabled non-mobile viewports", () => {
  assert.match(
    stylesSource,
    /@media \(prefers-reduced-motion: no-preference\) and \(min-width: 640px\) \{[\s\S]*?animation: aurora-text-drift 18s/,
  );
  const activeAnimations = [...stylesSource.matchAll(/animation:\s*([^;]+);/g)]
    .map((match) => match[1].trim())
    .filter((value) => value !== "none");
  assert.deepEqual(activeAnimations, [
    "aurora-text-drift 18s ease-in-out infinite alternate",
  ]);
  assert.doesNotMatch(stylesSource, /opacity\s*:/);
});

test("uses readable system colors and removes visual effects in forced-colors mode", () => {
  assert.match(
    stylesSource,
    /@media \(forced-colors: active\) \{[\s\S]*?color: CanvasText;[\s\S]*?background: none;[\s\S]*?filter: none;[\s\S]*?animation: none;[\s\S]*?-webkit-text-fill-color: CanvasText;/,
  );
});

test("keeps the homepage phrase gradient without opting into a glowing shadow", () => {
  const homeAccent = homeSource.match(/<TextWithAuroraAccent\b[^>]*\/>/)?.[0];
  assert.ok(homeAccent, "homepage keeps its gradient text helper");
  assert.match(homeAccent, /text=\{heroTitle\}/);
  assert.match(homeAccent, /phrase="cerita yang berbeda\."/);
  assert.doesNotMatch(homeAccent, /\bglow\b/);
  assert.match(componentSource, /function TextWithAuroraAccent\(\{[\s\S]*?glow = false/);
  assert.equal((homeSource.match(/<TextWithAuroraAccent/g) ?? []).length, 1);
});

test("preserves the existing aurora accents on other dark hero headings", () => {
  assert.match(tourDetailSource, /<h1 id="tour-title">[\s\S]*?phrase="Aurora"[\s\S]*?glow/);
  assert.equal((tourDetailSource.match(/<TextWithAuroraAccent/g) ?? []).length, 1);

  for (const destinationSource of [teriberkaSource, murmanskSource]) {
    assert.match(destinationSource, /<AuroraText glow>\{destination\.hero\.titleLine2\}<\/AuroraText>/);
    assert.equal((destinationSource.match(/<AuroraText/g) ?? []).length, 1);
  }
});

test("centralizes the effect instead of leaving the legacy global classes active", () => {
  assert.doesNotMatch(globalStylesSource, /\.aurora-text\b/);
  assert.doesNotMatch(globalStylesSource, /\.aurora-glow\b/);
  assert.doesNotMatch(globalStylesSource, /@keyframes aurora-shift/);
});
