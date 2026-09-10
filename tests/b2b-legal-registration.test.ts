import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readSource(relativePath: string) {
  return readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

test("B2B page presents verified OSS and DJP registration summaries", () => {
  const source = readSource("components/website/B2BLandTour.tsx");

  assert.match(source, /1601260060842/);
  assert.match(source, /79111 - Aktivitas Agen Perjalanan Wisata/);
  assert.match(source, /S-00268\/SKT-WP-CT\/KPP\.0401\/2026/);
  assert.doesNotMatch(source, /Status penerbitan|Terbit - Risiko rendah/);
  assert.doesNotMatch(source, /Tanggal terbit|16 Januari 2026/);
  assert.doesNotMatch(source, /Terdaftar sejak|10 Januari 2026/);
});

test("legal registration section is limited to B2B and excluded from partner", () => {
  const component = readSource("components/website/B2BLandTour.tsx");
  const b2bPage = readSource("app/(website)/b2b/page.tsx");
  const partnerPage = readSource("app/(website)/partner/page.tsx");

  assert.match(component, /\{!withCofounder \? \(/);
  assert.match(b2bPage, /<B2BLandTour language=/);
  assert.match(partnerPage, /<B2BLandTour withCofounder \/>/);
});

test("only the NIB business-registration PDF is publicly accessible", () => {
  const source = readSource("components/website/B2BLandTour.tsx");
  const nibPdf = path.join(repositoryRoot, "public/legal/nib-cv-sundaf-holiday-group.pdf");

  assert.equal(existsSync(nibPdf), true);
  assert.equal(readFileSync(nibPdf).subarray(0, 5).toString(), "%PDF-");
  assert.match(source, /\/legal\/nib-cv-sundaf-holiday-group\.pdf/);

  assert.equal(existsSync(path.join(repositoryRoot, "public/legal/skt-sundaf-holiday-group.pdf")), false);
  assert.doesNotMatch(source, /\/legal\/skt[^"']*\.pdf/i);
});
