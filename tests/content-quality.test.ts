import assert from "node:assert/strict";
import test from "node:test";
import {
  assessGeneratedContent,
  normalizeGeneratedDraftFields,
  normalizeGeneratedDraftText,
} from "../lib/content-quality";

const longSource = Array.from({ length: 500 }, (_, index) => `sumber${index}`).join(" ");
const longBody = `<p>${Array.from({ length: 500 }, (_, index) => `kata${index}`).join(" ")}</p>`;

test("quality gate catches em dash entities before draft save", () => {
  const report = assessGeneratedContent({
    title: "Judul aman",
    excerpt: "Ringkasan aman",
    body: `${longBody}<p>Bagian tambahan &mdash; masih bermasalah.</p>`,
    sourceContent: longSource,
  });

  assert.equal(report.ok, false);
  assert.ok(report.issues.includes("Draft masih memakai em dash."));
});

test("generated draft normalization removes em dash variants", () => {
  const draft = normalizeGeneratedDraftFields({
    title: "Rute pagi \u2014 catatan praktis",
    excerpt: "Pembuka &mdash; ringkas.",
    category: "Tips &#8212; Travel",
    body: "<p>Bagian A &#x2014; bagian B.</p>",
    imageKeywords: "moscow \u2014 winter",
  });

  const normalizedText = [
    draft.title,
    draft.excerpt,
    draft.category,
    draft.body,
    draft.imageKeywords,
    normalizeGeneratedDraftText("A &mdash; B"),
  ].join("\n");

  assert.doesNotMatch(normalizedText, /\u2014|&mdash;|&#8212;|&#x2014;/i);
  assert.match(draft.title, /Rute pagi, catatan praktis/);
});
