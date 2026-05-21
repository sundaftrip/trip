import type { Metadata } from "next";
import "../lapor.css";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/keuangan/format";
import { isTokenActive } from "@/lib/keuangan/calc";
import LaporForm from "@/components/lapor/LaporForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lapor Pengeluaran Trip — Sundaf Trip",
  robots: { index: false, follow: false },
};

export default async function LaporPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const tour = await prisma.tour.findUnique({
    where: { expenseToken: token },
    select: { id: true, title: true, country: true, tripDate: true },
  });

  if (!tour || !isTokenActive(tour.tripDate)) {
    const expired = !!tour; // ketemu tapi sudah lewat masa berlaku
    return (
      <div className="lapor">
        <div className="lapor-wrap">
          <div className="lapor-card lapor-invalid">
            <div className="lapor-invalid-icon">{expired ? "⏳" : "🔒"}</div>
            <h1>{expired ? "Link sudah kedaluwarsa" : "Link tidak valid"}</h1>
            <p>
              {expired
                ? "Masa berlaku link pelaporan ini sudah habis (14 hari setelah trip berangkat). Hubungi kantor Sundaf Trip untuk link baru."
                : "Link pelaporan ini tidak ditemukan atau sudah dicabut kantor. Hubungi kantor Sundaf Trip untuk mendapatkan link terbaru."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const recent = await prisma.fieldExpense.findMany({
    where: { tourId: tour.id },
    orderBy: { createdAt: "desc" },
    take: 25,
    select: {
      id: true,
      date: true,
      category: true,
      amount: true,
      photoUrl: true,
      status: true,
      submittedBy: true,
    },
  });

  return (
    <div className="lapor">
      <LaporForm
        token={token}
        tripTitle={tour.title}
        tripInfo={`${tour.country}${tour.tripDate ? ` · ${fmtDate(tour.tripDate)}` : ""}`}
        recent={recent}
      />
    </div>
  );
}
