import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { apiError } from "@/lib/api-error";
import { logActivity } from "@/lib/activityLog";
import { accessToUserFields, isUserAccessOption, normalizeEmail } from "@/lib/user-access";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  let body: { name?: unknown; email?: unknown; role?: unknown; access?: unknown; password?: unknown };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const { name, email, password } = body;
  const access = body.access ?? body.role;

  // Validasi per-field (update parsial — hanya field yang dikirim yang dicek)
  const data: Prisma.UserUpdateInput = {};
  const changes: string[] = [];
  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim())
      return NextResponse.json({ error: "Nama wajib diisi." }, { status: 422 });
    data.name = name.trim();
  }
  if (email !== undefined) {
    if (typeof email !== "string" || !EMAIL_RE.test(email.trim()))
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 422 });
    data.email = normalizeEmail(email);
  }
  if (access !== undefined) {
    if (!isUserAccessOption(access))
      return NextResponse.json({ error: "Jenis akses tidak valid." }, { status: 422 });
    const fields = accessToUserFields(access);
    if (id === session.user.id && fields.role !== "SUPERADMIN")
      return NextResponse.json({ error: "Tidak bisa menurunkan akses akun sendiri." }, { status: 400 });
    // Ganti jenis akses = mulai dari izin bawaan jenis itu (izin kustom lama dihapus).
    data.role = fields.role;
    data.permissions = fields.permissions;
    changes.push(`akses: ${access}`);
  }
  if (password) {
    if (typeof password !== "string" || password.length < 8)
      return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 422 });
    data.password = await bcrypt.hash(password, 12);
    changes.push("password");
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });
    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "UPDATE", resource: "USER",
      resourceId: user.id, resourceName: user.name, detail: changes.length ? `Ubah ${changes.join(", ")}` : undefined,
    });
    return NextResponse.json(user);
  } catch (err) {
    return apiError(err, { duplicate: "Email sudah terdaftar." });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (session.user.id === id)
    return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 });

  try {
    const user = await prisma.user.delete({ where: { id }, select: { name: true } });
    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "DELETE", resource: "USER",
      resourceId: id, resourceName: user.name,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
