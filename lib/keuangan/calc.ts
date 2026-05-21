// ─────────────────────────────────────────────────────────────
//  Inti perhitungan akuntansi real-time perusahaan travel.
//  Semua fungsi di sini PURE — tidak menyentuh DB. data.ts yang
//  mengambil baris dari Prisma lalu memanggil fungsi-fungsi ini.
//
//  Validasi rumus (cocok dgn angka referensi TEONE):
//    netEquity = realUangPerusahaan + piutangPeserta
//    realUangPerusahaan = saldoBankKas − hutangVendor
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
  isDeposit: boolean;
};

export type LedgerLite = {
  direction: "IN" | "OUT";
  amount: number;
  source: string;
};

export type FinanceLite = {
  sellingPrice: number;
  targetPax: number;
  projHpp: number;
  status: string; // "DRAFT" | "CONFIRMED"
} | null;

/** Receipt dianggap sudah jadi uang masuk kalau lunas atau ada DP. */
export function receiptIsCashIn(status: string): boolean {
  return status === "PAID" || status === "DP";
}

/** Tanggal efektif sebuah receipt untuk grouping bulanan. */
export function receiptDate(r: ReceiptLite): Date {
  return r.paymentDate ?? r.createdAt;
}

// ── Agregat per trip ──────────────────────────────────────────

export type TripAgg = {
  pesertaCashIn: number; // uang masuk dari peserta (lunas + DP)
  pesertaPiutang: number; // peserta yang belum bayar
  pax: number; // jumlah pax terkonfirmasi
  ledgerIn: number; // pemasukan manual yang ditag ke trip
  ledgerOut: number; // pengeluaran (bayar vendor + ops) ditag ke trip
  realCashIn: number;
  realCashOut: number;
  realProfit: number;
  hppTotal: number; // total tagihan vendor
  hppLunas: number; // tagihan vendor yang sudah dibayar
  hppHutang: number; // tagihan vendor yang belum dibayar
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

  let ledgerIn = 0;
  let ledgerOut = 0;
  for (const l of ledger) {
    if (l.direction === "IN") ledgerIn += l.amount;
    else ledgerOut += l.amount;
  }

  let hppTotal = 0;
  let hppLunas = 0;
  for (const b of bills) {
    hppTotal += b.amount;
    hppLunas += b.amountPaid;
  }
  const hppHutang = hppTotal - hppLunas;

  const realCashIn = pesertaCashIn + ledgerIn;
  const realCashOut = ledgerOut;

  const hasProjection = !!finance && finance.status === "CONFIRMED";
  const projIncome = finance ? finance.sellingPrice * finance.targetPax : 0;
  const projHpp = finance ? finance.projHpp : 0;

  return {
    pesertaCashIn,
    pesertaPiutang,
    pax,
    ledgerIn,
    ledgerOut,
    realCashIn,
    realCashOut,
    realProfit: realCashIn - realCashOut,
    hppTotal,
    hppLunas,
    hppHutang,
    hasProjection,
    projIncome,
    projHpp,
    projProfit: projIncome - projHpp,
  };
}

// ── Klasifikasi uang per trip (Posisi Kas) ────────────────────
//
//  cashOnHand = uang trip yang masih nyangkut di bank
//             = uang masuk peserta − HPP yang sudah dibayar.
//  titipan    = bagian cashOnHand yang masih wajib disetor ke vendor.
//  marginLocked = sisanya, HANYA kalau proyeksi HPP sudah dikunci
//               (kalau dikunci, margin perusahaan sudah pasti).
//  mengendap  = sisanya kalau proyeksi BELUM dikunci — statusnya
//               belum jelas milik siapa sampai Finance set HPP.

export type CashClass = {
  cashOnHand: number;
  titipan: number;
  mengendap: number;
  marginLocked: number;
};

export function classifyCash(agg: TripAgg): CashClass {
  const cashOnHand = agg.pesertaCashIn - agg.hppLunas;
  const titipan = clamp(cashOnHand, 0, agg.hppHutang);
  const leftover = cashOnHand - titipan;
  return {
    cashOnHand,
    titipan,
    // mengendap = cicilan peserta yang nganggur — tidak pernah negatif.
    // Kalau leftover negatif (vendor dibayar duluan sebelum peserta bayar),
    // defisitnya tercermin di saldo perusahaan, bukan di sini.
    mengendap: agg.hasProjection ? 0 : Math.max(0, leftover),
    // marginLocked boleh negatif: itu sinyal rugi nyata pada trip
    // yang proyeksinya sudah dikunci.
    marginLocked: agg.hasProjection ? leftover : 0,
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// ── Total perusahaan ──────────────────────────────────────────

export type CompanyTotals = {
  openingBalance: number;
  totalCashIn: number; // peserta + ledger IN
  totalCashOut: number; // ledger OUT
  saldoBankKas: number;
  piutangPeserta: number;
  hutangVendor: number;
  realUangPerusahaan: number; // saldoBankKas − hutangVendor
  netEquity: number; // realUangPerusahaan + piutangPeserta
};

export function companyTotals(input: {
  openingBalance: number;
  pesertaCashIn: number;
  ledgerIn: number;
  ledgerOut: number;
  piutangPeserta: number;
  hutangVendor: number;
}): CompanyTotals {
  const totalCashIn = input.pesertaCashIn + input.ledgerIn;
  const totalCashOut = input.ledgerOut;
  const saldoBankKas = input.openingBalance + totalCashIn - totalCashOut;
  const realUangPerusahaan = saldoBankKas - input.hutangVendor;
  return {
    openingBalance: input.openingBalance,
    totalCashIn,
    totalCashOut,
    saldoBankKas,
    piutangPeserta: input.piutangPeserta,
    hutangVendor: input.hutangVendor,
    realUangPerusahaan,
    netEquity: realUangPerusahaan + input.piutangPeserta,
  };
}

/** % perubahan a vs b, aman untuk pembagi 0. */
export function growth(current: number, prev: number): number {
  if (prev === 0) return current === 0 ? 0 : 100;
  return ((current - prev) / Math.abs(prev)) * 100;
}
