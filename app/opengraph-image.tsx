import { ImageResponse } from "next/og";

// Kartu share sosial 1200×630 (rasio OG/Twitter ideal). Dipakai default
// untuk semua halaman kecuali yang punya opengraph-image sendiri.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Pergi lebih jauh bersama Sundaf Trip — Rusia, Asia Tengah & Aurora";

const PAPER = "#F7F4ED";
const INK = "#18332D";
const MUTED = "#596963";
const GOLD = "#9A7443";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: PAPER,
          color: INK,
          padding: "42px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: `2px solid ${INK}`,
            padding: "46px 52px 40px",
          }}
        >
          {/* Brand line */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: "sans-serif",
            }}
          >
            <div style={{ display: "flex", fontSize: 31, fontWeight: 800, letterSpacing: -1 }}>
              Sundaf Trip
            </div>
            <div style={{ display: "flex", color: GOLD, fontSize: 18, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>
              Rusia · Asia Tengah · Aurora
            </div>
          </div>

          {/* Main editorial message */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 48 }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 78, lineHeight: 0.98, letterSpacing: -4 }}>
              <div style={{ display: "flex" }}>Pergi lebih jauh.</div>
              <div style={{ display: "flex" }}>Kami urus yang rumit.</div>
            </div>
            <div style={{ display: "flex", width: 12, height: 154, background: GOLD }} />
          </div>

          {/* Service + domain line */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24, borderTop: `1px solid ${INK}`, fontFamily: "sans-serif" }}>
            <div style={{ display: "flex", color: MUTED, fontSize: 21 }}>
              Open trip · Private trip · Layanan visa
            </div>
            <div style={{ display: "flex", fontSize: 23, fontWeight: 750 }}>
              sundaftrip.com
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
