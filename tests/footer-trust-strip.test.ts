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
