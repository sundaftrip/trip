import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import type { Plan } from "./plan";

/**
 * Resolusi plan deployment ini dari panel MASTER.  SERVER-ONLY.
 *
 * Alur:
 *  - Fetch GET {MASTER_API_URL}/api/license dengan header x-master-key.
 *  - Hasil di-cache 5 menit (tag "license") + disimpan ke DB sebagai
 *    last-known-good.
 *  - Kalau MASTER tak terjangkau → pakai last-known-good dari DB.
 *  - Kalau belum pernah berhasil sama sekali → kunci ke "basic".
 *
 * Update instan: MASTER memanggil /api/master/revalidate-license yang
 * menjalankan revalidateTag("license") → fetch berikutnya langsung segar.
 */

const CACHE_ROW_KEY = "_license_cached_plan";

async function fetchPlan(): Promise<Plan> {
  const url = process.env.MASTER_API_URL?.replace(/\/$/, "");
  const key = process.env.MASTER_API_KEY;

  // Deployment tidak dikelola MASTER (dev lokal / instance mandiri):
  // pakai NEXT_PUBLIC_PLAN sebagai fallback.
  if (!url || !key) {
    return process.env.NEXT_PUBLIC_PLAN === "pro" ? "pro" : "basic";
  }

  try {
    const res = await fetch(`${url}/api/license`, {
      headers: { "x-master-key": key },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as { plan?: string; status?: string };
    const plan: Plan =
      data.status === "active" && data.plan === "pro" ? "pro" : "basic";

    // Simpan last-known-good ke DB.
    await prisma.companyInfo
      .upsert({
        where: { key: CACHE_ROW_KEY },
        update: { value: plan },
        create: { key: CACHE_ROW_KEY, value: plan },
      })
      .catch(() => {});

    return plan;
  } catch {
    // MASTER tak terjangkau → pakai last-known-good. Belum pernah berhasil → basic.
    const row = await prisma.companyInfo
      .findUnique({ where: { key: CACHE_ROW_KEY } })
      .catch(() => null);
    return row?.value === "pro" ? "pro" : "basic";
  }
}

/** Plan teresolusi, di-cache 5 menit. Di-revalidate instan oleh webhook MASTER. */
const resolvePlan = unstable_cache(fetchPlan, ["license-plan"], {
  revalidate: 300,
  tags: ["license"],
});

/** Ambil plan deployment ini. SERVER-ONLY (dipakai API route & server component). */
export async function getPlan(): Promise<Plan> {
  const p = await resolvePlan();
  return p === "pro" ? "pro" : "basic";
}
