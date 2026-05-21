// Query layer modul keuangan. Mengambil baris dari Prisma lalu
// merakit view-model siap pakai untuk tiap halaman. Hanya dipanggil
// dari server component / server action.

import { prisma } from "@/lib/prisma";
import {
  aggregateTrip,
  classifyCash,
  companyTotals,
  growth,
  receiptDate,
  receiptIsCashIn,
  type TripAgg,
  type CashClass,
} from "./calc";
import { monthKey } from "./format";

// ── ambil semua baris sekali jalan (dataset travel agency kecil) ──

async function fetchAll() {
  const [tours, banks, vendors, bills, ledger, finances, receipts] = await Promise.all([
    prisma.tour.findMany({ orderBy: [{ tripDate: "desc" }, { createdAt: "desc" }] }),
    prisma.bankAccount.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.vendor.findMany({ orderBy: { name: "asc" } }),
    prisma.vendorBill.findMany({ include: { vendor: true }, orderBy: { createdAt: "desc" } }),
    prisma.ledgerEntry.findMany({ orderBy: { date: "desc" } }),
    prisma.tripFinance.findMany(),
    prisma.receipt.findMany(),
  ]);
  return { tours, banks, vendors, bills, ledger, finances, receipts };
}

type AllData = Awaited<ReturnType<typeof fetchAll>>;
type Tour = AllData["tours"][number];

// ── label status finance per trip ────────────────────────────

export type StatusTone = "cyan" | "warn" | "dim" | "ok";

function tripStatus(tour: Tour): { label: string; tone: StatusTone } {
  const past = tour.tripDate ? new Date(tour.tripDate) < new Date() : false;
  if (tour.status === "CANCELLED") return { label: "BATAL", tone: "dim" };
  if (past) return { label: "SELESAI", tone: "dim" };
  if (tour.status === "FULL") return { label: "FULL", tone: "warn" };
  if (tour.status === "DRAFT") return { label: "DRAFT", tone: "dim" };
  return { label: "OPEN SELLING", tone: "cyan" };
}

function tripCode(tour: Tour): string {
  return tour.id.slice(-5).toUpperCase();
}

// ── enrich: tiap trip + agregat-nya ──────────────────────────

export type EnrichedTrip = {
  id: string;
  code: string;
  title: string;
  country: string;
  tripDate: Date | null;
  status: { label: string; tone: StatusTone };
  agg: TripAgg;
  cash: CashClass;
  hasFinance: boolean;
};

function enrich(all: AllData): EnrichedTrip[] {
  const finByTour = new Map(all.finances.map((f) => [f.tourId, f]));
  return all.tours.map((tour) => {
    const receipts = all.receipts.filter((r) => r.tourId === tour.id);
    const bills = all.bills.filter((b) => b.tourId === tour.id);
    const ledger = all.ledger.filter((l) => l.tourId === tour.id);
    const fin = finByTour.get(tour.id) ?? null;
    const agg = aggregateTrip(
      receipts.map((r) => ({
        amount: r.amount,
        status: r.status,
        pax: r.pax,
        paymentDate: r.paymentDate,
        createdAt: r.createdAt,
      })),
      bills.map((b) => ({ amount: b.amount, amountPaid: b.amountPaid, isDeposit: b.isDeposit })),
      ledger.map((l) => ({ direction: l.direction, amount: l.amount, source: l.source })),
      fin
        ? {
            sellingPrice: fin.sellingPrice,
            targetPax: fin.targetPax,
            projHpp: fin.projHpp,
            status: fin.status,
          }
        : null,
    );
    return {
      id: tour.id,
      code: tripCode(tour),
      title: tour.title,
      country: tour.country,
      tripDate: tour.tripDate,
      status: tripStatus(tour),
      agg,
      cash: classifyCash(agg),
      hasFinance: !!fin,
    };
  });
}

// ── total perusahaan dari semua baris ────────────────────────

function totalsOf(all: AllData) {
  let pesertaCashIn = 0;
  let piutangPeserta = 0;
  for (const r of all.receipts) {
    if (receiptIsCashIn(r.status)) pesertaCashIn += r.amount;
    else piutangPeserta += r.amount;
  }
  let ledgerIn = 0;
  let ledgerOut = 0;
  for (const l of all.ledger) {
    if (l.direction === "IN") ledgerIn += l.amount;
    else ledgerOut += l.amount;
  }
  const openingBalance = all.banks.reduce((s, b) => s + b.openingBalance, 0);
  const hutangVendor = all.bills.reduce((s, b) => s + (b.amount - b.amountPaid), 0);
  return {
    ...companyTotals({
      openingBalance,
      pesertaCashIn,
      ledgerIn,
      ledgerOut,
      piutangPeserta,
      hutangVendor,
    }),
    pesertaCashIn,
    ledgerIn,
    ledgerOut,
  };
}

