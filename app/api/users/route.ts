import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { apiError } from "@/lib/api-error";
import { logActivity } from "@/lib/activityLog";
import { accessToUserFields, isUserAccessOption, normalizeEmail, userAccessOf } from "@/lib/user-access";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, permissions: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users.map(({ permissions, ...user }) => ({
    ...user,
    access: userAccessOf(user.role, permissions),
  })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { name?: unknown; email?: unknown; password?: unknown; role?: unknown; access?: unknown };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const { name, email, password } = body;
  const access = body.access ?? body.role;

  // Validasi input sebelum menyentuh DB
  if (typeof name !== "string" || !name.trim())
    return NextResponse.json({ error: "Nama wajib diisi." }, { status: 422 });
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim()))
    return NextResponse.json({ error: "Format email tidak valid." }, { status: 422 });
  if (typeof password !== "string" || password.length < 8)
    return NextResponse.json({ error: "Password wajib diisi, minimal 8 karakter." }, { status: 422 });
  if (!isUserAccessOption(access))
    return NextResponse.json({ error: "Jenis akses tidak valid." }, { status: 422 });

  const { role, permissions } = accessToUserFields(access);
  try {
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizeEmail(email),
        password: hashed,
        role,
        permissions,
      },
      select: { id: true, name: true, email: true, role: true },
    });
    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "CREATE", resource: "USER",
      resourceId: user.id, resourceName: user.name, detail: `Akses: ${access}`,
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    return apiError(err, { duplicate: "Email sudah terdaftar." });
  }
}
