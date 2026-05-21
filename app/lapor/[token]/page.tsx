import type { Metadata } from "next";
import "../lapor.css";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/keuangan/format";
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

  if (!tour) {
    return (
      <div className="lapor">
        <div className="lapor-wrap">
          <div className="lapor-card lapor-invalid">
            <div className="lapor-invalid-icon">🔒</div>
            <h1>Link tidak valid</h1>
            <p>
              Link pelaporan ini tidak ditemukan atau sudah dicabut kantor.
              Hubungi kantor Sundaf Trip untuk mendapatkan link terbaru.
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
