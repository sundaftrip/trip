import { NextRequest } from "next/server";
import { badRequest, poolMutation, readJsonObject } from "@/lib/pool/admin-guard";
import { saveDestination } from "@/lib/pool/store";

// POST CMS: buat negara pool baru.
export async function POST(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body) return badRequest();
  return poolMutation("CREATE", () => saveDestination(null, body), (dest) => ({ name: dest.name, id: dest.id, detail: `Negara pool dibuat (${dest.status})` }));
}
