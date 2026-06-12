import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { apiError } from "@/lib/api-error";

// Nilai sah enum Role di prisma/schema.prisma
const VALID_ROLES = ["SUPERADMIN", "ADMIN", "EDITOR"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  let body: { name?: unknown; email?: unknown; role?: unknown; password?: unknown };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const { name, email, role, password } = body;

  // Validasi per-field (update parsial — hanya field yang dikirim yang dicek)
  const data: Record<string, unknown> = {};
  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim())
      return NextResponse.json({ error: "Nama wajib diisi." }, { status: 422 });
    data.name = name.trim();
  }
  if (email !== undefined) {
    if (typeof email !== "string" || !EMAIL_RE.test(email.trim()))
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 422 });
    data.email = email.trim();
  }
  if (role !== undefined) {
    if (typeof role !== "string" || !VALID_ROLES.includes(role as (typeof VALID_ROLES)[number]))
      return NextResponse.json({ error: "Role tidak valid." }, { status: 422 });
    data.role = role;
  }
  if (password) {
    if (typeof password !== "string" || password.length < 8)
      return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 422 });
    data.password = await bcrypt.hash(password, 12);
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true },
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
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
