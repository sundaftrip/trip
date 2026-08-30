import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";
import * as downloads from "../lib/itinerary-pdf-download";

const source = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
type RouteInput = { sameOrigin: boolean; url: URL; request: { mode: string; destination: string; headers: Headers } };
type Route = { matcher: (input: RouteInput) => boolean; handler: NetworkOnly };
class NetworkOnly { constructor(readonly options?: { fetchOptions?: RequestInit }) {} }
type WorkerConfig = {
  runtimeCaching: Route[];
  fallbacks: { entries: Array<{ matcher: (input: { request: RouteInput["request"] & { url: string } }) => boolean }> };
};

function workerHarness() {
  let config: WorkerConfig | undefined;
  let activation: ((event: { waitUntil(promise: Promise<unknown>): void }) => void) | undefined;
  const origin = "https://sundaftrip.com";
  const entries = new Map([
    ["others", new Set([
      `${origin}/tours/russia-aurora/pdf`, `${origin}/tours/canada/pdf?v=old`,
      `${origin}/tours/asia/pdf/`, `${origin}/api/tours`,
      `${origin}/logo.png`, `${origin}/sundaftrip-company-profile.pdf`,
      "https://unrelated.example/tours/russia/pdf",
    ])],
    ["static-image-assets", new Set([`${origin}/trip-photos/trip-1.jpg`])],
    ["pages", new Set([`${origin}/tours/russia-aurora`])],
  ]);
  const code = ts.transpileModule(source("app/sw.ts"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  runInNewContext(code, {
    exports: {}, URL,
    require: (name: string) => {
      if (name === "serwist") return { NetworkOnly, Serwist: class {
        constructor(options: WorkerConfig) { config = options; }
        addEventListeners() {}
      } };
      if (name === "@serwist/next/worker") return { defaultCache: [{ matcher: () => true, handler: { kind: "cached-fallback" } }] };
      if (name === "../lib/itinerary-pdf-download") return downloads;
      throw new Error(`Unexpected worker import: ${name}`);
    },
    self: {
      location: { origin }, __SW_MANIFEST: [],
      addEventListener: (name: string, callback: typeof activation) => { if (name === "activate") activation = callback; },
      caches: {
        keys: async () => [...entries.keys()],
        delete: async (key: string) => entries.delete(key),
        open: async (key: string) => ({
          keys: async () => [...entries.get(key)!].map((url) => ({ url })),
          delete: async (request: { url: string }) => entries.get(key)!.delete(request.url),
        }),
      },
    },
  });
  assert.ok(config && activation);
  return { config, activation, entries, origin };
}

test("all tour identifiers share a versioned PDF URL, with reserved characters encoded", () => {
  for (const id of ["canada-rockies-spring-victoria-april-2027", "russia-aurora", "central-asia-4-tan", "4d3n-northern-vietnam", "id/with?query#fragment"]) {
    const href = downloads.itineraryPdfHref(id);
    assert.equal(href, `/tours/${encodeURIComponent(id)}/pdf?v=${downloads.ITINERARY_PDF_VERSION}`);
    assert.ok(downloads.isItineraryPdfPathname(new URL(href, "https://sundaftrip.com").pathname));
  }
});

test("only generated customer itinerary paths match the no-cache policy", () => {
  for (const pathname of ["/tours/id/pdf", "/tours/id/pdf/", "/tours/a%2Fb/pdf"]) assert.equal(downloads.isItineraryPdfPathname(pathname), true);
  for (const pathname of ["/tours/id", "/tours/id/pdf-more", "/tours/id/nested/pdf", "/api/b2b-catalog/documents/id/download", "/sundaftrip-company-profile.pdf"]) assert.equal(downloads.isItineraryPdfPathname(pathname), false);
});

test("worker routes versioned and old PDF addresses network-only in every request mode", () => {
  const { config, origin } = workerHarness();
  for (const pathname of ["/tours/id/pdf", "/tours/id/pdf?v=clean-2026-08", "/tours/id/pdf/"]) {
    for (const mode of ["navigate", "cors", "same-origin", "no-cors"]) {
      const input = { sameOrigin: true, url: new URL(pathname, origin), request: { mode, destination: mode === "navigate" ? "document" : "", headers: new Headers() } };
      const route = config.runtimeCaching.find((item) => item.matcher(input));
      assert.ok(route?.handler instanceof NetworkOnly);
      assert.equal(route.handler.options?.fetchOptions?.cache, "no-store");
    }
  }
});

test("offline PDF requests cannot turn into a cached document fallback", () => {
  const { config, origin } = workerHarness();
  const matcher = config.fallbacks.entries[0].matcher;
  const request = { url: `${origin}/tours/id/pdf?v=old`, mode: "navigate", destination: "document", headers: new Headers() };
  assert.equal(matcher({ request }), false);
  assert.equal(matcher({ request: { ...request, url: `${origin}/tours` } }), true);
});

test("activation purges old itinerary PDFs while retaining unrelated cached assets", async () => {
  const { activation, entries, origin } = workerHarness();
  let done: Promise<unknown> | undefined;
  activation({ waitUntil: (promise) => { done = promise; } });
  await done;
  assert.deepEqual([...entries.get("others")!], [`${origin}/logo.png`, `${origin}/sundaftrip-company-profile.pdf`, "https://unrelated.example/tours/russia/pdf"]);
  assert.deepEqual([...entries.get("static-image-assets")!], [`${origin}/trip-photos/trip-1.jpg`]);
  assert.equal(entries.has("pages"), false);
});

test("the download response advertises the format version and disallows browser/CDN storage", () => {
  assert.equal(downloads.ITINERARY_PDF_HEADERS["X-Sundaf-PDF-Version"], downloads.ITINERARY_PDF_VERSION);
  for (const key of ["Cache-Control", "CDN-Cache-Control", "Vercel-CDN-Cache-Control"] as const) assert.match(downloads.ITINERARY_PDF_HEADERS[key], /no-store/);
  const route = source("app/(website)/tours/[id]/pdf/route.ts");
  assert.match(route, /\.\.\.ITINERARY_PDF_HEADERS/);
  assert.match(route, /dynamic = "force-dynamic"/);
  assert.match(route, /createElement\(ItineraryPDF,/);
});
