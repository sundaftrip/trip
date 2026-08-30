import assert from "node:assert/strict";
import test from "node:test";
import { changedValues, requestCmsJson } from "../lib/cms-request";
import { ACTIVE_TEXT_SECTIONS, activeTextValues, HOME_TEXT_DEFAULTS } from "../lib/website-texts";

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
  const edited = { ...resolved, home_faq_1_question: { id: "Edited question" } };
  assert.deepEqual(Object.keys(changedValues(edited, resolved)), ["home_faq_1_question"]);
});
