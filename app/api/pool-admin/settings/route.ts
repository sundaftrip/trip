import { NextRequest } from "next/server";
import { badRequest, poolMutation, readJsonObject } from "@/lib/pool/admin-guard";
import { setPoolOpen, setupDefaultDestinations } from "@/lib/pool/store";

// PUT CMS: buka atau tutup semua pendaftaran pool.
export async function PUT(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body || typeof body.open !== "boolean") return badRequest();
  const open = body.open;
  return poolMutation(
    "UPDATE",
    async () => { await setPoolOpen(open); return { ok: true as const, value: { open } }; },
    () => ({ name: "Pendaftaran pool", detail: open ? "Dibuka" : "Ditutup" }),
  );
}

// POST CMS: buat negara awal (Kazakhstan, Kirgistan, Rusia) yang belum ada.
export async function POST() {
  return poolMutation(
    "CREATE",
    async () => ({ ok: true as const, value: { created: await setupDefaultDestinations() } }),
    (v) => ({ name: "Negara awal pool", detail: v.created.length ? `Dibuat: ${v.created.join(", ")}` : "Semua sudah ada" }),
  );
}
