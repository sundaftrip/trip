import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as publishing from "../lib/tour-visa-publishing";
import * as input from "../lib/api-input";
import * as authorization from "../lib/authorization";
import { assessTourVisas } from "../lib/tour-visa-assessment";
import { readTourVisaPlan, type TourVisaPlan } from "../lib/tour-visa-plan";

type Row = Record<string, unknown>;
type Handler = (request: Request, context?: { params: Promise<{ id: string }> }) => Promise<Response>;
const plan: TourVisaPlan = { version: 1, passportCountry: "ID", passportType: "ordinary", purpose: "tourism", destinations: [{ countryId: "pe", kind: "visit", stayDays: 5, service: "offer" }] };
const days = [{ day: 1, title: "Lima", description: "Program" }];

function harness() {
  let row: Row | null = null;
  let writes = 0;
  const permissionCalls: string[][] = [];
  const records = [{ id: "pe", name: "Peru", en: "Peru", visa: "wajib", stay: "30 hari", servicePrice: "Rp 1.000.000", sourceUrl: "https://example.gov/visa", lastVerifiedAt: new Date().toISOString() }];
  const prisma = { user: { findUnique: async () => ({ id: "admin" }) }, tour: {
    findUnique: async ({ where }: { where: Row }) => where.id ? row : null,
    count: async () => 0,
    create: async ({ data }: { data: Row }) => { writes++; row = { ...data, id: "tour" }; return row; },
    update: async ({ data }: { data: Row }) => { writes++; row = { ...row, ...data }; return row; },
    createMany: async ({ data }: { data: Row[] }) => { writes += data.length; row = data[0]; return { count: data.length }; },
  } };
  const modules: Record<string, unknown> = {
    "next/server": { NextResponse: { json: (body: unknown, init?: ResponseInit) => new Response(JSON.stringify(body), { ...init, headers: { "Content-Type": "application/json" } }) } },
    "@/lib/prisma": { prisma },
    "@/lib/auth": { auth: async () => ({ user: { id: "admin", role: "ADMIN" } }) },
    "@/lib/permissions": { checkPermissions: async (_session: unknown, permissions: string[]) => { permissionCalls.push(permissions); return true; }, checkPermission: async () => true },
    "@/lib/authorization": authorization,
    "@/lib/activityLog": { logActivity: async () => {} },
    "@/lib/revalidate": { revalidatePublicContent: () => {} },
    "@/lib/api-input": input,
    "@/lib/api-error": { apiError: (error: unknown) => { throw error; } },
    "@/lib/tour-order": { MAX_PINNED_TOURS: 6 },
    "@/lib/tour-visa-data": { getTourVisaCountries: async () => records },
    "@/lib/tour-visa-publishing": publishing,
    slugify: { default: () => "test-tour" },
  };
  function load(path: string) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const exports: Record<string, Handler> = {};
    runInNewContext(code, { exports, Date, Array, console, require: (name: string) => { assert.ok(name in modules, `Unmocked module ${name}`); return modules[name]; } });
    return exports;
  }
  return {
    create: load("app/api/tours/route.ts").POST,
    update: load("app/api/tours/[id]/route.ts").PUT,
    importRows: load("app/api/tours/import/route.ts").POST,
    seed(value: Row) { row = value; },
    get row() { return row; }, get writes() { return writes; }, get permissionCalls() { return permissionCalls; },
    confirmation() { return { visaReviewConfirmed: true, visaReviewFingerprint: assessTourVisas({ plan, country: "Peru", inclusions: [], addOns: [] }, records).fingerprint }; },
  };
}
function request(body: unknown) { return new Request("https://example.test/api/tours", { method: "POST", body: JSON.stringify(body) }); }
const body = { title: "Latin America", country: "Peru", price: 1000, status: "ACTIVE", itinerary: days, inclusions: [], addOns: [] };

test("actual create route prevents unreviewed publication before any write", async () => {
  const h = harness();
  assert.equal((await h.create(request(body))).status, 422);
  assert.equal(h.writes, 0);
});

test("actual create route persists structured plan and keeps API days as array", async () => {
  const h = harness();
  const response = await h.create(request({ ...body, visaPlan: plan, ...h.confirmation() }));
  assert.equal(response.status, 201);
  assert.equal(h.writes, 1);
  const returned = await response.json();
  assert.ok(Array.isArray(returned.itinerary));
  assert.equal(returned.visaPlan.destinations[0].countryId, "pe");
  assert.ok(readTourVisaPlan(h.row?.itinerary)?.review);
});

test("actual status endpoint cannot bypass review via status-only publication", async () => {
  const h = harness();
  h.seed({ ...body, id: "tour", status: "DRAFT" });
  const result = await h.update(request({ status: "ACTIVE" }), { params: Promise.resolve({ id: "tour" }) });
  assert.equal(result.status, 422);
  assert.equal(h.writes, 0);
});

test("virtual visa plan input also requires tour-edit permission", async () => {
  const h = harness();
  h.seed({ ...body, id: "tour", status: "DRAFT" });
  await h.update(request({ status: "ACTIVE", visaPlan: plan, ...h.confirmation() }), { params: Promise.resolve({ id: "tour" }) });
  assert.ok(h.permissionCalls[0].includes("tour_edit"));
  assert.ok(h.permissionCalls[0].includes("tour_status"));
});

test("actual bulk import is draft-only until visa review", async () => {
  const h = harness();
  const result = await h.importRows(request({ tours: [{ title: "Latin America", country: "Amerika Latin", price: 100 }] }));
  assert.equal(result.status, 201);
  assert.equal(h.row?.status, "DRAFT");
  assert.equal((await result.json()).status, "DRAFT");
});
