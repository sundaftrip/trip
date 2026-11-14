import { NextRequest, NextResponse } from "next/server";
import { pkgLabel } from "@/lib/pool/core";
import { logPool, requirePoolPermission } from "@/lib/pool/admin-guard";
import { loadAdminData } from "@/lib/pool/store";
import { apiError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

/** Sel CSV: kutip, dan netralkan awalan rumus supaya aman dibuka di Excel/Sheets. */
function cell(value: string | number): string {
  let s = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

// GET CMS: unduh daftar pendaftar (CSV). Butuh izin pool_view; tercatat di log aktivitas.
export async function GET(req: NextRequest) {
  const guard = await requirePoolPermission("pool_view");
  if (!guard.ok) return guard.response;
  try {
    const destId = req.nextUrl.searchParams.get("dest") ?? "";
    const data = await loadAdminData();
    const byId = new Map(data.destinations.map((d) => [d.id, d]));
    const rows = data.signups.filter((s) => !destId || s.destinationId === destId);
    const head = ["Negara", "Tanggal rombongan", "Tanggal tiba", "Kode", "Nama", "WhatsApp", "Jumlah orang", "Paket", "Daftar minat", "Tanggal fleksibel", "Status", "Jam tiba", "Datang via", "No. penerbangan", "Hotel", "Catatan pendaftar", "Catatan admin", "Sumber", "Waktu daftar"];
    const lines = [head.map(cell).join(",")];
    for (const s of rows) {
      const dest = byId.get(s.destinationId);
      lines.push([
        dest?.name ?? "", s.poolDate, s.arrivalDate, s.kode, s.name, s.whatsapp, s.pax,
        dest ? pkgLabel(dest, s.pkg, s.kgPlan) : s.pkg, s.interest ? "Ya" : "Tidak", s.flex ? "Ya" : "Tidak", s.status,
        s.arrivalTime, s.via, s.flight, s.hotel === "sendiri" ? `Sendiri ${s.hotelName}`.trim() : s.hotel,
        s.note, s.adminNote, s.source, s.createdAt,
      ].map(cell).join(","));
    }
    await logPool(guard.session, "UPDATE", "Unduh pendaftar pool", `${rows.length} baris${destId ? ` (${byId.get(destId)?.name ?? destId})` : ""}`);
    return new NextResponse("﻿" + lines.join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="pendaftar-pool-${data.today}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return apiError(err);
  }
}
