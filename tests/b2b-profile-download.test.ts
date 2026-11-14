import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";
import { b2bProfilePdfHref, B2B_PROFILE_REVISION } from "../lib/b2b-profile";

test("B2B downloads match the selected language and point to published PDFs", () => {
  const expected = { id: "/sundaftrip-company-profile-id.pdf", en: "/sundaftrip-company-profile.pdf", ru: "/sundaftrip-company-profile-ru.pdf" };
  for (const language of ["id", "en", "ru"] as const) {
    const url = new URL(b2bProfilePdfHref(language), "https://sundaftrip.com");
    assert.equal(url.pathname, expected[language]);
    assert.equal(url.searchParams.get("v"), B2B_PROFILE_REVISION);
    const pdf = readFileSync(new URL(`../public${url.pathname}`, import.meta.url));
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    assert.ok(pdf.length < 2_000_000, "brochure should remain practical to download on mobile");
  }
});

test("partner downloads retain Billy's own brochure in every language", () => {
  for (const language of ["id", "en", "ru"] as const) {
    assert.equal(b2bProfilePdfHref(language, true), "/sundaftrip-company-profile-billy.pdf");
  }
});

test("the shared B2B content has complete translations and valid local photo assets", () => {
  const profile = JSON.parse(readFileSync(new URL("../lib/b2b-profile-content.json", import.meta.url), "utf8"));
  function check(value: unknown) {
    if (!value || typeof value !== "object") return;
    const item = value as Record<string, unknown>;
    if ("id" in item || "en" in item || "ru" in item) {
      for (const lang of ["id", "en", "ru"]) assert.ok(typeof item[lang] === "string" && (item[lang] as string).length > 0);
    }
    for (const child of Object.values(item)) check(child);
  }
  check(profile);
  assert.ok(existsSync(new URL(`../public${profile.FERDIANSAH_USA_PROOF.src}`, import.meta.url)));
  assert.ok(existsSync(new URL(`../public${profile.BILLY.photo}`, import.meta.url)));
});
