import { NextRequest } from "next/server";
import { badRequest, poolMutation, readJsonObject } from "@/lib/pool/admin-guard";
import { deleteSignup, updateSignup } from "@/lib/pool/store";

type Ctx = { params: Promise<{ id: string }> };

// PATCH CMS: ubah status (aktif/batal), catatan admin, tanggal rombongan, atau jumlah orang.
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await readJsonObject(req);
  if (!body) return badRequest();
  return poolMutation("UPDATE", () => updateSignup(id, body), (s) => ({ name: s.name, id, detail: s.detail }));
}

// DELETE CMS: hapus pendaftar (untuk data uji atau spam; pembatalan biasa cukup status Batal).
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return poolMutation("DELETE", () => deleteSignup(id), (s) => ({ name: s.name, id, detail: "Pendaftar pool dihapus" }));
}
