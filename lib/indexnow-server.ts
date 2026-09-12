import { after } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "./prisma";
import { isIndexNowProduction, submitIndexNow } from "./indexnow";
import { createIndexNowQueue, INDEXNOW_CURSOR_KEY, INDEXNOW_MAX_ROWS, INDEXNOW_URL_PREFIX, type IndexNowStore } from "./indexnow-queue";
import { blogContentChange, geoContentChange, tourContentChange, visaContentChange, type PublicContentChange } from "./indexnow-content";

export const INDEXNOW_TOUR_SELECT = {
  id: true, slug: true, status: true, updatedAt: true, tripDate: true,
  description: true, notes: true, gallery: true, itinerary: true, inclusions: true,
} as const;

const store: IndexNowStore = {
  read: (key) => prisma.companyInfo.findUnique({ where: { key }, select: { key: true, value: true } }),
  list: () => prisma.companyInfo.findMany({
    where: { key: { startsWith: INDEXNOW_URL_PREFIX } },
    select: { key: true, value: true }, orderBy: { updatedAt: "asc" }, take: INDEXNOW_MAX_ROWS,
  }),
  count: () => prisma.companyInfo.count({ where: { key: { startsWith: INDEXNOW_URL_PREFIX } } }),
  async insert(key, value) {
    try {
      if (key.startsWith(INDEXNOW_URL_PREFIX)) {
        await prisma.$transaction(async (tx) => {
          // Transaction-scoped lock makes the queue capacity limit exact across
          // serverless invocations. It never encloses an external HTTP request.
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(736829105)`;
          const count = await tx.companyInfo.count({ where: { key: { startsWith: INDEXNOW_URL_PREFIX } } });
          if (count >= INDEXNOW_MAX_ROWS) throw new Error("IndexNow queue capacity reached");
          await tx.companyInfo.create({ data: { key, value } });
        }, { maxWait: 2000, timeout: 3000 });
      } else {
        await prisma.companyInfo.create({ data: { key, value } });
      }
      return true;
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") return false;
      throw error;
    }
  },
  async replace(key, expected, value) {
    return (await prisma.companyInfo.updateMany({ where: { key, value: expected }, data: { value } })).count === 1;
  },
  async remove(key, expected) {
    return (await prisma.companyInfo.deleteMany({ where: { key, value: expected } })).count === 1;
  },
};

const queue = createIndexNowQueue(store);

async function readOwnershipKey() {
  // Literal existing public asset path is intentionally traceable by Next.js.
  const keyFile = path.join(process.cwd(), "public", "a6aaa3f104904281a708265adac0440d.txt");
  const key = (await readFile(keyFile, "utf8")).trim();
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(key) || path.basename(keyFile) !== `${key}.txt`) throw new Error("Invalid IndexNow ownership file");
  return key;
}

export async function drainIndexNowQueue() {
  if (!isIndexNowProduction()) return { state: "disabled", submitted: 0, expired: 0 };
  // The only network target is the fixed protocol endpoint. No CMS URL is fetched.
  return queue.drain(async (urls) => submitIndexNow(urls, await readOwnershipKey()));
}

export async function notifyIndexNowChange(change: PublicContentChange) {
  if (!isIndexNowProduction() || !change.paths.length) return;
  try {
    // Persist first. Engine latency and engine errors never affect the save.
    await queue.enqueue(change.paths, change.changedAt?.getTime() ?? Date.now());
    after(async () => {
      try {
        const result = await drainIndexNowQueue();
        if (result.state === "retry_scheduled" || result.expired) console.warn("IndexNow delivery", result);
      } catch {
        console.warn("IndexNow delivery deferred; the daily cron will retry.");
      }
    });
  } catch {
    // A queue/storage failure must not turn a completed CMS write into a false
    // save error. Reconciliation can recover current records, but cannot recreate
    // an old URL removed by deletion, rename, or visibility change if storage
    // failed before that removal was queued.
    console.warn("IndexNow enqueue failed; content was saved. Check queue capacity/storage.");
  }
}

type Cursor = { time: string; id: string };
type ReconcileState = { blog: Cursor; tour: Cursor; visa: Cursor; geo: Cursor };
const RECONCILE_LIMIT = 10;

function windowWhere(cursor: Cursor, until: Date) {
  return { AND: [
    { updatedAt: { lte: until } },
    { OR: [{ updatedAt: { gt: new Date(cursor.time) } }, { updatedAt: new Date(cursor.time), id: { gt: cursor.id } }] },
  ] };
}

function nextCursor(rows: { id: string; updatedAt: Date }[], until: Date, previous: Cursor): Cursor {
  if (Date.parse(previous.time) >= until.getTime()) return previous;
  if (rows.length > RECONCILE_LIMIT) {
    const last = rows[RECONCILE_LIMIT - 1];
    return { time: last.updatedAt.toISOString(), id: last.id };
  }
  return { time: until.toISOString(), id: "" };
}

export async function reconcileIndexNowChanges(now = new Date()) {
  if (!isIndexNowProduction()) return { state: "disabled", examined: 0 };
  const previous = await store.read(INDEXNOW_CURSOR_KEY);
  // No historical backfill on activation. Initial catalog submission is an
  // explicit operator action; subsequent runs only inspect new database changes.
  if (!previous) {
    const initial = { time: now.toISOString(), id: "" };
    await store.insert(INDEXNOW_CURSOR_KEY, JSON.stringify({ blog: initial, tour: initial, visa: initial, geo: initial }));
    return { state: "initialized", examined: 0 };
  }
  const cursors = JSON.parse(previous.value) as ReconcileState;
  for (const kind of ["blog", "tour", "visa", "geo"] as const) {
    if (!cursors[kind] || !Number.isFinite(Date.parse(cursors[kind].time)) || typeof cursors[kind].id !== "string") throw new Error("Invalid IndexNow reconciliation cursor");
  }
  // Leave a minute for in-flight CMS writes; cursor pagination is bounded even
  // after a prolonged outage and never scans all historical URLs on every run.
  const until = new Date(now.getTime() - 60_000);
  const args = { orderBy: [{ updatedAt: "asc" as const }, { id: "asc" as const }], take: RECONCILE_LIMIT + 1 };
  const [blogs, tours, visas, geos] = await Promise.all([
    prisma.blog.findMany({ ...args, where: windowWhere(cursors.blog, until), select: { id: true, slug: true, published: true, updatedAt: true } }),
    prisma.tour.findMany({ ...args, where: windowWhere(cursors.tour, until), select: INDEXNOW_TOUR_SELECT }),
    prisma.countryVisa.findMany({ ...args, where: windowWhere(cursors.visa, until), select: { id: true, en: true, updatedAt: true } }),
    prisma.geoPage.findMany({ ...args, where: windowWhere(cursors.geo, until), select: { id: true, routePath: true, published: true, updatedAt: true } }),
  ]);
  let examined = 0;
  for (const change of [
    ...blogs.slice(0, RECONCILE_LIMIT).map((row) => blogContentChange(null, row)),
    ...tours.slice(0, RECONCILE_LIMIT).map((row) => tourContentChange(null, row)),
    ...visas.slice(0, RECONCILE_LIMIT).map((row) => visaContentChange(null, row)),
    ...geos.slice(0, RECONCILE_LIMIT).map((row) => geoContentChange(null, row)),
  ]) {
    await queue.enqueue(change.paths, change.changedAt!.getTime());
    examined++;
  }
  // Advance only after all enqueue operations succeed. Receipts make a repeat
  // run idempotent if another cron wins this compare-and-swap.
  await store.replace(INDEXNOW_CURSOR_KEY, previous.value, JSON.stringify({
    blog: nextCursor(blogs, until, cursors.blog), tour: nextCursor(tours, until, cursors.tour),
    visa: nextCursor(visas, until, cursors.visa), geo: nextCursor(geos, until, cursors.geo),
  } satisfies ReconcileState));
  return { state: "reconciled", examined };
}
