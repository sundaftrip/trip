import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";
import { NextRequest, NextResponse } from "next/server";
import ts from "typescript";
import * as authorization from "../lib/authorization";
import * as geoRoutes from "../lib/geo-cms-routes";
import * as geoInput from "../lib/geo-cms-input";
import type { GeoDestinationContent } from "../types/geo";

type Handler = (request: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<NextResponse>;
type HarnessOptions = { permissions?: string[]; routePath?: string | null; authenticated?: boolean; failWrite?: boolean };

function apiHarness(item: boolean, options: HarnessOptions = {}) {
  const writes: Array<{ method: string; data: Record<string, unknown> }> = [];
  const reads: unknown[] = [];
  const permissions: string[][] = [];
  const allowed = options.permissions ?? ["geo_create", "geo_edit", "geo_publish", "geo_delete"];
  const routePath = options.routePath === undefined ? "/visa-rusia-wni" : options.routePath;
  const session = options.authenticated === false ? null : { user: { id: "test-user", name: "Test", role: "EDITOR" } };
  const dependencies: Record<string, unknown> = {
    "next/server": { NextResponse },
    "@/lib/auth": { auth: async () => session },
    "@/lib/authorization": authorization,
    "@/lib/geo-cms-routes": geoRoutes,
    "@/lib/geo-cms-input": geoInput,
    "@/lib/permissions": {
      checkPermissions: async (_session: unknown, keys: string[]) => {
        permissions.push(keys);
        return keys.every((key) => allowed.includes(key));
      },
      checkPermission: async (_session: unknown, key: string) => allowed.includes(key),
      hasPersistedUser: async () => Boolean(session),
    },
    "@/lib/prisma": {
      prisma: { geoPage: {
        findUnique: async () => routePath === null ? null : { id: "page-1", routePath, title: "Original" },
        findMany: async (query: unknown) => { reads.push(query); return []; },
        findFirst: async (query: unknown) => { reads.push(query); return null; },
        create: async ({ data }: { data: Record<string, unknown> }) => {
          if (options.failWrite) throw new Error("Test database failure");
          writes.push({ method: "create", data });
          return { id: "page-1", ...data };
        },
        update: async ({ data }: { data: Record<string, unknown> }) => {
          if (options.failWrite) throw new Error("Test database failure");
          writes.push({ method: "update", data });
          return { id: "page-1", routePath, title: "Original", ...data };
        },
      } },
    },
    "@/lib/activityLog": { logActivity: async () => undefined },
    "@/lib/revalidate": { revalidatePublicContent: () => undefined },
    "@/lib/api-error": { apiError: () => NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 }) },
  };
  const file = item ? "../app/api/geo-pages/[id]/route.ts" : "../app/api/geo-pages/route.ts";
  const compiled = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const geoModule = { exports: {} as Record<string, Handler> };
  runInNewContext(compiled, {
    module: geoModule,
    exports: geoModule.exports,
    require: (name: string) => {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  });
  return { handlers: geoModule.exports, writes, reads, permissions };
}

