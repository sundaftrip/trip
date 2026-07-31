import assert from "node:assert/strict";
import test from "node:test";

import { normalizeFacebookGroupUrl } from "../lib/facebook-source";
import {
  assertPublicHttpUrl,
  fetchPublicText,
  isPublicIpAddress,
} from "../lib/safe-public-url";

const publicResolver = async () => ["93.184.216.34"];

test("accepts a public HTTP URL and rejects local or credential-bearing URLs", async () => {
  const url = await assertPublicHttpUrl("https://example.org/article", publicResolver);
  assert.equal(url.href, "https://example.org/article");

  await assert.rejects(() => assertPublicHttpUrl("http://localhost/admin", publicResolver));
  await assert.rejects(() => assertPublicHttpUrl("http://user:pass@example.org", publicResolver));
  await assert.rejects(() => assertPublicHttpUrl("https://example.org:8443/article", publicResolver));
  await assert.rejects(() => assertPublicHttpUrl("file:///etc/passwd", publicResolver));
});

test("rejects private literal addresses and DNS answers", async () => {
  await assert.rejects(() => assertPublicHttpUrl("http://127.0.0.1", async () => ["127.0.0.1"]));
  await assert.rejects(() => assertPublicHttpUrl("http://[::1]", async () => ["::1"]));
  await assert.rejects(() => assertPublicHttpUrl("https://source.example.org", async () => ["169.254.169.254"]));
  await assert.rejects(() => assertPublicHttpUrl("https://source.example.org", async () => ["93.184.216.34", "10.0.0.2"]));
});

test("classifies common public and non-public IP ranges", () => {
  assert.equal(isPublicIpAddress("8.8.8.8"), true);
  assert.equal(isPublicIpAddress("2606:4700:4700::1111"), true);
  assert.equal(isPublicIpAddress("10.0.0.1"), false);
  assert.equal(isPublicIpAddress("169.254.169.254"), false);
  assert.equal(isPublicIpAddress("fc00::1"), false);
  assert.equal(isPublicIpAddress("::ffff:127.0.0.1"), false);
});

test("validates every redirect before following it", async () => {
  const requested: string[] = [];
  const fetchImpl = async (input: string | URL) => {
    requested.push(String(input));
    return new Response(null, {
      status: 302,
      headers: { Location: "http://127.0.0.1/latest/meta-data" },
    });
  };

  await assert.rejects(() => fetchPublicText("https://example.org/start", {
    fetchImpl,
    resolveAddresses: async (hostname) => hostname === "127.0.0.1"
      ? ["127.0.0.1"]
      : ["93.184.216.34"],
  }));
  assert.deepEqual(requested, ["https://example.org/start"]);
});

test("limits response size", async () => {
  await assert.rejects(() => fetchPublicText("https://example.org/large", {
    fetchImpl: async () => new Response("0123456789"),
    maxBytes: 5,
    resolveAddresses: publicResolver,
  }));
});

test("applies the text timeout to DNS resolution and the initial fetch", async () => {
  await assert.rejects(
    () => fetchPublicText("https://example.org/dns-stall", {
      resolveAddresses: async () => new Promise<string[]>(() => {}),
      timeoutMs: 10,
    }),
    /melewati batas waktu/,
  );

  await assert.rejects(
    () => fetchPublicText("https://example.org/fetch-stall", {
      fetchImpl: async () => new Promise<Response>(() => {}),
      resolveAddresses: publicResolver,
      timeoutMs: 10,
    }),
    /melewati batas waktu/,
  );
});

test("applies the text timeout while reading and cancels a stalled body", async () => {
  let bodyCancelled = false;
  const body = new ReadableStream<Uint8Array>({
    cancel() {
      bodyCancelled = true;
    },
    start(controller) {
      controller.enqueue(new TextEncoder().encode("partial"));
    },
  });

  await assert.rejects(
    () => fetchPublicText("https://example.org/body-stall", {
      fetchImpl: async () => new Response(body),
      resolveAddresses: publicResolver,
      timeoutMs: 10,
    }),
    /melewati batas waktu/,
  );
  assert.equal(bodyCancelled, true);
});

test("normalizes only genuine HTTPS Facebook group URLs", () => {
  assert.equal(
    normalizeFacebookGroupUrl("https://www.facebook.com/groups/12345/?ref=share").href,
    "https://mbasic.facebook.com/groups/12345/?ref=share",
  );
  assert.throws(() => normalizeFacebookGroupUrl("https://facebook.com.evil.example/groups/123"));
  assert.throws(() => normalizeFacebookGroupUrl("https://facebook.com@evil.example/groups/123"));
  assert.throws(() => normalizeFacebookGroupUrl("http://facebook.com/groups/123"));
  assert.throws(() => normalizeFacebookGroupUrl("https://www.facebook.com/profile.php?id=123"));
});
