import { NextRequest } from "next/server";
import { badRequest, poolMutation, readJsonObject } from "@/lib/pool/admin-guard";
import { savePoolDate } from "@/lib/pool/store";

// PUT CMS: kuota khusus dan link grup WhatsApp untuk satu tanggal.
export async function PUT(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body) return badRequest();
  return poolMutation("UPDATE", () => savePoolDate(body), (d) => ({ name: d.label, detail: "Kuota / link grup tanggal diubah" }));
}
