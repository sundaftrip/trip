import "server-only";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";

export async function requireB2bCatalogAdmin() {
  const session = await auth();
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!await checkPermission(session, "b2b_catalog_edit")) {
    return {
      session: null,
      response: NextResponse.json({ error: "Tidak memiliki izin mengelola katalog B2B" }, { status: 403 }),
    };
  }

  return { session, response: null };
}
