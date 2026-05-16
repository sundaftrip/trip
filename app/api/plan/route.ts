import { NextResponse } from "next/server";
import { getPlan } from "@/lib/license";
import { PLAN_FEATURES } from "@/lib/plan";

/**
 * Mengekspos plan teresolusi untuk client component (mis. halaman admin
 * Pengaturan), karena getPlan() bersifat server-only.
 *
 * GET /api/plan → { plan, features }
 */
export async function GET() {
  const plan = await getPlan();
  return NextResponse.json(
    { plan, features: PLAN_FEATURES },
    { headers: { "Cache-Control": "no-store" } }
  );
}
