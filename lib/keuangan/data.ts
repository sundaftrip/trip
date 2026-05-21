// Query layer modul keuangan (basis akrual). Mengambil baris Prisma
// lalu merakit view-model siap pakai untuk tiap halaman.

import { prisma } from "@/lib/prisma";
import {
  aggregateTrip,
  buildPosition,
  classifyLedger,
  growth,
  isTripDeparted,
  receiptDate,
  receiptIsCashIn,
  type TripAgg,
} from "./calc";
import { monthKey } from "./format";

// ── ambil semua baris sekali jalan ───────────────────────────

async function fetchAll() {
  // Query dibatch maksimal 3 paralel — pool koneksi Prisma dibatasi 3
  // (lihat lib/prisma.ts). Menembak 7 query sekaligus bisa memicu
  // P2024 (connection pool timeout) di Neon saat trafik bersamaan.
  const [tours, banks, vendors] = await Promise.all([
    prisma.tour.findMany({ orderBy: [{ tripDate: "desc" }, { createdAt: "desc" }] }),
    prisma.bankAccount.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.vendor.findMany({ orderBy: { name: "asc" } }),
  ]);
  const [bills, ledger, finances] = await Promise.all([
    prisma.vendorBill.findMany({ include: { vendor: true }, orderBy: { createdAt: "desc" } }),
    prisma.ledgerEntry.findMany({ orderBy: { date: "desc" } }),
    prisma.tripFinance.findMany(),
  ]);
  const [receipts, fieldExpenses] = await Promise.all([
    prisma.receipt.findMany(),
    prisma.fieldExpense.findMany({ orderBy: { date: "desc" } }),
  ]);
  return { tours, banks, vendors, bills, ledger, finances, receipts, fieldExpenses };
}

type AllData = Awaited<ReturnType<typeof fetchAll>>;
type Tour = AllData["tours"][number];

export type StatusTone = "cyan" | "warn" | "dim" | "ok";

function tripStatus(tour: Tour, departed: boolean): { label: string; tone: StatusTone } {
  if (tour.status === "CANCELLED") return { label: "BATAL", tone: "dim" };
  if (departed) return { label: "SUDAH BERANGKAT", tone: "ok" };
  if (tour.status === "FULL") return { label: "FULL", tone: "warn" };
  if (tour.status === "DRAFT") return { label: "DRAFT", tone: "dim" };
  return { label: "OPEN SELLING", tone: "cyan" };
}

function tripCode(tour: Tour): string {
  return tour.id.slice(-5).toUpperCase();
}

// ── enrich: tiap trip + agregat akrual ───────────────────────

export type EnrichedTrip = {
  id: string;
  code: string;
  title: string;
  country: string;
  tripDate: Date | null;
  departed: boolean;
  status: { label: string; tone: StatusTone };
  agg: TripAgg;
  hasFinance: boolean;
};

// ── hasil derivasi inti, dipakai bersama semua halaman ───────

