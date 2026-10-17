import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readSource(relativePath: string) {
  return readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

const footer = readSource("components/website/clean/CleanFooter.tsx");

test("footer keeps the AHU and OSS registrations in one seal strip", () => {
  assert.match(footer, /SUNDAF_AHU_REGISTRATION\.verificationUrl/);
  assert.match(footer, /\/brand\/ahu-pengayoman\.jpg/);
  assert.match(footer, /\/brand\/oss-indonesia\.svg/);
  assert.match(footer, /Perizinan melalui OSS/);
});

test("footer no longer repeats the homepage highlight list", () => {
  for (const removed of ["Rute dan jadwal jelas", "Persiapan dibantu", "Untuk traveler Indonesia"]) {
    assert.doesNotMatch(footer, new RegExp(removed));
  }
});

test("every footer payment mark is an official asset with a recorded source", () => {
  const marksBlock = footer.slice(footer.indexOf("const PAYMENT_MARKS"), footer.indexOf("function InstagramIcon"));
  const files = [...marksBlock.matchAll(/src: "\/brand\/([^"]+)"/g)].map((match) => match[1]);
  const sources = readSource("public/brand/ASSET-SOURCES.md");

  assert.ok(files.includes("bca-white.svg"), "BCA must stay in the payment row");
  for (const file of files) {
    assert.ok(existsSync(path.join(repositoryRoot, "public/brand", file)), `public/brand/${file} is missing`);
    assert.match(sources, new RegExp(`\`${file.replace(/\./g, "\\.")}\``), `${file} needs a source entry in ASSET-SOURCES.md`);
  }
});

test("footer waves are decorative, seamless and motion-safe", () => {
  const horizon = readSource("components/website/clean/FooterHorizon.tsx");
  const horizonCss = readSource("components/website/clean/FooterHorizon.module.css");
  const footerCss = readSource("components/website/clean/CleanFooter.module.css");

  assert.match(footer, /<FooterHorizon \/>/);
  assert.match(horizon, /aria-hidden="true"/);
  // The front wave and the footer share one colour variable, so no seam shows.
  assert.match(horizonCss, /\.front \{ fill: var\(--footer-bg/);
  assert.match(footerCss, /--footer-bg: #222b3b/);
  // Every wave runs past both edges of the 1440-wide artwork, so the sideways drift never shows a gap.
  const waves = [...horizon.matchAll(/^const \w+ = "M(-?\d+) .* L(\d+) \d+Z";$/gm)];
  assert.equal(waves.length, 3);
  for (const [, start, end] of waves) {
    assert.ok(Number(start) <= -60 && Number(end) >= 1500, `wave spans ${start} to ${end}`);
  }
  // Motion only runs when the visitor allows it.
  const motionBlock = horizonCss.slice(horizonCss.indexOf("@media (prefers-reduced-motion: no-preference)"));
  assert.match(motionBlock, /animation-timeline: --footer-horizon/);
  assert.doesNotMatch(horizonCss.slice(0, horizonCss.indexOf("@media")), /animation:/);
});
