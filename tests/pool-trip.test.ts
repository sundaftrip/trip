import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  POOL_MAX_BODY,
  POOL_SCRIPT_URL,
  forwardSubmission,
  isAppsScriptUrl,
  parseSubmission,
  poolScriptUrl,
  readCatalog,
  type FetchLike,
} from "../lib/pool-trip";

const EXEC = "https://script.google.com/macros/s/AKfycbTESTtestTESTtestTESTtest_123/exec";
const reply = (body: unknown, status = 200): FetchLike => async () => new Response(JSON.stringify(body), { status });

test("pool trip only talks to a real Apps Script /exec URL", () => {
  assert.equal(isAppsScriptUrl(EXEC), true);
  assert.equal(isAppsScriptUrl("https://evil.example/macros/s/AKfycbTESTtestTESTtestTESTtest/exec"), false);
  assert.equal(isAppsScriptUrl(`${EXEC}?api=catalog`), false);
  assert.equal(poolScriptUrl({ POOL_SCRIPT_URL: ` ${EXEC} ` }), EXEC);
  assert.equal(poolScriptUrl({ POOL_SCRIPT_URL: "http://script.google.com/macros/s/x/exec" }), poolScriptUrl({}));
  assert.equal(poolScriptUrl({}), POOL_SCRIPT_URL, "the committed deployment URL is used when no env override is set");
  assert.equal(isAppsScriptUrl(POOL_SCRIPT_URL), true);
});

test("pool catalog passes a valid reply through and marks it cacheable", async () => {
  let called = "";
  const result = await readCatalog(EXEC, async (url) => {
    called = url;
    return new Response(JSON.stringify({ ok: true, dests: [] }));
  });
  assert.equal(called, `${EXEC}?api=catalog`);
  assert.deepEqual([result.status, result.cacheable], [200, true]);
});

test("pool catalog errors become a 502 that is never cached", async () => {
  const failing: FetchLike[] = [
    reply({ ok: false }),
    reply("<html>", 500),
    reply({ ok: true }),
    async () => {
      throw new Error("down");
    },
  ];
  for (const fetchImpl of failing) {
    const result = await readCatalog(EXEC, fetchImpl);
    assert.deepEqual([result.status, result.cacheable], [502, false]);
  }
  assert.equal((await readCatalog("")).status, 503);
});

test("pool sign-up forwards only form fields and refuses odd bodies", () => {
  const ok = parseSubmission(
    JSON.stringify({ dest: "kanada", d: "2027-01-10", pkg: "minat", pax: 2, flex: false, name: "Rina", wa: "6281234567890", hp: "", extra: "x" }),
  );
  assert.equal(ok.ok, true);
  if (ok.ok) assert.deepEqual(Object.keys(JSON.parse(ok.body)), ["dest", "d", "pkg", "pax", "flex", "name", "wa", "hp"]);
  assert.deepEqual(parseSubmission("x".repeat(POOL_MAX_BODY + 1)), { ok: false, status: 413, error: "Isi formulir terlalu panjang." });
  for (const bad of ["not json", "[1,2]", "null", "42"]) {
    const result = parseSubmission(bad);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 400);
  }
});

test("pool sign-up passes the Apps Script reply back and turns failures into a friendly 502", async () => {
  let sent: RequestInit | undefined;
  const result = await forwardSubmission(EXEC, '{"dest":"kanada"}', async (_url, init) => {
    sent = init;
    return new Response(JSON.stringify({ ok: false, error: "Isi nama dulu, minimal 2 huruf.", field: "name" }));
  });
  assert.equal(sent?.method, "POST");
  assert.deepEqual(result.body, { ok: false, error: "Isi nama dulu, minimal 2 huruf.", field: "name" });
  const down = await forwardSubmission(EXEC, "{}", async () => {
    throw new Error("timeout");
  });
  assert.equal(down.status, 502);
  assert.equal((await forwardSubmission("", "{}")).status, 503);
});

test("/pool and /pool/<kode> serve the static page, which talks only to /api/pool", () => {
  const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(config, /source: "\/pool", destination: "\/pool\/index\.html"/);
  assert.match(config, /source: "\/pool\/:slug", destination: "\/pool\/index\.html"/);
  const page = readFileSync(new URL("../public/pool/index.html", import.meta.url), "utf8");
  assert.match(page, /var API_URL = '\/api\/pool';/);
  assert.doesNotMatch(page, /script\.google\.com/);
  const route = readFileSync(new URL("../app/api/pool/route.ts", import.meta.url), "utf8");
  assert.match(route, /rateLimit\(`pool:\$\{clientIp\(req\)\}`/);
  assert.match(route, /s-maxage=30/);
});
