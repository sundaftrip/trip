import { NextRequest } from "next/server";
import { badRequest, poolMutation, readJsonObject } from "@/lib/pool/admin-guard";
import { deleteDestination, saveDestination } from "@/lib/pool/store";

type Ctx = { params: Promise<{ id: string }> };

// PUT CMS: simpan negara, paket, dan harga.
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await readJsonObject(req);
  if (!body) return badRequest();
  return poolMutation("UPDATE", () => saveDestination(id, body), (dest) => ({ name: dest.name, id: dest.id, detail: `Negara pool disimpan (${dest.status})` }));
}

// DELETE CMS: hapus negara yang belum punya pendaftar.
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return poolMutation("DELETE", () => deleteDestination(id), (dest) => ({ name: dest.name, id, detail: "Negara pool dihapus" }));
}
