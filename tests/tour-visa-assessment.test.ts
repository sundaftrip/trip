import assert from "node:assert/strict";
import test from "node:test";
import { assessTourVisas, type VisaAssessmentRecord } from "../lib/tour-visa-assessment";
import type { TourVisaPlan } from "../lib/tour-visa-plan";

const now = new Date("2026-08-31T12:00:00.000Z");
function record(id: string, name: string, visa = "wajib", extra: Partial<VisaAssessmentRecord> = {}): VisaAssessmentRecord {
  return { id, name, en: name, visa, region: "Test region", stay: "30 hari", servicePrice: "Rp 1.000.000", sourceUrl: "https://immigration.example.test/rules", lastVerifiedAt: "2026-08-20T00:00:00.000Z", conditions: [], eligibility: [], variants: [], ...extra };
}
function plan(...destinations: Array<string | TourVisaPlan["destinations"][number]>): TourVisaPlan {
  return { version: 1, passportCountry: "ID", passportType: "ordinary", purpose: "tourism", destinations: destinations.map((country) => typeof country === "string" ? { countryId: country, stayDays: 3, kind: "visit", service: "offer" } : country) };
}
const brazil = record("br", "Brasil", "bebas", { en: "Brazil" });
const peru = record("pe", "Peru");
const colombia = record("co", "Kolombia", "bebas", { en: "Colombia" });
const france = record("fr", "Prancis", "wajib", { en: "France", region: "Eropa Schengen" });
const netherlands = record("nl", "Belanda", "wajib", { en: "Netherlands", region: "Eropa Schengen", servicePrice: "Rp 900.000" });

test("hypothetical Peru-only requirement creates exactly one relevant service", () => {
  const result = assessTourVisas({ plan: plan("br", "pe", "co") }, [brazil, peru, colombia], now);
  assert.deepEqual(result.countries.map((country) => country.status), ["visa_free", "required", "visa_free"]);
  assert.deepEqual(result.offers.map((offer) => offer.id), ["visa-peru"]);
  assert.equal(result.offers[0].price, 1_000_000);
  assert.deepEqual(result.offers[0].countryIds, ["pe"]);
  assert.deepEqual(result.issues, []);
  assert.equal(result.legacy, false);
});

test("legacy country matching is exact and never uses themes, cities or titles", () => {
  const input = { country: "Vietnam", title: "Vietnam dan Desa Prancis", cityHighlight: "France", itinerary: [{ title: "Peru" }] };
  const result = assessTourVisas(input, [record("vn", "Vietnam", "bebas"), france, peru], now);
  assert.deepEqual(result.offers, []);
  assert.deepEqual(result.countries.map((country) => country.id), ["vn"]);
  assert.equal(result.legacy, true);
  const broad = assessTourVisas({ country: "Amerika Latin" }, [brazil, peru, colombia], now);
  assert.deepEqual(broad.offers, []);
  assert.equal(broad.countries[0].status, "unknown");
  assert.ok(broad.issues.length);
});

test("legacy full country tokens permit exact bilingual countries but reject substrings", () => {
  const result = assessTourVisas({ country: "Brazil, Peru dan Kolombia" }, [brazil, peru, colombia], now);
  assert.deepEqual(result.countries.map((country) => country.id), ["br", "pe", "co"]);
  assert.deepEqual(result.offers.map((offer) => offer.id), ["visa-peru"]);
  assert.equal(assessTourVisas({ country: "Northern Peru" }, [peru], now).countries[0].status, "unknown");
  assert.deepEqual(assessTourVisas({ country: "Prancis" , plan: plan("pe") }, [france, peru], now).offers.map((offer) => offer.id), ["visa-peru"]);
});

test("missing country IDs and empty destinations produce visible review issues", () => {
  for (const input of [{ plan: plan("missing") }, {}, { country: "" }, { plan: { ...plan("pe"), destinations: [] } }]) {
    const result = assessTourVisas(input, [peru], now);
    assert.deepEqual(result.offers, []);
    assert.ok(result.issues.length);
    assert.ok(result.summary.length);
  }
});

