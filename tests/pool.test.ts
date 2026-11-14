import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import {
  addDays, buildGenericPools, buildKzPools, catalogPayload, checkGenericQuota, checkKzPlacement,
  jakartaToday, kzPublicPayload, makeKode, normWa, normalizeContent, normalizeKzSettings, normalizeTiers,
  parseGenericInput, parseKzInput, priceAt, summaryPayload,
  type DestBundle, type PoolCountRow, type PoolDestinationData, type PublicContext,
} from "../lib/pool/core";
import { POOL_DEFAULT_DESTINATIONS } from "../lib/pool/defaults";
import { parseKzSheet, parseSheetDate, parseSheetTimestamp, parseTable } from "../lib/pool/import";
import { ADMIN_MODULES, canOpenAdminModule } from "../lib/admin-modules";
import { DEFAULT_PERMISSIONS, resolvePermissionMap } from "../lib/permission-keys";
import { isViewerWriteBlockedPath } from "../lib/viewer-access";

const TODAY = "2026-11-15";
const NOW = Date.UTC(2026, 10, 15, 3, 0);
const ctx: PublicContext = { open: true, today: TODAY, wa: "6281775202759", base: "https://sundaftrip.com/pool", now: NOW };

const dest = (code: string): PoolDestinationData => {
  const seed = POOL_DEFAULT_DESTINATIONS.find((d) => d.code === code)!;
  return { ...seed, id: `id-${code}` };
};
const KZ = dest("kazakhstan");
const row = (poolDate: string, pkg: string, pax: number, extra: Partial<PoolCountRow> = {}): PoolCountRow => ({
  poolDate, arrivalDate: poolDate, pkg, pax, interest: false, kgPlan: null, createdAt: NOW, ...extra,
});
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("dates use the Jakarta day and plain calendar arithmetic", () => {
  assert.equal(jakartaToday(Date.UTC(2026, 10, 14, 17, 30)), "2026-11-15");
  assert.equal(jakartaToday(Date.UTC(2026, 10, 14, 16, 59)), "2026-11-14");
  assert.equal(addDays("2027-02-27", 2), "2027-03-01");
});

test("WhatsApp numbers are normalised to digits with a country code", () => {
  assert.equal(normWa("0812 3456 7890"), "6281234567890");
  assert.equal(normWa("+62 812-3456-7890"), "6281234567890");
  assert.equal(normWa("81234567890"), "6281234567890");
  assert.equal(normWa("12345"), "");
});

test("price follows the highest tier whose head count is reached", () => {
  const tiers = KZ.packages[0].tiers;
  assert.equal(priceAt(tiers, 1), 10403820);
  assert.equal(priceAt(tiers, 6), 6378533);
  assert.equal(priceAt(tiers, 19), 6543673);
  assert.equal(priceAt(tiers, 45), 5284480);
  assert.deepEqual(normalizeTiers([{ n: 6, p: 10 }, { n: 2, p: 30 }, { n: 0, p: 5 }, { n: 4, p: -1 }, "x"]), [{ n: 2, p: 30 }, { n: 6, p: 10 }]);
});

test("Kazakhstan pools match the numbers the old Sheet reported", () => {
  // Tanggal 24 Mar 2027 di Sheet: 2 orang paket 8 hari, 7 orang KZ + Kirgistan, 1 orang "6 atau 8 hari".
  const rows = [
    row("2027-03-24", "8", 2), row("2027-03-24", "6,8", 1),
    row("2027-03-24", "KG", 2, { kgPlan: { kz: 3, x: "darat", kgd: 3 } }), row("2027-03-24", "KG", 1), row("2027-03-24", "KG", 2), row("2027-03-24", "KG", 2),
    row("2027-01-04", "8", 2), row("2027-01-04", "minat", 2, { interest: true }),
    row("2026-11-01", "5", 4),
  ];
  const pools = buildKzPools(KZ, rows, [], TODAY);
  assert.deepEqual(pools.map((p) => p.d), ["2027-01-04", "2027-03-24"], "finished groups and interest rows are left out");
  const mar = pools[1];
  assert.deepEqual([mar.n, mar.p5, mar.p6, mar.p8, mar.kg, mar.px, mar.r], [10, 0, 0, 2, 7, 1, 6]);
  assert.equal(mar.e, "2027-03-31");
  assert.deepEqual([mar.q, mar.full, mar.g], [30, false, false]);
});

