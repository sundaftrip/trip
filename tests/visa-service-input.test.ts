import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  parseVisaServiceInput,
  visaServiceCreateData,
  visaServiceUpdateData,
  VisaServiceInputError,
} from "../lib/visa-service-input";

const completeInput = {
  name: " Peru ", en: "Peru", region: "Amerika", visa: "wajib", flag: "🇵🇪",
  sortOrder: 2, stay: "Contoh durasi", cost: "", notes: "Contoh aturan, bukan kebijakan aktual",
  officialFee: "Sesuai biaya resmi", servicePrice: "Mulai Rp 1.000.000",
  sourceUrl: "https://example.org/visa", lastVerifiedAt: "2026-08-31",
  conditions: [" Paspor Indonesia biasa ", ""], eligibility: ["Tujuan wisata"],
  documents: [{ name: "Paspor", hint: "Sesuai ketentuan" }],
  faqs: [{ question: "Apa yang diperlukan?", answer: "Periksa dokumen perjalanan." }],
  variants: [{ name: "Wisata", priceIDR: 1_000_000, processingTime: "Konsultasi", notes: "" }],
};

test("creating a new country keeps variants, price, eligibility, documents and FAQs", () => {
  const data = visaServiceCreateData(parseVisaServiceInput(completeInput, "create"));
  assert.equal(data.name, "Peru");
  assert.deepEqual(data.conditions, ["Paspor Indonesia biasa"]);
  assert.deepEqual(data.eligibility, completeInput.eligibility);
  assert.deepEqual(data.documents, completeInput.documents);
  assert.deepEqual(data.faqs, completeInput.faqs);
  assert.deepEqual(data.variants, { create: [{
    name: "Wisata", sortOrder: 0, priceIDR: 1_000_000,
    processingTime: "Konsultasi", notes: null,
  }] });
  assert.equal((data.lastVerifiedAt as Date).toISOString(), "2026-08-31T00:00:00.000Z");
});

test("minimal creation supplies database defaults without inventing a price", () => {
  const data = visaServiceCreateData(parseVisaServiceInput({ name: "Peru", visa: "conditional" }, "create"));
  assert.equal(data.servicePrice, null);
  assert.equal(data.sourceUrl, null);
  assert.equal(data.lastVerifiedAt, null);
  assert.deepEqual(data.documents, []);
  assert.deepEqual(data.eligibility, []);
  assert.deepEqual(data.variants, { create: [] });
});

test("partial update preserves every omitted scalar, rich content and variant", () => {
  assert.deepEqual(visaServiceUpdateData(parseVisaServiceInput({ notes: "Updated" }, "update"), ["retained"]), { notes: "Updated" });
  assert.deepEqual(visaServiceUpdateData(parseVisaServiceInput({}, "update"), ["retained"]), {});
});

test("explicit empty nullable fields and collections can be cleared", () => {
  const data = visaServiceUpdateData(parseVisaServiceInput({
    officialFee: "", servicePrice: null, lastVerifiedAt: "", sourceUrl: null,
    conditions: [], eligibility: [], documents: [], faqs: [], variants: [],
  }, "update"), ["old"]);
  assert.equal(data.lastVerifiedAt, null);
  assert.equal(data.servicePrice, null);
  assert.equal(data.sourceUrl, null);
  assert.deepEqual(data.variants, { deleteMany: {}, update: [], create: [] });
  assert.deepEqual(data.documents, []);
});

test("update preserves same-country IDs, creates new rows and removes only omitted rows atomically", () => {
  const data = visaServiceUpdateData(parseVisaServiceInput({ variants: [
    { id: "keep", name: "Updated", priceIDR: 2_000_000 },
    { name: "New", priceIDR: null },
  ] }, "update"), ["keep", "remove"]);
  assert.deepEqual(data.variants, {
    deleteMany: { id: { notIn: ["keep"] } },
    update: [{ where: { id: "keep" }, data: { name: "Updated", priceIDR: 2_000_000 } }],
    create: [{ name: "New", priceIDR: null, sortOrder: 1, processingTime: null, notes: null }],
  });
});

test("partial updates of existing variants preserve omitted price, order and details", () => {
  const data = visaServiceUpdateData(parseVisaServiceInput({ variants: [{ id: "keep", name: "Renamed" }] }, "update"), ["keep"]);
  assert.deepEqual(data.variants, {
    deleteMany: { id: { notIn: ["keep"] } },
    update: [{ where: { id: "keep" }, data: { name: "Renamed" } }],
    create: [],
  });
});

