import assert from "node:assert/strict";
import test from "node:test";
import { getHomeFaqs } from "../lib/home-faqs";

test("homepage FAQs keep each answer aligned with its question", () => {
  const items = getHomeFaqs("123456789", "CV Uji Sundaf");

  assert.equal(items.length, 5);
  assert.match(items[0].question, /resmi/i);
  assert.match(items[0].answer, /CV Uji Sundaf/);
  assert.match(items[0].answer, /123456789/);
  assert.doesNotMatch(items[0].answer, /Kazakhstan|Uzbekistan|Kyrgyzstan|Tajikistan|KBRI/i);
  assert.match(items[2].question, /harga/i);
  assert.match(items[2].answer, /biaya wajib/i);
  assert.match(items[3].question, /visa/i);
  assert.match(items[3].answer, /tidak dapat dijanjikan/i);
});

test("homepage FAQs use unique questions", () => {
  const questions = getHomeFaqs("123", "CV Uji").map((item) => item.question);
  assert.equal(new Set(questions).size, questions.length);
});
