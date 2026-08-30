import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const home = readFileSync(
  new URL("../components/website/clean/CleanHome.tsx", import.meta.url),
  "utf8",
);
const form = readFileSync(
  new URL("../components/website/clean/home/HomeSearchForm.tsx", import.meta.url),
  "utf8",
);
const styles = readFileSync(
  new URL("../components/website/clean/home/CleanHome.module.css", import.meta.url),
  "utf8",
);

test("removes only the redundant contact and legal strip below the finder", () => {
  assert.doesNotMatch(home, /finderMeta|legalProof|Belum yakin\? Tanya rute via WhatsApp\./);
  assert.doesNotMatch(styles, /\.finderMeta\b|\.legalProof\b/);
  assert.match(home, /getHomeFaqs\(nib, legalName\)/);
  assert.match(home, /data-analytics-placement="home-final"/);
  assert.match(home, /Konsultasi rute via WhatsApp/);
  assert.match(home, /<HomeSearchForm\s+destinations=\{destinationOptions\}\s+months=\{monthOptions\}/);
});

test("keeps the native destination and month search without decorative icons", () => {
  assert.match(form, /action="\/tours"\s+method="get"\s+onSubmit=\{submitSearch\}/);
  assert.match(form, /aria-label="Cari rute yang pas"/);
  assert.equal(form.match(/<label className=\{styles\.finderField\}>/g)?.length, 2);
  assert.match(form, /<small>TUJUAN<\/small>\s*<select name="destination" defaultValue="all">/);
  assert.match(form, /<small>WAKTU BERANGKAT<\/small>\s*<select name="month" defaultValue="all">/);
  assert.match(form, /<option value="all">Semua destinasi<\/option>/);
  assert.match(form, /<option value="all">Semua bulan<\/option>/);
  assert.match(form, /value=\{destination\.value\}/);
  assert.match(form, /value=\{month\.value\}/);
  assert.match(form, /<button type="submit">\s*Lihat perjalanan\s*<\/button>/);
  assert.doesNotMatch(form, /lucide-react|<MapPin|<CalendarDays|<Search/);
});

test("preserves campaign attribution and native GET submission", () => {
  assert.match(form, /new FormData\(event\.currentTarget\)/);
  assert.match(form, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(form, /startsWith\("utm_"\)/);
  assert.match(form, /event\.currentTarget\.appendChild\(input\)/);
  assert.match(form, /trackSundafEvent\("home_search_submit"/);
  assert.doesNotMatch(form, /preventDefault|router\.(?:push|replace)|scrollTo/);
});

test("uses unboxed fields with visible focus and comfortable touch targets", () => {
  const field = styles.match(/\.finderField\s*\{([^}]+)\}/)?.[1];
  const select = styles.match(/\.finderField select\s*\{([^}]+)\}/)?.[1];
  const button = styles.match(/\.finderCard > button\s*\{([^}]+)\}/)?.[1];
  assert.ok(field);
  assert.ok(select);
  assert.ok(button);
  assert.match(field, /border:\s*0;/);
  assert.match(field, /border-radius:\s*0(?: !important)?;/);
  assert.match(field, /background:\s*transparent;/);
  assert.match(select, /min-height:\s*44px;/);
  assert.match(button, /min-height:\s*48px;/);
  assert.doesNotMatch(select, /appearance:\s*none/);
  assert.match(styles, /:focus-visible\s*\{[^}]*outline:\s*3px solid/);
});
