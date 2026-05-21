// ─────────────────────────────────────────────────────────────
//  MESIN AKUNTANSI AKRUAL — perusahaan travel
//  Semua fungsi PURE (tidak menyentuh DB). data.ts mengambil baris
//  Prisma lalu memanggil fungsi-fungsi ini.
//
//  Prinsip inti (basis akrual):
//   • Uang peserta untuk trip yang BELUM berangkat = Titipan Peserta
//     (kewajiban / pendapatan diterima di muka) — BUKAN pendapatan.
//   • Pendapatan & HPP baru diakui saat trip BERANGKAT (tripDate lewat).
//   • Biaya trip yang belum berangkat = aset "Biaya Trip Ditangguhkan".
//   • Ekuitas = Modal + Laba Ditahan (dihitung independen → Neraca
//     menjadi alat verifikasi, bukan tautologi).
//
//  Identitas yang dijamin: Aset = Kewajiban + Ekuitas.
// ─────────────────────────────────────────────────────────────

export type ReceiptLite = {
  amount: number;
  status: string; // "PAID" | "DP" | "UNPAID"
  pax: number;
  paymentDate: Date | null;
  createdAt: Date;
};

export type BillLite = {
  amount: number;
  amountPaid: number;
};

export type LedgerLite = {
  direction: "IN" | "OUT";
  amount: number;
  source: string;
  vendorBillId: string | null;
};

export type FinanceLite = {
  sellingPrice: number;
  targetPax: number;
  projHpp: number;
  status: string;
} | null;

/** Receipt dianggap sudah jadi uang masuk kalau lunas atau ada DP. */
export function receiptIsCashIn(status: string): boolean {
  return status === "PAID" || status === "DP";
}

/** Tanggal efektif sebuah receipt untuk grouping bulanan. */
export function receiptDate(r: ReceiptLite): Date {
  return r.paymentDate ?? r.createdAt;
}

/**
 * Trip dianggap "sudah berangkat" — momen pendapatan & HPP diakui.
 * Trip yang dibatalkan tidak pernah dianggap berangkat (uang peserta
 * tetap jadi kewajiban sampai dikembalikan).
 */
export function isTripDeparted(tripDate: Date | null, tourStatus: string): boolean {
  if (tourStatus === "CANCELLED") return false;
  if (!tripDate) return false;
  return new Date(tripDate).getTime() <= Date.now();
}

// ── klasifikasi baris jurnal ──────────────────────────────────
//
//  VENDOR_SETTLE  — pelunasan hutang vendor (kas ↓, hutang ↓). Bukan beban.
//  CAPITAL_IN     — setoran modal pemilik (kas ↑, ekuitas ↑). Bukan pendapatan.
//  PRIVE_OUT      — penarikan pemilik (kas ↓, ekuitas ↓). Bukan beban.
//  OTHER_INCOME   — pendapatan lain non-trip (masuk P&L).
//  OPEX           — beban operasional (masuk P&L).

export type LedgerClass =
  | "VENDOR_SETTLE"
  | "CAPITAL_IN"
  | "PRIVE_OUT"
  | "OTHER_INCOME"
  | "OPEX";

export function classifyLedger(e: {
  direction: "IN" | "OUT";
  source: string;
  vendorBillId: string | null;
}): LedgerClass {
  if (e.vendorBillId) return "VENDOR_SETTLE";
  if (e.source === "CAPITAL") return "CAPITAL_IN";
  if (e.source === "PRIVE") return "PRIVE_OUT";
  return e.direction === "IN" ? "OTHER_INCOME" : "OPEX";
}

// ── agregat per trip ──────────────────────────────────────────

export type TripAgg = {
  departed: boolean;

  // sisi peserta
  pesertaCashIn: number; // kas diterima dari peserta (lunas + DP)
  pesertaPiutang: number; // peserta yang belum bayar
  billedTotal: number; // total ditagihkan ke peserta (kas + piutang)
  pax: number;

  // sisi biaya (vendor / HPP)
  hppTotal: number; // total tagihan vendor untuk trip ini
  hppPaid: number; // tagihan vendor yang sudah dibayar
  hppHutang: number; // tagihan vendor yang belum dibayar

  // jurnal kas yang ditag ke trip
  ledgerIn: number;
  ledgerOut: number;

  // arus kas (basis kas) — untuk halaman cashflow
  cashIn: number;
  cashOut: number;
  netCashFlow: number;

  // pengakuan akrual — hanya terisi kalau trip sudah berangkat
  recognizedRevenue: number;
  recognizedHpp: number;
  recognizedProfit: number;

  // dampak ke neraca
  deferredRevenue: number; // Titipan Peserta (kewajiban) — trip belum berangkat
  wipCost: number; // Biaya Trip Ditangguhkan (aset) — trip belum berangkat
  arPeserta: number; // Piutang Peserta (aset) — trip sudah berangkat

  // proyeksi finance
  hasProjection: boolean;
  projIncome: number;
  projHpp: number;
  projProfit: number;
};

