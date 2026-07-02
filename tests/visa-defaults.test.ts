import assert from "node:assert/strict";
import test from "node:test";

import { visaDefaultsForCountry } from "../lib/visa-defaults";

const answers = (params: Parameters<typeof visaDefaultsForCountry>[0]) =>
  visaDefaultsForCountry(params).faqs.map((faq) => `${faq.question}\n${faq.answer}`).join("\n\n");

test("United States visa FAQ mentions DS-160, interview, and biometrics", () => {
  const text = answers({
    category: "wajib",
    countryName: "Amerika Serikat",
    countryEnglishName: "United States",
    region: "Amerika",
    stay: "Maks. 6 bulan (B1/B2)",
    officialFee: "USD 185 untuk visa visitor B1/B2",
    servicePrice: "Rp 4.300.000",
    processTime: "3-5 hari kerja",
    conditions: ["Appointment dan DS-160 dilakukan melalui jalur resmi"],
    notes: "Paspor biasa Indonesia perlu visa B1/B2 untuk wisata/bisnis singkat. Wawancara dan keputusan akhir mengikuti Kedutaan/Konsulat AS.",
  });

  assert.match(text, /DS-160/);
  assert.match(text, /MRV/);
  assert.match(text, /wawancara/i);
  assert.match(text, /biometrik|sidik jari/i);
  assert.doesNotMatch(text, /Tergantung negara/);
});

test("Schengen visa FAQ explains appointment and fingerprint biometrics", () => {
  const text = answers({
    category: "wajib",
    countryName: "Norwegia",
    countryEnglishName: "Norway",
    region: "Eropa Schengen",
    stay: "Maks. 90 hari/180 hari",
    officialFee: "EUR 90 untuk visa Schengen short-stay dewasa",
    servicePrice: "Rp 3.500.000",
    processTime: "1-3 minggu",
    conditions: ["WNI pemegang paspor biasa perlu visa Schengen untuk kunjungan singkat"],
    notes: "Visa Schengen short-stay berlaku maksimal 90 hari dalam periode 180 hari.",
  });

  assert.match(text, /Schengen/);
  assert.match(text, /appointment/i);
  assert.match(text, /biometrik sidik jari/i);
  assert.match(text, /setelah submit\/biometrik/);
  assert.doesNotMatch(text, /Tergantung negara/);
});

test("biometric country data triggers a non-generic biometric FAQ", () => {
  const text = answers({
    category: "wajib",
    countryName: "Contoh",
    region: "Asia",
    conditions: ["Biometrik dilakukan di VAC/VFS jika diminta"],
  });

  assert.match(text, /biometrik/i);
  assert.match(text, /VAC\/VFS/);
  assert.doesNotMatch(text, /Tergantung negara/);
});
