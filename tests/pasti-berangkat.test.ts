import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  PB_MAX_BODY,
  PB_PAGES,
  PB_SCRIPT_URL,
  forwardSignup,
  parseSignup,
  pbScriptUrl,
  readPools,
} from "../lib/pasti-berangkat";
import { isAppsScriptUrl, type FetchLike } from "../lib/pool-trip";
import { PAGE_KEYS, buildPage } from "../scripts/pasti-berangkat/build.mjs";

const EXEC = "https://script.google.com/macros/s/AKfycbTESTtestTESTtestTESTtest_456/exec";
const reply = (body: unknown, status = 200): FetchLike => async () => new Response(JSON.stringify(body), { status });

test("pasti berangkat only talks to a real Apps Script /exec URL", () => {
  assert.equal(pbScriptUrl({ PB_SCRIPT_URL: ` ${EXEC} ` }), EXEC);
  assert.equal(pbScriptUrl({ PB_SCRIPT_URL: "https://evil.example/macros/s/AKfycbTESTtestTESTtestTESTtest/exec" }), pbScriptUrl({}));
  // Kosong = belum tersambung: API membalas 503 dan halaman menawarkan kirim lewat WhatsApp.
  assert.ok(PB_SCRIPT_URL === "" || isAppsScriptUrl(PB_SCRIPT_URL), "the committed deployment URL is empty or a real /exec URL");
  assert.equal(pbScriptUrl({}), PB_SCRIPT_URL);
});

test("pools reply passes through and is marked cacheable", async () => {
  let called = "";
  const result = await readPools(EXEC, async (url) => {
    called = url;
    return new Response(JSON.stringify({ ok: true, pools: [], act: {}, recent: [] }));
  });
  assert.equal(called, `${EXEC}?api=pools`);
  assert.deepEqual([result.status, result.cacheable], [200, true]);
});

test("pools errors become a 502 that is never cached", async () => {
  const failing: FetchLike[] = [
    reply({ ok: false }),
    reply("<html>", 500),
    reply({ ok: true, pools: [] }),
    reply({ ok: true, act: {} }),
    async () => {
      throw new Error("down");
    },
  ];
  for (const fetchImpl of failing) {
    const result = await readPools(EXEC, fetchImpl);
    assert.deepEqual([result.status, result.cacheable], [502, false]);
  }
  assert.equal((await readPools("")).status, 503);
});

test("sign-up forwards only form fields from a known page and refuses odd bodies", () => {
  const form = {
    page: "turharian", v: 1, d: "2027-03-25", e: "2027-03-25", pax: 1, hari: { "2027-03-25": "kota" }, name: "Rina",
    wa: "6281234567890", hp: "", est: { pp: 1270000 }, plan: "Halo admin", extra: "x",
  };
  const ok = parseSignup(JSON.stringify(form));
  assert.equal(ok.ok, true);
  if (ok.ok) assert.deepEqual(Object.keys(JSON.parse(ok.body)), ["page", "v", "d", "e", "pax", "hari", "name", "wa", "hp", "est", "plan"]);
  for (const page of PB_PAGES) assert.equal(parseSignup(JSON.stringify({ page })).ok, true);
  for (const page of ["kazakhstan", "", "toString", 1, null]) {
    const result = parseSignup(JSON.stringify({ page, name: "Rina" }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 400);
  }
  assert.deepEqual(parseSignup("x".repeat(PB_MAX_BODY + 1)), { ok: false, status: 413, error: "Isi formulir terlalu panjang." });
  for (const bad of ["not json", "[1,2]", "null", "42"]) {
    const result = parseSignup(bad);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 400);
  }
});

test("sign-up passes the Apps Script reply back and turns failures into a friendly 502", async () => {
  let sent: RequestInit | undefined;
  const result = await forwardSignup(EXEC, '{"page":"2tans"}', async (_url, init) => {
    sent = init;
    return new Response(JSON.stringify({ ok: false, error: "Isi nama dulu, minimal 2 huruf.", field: "name" }));
  });
  assert.equal(sent?.method, "POST");
  assert.deepEqual(result.body, { ok: false, error: "Isi nama dulu, minimal 2 huruf.", field: "name" });
  const down = await forwardSignup(EXEC, "{}", async () => {
    throw new Error("timeout");
  });
  assert.equal(down.status, 502);
  assert.equal((await forwardSignup("", "{}")).status, 503);
});

test("/pastiberangkat, /2tans and /turharian serve static pages that talk only to /api/pasti-berangkat", () => {
  const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  for (const key of PB_PAGES) {
    assert.match(config, new RegExp(`source: "/${key}", destination: "/${key}/index\\.html"`));
    const page = readFileSync(new URL(`../public/${key}/index.html`, import.meta.url), "utf8");
    assert.match(page, /var API_URL = '\/api\/pasti-berangkat';/);
    assert.match(page, new RegExp(`<link rel="canonical" href="https://sundaftrip\\.com/${key}">`));
    assert.match(page, new RegExp(`var P = \\{"key":"${key}"`));
    assert.doesNotMatch(page, /script\.google\.com/);
    assert.doesNotMatch(page, /\{\{@\w+\}\}|\/\*__\w+__\*\//, "no build placeholders left");
  }
  const route = readFileSync(new URL("../app/api/pasti-berangkat/route.ts", import.meta.url), "utf8");
  assert.match(route, /rateLimit\(`pasti-berangkat:\$\{clientIp\(req\)\}`/);
  assert.match(route, /s-maxage=30/);
});

test("the three public pages are exactly what scripts/pasti-berangkat builds", () => {
  assert.deepEqual([...PAGE_KEYS].sort(), [...PB_PAGES].sort());
  for (const key of PAGE_KEYS) {
    const built = buildPage(key);
    const served = readFileSync(new URL(`../public/${key}/index.html`, import.meta.url), "utf8");
    assert.ok(built === served, `public/${key}/index.html is out of date: run npm run build:pasti-berangkat`);
  }
});