test("required visa without price stays visible as consultation", () => {
  const result = assessTourVisas({ plan: plan("pe") }, [{ ...peru, servicePrice: null }], now);
  assert.equal(result.countries[0].status, "required");
  assert.equal(result.countries[0].serviceState, "consultation");
  assert.deepEqual(result.offers, []);
  assert.ok(result.countries[0].explanation.includes("harga"));
});

test("blank or conditional status never turns into an unconditional priced offer", () => {
  for (const visa of [null, "", "not-in-database", "conditional"]) {
    const result = assessTourVisas({ plan: plan("pe") }, [{ ...peru, visa, conditions: ["Check existing visa"] }], now);
    assert.deepEqual(result.offers, []);
    assert.equal(result.countries[0].status, visa === "conditional" ? "conditional" : "unknown");
    assert.deepEqual(result.countries[0].conditions, ["Check existing visa"]);
    assert.equal(result.countries[0].serviceState, "consultation");
  }
});

test("verification must have a valid source and a current non-future date", () => {
  for (const extra of [
    { sourceUrl: null }, { sourceUrl: "javascript:alert(1)" }, { sourceUrl: "bad" },
    { lastVerifiedAt: null }, { lastVerifiedAt: "bad" }, { lastVerifiedAt: "2026-05-01T00:00:00Z" },
    { lastVerifiedAt: "2027-01-01T00:00:00Z" },
  ]) {
    const result = assessTourVisas({ plan: plan("pe") }, [{ ...peru, ...extra }], now);
    assert.equal(result.countries[0].status, "unknown", JSON.stringify(extra));
    assert.deepEqual(result.offers, []);
    assert.ok(result.issues.length);
  }
  const fresh = assessTourVisas({ plan: plan("pe") }, [{ ...peru, lastVerifiedAt: new Date("2026-08-31T00:00:00Z") }], now);
  assert.equal(fresh.countries[0].checkedAt, "2026-08-31T00:00:00.000Z");
  assert.doesNotThrow(() => JSON.stringify(fresh));
});

test("transit requires review instead of selling the destination tourist visa", () => {
  const result = assessTourVisas({ plan: plan({ countryId: "pe", stayDays: 0, kind: "transit", service: "offer" }) }, [peru], now);
  assert.equal(result.countries[0].status, "conditional");
  assert.equal(result.countries[0].kind, "transit");
  assert.deepEqual(result.offers, []);
  assert.deepEqual(result.issues, []);
  assert.ok(result.warnings.length);
});

test("multiple variants require a deliberate selection even with a headline price", () => {
  const recordWithVariants = { ...peru, variants: [{ id: "single", name: "Single", priceIDR: 2_000_000 }, { id: "multi", name: "Multiple", priceIDR: 4_000_000 }] };
  assert.deepEqual(assessTourVisas({ plan: plan("pe") }, [recordWithVariants], now).offers, []);
  const selected = assessTourVisas({ plan: plan({ ...plan("pe").destinations[0], variantId: "multi" }) }, [recordWithVariants], now);
  assert.equal(selected.offers[0].price, 4_000_000);
  assert.equal(selected.offers[0].variantId, "multi");
  assert.deepEqual(assessTourVisas({ plan: plan({ ...plan("pe").destinations[0], variantId: "missing" }) }, [recordWithVariants], now).offers, []);
});

test("single priced variant is unambiguous but a selected unpriced variant never falls back", () => {
  const single = { ...peru, servicePrice: null, variants: [{ id: "single", name: "Single", priceIDR: 2_000_000, processingTime: "10 days" }] };
  assert.equal(assessTourVisas({ plan: plan("pe") }, [single], now).offers[0].processingTime, "10 days");
  const noPrice = { ...single, servicePrice: "Rp 1.000.000", variants: [{ id: "single", name: "Single", priceIDR: null }] };
  assert.deepEqual(assessTourVisas({ plan: plan({ ...plan("pe").destinations[0], variantId: "single" }) }, [noPrice], now).offers, []);
});

