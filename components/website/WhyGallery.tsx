/* eslint-disable @next/next/no-img-element */
/* Galeri marquee homepage (mengganti "Mengapa Kami").
   3 baris foto berjalan otomatis dengan arah berselang: kanan, kiri, kanan.
   Tiap foto diberi watermark logo Sundaf (putih, transparan) di pojok.
   Server component, animasi CSS murni (tanpa JS) → ringan & hemat. */
const ROWS: string[][] = [
  ["01", "02", "03", "04", "05", "06", "07", "08"],
  ["09", "10", "11", "12", "13", "14", "15", "16"],
  ["17", "18", "19", "20", "21", "22", "23", "24"],
].map((group) => group.map((n) => `/about-gallery/${n}-aurora.webp`));

// Arah per baris (kanan, kiri, kanan) + durasi beda supaya terasa organik.
const DIRECTIONS: ("right" | "left")[] = ["right", "left", "right"];
const DURATIONS = [58, 74, 64]; // detik

export default function WhyGallery() {
  return (
    <section className="py-20 sm:py-24 overflow-hidden">
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
                    <img src="/logo.png" alt="" aria-hidden="true" className="wg-wm" />
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
