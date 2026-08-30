import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as visaInput from "../lib/visa-service-input";

type Row = Record<string, unknown>;
type Variant = { id: string; name: string; sortOrder: number; priceIDR: number | null; processingTime?: string | null; notes?: string | null };
type Country = Row & { id: string; variants: Variant[] };
type Routes = Record<string, (...args: unknown[]) => Promise<Response>>;
const root = path.join(import.meta.dirname, "..");

// Execute the real handlers with test-owned auth/cache/Prisma adapters. No live
// database or credentials are loaded and every test starts with isolated data.
function harness() {
  let rows = new Map<string, Country>();
  let nextId = 0;
  let signedIn = true;
  let failNextWrite = false;
  let revalidated = 0;
  let updates = 0;
  const ordered = (row: Country) => ({ ...row, variants: [...row.variants].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)) });
  const countryVisa = {
    async findMany() { return [...rows.values()].map(ordered); },
    async findUnique({ where }: { where: { id: string } }) { return rows.has(where.id) ? ordered(rows.get(where.id)!) : null; },
    async create({ data }: { data: Row }) {
      const { variants, ...fields } = data;
      const id = `country-${++nextId}`;
      const create = (variants as { create: Omit<Variant, "id">[] }).create;
      const entry = { ...fields, id, variants: create.map((item) => ({ ...item, id: `variant-${++nextId}` })) };
      if (failNextWrite) throw new Error("database connection: secret password");
      rows.set(id, entry);
      return ordered(entry);
    },
    async update({ where, data }: { where: { id: string }; data: Row }) {
      updates++;
      const existing = rows.get(where.id)!;
      const { variants, ...fields } = data;
      const next = { ...existing, ...fields };
      // Deliberately mutate transaction-local state before injecting a failure,
      // proving the handler runs country and variants in one transaction.
      rows.set(where.id, next);
      if (failNextWrite) throw new Error("database connection: secret password");
      if (variants) {
        const nested = variants as {
          deleteMany: { id?: { notIn: string[] } };
          update: { where: { id: string }; data: Partial<Variant> }[];
          create: Omit<Variant, "id">[];
        };
        next.variants = existing.variants.filter((item) => nested.deleteMany.id?.notIn.includes(item.id));
        for (const item of nested.update) {
          next.variants = next.variants.map((current) => current.id === item.where.id ? { ...current, ...item.data } : current);
        }
        next.variants.push(...nested.create.map((item) => ({ ...item, id: `variant-${++nextId}` })));
      }
      return ordered(next);
    },
  };
  const prisma = {
    countryVisa,
    async $transaction<T>(fn: (tx: { countryVisa: typeof countryVisa }) => Promise<T>) {
      const saved = structuredClone(rows);
      try { return await fn({ countryVisa }); }
      catch (error) { rows = saved; throw error; }
    },
  };
  const modules: Record<string, unknown> = {
    "next/server": { NextResponse: { json: (body: unknown, init?: ResponseInit) => new Response(JSON.stringify(body), { ...init, headers: { ...init?.headers, "Content-Type": "application/json" } }) } },
    "@/lib/prisma": { prisma },
    "@/lib/auth": { auth: async () => signedIn ? { user: { id: "admin" } } : null },
    "@/lib/revalidate": { revalidatePublicContent: () => { revalidated++; } },
    "@/lib/visa-service-input": visaInput,
  };
  function load(relative: string): Routes {
    const source = readFileSync(path.join(root, relative), "utf8");
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const exports = {};
    runInNewContext(compiled, { exports, SyntaxError, require(name: string) {
      assert.ok(name in modules, `Unmocked dependency: ${name}`);
      return modules[name];
    } });
    return exports as Routes;
  }
  return {
    collection: load("app/api/visa-database/route.ts"),
    detail: load("app/api/visa-database/[id]/route.ts"),
    seed(entry: Country) { rows.set(entry.id, structuredClone(entry)); },
    row(id: string) { return structuredClone(rows.get(id)); },
    signOut() { signedIn = false; },
    failWrites() { failNextWrite = true; },
    get updates() { return updates; }, get revalidated() { return revalidated; },
  };
}
const request = (body: unknown) => ({ json: async () => body });
const params = (id: string) => ({ params: Promise.resolve({ id }) });

test("POST persists and returns new variants and rich fields in one operation", async () => {
  const app = harness();
  const response = await app.collection.POST(request({ name: "Test Country", visa: "wajib",
    eligibility: ["Test passport"], conditions: ["Test condition"],
    documents: [{ name: "Passport", hint: "Test instruction" }], faqs: [{ question: "Test?", answer: "Test." }],
    variants: [{ name: "Tourism", priceIDR: 123_000, processingTime: "Test duration" }],
  }));
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.variants[0].priceIDR, 123_000);
  assert.ok(body.variants[0].id);
  assert.deepEqual(body.eligibility, ["Test passport"]);
  assert.equal(app.row(body.id)?.variants[0].id, body.variants[0].id);
  assert.equal(app.revalidated, 1);
});