test("a date closed by the admin is sent as full, and a group link only as a flag", () => {
  const dates = [{ date: "2027-02-01", quota: 0, groupLink: "" }, { date: "2027-03-24", quota: 12, groupLink: "https://chat.whatsapp.com/SECRETLINK" }];
  const pools = buildKzPools(KZ, [row("2027-03-24", "5", 12)], dates, TODAY);
  assert.deepEqual(pools.map((p) => [p.d, p.n, p.q, p.full, p.g]), [["2027-02-01", 0, 0, true, false], ["2027-03-24", 12, 12, true, true]]);
  const payload = JSON.stringify(kzPublicPayload(KZ, [row("2027-03-24", "5", 12)], dates, ctx));
  assert.doesNotMatch(payload, /SECRETLINK/, "the group link itself is only returned to someone who just signed up");
});

test("the Kazakhstan API keeps the shape the page reads", () => {
  const body = kzPublicPayload(KZ, [row("2027-03-22", "5", 4)], [], ctx);
  assert.deepEqual(
    Object.keys(body),
    ["ok", "version", "open", "today", "minDays", "maxPax", "quota", "joinMax", "milestones", "prices", "kurs", "wa", "share", "meet", "meetTime", "night", "pools", "recent", "total", "updated"],
  );
  assert.deepEqual([body.version, body.open, body.minDays, body.maxPax, body.quota, body.joinMax, body.total], [3, true, 7, 10, 30, 3, 4]);
  assert.deepEqual(body.prices.tiers[2], { n: 6, p5: 6378533, p6: 7596440, p8: 10032255 });
  assert.deepEqual(body.prices.single, { p5: 1816540, p6: 2270675, p8: 3178945 });
  assert.equal(body.share, "https://sundaftrip.com/kazakhstan");
  assert.equal(kzPublicPayload({ ...KZ, status: "tutup" }, [], [], ctx).open, false);
  assert.equal(kzPublicPayload(KZ, [], [], { ...ctx, open: false }).open, false);
});

test("public payloads are built from count rows and never carry personal data", () => {
  // PoolCountRow has no name/WhatsApp field at all; extra properties on the input must not leak either.
  const leaky = { ...row("2027-03-22", "5", 2), name: "Rina Pelanggan", whatsapp: "6281234567890", note: "alergi kacang" } as PoolCountRow;
  const bundles: DestBundle[] = [
    { dest: KZ, rows: [leaky], dates: [] },
    { dest: dest("rusia"), rows: [{ ...leaky, interest: true, pkg: "minat" }], dates: [] },
  ];
  for (const payload of [kzPublicPayload(KZ, [leaky], [], ctx), catalogPayload(bundles, ctx), summaryPayload(bundles, ctx)]) {
    const text = JSON.stringify(payload);
    assert.doesNotMatch(text, /Rina|6281234567890|alergi/);
    assert.doesNotMatch(text, /"(name|nama|whatsapp|note|adminNote|kode)":"Rina/);
  }
  const store = read("lib/pool/store.ts");
  const select = store.match(/const COUNT_SELECT = \{([^}]+)\}/)?.[1] ?? "";
  assert.ok(select.includes("poolDate") && select.includes("pax"));
  assert.doesNotMatch(select, /name|whatsapp|note|kode|flight|hotel/, "public queries select counting columns only");
  for (const route of ["app/api/pool/route.ts", "app/api/pool/kazakhstan/route.ts", "app/api/pool/summary/route.ts"]) {
    assert.doesNotMatch(read(route), /loadAdminData|poolSignup|whatsapp/, `${route} must not read personal data`);
  }
});