function request(method: "POST" | "PUT", body: unknown) {
  return new NextRequest("https://example.test/api/geo-pages/page-1", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
const context = () => ({ params: Promise.resolve({ id: "page-1" }) });
const validCreate = { routePath: "/visa-rusia-wni", title: "Title", answer: "Answer", sections: [], faqs: [] };
const validDestination = {
  hero: { eyebrow: "", titleLine1: "Heading", titleLine2: "", description: "", image: "", imageAlt: "", primaryCtaLabel: "", allToursCtaLabel: "", secondaryCtaLabel: "" },
  quickFacts: [], intro: { eyebrow: "", title: "", paragraphs: [] }, guide: { eyebrow: "", title: "", cards: [] },
  activities: { eyebrow: "", title: "", items: [] }, travel: { eyebrow: "", title: "", steps: [] },
  budget: { eyebrow: "", title: "", items: [], totalLabel: "", totalValue: "", note: "" },
  emptyTours: { icon: "", title: "", description: "", ctaLabel: "", ctaHref: "" }, finalCta: { title: "", description: "", buttonLabel: "" },
} satisfies GeoDestinationContent;

test("POST saves a supported draft with create permission only", async () => {
  const api = apiHarness(false, { permissions: ["geo_create"] });
  const response = await api.handlers.POST(request("POST", validCreate), context());
  assert.equal(response.status, 201);
  assert.equal(api.writes.length, 1);
  assert.equal(api.writes[0].data.published, false);
});

test("POST rejects arbitrary or hardcoded routes before a database write", async () => {
  for (const routePath of ["/new-route", "/jasa-urus-visa-terpercaya", "//example.com"]) {
    const api = apiHarness(false);
    const response = await api.handlers.POST(request("POST", { ...validCreate, routePath, published: true }), context());
    assert.equal(response.status, 422);
    assert.equal(api.writes.length, 0);
  }
});

test("POST does not grant publication to a create-only user", async () => {
  const api = apiHarness(false, { permissions: ["geo_create"] });
  const response = await api.handlers.POST(request("POST", { ...validCreate, published: true }), context());
  assert.equal(response.status, 403);
  assert.equal(api.writes.length, 0);
});

test("PUT text-only payload needs edit permission but not publication permission", async () => {
  const api = apiHarness(true, { permissions: ["geo_edit"] });
  const payload = geoRoutes.buildGeoSaveInput({ routePath: "/visa-rusia-wni", title: "Revised", published: true }, true, true);
  const response = await api.handlers.PUT(request("PUT", payload), context());
  assert.equal(response.status, 200);
  assert.equal(api.writes.length, 1);
  assert.equal(Object.hasOwn(api.writes[0].data, "published"), false);
});

test("destination editor updates preserve unused sections and schema without blocking supported fields", async () => {
  for (const routePath of ["/destinations/murmansk", "/destinations/teriberka"]) {
    const api = apiHarness(true, { routePath, permissions: ["geo_edit"] });
    const payload = geoRoutes.buildGeoSaveInput({ routePath, title: "Revised Article headline", answer: "Updated summary", published: true, sections: [{ title: "", body: "Legacy content" }], schemaType: "WebPage", faqs: [], content: validDestination }, true, true);
    const response = await api.handlers.PUT(request("PUT", payload), context());
    assert.equal(response.status, 200);
    assert.equal(api.writes.length, 1);
    const written = api.writes[0].data;
    for (const field of ["sections", "schemaType", "published"]) assert.equal(Object.hasOwn(written, field), false, field);
    assert.equal(written.title, payload.title);
    assert.equal(written.answer, payload.answer);
    assert.deepEqual(written.content, payload.content);
    assert.deepEqual(written.faqs, []);
    const createApi = apiHarness(false, { permissions: ["geo_create"] });
    const create = geoRoutes.buildGeoSaveInput({ ...validCreate, routePath, schemaType: "Article", published: false }, false, false);
    assert.equal((await createApi.handlers.POST(request("POST", create), context())).status, 201);
  }
});

test("GEO mutations reject malformed nested data before writing instead of creating an unopenable editor", async () => {
  const malformed = [
    { sections: [null] }, { sections: [{ title: 7 }] }, { sections: [{ title: "Title", body: {} }] }, { sections: [{ title: "Title", items: [null] }] },
    { faqs: [null] }, { faqs: [{ question: "Question" }] }, { faqs: [{ question: {}, answer: "Answer" }] },
    { content: {} }, { content: { ...validDestination, hero: [] } }, { content: { ...validDestination, quickFacts: [null] } },
    { content: { ...validDestination, guide: { ...validDestination.guide, cards: [{ title: "Title", content: null }] } } },
    { content: { ...validDestination, activities: { ...validDestination.activities, items: [{ title: "Title", desc: "", img: "", video: {} }] } } },
  ];
  for (const item of [false, true]) {
    const method = item ? "PUT" : "POST";
    for (const invalid of malformed) {
      const api = apiHarness(item);
      const response = await api.handlers[method](request(method, { ...validCreate, ...invalid }), context());
      assert.equal(response.status, 422, `${method}: ${JSON.stringify(invalid)}`);
      assert.equal(api.writes.length, 0);
      assert.equal(typeof (await response.json()).error, "string");
    }
  }
});

test("GEO mutations preserve valid structured rows and allow explicit null content", async () => {
  for (const item of [false, true]) {
    const method = item ? "PUT" : "POST";
    for (const content of [validDestination, null]) {
      const api = apiHarness(item);
      const body = { ...validCreate, sections: [{ title: "Useful section", body: "Text", items: ["A", "B"] }], faqs: [{ question: "Q", answer: "A" }], content };
      const response = await api.handlers[method](request(method, body), context());
      assert.equal(response.status, item ? 200 : 201);
      assert.deepEqual(api.writes[0].data.sections, body.sections);
      assert.deepEqual(api.writes[0].data.faqs, body.faqs);
      assert.deepEqual(api.writes[0].data.content, content);
    }
  }
});

test("PUT still requires publication permission whenever published is submitted", async () => {
  const api = apiHarness(true, { permissions: ["geo_edit"] });
  const response = await api.handlers.PUT(request("PUT", { title: "Revised", published: true }), context());
  assert.equal(response.status, 403);
  assert.equal(api.writes.length, 0);
});

test("PUT cannot bypass unsupported-route checks with a publish-only request", async () => {
  const api = apiHarness(true, { routePath: "/old-custom-url", permissions: ["geo_publish"] });
  const response = await api.handlers.PUT(request("PUT", { published: true }), context());
  assert.equal(response.status, 422);
  assert.equal(api.writes.length, 0);
});

test("PUT cannot activate an ignored legacy record by renaming it with edit permission", async () => {
  const api = apiHarness(true, { routePath: "/old-custom-url", permissions: ["geo_edit"] });
  const response = await api.handlers.PUT(request("PUT", { routePath: "/visa-rusia-wni" }), context());
  assert.equal(response.status, 422);
  assert.equal(api.writes.length, 0);
});

test("PUT allows a permitted publisher to disable a legacy record", async () => {
  const api = apiHarness(true, { routePath: "/old-custom-url", permissions: ["geo_publish"] });
  const response = await api.handlers.PUT(request("PUT", { published: false }), context());
  assert.equal(response.status, 200);
  assert.equal(api.writes[0].data.published, false);
});

test("PUT returns not found without writing when the record no longer exists", async () => {
  const api = apiHarness(true, { routePath: null });
  const response = await api.handlers.PUT(request("PUT", { title: "Revised" }), context());
  assert.equal(response.status, 404);
  assert.equal(api.writes.length, 0);
});

test("mutation endpoints reject anonymous users and malformed JSON values", async () => {
  for (const item of [false, true]) {
    const method = item ? "PUT" : "POST";
    const anonymous = apiHarness(item, { authenticated: false });
    assert.equal((await anonymous.handlers[method](request(method, validCreate), context())).status, 401);
    assert.equal(anonymous.writes.length, 0);
    for (const body of [null, [], "text"]) {
      const api = apiHarness(item);
      assert.equal((await api.handlers[method](request(method, body), context())).status, 400);
      assert.equal(api.writes.length, 0);
    }
  }
});

test("public reads exclude unsupported rows, while persisted users can audit legacy records", async () => {
  const anonymous = apiHarness(false, { authenticated: false });
  await anonymous.handlers.GET(new NextRequest("https://example.test/api/geo-pages"), context());
  const query = anonymous.reads[0] as { where: { published: boolean; routePath: { in: string[] } } };
  assert.equal(query.where.published, true);
  assert.deepEqual(Array.from(query.where.routePath.in), geoRoutes.GEO_CMS_ROUTES.map((route) => route.routePath));
  const admin = apiHarness(false);
  await admin.handlers.GET(new NextRequest("https://example.test/api/geo-pages"), context());
  assert.equal((admin.reads[0] as { where: unknown }).where, undefined);
});

test("database failures return errors instead of reporting a successful save", async () => {
  const api = apiHarness(false, { failWrite: true });
  const response = await api.handlers.POST(request("POST", validCreate), context());
  assert.equal(response.status, 500);
  assert.equal(api.writes.length, 0);
});
