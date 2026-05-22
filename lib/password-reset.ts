"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { hashResetToken } from "@/lib/reset-token";

export type ResetState = {
  ok: boolean;
  error?: string;
  message?: string;
  /** Link reset password. Ditampilkan di layar supaya tidak tergantung email. */
  link?: string;
};

/** Permintaan reset: tampilkan link langsung di layar, kirim email best-effort. */
export async function requestPasswordReset(
  _prev: ResetState,
  fd: FormData,
): Promise<ResetState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!email) return { ok: false, error: "Email wajib diisi." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return {
      ok: true,
      message:
        "Kalau email ini terdaftar, link reset password akan muncul di sini.",
    };
  }

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

  // Email best-effort — kalau gagal/tidak terkonfigurasi, link tetap muncul di layar.
  try {
    await sendPasswordResetEmail({ to: user.email, name: user.name, link });
  } catch (e) {
    console.warn("Email reset gagal terkirim (link tetap aktif di layar):", e);
  }

  return {
    ok: true,
    message:
      "Link reset password berhasil dibuat. Klik link di bawah untuk membuat password baru. Berlaku 1 jam.",
    link,
  };
}

/** Set password baru memakai token dari link. */
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