test("the country catalogue keeps the shape /pool reads and links Kazakhstan to its own page", () => {
  const bundles: DestBundle[] = [
    { dest: KZ, rows: [row("2027-03-22", "5", 4), row("2027-03-22", "KG", 2)], dates: [] },
    { dest: dest("rusia"), rows: [row("2027-06-01", "minat", 3, { interest: true })], dates: [] },
  ];
  const cat = catalogPayload(bundles, ctx);
  assert.deepEqual(Object.keys(cat), ["ok", "version", "open", "today", "wa", "base", "updated", "dests"]);
  const [kz, ru] = cat.dests;
  assert.equal(kz.url, "/kazakhstan");
  assert.deepEqual([kz.total, kz.pools[0].n, kz.pools[0].by.KG, kz.pkgs.length], [6, 6, 2, 3]);
  assert.equal("url" in ru, false);
  assert.deepEqual([ru.status, ru.minat, ru.total, ru.pkgs.length], ["segera", 3, 0, 0]);
  for (const key of ["code", "name", "status", "city", "title", "lede", "milestones", "minDays", "maxPax", "cap", "incl", "excl", "notes", "pay", "meet", "pkgs", "route", "addons", "pools", "recent", "total", "minat"]) {
    assert.ok(key in ru, `dest.${key}`);
  }
});

test("the home summary lists open countries with people per date", () => {
  const bundles: DestBundle[] = [
    { dest: KZ, rows: [row("2027-03-22", "5", 4), row("2027-03-24", "8", 10)], dates: [{ date: "2027-03-24", quota: 10, groupLink: "" }] },
    { dest: dest("rusia"), rows: [row("2027-06-01", "minat", 3, { interest: true }), row("2027-06-01", "minat", 1, { interest: true })], dates: [] },
    { dest: { ...dest("kirgistan"), status: "draf" }, rows: [], dates: [] },
  ];
  const s = summaryPayload(bundles, ctx);
  assert.deepEqual(s.dests.map((d) => [d.code, d.mode, d.url, d.total]), [["kazakhstan", "pool", "/kazakhstan", 14], ["rusia", "minat", "/pool/rusia", 4]]);
  assert.deepEqual(s.dests[0].dates, [{ d: "2027-03-22", n: 4, full: false }, { d: "2027-03-24", n: 10, full: true }]);
  assert.deepEqual([s.dests[0].first, s.dests[0].from, s.dests[0].minDate], [6, 5284480, "2026-11-22"]);
  assert.deepEqual(s.dests[1].dates, [{ d: "2027-06-01", n: 4, full: false }]);
});

test("Kazakhstan sign-ups are validated like the old Apps Script did", () => {
  const base = { d: "2027-03-24", j: "", pkg: "8,5", pax: 2, flex: true, t: "23:10", via: "pesawat", fl: "ca 455!", hotel: "paket", hn: "x", note: " halo ", name: "  Rina  Wati ", wa: "0812-3456-7890", hp: "" };
  const ok = parseKzInput(base, KZ, TODAY);
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.deepEqual(
      [ok.value.pkg, ok.value.g, ok.value.name, ok.value.wa, ok.value.fl, ok.value.hn, ok.value.note, ok.value.flex],
      ["5,8", "2027-03-24", "Rina Wati", "6281234567890", "CA 455", "", "halo", true],
    );
  }
  const field = (patch: Record<string, unknown>) => { const r = parseKzInput({ ...base, ...patch }, KZ, TODAY); return r.ok ? "" : r.field; };
  assert.equal(field({ d: "2026-11-20" }), "d", "earlier than today + 7 days");
  assert.equal(field({ d: addDays(TODAY, 451) }), "d");
  assert.equal(field({ d: "2027-02-30" }), "d");
  assert.equal(field({ pkg: "7" }), "pkg");
  assert.equal(field({ pkg: "5,6,8" }), "pkg");
  assert.equal(field({ pax: 11 }), "pax");
  assert.equal(field({ pax: 0 }), "pax");
  assert.equal(field({ t: "25:00" }), "t");
  assert.equal(field({ name: "R" }), "name");
  assert.equal(field({ wa: "123" }), "wa");
  assert.equal(field({ pkg: "KG", kg: { kz: 9, x: "darat", kgd: 3 } }), "kg");
  const kg = parseKzInput({ ...base, pkg: "KG", kg: { kz: 4, x: "pesawat", kgd: 2 } }, KZ, TODAY);
  assert.deepEqual(kg.ok && kg.value.kg, { kz: 4, x: "pesawat", kgd: 2 });
  assert.equal(parseKzInput("x", KZ, TODAY).ok, false);
});

