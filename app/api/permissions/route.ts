import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUsersWithPermissions } from "@/lib/permissions";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await getUsersWithPermissions();
  return NextResponse.json(users);
}