test("Schengen main country follows longest total stay and first visit on ties", () => {
  const destinations = [
    { countryId: "nl", stayDays: 2, kind: "visit" as const, service: "offer" as const },
    { countryId: "fr", stayDays: 5, kind: "visit" as const, service: "offer" as const },
  ];
  const result = assessTourVisas({ plan: plan(...destinations) }, [netherlands, france], now);
  assert.equal(result.offers.length, 1);
  assert.equal(result.offers[0].id, "visa-schengen");
  assert.equal(result.offers[0].href, "/visa/france");
  assert.deepEqual(result.offers[0].countryIds, ["nl", "fr"]);
  const tie = assessTourVisas({ plan: plan("nl", "fr") }, [france, netherlands], now);
  assert.equal(tie.offers[0].href, "/visa/netherlands");
  const repeated = assessTourVisas({ plan: plan(...destinations, { ...destinations[0], stayDays: 4 }) }, [france, netherlands], now);
  assert.equal(repeated.offers[0].href, "/visa/netherlands");
});

test("Schengen cannot fall back to cheaper services or ignore uncertain member data", () => {
  const schengenPlan = plan({ ...plan("fr").destinations[0], stayDays: 5 }, "nl");
  for (const records of [
    [{ ...france, servicePrice: null }, netherlands],
    [france, { ...netherlands, visa: "conditional" }],
    [france, { ...netherlands, lastVerifiedAt: null }],
  ]) assert.deepEqual(assessTourVisas({ plan: schengenPlan }, records, now).offers, []);
  assert.deepEqual(assessTourVisas({ country: "Prancis, Belanda" }, [france, netherlands], now).offers, []);
});

test("included and separately handled visas cannot be added to the total twice", () => {
  for (const service of ["included", "separate", "none"] as const) {
    const result = assessTourVisas({ plan: plan({ ...plan("pe").destinations[0], service }) }, [peru], now);
    assert.deepEqual(result.offers, []);
    assert.equal(result.countries[0].serviceState, service === "none" ? "consultation" : service);
  }
  for (const input of [
    { country: "Peru", inclusions: ["Visa Peru"] },
    { country: "Peru", addOns: [{ name: "Visa Peru", isMandatory: true }] },
    { plan: plan("pe"), inclusions: ["Visa sudah termasuk"] },
  ]) assert.deepEqual(assessTourVisas(input, [peru], now).offers, []);
  const unrelated = assessTourVisas({ country: "Peru", addOns: [{ name: "Visa Kanada", isMandatory: false }] }, [peru, record("ca", "Kanada", "wajib", { en: "Canada" })], now);
  assert.equal(unrelated.offers[0].id, "visa-peru");
  assert.ok(unrelated.warnings.length);
});

test("visa-free duration limits are not ignored and VOA does not sell pre-arranged visas", () => {
  const exceeded = assessTourVisas({ plan: plan({ ...plan("br").destinations[0], stayDays: 31 }) }, [brazil], now);
  assert.equal(exceeded.countries[0].status, "conditional");
  assert.deepEqual(exceeded.offers, []);
  const voa = assessTourVisas({ plan: plan("pe") }, [{ ...peru, visa: "voa" }], now);
  assert.equal(voa.countries[0].status, "visa_on_arrival");
  assert.equal(voa.countries[0].serviceState, "not_needed");
  assert.deepEqual(voa.offers, []);
  const evisa = assessTourVisas({ plan: plan("pe") }, [{ ...peru, visa: "evisa" }], now);
  assert.equal(evisa.countries[0].status, "evisa");
  assert.equal(evisa.offers.length, 1);
});

test("fingerprint is deterministic, ignores record order and review stamps, and tracks relevant changes", () => {
  const input = { plan: plan("br", "pe") };
  const base = assessTourVisas(input, [brazil, peru], now).fingerprint;
  assert.equal(assessTourVisas({ plan: { ...input.plan, review: { at: now.toISOString(), fingerprint: base } } }, [peru, brazil], now).fingerprint, base);
  assert.equal(assessTourVisas(input, [brazil, peru, colombia], now).fingerprint, base);
  assert.notEqual(assessTourVisas(input, [brazil, { ...peru, servicePrice: "Rp 2.000.000" }], now).fingerprint, base);
  assert.notEqual(assessTourVisas({ plan: plan("pe", "br") }, [brazil, peru], now).fingerprint, base);
  assert.notEqual(assessTourVisas(input, [brazil, peru], new Date("2027-01-01T00:00:00Z")).fingerprint, base);
});

