import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getConfiguredWhatsAppNumber } from "@/lib/company-whatsapp";
import {
  buildGenericPools, buildKzPools, checkGenericQuota, checkKzPlacement, cleanText, interestTotal,
  isDateKey, isNightArrival, jakartaToday, makeKode, normWa, normalizeCode, normalizeContent,
  normalizeEngine, normalizeKzSettings, normalizeMilestones, normalizePackage, normalizeStatus,
  normalizeTiers, parseGenericInput, parseKzInput, addDays,
  type DestBundle, type Fail, type KgPlan, type PoolCountRow, type PoolDateData,
  type PoolDestinationData, type PoolPackageData, type PublicContext,
} from "./core";
import { POOL_DEFAULT_DESTINATIONS, type PoolDestinationSeed } from "./defaults";
import { parseKzSheet } from "./import";

/* Semua akses database untuk pool. Fungsi "publik" hanya memilih kolom hitungan
   (COUNT_SELECT): nama dan nomor WhatsApp tidak pernah dimuat untuk permintaan publik. */

const POOL_BASE = "https://sundaftrip.com/pool";
const OPEN_KEY = "pool_open";
/** Rombongan yang masih berjalan ikut dihitung: ambil pendaftaran sampai 30 hari ke belakang. */
const LOOKBACK_DAYS = 30;

type DestRow = Prisma.PoolDestinationGetPayload<{ include: { packages: true } }>;
type Tx = Prisma.TransactionClient;

const COUNT_SELECT = {
  destinationId: true, poolDate: true, arrivalDate: true, pkg: true, pax: true,
  interest: true, kgPlan: true, createdAt: true,
} satisfies Prisma.PoolSignupSelect;

function toKgPlan(value: unknown): KgPlan | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  const kz = Number(v.kz);
  const kgd = Number(v.kgd);
  if (!(kz >= 2 && kz <= 5 && kgd >= 2 && kgd <= 5)) return null;
  return { kz, x: v.x === "pesawat" ? "pesawat" : "darat", kgd };
}

function toCountRow(row: { poolDate: string; arrivalDate: string; pkg: string; pax: number; interest: boolean; kgPlan: unknown; createdAt: Date }): PoolCountRow {
  return {
    poolDate: row.poolDate, arrivalDate: row.arrivalDate, pkg: row.pkg, pax: row.pax,
    interest: row.interest, kgPlan: toKgPlan(row.kgPlan), createdAt: row.createdAt.getTime(),
  };
}

export function toDestination(row: DestRow): PoolDestinationData {
  return {
    id: row.id, code: row.code, name: row.name,
    status: normalizeStatus(row.status), engine: normalizeEngine(row.engine),
    city: row.city, title: row.title, lede: row.lede, cap: row.cap,
    milestones: normalizeMilestones(row.milestones),
    minDays: row.minDays, maxPax: row.maxPax, quota: row.quota,
    content: normalizeContent(row.content),
    settings: normalizeKzSettings(row.settings),
    sortOrder: row.sortOrder,
    packages: [...row.packages]
      .sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code))
      .map((p) => ({ code: p.code, name: p.name, days: p.days, summary: p.summary, tiers: normalizeTiers(p.tiers), single: p.single })),
  };
}

/** Tabel pool belum dibuat di database (deploy pertama sebelum migrasi). */
export function isPoolTableMissing(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  return code === "P2021" || code === "P2022";
}

export async function isPoolOpen(): Promise<boolean> {
  const row = await prisma.companyInfo.findUnique({ where: { key: OPEN_KEY } });
  return row?.value !== "false";
}
export async function setPoolOpen(open: boolean): Promise<void> {
  const value = open ? "true" : "false";
  await prisma.companyInfo.upsert({ where: { key: OPEN_KEY }, update: { value }, create: { key: OPEN_KEY, value } });
}

export async function publicContext(now: number = Date.now()): Promise<PublicContext> {
  const [open, wa] = await Promise.all([isPoolOpen(), getConfiguredWhatsAppNumber()]);
  return { open, today: jakartaToday(now), wa: normWa(wa), base: POOL_BASE, now };
}