// ── saldo per rekening ───────────────────────────────────────
// Entri jurnal tanpa rekening + cash-in peserta dimasukkan ke
// rekening pertama (rekening utama), supaya jumlah saldo semua
// rekening selalu rekonsiliasi dengan saldoBankKas.

function computeBankBalances(
  banks: AllData["banks"],
  ledger: AllData["ledger"],
  pesertaCashIn: number,
) {
  let unassigned = pesertaCashIn;
  for (const l of ledger) {
    if (l.bankAccountId) continue;
    unassigned += l.direction === "IN" ? l.amount : -l.amount;
  }
  return banks.map((b, i) => {
    let balance = b.openingBalance;
    let entryCount = 0;
    for (const l of ledger) {
      if (l.bankAccountId !== b.id) continue;
      balance += l.direction === "IN" ? l.amount : -l.amount;
      entryCount++;
    }
    if (i === 0) balance += unassigned;
    return { ...b, balance, entryCount, isPrimary: i === 0 };
  });
}

// ── feed transaksi gabungan (receipt + ledger) ───────────────

export type Txn = {
  id: string;
  date: Date;
  direction: "IN" | "OUT";
  label: string;
  sub: string;
  amount: number;
  kind: string; // PESERTA | VENDOR | OPERASIONAL | MANUAL | ...
};

function buildTxns(all: AllData): Txn[] {
  const tourTitle = new Map(all.tours.map((t) => [t.id, t.title]));
  const fromReceipts: Txn[] = all.receipts
    .filter((r) => receiptIsCashIn(r.status))
    .map((r) => ({
      id: `r-${r.id}`,
      date: receiptDate({
        amount: r.amount,
        status: r.status,
        pax: r.pax,
        paymentDate: r.paymentDate,
        createdAt: r.createdAt,
      }),
      direction: "IN" as const,
      label: `Payment Peserta · ${r.customerName}`,
      sub: r.tourTitle || (r.tourId ? tourTitle.get(r.tourId) ?? "" : ""),
      amount: r.amount,
      kind: "PESERTA",
    }));
  const fromLedger: Txn[] = all.ledger.map((l) => ({
    id: `l-${l.id}`,
    date: l.date,
    direction: l.direction,
    label: l.category,
    sub: l.description || (l.tourId ? tourTitle.get(l.tourId) ?? "" : ""),
    amount: l.amount,
    kind: l.source,
  }));
  return [...fromReceipts, ...fromLedger].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
}

// ─────────────────────────────────────────────────────────────
//  VIEW MODEL PER HALAMAN
// ─────────────────────────────────────────────────────────────

export async function getOverview() {
  const all = await fetchAll();
  const totals = totalsOf(all);
  const trips = enrich(all);
  const txns = buildTxns(all);

  const bankBalances = computeBankBalances(all.banks, all.ledger, totals.pesertaCashIn).map(
    (b) => ({ id: b.id, name: b.name, kind: b.kind, balance: b.balance, accountNo: b.accountNo }),
  );

  // bulan ini vs bulan lalu untuk delta hero
  const now = new Date();
  const curKey = monthKey(now);
  const prevKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const monthly = monthlyPnl(all);
  const cur = monthly.find((m) => m.key === curKey);
  const prev = monthly.find((m) => m.key === prevKey);

  return {
    totals,
    bankBalances,
    txns: txns.slice(0, 60),
    counts: {
      trips: all.tours.length,
      vendors: all.vendors.length,
      banks: all.banks.length,
      bills: all.bills.length,
    },
    activeTrips: trips.filter((t) => t.status.tone === "cyan").length,
    monthNet: cur?.net ?? 0,
    monthNetGrowth: growth(cur?.net ?? 0, prev?.net ?? 0),
  };
}

export async function getTripList() {
  const all = await fetchAll();
  const trips = enrich(all);
  const sum = trips.reduce(
    (s, t) => ({
      realIn: s.realIn + t.agg.realCashIn,
      realOut: s.realOut + t.agg.realCashOut,
      realProfit: s.realProfit + t.agg.realProfit,
      projProfit: s.projProfit + t.agg.projProfit,
    }),
    { realIn: 0, realOut: 0, realProfit: 0, projProfit: 0 },
  );
  return { trips, sum };
}

