import { NextResponse } from "next/server";

/* Penerjemah error mutasi (terutama Prisma) → respons JSON ramah.
   Detail internal TIDAK dibocorkan ke klien — cukup di-log di server. */
export function apiError(err: unknown, opts?: { duplicate?: string }): NextResponse {
  const code = (err as { code?: string } | null)?.code;

  // P2002 — pelanggaran unique constraint (data duplikat)
  if (code === "P2002") {
    return NextResponse.json(
      { error: opts?.duplicate ?? "Data dengan nilai unik yang sama sudah ada." },
      { status: 409 }
    );
  }

  // P2025 — record yang mau di-update/hapus tidak ditemukan
  if (code === "P2025") {
    return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
  }

  console.error("[api]", err);
  return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
}