test("foreign or unknown variant IDs are rejected before producing any mutation", () => {
  for (const id of ["foreign", "deleted"]) {
    const parsed = parseVisaServiceInput({ notes: "Do not apply", variants: [{ id, name: "Tourist", priceIDR: 100 }] }, "update");
    assert.throws(() => visaServiceUpdateData(parsed, ["belongs-here"]), VisaServiceInputError);
  }
});

test("new country cannot adopt an existing variant and duplicate IDs are rejected", () => {
  assert.throws(() => parseVisaServiceInput({ ...completeInput, variants: [{ id: "existing", name: "Visa" }] }, "create"), VisaServiceInputError);
  assert.throws(() => parseVisaServiceInput({ variants: [{ id: "a", name: "One" }, { id: "a", name: "Two" }] }, "update"), VisaServiceInputError);
});

test("malformed scalar values, statuses, sort orders, dates and source URLs are rejected", () => {
  for (const value of [null, [], "text", 2]) assert.throws(() => parseVisaServiceInput(value, "create"), VisaServiceInputError);
  const invalidFields = [
    { name: " " }, { name: 123 }, { flag: {} }, { en: null }, { region: [] },
    { visa: "unknown" }, { visa: "" }, { visa: 3 }, { sortOrder: "1" },
    { sortOrder: 1.5 }, { sortOrder: -1 }, { sortOrder: 2_147_483_648 },
    { lastVerifiedAt: "not-a-date" }, { lastVerifiedAt: "2026-02-30" },
    { lastVerifiedAt: "2026-08-31T25:00:00Z" }, { lastVerifiedAt: 123 },
    { sourceUrl: "javascript:alert(1)" }, { sourceUrl: "https://user:pass@example.org/visa" },
    { sourceUrl: "http://localhost/visa" }, { sourceUrl: "https://127.0.0.1/" },
    { sourceUrl: "not-a-url" }, { sourceUrl: {} }, { servicePrice: 1_000_000 },
  ];
  for (const fields of invalidFields) {
    assert.throws(() => parseVisaServiceInput({ ...completeInput, ...fields }, "create"), VisaServiceInputError, JSON.stringify(fields));
  }
});

test("malformed rich content and nonnumeric or out-of-range variant prices are rejected", () => {
  const invalidFields = [
    { conditions: "text" }, { conditions: [1] }, { eligibility: [null] },
    { documents: [null] }, { documents: [{ name: "", hint: "x" }] }, { documents: [{ name: "Paspor", hint: 2 }] },
    { faqs: [{ question: "Question", answer: "" }] }, { faqs: ["text"] },
    { variants: {} }, { variants: [null] }, { variants: [{ name: "" }] },
    ...["1000", -1, 0.5, Infinity, NaN, 2_147_483_648].map((priceIDR) => ({ variants: [{ name: "Wisata", priceIDR }] })),
  ];
  for (const fields of invalidFields) {
    assert.throws(() => parseVisaServiceInput({ ...completeInput, ...fields }, "create"), VisaServiceInputError, JSON.stringify(fields));
  }
});

test("valid UTC dates, HTTP(S) sources, all known statuses and zero-priced variants remain supported", () => {
  for (const visa of ["bebas", "voa", "evisa", "wajib", "conditional"]) {
    const data = visaServiceCreateData(parseVisaServiceInput({ ...completeInput, visa,
      lastVerifiedAt: "2026-08-31T14:30:00.000Z", sourceUrl: "http://example.org/visa",
      variants: [{ name: "Service", priceIDR: 0, sortOrder: 4 }],
    }, "create"));
    assert.equal(data.visa, visa);
    assert.equal((data.lastVerifiedAt as Date).getUTCHours(), 14);
  }
});

test("API routes use one shared parser, nested atomic writes and ordered variants; form preserves IDs", () => {
  const root = path.join(import.meta.dirname, "..");
  const read = (file: string) => readFileSync(path.join(root, file), "utf8");
  const create = read("app/api/visa-database/route.ts");
  const update = read("app/api/visa-database/[id]/route.ts");
  const form = read("components/admin/CountryVisaForm.tsx");
  assert.match(create, /parseVisaServiceInput/);
  assert.match(create, /visaServiceCreateData/);
  assert.match(create, /include: \{ variants: \{ orderBy:/);
  assert.match(update, /prisma\.\$transaction/);
  assert.match(update, /visaServiceUpdateData/);
  assert.doesNotMatch(update, /tx\.visaVariant\.(?:deleteMany|createMany)/);
  assert.match(form, /id: v\.id/);
  for (const route of [create, update]) {
    assert.match(route, /const session = await auth\(\)/);
    assert.match(route, /if \(!session\)/);
    assert.match(route, /VisaServiceInputError/);
  }
});