test("unknown free-stay limits do not become a confirmed visa-free result", () => {
  for (const stay of [null, "", "30 atau 60 hari", "90 hari dalam 180 hari atau sesuai visa"]) {
    const result = assessTourVisas({ plan: plan("br") }, [{ ...brazil, stay }], now);
    assert.equal(result.countries[0].status, "unknown");
    assert.equal(result.countries[0].serviceState, "consultation");
    assert.ok(result.issues.length);
  }
});

test("Schengen cumulative duration and re-entry cannot be mistaken for a simple single stay", () => {
  const longStay = assessTourVisas({ plan: plan({ ...plan("fr").destinations[0], stayDays: 20 }, { ...plan("nl").destinations[0], stayDays: 20 }) }, [france, netherlands], now);
  assert.deepEqual(longStay.offers, []);
  assert.ok(longStay.issues.some((issue) => issue.includes("Schengen")));
  const reentry = assessTourVisas({ plan: plan("fr", "pe", "nl") }, [france, netherlands, peru], now);
  assert.deepEqual(reentry.offers.map((offer) => offer.id), ["visa-peru"]);
  assert.ok(reentry.warnings.some((warning) => warning.includes("entri")));
});

test("a known foreign manual visa is flagged even on a visa-free tour", () => {
  const result = assessTourVisas({ plan: plan("br"), addOns: [{ name: "Visa Prancis", tag: "wajib" }] }, [brazil, france], now);
  assert.deepEqual(result.offers, []);
  assert.ok(result.issues.some((issue) => issue.includes("Visa Prancis")));
});

test("contradictory handling of the same visa requires review", () => {
  const duplicate = assessTourVisas({ plan: plan("pe", { ...plan("pe").destinations[0], service: "included" }) }, [peru], now);
  assert.deepEqual(duplicate.offers, []);
  assert.ok(duplicate.issues.length);
  const schengenMixed = assessTourVisas({ plan: plan("fr", { ...plan("nl").destinations[0], service: "included" }) }, [france, netherlands], now);
  assert.deepEqual(schengenMixed.offers, []);
  assert.ok(schengenMixed.issues.some((issue) => issue.includes("konsisten")));
});

test("required and eVisa rules with missing, ambiguous or exceeded stay limits cannot create priced offers", () => {
  for (const visa of ["wajib", "evisa"]) {
    for (const stay of [null, "", "90 hari dalam 180 hari", "30 atau 60 hari"]) {
      const destination = { ...plan("fr").destinations[0], stayDays: 120 };
      const result = assessTourVisas({ plan: plan(destination) }, [{ ...france, visa, stay }], now);
      assert.deepEqual(result.offers, [], `${visa}: ${stay}`);
      assert.equal(result.countries[0].serviceState, "consultation");
      assert.ok(result.issues.some((issue) => issue.includes("lama tinggal")));
    }
  }
});

test("an included visa cannot also appear as a charged add-on", () => {
  for (const marker of [{ isMandatory: true }, { mandatory: true }, { tag: "wajib" }, { isMandatory: false }]) {
    const result = assessTourVisas({
      plan: plan({ ...plan("fr").destinations[0], service: "included" }),
      inclusions: ["Visa Schengen termasuk"],
      addOns: [{ name: "Visa Schengen", ...marker }],
    }, [france], now);
    assert.deepEqual(result.offers, []);
    assert.equal(result.countries[0].serviceState, "consultation");
    assert.ok(result.issues.some((issue) => issue.includes("termasuk") && issue.includes("biaya")));
  }
});

