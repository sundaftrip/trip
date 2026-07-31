import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";

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

test("slice A public tour reads use an explicit DTO and only public statuses", () => {
  const collectionSource = readSource("app/api/tours/route.ts");
  const detailSource = readSource("app/api/tours/[id]/route.ts");

  for (const source of [collectionSource, detailSource]) {
    assert.match(source, /const PUBLIC_TOUR_STATUSES = \["ACTIVE", "FULL"\] as const;/);
    assert.match(source, /const TOUR_READ_SELECT = \{/);
    const selector = sourceBetween(source, "const TOUR_READ_SELECT = {", "satisfies Prisma.TourSelect;");
    assert.doesNotMatch(selector, /expenseToken\s*:/);
    assert.match(selector, /\bid:\s*true/);
    assert.match(selector, /\bstatus:\s*true/);
  }

  const collectionGet = sourceBetween(
    collectionSource,
    "export async function GET",
    "export async function POST",
  );
  assert.match(collectionGet, /hasPersistedAuthenticatedSession\(\)/);
  assert.match(collectionGet, /where\.status = \{ in: \[\.\.\.PUBLIC_TOUR_STATUSES\] \}/);
  assert.match(collectionGet, /select: TOUR_READ_SELECT/);
  assert.match(collectionGet, /return NextResponse\.json\(\[\]\)/);

  const detailGet = sourceBetween(
    detailSource,
    "export async function GET",
    "export async function PUT",
  );
  assert.match(detailGet, /hasPersistedAuthenticatedSession\(\)/);
  assert.match(detailGet, /prisma\.tour\.findFirst/);
  assert.match(detailGet, /status: \{ in: \[\.\.\.PUBLIC_TOUR_STATUSES\] \}/);
  assert.match(detailGet, /select: TOUR_READ_SELECT/);
});

test("slice A public settings use an allowlist and suppress secret-like keys", () => {
  const source = readSource("app/api/settings/route.ts");
  const allowlist = sourceBetween(
    source,
    "const PUBLIC_SETTING_KEYS = [",
    "] as const;",
  );
  const getHandler = sourceBetween(
    source,
    "export async function GET",
    "export async function PUT",
  );

  assert.match(allowlist, /"company_logo"/);
  assert.match(allowlist, /"company_name"/);
  assert.doesNotMatch(allowlist, /keuangan_reset_hash/);
  assert.doesNotMatch(allowlist, /(?:secret|token|password|credential|api[_-]?key)/i);
  assert.match(source, /SECRET_SETTING_KEY_PATTERN/);
  assert.match(source, /\|hash\|/);
  assert.match(source, /\|reset\|/);
  assert.match(getHandler, /hasPersistedAuthenticatedSession\(\)/);
  assert.match(getHandler, /where: \{ key: \{ in: \[\.\.\.PUBLIC_SETTING_KEYS\] \} \}/);
  assert.match(getHandler, /select: \{ key: true, value: true \}/);
  assert.match(getHandler, /if \(isSecretSettingKey\(item\.key\)\) return;/);
});

test("slice A administrative GET views require a currently persisted user", () => {
  for (const relativePath of [
    "app/api/tours/route.ts",
    "app/api/tours/[id]/route.ts",
    "app/api/settings/route.ts",
  ]) {
    const source = readSource(relativePath);
    const helper = sourceBetween(
      source,
      "async function hasPersistedAuthenticatedSession",
      "export async function GET",
    );

    assert.match(helper, /const userId = \(await auth\(\)\)\?\.user\?\.id/);
    assert.match(helper, /if \(!userId\) return false/);
    assert.match(helper, /prisma\.user\.findUnique/);
    assert.match(helper, /where: \{ id: userId \}/);
    assert.match(helper, /select: \{ id: true \}/);
    assert.match(helper, /catch \{/);
    assert.match(helper, /return false/);
  }
});

test("slice A daily cron authentication fails closed and compares fixed-size digests", () => {
  const source = readSource("app/api/cron/daily-scrape/route.ts");
  const authorizationHelper = sourceBetween(
    source,
    "function isAuthorizedCronRequest",
    "const REDDIT_HEADERS",
  );
  const getHandler = source.slice(source.indexOf("export async function GET"));

  assert.match(authorizationHelper, /!configuredSecret \|\| !configuredSecret\.trim\(\)/);
  assert.match(authorizationHelper, /startsWith\("Bearer "\)/);
  assert.match(authorizationHelper, /createHash\("sha256"\)/);
  assert.match(authorizationHelper, /crypto\.timingSafeEqual/);
  assert.match(getHandler, /isAuthorizedCronRequest\(authHeader, process\.env\.CRON_SECRET\)/);
  assert.doesNotMatch(getHandler, /`Bearer \$\{process\.env\.CRON_SECRET\}`/);
});
