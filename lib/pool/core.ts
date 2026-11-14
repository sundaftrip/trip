/* Pool land tour: logika murni (tanpa database) yang dipakai API publik dan CMS.

   Aturan privasi: semua fungsi "publik" di file ini hanya menerima PoolCountRow,
   yaitu baris pendaftaran TANPA nama dan nomor WhatsApp. Data pribadi hanya
   dibaca lewat lib/pool/store.ts oleh route CMS yang sudah memeriksa izin. */

export const POOL_STATUSES = ["buka", "segera", "draf", "tutup"] as const;
export type PoolStatus = (typeof POOL_STATUSES)[number];
export const POOL_ENGINES = ["generic", "kazakhstan"] as const;
export type PoolEngine = (typeof POOL_ENGINES)[number];

/** Tanggal tiba paling jauh yang bisa dipilih: hari ini + 450 hari. */
export const POOL_MAX_DAYS_AHEAD = 450;
export const POOL_NO_QUOTA = 999;

export type PoolTier = { n: number; p: number };
export type PoolPackageData = { code: string; name: string; days: number; summary: string; tiers: PoolTier[]; single: number };
export type PoolRouteDay = { t: string; d: string; k: string[] };
export type PoolAddon = { name: string; price: string; note: string };
export type PoolContent = {
  incl: string[]; excl: string[]; notes: string[]; pay: string[]; meet: string[];
  route: PoolRouteDay[]; addons: PoolAddon[];
};
export type PoolNight = { from: string; to: string; fee: number };
export type KzSettings = { joinMax: number; kurs: number; meet: string; meetTime: string; night: PoolNight | null };

export type PoolDestinationData = {
  id: string; code: string; name: string; status: PoolStatus; engine: PoolEngine;
  city: string; title: string; lede: string; cap: string;
  milestones: number[]; minDays: number; maxPax: number; quota: number;
  content: PoolContent; settings: KzSettings; sortOrder: number;
  packages: PoolPackageData[];
};

export type PoolDateData = { date: string; quota: number | null; groupLink: string };

/** Baris pendaftaran untuk hitungan publik. Sengaja tanpa nama dan nomor WhatsApp. */
export type PoolCountRow = {
  poolDate: string; arrivalDate: string; pkg: string; pax: number;
  interest: boolean; kgPlan: KgPlan | null; createdAt: number;
};
export type KgPlan = { kz: number; x: "darat" | "pesawat"; kgd: number };

/* ---------------- tanggal ---------------- */

const pad = (n: number) => (n < 10 ? "0" : "") + n;