test("manual coverage conflicts cannot bypass review through explicit service handling", () => {
  for (const service of ["offer", "included", "separate", "none"] as const) {
    const result = assessTourVisas({
      plan: plan({ ...plan("pe").destinations[0], service }),
      inclusions: ["Visa Peru"],
      addOns: [{ name: "Visa Peru", tag: "wajib" }],
    }, [peru], now);
    assert.deepEqual(result.offers, []);
    assert.equal(result.countries[0].serviceState, "consultation");
    assert.ok(result.issues.length);
  }
  const separateButIncluded = assessTourVisas({ plan: plan({ ...plan("pe").destinations[0], service: "separate" }), inclusions: ["Visa Peru"] }, [peru], now);
  assert.ok(separateButIncluded.issues.length);
  const ambiguousIncluded = assessTourVisas({ plan: plan({ ...plan("pe").destinations[0], service: "included" }), addOns: [{ name: "Visa", tag: "wajib" }] }, [peru], now);
  assert.ok(ambiguousIncluded.issues.length);
  const unknownButIncluded = assessTourVisas({ plan: plan({ ...plan("fr").destinations[0], service: "included" }) }, [{ ...france, stay: "90 hari dalam 180 hari atau sesuai visa" }], now);
  assert.equal(unknownButIncluded.countries[0].serviceState, "consultation");
});

test("headline qualifiers, ranges, currencies and prose never become an exact IDR add-on", () => {
  for (const servicePrice of [
    "USD 100", "Proses 7 hari, Rp 2.500.000", "Rp 2.500.000 - Rp 4.000.000",
    "Mulai Rp 2.500.000", "From IDR 2500000", "Rp 2.500.000 per orang",
    "Rp 2,5 juta", "2500000 USD", "Rp 2.500,50", "2.500,000", "-2500000",
  ]) {
    const result = assessTourVisas({ plan: plan("pe") }, [{ ...peru, servicePrice }], now);
    assert.deepEqual(result.offers, [], servicePrice);
    assert.equal(result.countries[0].serviceState, "consultation");
    assert.ok(result.warnings.some((warning) => warning.includes("harga")));
  }
});

test("only exact whole IDR headline amounts or priced variants can be added", () => {
  for (const servicePrice of ["Rp 2.500.000", "IDR 2,500,000", "2500000", "2.500.000", "  Rp2500000  "]) {
    const result = assessTourVisas({ plan: plan("pe") }, [{ ...peru, servicePrice }], now);
    assert.equal(result.offers[0]?.price, 2_500_000, servicePrice);
  }
  const result = assessTourVisas({ plan: plan({ ...plan("pe").destinations[0], variantId: "fixed" }) }, [{ ...peru, servicePrice: "Mulai Rp 2.000.000", variants: [{ id: "fixed", name: "Fixed", priceIDR: 2_750_000 }] }], now);
  assert.equal(result.offers[0]?.price, 2_750_000);
});

test("canonical rolling-window rules preserve required visa service with a prior-stay warning", () => {
  for (const stay of ["90 hari dalam 180 hari", "90 days in 180 days"]) {
    const result = assessTourVisas({ plan: plan({ ...plan("fr").destinations[0], stayDays: 14 }) }, [{ ...france, stay }], now);
    assert.equal(result.countries[0].status, "required");
    assert.equal(result.offers[0]?.id, "visa-schengen");
    assert.deepEqual(result.issues, []);
    assert.ok(result.warnings.some((warning) => warning.includes("180") && warning.includes("sebelumnya")));
    assert.ok(result.countries[0].conditions.some((condition) => condition.includes("90") && condition.includes("180")));
  }
});

test("rolling-window route caps apply to individual and combined Schengen stays", () => {
  const records = [france, netherlands].map((record) => ({ ...record, stay: "90 hari dalam 180 hari" }));
  for (const visaPlan of [plan({ ...plan("fr").destinations[0], stayDays: 120 }), plan({ ...plan("fr").destinations[0], stayDays: 60 }, { ...plan("nl").destinations[0], stayDays: 40 })]) {
    const result = assessTourVisas({ plan: visaPlan }, records, now);
    assert.deepEqual(result.offers, []);
    assert.ok(result.issues.some((issue) => issue.includes("lama tinggal")));
  }
  const malformed = assessTourVisas({ plan: plan("fr") }, [{ ...france, stay: "180 hari dalam 90 hari" }], now);
  assert.equal(malformed.countries[0].status, "unknown");
  assert.ok(malformed.issues.length);
});

