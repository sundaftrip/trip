import assert from "node:assert/strict";
import test from "node:test";
import { COMPANY_PROFILE, upgradeCompanyProfile } from "../lib/company-profile";

test("upgrades known legacy copy without replacing a later editorial change", () => {
  const content = {
    ...COMPANY_PROFILE,
    id: "existing-cms-row",
    eyebrow: "Profil perusahaan",
    answer: "Sundaf Trip menyediakan open trip, perjalanan privat, dan bantuan visa untuk wisatawan Indonesia, dengan fokus Rusia, Asia Tengah, dan aurora.",
    secondaryCtaLabel: "Hubungi penanggung jawab",
    secondaryCtaHref: "/contact",
    published: false,
  };
  const upgraded = upgradeCompanyProfile(content);
  assert.equal(upgraded.answer, COMPANY_PROFILE.answer);
  assert.equal(upgraded.eyebrow, COMPANY_PROFILE.eyebrow);
  assert.equal(upgraded.secondaryCtaHref, "/contact");
  assert.equal(upgraded.secondaryCtaLabel, "Hubungi penanggung jawab");
  assert.equal(upgraded.id, content.id);
  assert.equal(upgraded.published, false);
  assert.notEqual(content.answer, upgraded.answer, "must not mutate the database row in memory");
});

test("retains custom CMS sections and FAQs without injecting a spelling FAQ", () => {
  const content = {
    ...COMPANY_PROFILE,
    sections: [{ title: "Pertanyaan khusus", body: "Jawaban dari tim Sundaf." }],
    faqs: [{ question: "Bagaimana jadwal konsultasi?", answer: "Hubungi tim untuk janji temu." }],
  };
  assert.deepEqual(upgradeCompanyProfile(content), content);
});

test("matches a known legacy FAQ revision regardless of JSON property order", () => {
  const content = {
    ...COMPANY_PROFILE,
    faqs: [
      { answer: "Tersedia open trip dengan jadwal tetap, perjalanan privat sesuai kebutuhan kelompok, dan bantuan pengajuan visa.", question: "Layanan apa yang tersedia?" },
      { answer: "Buka https://sundaftrip.com/tours untuk melihat tanggal keberangkatan, rute, harga paket, dan biaya wajib. Tim mengonfirmasi ketersediaan sebelum pemesanan.", question: "Bagaimana melihat jadwal dan harga?" },
      { answer: "Ya. Informasi layanan, dokumen, dan biaya tersedia di https://sundaftrip.com/visa/russia.", question: "Apakah Sundaf Trip membantu visa Rusia?" },
      { answer: "Hubungi WhatsApp +62 817-7520-2759 atau email info@sundaftrip.com. Informasi kantor dan kontak tersedia di https://sundaftrip.com/contact.", question: "Bagaimana menghubungi Sundaf Trip?" },
    ],
  };
  assert.deepEqual(upgradeCompanyProfile(content).faqs, COMPANY_PROFILE.faqs);
});

test("does not upgrade another GEO page that shares old profile copy", () => {
  const content = { ...COMPANY_PROFILE, routePath: "/other-page", eyebrow: "Profil perusahaan" };
  assert.equal(upgradeCompanyProfile(content), content);
});

test("the content upgrade is idempotent", () => {
  const upgraded = upgradeCompanyProfile({ ...COMPANY_PROFILE, eyebrow: "Profil perusahaan" });
  assert.deepEqual(upgradeCompanyProfile(upgraded), upgraded);
});
