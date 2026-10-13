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
  "components/website/PageScrollControls.module.css",
  "components/website/LatinAmerica.module.css",
];

test("public pages use DM Sans, except the hero chalk note and B2B titles", () => {
  for (const path of publicCss) {
    const css = read(path);
    for (const declaration of css.match(/font-family:[^;]+;/g) ?? []) {
      assert.doesNotMatch(declaration, /Georgia|Times|serif\b(?<!sans-serif)|monospace|Anonymous|Kalam|Caveat|Jost|Plus Jakarta/i, `${path}: ${declaration}`);
    }
  }

  // Agreed exceptions: the handwritten "Semua bisa jalan!" note (Kalam, gradient ink)
  // and the Lora titles on the B2B pages. Everything else is DM Sans.
  const heroNote = read("components/website/clean/home/HeroChalkNote.tsx");
  assert.match(heroNote, /Kalam/);
  assert.match(heroNote, /<linearGradient id="sundaf-hero-note-ink"/);
  assert.match(heroNote, /fill="url\(#sundaf-hero-note-ink\)"/);
  assert.match(heroNote, /<span className="sr-only">Semua bisa jalan!<\/span>/);

  const fonts = read("lib/fonts.ts");
  assert.match(fonts, /import \{ Lora \} from "next\/font\/google"/);

  for (const path of ["app/not-found.tsx", "app/~offline/page.tsx", "app/b2b-russia-catalog/page.tsx"]) {
    assert.match(read(path), /public-dm-sans/, path);
  }

  const globals = read("app/globals.css");
  const phoneBody = globals.match(/@media \(max-width: 767px\) \{\s*body \{([^}]+)\}/)?.[1] ?? "";
  assert.match(phoneBody, /font-family: var\(--site-font-family,/);
});

test("homepage motion stays optional and calm", () => {
  const reveal = read("components/website/clean/ScrollReveal.tsx");
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

test("photos and catalog tiles use no dashed lines", () => {
  for (const path of ["components/website/clean/home/CleanHome.module.css", "components/website/clean/CleanSite.module.css"]) {
    assert.doesNotMatch(read(path), /dashed/, path);
  }
});
