import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface Props {
  texts: Record<string, { id?: string; en?: string }>;
  waNumber?: string;
  companyName?: string;
  theme?: "classic" | "tropical" | "kawaii" | "pixel" | "globe" | "map" | "atlas" | "fumayo";
}

const FALL_PHYSICS = [
  { dx: "-118px", rot: "-684deg" },
  { dx: "104px",  rot: "548deg"  },
  { dx: "-72px",  rot: "-912deg" },
  { dx: "136px",  rot: "742deg"  },
  { dx: "-128px", rot: "-596deg" },
  { dx: "88px",   rot: "868deg"  },
];

function renderTitleWords(heroTitle: string, extra?: React.ReactNode) {
  let g = 0; // indeks huruf global, stagger tiap huruf rontok
  const words = heroTitle.split(/\s+/).filter(Boolean);
  /* aria-hidden: ~45 span per-huruf bikin screen reader mengeja satu-satu.
     Teks utuh dibacakan lewat aria-label di <h1> pemanggil. */
  return (
    <span aria-hidden="true">
      {words.map((word, i) => (
        <span key={i} className="block">
          {word.charAt(0)}
          {word.slice(1).split("").map((ch, j) => {
            const gi = g++;
            const p = FALL_PHYSICS[gi % FALL_PHYSICS.length];
            return (
              <span key={j} className="sundaf-fall"
                style={{ ["--n" as string]: gi, ["--dx" as string]: p.dx, ["--rot" as string]: p.rot }}>
                {ch}
              </span>
            );
          })}
          {/* trailing space supaya textContent/screen-reader/SEO baca
              "Saatnya Untuk Nikmatin ..." bukan satu kata gabung tanpa spasi.
              Display:block bikin spasi ini tidak terlihat visual. */}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
      {extra}
    </span>
  );
}

export default function HeroSection({ texts, waNumber, companyName, theme = "classic" }: Props) {
  // Server Component: render teks ID; AutoTranslate yang menerjemahkan ke EN saat dipilih.
  const t = (key: string, fallback: string) => {
    const val = texts[key];
    if (!val) return fallback;
    return val.id || val.en || fallback;
  };
  const eyebrow = companyName
    ? `${companyName}, ${t("hero_eyebrow", "Perjalanan Terpercaya")}`
    : t("hero_eyebrow", "Perjalanan Terpercaya");
  const heroTitle = t("hero_title", "Wujudkan Perjalanan Impian Anda");

  /* ── FUMAYO ── */
  if (theme === "fumayo") {
    const words = t("hero_title", "Wujudkan Perjalanan Impian Anda").split(/\s+/).filter(Boolean);
    const popColors = ["var(--fb-red)", "var(--fb-blue)", "var(--fb-accent)", "var(--fb-yellow)"];
    return (
      <section className="fb-page min-h-screen flex flex-col justify-center relative overflow-hidden pt-28 pb-20 px-4">
        <span aria-hidden="true" className="absolute top-32 right-[12%] text-5xl fb-float-1 select-none pointer-events-none" style={{ color: "var(--fb-red)", ["--fb-r" as string]: "-12deg" }}>✶</span>
        <span aria-hidden="true" className="absolute top-52 right-[34%] text-3xl fb-float-2 select-none pointer-events-none" style={{ color: "var(--fb-blue)" }}>✦</span>
        <span aria-hidden="true" className="absolute bottom-28 left-[10%] text-4xl fb-float-3 select-none pointer-events-none" style={{ color: "var(--fb-accent)", ["--fb-r" as string]: "8deg" }}>★</span>
        <span aria-hidden="true" className="absolute top-44 left-[40%] text-2xl fb-float-4 select-none pointer-events-none" style={{ color: "var(--fb-ink)" }}>✺</span>
        <span aria-hidden="true" className="absolute bottom-40 right-[20%] text-3xl fb-float-2 select-none pointer-events-none" style={{ color: "var(--fb-red)" }}>✷</span>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="fb-frame p-7 sm:p-14">
            <div className="mb-7 hero-fade-up">
              <span className="fb-pill" style={{ background: "var(--fb-yellow)", color: "#1a1a1a" }}>★ {eyebrow}</span>
            </div>
            <h1 className="text-[clamp(2.3rem,6.8vw,5.4rem)] font-bold leading-[1.08] tracking-tight max-w-4xl mb-8 hero-fade-up"
              style={{ color: "var(--fb-ink)", fontFamily: "var(--fb-font)" }}>
              {words.map((w, i) => (
                <span key={i} className={i % 3 === 1 ? "fb-wave" : undefined}
                  style={i % 3 === 1 ? { color: popColors[i % popColors.length] } : undefined}>
                  {w}{i < words.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>
            <div className="flex flex-wrap gap-2.5 mb-9 hero-fade-up">
              <span className="fb-pill" style={{ background: "var(--fb-blue)", color: "#1a1a1a" }}>📚 {t("hero_subtitle", "Destinasi Pilihan")}</span>
              <span className="fb-pill" style={{ background: "var(--fb-pink)", color: "#1a1a1a" }}>✦ Paket Lengkap</span>
              <span className="fb-pill" style={{ background: "var(--fb-yellow)", color: "#1a1a1a" }}>★ Terpercaya</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 hero-fade-up">
              <Link href="/tours" className="fb-btn px-7 py-3.5 text-sm">
                {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
              </Link>
              {waNumber && (
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
                  className="fb-btn-outline px-7 py-3.5 text-sm">
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ── KAWAII ── */
  if (theme === "kawaii") return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-28 pb-20 px-4"
      style={{ background: "var(--kw-bg)" }}>
      {/* Floating cute decorations */}
      <span aria-hidden="true" className="absolute top-32 right-12 lg:right-32 text-5xl kw-float-1 pointer-events-none select-none" style={{ color: "var(--kw-border)", opacity: 0.55 }}>♡</span>
      <span aria-hidden="true" className="absolute top-48 right-[35%] text-3xl kw-float-2 pointer-events-none select-none" style={{ color: "var(--kw-border)", opacity: 0.4 }}>✦</span>
      <span aria-hidden="true" className="absolute bottom-20 left-12 lg:left-24 text-4xl kw-float-3 pointer-events-none select-none" style={{ color: "var(--kw-border)", opacity: 0.45 }}>★</span>
      <span aria-hidden="true" className="absolute top-40 left-[42%] text-2xl kw-float-4 pointer-events-none select-none" style={{ color: "var(--kw-border)", opacity: 0.35 }}>✨</span>
      <span aria-hidden="true" className="absolute bottom-36 right-[22%] text-3xl kw-float-2 pointer-events-none select-none" style={{ color: "var(--kw-border)", opacity: 0.4, animationDelay: "1s" }}>♡</span>
      <span aria-hidden="true" className="absolute top-28 left-8 text-xl kw-float-3 pointer-events-none select-none" style={{ color: "var(--kw-border)", opacity: 0.3 }}>◇</span>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-8 hero-fade-up">
          <span className="kw-pill" style={{ background: "var(--kw-peach)", color: "var(--kw-text)" }}>
            ✈ {eyebrow}
          </span>
        </div>

        <h1 aria-label={heroTitle} className="text-[clamp(2.8rem,8vw,7rem)] font-black leading-[0.92] tracking-tight max-w-4xl mb-10 hero-fade-up"
          style={{ color: "var(--kw-text)" }}>
          {renderTitleWords(heroTitle, <span aria-hidden="true" className="inline-block ml-3 text-[35%] align-middle kw-float-1" style={{ color: "var(--kw-border)" }}>♡</span>)}
        </h1>

        <div className="flex flex-wrap gap-3 mb-12 hero-fade-up">
          <span className="kw-pill" style={{ background: "var(--kw-sky)", color: "var(--kw-text)" }}>
            🗺️ {t("hero_subtitle", "Destinasi Pilihan")}
          </span>
          <span className="kw-pill" style={{ background: "var(--kw-blush)", color: "var(--kw-text)", transform: "rotate(-1.5deg)" }}>
            🌸 Paket Lengkap
          </span>
          <span className="kw-pill" style={{ background: "var(--kw-sun)", color: "var(--kw-text)", transform: "rotate(1deg)" }}>
            ⭐ Terpercaya
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/tours"
            className="kw-btn px-8 py-4 text-sm font-black"
            style={{ background: "var(--kw-border)", color: "#ffffff" }}>
            {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
          </Link>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
              className="kw-btn px-8 py-4 text-sm font-black"
              style={{ background: "var(--kw-card)", color: "var(--kw-text)" }}>
              💬 WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );

  /* ── TROPICAL ── */
  if (theme === "tropical") return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-28 pb-20 px-4"
      style={{ background: "var(--tr-bg)" }}>
      {/* Floating decorative blobs */}
      <div className="absolute top-28 right-8 lg:right-28 w-40 h-40 rounded-full border-2 tr-float-1 pointer-events-none"
        style={{ background: "var(--tr-mint)", borderColor: "var(--tr-border)" }} />
      <div className="absolute top-52 right-2 lg:right-12 w-20 h-20 rounded-full border-2 tr-float-2 pointer-events-none"
        style={{ background: "var(--tr-sky)", borderColor: "var(--tr-border)" }} />
      <div className="absolute bottom-14 left-4 lg:left-20 w-28 h-28 rounded-full border-2 tr-float-3 pointer-events-none"
        style={{ background: "var(--tr-sun)", borderColor: "var(--tr-border)" }} />
      <div className="absolute bottom-28 right-[38%] w-10 h-10 rounded-full border-2 tr-float-4 pointer-events-none"
        style={{ background: "var(--tr-pink)", borderColor: "var(--tr-border)" }} />
      <div className="absolute top-36 left-[45%] w-7 h-7 rounded-full border-2 tr-float-2 pointer-events-none"
        style={{ background: "var(--tr-grape)", borderColor: "var(--tr-border)" }} />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-8 hero-fade-up">
          <span className="tr-pill" style={{ background: "var(--tr-mint)", color: "var(--tr-text)" }}>
            ✈ {eyebrow}
          </span>
        </div>

        <h1 aria-label={heroTitle} className="text-[clamp(2.8rem,8vw,7rem)] font-black leading-[0.92] tracking-tight max-w-4xl mb-10 hero-fade-up"
          style={{ color: "var(--tr-text)" }}>
          {renderTitleWords(heroTitle)}
        </h1>

        <div className="flex flex-wrap gap-3 mb-12 hero-fade-up">
          <span className="tr-pill" style={{ background: "var(--tr-sky)", color: "var(--tr-text)" }}>
            🗺️ {t("hero_subtitle", "Destinasi Pilihan")}
          </span>
          <span className="tr-pill" style={{ background: "var(--tr-pink)", color: "var(--tr-text)", transform: "rotate(-2deg)" }}>
            🌴 Paket Lengkap
          </span>
          <span className="tr-pill" style={{ background: "var(--tr-sun)", color: "var(--tr-text)", transform: "rotate(1.5deg)" }}>
            ⭐ Terpercaya
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/tours"
            className="tr-btn px-8 py-4 text-sm font-black"
            style={{ background: "var(--site-accent)", color: "#fff" }}>
            {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
          </Link>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
              className="tr-btn px-8 py-4 text-sm font-black"
              style={{ background: "var(--tr-card)", color: "var(--tr-text)" }}>
              💬 WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );

  /* ── GLOBE / WORLD LANDMARKS ── */
  if (theme === "globe") {
    return (
      <section className="min-h-[78vh] sm:min-h-screen flex flex-col justify-center relative overflow-hidden pt-28 pb-20 px-4"
        style={{ background: "var(--gl-bg)" }}>
        {/* Floating landmark decorations */}
        <span aria-hidden="true" className="hidden sm:block absolute top-32 right-12 lg:right-32 text-5xl gl-float-1 pointer-events-none select-none" style={{ opacity: 0.6 }}>🗼</span>
        <span aria-hidden="true" className="hidden sm:block absolute top-48 right-[35%] text-3xl gl-float-2 pointer-events-none select-none" style={{ opacity: 0.45 }}>🏛️</span>
        <span aria-hidden="true" className="hidden sm:block absolute bottom-20 left-12 lg:left-24 text-4xl gl-float-3 pointer-events-none select-none" style={{ opacity: 0.5 }}>🕌</span>
        <span aria-hidden="true" className="hidden sm:block absolute top-40 left-[42%] text-2xl gl-float-4 pointer-events-none select-none" style={{ opacity: 0.4 }}>🗽</span>
        <span aria-hidden="true" className="hidden sm:block absolute bottom-36 right-[22%] text-3xl gl-float-2 pointer-events-none select-none" style={{ opacity: 0.45, animationDelay: "1.2s" }}>✈️</span>
        <span aria-hidden="true" className="hidden sm:block absolute top-28 left-8 text-xl gl-float-3 pointer-events-none select-none" style={{ opacity: 0.35 }}>🌍</span>
        <span aria-hidden="true" className="hidden sm:block absolute bottom-14 right-8 text-2xl gl-float-1 pointer-events-none select-none" style={{ opacity: 0.4, animationDelay: "2s" }}>🏰</span>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="mb-8 hero-fade-up">
            <span className="gl-pill" style={{ background: "var(--gl-sky)", color: "var(--gl-on-sky)", borderColor: "transparent" }}>
              ✈ {eyebrow}
            </span>
          </div>

          <h1 aria-label={heroTitle} className="text-[clamp(2.8rem,7vw,6rem)] font-black leading-[0.92] tracking-tight max-w-3xl mb-10 hero-fade-up"
            style={{ color: "var(--gl-text)" }}>
            {renderTitleWords(heroTitle, <span aria-hidden="true" className="inline-block ml-3 text-[30%] align-middle gl-float-1" style={{ opacity: 0.7 }}>🌍</span>)}
          </h1>

          <div className="flex flex-wrap gap-3 mb-12 hero-fade-up">
            <span className="gl-pill" style={{ background: "var(--gl-sky)", color: "var(--gl-on-sky)", borderColor: "transparent" }}>
              🗺️ {t("hero_subtitle", "Destinasi Pilihan")}
            </span>
            <span className="gl-pill" style={{ background: "var(--gl-amber)", color: "var(--gl-on-amber)", borderColor: "transparent", transform: "rotate(-1.5deg)" }}>
              🧳 Paket Lengkap
            </span>
            <span className="gl-pill" style={{ background: "var(--gl-grass)", color: "var(--gl-on-grass)", borderColor: "transparent", transform: "rotate(1deg)" }}>
              ⭐ Terpercaya
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/tours"
              className="gl-btn px-8 py-4 text-sm font-black"
              style={{ background: "var(--gl-border)", color: "#ffffff", borderColor: "var(--gl-border)" }}>
              {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
            </Link>
            {waNumber && (
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
                className="gl-btn px-8 py-4 text-sm font-black"
                style={{ background: "var(--gl-card)", color: "var(--gl-text)" }}>
                💬 WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  /* ── MAP / ATLAS ── */
  if (theme === "map") return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-28 pb-20 px-4"
      style={{ background: "var(--mp-bg)" }}>

      {/* Animated lat/lon grid overlay */}
      <div className="absolute inset-0 mp-grid-bg pointer-events-none" />

      {/* Parchment land silhouette, large organic shape, top-right */}
      <div className="absolute -top-32 right-0 w-[55%] h-[110%] pointer-events-none hidden lg:block"
        style={{ background: "var(--mp-land)", clipPath: "polygon(18% 0%, 100% 0%, 100% 100%, 8% 100%, 0% 60%, 5% 30%)", opacity: 0.72 }} />

      {/* Contour rings inside the land area */}
      <div className="absolute top-16 right-[15%] w-64 h-64 rounded-full border pointer-events-none mp-terrain-1" style={{ borderColor: "var(--mp-border)", opacity: 0.15 }} />
      <div className="absolute top-28 right-[20%] w-44 h-44 rounded-full border pointer-events-none mp-terrain-2" style={{ borderColor: "var(--mp-border)", opacity: 0.12 }} />
      <div className="absolute top-40 right-[26%] w-28 h-28 rounded-full border pointer-events-none mp-terrain-3" style={{ borderColor: "var(--mp-border)", opacity: 0.10 }} />

      {/* Sea route line + location pins */}
      <div className="absolute top-56 left-0 w-[55%] mp-route pointer-events-none" style={{ opacity: 0.5 }} />
      <div className="absolute mp-pin pointer-events-none" style={{ top: "220px", left: "18%" }} />
      <div className="absolute mp-pin pointer-events-none" style={{ top: "220px", left: "35%", animationDelay: "0.8s" }} />
      <div className="absolute mp-pin pointer-events-none" style={{ top: "220px", left: "50%", animationDelay: "1.6s" }} />

      {/* Compass rose, bottom-right of land area */}
      <div className="absolute bottom-12 right-[8%] mp-compass hidden lg:flex items-center justify-center" style={{ width: 56, height: 56 }}>
        <div className="mp-compass-n" />
        <div className="mp-compass-c" />
      </div>

      {/* Outer frame border, like a real map */}
      <div className="absolute inset-3 border pointer-events-none hidden lg:block" style={{ borderColor: "color-mix(in srgb, var(--mp-border) 30%, transparent)" }} />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-8 hero-fade-up">
          <span className="mp-pill" style={{ background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>
            {eyebrow}
          </span>
        </div>

        <h1 aria-label={heroTitle} className="text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.95] tracking-tight max-w-3xl mb-10 hero-fade-up"
          style={{ color: "var(--mp-text)", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 900 }}>
          {renderTitleWords(heroTitle)}
        </h1>

        <div className="flex flex-wrap gap-2.5 mb-12 hero-fade-up">
          <span className="mp-pill" style={{ background: "color-mix(in srgb, var(--mp-water) 30%, var(--mp-land))", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>
            {t("hero_subtitle", "Destinasi Pilihan")}
          </span>
          <span className="mp-pill" style={{ background: "color-mix(in srgb, var(--mp-water) 30%, var(--mp-land))", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>
            Paket Lengkap
          </span>
          <span className="mp-pill" style={{ background: "color-mix(in srgb, var(--mp-water) 30%, var(--mp-land))", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>
            Terpercaya
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/tours"
            className="mp-btn px-8 py-4 text-sm font-bold"
            style={{ background: "var(--mp-accent)", color: "#ffffff", borderColor: "var(--mp-border)" }}>
            {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
          </Link>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
              className="mp-btn px-8 py-4 text-sm font-bold"
              style={{ background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );

  /* ── PIXEL ART ── */
  if (theme === "pixel") return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-28 pb-20 px-4"
      style={{
        background: "var(--px-bg)",
        backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
        backgroundSize: "24px 24px",
      }}>
      {/* Floating pixel blocks */}
      <div className="absolute top-32 right-16 lg:right-36 w-8 h-8 px-float-1 pointer-events-none"
        style={{ background: "var(--px-red)", border: "2px solid var(--px-border)", boxShadow: "3px 3px 0 0 var(--px-shadow)", opacity: 0.7 }} />
      <div className="absolute top-56 right-[30%] w-5 h-5 px-float-2 pointer-events-none"
        style={{ background: "var(--px-yellow)", border: "2px solid var(--px-border)", boxShadow: "2px 2px 0 0 var(--px-shadow)", opacity: 0.65 }} />
      <div className="absolute bottom-24 left-16 lg:left-32 w-6 h-6 px-float-3 pointer-events-none"
        style={{ background: "var(--px-cyan)", border: "2px solid var(--px-border)", boxShadow: "2px 2px 0 0 var(--px-shadow)", opacity: 0.6 }} />
      <div className="absolute top-44 left-[42%] w-4 h-4 px-float-4 pointer-events-none"
        style={{ background: "var(--px-purple)", border: "2px solid var(--px-border)", boxShadow: "2px 2px 0 0 var(--px-shadow)", opacity: 0.55 }} />
      <div className="absolute bottom-40 right-[20%] w-7 h-7 px-float-2 pointer-events-none"
        style={{ background: "var(--px-green)", border: "2px solid var(--px-border)", boxShadow: "2px 2px 0 0 var(--px-shadow)", opacity: 0.6, animationDelay: "1s" }} />
      <div className="absolute top-28 left-8 w-4 h-4 px-float-3 pointer-events-none"
        style={{ background: "var(--px-red)", border: "2px solid var(--px-border)", boxShadow: "2px 2px 0 0 var(--px-shadow)", opacity: 0.45, animationDelay: "0.8s" }} />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-8 hero-fade-up">
          <span className="px-pill" style={{ background: "var(--px-yellow)", color: "var(--px-on-yellow)" }}>
            ► {eyebrow}
          </span>
        </div>

        <h1 aria-label={heroTitle} className="text-[clamp(2.8rem,8vw,7rem)] font-black leading-[0.92] tracking-tight max-w-4xl mb-10 hero-fade-up"
          style={{ color: "var(--px-text)", fontFamily: "monospace" }}>
          {renderTitleWords(heroTitle)}
        </h1>

        <div className="flex flex-wrap gap-3 mb-12 hero-fade-up">
          <span className="px-pill" style={{ background: "var(--px-cyan)", color: "var(--px-on-cyan)" }}>
            [MAP] {t("hero_subtitle", "Destinasi Pilihan")}
          </span>
          <span className="px-pill" style={{ background: "var(--px-purple)", color: "#ffffff" }}>
            [PKG] Paket Lengkap
          </span>
          <span className="px-pill" style={{ background: "var(--px-green)", color: "#111827" }}>
            [★★★] Terpercaya
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/tours"
            className="px-btn px-8 py-4 text-sm"
            style={{ background: "var(--site-accent)", color: "#ffffff" }}>
            {t("hero_btn", "LIHAT TOUR")} ►
          </Link>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
              className="px-btn px-8 py-4 text-sm"
              style={{ background: "var(--px-card)", color: "var(--px-text)" }}>
              [WA] CHAT KAMI
            </a>
          )}
        </div>
      </div>
    </section>
  );

  /* ── ATLAS ── */
  if (theme === "atlas") return (
    <section className="lg:min-h-screen flex flex-col justify-center relative overflow-hidden pt-20 lg:pt-24 pb-7 lg:pb-16 px-4 at-grid-bg"
      style={{ backgroundColor: "var(--at-bg)" }}>
      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Desktop: dua kolom (judul kiri, aksi di samping). Mobile: tumpuk rapat. */}
        <div className="lg:flex lg:items-end lg:gap-12">
          {/* Kiri — eyebrow + judul */}
          <div className="flex-1 min-w-0">
            <div className="mb-3 hero-fade-up">
              <span className="at-pill" style={{ color: "var(--at-text)" }}>
                {eyebrow}
              </span>
            </div>
            <h1 aria-label={heroTitle} className="text-[clamp(2.05rem,9.5vw,6rem)] font-bold leading-[1.02] max-w-4xl mb-5 lg:mb-0 hero-fade-up"
              style={{ color: "var(--at-text)" }}>
              {renderTitleWords(heroTitle)}
            </h1>
            <div className="mb-5 grid gap-2 lg:hidden">
              {[
                ["Seat & jadwal", "Trip aktif, kuota terbatas"],
                ["Visa & itinerary", "Dibantu dari awal"],
                ["Konsultasi", "Chat langsung tim Sundaf"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 border-b py-2 text-sm" style={{ borderColor: "var(--at-border)" }}>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase" style={{ color: "var(--at-subtext)" }}>{label}</p>
                    <p className="truncate text-[13px] font-semibold" style={{ color: "var(--at-text)" }}>{value}</p>
                  </div>
                  <CheckCircle2 size={16} className="shrink-0" style={{ color: "var(--site-accent)" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Kanan — tombol aksi di samping hero + trust badge */}
          <div className="lg:w-[300px] shrink-0 flex flex-col gap-2.5 hero-fade-up">
            <Link href="/tours"
              className="at-btn-solid w-full px-6 py-3.5 text-sm">
              {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
            </Link>
            <Link href="/visa"
              className="at-btn-solid w-full px-6 py-3.5 text-sm">
              Servis Visa <ArrowRight size={15} />
            </Link>
            {waNumber && (
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
                className="at-btn w-full px-6 py-3.5 text-sm">
                WhatsApp
              </a>
            )}
            <p className="text-[12px] leading-relaxed mt-1 opacity-80"
              style={{ color: "var(--at-subtext)" }}>
              {t("hero_subtitle", "Destinasi pilihan, paket lengkap & terpercaya.")}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="at-pill" style={{ color: "var(--at-subtext)" }}>
                Paket Lengkap
              </span>
              <span className="at-pill" style={{ color: "var(--at-subtext)" }}>
                Terpercaya
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  /* ── CLASSIC ── */
  return (
    <section className="min-h-screen flex flex-col justify-end pb-20 lg:pb-28 pt-32 overflow-hidden"
      style={{ background: "var(--site-bg, #ffffff)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full hero-fade-up">
        <p className="text-xs font-medium tracking-[0.2em] uppercase mb-8"
          style={{ color: "var(--site-eyebrow,#6b7280)" }}>
          {eyebrow}
        </p>
        <h1 aria-label={heroTitle} className="text-[clamp(2.8rem,8vw,7rem)] font-bold leading-[1.0] tracking-tight max-w-4xl mb-10"
          style={{ color: "var(--site-hero,#0d2018)" }}>
          {renderTitleWords(heroTitle)}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-8 border-t border-gray-100 dark:border-gray-900">
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
            {t("hero_subtitle", "Paket wisata terpercaya dengan pelayanan terbaik.")}
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/tours"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90"
              style={{ background: "var(--site-accent,#2d6a4f)" }}>
              {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
            </Link>
            {waNumber && (
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors underline underline-offset-4">
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
