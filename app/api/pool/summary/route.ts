import { summaryPayload } from "@/lib/pool/core";
import { POOL_PUBLIC_CACHE, poolRead } from "@/lib/pool/http";
import { loadBundles, publicContext } from "@/lib/pool/store";

// Ringkasan untuk tab "Gabung tanggal" di beranda: negara yang dibuka dan jumlah
// orang per tanggal. Hanya angka, tanpa data pribadi.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  return poolRead(async () => {
    const ctx = await publicContext();
    const bundles = await loadBundles(ctx.today, { status: { in: ["buka", "segera"] } });
    return summaryPayload(bundles, ctx);
  }, POOL_PUBLIC_CACHE);
}