export async function getTripDetail(id: string) {
  const all = await fetchAll();
  const trip = enrich(all).find((t) => t.id === id);
  if (!trip) return null;
  const receipts = all.receipts
    .filter((r) => r.tourId === id)
    .sort((a, b) => receiptDate(b).getTime() - receiptDate(a).getTime());
  const bills = all.bills.filter((b) => b.tourId === id);
  const ledger = all.ledger.filter((l) => l.tourId === id);
  const finance = all.finances.find((f) => f.tourId === id) ?? null;
  return { trip, receipts, bills, ledger, finance };
}

export type CashPositionRow = {
  id: string;
  code: string;
  title: string;
  cicilanMasuk: number;
  hppLunas: number;
  hppHutang: number;
  titipan: number;
  mengendap: number;
  marginLocked: number;
  hasFinance: boolean;
};

export async function getCashPosition() {
  const all = await fetchAll();
  const totals = totalsOf(all);
  const trips = enrich(all).filter(
    (t) => t.agg.pesertaCashIn !== 0 || t.agg.hppTotal !== 0,
  );
  const rows: CashPositionRow[] = trips.map((t) => ({
    id: t.id,
    code: t.code,
    title: t.title,
    cicilanMasuk: t.agg.pesertaCashIn,
    hppLunas: t.agg.hppLunas,
    hppHutang: t.agg.hppHutang,
    titipan: t.cash.titipan,
    mengendap: t.cash.mengendap,
    marginLocked: t.cash.marginLocked,
    hasFinance: t.hasFinance,
  }));
  const agg = rows.reduce(
    (s, r) => ({
      cicilanMasuk: s.cicilanMasuk + r.cicilanMasuk,
      hppLunas: s.hppLunas + r.hppLunas,
      hppHutang: s.hppHutang + r.hppHutang,
      titipan: s.titipan + r.titipan,
      mengendap: s.mengendap + r.mengendap,
      marginLocked: s.marginLocked + r.marginLocked,
    }),
    { cicilanMasuk: 0, hppLunas: 0, hppHutang: 0, titipan: 0, mengendap: 0, marginLocked: 0 },
  );
  const uangPeserta = agg.titipan + agg.mengendap;
  return {
    rows,
    agg,
    uangPeserta,
    uangPerusahaan: totals.saldoBankKas - uangPeserta,
    hutangVendor: totals.hutangVendor,
  };
}

export async function getBankData() {
  const all = await fetchAll();
  const totals = totalsOf(all);
  const banks = computeBankBalances(all.banks, all.ledger, totals.pesertaCashIn).map((b) => ({
    id: b.id,
    name: b.name,
    kind: b.kind,
    accountNo: b.accountNo,
    note: b.note,
    archived: b.archived,
    openingBalance: b.openingBalance,
    balance: b.balance,
    entryCount: b.entryCount,
    isPrimary: b.isPrimary,
  }));
  return { banks, totalSaldo: totals.saldoBankKas };
}

export async function getVendorData() {
  const all = await fetchAll();
  const vendors = all.vendors.map((v) => {
    const bills = all.bills.filter((b) => b.vendorId === v.id);
    const total = bills.reduce((s, b) => s + b.amount, 0);
    const paid = bills.reduce((s, b) => s + b.amountPaid, 0);
    return {
      id: v.id,
      name: v.name,
      category: v.category,
      contact: v.contact,
      billCount: bills.length,
      total,
      paid,
      outstanding: total - paid,
    };
  });
  const tourTitle = new Map(all.tours.map((t) => [t.id, t.title]));
  const bills = all.bills.map((b) => ({
    id: b.id,
    vendorName: b.vendor.name,
    vendorCategory: b.vendor.category,
    description: b.description,
    tourTitle: b.tourId ? tourTitle.get(b.tourId) ?? null : null,
    amount: b.amount,
    amountPaid: b.amountPaid,
    outstanding: b.amount - b.amountPaid,
    currency: b.currency,
    fxRate: b.fxRate,
    status: b.status,
    isDeposit: b.isDeposit,
    dueDate: b.dueDate,
  }));
  const unpaidBills = bills
    .filter((b) => b.outstanding > 0)
    .map((b) => ({
      id: b.id,
      label: `${b.vendorName} — ${b.description} · sisa Rp ${Math.round(
        b.outstanding,
      ).toLocaleString("id-ID")}`,
      outstanding: b.outstanding,
    }));

  return {
    vendors,
    bills,
    unpaidBills,
    tours: all.tours.map((t) => ({ id: t.id, title: t.title })),
    banks: all.banks.map((b) => ({ id: b.id, name: b.name })),
    totalHutang: vendors.reduce((s, v) => s + v.outstanding, 0),
    totalTagihan: vendors.reduce((s, v) => s + v.total, 0),
    totalDibayar: vendors.reduce((s, v) => s + v.paid, 0),
  };
}