/** Negara + hitungan per tanggal untuk data publik. Tanpa nama dan nomor WhatsApp. */
export async function loadBundles(today: string, where: Prisma.PoolDestinationWhereInput = {}): Promise<DestBundle[]> {
  const dests = await prisma.poolDestination.findMany({
    where, include: { packages: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  if (!dests.length) return [];
  const ids = dests.map((d) => d.id);
  const since = addDays(today, -LOOKBACK_DAYS);
  const [rows, dates] = await Promise.all([
    prisma.poolSignup.findMany({ where: { destinationId: { in: ids }, status: "aktif", poolDate: { gte: since } }, select: COUNT_SELECT }),
    prisma.poolDate.findMany({ where: { destinationId: { in: ids }, date: { gte: since } } }),
  ]);
  return dests.map((d) => ({
    dest: toDestination(d),
    rows: rows.filter((r) => r.destinationId === d.id).map(toCountRow),
    dates: dates.filter((x) => x.destinationId === d.id).map((x) => ({ date: x.date, quota: x.quota, groupLink: x.groupLink })),
  }));
}

/* ---------------- pendaftaran publik ---------------- */

const CLOSED: Fail = { ok: false, field: "", error: "Pendaftaran sedang ditutup. Chat admin untuk info tanggal berikutnya." };
const TX_OPTIONS = { maxWait: 10_000, timeout: 20_000 };

/** Satu pendaftaran per negara dalam satu waktu, supaya kuota tidak terlampaui. */
async function lockDestination(tx: Tx, destinationId: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"pool:" + destinationId}))`;
}

async function freeKode(tx: Tx, code: string): Promise<string> {
  for (let i = 0; i < 12; i++) {
    const kode = makeKode(code);
    if (!(await tx.poolSignup.findUnique({ where: { kode }, select: { id: true } }))) return kode;
  }
  throw new Error("pool: no free kode");
}

type LockedRow = { id: string; kode: string; whatsapp: string } & Parameters<typeof toCountRow>[0];

async function lockedRows(tx: Tx, destinationId: string, today: string) {
  const since = addDays(today, -LOOKBACK_DAYS);
  const [rows, dates] = await Promise.all([
    tx.poolSignup.findMany({
      where: { destinationId, status: "aktif", poolDate: { gte: since } },
      select: { ...COUNT_SELECT, id: true, kode: true, whatsapp: true },
    }),
    tx.poolDate.findMany({ where: { destinationId, date: { gte: since } } }),
  ]);
  return {
    rows: rows as LockedRow[],
    dates: dates.map((x): PoolDateData => ({ date: x.date, quota: x.quota, groupLink: x.groupLink })),
  };
}

export async function submitKz(raw: unknown, now: number = Date.now()): Promise<Record<string, unknown>> {
  const ctx = await publicContext(now);
  const row = await prisma.poolDestination.findFirst({ where: { engine: "kazakhstan" }, include: { packages: true } });
  if (!row) return CLOSED;
  const dest = toDestination(row);
  if (!ctx.open || dest.status !== "buka") return CLOSED;
  const parsed = parseKzInput(raw, dest, ctx.today);
  if (!parsed.ok) return parsed;
  const v = parsed.value;
  const mine: PoolCountRow = { poolDate: v.g, arrivalDate: v.d, pkg: v.pkg, pax: v.pax, interest: false, kgPlan: v.kg, createdAt: now };

  return prisma.$transaction(async (tx) => {
    await lockDestination(tx, dest.id);
    const { rows, dates } = await lockedRows(tx, dest.id, ctx.today);
    const pooled = rows.filter((r) => !r.interest);
    const existing = pooled.find((r) => r.whatsapp === v.wa && r.poolDate === v.g);
    const others = pooled.filter((r) => r !== existing).map(toCountRow);

    const bad = checkKzPlacement(v, buildKzPools(dest, others, dates, ctx.today), dest, dates);
    if (bad) return bad;
    const prev = buildKzPools(dest, pooled.map(toCountRow), dates, ctx.today).find((p) => p.d === v.g)?.n ?? 0;

    const data = {
      poolDate: v.g, arrivalDate: v.d, interest: false, pkg: v.pkg, pax: v.pax, flex: v.flex,
      name: v.name, whatsapp: v.wa, arrivalTime: v.t, via: v.via, flight: v.fl,
      hotel: v.hotel, hotelName: v.hn, kgPlan: v.kg ?? undefined, note: v.note,
    };
    let kode: string;
    if (existing) {
      kode = existing.kode;
      await tx.poolSignup.update({ where: { id: existing.id }, data: { ...data, kgPlan: v.kg ?? Prisma.JsonNull } });
    } else {
      kode = await freeKode(tx, dest.code);
      await tx.poolSignup.create({ data: { ...data, kode, destinationId: dest.id, source: "web" } });
    }
    const pool = buildKzPools(dest, [...others, mine], dates, ctx.today).find((p) => p.d === v.g);
    return {
      ok: true, kind: v.pkg === "KG" ? "KG" : "KZ", interest: false, joined: !!v.j, kode, updated: !!existing, prev,
      pool: pool
        ? { d: pool.d, n: pool.n, p5: pool.p5, p6: pool.p6, p8: pool.p8, kg: pool.kg, px: pool.px, r: pool.r, e: pool.e, q: pool.q }
        : { d: v.g, n: v.pax, p5: 0, p6: 0, p8: 0, kg: 0, px: 0, r: 1, e: v.g, q: dest.quota },
      group: dates.find((d) => d.date === v.g)?.groupLink ?? "",
      night: v.via === "pesawat" && isNightArrival(v.t, dest.settings.night),
      wa: ctx.wa,
      share: "https://sundaftrip.com/kazakhstan",
    };
  }, TX_OPTIONS);
}

export async function submitGeneric(raw: unknown, now: number = Date.now()): Promise<Record<string, unknown>> {
  const ctx = await publicContext(now);
  const code = normalizeCode((raw as { dest?: unknown } | null)?.dest);
  const row = code ? await prisma.poolDestination.findUnique({ where: { code }, include: { packages: true } }) : null;
  if (!row || row.engine !== "generic") return { ok: false, field: "dest", error: "Destinasinya tidak ditemukan." };
  const dest = toDestination(row);
  if (!ctx.open || (dest.status !== "buka" && dest.status !== "segera")) return CLOSED;
  const parsed = parseGenericInput(raw, dest, ctx.today);
  if (!parsed.ok) return parsed;
  const v = parsed.value;
  const mine: PoolCountRow = { poolDate: v.d, arrivalDate: v.d, pkg: v.pkg, pax: v.pax, interest: v.interest, kgPlan: null, createdAt: now };

  return prisma.$transaction(async (tx) => {
    await lockDestination(tx, dest.id);
    const { rows, dates } = await lockedRows(tx, dest.id, ctx.today);
    // Daftar minat: satu baris per nomor. Pool: satu baris per nomor per tanggal.
    const existing = rows.find((r) => r.whatsapp === v.wa && r.interest === v.interest && (v.interest || r.poolDate === v.d));
    const others = rows.filter((r) => r !== existing).map(toCountRow);
    const nOf = (list: readonly PoolCountRow[]) => buildGenericPools(list, dates, ctx.today).find((p) => p.d === v.d)?.n ?? 0;

    const bad = checkGenericQuota(v, nOf(others), dest, dates);
    if (bad) return bad;
    const all = rows.map(toCountRow);
    const prev = v.interest ? interestTotal(all) : nOf(all);

    const data = { poolDate: v.d, arrivalDate: v.d, interest: v.interest, pkg: v.pkg, pax: v.pax, flex: v.flex, name: v.name, whatsapp: v.wa };
    let kode: string;
    if (existing) {
      kode = existing.kode;
      await tx.poolSignup.update({ where: { id: existing.id }, data });
    } else {
      kode = await freeKode(tx, dest.code);
      await tx.poolSignup.create({ data: { ...data, kode, destinationId: dest.id, source: "web" } });
    }
    const after = [...others, mine];
    const pool = buildGenericPools(after, dates, ctx.today).find((p) => p.d === v.d);
    return {
      ok: true, kode, updated: !!existing, dest: dest.code,
      group: v.interest ? "" : dates.find((d) => d.date === v.d)?.groupLink ?? "",
      wa: ctx.wa, share: `${ctx.base}/${dest.code}`,
      kind: v.interest ? "minat" : "pool", prev, minat: interestTotal(after),
      pool: pool && !v.interest ? { d: pool.d, n: pool.n, by: pool.by, px: pool.px, r: pool.r } : { d: v.d, n: 0, by: {}, px: 0, r: 0 },
    };
  }, TX_OPTIONS);
}

/* ---------------- CMS ---------------- */

export type AdminSignup = {
  id: string; kode: string; destinationId: string; poolDate: string; arrivalDate: string;
  interest: boolean; pkg: string; pax: number; flex: boolean; name: string; whatsapp: string;
  arrivalTime: string; via: string; flight: string; hotel: string; hotelName: string;
  kgPlan: KgPlan | null; note: string; adminNote: string; status: string; source: string; createdAt: string;
};
export type AdminPoolDate = { destinationId: string; date: string; quota: number | null; groupLink: string; note: string };
export type AdminPoolData = {
  open: boolean; today: string;
  destinations: PoolDestinationData[]; dates: AdminPoolDate[]; signups: AdminSignup[];
};

/** Data lengkap untuk /admin/pool. Hanya dipanggil setelah izin pool_view diperiksa. */
export async function loadAdminData(now: number = Date.now()): Promise<AdminPoolData> {
  const [open, dests, dates, signups] = await Promise.all([
    isPoolOpen(),
    prisma.poolDestination.findMany({ include: { packages: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.poolDate.findMany({ orderBy: { date: "asc" } }),
    prisma.poolSignup.findMany({ orderBy: [{ poolDate: "asc" }, { createdAt: "asc" }], take: 5000 }),
  ]);
  return {
    open, today: jakartaToday(now),
    destinations: dests.map(toDestination),
    dates: dates.map((d) => ({ destinationId: d.destinationId, date: d.date, quota: d.quota, groupLink: d.groupLink, note: d.note })),
    signups: signups.map((s) => ({
      id: s.id, kode: s.kode, destinationId: s.destinationId, poolDate: s.poolDate, arrivalDate: s.arrivalDate,
      interest: s.interest, pkg: s.pkg, pax: s.pax, flex: s.flex, name: s.name, whatsapp: s.whatsapp,
      arrivalTime: s.arrivalTime, via: s.via, flight: s.flight, hotel: s.hotel, hotelName: s.hotelName,
      kgPlan: toKgPlan(s.kgPlan), note: s.note, adminNote: s.adminNote, status: s.status, source: s.source,
      createdAt: s.createdAt.toISOString(),
    })),
  };
}

export type SaveResult<T> = { ok: true; value: T } | { ok: false; status: number; error: string };
const bad = (error: string, status = 422): { ok: false; status: number; error: string } => ({ ok: false, status, error });

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function destinationFields(input: Record<string, unknown>, engine: string) {
  return {
    name: cleanText(input.name, 60),
    status: normalizeStatus(input.status),
    city: cleanText(input.city, 60),
    title: cleanText(input.title, 120),
    lede: cleanText(input.lede, 400),
    cap: cleanText(input.cap, 300),
    milestones: normalizeMilestones(input.milestones),
    minDays: clampInt(input.minDays, 0, 365, 30),
    maxPax: clampInt(input.maxPax, 1, 60, 10),
    quota: clampInt(input.quota, 0, 500, 0),
    content: normalizeContent(input.content),
    settings: engine === "kazakhstan" ? normalizeKzSettings(input.settings) : {},
    sortOrder: clampInt(input.sortOrder, 0, 9999, 0),
  };
}

function packagesFrom(input: unknown): SaveResult<PoolPackageData[]> {
  const list = Array.isArray(input) ? input : [];
  const packages = list.map(normalizePackage).filter((p): p is PoolPackageData => p !== null).slice(0, 12);
  if (new Set(packages.map((p) => p.code)).size !== packages.length) return bad("Kode paket tidak boleh sama.");
  return { ok: true, value: packages };
}

export async function saveDestination(id: string | null, input: Record<string, unknown>): Promise<SaveResult<PoolDestinationData>> {
  const current = id ? await prisma.poolDestination.findUnique({ where: { id }, include: { packages: true } }) : null;
  if (id && !current) return bad("Negara tidak ditemukan.", 404);
  const engine = current?.engine ?? "generic";
  const fields = destinationFields(input, engine);
  if (fields.name.length < 2) return bad("Isi nama negara.");
  const code = normalizeCode(input.code) || normalizeCode(fields.name);
  if (code.length < 2) return bad("Isi kode halaman (huruf kecil, tanpa spasi).");
  if (current && current.code !== code) {
    if (engine === "kazakhstan") return bad("Kode halaman Kazakhstan tidak bisa diganti.");
  }
  const clash = await prisma.poolDestination.findUnique({ where: { code }, select: { id: true } });
  if (clash && clash.id !== id) return bad("Kode halaman itu sudah dipakai negara lain.", 409);

  const pk = packagesFrom(input.packages);
  if (!pk.ok) return pk;
  if (engine === "kazakhstan") {
    const codes = pk.value.map((p) => p.code).sort().join(",");
    if (codes !== "5,6,8") return bad("Halaman Kazakhstan memakai tiga paket: 5, 6, dan 8 hari. Ubah harganya saja, kodenya jangan diganti.");
  }
  if (fields.status === "buka" && !pk.value.some((p) => p.tiers.length)) {
    return bad("Untuk status Buka, isi minimal satu paket dengan harga. Selama belum ada harga, pakai status Segera (daftar minat).");
  }

  const saved = await prisma.$transaction(async (tx) => {
    const dest = current
      ? await tx.poolDestination.update({ where: { id: current.id }, data: { ...fields, code } })
      : await tx.poolDestination.create({ data: { ...fields, code, engine } });
    await tx.poolPackage.deleteMany({ where: { destinationId: dest.id } });
    if (pk.value.length) {
      await tx.poolPackage.createMany({
        data: pk.value.map((p, i) => ({ destinationId: dest.id, code: p.code, name: p.name, days: p.days, summary: p.summary, tiers: p.tiers, single: p.single, sortOrder: i })),
      });
    }
    return tx.poolDestination.findUniqueOrThrow({ where: { id: dest.id }, include: { packages: true } });
  }, TX_OPTIONS);
  return { ok: true, value: toDestination(saved) };
}

export async function deleteDestination(id: string): Promise<SaveResult<{ name: string }>> {
  const dest = await prisma.poolDestination.findUnique({ where: { id }, select: { name: true, engine: true, _count: { select: { signups: true } } } });
  if (!dest) return bad("Negara tidak ditemukan.", 404);
  if (dest.engine === "kazakhstan") return bad("Halaman Kazakhstan tidak bisa dihapus. Ubah statusnya ke Tutup kalau mau berhenti dulu.");
  if (dest._count.signups > 0) return bad("Negara ini sudah punya pendaftar. Ubah statusnya ke Tutup, jangan dihapus.");
  await prisma.poolDestination.delete({ where: { id } });
  return { ok: true, value: { name: dest.name } };
}

async function createDestinationSeed(tx: Tx, seed: PoolDestinationSeed) {
  const { packages, ...fields } = seed;
  const dest = await tx.poolDestination.create({ data: fields });
  if (packages.length) {
    await tx.poolPackage.createMany({
      data: packages.map((p, i) => ({ destinationId: dest.id, code: p.code, name: p.name, days: p.days, summary: p.summary, tiers: p.tiers, single: p.single, sortOrder: i })),
    });
  }
}

/** Buat negara awal yang belum ada (Kazakhstan, Kirgistan, Rusia). Aman dipanggil berulang. */
export async function setupDefaultDestinations(): Promise<string[]> {
  return prisma.$transaction(async (tx) => {
    const existing = new Set((await tx.poolDestination.findMany({ select: { code: true } })).map((d) => d.code));
    const hasKz = !!(await tx.poolDestination.findFirst({ where: { engine: "kazakhstan" }, select: { id: true } }));
    const created: string[] = [];
    for (const seed of POOL_DEFAULT_DESTINATIONS) {
      if (existing.has(seed.code) || (seed.engine === "kazakhstan" && hasKz)) continue;
      await createDestinationSeed(tx, seed);
      created.push(seed.name);
    }
    return created;
  }, TX_OPTIONS);
}

export async function updateSignup(id: string, input: Record<string, unknown>): Promise<SaveResult<{ name: string; detail: string }>> {
  const current = await prisma.poolSignup.findUnique({ where: { id } });
  if (!current) return bad("Pendaftar tidak ditemukan.", 404);
  const data: Prisma.PoolSignupUpdateInput = {};
  const detail: string[] = [];
  if ("status" in input) {
    if (input.status !== "aktif" && input.status !== "batal") return bad("Status tidak valid.");
    data.status = input.status;
    detail.push(`Status → ${input.status}`);
  }
  if ("adminNote" in input) {
    data.adminNote = typeof input.adminNote === "string" ? input.adminNote.trim().slice(0, 600) : "";
    detail.push("Catatan admin diubah");
  }
  if ("poolDate" in input) {
    if (!isDateKey(input.poolDate)) return bad("Tanggal tidak valid.");
    data.poolDate = input.poolDate;
    // Pindah rombongan: tanggal tiba ikut pindah, kecuali ia memang menyusul rombongan lain.
    if (current.arrivalDate === current.poolDate) data.arrivalDate = input.poolDate;
    detail.push(`Tanggal → ${input.poolDate}`);
  }
  if ("pax" in input) {
    const pax = Math.trunc(Number(input.pax));
    if (!(pax >= 1 && pax <= 60)) return bad("Jumlah orang tidak valid.");
    data.pax = pax;
    detail.push(`Jumlah orang → ${pax}`);
  }
  if (!detail.length) return bad("Tidak ada yang diubah.");
  await prisma.poolSignup.update({ where: { id }, data });
  return { ok: true, value: { name: current.name, detail: detail.join(", ") } };
}

export async function deleteSignup(id: string): Promise<SaveResult<{ name: string }>> {
  const current = await prisma.poolSignup.findUnique({ where: { id }, select: { name: true } });
  if (!current) return bad("Pendaftar tidak ditemukan.", 404);
  await prisma.poolSignup.delete({ where: { id } });
  return { ok: true, value: current };
}

/** Pendaftar yang dimasukkan admin sendiri (mis. dari chat WhatsApp). */
export async function createSignupByAdmin(input: Record<string, unknown>): Promise<SaveResult<{ name: string; kode: string }>> {
  const dest = await prisma.poolDestination.findUnique({ where: { id: String(input.destinationId ?? "") }, include: { packages: true } });
  if (!dest) return bad("Pilih negaranya dulu.");
  const name = cleanText(input.name, 80);
  if (name.length < 2) return bad("Isi nama.");
  const whatsapp = normWa(input.whatsapp);
  if (!whatsapp) return bad("Nomor WhatsApp belum pas. Contoh: 0812 3456 7890.");
  if (!isDateKey(input.date)) return bad("Pilih tanggal tiba.");
  const pax = Math.trunc(Number(input.pax));
  if (!(pax >= 1 && pax <= 60)) return bad("Jumlah orang tidak valid.");
  const interest = input.interest === true;
  const allowed = new Set([...dest.packages.map((p) => p.code), ...(dest.engine === "kazakhstan" ? ["KG"] : [])]);
  const codes = [...new Set(String(input.pkg ?? "").split(",").map((c) => c.trim()).filter(Boolean))];
  if (!interest && (!codes.length || codes.length > 2 || codes.some((c) => !allowed.has(c)))) return bad("Pilih paketnya, atau tandai sebagai daftar minat.");
  const date = input.date;

  return prisma.$transaction(async (tx) => {
    await lockDestination(tx, dest.id);
    const kode = await freeKode(tx, dest.code);
    await tx.poolSignup.create({
      data: {
        kode, destinationId: dest.id, poolDate: date, arrivalDate: date, interest,
        pkg: interest ? "minat" : codes.sort().join(","), pax, name, whatsapp,
        adminNote: typeof input.adminNote === "string" ? input.adminNote.trim().slice(0, 600) : "",
        source: "admin",
      },
    });
    return { ok: true as const, value: { name, kode } };
  }, TX_OPTIONS);
}

export async function savePoolDate(input: Record<string, unknown>): Promise<SaveResult<{ label: string }>> {
  const destinationId = String(input.destinationId ?? "");
  const dest = await prisma.poolDestination.findUnique({ where: { id: destinationId }, select: { name: true } });
  if (!dest) return bad("Negara tidak ditemukan.", 404);
  if (!isDateKey(input.date)) return bad("Tanggal tidak valid.");
  const groupLink = typeof input.groupLink === "string" ? input.groupLink.trim().slice(0, 300) : "";
  if (groupLink && !/^https:\/\/(chat\.whatsapp\.com|wa\.me|whatsapp\.com)\//i.test(groupLink)) {
    return bad("Link grup harus link WhatsApp, contoh: https://chat.whatsapp.com/....");
  }
  const quotaRaw = input.quota;
  const quota = quotaRaw === null || quotaRaw === "" || quotaRaw === undefined ? null : clampInt(quotaRaw, 0, 500, 0);
  const note = typeof input.note === "string" ? input.note.trim().slice(0, 300) : "";
  const date = input.date;
  if (quota === null && !groupLink && !note) {
    await prisma.poolDate.deleteMany({ where: { destinationId, date } });
  } else {
    await prisma.poolDate.upsert({
      where: { destinationId_date: { destinationId, date } },
      update: { quota, groupLink, note },
      create: { destinationId, date, quota, groupLink, note },
    });
  }
  return { ok: true, value: { label: `${dest.name} ${date}` } };
}

export type ImportSummary = { created: number; updated: number; unchanged: number; skipped: { line: number; reason: string }[] };

/** Impor pendaftar lama dari Sheet. Kode yang sudah ada tidak dibuat dua kali. */
export async function importKzSignups(destinationId: string, text: string, dryRun: boolean): Promise<SaveResult<ImportSummary>> {
  const dest = await prisma.poolDestination.findUnique({ where: { id: destinationId }, select: { id: true, engine: true } });
  if (!dest) return bad("Negara tidak ditemukan.", 404);
  if (dest.engine !== "kazakhstan") return bad("Impor dari Sheet hanya untuk Kazakhstan.");
  const parsed = parseKzSheet(text);
  const summary: ImportSummary = { created: 0, updated: 0, unchanged: 0, skipped: parsed.skipped };
  if (!parsed.rows.length) return { ok: true, value: summary };

  const existing = await prisma.poolSignup.findMany({
    where: { kode: { in: parsed.rows.map((r) => r.kode) } },
    select: { id: true, kode: true, source: true, destinationId: true },
  });
  const byKode = new Map(existing.map((e) => [e.kode, e]));
  const work: Prisma.PrismaPromise<unknown>[] = [];
  for (const r of parsed.rows) {
    const { createdAt, kgPlan, ...fields } = r;
    const found = byKode.get(r.kode);
    if (!found) {
      summary.created++;
      work.push(prisma.poolSignup.create({
        data: { ...fields, kgPlan: kgPlan ?? undefined, destinationId: dest.id, source: "impor", ...(createdAt ? { createdAt: new Date(createdAt) } : {}) },
      }));
    } else if (found.source === "impor" && found.destinationId === dest.id) {
      // Baris impor disegarkan dari Sheet (mis. status Batal); catatan admin di CMS tidak ditimpa.
      const refresh: Partial<typeof fields> = { ...fields };
      delete refresh.adminNote;
      summary.updated++;
      work.push(prisma.poolSignup.update({ where: { id: found.id }, data: { ...refresh, kgPlan: kgPlan ?? Prisma.JsonNull } }));
    } else {
      summary.unchanged++;
    }
  }
  if (!dryRun && work.length) await prisma.$transaction(work);
  return { ok: true, value: summary };
}
