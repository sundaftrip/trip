import { ImageResponse } from "next/og";

// 192×192 (kelipatan 48) — syarat favicon Google. Ukuran 32px ditolak Google.
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

/**
 * Mark persegi SUNDAF 2026 (kotak teal + jalan "S" putih + bendera).
 * Dirender langsung dari SVG, BUKAN dari wordmark lebar di DB —
 * supaya favicon Google selalu 1:1 dan tidak gepeng di lingkaran hasil pencarian.
 * Sumber identik dengan /public/favicon.svg.
 */
const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="192" height="192">
  <rect width="64" height="64" rx="15" fill="#00ADB5"/>
  <path d="M43 17 C 27 13, 18 25, 31 31 C 44 37, 36 50, 21 47" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M43 17 C 27 13, 18 25, 31 31 C 44 37, 36 50, 21 47" fill="none" stroke="#00ADB5" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2.2 4"/>
  <line x1="45" y1="9" x2="45" y2="19" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M45 10 L 54 12.5 L 45 15 Z" fill="#222831"/>
  <circle cx="21" cy="47" r="3.4" fill="#222831"/>
</svg>`;

export default function Icon() {
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString("base64")}`;

  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={dataUri}
        width={size.width}
        height={size.height}
        alt="Sundaf Trip"
        style={{ width: "100%", height: "100%" }}
      />
    ),
    { ...size }
  );
}
