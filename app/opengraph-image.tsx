import { ImageResponse } from "next/og";

// Kartu share sosial 1200×630 (rasio OG/Twitter ideal). Dipakai default
// untuk semua halaman kecuali yang punya opengraph-image sendiri.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Sundaf Trip, Spesialis Perjalanan Rusia, Asia Tengah & Aurora";

// Palet rebrand 2026: charcoal / slate / teal / light
const CHARCOAL = "#222831";
const TEAL = "#00ADB5";
const LIGHT = "#EEEEEE";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CHARCOAL,
          backgroundImage: `radial-gradient(900px circle at 80% -10%, rgba(0,173,181,0.30), transparent 55%), radial-gradient(700px circle at 0% 110%, rgba(0,173,181,0.12), transparent 50%)`,
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: eyebrow pill */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 22px",
              border: `2px solid ${TEAL}`,
              borderRadius: 999,
              color: TEAL,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Open Trip · Private Trip
          </div>
        </div>

        {/* Middle: brand + tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 900,
              color: LIGHT,
              lineHeight: 1,
              letterSpacing: -2,
            }}
          >
            Sundaf&nbsp;Trip
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 600,
              color: "#B8C0C8",
              maxWidth: 920,
              lineHeight: 1.25,
            }}
          >
            Spesialis Perjalanan Rusia, Asia Tengah & Aurora Borealis
          </div>
        </div>

        {/* Bottom: domain + accent bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", width: 64, height: 8, background: TEAL, borderRadius: 4 }} />
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: LIGHT }}>
            sundaftrip.com
          </div>
          <div style={{ display: "flex", flex: 1 }} />
          <div style={{ display: "flex", fontSize: 26, color: "#8A929B" }}>
            Visa · Itinerary · Pendampingan
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