function derive(all: AllData) {
  const activeBills = all.bills.filter((b) => !b.voided);
  const activeLedger = all.ledger.filter((l) => !l.voided);
  const finByTour = new Map(all.finances.map((f) => [f.tourId, f]));

  const trips: EnrichedTrip[] = all.tours.map((tour) => {
    const departed = isTripDeparted(tour.tripDate, tour.status);
    const receipts = all.receipts.filter((r) => r.tourId === tour.id);
    const bills = activeBills.filter((b) => b.tourId === tour.id);
    const ledger = activeLedger.filter((l) => l.tourId === tour.id);
    const fin = finByTour.get(tour.id) ?? null;
    const fieldHpp = all.fieldExpenses
      .filter((f) => f.tourId === tour.id && f.status === "APPROVED")
      .reduce((s, f) => s + f.amount, 0);
    const agg = aggregateTrip(
      receipts.map((r) => ({
        amount: r.amount,
        status: r.status,
        pax: r.pax,
        paymentDate: r.paymentDate,
        createdAt: r.createdAt,
      })),
      bills.map((b) => ({ amount: b.amount, amountPaid: b.amountPaid })),
      ledger.map((l) => ({
        direction: l.direction,
        amount: l.amount,
        source: l.source,
        vendorBillId: l.vendorBillId,
      })),
      fin
        ? {
            sellingPrice: fin.sellingPrice,
            targetPax: fin.targetPax,
            projHpp: fin.projHpp,
            status: fin.status,
          }
        : null,
      departed,
      fieldHpp,
    );
    return {
      id: tour.id,
      code: tripCode(tour),
      title: tour.title,
      country: tour.country,
      tripDate: tour.tripDate,
      departed,
      status: tripStatus(tour, departed),
      agg,
      hasFinance: !!fin,
    };
  });

  // klasifikasi jurnal kas (non-void)
  let capitalIn = 0;
  let priveOut = 0;
  let otherIncome = 0;
  let opex = 0;
  let vendorSettle = 0;
  let advanceTotal = 0;
  let ledgerInTotal = 0;
  let ledgerOutTotal = 0;
  for (const l of activeLedger) {
    if (l.direction === "IN") ledgerInTotal += l.amount;
    else ledgerOutTotal += l.amount;
    switch (classifyLedger(l)) {
      case "CAPITAL_IN":
        capitalIn += l.amount;
        break;
      case "PRIVE_OUT":
        priveOut += l.amount;
        break;
      case "ADVANCE_OUT":
        advanceTotal += l.amount;
        break;
      case "OTHER_INCOME":
        otherIncome += l.amount;
        break;
      case "OPEX":
        opex += l.amount;
        break;
      case "VENDOR_SETTLE":
        vendorSettle += l.amount;
        break;
    }
  }

  // Uang Muka TL = kasbon yang sudah keluar − pengeluaran lapangan
  // yang sudah di-approve. Sisa = cash yang masih dipegang TL.
  const fieldApproved = all.fieldExpenses
    .filter((f) => f.status === "APPROVED")
    .reduce((s, f) => s + f.amount, 0);
  const fieldPending = all.fieldExpenses
    .filter((f) => f.status === "PENDING")
    .reduce((s, f) => s + f.amount, 0);
  const fieldPendingCount = all.fieldExpenses.filter((f) => f.status === "PENDING").length;
  const uangMukaTL = advanceTotal - fieldApproved;

  const opening = all.banks.reduce((s, b) => s + b.openingBalance, 0);
  const pesertaCashInAll = trips.reduce((s, t) => s + t.agg.pesertaCashIn, 0);
  const cash = opening + pesertaCashInAll + ledgerInTotal - ledgerOutTotal;
  const hutangVendor = activeBills.reduce((s, b) => s + (b.amount - b.amountPaid), 0);
  const deferredRevenue = trips.reduce((s, t) => s + t.agg.deferredRevenue, 0);
  const arPeserta = trips.reduce((s, t) => s + t.agg.arPeserta, 0);
  const wipCost = trips.reduce((s, t) => s + t.agg.wipCost, 0);
  const recognizedRevenue = trips.reduce((s, t) => s + t.agg.recognizedRevenue, 0);
  const recognizedHpp = trips.reduce((s, t) => s + t.agg.recognizedHpp, 0);
  const modal = opening + capitalIn - priveOut;
  const labaDitahan = recognizedRevenue - recognizedHpp - opex + otherIncome;

  const position = buildPosition({
    cash,
    arPeserta,
    wipCost,
    uangMukaTL,
    hutangVendor,
    deferredRevenue,
    modal,
    labaDitahan,
  });

  return {
    all,
    activeBills,
    activeLedger,
    trips,
    position,
    opening,
    pesertaCashInAll,
    capitalIn,
    priveOut,
    advanceTotal,
    otherIncome,
    opex,
    vendorSettle,
    recognizedRevenue,
    recognizedHpp,
    fieldApproved,
    fieldPending,
    fieldPendingCount,
  };
}

type Derived = ReturnType<typeof derive>;

// ── saldo per rekening ───────────────────────────────────────
// Jurnal tanpa rekening + cash-in peserta dialokasikan ke rekening
// pertama, supaya jumlah saldo semua rekening = total kas.

function computeBankBalances(
  banks: AllData["banks"],
  activeLedger: AllData["ledger"],
  pesertaCashIn: number,
) {
  let unassigned = pesertaCashIn;
  for (const l of activeLedger) {
    if (l.bankAccountId) continue;
    unassigned += l.direction === "IN" ? l.amount : -l.amount;
  }
  return banks.map((b, i) => {
    let balance = b.openingBalance;
    let entryCount = 0;
    for (const l of activeLedger) {
      if (l.bankAccountId !== b.id) continue;
      balance += l.direction === "IN" ? l.amount : -l.amount;
      entryCount++;
    }
    if (i === 0) balance += unassigned;
    return { ...b, balance, entryCount, isPrimary: i === 0 };
  });
}

// ── feed transaksi gabungan ──────────────────────────────────

