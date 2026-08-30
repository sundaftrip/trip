import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../components/website/clean/home/HomeReviews.tsx", import.meta.url),
  "utf8",
);
const styles = readFileSync(
  new URL("../components/website/clean/home/CleanHome.module.css", import.meta.url),
  "utf8",
);

test("keeps testimonial read-more links clickable without an arrow or underline", () => {
  const link = source.match(/<Link\s+className=\{styles\.reviewMore\}[\s\S]*?<\/Link>/)?.[0];
  assert.ok(link);
  assert.match(link, /href="\/reviews"/);
  assert.match(link, /aria-label=\{`Lihat selengkapnya ulasan dari \$\{item\.name\}`\}/);
  assert.match(link, />\s*Lihat selengkapnya\s*<\/Link>/);
  assert.doesNotMatch(link, /→|ArrowRight|<span/);

  const rule = styles.match(/\.reviewMore\s*\{([^}]+)\}/)?.[1];
  assert.ok(rule);
  assert.match(rule, /text-decoration:\s*none;/);
  assert.match(rule, /min-height:\s*44px;/);
  assert.match(styles, /:focus-visible\s*\{[^}]*outline:\s*3px solid/);
});

test("preserves the separate all-stories link and its arrow", () => {
  assert.match(
    source,
    /<Link className=\{styles\.reviewLink\} href="\/reviews">\s*Baca semua cerita peserta <ArrowRight aria-hidden="true" \/>/,
  );
});