export function aggregateTrip(
  receipts: ReceiptLite[],
  bills: BillLite[],
  ledger: LedgerLite[],
  finance: FinanceLite,
  departed: boolean,
): TripAgg {
  let pesertaCashIn = 0;
  let pesertaPiutang = 0;
  let pax = 0;
  for (const r of receipts) {
    if (receiptIsCashIn(r.status)) {
      pesertaCashIn += r.amount;
      pax += r.pax;
    } else {
      pesertaPiutang += r.amount;
    }
  }

  let hppTotal = 0;
  let hppPaid = 0;
  for (const b of bills) {
    hppTotal += b.amount;
    hppPaid += b.amountPaid;
  }
  const hppHutang = hppTotal - hppPaid;

  let ledgerIn = 0;
  let ledgerOut = 0;
  for (const l of ledger) {
    if (l.direction === "IN") ledgerIn += l.amount;
    else ledgerOut += l.amount;
  }

  const billedTotal = pesertaCashIn + pesertaPiutang;
  const cashIn = pesertaCashIn + ledgerIn;
  const cashOut = ledgerOut;

  const hasProjection = !!finance && finance.status === "CONFIRMED";
  const projIncome = finance ? finance.sellingPrice * finance.targetPax : 0;
  const projHpp = finance ? finance.projHpp : 0;

  return {
    departed,
    pesertaCashIn,
    pesertaPiutang,
    billedTotal,
    pax,
    hppTotal,
    hppPaid,
    hppHutang,
    ledgerIn,
    ledgerOut,
    cashIn,
    cashOut,
    netCashFlow: cashIn - cashOut,
    recognizedRevenue: departed ? billedTotal : 0,
    recognizedHpp: departed ? hppTotal : 0,
    recognizedProfit: departed ? billedTotal - hppTotal : 0,
    deferredRevenue: departed ? 0 : pesertaCashIn,
    wipCost: departed ? 0 : hppTotal,
    arPeserta: departed ? pesertaPiutang : 0,
    hasProjection,
    projIncome,
    projHpp,
    projProfit: projIncome - projHpp,
  };
}

// ── posisi keuangan perusahaan (akrual) ───────────────────────

export type FinancialPosition = {
  // aset
  cash: number; // kas & bank
  arPeserta: number; // piutang peserta (trip sudah berangkat)
  wipCost: number; // biaya trip ditangguhkan (trip belum berangkat)
  totalAssets: number;

  // kewajiban
  hutangVendor: number; // hutang ke vendor
  deferredRevenue: number; // titipan peserta (trip belum berangkat)
  totalLiabilities: number;

  // ekuitas (dihitung independen)
  modal: number; // modal disetor (saldo awal + setoran − prive)
  labaDitahan: number; // akumulasi laba bersih
  equity: number;

  // turunan
  uangBebas: number; // kas − hutang vendor − titipan peserta
  balanced: boolean; // aset == kewajiban + ekuitas ?
};

/**
 * Rakit posisi keuangan dari komponen yang sudah dihitung data.ts.
 * labaDitahan diberikan terpisah (hasil akumulasi P&L) supaya ekuitas
 * benar-benar independen — kalau Neraca tidak seimbang, itu sinyal bug.
 */
export function buildPosition(input: {
  cash: number;
  arPeserta: number;
  wipCost: number;
  hutangVendor: number;
  deferredRevenue: number;
  modal: number;
  labaDitahan: number;
}): FinancialPosition {
  const totalAssets = input.cash + input.arPeserta + input.wipCost;
  const totalLiabilities = input.hutangVendor + input.deferredRevenue;
  const equity = input.modal + input.labaDitahan;
  return {
    cash: input.cash,
    arPeserta: input.arPeserta,
    wipCost: input.wipCost,
    totalAssets,
    hutangVendor: input.hutangVendor,
    deferredRevenue: input.deferredRevenue,
    totalLiabilities,
    modal: input.modal,
    labaDitahan: input.labaDitahan,
    equity,
    uangBebas: input.cash - input.hutangVendor - input.deferredRevenue,
    balanced: Math.round(totalAssets) === Math.round(totalLiabilities + equity),
  };
}

/** % perubahan a vs b, aman untuk pembagi 0. */
export function growth(current: number, prev: number): number {
  if (prev === 0) return current === 0 ? 0 : 100;
  return ((current - prev) / Math.abs(prev)) * 100;
}
