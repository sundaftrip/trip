import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the Sundaf DMC document format is shared by the public pages", () => {
  const globals = read("app/globals.css");
  const shell = globals.match(/\.public-site-shell \{([^}]*)\}/)?.[1] ?? "";
  assert.match(shell, /--doc-amber: #eab067;/);
  assert.match(shell, /--doc-green: #2e6751;/);

  const doc = read("components/website/clean/DocFormat.module.css");
  const tag = doc.match(/\.tag\.tag\.tag \{([^}]*)\}/)?.[1] ?? "";
  assert.match(tag, /border-radius: 999px 0 0 999px;/);
  assert.match(tag, /background: var\(--doc-amber\);/);
  assert.match(tag, /clip-path: polygon\(0 0, 100% 0, calc\(100% - 18px\) 100%, 0 100%\);/);
  assert.match(doc, /\.table thead th \{[^}]*background: var\(--doc-green\);/);
});

test("the tours catalog uses the document format", () => {
  const catalog = read("components/website/clean/CleanToursCatalog.tsx");
  assert.match(catalog, /import doc from "\.\/DocFormat\.module\.css";/);
  assert.match(catalog, /<p className=\{doc\.eyebrow\}>Jadwal &amp; biaya tour<\/p>/);
  assert.match(catalog, /<h1 id="catalog-page-title" className=\{doc\.title\}>/);
  assert.match(catalog, /<h2 id="catalog-results-title" className=\{doc\.tag\}>/);
  assert.match(catalog, /<h2 id="catalog-faq-title" className=\{doc\.tag\}>/);
  assert.match(catalog, /styles\.consultationRow\} \$\{doc\.boxSand\}/);

  const css = read("components/website/clean/ToursCatalog.module.css");
  assert.doesNotMatch(css.slice(css.indexOf(".consultation {"), css.indexOf(".consultationRow {")), /background: var\(--catalog-navy\)/);
});

test("the catalog header fills the desktop width with a note and three described trip types", () => {
  const catalog = read("components/website/clean/CleanToursCatalog.tsx");
  assert.match(catalog, /<p className=\{styles\.heroLede\}>/);
  assert.match(catalog, /note: "Berangkat bersama grup di tanggal yang sudah ditetapkan\."/);
  assert.match(catalog, /<small>\{tab\.note\}<\/small>/);

  const css = read("components/website/clean/ToursCatalog.module.css");
  // No narrow 860px column on wide screens any more.
  assert.doesNotMatch(css, /\.hero \.shell \{\s*width: min\(860px/);
  assert.match(css, /\.trustCounts \{[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
  assert.match(css, /\.trustCounts a\[aria-current="page"\] \{[^}]*background: var\(--doc-green\);/);
  // The old muted paragraph rule must not override the lede.
  assert.doesNotMatch(css, /\.heroLayout > div > p:last-child/);
});
