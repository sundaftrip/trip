import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { apiError } from "@/lib/api-error";

// Nilai sah enum Role di prisma/schema.prisma
const VALID_ROLES = ["SUPERADMIN", "ADMIN", "EDITOR"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { name?: unknown; email?: unknown; password?: unknown; role?: unknown };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const { name, email, password, role } = body;

  // Validasi input sebelum menyentuh DB
  if (typeof name !== "string" || !name.trim())
    return NextResponse.json({ error: "Nama wajib diisi." }, { status: 422 });
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim()))
    return NextResponse.json({ error: "Format email tidak valid." }, { status: 422 });
  if (typeof password !== "string" || password.length < 8)
    return NextResponse.json({ error: "Password wajib diisi, minimal 8 karakter." }, { status: 422 });
  if (typeof role !== "string" || !VALID_ROLES.includes(role as (typeof VALID_ROLES)[number]))
    return NextResponse.json({ error: "Role tidak valid." }, { status: 422 });

  try {
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.trim(), password: hashed, role: role as "SUPERADMIN" | "ADMIN" | "EDITOR" },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    return apiError(err, { duplicate: "Email sudah terdaftar." });
  }
}
