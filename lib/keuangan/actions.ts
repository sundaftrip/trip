"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isTokenActive } from "@/lib/keuangan/calc";

export type ActionState = { ok: boolean; error?: string };

async function guard() {
  const session = await auth();
  if (!session?.user) throw new Error("Sesi tidak valid — silakan login ulang.");
  return session.user;
}

function revalidate() {
  revalidatePath("/admin/keuangan", "layout");
}

/** Bungkus logika mutasi: tangkap error jadi ActionState, bukan crash. */
async function run(fn: () => Promise<void>): Promise<ActionState> {
  try {
    await fn();
    revalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

function n(fd: FormData, key: string): number {
  const raw = String(fd.get(key) ?? "").replace(/[^\d.-]/g, "");
  const v = parseFloat(raw);
  return Number.isFinite(v) ? v : 0;
}
function s(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}
function opt(fd: FormData, key: string): string | null {
  const v = s(fd, key);
  return v.length ? v : null;
}

// ── Bank / Kas ────────────────────────────────────────────────

export async function createBankAccount(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  return run(async () => {
    await guard();
    const name = s(fd, "name");
    if (!name) throw new Error("Nama rekening wajib diisi.");
    await prisma.bankAccount.create({
      data: {
        name,
        kind: (s(fd, "kind") || "BANK") as never,
        accountNo: opt(fd, "accountNo"),
        openingBalance: n(fd, "openingBalance"),
        note: opt(fd, "note"),
      },
    });
  });
}

export async function toggleBankArchive(fd: FormData): Promise<void> {
  await guard();
  const id = s(fd, "id");
  const bank = await prisma.bankAccount.findUnique({ where: { id } });
  if (!bank) return;
  await prisma.bankAccount.update({
    where: { id },
    data: { archived: !bank.archived },
  });
  revalidate();
}

// ── Jurnal / entry manual ─────────────────────────────────────

export async function createLedgerEntry(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  return run(async () => {
    const user = await guard();
    const amount = n(fd, "amount");
    if (amount <= 0) throw new Error("Nominal harus lebih dari 0.");
    const category = s(fd, "category");
    if (!category) throw new Error("Kategori wajib diisi.");
    const dateStr = s(fd, "date");

    // Setoran modal selalu uang masuk; penarikan pemilik selalu uang keluar.
    const source = s(fd, "source") || "MANUAL";
    let direction = s(fd, "direction") || "OUT";
    if (source === "CAPITAL") direction = "IN";
    if (source === "PRIVE") direction = "OUT";
    if (source === "ADVANCE") direction = "OUT";

    await prisma.ledgerEntry.create({
      data: {
        date: dateStr ? new Date(dateStr) : new Date(),
        direction: direction as never,
        amount,
        category,
        description: opt(fd, "description"),
        source: source as never,
        bankAccountId: opt(fd, "bankAccountId"),
        tourId: opt(fd, "tourId"),
        createdById: user.id,
      },
    });
  });
}

/**
 * Membatalkan baris jurnal (VOID) — bukan menghapus. Baris tetap
 * tersimpan untuk jejak audit, hanya ditandai tidak berlaku dan
 * tidak ikut perhitungan. Kalau baris ini pelunasan vendor, hutang
 * tagihannya dikembalikan.
 */
export async function voidLedgerEntry(fd: FormData): Promise<void> {
  await guard();
  const id = s(fd, "id");
  const entry = await prisma.ledgerEntry.findUnique({ where: { id } });
  if (!entry || entry.voided) return;
  if (entry.vendorBillId) {
    const bill = await prisma.vendorBill.findUnique({ where: { id: entry.vendorBillId } });
    if (bill) {
      const newPaid = Math.max(0, bill.amountPaid - entry.amount);
      await prisma.vendorBill.update({
        where: { id: bill.id },
        data: {
          amountPaid: newPaid,
          status: newPaid <= 0 ? "UNPAID" : newPaid >= bill.amount ? "PAID" : "PARTIAL",
        },
      });
    }
  }
  await prisma.ledgerEntry.update({
    where: { id },
    data: { voided: true, voidedAt: new Date() },
  });
  revalidate();
}

/**
 * Membatalkan tagihan vendor (VOID). Hanya boleh kalau belum ada
 * pembayaran sama sekali — kalau sudah dibayar, void dulu jurnal
 * pembayarannya. Tagihan tetap tersimpan, hanya ditandai batal.
 */
export async function voidVendorBill(fd: FormData): Promise<void> {
  await guard();
  const id = s(fd, "id");
  const bill = await prisma.vendorBill.findUnique({ where: { id } });
  if (!bill || bill.voided) return;
  if (bill.amountPaid > 0)
    throw new Error("Tagihan sudah ada pembayaran — batalkan jurnal pembayarannya dulu.");
  await prisma.vendorBill.update({
    where: { id },
    data: { voided: true, voidedAt: new Date() },
  });
  revalidate();
}

// ── Vendor & tagihan ──────────────────────────────────────────

export async function createVendor(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  return run(async () => {
    await guard();
    const name = s(fd, "name");
    if (!name) throw new Error("Nama vendor wajib diisi.");
    await prisma.vendor.create({
      data: {
        name,
        category: (s(fd, "category") || "OTHER") as never,
        contact: opt(fd, "contact"),
        note: opt(fd, "note"),
      },
    });
  });
}

export async function createVendorBill(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  return run(async () => {
    await guard();
    const vendorId = s(fd, "vendorId");
    if (!vendorId) throw new Error("Vendor wajib dipilih.");
    const description = s(fd, "description");
    if (!description) throw new Error("Keterangan tagihan wajib diisi.");

    // Nominal di-input dalam mata uang yang dipilih; disimpan sebagai IDR.
    const currency = s(fd, "currency") || "IDR";
    const fxRate = currency === "IDR" ? 1 : n(fd, "fxRate");
    const nominal = n(fd, "amount");
    if (nominal <= 0) throw new Error("Nominal tagihan harus lebih dari 0.");
    if (currency !== "IDR" && fxRate <= 0)
      throw new Error("Kurs ke IDR harus lebih dari 0.");
    const amount = currency === "IDR" ? nominal : nominal * fxRate;

    const dueStr = s(fd, "dueDate");
    await prisma.vendorBill.create({
      data: {
        vendorId,
        tourId: opt(fd, "tourId"),
        description,
        amount,
        currency,
        fxRate,
        isDeposit: s(fd, "isDeposit") === "on" || s(fd, "isDeposit") === "true",
        dueDate: dueStr ? new Date(dueStr) : null,
      },
    });
  });
}

export async function payVendorBill(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  return run(async () => {
    const user = await guard();
    const billId = s(fd, "billId");
    const bill = await prisma.vendorBill.findUnique({
      where: { id: billId },
      include: { vendor: true },
    });
    if (!bill) throw new Error("Tagihan tidak ditemukan.");
    const amount = n(fd, "amount");
    if (amount <= 0) throw new Error("Nominal bayar harus lebih dari 0.");
    const newPaid = Math.min(bill.amount, bill.amountPaid + amount);
    const dateStr = s(fd, "date");

    await prisma.$transaction([
      prisma.ledgerEntry.create({
        data: {
          date: dateStr ? new Date(dateStr) : new Date(),
          direction: "OUT",
          amount,
          category: bill.isDeposit ? "Deposit Vendor" : "Bayar Vendor",
          description: `${bill.vendor.name} — ${bill.description}`,
          source: bill.isDeposit ? "DEPOSIT" : "VENDOR_PAYMENT",
          bankAccountId: opt(fd, "bankAccountId"),
          tourId: bill.tourId,
          vendorBillId: bill.id,
          createdById: user.id,
        },
      }),
      prisma.vendorBill.update({
        where: { id: bill.id },
        data: {
          amountPaid: newPaid,
          status: newPaid >= bill.amount ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID",
        },
      }),
    ]);
  });
}

// ── Proyeksi finance per trip ─────────────────────────────────

export async function upsertTripFinance(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  return run(async () => {
    await guard();
    const tourId = s(fd, "tourId");
    if (!tourId) throw new Error("Trip wajib dipilih.");
    const data = {
      sellingPrice: n(fd, "sellingPrice"),
      targetPax: Math.round(n(fd, "targetPax")),
      projHpp: n(fd, "projHpp"),
      status: (s(fd, "status") || "DRAFT") as never,
      note: opt(fd, "note"),
    };
    await prisma.tripFinance.upsert({
      where: { tourId },
      create: { tourId, ...data },
      update: data,
    });
  });
}

// ── Pengeluaran Lapangan (field expense) ──────────────────────

/** Buat / regenerasi token link pelaporan pengeluaran TL untuk satu trip. */
export async function generateExpenseToken(fd: FormData): Promise<void> {
  await guard();
  const tourId = s(fd, "tourId");
  if (!tourId) return;
  const token = randomBytes(9).toString("base64url");
  await prisma.tour.update({ where: { id: tourId }, data: { expenseToken: token } });
  revalidate();
}

/** Cabut link pelaporan TL (token dihapus, link lama mati). */
export async function revokeExpenseToken(fd: FormData): Promise<void> {
  await guard();
  const tourId = s(fd, "tourId");
  if (!tourId) return;
  await prisma.tour.update({ where: { id: tourId }, data: { expenseToken: null } });
  revalidate();
}

export async function approveFieldExpense(fd: FormData): Promise<void> {
  await guard();
  const id = s(fd, "id");
  const fe = await prisma.fieldExpense.findUnique({ where: { id } });
  if (!fe || fe.status !== "PENDING") return;
  await prisma.fieldExpense.update({
    where: { id },
    data: { status: "APPROVED", reviewedAt: new Date() },
  });
  revalidate();
}

export async function rejectFieldExpense(fd: FormData): Promise<void> {
  await guard();
  const id = s(fd, "id");
  const fe = await prisma.fieldExpense.findUnique({ where: { id } });
  if (!fe || fe.status !== "PENDING") return;
  await prisma.fieldExpense.update({
    where: { id },
    data: { status: "REJECTED", reviewedAt: new Date(), reviewNote: opt(fd, "reviewNote") },
  });
  revalidate();
}

/**
 * PUBLIK — diajukan TL lewat link bertoken. TIDAK pakai guard():
 * autentikasinya adalah token trip yang valid. Hanya bisa membuat
 * pengeluaran berstatus PENDING; tidak bisa baca data keuangan.
 */
export async function submitFieldExpense(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  return run(async () => {
    const token = s(fd, "token");
    if (!token) throw new Error("Link tidak valid.");
    const tour = await prisma.tour.findUnique({ where: { expenseToken: token } });
    if (!tour) throw new Error("Link tidak valid atau sudah dicabut.");
    if (!isTokenActive(tour.tripDate))
      throw new Error("Link sudah kedaluwarsa — minta link baru ke kantor.");

    const amount = n(fd, "amount");
    if (amount <= 0) throw new Error("Nominal harus lebih dari 0.");
    const category = s(fd, "category");
    if (!category) throw new Error("Kategori wajib dipilih.");
    const photoUrl = s(fd, "photoUrl");
    if (!photoUrl) throw new Error("Foto bukti wajib diunggah.");
    const submittedBy = s(fd, "submittedBy");
    if (!submittedBy) throw new Error("Nama TL wajib diisi.");
    const dateStr = s(fd, "date");

    await prisma.fieldExpense.create({
      data: {
        tourId: tour.id,
        date: dateStr ? new Date(dateStr) : new Date(),
        category,
        amount,
        photoUrl,
        note: opt(fd, "note"),
        submittedBy,
        status: "PENDING",
      },
    });
    revalidatePath(`/lapor/${token}`);
    revalidate();
  });
}

// ── Reset Data Keuangan (zona berbahaya) ──────────────────────

/**
 * Mengosongkan SELURUH data modul keuangan ke 0. Destruktif.
 * Pengaman: hanya SUPERADMIN + harus tahu password reset
 * (env KEUANGAN_RESET_SECRET). Tour & Receipt TIDAK disentuh.
 */
export async function resetKeuangan(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  return run(async () => {
    const user = await guard();
    if (user.role !== "SUPERADMIN")
      throw new Error("Hanya Super Admin yang boleh mereset data keuangan.");

    const secret = process.env.KEUANGAN_RESET_SECRET;
    if (!secret)
      throw new Error(
        "Fitur reset belum diaktifkan — set KEUANGAN_RESET_SECRET di environment.",
      );
    if (s(fd, "password") !== secret)
      throw new Error("Password reset salah.");

    // urutan penting demi foreign key
    await prisma.$transaction([
      prisma.fieldExpense.deleteMany({}),
      prisma.ledgerEntry.deleteMany({}),
      prisma.vendorBill.deleteMany({}),
      prisma.tripFinance.deleteMany({}),
      prisma.vendor.deleteMany({}),
      prisma.bankAccount.deleteMany({}),
      prisma.tour.updateMany({
        where: { expenseToken: { not: null } },
        data: { expenseToken: null },
      }),
    ]);
    revalidate();
  });
}
