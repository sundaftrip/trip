import { NextRequest } from "next/server";
import { badRequest, poolMutation, readJsonObject } from "@/lib/pool/admin-guard";
import { createSignupByAdmin } from "@/lib/pool/store";

// POST CMS: admin menambahkan pendaftar sendiri (mis. dari chat WhatsApp).
export async function POST(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body) return badRequest();
  return poolMutation("CREATE", () => createSignupByAdmin(body), (s) => ({ name: s.name, detail: `Pendaftar pool ditambahkan admin (${s.kode})` }));
}
