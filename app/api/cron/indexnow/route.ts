import { NextRequest, NextResponse } from "next/server";
import { isIndexNowCronAuthorized, isIndexNowProduction } from "@/lib/indexnow";
import { drainIndexNowQueue, reconcileIndexNowChanges } from "@/lib/indexnow-server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isIndexNowCronAuthorized(req.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isIndexNowProduction()) return NextResponse.json({ state: "disabled", submitted: 0 });
  try {
    // Drain first to expire old rows and free capacity before reconciliation.
    const delivery = await drainIndexNowQueue();
    const reconciliation = await reconcileIndexNowChanges();
    const reconciledDelivery = await drainIndexNowQueue();
    return NextResponse.json({ delivery, reconciliation, reconciledDelivery }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.warn("IndexNow cron failed; queued URLs and reconciliation cursor retained.");
    return NextResponse.json({ error: "IndexNow delivery unavailable; retry required" }, { status: 503 });
  }
}
