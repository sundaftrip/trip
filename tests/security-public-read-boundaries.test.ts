import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readSource(relativePath: string) {
  return readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function sourceBetween(source: string, start: string, end: string) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `Missing source marker: ${start}`);
  assert.notEqual(endIndex, -1, `Missing source marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

function assertInOrder(source: string, markers: string[]) {
  let previousIndex = -1;
  for (const marker of markers) {
    const index = source.indexOf(marker, previousIndex + 1);
    assert.notEqual(index, -1, `Missing source marker: ${marker}`);
    assert.ok(index > previousIndex, `Expected ${marker} after ${markers[markers.indexOf(marker) - 1]}`);
    previousIndex = index;
  }
}

test("public blog reads expose published records while persisted users may read drafts", () => {
  const collectionSource = readSource("app/api/blog/route.ts");
  const detailSource = readSource("app/api/blog/[id]/route.ts");
  const collectionGet = sourceBetween(
    collectionSource,
    "export async function GET",
    "export async function POST",
  );
  const detailGet = sourceBetween(
    detailSource,
    "export async function GET",
    "export async function PUT",
  );

  for (const handler of [collectionGet, detailGet]) {
    assert.match(handler, /const session = await auth\(\)/);
    assert.match(handler, /const canReadDrafts = await hasPersistedUser\(session\)/);
    assert.match(handler, /if \(canReadDrafts\) response\.headers\.set\("Cache-Control", "private, no-store"\)/);
  }

  assert.match(
    collectionGet,
    /if \(!canReadDrafts \|\| published === "true"\) where\.published = true/,
  );
  assert.match(collectionGet, /prisma\.blog\.findMany\(\{ where,/);
  assert.match(
    detailGet,
    /\.\.\.\(!canReadDrafts \? \{ published: true \} : \{\}\)/,
  );
  assert.match(detailGet, /prisma\.blog\.findFirst/);
});

test("public GEO reads expose supported published records while persisted users may read drafts", () => {
  const collectionSource = readSource("app/api/geo-pages/route.ts");
  const detailSource = readSource("app/api/geo-pages/[id]/route.ts");
  const collectionGet = sourceBetween(
    collectionSource,
    "export async function GET",
    "export async function POST",
  );
  const detailGet = sourceBetween(
    detailSource,
    "export async function GET",
    "export async function PUT",
  );

  for (const handler of [collectionGet, detailGet]) {
    assert.match(handler, /const session = await auth\(\)/);
    assert.match(handler, /const canReadDrafts = await hasPersistedUser\(session\)/);
    assert.match(handler, /if \(canReadDrafts\) response\.headers\.set\("Cache-Control", "private, no-store"\)/);
  }

  assert.match(
    collectionGet,
    /where: canReadDrafts \? undefined : \{ published: true, routePath: \{ in: GEO_CMS_ROUTES\.map\(\(route\) => route\.routePath\) \} \}/,
  );
  assert.match(collectionGet, /prisma\.geoPage\.findMany/);
  assert.match(
    detailGet,
    /\.\.\.\(!canReadDrafts \? \{ published: true, routePath: \{ in: GEO_CMS_ROUTES\.map\(\(route\) => route\.routePath\) \} \} : \{\}\)/,
  );
  assert.match(detailGet, /prisma\.geoPage\.findFirst/);
});

test("FAQ all-mode and mutations require persisted authorization", () => {
  const collectionSource = readSource("app/api/faq/route.ts");
  const detailSource = readSource("app/api/faq/[id]/route.ts");
  const getHandler = sourceBetween(
    collectionSource,
    "export async function GET",
    "export async function POST",
  );

  assert.match(
    getHandler,
    /const showAll = requestedAll && await hasPersistedUser\(await auth\(\)\)/,
  );
  assert.match(getHandler, /\.\.\.\(showAll \? \{\} : \{ active: true \}\)/);
  assert.match(
    getHandler,
    /if \(showAll\) response\.headers\.set\("Cache-Control", "private, no-store"\)/,
  );

  const mutationHandlers = [
    collectionSource.slice(collectionSource.indexOf("export async function POST")),
    sourceBetween(detailSource, "export async function PUT", "export async function DELETE"),
    detailSource.slice(detailSource.indexOf("export async function DELETE")),
  ];

  for (const handler of mutationHandlers) {
    assert.match(handler, /const session = await auth\(\)/);
    assert.match(handler, /if \(!session\?\.user\)/);
    assert.match(handler, /checkPermission\(session, "text_edit"\)/);
    assert.ok(
      handler.indexOf('checkPermission(session, "text_edit")') < handler.indexOf("prisma.faq."),
      "FAQ permission check must happen before its Prisma mutation",
    );
  }
});

test("receipt pages authorize before querying customer payment data", () => {
  const cases = [
    {
      path: "app/admin/receipts/page.tsx",
      permission: 'checkPermission(session, "receipt_view")',
      query: "prisma.receipt.findMany",
    },
    {
      path: "app/admin/receipts/[id]/page.tsx",
      permission: 'checkPermissions(session, ["receipt_view", "receipt_edit"])',
      query: "prisma.receipt.findUnique",
    },
    {
      path: "app/admin/receipts/[id]/print/page.tsx",
      permission: 'checkPermission(session, "receipt_view")',
      query: "prisma.receipt.findUnique",
    },
    {
      path: "app/admin/receipts/new/page.tsx",
      permission: 'checkPermission(session, "receipt_create")',
      query: "prisma.tour.findMany",
    },
  ];

  for (const entry of cases) {
    const source = readSource(entry.path);
    assertInOrder(source, [
      "const session = await auth()",
      "if (!session?.user)",
      entry.permission,
      entry.query,
    ]);
  }
});

test("finance data authorizes finance_view before any Prisma query", () => {
  const source = readSource("lib/keuangan/data.ts");
  const fetchAll = sourceBetween(source, "async function fetchAll", "type AllData");

  assertInOrder(fetchAll, [
    "const session = await auth()",
    "if (!session?.user)",
    'checkPermission(session, "finance_view")',
    "prisma.tour.findMany",
  ]);
});
