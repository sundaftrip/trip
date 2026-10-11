import assert from "node:assert/strict";
import test from "node:test";
import { getHomeFaqs } from "../lib/home-faqs";
import { SUNDAF_TRANSFER_ACCOUNT, SUNDAF_TRANSFER_INSTRUCTIONS } from "../lib/company-transfer";
import { reviewedEnglishFor } from "../lib/reviewed-english-copy";

test("homepage FAQs keep each answer aligned with its question", () => {
  const items = getHomeFaqs("123456789", "CV Uji Sundaf");

  assert.equal(items.length, 5);
  assert.match(items[0].question, /resmi/i);
  assert.match(items[0].answer, /CV Uji Sundaf/);
  assert.match(items[0].answer, /123456789/);
  assert.doesNotMatch(items[0].answer, /Kazakhstan|Uzbekistan|Kyrgyzstan|Tajikistan|KBRI/i);
  assert.match(items[1].question, /pembayaran.*rekening/i);
  assert.ok(items[1].answer.startsWith(SUNDAF_TRANSFER_INSTRUCTIONS.id));
  assert.match(items[1].answer, /tidak menggunakan rekening bank lain/i);
  assert.match(items[1].answer, /kontak resmi Sundaf Trip sebelum membayar/i);
  assert.match(items[2].question, /harga/i);
  assert.match(items[2].answer, /biaya wajib/i);
  assert.match(items[3].question, /visa/i);
  assert.match(items[3].answer, /tidak dapat dijanjikan/i);
});

test("homepage FAQs use unique questions", () => {
  const questions = getHomeFaqs("123", "CV Uji").map((item) => item.question);
  assert.equal(new Set(questions).size, questions.length);
});

test("payment FAQ has reviewed English copy with the same receiving account", () => {
  const payment = getHomeFaqs("123", "CV Uji")[1];
  const english = reviewedEnglishFor(payment.answer);

  assert.ok(reviewedEnglishFor(payment.question));
  assert.ok(english);
  assert.ok(english.startsWith(SUNDAF_TRANSFER_INSTRUCTIONS.en));
  assert.ok(english.includes(SUNDAF_TRANSFER_ACCOUNT.bank));
  assert.ok(english.includes(SUNDAF_TRANSFER_ACCOUNT.number));
  assert.ok(english.includes(SUNDAF_TRANSFER_ACCOUNT.holder));
  assert.match(english, /does not use any other bank account/i);
});
