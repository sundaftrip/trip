import { createHash, randomUUID } from "node:crypto";
import { INTERNAL_COMPANY_INFO_PREFIX } from "./company-info";
import { canonicalIndexNowUrl, INDEXNOW_BATCH_SIZE, indexNowRetryDelay, type IndexNowResult } from "./indexnow";

export const INDEXNOW_URL_PREFIX = `${INTERNAL_COMPANY_INFO_PREFIX}url_`;
export const INDEXNOW_LEASE_KEY = `${INTERNAL_COMPANY_INFO_PREFIX}lease`;
export const INDEXNOW_CURSOR_KEY = `${INTERNAL_COMPANY_INFO_PREFIX}cursor`;
export const INDEXNOW_MAX_ROWS = 1000;
export const INDEXNOW_RETENTION_MS = 30 * 24 * 60 * 60_000;

export type QueueRow = { key: string; value: string };
export interface IndexNowStore {
  read(key: string): Promise<QueueRow | null>;
  list(): Promise<QueueRow[]>;
  count(): Promise<number>;
  insert(key: string, value: string): Promise<boolean>;
  replace(key: string, expected: string, value: string): Promise<boolean>;
  remove(key: string, expected: string): Promise<boolean>;
}

export type IndexNowRecord = {
  url: string;
  revision: string;
  changedAt: number;
  expiresAt: number;
  pending: boolean;
  attempts: number;
  nextAttemptAt: number;
  status: number | null;
};

export function indexNowRowKey(url: string) {
  return `${INDEXNOW_URL_PREFIX}${createHash("sha256").update(url).digest("hex")}`;
}

export function parseIndexNowRecord(row: QueueRow): IndexNowRecord | null {
  try {
    if (row.value.length > 4096) return null;
    const record = JSON.parse(row.value) as IndexNowRecord;
    if (canonicalIndexNowUrl(record.url) !== record.url || row.key !== indexNowRowKey(record.url)) return null;
    if (typeof record.revision !== "string" || typeof record.pending !== "boolean") return null;
    if (![record.changedAt, record.expiresAt, record.attempts, record.nextAttemptAt].every(Number.isFinite)) return null;
    if (record.attempts < 0 || record.attempts > 1000 || record.expiresAt < record.changedAt) return null;
    return record;
  } catch {
    return null;
  }
}

export function createIndexNowQueue(store: IndexNowStore, now: () => number = Date.now) {
  async function enqueue(paths: string[], changedAt = now()) {
    const urls = [...new Set(paths.map(canonicalIndexNowUrl).filter((url): url is string => !!url))];
    if (urls.length > INDEXNOW_BATCH_SIZE || !Number.isFinite(changedAt)) throw new Error("Invalid IndexNow change batch");
    let queued = 0;
    for (const url of urls) {
      const key = indexNowRowKey(url);
      let saved = false;
      // Compare-and-swap prevents concurrent writers from erasing newer edits.
      for (let attempt = 0; attempt < 4; attempt++) {
        const existing = await store.read(key);
        const record = existing && parseIndexNowRecord(existing);
        if (record && record.changedAt >= changedAt) { saved = true; break; }
        const value = JSON.stringify({
          url, revision: randomUUID(), changedAt, expiresAt: now() + INDEXNOW_RETENTION_MS,
          pending: true, attempts: 0, nextAttemptAt: 0, status: null,
        } satisfies IndexNowRecord);
        if (existing) {
          saved = await store.replace(key, existing.value, value);
        } else {
          // A conservative cap keeps CMS operational data small. The database
          // adapter serializes new inserts to enforce this across invocations.
          if (await store.count() >= INDEXNOW_MAX_ROWS) throw new Error("IndexNow queue capacity reached");
          saved = await store.insert(key, value);
        }
        if (saved) { queued++; break; }
      }
      if (!saved) throw new Error("IndexNow enqueue contention");
    }
    return queued;
  }

  async function acquireLease() {
    const existing = await store.read(INDEXNOW_LEASE_KEY);
    if (existing) {
      try {
        if (JSON.parse(existing.value).until > now()) return null;
      } catch { /* Recover a malformed internal lease using compare-and-swap. */ }
    }
    const value = JSON.stringify({ token: randomUUID(), until: now() + 60_000 });
    const acquired = existing
      ? await store.replace(INDEXNOW_LEASE_KEY, existing.value, value)
      : await store.insert(INDEXNOW_LEASE_KEY, value);
    return acquired ? value : null;
  }

  async function drain(send: (urls: string[]) => Promise<IndexNowResult>) {
    const lease = await acquireLease();
    if (!lease) return { state: "busy" as const, submitted: 0, expired: 0 };
    let retainedLease = false;
    try {
      const eligible: { row: QueueRow; record: IndexNowRecord }[] = [];
      let expired = 0;
      for (const row of await store.list()) {
        const record = parseIndexNowRecord(row);
        if (!record || record.expiresAt <= now()) {
          if (await store.remove(row.key, row.value)) expired++;
          continue;
        }
        if (record.pending && record.nextAttemptAt <= now() && eligible.length < INDEXNOW_BATCH_SIZE) eligible.push({ row, record });
      }
      if (!eligible.length) return { state: "idle" as const, submitted: 0, expired };
      const result = await send(eligible.map(({ record }) => record.url));
      const delay = Math.max(result.retryAfterMs, ...eligible.map(({ record }) => indexNowRetryDelay(result.status, record.attempts, null, now())));
      for (const { row, record } of eligible) {
        const value = JSON.stringify({
          ...record,
          pending: !result.accepted,
          attempts: Math.min(record.attempts + 1, 1000),
          nextAttemptAt: result.accepted ? 0 : now() + delay,
          status: result.status,
        } satisfies IndexNowRecord);
        // Keep a bounded receipt to deduplicate reconciliation. A new edit that
        // arrived during HTTP keeps its newer pending revision untouched.
        await store.replace(row.key, row.value, value);
      }
      if (!result.accepted) {
        // Engine throttling/configuration failures also apply to new CMS writes.
        retainedLease = await store.replace(INDEXNOW_LEASE_KEY, lease, JSON.stringify({ token: randomUUID(), until: now() + delay }));
      }
      return {
        state: result.accepted ? (result.verificationPending ? "verification_pending" : "accepted") : "retry_scheduled",
        status: result.status,
        submitted: result.accepted ? eligible.length : 0,
        expired,
      };
    } finally {
      if (!retainedLease) await store.remove(INDEXNOW_LEASE_KEY, lease);
    }
  }

  return { enqueue, drain };
}
