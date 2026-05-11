import Link from "next/link";
import TourCard from "./TourCard";
import AnimateIn from "./AnimateIn";
import { ArrowRight } from "lucide-react";

interface Tour {
  id: string; title: string; country: string; cityHighlight: string | null;
  price: number; promoPrice: number | null; seatsLeft: number;
  tripDate: Date | null; duration: string | null; heroImg: string | null;
  badge: string | null; category: string; status: string;
}

interface Props {
  tours: Tour[];
  theme?: string;
}

export default function ToursSection({ tours, theme = "classic" }: Props) {
  if (tours.length === 0) return null;

  /* ── PIXEL layout ── */
  if (theme === "pixel") return (
    <section className="py-24 relative" style={{
      background: "var(--px-bg)",
      backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
      backgroundSize: "24px 24px",
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="flex items-end justify-between mb-14">
            <div>
              <span className="px-pill mb-4 inline-flex" style={{ background: "var(--px-yellow)", color: "var(--px-on-yellow)" }}>► PAKET TERSEDIA</span>
              <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--px-text)", fontFamily: "monospace" }}>TOUR PILIHAN</h2>
            </div>
            <Link href="/tours" className="px-btn px-5 py-2.5 text-sm" style={{ background: "var(--site-accent)", color: "#ffffff" }}>
              SEMUA TOUR ►
            </Link>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {tours.map((tour, i) => (
            <AnimateIn key={tour.id} delay={i * 80}>
              <TourCard tour={tour} theme="pixel" />
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );

  /* ── KAWAII layout ── */
  if (theme === "kawaii") return (
    <section className="py-24" style={{ background: "var(--kw-bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="flex items-end justify-between mb-14">
            <div>
              <span className="kw-pill mb-4 inline-flex" style={{ background: "var(--kw-sun)", color: "var(--kw-text)" }}>✦ Paket Tersedia</span>
              <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--kw-text)" }}>Tour Pilihan</h2>
            </div>
            <Link href="/tours" className="kw-pill font-black" style={{ background: "var(--kw-border)", color: "#ffffff" }}>
              Semua Tour →
            </Link>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {tours.map((tour, i) => (
            <AnimateIn key={tour.id} delay={i * 80}>
              <TourCard tour={tour} theme="kawaii" />
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );

  /* ── GLOBE layout ── */
  if (theme === "globe") return (
    <section className="py-24 relative overflow-hidden" style={{ background: "var(--gl-bg)" }}>
      {/* subtle landmark deco */}
      <span className="absolute top-8 right-10 text-6xl pointer-events-none select-none gl-float-2" style={{ opacity: 0.12 }}>🗼</span>
      <span className="absolute bottom-10 left-8 text-5xl pointer-events-none select-none gl-float-3" style={{ opacity: 0.1 }}>🏛️</span>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimateIn>
          <div className="flex items-end justify-between mb-14">
            <div>
              <span className="gl-pill mb-4 inline-flex" style={{ background: "var(--gl-amber)", color: "var(--gl-on-amber)", borderColor: "transparent" }}>✈ Paket Tersedia</span>
              <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--gl-text)" }}>Tour Pilihan</h2>
            </div>
            <Link href="/tours" className="gl-pill font-black" style={{ background: "var(--gl-border)", color: "#ffffff", borderColor: "transparent" }}>
              Semua Tour →
            </Link>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {tours.map((tour, i) => (
            <AnimateIn key={tour.id} delay={i * 80}>
              <TourCard tour={tour} theme="globe" />
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );

  /* ── TROPICAL layout ── */
  if (theme === "tropical") return (
    <section className="py-24" style={{ background: "var(--tr-bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="flex items-end justify-between mb-14">
            <div>
              <span className="tr-pill mb-4 inline-flex" style={{ background: "var(--tr-sun)", color: "var(--tr-text)" }}>🌏 Paket Tersedia</span>
              <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--tr-text)" }}>Tour Pilihan</h2>
            </div>
            <Link href="/tours" className="tr-pill font-black" style={{ background: "var(--site-accent)", color: "#fff" }}>
              Semua Tour →
            </Link>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {tours.map((tour, i) => (
            <AnimateIn key={tour.id} delay={i * 80}>
              <TourCard tour={tour} theme="tropical" />
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );

  const sectionBg =
    theme === "bold" ? "bg-black" :
    theme === "vibrant" ? "bg-white dark:bg-gray-950" :
    "bg-white dark:bg-black";

  const headingColor =
    theme === "bold" ? "text-white" : "text-gray-900 dark:text-white";

  const subColor =
    theme === "bold" ? "text-gray-500" : "text-gray-400";

  const linkColor =
    theme === "bold"
      ? "text-gray-500 hover:text-white"
      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white";

  return (
    <section className={`py-24 ${sectionBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className={`text-xs tracking-[0.15em] uppercase mb-3 ${subColor}`}>Paket Tersedia</p>
              <h2 className={`text-3xl lg:text-4xl font-bold ${headingColor}`} style={{ color: "var(--site-heading,inherit)" }}>Tour Pilihan</h2>
            </div>
            <Link href="/tours" className={`flex items-center gap-1.5 text-sm font-medium transition-colors group ${linkColor}`}>
              Semua Tour <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </AnimateIn>

        {/* Classic: equal 3-column grid */}
        {theme === "classic" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour, i) => (
              <AnimateIn key={tour.id} delay={i * 80}>
                <TourCard tour={tour} theme="classic" />
              </AnimateIn>
            ))}
          </div>
        )}

        {/* Vibrant: first card featured (full-width), rest in grid */}
        {theme === "vibrant" && (
          <div className="space-y-6">
            {tours.length > 0 && (
              <AnimateIn>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-1">
                    <Link href={`/tours/${tours[0].id}`}>
                      <div className="group relative h-96 rounded-3xl overflow-hidden shadow-2xl cursor-pointer">
                        {tours[0].heroImg
                          ? <img src={tours[0].heroImg} alt={tours[0].title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          : <div className="absolute inset-0 bg-gray-200" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        {tours[0].badge && (
                          <span className="absolute top-5 left-5 px-3 py-1.5 text-white text-[11px] font-bold rounded-full" style={{ background: "var(--site-accent,#2d6a4f)" }}>
                            {tours[0].badge}
                          </span>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">{tours[0].category} · {tours[0].country}</p>
                          <h3 className="text-white font-bold text-xl leading-snug mb-3">{tours[0].title}</h3>
                          <p className="text-xl font-black text-white">{(tours[0].promoPrice ?? tours[0].price).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                  {tours.slice(1, 3).map((tour, i) => (
                    <AnimateIn key={tour.id} delay={(i + 1) * 100}>
                      <TourCard tour={tour} theme="vibrant" />
                    </AnimateIn>
                  ))}
                </div>
              </AnimateIn>
            )}
            {tours.length > 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.slice(3).map((tour, i) => (
                  <AnimateIn key={tour.id} delay={i * 80}>
                    <TourCard tour={tour} theme="vibrant" />
                  </AnimateIn>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bold: single-column list of horizontal cards */}
        {theme === "bold" && (
          <div className="flex flex-col gap-4">
            {tours.map((tour, i) => (
              <AnimateIn key={tour.id} delay={i * 60} direction="left">
                <TourCard tour={tour} theme="bold" />
              </AnimateIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
