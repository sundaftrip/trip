"use client";

import Link from "next/link";

export default function WebsiteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      style={{
        minHeight: "70vh",
        padding: "124px 20px 80px",
        background: "#fff",
        color: "#172029",
      }}
    >
      <div style={{ width: "min(100%, 660px)", margin: "0 auto" }}>
        <p style={{ color: "#0c4d56", fontSize: 12, fontWeight: 800, letterSpacing: ".14em" }}>
          HALAMAN BELUM DAPAT DIMUAT
        </p>
        <h1 style={{ margin: "14px 0", fontSize: "clamp(34px, 8vw, 58px)", lineHeight: 1.05 }}>
          Coba lagi tanpa kehilangan rencanamu.
        </h1>
        <p style={{ maxWidth: 560, color: "#606b72", fontSize: 16, lineHeight: 1.7 }}>
          Data perjalanan belum berhasil dimuat. Muat ulang halaman atau kembali ke jadwal
          tour; tidak ada pemesanan yang dibuat dari kegagalan ini.
        </p>
        <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 12 }}>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: 48,
              padding: "0 20px",
              border: 0,
              borderRadius: 999,
              background: "#0c4d56",
              color: "#fff",
              font: "inherit",
              fontWeight: 750,
              cursor: "pointer",
            }}
          >
            Coba lagi
          </button>
          <Link
            href="/tours"
            style={{
              minHeight: 48,
              padding: "0 20px",
              display: "inline-flex",
              alignItems: "center",
              border: "1px solid #cbd5d5",
              borderRadius: 999,
              color: "#202934",
              fontWeight: 750,
            }}
          >
            Lihat jadwal tour
          </Link>
        </div>
      </div>
    </main>
  );
}