export function isDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return keyOf(tOf(value)) === value;
}
export function tOf(key: string): number {
  const p = key.split("-");
  return Date.UTC(+p[0], +p[1] - 1, +p[2]);
}
export function keyOf(t: number): string {
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
export function addDays(key: string, n: number): string {
  return keyOf(tOf(key) + n * 864e5);
}
export function diffDays(a: string, b: string): number {
  return Math.round((tOf(a) - tOf(b)) / 864e5);
}
/** Tanggal hari ini menurut WIB (UTC+7), dipakai untuk semua batas tanggal pool. */
export function jakartaToday(now: number = Date.now()): string {
  return keyOf(now + 7 * 36e5);
}

/* ---------------- pembersih masukan ---------------- */

export function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}
function cleanMultiline(value: unknown, max: number): string {
  return typeof value === "string" ? value.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, max) : "";
}
function toInt(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Nomor WhatsApp → angka saja dengan awalan negara. Kosong kalau tidak masuk akal. */
export function normWa(raw: unknown): string {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return d.length >= 10 && d.length <= 15 ? d : "";
}

export function normalizeStatus(value: unknown): PoolStatus {
  const s = String(value ?? "").toLowerCase();
  return (POOL_STATUSES as readonly string[]).includes(s) ? (s as PoolStatus) : "draf";
}
export function normalizeEngine(value: unknown): PoolEngine {
  return value === "kazakhstan" ? "kazakhstan" : "generic";
}
export function normalizeCode(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function normalizeMilestones(value: unknown): number[] {
  const list = Array.isArray(value) ? value : [];
  const out = [...new Set(list.map((x) => toInt(x, 0)).filter((n) => n >= 1 && n <= 500))].sort((a, b) => a - b);
  return out.length ? out.slice(0, 6) : [6];
}

export function normalizeTiers(value: unknown): PoolTier[] {
  const list = Array.isArray(value) ? value : [];
  const byN = new Map<number, number>();
  for (const item of list) {
    if (!isRecord(item)) continue;
    const n = toInt(item.n, 0);
    const p = toInt(item.p, 0);
    if (n >= 1 && n <= 500 && p > 0 && p <= 2_000_000_000) byN.set(n, p);
  }
  return [...byN.entries()].sort((a, b) => a[0] - b[0]).map(([n, p]) => ({ n, p }));
}

function stringList(value: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((x) => cleanText(x, maxLen)).filter(Boolean).slice(0, maxItems);
}

export function normalizeContent(value: unknown): PoolContent {
  const v = isRecord(value) ? value : {};
  const route = Array.isArray(v.route) ? v.route : [];
  const addons = Array.isArray(v.addons) ? v.addons : [];
  return {
    incl: stringList(v.incl, 30, 300),
    excl: stringList(v.excl, 30, 300),
    notes: stringList(v.notes, 30, 300),
    pay: stringList(v.pay, 30, 300),
    meet: stringList(v.meet, 30, 300),
    route: route
      .filter(isRecord)
      .map((r) => ({ t: cleanText(r.t, 120), d: cleanText(r.d, 500), k: stringList(r.k, 12, 12) }))
      .filter((r) => r.t)
      .slice(0, 40),
    addons: addons
      .filter(isRecord)
      .map((a) => ({ name: cleanText(a.name, 120), price: cleanText(a.price, 80), note: cleanText(a.note, 200) }))
      .filter((a) => a.name)
      .slice(0, 30),
  };
}

const isClock = (value: unknown): value is string => typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export function normalizeKzSettings(value: unknown): KzSettings {
  const v = isRecord(value) ? value : {};
  const night = isRecord(v.night) && isClock(v.night.from) && isClock(v.night.to)
    ? { from: v.night.from, to: v.night.to, fee: Math.max(0, toInt(v.night.fee, 0)) }
    : v.night === null ? null : { from: "22:00", to: "06:00", fee: 0 };
  return {
    joinMax: Math.min(7, Math.max(0, toInt(v.joinMax, 3))),
    kurs: Math.max(0, toInt(v.kurs, 0)),
    meet: cleanText(v.meet, 200),
    meetTime: isClock(v.meetTime) ? v.meetTime : "",
    night,
  };
}

export function normalizePackage(value: unknown): PoolPackageData | null {
  if (!isRecord(value)) return null;
  const code = String(value.code ?? "").trim().replace(/[^A-Za-z0-9]/g, "").slice(0, 12);
  if (!code || code.toLowerCase() === "minat" || code === "KG") return null;
  return {
    code,
    name: cleanText(value.name, 80) || code,
    days: Math.min(60, Math.max(0, toInt(value.days, 0))),
    summary: cleanText(value.summary, 300),
    tiers: normalizeTiers(value.tiers),
    single: Math.max(0, toInt(value.single, 0)),
  };
}

/* ---------------- harga ---------------- */

/** Harga per orang untuk n peserta: tingkat tertinggi yang jumlah orangnya sudah tercapai. */
export function priceAt(tiers: readonly PoolTier[], n: number): number {
  if (!tiers.length) return 0;
  let best = tiers[0];
  for (const t of tiers) if (t.n <= n) best = t;
  return best.p;
}
export function cheapestPrice(packages: readonly PoolPackageData[]): number {
  let best = 0;
  for (const p of packages) for (const t of p.tiers) if (t.p > 0 && (!best || t.p < best)) best = t.p;
  return best;
}

/* ---------------- kode pendaftaran ---------------- */

const KODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const KODE_PREFIX: Record<string, string> = { kazakhstan: "KZ", kirgistan: "KG", rusia: "RU" };

export function kodePrefix(code: string): string {
  return KODE_PREFIX[code] ?? (code.replace(/[^a-z]/g, "").slice(0, 2).toUpperCase() || "PL");
}
export function makeKode(code: string, random: () => number = Math.random): string {
  let s = "";
  for (let i = 0; i < 4; i++) s += KODE_ALPHABET[Math.floor(random() * KODE_ALPHABET.length) % KODE_ALPHABET.length];
  return `${kodePrefix(code)}-${s}`;
}

/* ---------------- hitungan pool ---------------- */

export type GenericPool = { d: string; n: number; by: Record<string, number>; px: number; r: number; g: boolean };
export type KzPool = {
  d: string; n: number; p5: number; p6: number; p8: number; kg: number; px: number;
  r: number; e: string; q: number; full: boolean; g: boolean;
};

export function quotaFor(dest: Pick<PoolDestinationData, "quota">, date: PoolDateData | undefined): number {
  if (date && date.quota !== null) return Math.max(0, date.quota);
  return dest.quota > 0 ? dest.quota : POOL_NO_QUOTA;
}

function dateMap(dates: readonly PoolDateData[]): Map<string, PoolDateData> {
  return new Map(dates.map((d) => [d.date, d]));
}

/** Jumlah hari rombongan berjalan untuk sebuah pilihan paket Kazakhstan. */
export function kzSpan(pkg: string, kgPlan: KgPlan | null): number {
  if (pkg === "KG") return kgPlan?.kz ?? 3;
  const days = pkg.split(",").map(Number).filter((n) => n > 0);
  return days.length ? Math.max(...days) : 5;
}
function kzKey(pkg: string): "kg" | "px" | "p5" | "p6" | "p8" {
  if (pkg === "KG") return "kg";
  if (pkg.includes(",")) return "px";
  return pkg === "6" ? "p6" : pkg === "8" ? "p8" : "p5";
}

/** Pool Kazakhstan per tanggal rombongan. Rombongan yang sudah selesai tidak ikut. */
export function buildKzPools(
  dest: Pick<PoolDestinationData, "quota">,
  rows: readonly PoolCountRow[],
  dates: readonly PoolDateData[],
  today: string,
): KzPool[] {
  const byDate = dateMap(dates);
  const pools = new Map<string, KzPool>();
  const get = (d: string) => {
    let p = pools.get(d);
    if (!p) {
      const q = quotaFor(dest, byDate.get(d));
      p = { d, n: 0, p5: 0, p6: 0, p8: 0, kg: 0, px: 0, r: 0, e: addDays(d, 4), q, full: false, g: !!byDate.get(d)?.groupLink };
      pools.set(d, p);
    }
    return p;
  };
  for (const row of rows) {
    if (row.interest) continue;
    const p = get(row.poolDate);
    p.n += row.pax;
    p[kzKey(row.pkg)] += row.pax;
    p.r += 1;
    const end = addDays(row.poolDate, kzSpan(row.pkg, row.kgPlan) - 1);
    if (end > p.e) p.e = end;
  }
  // Tanggal yang ditutup admin (kuota 0) tetap dikirim supaya kalender menandainya penuh.
  for (const d of dates) if (d.quota === 0 && d.date >= today) get(d.date);
  return [...pools.values()]
    .filter((p) => p.e >= today)
    .map((p) => ({ ...p, full: p.n >= p.q }))
    .sort((a, b) => (a.d < b.d ? -1 : 1));
}

export function buildGenericPools(
  rows: readonly PoolCountRow[],
  dates: readonly PoolDateData[],
  today: string,
): GenericPool[] {
  const byDate = dateMap(dates);
  const pools = new Map<string, GenericPool>();
  for (const row of rows) {
    if (row.interest || row.poolDate < today) continue;
    let p = pools.get(row.poolDate);
    if (!p) {
      p = { d: row.poolDate, n: 0, by: {}, px: 0, r: 0, g: !!byDate.get(row.poolDate)?.groupLink };
      pools.set(row.poolDate, p);
    }
    p.n += row.pax;
    p.r += 1;
    if (row.pkg.includes(",")) p.px += row.pax;
    else p.by[row.pkg] = (p.by[row.pkg] ?? 0) + row.pax;
  }
  return [...pools.values()].sort((a, b) => (a.d < b.d ? -1 : 1));
}

export type RecentItem = { d: string; n: number; t: number };
export function recentFrom(rows: readonly PoolCountRow[], today: string, limit = 6): RecentItem[] {
  return rows
    .filter((r) => !r.interest && r.poolDate >= today)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
    .map((r) => ({ d: r.poolDate, n: r.pax, t: r.createdAt }));
}
export function interestTotal(rows: readonly PoolCountRow[]): number {
  return rows.reduce((sum, r) => sum + (r.interest ? r.pax : 0), 0);
}

/** Segera, atau belum ada paket = daftar minat. Selain itu pool dengan harga. */
export function destMode(dest: Pick<PoolDestinationData, "status" | "packages" | "engine">): "pool" | "minat" {
  if (dest.engine === "kazakhstan") return dest.status === "segera" ? "minat" : "pool";
  return dest.status !== "segera" && dest.packages.length ? "pool" : "minat";
}
export function destUrl(dest: Pick<PoolDestinationData, "engine" | "code">): string {
  return dest.engine === "kazakhstan" ? "/kazakhstan" : `/pool/${dest.code}`;
}

/* ---------------- data publik ---------------- */

export type PublicContext = { open: boolean; today: string; wa: string; base: string; now: number };

/** Isi GET /api/pool/kazakhstan. Bentuknya sama dengan API Apps Script versi 3. */
export function kzPublicPayload(
  dest: PoolDestinationData,
  rows: readonly PoolCountRow[],
  dates: readonly PoolDateData[],
  ctx: PublicContext,
) {
  const pools = buildKzPools(dest, rows, dates, ctx.today);
  const pkg = (code: string) => dest.packages.find((p) => p.code === code);
  const ns = [...new Set(dest.packages.flatMap((p) => p.tiers.map((t) => t.n)))].sort((a, b) => a - b);
  const tiers = ns.map((n) => ({
    n,
    p5: priceAt(pkg("5")?.tiers ?? [], n),
    p6: priceAt(pkg("6")?.tiers ?? [], n),
    p8: priceAt(pkg("8")?.tiers ?? [], n),
  }));
  return {
    ok: true as const,
    version: 3,
    open: ctx.open && dest.status === "buka",
    today: ctx.today,
    minDays: dest.minDays,
    maxPax: dest.maxPax,
    quota: dest.quota > 0 ? dest.quota : POOL_NO_QUOTA,
    joinMax: dest.settings.joinMax,
    milestones: dest.milestones,
    prices: {
      tiers,
      single: { p5: pkg("5")?.single ?? 0, p6: pkg("6")?.single ?? 0, p8: pkg("8")?.single ?? 0 },
    },
    kurs: dest.settings.kurs,
    wa: ctx.wa,
    share: `${ctx.base.replace(/\/pool$/, "")}/kazakhstan`,
    meet: dest.settings.meet,
    meetTime: dest.settings.meetTime,
    night: dest.settings.night,
    pools,
    recent: recentFrom(rows, ctx.today),
    total: pools.reduce((sum, p) => sum + p.n, 0),
    updated: ctx.now,
  };
}

export type DestBundle = { dest: PoolDestinationData; rows: readonly PoolCountRow[]; dates: readonly PoolDateData[] };

function genericPoolsOf(b: DestBundle, today: string): GenericPool[] {
  if (b.dest.engine !== "kazakhstan") return buildGenericPools(b.rows, b.dates, today);
  return buildKzPools(b.dest, b.rows, b.dates, today)
    .filter((p) => p.n > 0)
    .map((p) => ({ d: p.d, n: p.n, by: { "5": p.p5, "6": p.p6, "8": p.p8, KG: p.kg }, px: p.px, r: p.r, g: p.g }));
}

/** Isi GET /api/pool: semua negara. Bentuknya sama dengan katalog Apps Script versi 1. */
export function catalogPayload(bundles: readonly DestBundle[], ctx: PublicContext) {
  return {
    ok: true as const,
    version: 1,
    open: ctx.open,
    today: ctx.today,
    wa: ctx.wa,
    base: ctx.base,
    updated: ctx.now,
    dests: bundles.map((b) => {
      const { dest } = b;
      const pools = genericPoolsOf(b, ctx.today);
      return {
        code: dest.code,
        name: dest.name,
        status: dest.status,
        ...(dest.engine === "kazakhstan" ? { url: destUrl(dest) } : {}),
        city: dest.city,
        title: dest.title,
        lede: dest.lede,
        milestones: dest.milestones,
        minDays: dest.minDays,
        maxPax: dest.maxPax,
        cap: dest.cap,
        incl: dest.content.incl,
        excl: dest.content.excl,
        notes: dest.content.notes,
        pay: dest.content.pay,
        meet: dest.content.meet,
        pkgs: dest.packages.map((p) => ({ c: p.code, name: p.name, days: p.days, sum: p.summary, tiers: p.tiers, single: p.single })),
        route: dest.content.route,
        addons: dest.content.addons,
        pools,
        recent: recentFrom(b.rows, ctx.today),
        total: pools.reduce((sum, p) => sum + p.n, 0),
        minat: interestTotal(b.rows),
      };
    }),
  };
}

/** Isi GET /api/pool/summary: ringkasan untuk tab "Gabung tanggal" di beranda. */
export function summaryPayload(bundles: readonly DestBundle[], ctx: PublicContext) {
  return {
    ok: true as const,
    open: ctx.open,
    today: ctx.today,
    dests: bundles
      .filter((b) => b.dest.status === "buka" || b.dest.status === "segera")
      .map((b) => {
        const { dest } = b;
        const mode = destMode(dest);
        const counts = new Map<string, { n: number; full: boolean }>();
        if (mode === "pool") {
          if (dest.engine === "kazakhstan") {
            for (const p of buildKzPools(dest, b.rows, b.dates, ctx.today)) if (p.d >= ctx.today && (p.n > 0 || p.full)) counts.set(p.d, { n: p.n, full: p.full });
          } else {
            const byDate = dateMap(b.dates);
            for (const p of buildGenericPools(b.rows, b.dates, ctx.today)) counts.set(p.d, { n: p.n, full: p.n >= quotaFor(dest, byDate.get(p.d)) });
          }
        } else {
          // Daftar minat: orang dikumpulkan per tanggal perkiraan tiba.
          for (const r of b.rows) {
            if (!r.interest || r.poolDate < ctx.today) continue;
            const c = counts.get(r.poolDate) ?? { n: 0, full: false };
            c.n += r.pax;
            counts.set(r.poolDate, c);
          }
        }
        const dates = [...counts.entries()].map(([d, c]) => ({ d, n: c.n, full: c.full })).sort((a, b) => (a.d < b.d ? -1 : 1));
        return {
          code: dest.code,
          name: dest.name,
          city: dest.city,
          mode,
          url: destUrl(dest),
          first: dest.milestones[0],
          from: mode === "pool" ? cheapestPrice(dest.packages) : 0,
          minDate: addDays(ctx.today, dest.minDays),
          maxDate: addDays(ctx.today, POOL_MAX_DAYS_AHEAD),
          total: dates.reduce((sum, d) => sum + d.n, 0),
          dates,
        };
      }),
  };
}

/* ---------------- validasi pendaftaran ---------------- */

export type Fail = { ok: false; field: string; error: string };
const fail = (field: string, error: string): Fail => ({ ok: false, field, error });

export type Person = { name: string; wa: string };
function parsePerson(raw: Record<string, unknown>): Person | Fail {
  const name = cleanText(raw.name, 80);
  if (name.length < 2) return fail("name", "Isi nama dulu, minimal 2 huruf.");
  const wa = normWa(raw.wa);
  if (!wa) return fail("wa", "Nomor WhatsApp-nya belum pas. Contoh: 0812 3456 7890.");
  return { name, wa };
}
function parsePax(raw: unknown, maxPax: number): number | Fail {
  const pax = toInt(raw, 0);
  if (pax < 1) return fail("pax", "Jumlah orang minimal 1.");
  if (pax > maxPax) return fail("pax", `Satu pendaftaran maksimal ${maxPax} orang. Rombongan lebih besar? Chat admin, ya.`);
  return pax;
}
function checkDate(d: unknown, today: string, minDays: number): string | Fail {
  if (!isDateKey(d)) return fail("d", "Pilih tanggal tiba dulu.");
  if (d < addDays(today, minDays)) {
    return fail("d", minDays > 0 ? `Tanggal tiba paling cepat ${minDays} hari dari sekarang.` : "Tanggal tiba sudah lewat. Pilih tanggal lain.");
  }
  if (d > addDays(today, POOL_MAX_DAYS_AHEAD)) return fail("d", "Tanggal tiba terlalu jauh. Pilih tanggal dalam 15 bulan ke depan.");
  return d;
}

export type KzInput = Person & {
  d: string; j: string; g: string; pkg: string; pax: number; flex: boolean;
  t: string; via: "pesawat" | "darat" | "lokal"; fl: string; hotel: "paket" | "sendiri"; hn: string;
  kg: KgPlan | null; note: string;
};

/** Periksa isi formulir /kazakhstan. Belum memeriksa kuota dan rombongan yang disusul. */
export function parseKzInput(raw: unknown, dest: PoolDestinationData, today: string): { ok: true; value: KzInput } | Fail {
  if (!isRecord(raw)) return fail("", "Format formulir tidak dikenali.");
  const d = checkDate(raw.d, today, dest.minDays);
  if (typeof d !== "string") return d;
  const j = isDateKey(raw.j) ? raw.j : "";
  if (raw.j && !j) return fail("j", "Rombongan yang mau disusul tidak ditemukan. Pilih ulang tanggalnya.");

  const pkgRaw = String(raw.pkg ?? "");
  let pkg = "";
  let kg: KgPlan | null = null;
  if (pkgRaw === "KG") {
    const k = isRecord(raw.kg) ? raw.kg : {};
    const kz = toInt(k.kz, 3);
    const kgd = toInt(k.kgd, 3);
    if (kz < 2 || kz > 5 || kgd < 2 || kgd > 5) return fail("kg", "Atur jumlah hari Kazakhstan dan Kirgistan dulu (2 sampai 5 hari).");
    pkg = "KG";
    kg = { kz, x: k.x === "pesawat" ? "pesawat" : "darat", kgd };
  } else {
    const allowed = new Set(dest.packages.map((p) => p.code));
    const codes = [...new Set(pkgRaw.split(",").map((c) => c.trim()).filter(Boolean))].sort();
    if (!codes.length || codes.length > 2 || codes.some((c) => !allowed.has(c))) return fail("pkg", "Pilih paketnya dulu.");
    pkg = codes.join(",");
  }

  const pax = parsePax(raw.pax, dest.maxPax);
  if (typeof pax !== "number") return pax;

  const via = raw.via === "darat" || raw.via === "lokal" ? raw.via : "pesawat";
  const tRaw = via === "lokal" ? "" : String(raw.t ?? "");
  if (tRaw && !isClock(tRaw)) return fail("t", "Jam tibanya belum pas. Contoh: 20:30.");
  const fl = via === "pesawat" ? String(raw.fl ?? "").toUpperCase().replace(/[^A-Z0-9 ]/g, "").trim().slice(0, 12) : "";
  const hotel = raw.hotel === "sendiri" ? "sendiri" : "paket";

  const person = parsePerson(raw);
  if (!("name" in person)) return person;

  return {
    ok: true,
    value: {
      ...person, d, j, g: j || d, pkg, pax, flex: raw.flex === true, t: tRaw, via, fl,
      hotel, hn: hotel === "sendiri" ? cleanText(raw.hn, 120) : "", kg, note: cleanMultiline(raw.note, 600),
    },
  };
}

/** Periksa kuota dan rombongan yang disusul terhadap pool saat ini (tanpa baris lama pendaftar ini). */
export function checkKzPlacement(value: KzInput, pools: readonly KzPool[], dest: PoolDestinationData, dates: readonly PoolDateData[]): Fail | null {
  const pool = pools.find((p) => p.d === value.g);
  if (value.j) {
    const gap = diffDays(value.d, value.j);
    const okJoin = !!pool && pool.n > 0 && !pool.full && gap >= 1 && gap <= dest.settings.joinMax && value.d < pool.e;
    if (!okJoin) return fail("j", "Rombongan itu sudah tidak bisa disusul. Pilih ulang tanggalnya, ya.");
  }
  const q = pool ? pool.q : quotaFor(dest, dates.find((d) => d.date === value.g));
  const left = q - (pool ? pool.n : 0);
  if (value.pax > left) {
    return left > 0
      ? fail("pax", `Tanggal ini tinggal ${left} kursi. Kurangi jumlah orang atau pilih tanggal lain.`)
      : fail("d", "Tanggal ini sudah penuh. Pilih tanggal lain, atau chat admin untuk daftar tunggu.");
  }
  return null;
}

export function isNightArrival(t: string, night: PoolNight | null): boolean {
  if (!t || !night) return false;
  return night.from > night.to ? t >= night.from || t < night.to : t >= night.from && t < night.to;
}

export type GenericInput = Person & { d: string; pkg: string; pax: number; flex: boolean; interest: boolean };

/** Periksa isi formulir /pool/<kode>. Belum memeriksa kuota. */
export function parseGenericInput(raw: unknown, dest: PoolDestinationData, today: string): { ok: true; value: GenericInput } | Fail {
  if (!isRecord(raw)) return fail("", "Format formulir tidak dikenali.");
  const interest = raw.pkg === "minat" || destMode(dest) === "minat";
  const d = checkDate(raw.d, today, interest ? 0 : dest.minDays);
  if (typeof d !== "string") return d;

  let pkg = "minat";
  if (!interest) {
    const allowed = new Set(dest.packages.map((p) => p.code));
    const codes = [...new Set(String(raw.pkg ?? "").split(",").map((c) => c.trim()).filter(Boolean))];
    if (!codes.length || codes.length > 2 || codes.some((c) => !allowed.has(c))) return fail("pkg", "Pilih paketnya dulu.");
    pkg = dest.packages.map((p) => p.code).filter((c) => codes.includes(c)).join(",");
  }
  const pax = parsePax(raw.pax, dest.maxPax);
  if (typeof pax !== "number") return pax;
  const person = parsePerson(raw);
  if (!("name" in person)) return person;
  return { ok: true, value: { ...person, d, pkg, pax, flex: raw.flex === true, interest } };
}

export function checkGenericQuota(value: GenericInput, currentN: number, dest: PoolDestinationData, dates: readonly PoolDateData[]): Fail | null {
  if (value.interest) return null;
  const left = quotaFor(dest, dates.find((d) => d.date === value.d)) - currentN;
  if (value.pax <= left) return null;
  return left > 0
    ? fail("pax", `Tanggal ini tinggal ${left} kursi. Kurangi jumlah orang atau pilih tanggal lain.`)
    : fail("d", "Tanggal ini sudah penuh. Pilih tanggal lain, atau chat admin untuk daftar tunggu.");
}

/* ---------------- teks untuk CMS ---------------- */

export function pkgLabel(dest: Pick<PoolDestinationData, "packages">, pkg: string, kgPlan: KgPlan | null): string {
  if (pkg === "minat" || !pkg) return "Daftar minat";
  if (pkg === "KG") return kgPlan ? `Kazakhstan ${kgPlan.kz} hari → ${kgPlan.x} → Kirgistan ${kgPlan.kgd} hari` : "Kazakhstan + Kirgistan";
  return pkg
    .split(",")
    .map((c) => {
      const p = dest.packages.find((x) => x.code === c);
      return p ? (p.days ? `${p.days} hari` : p.name) : c;
    })
    .join(" atau ");
}
