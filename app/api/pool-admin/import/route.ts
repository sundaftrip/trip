import { NextRequest } from "next/server";
import { badRequest, poolMutation, readJsonObject } from "@/lib/pool/admin-guard";
import { importKzSignups } from "@/lib/pool/store";

export const maxDuration = 60;

// POST CMS: impor pendaftar lama dari tab "Pendaftar" Google Sheet Pool Kazakhstan.
// dryRun = hanya periksa, belum menyimpan.
export async function POST(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body || typeof body.text !== "string" || typeof body.destinationId !== "string") return badRequest();
  if (body.text.length > 400_000) return badRequest();
  const dryRun = body.dryRun !== false;
  const { destinationId, text } = body;
  return poolMutation(
    "CREATE",
    () => importKzSignups(destinationId as string, text as string, dryRun),
    (s) => ({ name: "Impor pendaftar pool", detail: `${dryRun ? "Periksa" : "Simpan"}: ${s.created} baru, ${s.updated} diperbarui, ${s.unchanged} sudah ada, ${s.skipped.length} dilewati` }),
  );
}
