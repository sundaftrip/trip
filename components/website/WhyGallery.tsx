/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
/* Galeri marquee homepage (gaya portfolio: lattice editorial).
   2 baris foto berlawanan arah (kiri lalu kanan), rasio natural, sudut tajam,
   dibingkai kotak dengan garis tipis. 3 baris terasa redundant.
   Foto sumber sudah ber-watermark Sundaf (baked-in), jadi TANPA overlay tambahan.
   Server component, animasi CSS murni (tanpa JS) → ringan & hemat. */
const ROWS: string[][] = [
  ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
  ["13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"],
].map((group) => group.map((n) => `/about-gallery/${n}-aurora.webp`));

// Dua baris berlawanan arah (kiri lalu kanan), durasi beda supaya organik.
const DIRECTIONS: ("right" | "left")[] = ["left", "right"];
const DURATIONS = [66, 80]; // detik

export default function WhyGallery({ theme = "classic" }: { theme?: string }) {
  // Samakan background dengan section lain agar carousel berjalan DI ATAS
  // background grid tema aktif (bukan papan polos). Bekerja gelap & terang.
  let secClass = "py-12 sm:py-16 overflow-hidden";
  let secStyle: CSSProperties = {};
  if (theme === "atlas") { secClass += " at-grid-bg"; secStyle = { backgroundColor: "var(--at-bg)" }; }
  else if (theme === "map") { secStyle = { background: "var(--mp-bg)", backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }; }
  else if (theme === "pixel") { secStyle = { background: "var(--px-bg)", backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)", backgroundSize: "24px 24px" }; }
  else if (theme === "globe") { secStyle = { background: "var(--gl-bg)" }; }
  else if (theme === "kawaii") { secStyle = { background: "var(--kw-bg)" }; }
  else if (theme === "tropical") { secStyle = { background: "var(--tr-bg)" }; }
  else if (theme === "fumayo") { secClass = "fb-page " + secClass; }

  return (
    <section className={secClass} style={secStyle}>

      <div className="wg-frame">
        {ROWS.map((imgs, i) => (
          <div key={i} className="wg-row">
            <div
              className="wg-track"
              style={{
                animationDuration: `${DURATIONS[i]}s`,
                // arah "kanan" = balik animasi default yang menggeser ke kiri
                animationDirection: DIRECTIONS[i] === "right" ? "reverse" : "normal",
              }}
            >
              {/* digandakan dua kali untuk loop mulus (translateX -50%) */}
              {[...imgs, ...imgs].map((src, j) => {
                const isClone = j >= imgs.length;
                return (
                  <div key={j} className="wg-tile" aria-hidden={isClone || undefined}>
                    <img
                      src={src}
                      alt={isClone ? "" : "Dokumentasi perjalanan Sundaf Trip"}
                      loading="lazy"
                      decoding="async"
                      className="wg-img"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
