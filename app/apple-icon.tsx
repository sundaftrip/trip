import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon — mark persegi SUNDAF 2026 yang sama dengan favicon,
 * dirender penuh tanpa wordmark lebar dari DB supaya tidak gepeng.
 * Sumber identik dengan /public/favicon.svg.
 */
const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="180" height="180">
  <rect width="64" height="64" rx="15" fill="#00ADB5"/>
  <path d="M43 17 C 27 13, 18 25, 31 31 C 44 37, 36 50, 21 47" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M43 17 C 27 13, 18 25, 31 31 C 44 37, 36 50, 21 47" fill="none" stroke="#00ADB5" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2.2 4"/>
  <line x1="45" y1="9" x2="45" y2="19" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M45 10 L 54 12.5 L 45 15 Z" fill="#222831"/>
  <circle cx="21" cy="47" r="3.4" fill="#222831"/>
</svg>`;

export default function AppleIcon() {
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString("base64")}`;

  return new ImageResponse(
    (
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