test("quota and catching up with an earlier group are checked against current pools", () => {
  const input = (patch: Record<string, unknown>) => {
    const r = parseKzInput({ d: "2027-03-24", j: "", pkg: "5", pax: 2, via: "lokal", name: "Rina", wa: "081234567890", ...patch }, KZ, TODAY);
    assert.equal(r.ok, true);
    return r.ok ? r.value : (undefined as never);
  };
  const pools = buildKzPools(KZ, [row("2027-03-22", "8", 28), row("2027-03-10", "5", 30)], [], TODAY);
  assert.equal(checkKzPlacement(input({}), pools, KZ, []), null);
  assert.equal(checkKzPlacement(input({ d: "2027-03-22", pax: 2 }), pools, KZ, []), null);
  assert.deepEqual(checkKzPlacement(input({ d: "2027-03-22", pax: 3 }), pools, KZ, [])?.field, "pax");
  assert.deepEqual(checkKzPlacement(input({ d: "2027-03-10" }), pools, KZ, [])?.field, "d");
  assert.deepEqual(checkKzPlacement(input({ d: "2027-04-01" }), pools, KZ, [{ date: "2027-04-01", quota: 0, groupLink: "" }])?.field, "d");
  // Nyusul: rombongan 22 Mar (8 hari) masih jalan pada 24 Mar; selisih maksimal 3 hari.
  assert.equal(checkKzPlacement(input({ j: "2027-03-22" }), pools, KZ, []), null);
  assert.deepEqual(checkKzPlacement(input({ d: "2027-03-26", j: "2027-03-22" }), pools, KZ, [])?.field, "j");
  assert.deepEqual(checkKzPlacement(input({ j: "2027-03-23" }), pools, KZ, [])?.field, "j", "no group on that date");
  assert.deepEqual(checkKzPlacement(input({ d: "2027-03-12", j: "2027-03-10" }), pools, KZ, [])?.field, "j", "a full group cannot be joined");
});

test("other countries: interest list while there is no price, pool once packages exist", () => {
  const ru = dest("rusia");
  const minat = parseGenericInput({ dest: "rusia", d: "2027-01-10", pkg: "5", pax: 2, name: "Rina", wa: "081234567890" }, ru, TODAY);
  assert.deepEqual(minat.ok && [minat.value.interest, minat.value.pkg], [true, "minat"]);

  const open: PoolDestinationData = { ...ru, status: "buka", quota: 6, packages: [{ code: "7", name: "7 hari", days: 7, summary: "", single: 0, tiers: [{ n: 2, p: 20_000_000 }] }, { code: "5", name: "5 hari", days: 5, summary: "", single: 0, tiers: [{ n: 2, p: 15_000_000 }] }] };
  const pool = parseGenericInput({ d: "2027-01-10", pkg: "5,7", pax: 4, name: "Rina", wa: "081234567890" }, open, TODAY);
  assert.deepEqual(pool.ok && [pool.value.interest, pool.value.pkg], [false, "7,5"], "package order follows the catalogue");
  const bad = (patch: Record<string, unknown>) => { const r = parseGenericInput({ d: "2027-01-10", pkg: "5", pax: 2, name: "Rina", wa: "081234567890", ...patch }, open, TODAY); return r.ok ? "" : r.field; };
  assert.equal(bad({ pkg: "9" }), "pkg");
  assert.equal(bad({ d: "2026-12-01" }), "d", "earlier than today + 30 days");
  assert.equal(bad({ pkg: "minat" }), "", "an explicit interest sign-up is always accepted");
  if (pool.ok) {
    assert.equal(checkGenericQuota(pool.value, 2, open, []), null);
    assert.equal(checkGenericQuota(pool.value, 3, open, [])?.field, "pax");
    assert.equal(checkGenericQuota(pool.value, 6, open, [])?.field, "d");
  }
  const pools = buildGenericPools([row("2027-01-10", "5", 2), row("2027-01-10", "7,5", 3), row("2026-10-01", "5", 9)], [], TODAY);
  assert.deepEqual(pools, [{ d: "2027-01-10", n: 5, by: { "5": 2 }, px: 3, r: 2, g: false }]);
});