test("visa-free rolling windows are conditional until previous stays are checked", () => {
  const result = assessTourVisas({ plan: plan("br") }, [{ ...brazil, stay: "90 hari dalam 180 hari" }], now);
  assert.equal(result.countries[0].status, "conditional");
  assert.equal(result.countries[0].serviceState, "consultation");
  assert.deepEqual(result.offers, []);
  assert.deepEqual(result.issues, []);
  assert.ok(result.countries[0].conditions.length);
});

test("multiple charged country visas in one Schengen group require pricing review", () => {
  const result = assessTourVisas({ plan: plan("fr", "nl"), addOns: [{ name: "Visa Prancis", tag: "wajib" }, { name: "Visa Belanda", tag: "wajib" }] }, [france, netherlands], now);
  assert.deepEqual(result.offers, []);
  assert.ok(result.issues.some((issue) => issue.includes("Schengen") && issue.includes("biaya")));
  assert.ok(result.countries.every((country) => country.serviceState === "consultation"));
});

test("Schengen coverage recognizes included-versus-charged references across member countries", () => {
  const result = assessTourVisas({ plan: plan("fr", "nl"), inclusions: ["Visa Prancis termasuk"], addOns: [{ name: "Visa Belanda", tag: "wajib" }] }, [france, netherlands], now);
  assert.deepEqual(result.offers, []);
  assert.ok(result.issues.some((issue) => issue.includes("termasuk") && issue.includes("biaya")));
  assert.ok(result.countries.every((country) => country.serviceState === "consultation"));
});

test("one member-named Schengen component covers the whole group without another offer", () => {
  for (const input of [{ inclusions: ["Visa Prancis termasuk"] }, { addOns: [{ name: "Visa Prancis", tag: "wajib" }] }]) {
    const result = assessTourVisas({ plan: plan("fr", "nl"), ...input }, [france, netherlands], now);
    assert.deepEqual(result.offers, []);
    assert.deepEqual(result.issues, []);
    assert.ok(result.countries.every((country) => country.serviceState === ("inclusions" in input ? "included" : "separate")));
  }
});

test("non-Schengen re-entry cannot automatically sell a single-entry service", () => {
  const records = [brazil, { ...peru, variants: [{ id: "single", name: "Single entry", priceIDR: 1_000_000 }] }];
  const result = assessTourVisas({ plan: plan("pe", "br", "pe") }, records, now);
  const country = result.countries.find((country) => country.id === "pe");
  assert.equal(country?.status, "conditional");
  assert.equal(country?.serviceState, "consultation");
  assert.deepEqual(result.offers, []);
  assert.deepEqual(result.issues, []);
  assert.ok(result.warnings.some((warning) => warning.includes("entri")));
  const consecutive = assessTourVisas({ plan: plan("pe", "pe") }, records, now);
  assert.equal(consecutive.offers[0]?.id, "visa-peru");
});

test("a foreign transit between visits cannot conceal a return entry", () => {
  const transit = { countryId: "br", stayDays: 0, kind: "transit" as const, service: "offer" as const };
  const regular = assessTourVisas({ plan: plan("pe", transit) }, [peru, brazil], now);
  assert.deepEqual(regular.offers.map((offer) => offer.id), ["visa-peru"]);
  const reentry = assessTourVisas({ plan: plan("pe", transit, "pe") }, [peru, brazil], now);
  assert.deepEqual(reentry.offers, []);
  assert.ok(reentry.warnings.some((warning) => warning.includes("entri")));
  const schengenReentry = assessTourVisas({ plan: plan("fr", transit, "nl") }, [france, netherlands, brazil], now);
  assert.deepEqual(schengenReentry.offers, []);
  assert.ok(schengenReentry.warnings.some((warning) => warning.includes("entri")));
});
