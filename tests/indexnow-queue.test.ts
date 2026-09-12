import assert from "node:assert/strict";
import test from "node:test";
import { createIndexNowQueue, INDEXNOW_LEASE_KEY, INDEXNOW_RETENTION_MS, INDEXNOW_URL_PREFIX, indexNowRowKey, parseIndexNowRecord, type IndexNowStore } from "../lib/indexnow-queue";
import { INDEXNOW_ORIGIN, type IndexNowResult } from "../lib/indexnow";

const accepted: IndexNowResult = { status: 200, accepted: true, verificationPending: false, retryAfterMs: 0 };
const url = `${INDEXNOW_ORIGIN}/blog/guide`;

function memoryStore() {
  const rows = new Map<string, string>();
  const store: IndexNowStore = {
    async read(key) { const value = rows.get(key); return value === undefined ? null : { key, value }; },
    async list() { return [...rows].filter(([key]) => key.startsWith(INDEXNOW_URL_PREFIX)).map(([key, value]) => ({ key, value })); },
    async count() { return [...rows.keys()].filter((key) => key.startsWith(INDEXNOW_URL_PREFIX)).length; },
    async insert(key, value) { if (rows.has(key)) return false; rows.set(key, value); return true; },
    async replace(key, expected, value) { if (rows.get(key) !== expected) return false; rows.set(key, value); return true; },
    async remove(key, expected) { if (rows.get(key) !== expected) return false; return rows.delete(key); },
  };
  return { rows, store, record: () => parseIndexNowRecord({ key: indexNowRowKey(url), value: rows.get(indexNowRowKey(url))! })! };
}

test("accepted receipts deduplicate unchanged reconciliation and new changes requeue", async () => {
  const { store, record } = memoryStore();
  let now = 1000, calls = 0;
  const queue = createIndexNowQueue(store, () => now);
  const send = async () => { calls++; return accepted; };
  await queue.enqueue([url, url], 1000);
  await queue.drain(send);
  assert.equal(record().pending, false);
  await queue.enqueue([url], 1000);
  await queue.drain(send);
  assert.equal(calls, 1);
  now = 2000;
  await queue.enqueue([url], 2000);
  assert.equal(record().pending, true);
  await queue.drain(send);
  assert.equal(calls, 2);
});

test("an in-flight submission cannot overwrite a newer pending revision", async () => {
  const { store, record } = memoryStore();
  const queue = createIndexNowQueue(store, () => 5000);
  await queue.enqueue([url], 1000);
  const oldRevision = record().revision;
  await queue.drain(async () => {
    await queue.enqueue([url], 2000);
    return accepted;
  });
  assert.notEqual(record().revision, oldRevision);
  assert.equal(record().changedAt, 2000);
  assert.equal(record().pending, true);
  await queue.enqueue([url], 1500);
  assert.equal(record().changedAt, 2000);
});

test("a failed submission also cannot overwrite a concurrent fresh edit", async () => {
  const { store, record } = memoryStore();
  const queue = createIndexNowQueue(store, () => 5000);
  await queue.enqueue([url], 1000);
  await queue.drain(async () => {
    await queue.enqueue([url], 2000);
    return { ...accepted, accepted: false, status: 500, retryAfterMs: 60_000 };
  });
  assert.equal(record().changedAt, 2000);
  assert.equal(record().attempts, 0);
  assert.equal(record().pending, true);
});

test("429 retains pending URLs and its global cooldown covers new writes", async () => {
  const { store, rows, record } = memoryStore();
  let now = 1000, calls = 0;
  const queue = createIndexNowQueue(store, () => now);
  await queue.enqueue([url]);
  const send = async () => { calls++; return { ...accepted, accepted: false, status: 429, retryAfterMs: 3_600_000 }; };
  const result = await queue.drain(send);
  assert.equal(result.state, "retry_scheduled");
  assert.equal(record().pending, true);
  assert.equal(record().nextAttemptAt, 3_601_000);
  now = 2000;
  await queue.enqueue([`${INDEXNOW_ORIGIN}/about`]);
  await queue.drain(send);
  assert.equal(calls, 1);
  now = 3_601_001;
  await queue.drain(async (urls) => { assert.equal(urls.length, 2); return accepted; });
  assert.equal(record().pending, false);
  assert.equal(rows.has(INDEXNOW_LEASE_KEY), false);
});

test("concurrent drains acquire a single delivery lease", async () => {
  const { store } = memoryStore();
  const queue = createIndexNowQueue(store, () => 1000);
  await queue.enqueue([url]);
  let calls = 0;
  await Promise.all([queue.drain(async () => { calls++; return accepted; }), queue.drain(async () => { calls++; return accepted; })]);
  assert.equal(calls, 1);
});

test("expired and malformed rows are pruned without sending private URLs", async () => {
  const { store, rows } = memoryStore();
  let now = 1000;
  const queue = createIndexNowQueue(store, () => now);
  await queue.enqueue([url]);
  const forgedKey = indexNowRowKey(`${INDEXNOW_ORIGIN}/admin`);
  rows.set(forgedKey, JSON.stringify({ url: `${INDEXNOW_ORIGIN}/admin`, pending: true }));
  now += INDEXNOW_RETENTION_MS + 1;
  const result = await queue.drain(async () => { assert.fail("must not send"); return accepted; });
  assert.equal(result.expired, 2);
  assert.equal(await store.count(), 0);
});

test("202 is a receipt with verification pending, and does not repeat unchanged URLs", async () => {
  const { store, record } = memoryStore();
  const queue = createIndexNowQueue(store, () => 1000);
  await queue.enqueue([url]);
  const result = await queue.drain(async () => ({ ...accepted, status: 202, verificationPending: true }));
  assert.equal(result.state, "verification_pending");
  assert.equal(record().status, 202);
  assert.equal(record().pending, false);
});

test("a sender failure leaves the record durable and releases the lease", async () => {
  const { store, rows, record } = memoryStore();
  const queue = createIndexNowQueue(store, () => 1000);
  await queue.enqueue([url]);
  await assert.rejects(queue.drain(async () => { throw new Error("missing ownership file"); }));
  assert.equal(record().pending, true);
  assert.equal(rows.has(INDEXNOW_LEASE_KEY), false);
});
