import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homeCss = readFileSync(
  new URL(
    "../components/website/clean/home/CleanHome.module.css",
    import.meta.url,
  ),
  "utf8",
);
const tourRailSource = readFileSync(
  new URL(
    "../components/website/clean/home/HomeTourRail.tsx",
    import.meta.url,
  ),
  "utf8",
);

test("homepage finder labels use the accessible muted color token", () => {
  const finderLabelRule = homeCss.match(/\.finderField small\s*\{([^}]+)\}/);

  assert.ok(finderLabelRule, "expected the finder label CSS rule");
  assert.match(finderLabelRule[1], /color:\s*var\(--home-muted\)/);
});

test("homepage tour links derive their name from visible status and title", () => {
  const link = tourRailSource.match(
    /<Link[\s\S]*?className=\{styles\.tourMedia\}[\s\S]*?<\/Link>/,
  )?.[0];

  assert.ok(link, "expected the homepage tour media link");
  assert.doesNotMatch(link, /\baria-label=/);
  assert.match(link, /alt=""/);
  assert.match(
    link,
    /styles\.tourBadge[\s\S]*statusLabel\(tour\)[\s\S]*styles\.tourMediaTitle[\s\S]*tour\.title/,
  );
});

test("homepage carousel owns its controls and exposes keyboard navigation", () => {
  assert.match(tourRailSource, /aria-roledescription="carousel"/);
  assert.match(tourRailSource, /tabIndex=\{0\}/);
  assert.match(tourRailSource, /aria-controls="home-tour-rail"/);
  assert.match(tourRailSource, /onKeyDown=\{handleRailKeyDown\}/);
});

test("homepage carousel respects reduced-motion preference", () => {
  assert.match(
    tourRailSource,
    /window\.matchMedia\("\(prefers-reduced-motion: reduce\)"\)\.matches/,
  );
  assert.match(tourRailSource, /behavior:\s*reduceMotion\s*\?\s*"auto"\s*:\s*"smooth"/);
});

test("homepage motion remains subtle and desktop-only", () => {
  assert.match(
    homeCss,
    /@media \(min-width: 760px\) and \(prefers-reduced-motion: no-preference\)\s*\{[\s\S]*?\.heroReveal\s*\{[\s\S]*?animation:\s*heroReveal 320ms/,
  );
  assert.doesNotMatch(homeCss, /\.heroReveal\s*\{[\s\S]*?will-change:/);
});

test("homepage carousel buttons keep accessible touch target sizing", () => {
  const railButtonRule = homeCss.match(/\.railButton\s*\{([^}]+)\}/);

  assert.ok(railButtonRule, "expected the rail button CSS rule");
  assert.match(railButtonRule[1], /width:\s*44px/);
  assert.match(railButtonRule[1], /height:\s*44px/);
});