export type Txn = {
  id: string;
  date: Date;
  direction: "IN" | "OUT";
  label: string;
  sub: string;
  amount: number;
  kind: string;
  voided: boolean;
};

function buildTxns(d: Derived, includeVoided: boolean): Txn[] {
  const all = d.all;
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
      voided: false,
    }));
  const fromLedger: Txn[] = all.ledger
    .filter((l) => includeVoided || !l.voided)
    .map((l) => ({
      id: `l-${l.id}`,
      date: l.date,
      direction: l.direction,
      label: l.category,
      sub: l.description || (l.tourId ? tourTitle.get(l.tourId) ?? "" : ""),
      amount: l.amount,
      kind: l.source,
      voided: l.voided,
    }));
  return [...fromReceipts, ...fromLedger].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
}

// ── P&L bulanan (akrual) ─────────────────────────────────────

export type MonthRow = {
  key: string;
  revenue: number;
  hpp: number;
  opex: number;
  otherIncome: number;
  net: number;
};

function monthlyPnl(d: Derived): MonthRow[] {
  const map = new Map<string, MonthRow>();
  const touch = (key: string) => {
    if (!map.has(key))
      map.set(key, { key, revenue: 0, hpp: 0, opex: 0, otherIncome: 0, net: 0 });
    return map.get(key)!;
  };
  // pendapatan & HPP diakui di bulan trip BERANGKAT
  for (const t of d.trips) {
    if (!t.agg.departed || !t.tripDate) continue;
    const row = touch(monthKey(t.tripDate));
    row.revenue += t.agg.recognizedRevenue;
    row.hpp += t.agg.recognizedHpp;
  }
  // beban operasional & pendapatan lain di bulan transaksinya
  for (const l of d.activeLedger) {
    const c = classifyLedger(l);
    if (c === "OPEX") touch(monthKey(l.date)).opex += l.amount;
    else if (c === "OTHER_INCOME") touch(monthKey(l.date)).otherIncome += l.amount;
  }
  for (const row of map.values())
    row.net = row.revenue - row.hpp - row.opex + row.otherIncome;
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

// ─────────────────────────────────────────────────────────────
//  VIEW MODEL PER HALAMAN
// ─────────────────────────────────────────────────────────────

export async function getOverview() {
  const d = derive(await fetchAll());
  const p = d.position;
  const banks = computeBankBalances(d.all.banks, d.activeLedger, d.pesertaCashInAll);
  const txns = buildTxns(d, false);
  const monthly = monthlyPnl(d);

  const now = new Date();
  const curKey = monthKey(now);
  const prevKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const cur = monthly.find((m) => m.key === curKey);
  const prev = monthly.find((m) => m.key === prevKey);

  return {
    position: p,
    bankBalances: banks.map((b) => ({
      id: b.id,
      name: b.name,
      kind: b.kind,
      balance: b.balance,
    })),
    txns: txns.slice(0, 60),
    counts: {
      trips: d.all.tours.length,
      departed: d.trips.filter((t) => t.departed).length,
      vendors: d.all.vendors.length,
      banks: d.all.banks.length,
      bills: d.activeBills.length,
    },
    recognizedRevenue: d.recognizedRevenue,
    monthNet: cur?.net ?? 0,
    monthNetGrowth: growth(cur?.net ?? 0, prev?.net ?? 0),
    fieldPendingCount: d.fieldPendingCount,
    fieldPending: d.fieldPending,
  };
}

export async function getTripList() {
  const d = derive(await fetchAll());
  const trips = d.trips;
  const sum = trips.reduce(
    (s, t) => ({
      cashIn: s.cashIn + t.agg.cashIn,
      cashOut: s.cashOut + t.agg.cashOut,
      netCashFlow: s.netCashFlow + t.agg.netCashFlow,
      recognizedProfit: s.recognizedProfit + t.agg.recognizedProfit,
      deferredRevenue: s.deferredRevenue + t.agg.deferredRevenue,
    }),
    { cashIn: 0, cashOut: 0, netCashFlow: 0, recognizedProfit: 0, deferredRevenue: 0 },
  );
  return { trips, sum };
}

export async function getTripDetail(id: string) {
  const d = derive(await fetchAll());
  const trip = d.trips.find((t) => t.id === id);
  if (!trip) return null;
  const tour = d.all.tours.find((t) => t.id === id);
  const receipts = d.all.receipts
    .filter((r) => r.tourId === id)
    .sort((a, b) => receiptDate(b).getTime() - receiptDate(a).getTime());
  const bills = d.activeBills.filter((b) => b.tourId === id);
  const ledger = d.activeLedger.filter((l) => l.tourId === id);
  const finance = d.all.finances.find((f) => f.tourId === id) ?? null;
  const fieldExpenses = d.all.fieldExpenses
    .filter((f) => f.tourId === id)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  const fieldPending = fieldExpenses
    .filter((f) => f.status === "PENDING")
    .reduce((s, f) => s + f.amount, 0);
  // rekonsiliasi kasbon: kasbon keluar − pengeluaran lapangan disetujui
  const kasbonSisa = trip.agg.advanceOut - trip.agg.fieldHpp;
  return {
    trip,
    receipts,
    bills,
    ledger,
    finance,
    fieldExpenses,
    fieldPending,
    kasbonSisa,
    expenseToken: tour?.expenseToken ?? null,
  };
}

export type CashPositionRow = {
  id: string;
  code: string;
  title: string;
  departed: boolean;
  pesertaCashIn: number;
  hppPaid: number;
  hppHutang: number;
  titipan: number; // deferred revenue — trip belum berangkat
  recognizedRevenue: number;
  recognizedProfit: number;
};

export async function getCashPosition() {
  const d = derive(await fetchAll());
  const rows: CashPositionRow[] = d.trips
    .filter((t) => t.agg.pesertaCashIn !== 0 || t.agg.hppTotal !== 0)
    .map((t) => ({
      id: t.id,
      code: t.code,
      title: t.title,
      departed: t.departed,
      pesertaCashIn: t.agg.pesertaCashIn,
      hppPaid: t.agg.hppPaid,
      hppHutang: t.agg.hppHutang,
      titipan: t.agg.deferredRevenue,
      recognizedRevenue: t.agg.recognizedRevenue,
      recognizedProfit: t.agg.recognizedProfit,
    }));
  return {
    rows,
    position: d.position,
    titipanCount: d.trips.filter((t) => !t.departed && t.agg.pesertaCashIn > 0).length,
  };
}

export async function getBankData() {
  const d = derive(await fetchAll());
  const banks = computeBankBalances(d.all.banks, d.activeLedger, d.pesertaCashInAll).map(
    (b) => ({
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
    }),
  );
  return { banks, totalSaldo: d.position.cash };
}

export async function getVendorData() {
  const d = derive(await fetchAll());
  const tourTitle = new Map(d.all.tours.map((t) => [t.id, t.title]));

  const vendors = d.all.vendors.map((v) => {
    const bills = d.activeBills.filter((b) => b.vendorId === v.id);
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

  // tampilkan semua tagihan (yang void ditandai), tapi non-void untuk total
  const bills = d.all.bills.map((b) => ({
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
    voided: b.voided,
    dueDate: b.dueDate,
  }));

  const unpaidBills = bills
    .filter((b) => !b.voided && b.outstanding > 0)
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
    tours: d.all.tours.map((t) => ({ id: t.id, title: t.title })),
    banks: d.all.banks.map((b) => ({ id: b.id, name: b.name })),
    totalHutang: vendors.reduce((s, v) => s + v.outstanding, 0),
    totalTagihan: vendors.reduce((s, v) => s + v.total, 0),
    totalDibayar: vendors.reduce((s, v) => s + v.paid, 0),
  };
}

export async function getJurnalData() {
  const d = derive(await fetchAll());
  const txns = buildTxns(d, true);
  const tourTitle = new Map(d.all.tours.map((t) => [t.id, t.title]));
  const entries = d.all.ledger.map((l) => ({
    id: l.id,
    date: l.date,
    direction: l.direction,
    amount: l.amount,
    category: l.category,
    description: l.description,
    source: l.source,
    tourTitle: l.tourId ? tourTitle.get(l.tourId) ?? null : null,
    voided: l.voided,
    locked: !!l.vendorBillId,
  }));
  return {
    txns,
    entries,
    banks: d.all.banks.map((b) => ({ id: b.id, name: b.name })),
    tours: d.all.tours.map((t) => ({ id: t.id, title: t.title })),
    ledgerCount: d.activeLedger.length,
    voidedCount: d.all.ledger.filter((l) => l.voided).length,
    ledgerIn: d.activeLedger
      .filter((l) => l.direction === "IN")
      .reduce((s, l) => s + l.amount, 0),
    ledgerOut: d.activeLedger
      .filter((l) => l.direction === "OUT")
      .reduce((s, l) => s + l.amount, 0),
  };
}

export async function getLaporan() {
  const d = derive(await fetchAll());
  const months = monthlyPnl(d);
  const last6 = months.slice(-6);
  const now = new Date();
  const curKey = monthKey(now);
  const cur =
    months.find((m) => m.key === curKey) ??
    ({ key: curKey, revenue: 0, hpp: 0, opex: 0, otherIncome: 0, net: 0 } as MonthRow);

  // rincian beban operasional bulan berjalan per kategori
  const opexLines = new Map<string, number>();
  const incomeLines = new Map<string, number>();
  for (const l of d.activeLedger) {
    if (monthKey(l.date) !== curKey) continue;
    const c = classifyLedger(l);
    if (c === "OPEX") opexLines.set(l.category, (opexLines.get(l.category) ?? 0) + l.amount);
    else if (c === "OTHER_INCOME")
      incomeLines.set(l.category, (incomeLines.get(l.category) ?? 0) + l.amount);
  }
  // trip yang berangkat bulan ini
  const tripsThisMonth = d.trips
    .filter((t) => t.departed && t.tripDate && monthKey(t.tripDate) === curKey)
    .map((t) => ({
      code: t.code,
      title: t.title,
      revenue: t.agg.recognizedRevenue,
      hpp: t.agg.recognizedHpp,
      profit: t.agg.recognizedProfit,
    }));

  const lifetime = months.reduce(
    (s, m) => ({
      revenue: s.revenue + m.revenue,
      hpp: s.hpp + m.hpp,
      opex: s.opex + m.opex,
      otherIncome: s.otherIncome + m.otherIncome,
      net: s.net + m.net,
    }),
    { revenue: 0, hpp: 0, opex: 0, otherIncome: 0, net: 0 },
  );

  return {
    last6,
    current: cur,
    tripsThisMonth,
    opexLines: [...opexLines.entries()].map(([k, v]) => ({ label: k, amount: v })),
    incomeLines: [...incomeLines.entries()].map(([k, v]) => ({ label: k, amount: v })),
    lifetime,
  };
}

export async function getNeraca() {
  const d = derive(await fetchAll());
  const p = d.position;
  const banks = computeBankBalances(d.all.banks, d.activeLedger, d.pesertaCashInAll);

  const assets = [
    ...banks.map((b) => ({ label: b.name, amount: b.balance, group: "Kas & Bank" })),
    { label: "Piutang Peserta", amount: p.arPeserta, group: "Piutang" },
    { label: "Uang Muka TL (Kasbon)", amount: p.uangMukaTL, group: "Uang Muka" },
    { label: "Biaya Trip Ditangguhkan", amount: p.wipCost, group: "Trip Berjalan" },
  ];
  const liabilities = [
    { label: "Hutang Vendor", amount: p.hutangVendor },
    { label: "Titipan Peserta (Pendapatan Diterima di Muka)", amount: p.deferredRevenue },
  ];
  const equity = [
    { label: "Modal Disetor", amount: p.modal },
    { label: "Laba Ditahan", amount: p.labaDitahan },
  ];

  return { position: p, assets, liabilities, equity };
}

// ── Pengeluaran Lapangan (queue approval) ────────────────────

export type FieldExpenseRow = {
  id: string;
  tourId: string;
  tourCode: string;
  tourTitle: string;
  date: Date;
  category: string;
  amount: number;
  photoUrl: string;
  note: string | null;
  submittedBy: string;
  status: string;
  reviewNote: string | null;
};

export async function getLapanganData() {
  const d = derive(await fetchAll());
  const tourMap = new Map(d.all.tours.map((t) => [t.id, t]));
  const rows: FieldExpenseRow[] = d.all.fieldExpenses.map((f) => {
    const t = tourMap.get(f.tourId);
    return {
      id: f.id,
      tourId: f.tourId,
      tourCode: t ? tripCode(t) : "—",
      tourTitle: t?.title ?? "—",
      date: f.date,
      category: f.category,
      amount: f.amount,
      photoUrl: f.photoUrl,
      note: f.note,
      submittedBy: f.submittedBy,
      status: f.status,
      reviewNote: f.reviewNote,
    };
  });
  return {
    rows,
    pendingCount: rows.filter((r) => r.status === "PENDING").length,
    pendingTotal: d.fieldPending,
    approvedTotal: d.fieldApproved,
    advanceTotal: d.advanceTotal,
    uangMukaTL: d.position.uangMukaTL,
  };
}
