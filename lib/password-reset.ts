"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { emailConfigured, sendPasswordResetEmail } from "@/lib/email";
import { hashResetToken } from "@/lib/reset-token";

export type ResetState = { ok: boolean; error?: string; message?: string };

/** Permintaan reset: kirim link ke email user kalau terdaftar. */
export async function requestPasswordReset(
  _prev: ResetState,
  fd: FormData,
): Promise<ResetState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!email) return { ok: false, error: "Email wajib diisi." };

  if (!(await emailConfigured()))
    return {
      ok: false,
      error: "Pengiriman email belum dikonfigurasi. Hubungi developer.",
    };

  // Jawaban selalu sama — tidak membocorkan apakah email terdaftar.
  const generic: ResetState = {
    ok: true,
    message:
      "Jika email terdaftar, link reset password sudah dikirim. Cek inbox dan folder spam.",
  };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return generic;

  // satu token aktif per user
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  const raw = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashResetToken(raw),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 jam
    },
  });

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const link = `${proto}://${host}/admin/reset-password/${raw}`;

  try {
    await sendPasswordResetEmail({ to: user.email, name: user.name, link });
  } catch (e) {
    console.error("Gagal kirim email reset:", e);
    return {
      ok: false,
      error: "Gagal mengirim email. Coba lagi sebentar atau hubungi developer.",
    };
  }
  return generic;
}

/** Set password baru memakai token dari link email. */
export async function doPasswordReset(
  _prev: ResetState,
  fd: FormData,
): Promise<ResetState> {
  const token = String(fd.get("token") ?? "");
  const pw = String(fd.get("password") ?? "");
  const pw2 = String(fd.get("confirm") ?? "");

  if (pw.length < 8) return { ok: false, error: "Password minimal 8 karakter." };
  if (pw !== pw2) return { ok: false, error: "Konfirmasi password tidak sama." };

  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
  });
  if (!row || row.usedAt || row.expiresAt < new Date())
    return { ok: false, error: "Link reset tidak valid atau sudah kedaluwarsa." };

  const hashed = await bcrypt.hash(pw, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { password: hashed } }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return {
    ok: true,
    message: "Password berhasil diganti. Silakan login dengan password baru.",
  };
}