test("PUT preserves existing variant identity, partial rich fields and adds a new variant", async () => {
  const app = harness();
  app.seed({ id: "a", name: "Country", visa: "wajib", documents: [{ name: "Passport" }],
    notes: "Keep", variants: [{ id: "variant-a", name: "Tourism", sortOrder: 0, priceIDR: 100, notes: "Keep variant notes" }] });
  const response = await app.detail.PUT(request({ variants: [
    { id: "variant-a", name: "Renamed" }, { name: "New", priceIDR: 200 },
  ] }), params("a"));
  assert.equal(response.status, 200);
  const row = app.row("a")!;
  assert.equal(row.notes, "Keep");
  assert.deepEqual(row.documents, [{ name: "Passport" }]);
  assert.deepEqual(row.variants[0], { id: "variant-a", name: "Renamed", sortOrder: 0, priceIDR: 100, notes: "Keep variant notes" });
  assert.equal(row.variants[1].priceIDR, 200);
  assert.equal(app.revalidated, 1);
});

test("PUT refuses foreign IDs without changing either country or invalidating cache", async () => {
  const app = harness();
  app.seed({ id: "a", notes: "Keep", variants: [{ id: "a-1", name: "First", sortOrder: 0, priceIDR: 100 }] });
  app.seed({ id: "b", variants: [{ id: "b-1", name: "Foreign", sortOrder: 0, priceIDR: 200 }] });
  const before = app.row("a");
  const response = await app.detail.PUT(request({ notes: "Must not apply", variants: [{ id: "b-1", name: "Invalid" }] }), params("a"));
  assert.equal(response.status, 400);
  assert.deepEqual(app.row("a"), before);
  assert.equal(app.row("b")?.variants[0].priceIDR, 200);
  assert.equal(app.updates, 0);
  assert.equal(app.revalidated, 0);
});

test("PUT variant rename does not reorder variants unless an order is submitted", async () => {
  const app = harness();
  app.seed({ id: "a", variants: [
    { id: "a-1", name: "First", priceIDR: 100, sortOrder: 5 },
    { id: "a-2", name: "Second", priceIDR: 200, sortOrder: 9 },
  ] });
  const response = await app.detail.PUT(request({ variants: [{ id: "a-2", name: "Renamed" }, { id: "a-1" }] }), params("a"));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result.variants.map((item: Variant) => [item.id, item.sortOrder]), [["a-1", 5], ["a-2", 9]]);
});

test("PUT transaction failure rolls back and does not disclose infrastructure errors", async () => {
  const app = harness();
  app.seed({ id: "a", notes: "Before", variants: [] });
  app.failWrites();
  const response = await app.detail.PUT(request({ notes: "After" }), params("a"));
  assert.equal(response.status, 500);
  assert.doesNotMatch(await response.text(), /secret|password|connection/);
  assert.equal(app.row("a")?.notes, "Before");
  assert.equal(app.revalidated, 0);
});

test("POST failure is sanitized and invalid JSON or prices return 400 before writes", async () => {
  const app = harness();
  for (const handler of [app.collection.POST, (req: unknown) => app.detail.PUT(req, params("a"))]) {
    const malformed = await handler({ json: async () => { throw new SyntaxError("secret malformed body"); } });
    assert.equal(malformed.status, 400);
    assert.doesNotMatch(await malformed.text(), /secret/);
    const invalidPrice = await handler(request({ name: "Country", visa: "wajib", variants: [{ name: "Visa", priceIDR: "100" }] }));
    assert.equal(invalidPrice.status, 400);
  }
  app.failWrites();
  const failed = await app.collection.POST(request({ name: "Country", visa: "wajib" }));
  assert.equal(failed.status, 500);
  assert.doesNotMatch(await failed.text(), /secret|password/);
  assert.equal(app.revalidated, 0);
});

test("missing country returns 404 and anonymous mutation remains unauthorized", async () => {
  const app = harness();
  assert.equal((await app.detail.PUT(request({ notes: "Test" }), params("missing"))).status, 404);
  assert.equal((await app.detail.GET(undefined, params("missing"))).status, 404);
  app.signOut();
  assert.equal((await app.collection.POST(request({ name: "Test", visa: "wajib" }))).status, 401);
  assert.equal((await app.detail.PUT(request({ notes: "Test" }), params("missing"))).status, 401);
  assert.equal(app.revalidated, 0);
});

test("public GET includes stable ordered variant IDs for the country selector", async () => {
  const app = harness();
  app.seed({ id: "a", variants: [
    { id: "z", name: "Later", priceIDR: 200, sortOrder: 1 },
    { id: "a", name: "First", priceIDR: 100, sortOrder: 0 },
  ] });
  const response = await app.collection.GET();
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body[0].variants.map((item: Variant) => item.id), ["a", "z"]);
});
