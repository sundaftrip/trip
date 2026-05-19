import TourCard from "./TourCard";
import AnimateIn from "./AnimateIn";

interface Tour {
  id: string; title: string; country: string; cityHighlight: string | null;
  price: number; promoPrice: number | null; seatsLeft: number;
  tripDate: Date | null; duration: string | null; heroImg: string | null;
  badge: string | null; status: string;
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
          </div>
        </AnimateIn>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-7">
          {tours.map((tour, i) => (
            <AnimateIn key={tour.id} delay={i * 80}>
              <TourCard tour={tour} theme="pixel" />
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );

  /* ── FUMAYO layout ── */
  if (theme === "fumayo") return (
    <section className="fb-page py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="mb-12">
            <span className="fb-pill mb-4 inline-flex" style={{ background: "var(--fb-yellow)", color: "#1a1a1a" }}>★ Paket Tersedia</span>
            <h2 className="text-3xl lg:text-5xl font-bold mt-3" style={{ color: "var(--fb-ink)", fontFamily: "var(--fb-font)" }}>
              Tour <span className="fb-wave" style={{ color: "var(--fb-accent)" }}>Pilihan</span>
            </h2>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-7">
          {tours.map((tour, i) => (
            <AnimateIn key={tour.id} delay={i * 80} className="h-full">
              <TourCard tour={tour} theme="fumayo" />
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
          </div>
        </AnimateIn>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-7">
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
          </div>
        </AnimateIn>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-7">
          {tours.map((tour, i) => (
            <AnimateIn key={tour.id} delay={i * 80}>
              <TourCard tour={tour} theme="globe" />
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );

  /* ── ATLAS ── */
  if (theme === "atlas") return (
    <section className="py-24 at-grid-bg" style={{ backgroundColor: "var(--at-bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="flex items-end justify-between mb-14">
            <div>
              <span className="at-pill mb-4 inline-flex" style={{ color: "var(--at-subtext)" }}>Paket Tersedia</span>
              <h2 className="text-3xl lg:text-5xl font-bold mt-3" style={{ color: "var(--at-text)" }}>Tour Pilihan</h2>
            </div>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-7">
          {tours.map((tour, i) => (
            <AnimateIn key={tour.id} delay={i * 80} className="h-full">
              <TourCard tour={tour} theme="atlas" />
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );

  /* ── MAP / ATLAS ── */
  if (theme === "map") return (
    <section className="py-24 relative overflow-hidden"
      style={{ background: "var(--mp-bg)", backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }}>
      {/* CSS terrain ring decoration */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border-2 pointer-events-none mp-terrain-2" style={{ borderColor: "var(--mp-border)", opacity: 0.5 }} />
      <div className="mp-route absolute top-28 left-0 right-0 pointer-events-none" style={{ opacity: 0.2 }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimateIn>
          <div className="flex items-end justify-between mb-14">
            <div>
              <span className="mp-pill mb-4 inline-flex" style={{ background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>Paket Tersedia</span>
              <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--mp-text)", fontFamily: "Georgia,'Times New Roman',serif" }}>Tour Pilihan</h2>
            </div>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-7">
          {tours.map((tour, i) => (
            <AnimateIn key={tour.id} delay={i * 80}>
              <TourCard tour={tour} theme="map" />
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
          </div>
        </AnimateIn>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-7">
          {tours.map((tour, i) => (
            <AnimateIn key={tour.id} delay={i * 80}>
              <TourCard tour={tour} theme="tropical" />
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );

  const sectionBg = "bg-white dark:bg-black";

  const headingColor = "text-gray-900 dark:text-white";

  const subColor = "text-gray-400";


  return (
    <section className={`py-24 ${sectionBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className={`text-xs tracking-[0.15em] uppercase mb-3 ${subColor}`}>Paket Tersedia</p>
              <h2 className={`text-3xl lg:text-4xl font-bold ${headingColor}`} style={{ color: "var(--site-heading,inherit)" }}>Tour Pilihan</h2>
            </div>
          </div>
        </AnimateIn>

        {/* Classic: equal 3-column grid */}
        {theme === "classic" && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {tours.map((tour, i) => (
              <AnimateIn key={tour.id} delay={i * 80}>
                <TourCard tour={tour} theme="classic" />
              </AnimateIn>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
