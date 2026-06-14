import TourCard from "./TourCard";
import AnimateIn from "./AnimateIn";

interface Tour {
  slug?: string | null;
  id: string; title: string; country: string; cityHighlight: string | null;
  price: number; promoPrice: number | null; seatsLeft: number;
  tripDate: Date | null; duration: string | null; heroImg: string | null;
  badge: string | null; status: string;
}

interface Props {
  tours: Tour[];
  theme?: string;
  children?: React.ReactNode;
}

export default function ToursSection({ tours, theme = "classic", children }: Props) {
  if (tours.length === 0) return null;

  /* ── NUSANTARA ── */
  if (theme === "nusantara") {
    const idr = (n: number) => "Rp " + n.toLocaleString("id-ID");
    return (
      <section className="nu-page py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <AnimateIn>
            <h2 className="nu-section-title">Paket Wisata Pilihan</h2>
            <p className="nu-section-sub mb-8">Berbagai pilihan paket wisata terbaik untuk pengalaman liburan yang berkesan.</p>
          </AnimateIn>
          <AnimateIn>
            <div className="nu-card overflow-hidden">
              {tours.map((tour) => {
                const price = tour.promoPrice ?? tour.price;
                return (
                  <a key={tour.id} href={`/tours/${tour.slug ?? tour.id}`} className="nu-row">
                    <div className="nu-row-thumb">
                      {tour.heroImg
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={tour.heroImg} alt={tour.title} loading="lazy" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl nu-display" style={{ color: "var(--nu-navy)" }}>{tour.title.charAt(0)}</div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="nu-display text-[20px] truncate" style={{ color: "var(--nu-navy)" }}>{tour.title}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "var(--nu-muted)" }}>
                        {tour.duration || tour.country}
                        {tour.cityHighlight ? ` · ${tour.cityHighlight}` : ""}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      {tour.badge && <span className="nu-chip">{tour.badge}</span>}
                      <span className="nu-chip" style={{ color: "var(--nu-gold-deep)", background: "var(--nu-gold-soft)", borderColor: "var(--nu-gold-soft)" }}>
                        {idr(price)}
                      </span>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--nu-gold)" }} className="shrink-0">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </a>
                );
              })}
            </div>
          </AnimateIn>
          {children}
        </div>
      </section>
    );
  }

  /* ── Y2K KAWAII (attic) ── */
  if (theme === "attic") return (
    <section className="atc-box atc-font p-4 sm:p-5">
      <h2 className="atc-title text-xl">Katalog Tour ✦</h2>
      <hr className="atc-divider" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {tours.map((tour, i) => (
          <AnimateIn key={tour.id} delay={i * 60} className="h-full">
            <TourCard tour={tour} theme="attic" />
          </AnimateIn>
        ))}
      </div>
      {children}
    </section>
  );

  /* ── TERI layout ── */
  if (theme === "teri") return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="text-center mb-16">
            <span className="teri-pill mb-4 inline-flex">✦ Paket Tersedia</span>
            <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--teri-ink)" }}>Tour Pilihan</h2>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12">
          {tours.map((tour, i) => (
            <AnimateIn key={tour.id} delay={i * 80} className="h-full">
              <TourCard tour={tour} theme="teri" />
            </AnimateIn>
          ))}
        </div>
        {children}
      </div>
    </section>
  );

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
        {children}
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
        {children}
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
        {children}
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
        {children}
      </div>
    </section>
  );

  /* ── ATLAS ── */
  if (theme === "atlas") return (
    <section className="py-8 sm:py-14 at-grid-bg" style={{ backgroundColor: "var(--at-bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="flex items-end justify-between mb-5 sm:mb-10">
            <div>
              <span className="at-pill mb-3 inline-flex" style={{ color: "var(--at-subtext)" }}>Pilihan paket</span>
              <h2 className="text-xl sm:text-3xl lg:text-5xl font-bold" style={{ color: "var(--at-text)" }}>Tour Pilihan</h2>
              <p className="mt-1 text-xs font-medium sm:hidden" style={{ color: "var(--at-subtext)" }}>Tanggal terdekat, seat terbatas, bisa konsultasi dulu.</p>
            </div>
          </div>
        </AnimateIn>
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 sm:gap-7">
          {tours.map((tour, i) => (
            <AnimateIn key={tour.id} delay={i * 80} className="h-full w-[78vw] max-w-[20rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
              <TourCard tour={tour} theme="atlas" />
            </AnimateIn>
          ))}
        </div>
        {children}
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
        {children}
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
        {children}
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

        {/* Classic / Daun: equal 3-column grid (clean default) */}
        {(theme === "classic" || theme === "daun") && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {tours.map((tour, i) => (
              <AnimateIn key={tour.id} delay={i * 80}>
                <TourCard tour={tour} theme={theme === "daun" ? "classic" : "classic"} />
              </AnimateIn>
            ))}
          </div>
        )}

        {children}
      </div>
    </section>
  );
}