export async function getJurnalData() {
  const all = await fetchAll();
  const txns = buildTxns(all);
  const tourTitle = new Map(all.tours.map((t) => [t.id, t.title]));
  const entries = all.ledger.map((l) => ({
    id: l.id,
    date: l.date,
    direction: l.direction,
    amount: l.amount,
    category: l.category,
    description: l.description,
    source: l.source,
    tourTitle: l.tourId ? tourTitle.get(l.tourId) ?? null : null,
    locked: !!l.vendorBillId, // entry pelunasan vendor — hapus dari sisi vendor
  }));
  let ledgerIn = 0;
  let ledgerOut = 0;
  for (const l of all.ledger) {
    if (l.direction === "IN") ledgerIn += l.amount;
    else ledgerOut += l.amount;
  }
  return {
    txns,
    entries,
    banks: all.banks.map((b) => ({ id: b.id, name: b.name })),
    tours: all.tours.map((t) => ({ id: t.id, title: t.title })),
    ledgerCount: all.ledger.length,
    ledgerIn,
    ledgerOut,
  };
}

// ── P&L bulanan ──────────────────────────────────────────────

export type MonthRow = {
  key: string;
  income: number;
  expense: number;
  net: number;
};

function monthlyPnl(all: AllData): MonthRow[] {
  const map = new Map<string, MonthRow>();
  const touch = (key: string) => {
    if (!map.has(key)) map.set(key, { key, income: 0, expense: 0, net: 0 });
    return map.get(key)!;
  };
  for (const r of all.receipts) {
    if (!receiptIsCashIn(r.status)) continue;
    touch(monthKey(receiptDate(r))).income += r.amount;
  }
  for (const l of all.ledger) {
    const row = touch(monthKey(l.date));
    if (l.direction === "IN") row.income += l.amount;
    else row.expense += l.amount;
  }
  for (const row of map.values()) row.net = row.income - row.expense;
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export async function getLaporan() {
  const all = await fetchAll();
  const months = monthlyPnl(all);
  const last6 = months.slice(-6);
  const now = new Date();
  const curKey = monthKey(now);
  const cur = months.find((m) => m.key === curKey) ?? {
    key: curKey,
    income: 0,
    expense: 0,
    net: 0,
  };

  // rincian bulan berjalan per kategori
  const incomeLines = new Map<string, number>();
  const expenseLines = new Map<string, number>();
  let pesertaThisMonth = 0;
  for (const r of all.receipts) {
    if (!receiptIsCashIn(r.status)) continue;
    if (monthKey(receiptDate(r)) === curKey) pesertaThisMonth += r.amount;
  }
  if (pesertaThisMonth) incomeLines.set("Payment Peserta", pesertaThisMonth);
  for (const l of all.ledger) {
    if (monthKey(l.date) !== curKey) continue;
    const bucket = l.direction === "IN" ? incomeLines : expenseLines;
    bucket.set(l.category, (bucket.get(l.category) ?? 0) + l.amount);
  }

  const totalIncome = months.reduce((s, m) => s + m.income, 0);
  const totalExpense = months.reduce((s, m) => s + m.expense, 0);

  return {
    last6,
    current: cur,
    incomeLines: [...incomeLines.entries()].map(([k, v]) => ({ label: k, amount: v })),
    expenseLines: [...expenseLines.entries()].map(([k, v]) => ({ label: k, amount: v })),
    lifetime: { income: totalIncome, expense: totalExpense, net: totalIncome - totalExpense },
  };
}

export async function getNeraca() {
  const all = await fetchAll();
  const totals = totalsOf(all);
  const banks = computeBankBalances(all.banks, all.ledger, totals.pesertaCashIn).map((b) => ({
    name: b.name,
    balance: b.balance,
  }));

  // hutang vendor per kategori
  const hutangByCat = new Map<string, number>();
  for (const b of all.bills) {
    const out = b.amount - b.amountPaid;
    if (out <= 0) continue;
    hutangByCat.set(b.vendor.category, (hutangByCat.get(b.vendor.category) ?? 0) + out);
  }

  const assets = [
    ...banks.map((b) => ({ label: b.name, amount: b.balance })),
    { label: "Piutang Peserta", amount: totals.piutangPeserta },
  ];
  const totalAssets = totals.saldoBankKas + totals.piutangPeserta;
  const liabilities = [...hutangByCat.entries()].map(([k, v]) => ({
    label: `Hutang Vendor · ${k}`,
    amount: v,
  }));
  const totalLiabilities = totals.hutangVendor;

  return {
    assets,
    totalAssets,
    liabilities,
    totalLiabilities,
    equity: totalAssets - totalLiabilities,
    realUang: totals.realUangPerusahaan,
  };
}
