import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readSource(relativePath: string) {
  return readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

test("the partner page and its company profile point to the partner inbox", () => {
  for (const file of [
    "components/website/B2BLandTour.tsx",
    "components/website/FooterContactList.tsx",
    "company-profile/generate_company_profile.py",
  ]) {
    const source = readSource(file);
    assert.match(source, /partner@sundaftrip\.com/, `${file} should use partner@sundaftrip.com`);
    assert.doesNotMatch(source, /@gmail\.com/, `${file} should not show a personal Gmail address`);
  }
});

test("footer closes with the Semua bisa jalan tagline and its English copy", () => {
  assert.match(readSource("components/website/clean/CleanFooter.tsx"), /<span>Semua bisa jalan\.<\/span>/);
  assert.match(readSource("lib/reviewed-english-copy.ts"), /"Semua bisa jalan\.": "Everyone can travel\."/);
});
