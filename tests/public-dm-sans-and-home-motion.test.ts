import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const cleanDir = new URL("../components/website/clean/", import.meta.url);
const publicCss = [
  ...readdirSync(cleanDir).filter((file) => file.endsWith(".css")).map((file) => `components/website/clean/${file}`),
  "components/website/clean/home/CleanHome.module.css",
  "app/(website)/sundaf-trip/CompanyProfile.module.css",
  "app/(website)/visa/VisaPages.module.css",
];

test("public pages use DM Sans only (no serif, handwritten, or mono faces)", () => {
  for (const path of publicCss) {
    const css = read(path);
    for (const declaration of css.match(/font-family:[^;]+;/g) ?? []) {
      assert.doesNotMatch(declaration, /Georgia|Times|serif\b(?<!sans-serif)|monospace|Anonymous|Kalam|Caveat|Jost|Plus Jakarta/i, `${path}: ${declaration}`);
    }
  }

  const heroNote = read("components/website/clean/home/HeroNote.tsx");
  assert.doesNotMatch(heroNote, /next\/font|<svg|<text/);
  assert.match(heroNote, /Semua bisa jalan!/);
});

test("homepage motion stays optional and calm", () => {
  const reveal = read("components/website/clean/home/HomeReveal.tsx");
  assert.match(reveal, /prefers-reduced-motion: reduce/);
  assert.match(reveal, /dataset\.revealed = "instant"/);

  const styles = read("components/website/clean/home/CleanHome.module.css");
  const motionBlock = styles.slice(styles.indexOf("@media (prefers-reduced-motion: no-preference)"));
  assert.match(motionBlock, /\.heroImage\s*\{\s*animation: hero-camera/);
  assert.match(motionBlock, /\[data-reveal-ready\] \[data-reveal\]/);
  assert.doesNotMatch(styles.slice(0, styles.indexOf("@media (prefers-reduced-motion: no-preference)")), /animation: hero-camera/);
});

test("phones show trips as a two-column catalog", () => {
  const home = read("components/website/clean/home/CleanHome.module.css");
  const phone = home.slice(home.indexOf("@media (max-width: 759px)"));
  assert.match(phone, /\.tourRail\s*\{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);

  const catalog = read("components/website/clean/ToursCatalog.module.css");
  const catalogPhone = catalog.slice(catalog.indexOf("@media (max-width: 700px)"));
  assert.match(catalogPhone, /\.grid\s*\{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);

  const rail = read("components/website/clean/home/HomeTourRail.tsx");
  assert.match(rail, /sizes="\(max-width: 759px\) 50vw/);
  assert.doesNotMatch(rail, /aria-roledescription="carousel"/);
});
