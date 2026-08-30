import assert from "node:assert/strict";
import test from "node:test";
import { FAQ_SECTIONS, faqAnswerText } from "../lib/faq-content";
import { resolveGeneralFaqSections } from "../lib/faq-cms";

const template = FAQ_SECTIONS[0];
const row = { id: "cms-question", section: template.title, question: template.items[0].question, answer: faqAnswerText(template.items[0]), active: true, order: 0 };

test("reviewed FAQ remains unchanged until deliberate CMS activation", () => {
  assert.deepEqual(resolveGeneralFaqSections("default", [row]), FAQ_SECTIONS);
  assert.deepEqual(resolveGeneralFaqSections(undefined, []), FAQ_SECTIONS);
});

test("CMS ownership honors hidden and deleted FAQ without resurrecting defaults", () => {
  assert.deepEqual(resolveGeneralFaqSections("cms", []), []);
  assert.deepEqual(resolveGeneralFaqSections("cms", [{ ...row, active: false }]), []);
});

test("CMS FAQ preserves section metadata, paragraphs and links from existing seed", () => {
  const result = resolveGeneralFaqSections("cms", [row]);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, template.id);
  assert.equal(result[0].description, template.description);
  assert.deepEqual(result[0].items[0].answer, template.items[0].answer);
  assert.deepEqual(result[0].items[0].relatedLinks, template.items[0].relatedLinks);
});

test("CMS HTML is sanitized and has readable schema/search text", () => {
  const result = resolveGeneralFaqSections("cms", [{ ...row, section: "Custom section", question: "Custom question", answer: '<p>Satu &amp; dua.</p><ul><li>Tiga</li></ul><script>alert(1)</script><a href="javascript:alert(1)">Unsafe</a>' }]);
  assert.equal(result[0].title, "Custom section");
  assert.match(result[0].items[0].answer.join(" "), /Satu & dua/);
  assert.doesNotMatch(result[0].items[0].answerHtml ?? "", /script|javascript:|alert\(1\)/);
});

test("all CMS sections and numeric order remain reachable", () => {
  const result = resolveGeneralFaqSections("cms", [
    { ...row, id: "later", question: "Later", order: 2 },
    { ...row, id: "first", question: "First", order: 1 },
    { ...row, id: "legacy", section: "Di Lapangan", question: "Legacy" },
  ]);
  assert.deepEqual(result[0].items.map((item) => item.question), ["First", "Later"]);
  assert.ok(result.some((section) => section.id === "selama-perjalanan"));
});

test("editing seeded prose does not duplicate its existing related-link paragraph", () => {
  const result = resolveGeneralFaqSections("cms", [{ ...row, answer: row.answer.replace("Sundaf Trip adalah", "Sundaf Trip merupakan") }]);
  assert.equal(faqAnswerText(result[0].items[0]).match(/Terkait:/g)?.length, 1);
});

test("duplicate questions still have separate stable CMS IDs", () => {
  const result = resolveGeneralFaqSections("cms", [row, { ...row, id: "second-row" }]);
  assert.deepEqual(result[0].items.map((item) => item.id), ["cms-question", "second-row"]);
});
