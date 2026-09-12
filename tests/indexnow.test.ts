import assert from "node:assert/strict";
import test from "node:test";
import { canonicalIndexNowUrl, INDEXNOW_ENDPOINT, INDEXNOW_ORIGIN, indexNowRetryDelay, isIndexNowCronAuthorized, isIndexNowProduction, submitIndexNow } from "../lib/indexnow";
import { blogContentChange, geoContentChange, settingsContentChange, tourContentChange, visaContentChange } from "../lib/indexnow-content";

const production = { VERCEL_ENV: "production" };

test("IndexNow only accepts canonical public document routes", () => {
  assert.equal(canonicalIndexNowUrl("/"), INDEXNOW_ORIGIN);
  assert.equal(canonicalIndexNowUrl("/tours/russia-aurora"), `${INDEXNOW_ORIGIN}/tours/russia-aurora`);
  for (const input of [
    "https://evil.example/blog/test", "https://sundaftrip.com.evil.example/about", "//evil.example/about",
    "https://user:password@sundaftrip.com/about", "http://sundaftrip.com/about", "/admin", "/api/tours",
    "/lapor/token", "/b2b-russia-catalog", "/partner/billy", "/search", "/tours/a/pdf",
    "/blog/test?preview=1", "/visa/russia#fees", "/blog/../about", "/blog/%2e%2e/about", "/unknown-route",
    "/blog/a\\b", "/blog/a b", "/blog/a/", "about",
  ]) assert.equal(canonicalIndexNowUrl(input), null, input);
});

test("sender stays disabled outside production and has a kill switch", async () => {
  let calls = 0;
  const fetcher = (async () => { calls++; return new Response(null, { status: 200 }); }) as typeof fetch;
  for (const env of [{}, { NODE_ENV: "production" }, { VERCEL_ENV: "preview" }, { ...production, INDEXNOW_DISABLED: "true" }]) {
    assert.equal(isIndexNowProduction(env), false);
    await submitIndexNow([`${INDEXNOW_ORIGIN}/about`], "test-ownership-key", fetcher, env);
  }
  assert.equal(calls, 0);
});

test("sender uses one fixed endpoint and distinguishes 202 verification pending", async () => {
  let calls = 0;
  const fetcher = (async (input, init) => {
    calls++;
    assert.equal(input, INDEXNOW_ENDPOINT);
    assert.equal(init?.redirect, "error");
    assert.equal(init?.method, "POST");
    assert.deepEqual(JSON.parse(init!.body as string), {
      host: "sundaftrip.com", key: "test-ownership-key", keyLocation: `${INDEXNOW_ORIGIN}/test-ownership-key.txt`,
      urlList: [`${INDEXNOW_ORIGIN}/about`],
    });
    return new Response(null, { status: 202 });
  }) as typeof fetch;
  const result = await submitIndexNow([`${INDEXNOW_ORIGIN}/about`], "test-ownership-key", fetcher, production);
  assert.equal(result.accepted, true);
  assert.equal(result.verificationPending, true);
  assert.equal(calls, 1);
  await submitIndexNow(["https://evil.example/about"], "test-ownership-key", fetcher, production);
  assert.equal(calls, 1);
});

test("transient network failure and non-success statuses remain retryable", async () => {
  const failure = await submitIndexNow([`${INDEXNOW_ORIGIN}/about`], "test-ownership-key", (async () => { throw new Error("timeout"); }) as typeof fetch, production);
  assert.equal(failure.accepted, false);
  assert.equal(failure.status, 0);
  const throttled = await submitIndexNow([`${INDEXNOW_ORIGIN}/about`], "test-ownership-key", (async () => new Response(null, { status: 429, headers: { "retry-after": "3600" } })) as typeof fetch, production);
  assert.equal(throttled.accepted, false);
  assert.equal(throttled.retryAfterMs, 3_600_000);
});

