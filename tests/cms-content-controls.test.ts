import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { changedValues, requestCmsJson } from "../lib/cms-request";
import { ACTIVE_TEXT_SECTIONS, activeTextValues, CONTACT_TEXT_DEFAULTS, getContactHeroText, HOME_TEXT_DEFAULTS, LEGACY_TEXT_SECTIONS, TEXT_LABELS, type WebsiteTextValue } from "../lib/website-texts";

test("CMS sends only edited settings, including deliberate clearing", () => {
  const previous = { company_name: "Before", site_theme: "atlas", company_email: "old@example.test" };
  assert.deepEqual(changedValues({ ...previous, company_name: "After", company_email: "" }, previous), {
    company_name: "After", company_email: "",
  });
  assert.deepEqual(changedValues(previous, previous), {});
});

test("CMS nested language values compare by content, not object identity", () => {
  assert.deepEqual(changedValues({ title: { id: "Same", en: "Same" } }, { title: { id: "Same", en: "Same" } }), {});
});

test("company-only edits never resend reserved FAQ mode or locked design settings", () => {
  const loaded = { faq_general_source: "cms", site_theme: "atlas", color_scheme: "sundaf", color_accent: "#075D63", company_name: "Before" };
  assert.deepEqual(changedValues({ ...loaded, company_name: "After" }, loaded), { company_name: "After" });
});

test("CMS request rejects HTTP errors and HTML login/error pages", async () => {
  await assert.rejects(requestCmsJson("/synthetic", {}, async () => new Response(JSON.stringify({ error: "Tidak memiliki izin" }), { status: 403 })), /Tidak memiliki izin/);
  await assert.rejects(requestCmsJson("/synthetic", {}, async () => new Response("<html>Login</html>")), /Respons server/);
  await assert.rejects(requestCmsJson("/synthetic", {}, async () => { throw new Error("Network unavailable"); }), /Network unavailable/);
  assert.deepEqual(await requestCmsJson("/synthetic", {}, async () => Response.json({ success: true })), { success: true });
});

test("active homepage controls match the current template and preserve default copy", () => {
  const keys = ACTIVE_TEXT_SECTIONS.flatMap((section) => section.keys);
  for (const key of ["home_hero_title", "home_hero_body", "home_hero_image", "home_benefit_1_title", "home_footer_tagline"]) {
    assert.ok(keys.includes(key), key);
  }
  const resolved = activeTextValues({ hero_title: { id: "Retired theme title" }, why_1_title: { id: "Old benefit" } });
  assert.equal(resolved.home_hero_title.id, HOME_TEXT_DEFAULTS.home_hero_title);
  assert.equal(resolved.home_benefit_1_title.id, HOME_TEXT_DEFAULTS.home_benefit_1_title);
  assert.equal(activeTextValues({ home_hero_title: { id: "Deliberate edit" } }).home_hero_title.id, "Deliberate edit");
});

test("homepage FAQ defaults follow company identity without freezing an untouched answer", () => {
  const resolved = activeTextValues({}, { company_nib: "TEST-123", company_legal_name: "Synthetic Travel" });
  assert.match(resolved.home_faq_1_answer.id ?? "", /Synthetic Travel/);
  assert.match(resolved.home_faq_1_answer.id ?? "", /TEST-123/);
  const edited: Record<string, WebsiteTextValue> = { ...resolved, home_faq_1_question: { id: "Edited question" } };
  assert.deepEqual(Object.keys(changedValues(edited, resolved)), ["home_faq_1_question"]);
});

test("contact controls edit visible hero copy without activating legacy seed text", () => {
  const keys = ACTIVE_TEXT_SECTIONS.flatMap((section) => section.keys);
  for (const key of ["contact_hero_eyebrow", "contact_hero_title", "contact_hero_body"]) assert.ok(keys.includes(key), key);
  for (const key of ["contact_title", "contact_desc"]) {
    assert.ok(!keys.includes(key), key);
    assert.ok(LEGACY_TEXT_SECTIONS.some((section) => section.keys.includes(key)), key);
  }
  assert.match(TEXT_LABELS.contact_title, /pembaca layar/);
  const legacy = { contact_title: { id: "Old title" }, contact_desc: { id: "Old paragraph" } };
  const currentCopy = {
    eyebrow: "Kontak resmi",
    title: "Hubungi Sundaf Trip",
    body: "Konsultasi paket tour, custom trip, dokumen visa, dan kebutuhan perjalanan lain lewat kanal resmi Sundaf Trip.",
  };
  assert.deepEqual(getContactHeroText(legacy), currentCopy);
  const adminValues = activeTextValues(legacy);
  assert.deepEqual(getContactHeroText(adminValues), currentCopy);
  for (const [key, value] of Object.entries(CONTACT_TEXT_DEFAULTS)) assert.equal(adminValues[key].id, value);

  const edited: Record<string, WebsiteTextValue> = {
    ...adminValues,
    contact_hero_eyebrow: { id: "Official contact" },
    contact_hero_title: { id: "Contact our team" },
    contact_hero_body: { id: "A deliberate CMS paragraph." },
  };
  assert.deepEqual(Object.keys(changedValues(edited, adminValues)).sort(), Object.keys(CONTACT_TEXT_DEFAULTS).sort());
  assert.deepEqual(getContactHeroText(edited), { eyebrow: "Official contact", title: "Contact our team", body: "A deliberate CMS paragraph." });
  assert.deepEqual(getContactHeroText({ contact_hero_eyebrow: { id: " " }, contact_hero_title: { id: "" } }), currentCopy);
});

test("the public contact hero renders the same resolver exposed by CMS", () => {
  const page = readFileSync(new URL("../app/(website)/contact/page.tsx", import.meta.url), "utf8");
  assert.match(page, /const hero = getContactHeroText\(texts\)/);
  for (const field of ["eyebrow", "title", "body"]) assert.ok(page.includes(`{hero.${field}}`), field);
  assert.match(page, /<ContactSection texts=\{texts\} company=\{company\} theme=\{theme\}/);
});