test("stored JSON is cleaned before it reaches a page", () => {
  const content = normalizeContent({ incl: ["  Hotel  ", "", 5], route: [{ t: "Tiba", d: "x", k: ["7", 3] }, { d: "tanpa judul" }], addons: [{ name: "Berkuda", price: "Rp150.000" }, "x"] });
  assert.deepEqual(content.incl, ["Hotel"]);
  assert.deepEqual(content.route, [{ t: "Tiba", d: "x", k: ["7"] }]);
  assert.deepEqual(content.addons, [{ name: "Berkuda", price: "Rp150.000", note: "" }]);
  assert.deepEqual(normalizeKzSettings({ joinMax: 99, night: { from: "22:00", to: "6am" } }).night, { from: "22:00", to: "06:00", fee: 0 });
  assert.equal(normalizeKzSettings({ night: null }).night, null);
  assert.match(makeKode("kazakhstan", () => 0), /^KZ-2222$/);
  assert.match(makeKode("kirgistan"), /^KG-[2-9A-HJ-NP-Z]{4}$/);
  assert.match(makeKode("selandia-baru"), /^SE-/);
});

test("the old Sheet's Pendaftar tab imports cleanly", () => {
  assert.equal(parseSheetDate("Rab, 24 Mar 2027"), "2027-03-24");
  assert.equal(parseSheetDate("4 Januari 2027"), "2027-01-04");
  assert.equal(parseSheetDate("31/02/2027"), "");
  assert.equal(parseSheetTimestamp("14 Okt 2026, 22:09"), Date.UTC(2026, 9, 14, 15, 9));
  assert.deepEqual(parseTable('a,"b,1"\n"c ""d""",e\n\n'), [["a", "b,1"], ['c "d"', "e"]]);

  const head = ["Waktu daftar", "Kode", "Nama", "WhatsApp", "Jumlah orang", "Tanggal tiba", "Paket", "Tanggal fleksibel", "Status", "Chat", "Jam tiba", "Datang via", "No. penerbangan", "Hotel", "Nyusul rombongan", "Rencana Kirgistan", "Catatan"];
  const lines = [
    head,
    ["14 Okt 2026, 22:09", "KZ-MKLD", "Rina", "'0812 3456 7890", "1", "Rab, 24 Mar 2027", "5 atau 8 hari", "Tidak", "Batal", "", "", "", "", "", "", "", ""],
    ["17 Okt 2026, 18:09", "KZ-YQAJ", "Budi", "6281111111111", "2", "Rab, 24 Mar 2027", "KZ + Kirgistan", "Ya", "Baru", "", "23:00", "Pesawat ke Almaty", "ca455", "Hotel paket", "", "Kazakhstan 3 hari → darat → Kirgistan 3 hari", "vegetarian"],
    ["15 Okt 2026, 06:48", "KZ-9SDJ", "Sari", "81222222222", "2", "Rab, 11 Nov 2026", "KZ+KG (segera)", "Tidak", "Baru", "", "", "", "", "", "", "", ""],
    ["18 Okt 2026, 10:37", "KZ-KDA5", "Tono", "0813 3333 3333", "1", "Kam, 25 Mar 2027", "6 hari", "Tidak", "DP masuk", "", "", "Darat dari Bishkek", "", "Sendiri: Rixos", "Rab, 24 Mar 2027", "", ""],
    ["18 Okt 2026, 10:49", "KZ-KDA5", "Dobel", "0813 3333 3333", "1", "Kam, 25 Mar 2027", "6 hari", "", "", "", "", "", "", "", "", "", ""],
    ["18 Okt 2026, 11:00", "KZ-XXXX", "Tanpa nomor", "", "1", "Kam, 25 Mar 2027", "6 hari", "", "", "", "", "", "", "", "", "", ""],
  ];
  const result = parseKzSheet(lines.map((l) => l.join("\t")).join("\n"));
  assert.deepEqual(result.rows.map((r) => [r.kode, r.pkg, r.status, r.interest, r.poolDate, r.arrivalDate]), [
    ["KZ-MKLD", "5,8", "batal", false, "2027-03-24", "2027-03-24"],
    ["KZ-YQAJ", "KG", "aktif", false, "2027-03-24", "2027-03-24"],
    ["KZ-9SDJ", "minat", "aktif", true, "2026-11-11", "2026-11-11"],
    ["KZ-KDA5", "6", "aktif", false, "2027-03-24", "2027-03-25"],
  ]);
  const budi = result.rows[1];
  assert.deepEqual([budi.whatsapp, budi.pax, budi.flex, budi.arrivalTime, budi.via, budi.flight, budi.hotel, budi.note], ["6281111111111", 2, true, "23:00", "pesawat", "CA455", "paket", "vegetarian"]);
  assert.deepEqual(budi.kgPlan, { kz: 3, x: "darat", kgd: 3 });
  const tono = result.rows[3];
  assert.deepEqual([tono.via, tono.hotel, tono.hotelName, tono.adminNote], ["darat", "sendiri", "Rixos", "Status di Sheet: DP masuk"]);
  assert.equal(result.rows[0].whatsapp, "6281234567890");
  assert.deepEqual(result.skipped.map((s) => s.line), [6, 7]);
  assert.equal(parseKzSheet("Nama\tNomor\nRina\t0812").skipped.length, 1, "an unknown header row is refused");
});