test("backoff is bounded but never retries before a valid Retry-After", () => {
  const now = Date.parse("2026-09-12T00:00:00Z");
  assert.equal(indexNowRetryDelay(500, 99, null, now), 86_400_000);
  assert.equal(indexNowRetryDelay(403, 0, null, now), 86_400_000);
  assert.equal(indexNowRetryDelay(429, 0, "120", now), 120_000);
  assert.equal(indexNowRetryDelay(429, 0, "Sat, 12 Sep 2026 02:00:00 GMT", now), 7_200_000);
  assert.equal(indexNowRetryDelay(429, 0, "nonsense", now), 60_000);
  assert.equal(indexNowRetryDelay(429, 0, "3600000", now), 3_600_000_000);
});

test("cron authorization fails closed for missing credentials and mismatches", () => {
  assert.equal(isIndexNowCronAuthorized(null, undefined), false);
  assert.equal(isIndexNowCronAuthorized("Bearer ", ""), false);
  assert.equal(isIndexNowCronAuthorized("Bearer incorrect", "configured"), false);
  assert.equal(isIndexNowCronAuthorized("Bearer configured", "configured"), true);
});

test("blog rename, unpublish, and delete preserve the old public URL", () => {
  const old = { slug: "old-guide", published: true };
  assert.deepEqual(blogContentChange(old, { slug: "new-guide", published: true }).paths, ["/", "/blog", "/blog/old-guide", "/blog/new-guide"]);
  assert.deepEqual(blogContentChange(old, { slug: "private-draft", published: false }).paths, ["/", "/blog", "/blog/old-guide"]);
  assert.deepEqual(blogContentChange(old, null).paths, ["/", "/blog", "/blog/old-guide"]);
  assert.deepEqual(blogContentChange(null, { slug: "draft", published: false }).paths, []);
});

test("tour notifications follow public visibility and archive noindex policy", () => {
  const current = { id: "tour1", slug: "canada-trip", status: "ACTIVE", tripDate: new Date("2030-01-01") };
  assert.deepEqual(tourContentChange(null, { ...current, status: "DRAFT" }).paths, []);
  assert.deepEqual(tourContentChange(null, { ...current, tripDate: new Date("2020-01-01") }).paths, []);
  assert.deepEqual(tourContentChange(current, { ...current, status: "DRAFT" }).paths, ["/", "/tours", "/tours/canada-trip"]);
  assert.deepEqual(tourContentChange(current, { ...current, slug: "new-tour" }).paths, ["/", "/tours", "/tours/canada-trip", "/tours/new-tour"]);
  assert.deepEqual(tourContentChange(current, null).paths, ["/", "/tours", "/tours/canada-trip"]);
});

test("visa renames and deletes retain their previous canonical slug", () => {
  assert.deepEqual(visaContentChange({ en: "Saudi Arabia" }, { en: "Saudi" }).paths, ["/visa", "/visa-intelligence", "/visa/saudi-arabia", "/visa/saudi"]);
  assert.deepEqual(visaContentChange({ en: "Russia" }, null).paths, ["/visa", "/visa-intelligence", "/visa/russia"]);
});

test("GEO draft and arbitrary route paths never become submissions", () => {
  assert.deepEqual(geoContentChange(null, { routePath: "/admin", published: true }).paths, []);
  assert.deepEqual(geoContentChange(null, { routePath: "/made-up-page", published: true }).paths, []);
  assert.deepEqual(geoContentChange(null, { routePath: "/sundaf-trip", published: false }).paths, []);
  assert.deepEqual(geoContentChange({ routePath: "/sundaf-trip", published: true }, { routePath: "/sundaf-trip", published: false }).paths, ["/sundaf-trip"]);
});

test("full CMS settings payload detects business edits despite included theme keys", () => {
  const before = { company_name: "Sundaf", company_phone: "old", site_theme: "atlas" };
  assert.ok(settingsContentChange(before, { ...before, company_phone: "new" }).paths.includes("/contact"));
  assert.deepEqual(settingsContentChange(before, { ...before, site_theme: "classic" }).paths, []);
  assert.deepEqual(settingsContentChange(before, before).paths, []);
});
