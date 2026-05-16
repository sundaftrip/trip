import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * Webhook yang dipanggil panel MASTER ketika plan/status deployment ini
 * berubah. Menjalankan revalidateTag("license") sehingga resolusi plan
 * berikutnya langsung mengambil data segar — perubahan terlihat seketika
 * tanpa redeploy.
 *
 * Otentikasi: header x-master-key harus cocok dengan MASTER_API_KEY.
 *
 * POST /api/master/revalidate-license   (header: x-master-key: <key>)
 */
export async function POST(req: NextRequest) {
  const key = req.headers.get("x-master-key");
  if (!process.env.MASTER_API_KEY || key !== process.env.MASTER_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  (revalidateTag as unknown as (t: string) => void)("license");
  return NextResponse.json({ success: true, revalidated: true });
}
