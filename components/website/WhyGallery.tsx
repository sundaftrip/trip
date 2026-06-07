/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
/* Galeri marquee homepage (mengganti "Mengapa Kami").
   3 baris foto berjalan otomatis dengan arah berselang: kanan, kiri, kanan.
   Foto sumber sudah ber-watermark Sundaf (baked-in), jadi TANPA overlay tambahan (hindari watermark dobel).
   Server component, animasi CSS murni (tanpa JS) → ringan & hemat. */
const ROWS: string[][] = [
  ["01", "02", "03", "04", "05", "06", "07", "08"],
  ["09", "10", "11", "12", "13", "14", "15", "16"],
  ["17", "18", "19", "20", "21", "22", "23", "24"],
].map((group) => group.map((n) => `/about-gallery/${n}-aurora.webp`));

// Arah per baris (kanan, kiri, kanan) + durasi beda supaya terasa organik.
const DIRECTIONS: ("right" | "left")[] = ["right", "left", "right"];
const DURATIONS = [58, 74, 64]; // detik

export default function WhyGallery({ theme = "classic" }: { theme?: string }) {
  // Samakan background dengan section lain agar carousel berjalan DI ATAS
  // background grid tema aktif (bukan papan polos). Bekerja gelap & terang.
  let secClass = "py-20 sm:py-24 overflow-hidden";
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block w-1.5 h-5 rounded-full" style={{ background: "var(--site-accent,#2d6a4f)" }} />
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Galeri Perjalanan
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          Potret dari lapangan
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
          Momen nyata dari perjalanan yang kami pandu — Rusia, Asia Tengah, dan perburuan aurora.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
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