test("pool registrants are owner-only by default and guarded on every CMS route", () => {
  assert.equal(resolvePermissionMap("SUPERADMIN", null).pool_view, true);
  for (const role of ["ADMIN", "EDITOR", "VIEWER"]) {
    assert.equal(DEFAULT_PERMISSIONS[role].pool_view, false, `${role} cannot see registrants by default`);
    assert.equal(DEFAULT_PERMISSIONS[role].pool_edit, false);
  }
  assert.equal(resolvePermissionMap("ADMIN", { pool_view: true }).pool_view, true, "access can be granted per account");
  const mod = ADMIN_MODULES.find((m) => m.key === "pool")!;
  assert.equal(canOpenAdminModule(mod, { role: "ADMIN", permissions: resolvePermissionMap("ADMIN", null) }), false);
  assert.equal(canOpenAdminModule(mod, { role: "VIEWER", permissions: resolvePermissionMap("VIEWER", null) }), false);

  // Publik hanya boleh menulis ke /api/pool; route CMS ada di /api/pool-admin dan tetap terkunci.
  assert.equal(isViewerWriteBlockedPath("/api/pool/kazakhstan"), false);
  assert.equal(isViewerWriteBlockedPath("/api/pool-admin/signups"), true);

  const routes = readdirSync(new URL("../app/api/pool-admin", import.meta.url), { recursive: true }).map(String).filter((f) => f.endsWith("route.ts"));
  assert.equal(routes.length, 8);
  for (const file of routes) {
    assert.match(read(`app/api/pool-admin/${file}`), /poolMutation\(|requirePoolPermission\("pool_view"\)/, `${file} checks a pool permission`);
  }
  assert.match(read("lib/pool/admin-guard.ts"), /requirePoolPermission\("pool_edit"\)/);
  assert.match(read("app/admin/pool/page.tsx"), /requireAdminModule\("pool"\)[\s\S]*can\(viewer, "pool_view"\)[\s\S]*loadAdminData\(\)/, "registrants load only after the permission check");
});

test("the pool pages talk to the website API, not to Apps Script", () => {
  const kz = read("public/kazakhstan/index.html");
  const pool = read("public/pool/index.html");
  assert.match(kz, /var API_URL = '\/api\/pool\/kazakhstan';/);
  assert.match(pool, /var API_URL = '\/api\/pool';/);
  for (const html of [kz, pool]) {
    assert.doesNotMatch(html, /script\.google\.com/);
    assert.match(html, /\[\?&\]d=\(\\d\{4\}-\\d\{2\}-\\d\{2\}\)/, "supports ?d= deep links from the home page");
  }
  assert.match(pool, /function ownUrl\(d\)/);
  assert.match(read("next.config.ts"), /source: "\/pool\/:slug", destination: "\/pool\/index\.html"/);
});

test("the home finder has an Open trip tab and a Gabung tanggal tab", () => {
  const home = read("components/website/clean/CleanHome.tsx");
  const tabs = read("components/website/clean/home/HomeFinderTabs.tsx");
  assert.match(home, /<HomeFinderTabs>\s*<HomeSearchForm/);
  assert.match(tabs, /tabButton\("trip", "Open trip"\)/);
  assert.match(tabs, /tabButton\("pool", "Gabung tanggal"\)/);
  assert.match(tabs, /fetch\("\/api\/pool\/summary"/);
  assert.match(tabs, /role="tablist"/);
  assert.equal(tabs.match(/role="tabpanel"/g)?.length, 2);
  assert.match(tabs, /<small>NEGARA<\/small>/);
  assert.match(tabs, /TANGGAL TIBA/);
});
