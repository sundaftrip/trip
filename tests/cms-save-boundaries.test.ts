import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("editors use checked responses and always release saving state", () => {
  for (const file of ["components/admin/TextsForm.tsx", "app/admin/settings/page.tsx", "app/admin/about/page.tsx", "app/admin/terms/page.tsx", "app/admin/faq/page.tsx"]) {
    const content = source(file);
    assert.match(content, /await requestCmsJson/, file);
    assert.match(content, /catch \(error\)/, file);
    assert.match(content, /finally\s*\{\s*setSaving(?:All)?\(false\)/, file);
    assert.match(content, /role="alert"/, file);
    assert.doesNotMatch(content, /await fetch\(/, file);
  }
});

test("settings, about, and terms cannot overwrite data before successful hydration", () => {
  assert.match(source("app/admin/settings/page.tsx"), /if \(!loaded \|\| saving \|\| uploading\) return/);
  assert.match(source("app/admin/settings/page.tsx"), /body: JSON\.stringify\(changes\)/);
  assert.doesNotMatch(source("app/admin/settings/page.tsx"), /body: JSON\.stringify\(data\)/);
  assert.match(source("app/admin/about/page.tsx"), /if \(!loaded \|\| savingAll \|\| !dirty\) return/);
  assert.match(source("app/admin/terms/page.tsx"), /if \(!ready \|\| saving\) return/);
  assert.doesNotMatch(source("app/admin/about/page.tsx"), /1500\+ traveler/);
});

test("new FAQ source and reorder endpoints retain existing text-edit authority", () => {
  for (const file of ["app/api/faq/source/route.ts", "app/api/faq/reorder/route.ts"]) {
    const content = source(file);
    const put = content.slice(content.indexOf("export async function PUT"));
    assert.ok(put.indexOf('checkPermission(session, "text_edit")') < put.indexOf("prisma."), file);
    assert.match(put, /status: 403/);
  }
  assert.match(source("app/api/faq/reorder/route.ts"), /await prisma\.\$transaction/);
  assert.match(source("app/admin/faq/page.tsx"), /if \(busy \|\| adding \|\| editing\) return/);
});

test("FAQ body and JSON-LD use exactly the same selected source", () => {
  const page = source("app/(website)/faq/page.tsx");
  assert.match(page, /mainEntity: sections\.flatMap/);
  assert.match(page, /sections=\{sections\}/);
  assert.match(page, /resolveGeneralFaqSections\(sourceRow\?\.value, faqRows\)/);
});

test("finder options use all eligible catalogs without increasing the displayed rail", () => {
  const page = source("app/(website)/page.tsx");
  const home = source("components/website/clean/CleanHome.tsx");
  assert.match(page, /tours=\{tours\.slice\(0, 9\)\}/);
  assert.match(page, /finderTours=\{tours\}/);
  assert.match(home, /getDestinationOptions\(finderTours\)/);
  assert.match(home, /getMonthOptions\(finderTours\)/);
});
