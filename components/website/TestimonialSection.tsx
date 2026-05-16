"use client";

import { useRef, useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import AnimateIn from "./AnimateIn";

interface Testimonial {
  id: string; name: string; role: string | null;
  content: string; rating: number; avatar: string | null;
}

interface Props {
  items: Testimonial[];
  theme?: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className={i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-gray-700"} />
      ))}
    </div>
  );
}

function Avatar({ avatar, name }: { avatar: string | null; name: string }) {
  if (avatar) return <img src={avatar} alt={name} className="w-11 h-11 rounded-full object-cover shrink-0" />;
  return (
    <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white"
      style={{ background: "var(--site-accent,#2d6a4f)" }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

/* ─── Carousel core ─── */
function Carousel({ items, renderCard, darkDots = false }: {
  items: Testimonial[];
  renderCard: (item: Testimonial, active: boolean) => React.ReactNode;
  darkDots?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[index] as HTMLElement;
    if (!card) return;
    track.scrollTo({ left: card.offsetLeft - 24, behavior: "smooth" });
  }

  function prev() { scrollToIndex(Math.max(0, current - 1)); }
  function next() { scrollToIndex(Math.min(items.length - 1, current + 1)); }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const handler = () => {
      const cards = Array.from(track.children) as HTMLElement[];
      let closest = 0;
      let minDist = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - track.scrollLeft - 24);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      setCurrent(closest);
    };
    track.addEventListener("scroll", handler, { passive: true });
    return () => track.removeEventListener("scroll", handler);
  }, []);

  return (
    <div>
      {/* Track — 75% card width + 25% peek */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none", paddingLeft: 24, paddingRight: 24 }}
      >
        {items.map((item, i) => (
          <div key={item.id} className="shrink-0" style={{ scrollSnapAlign: "start", width: "75%" }}>
            {renderCard(item, i === current)}
          </div>
        ))}
        {/* right spacer so last card can snap to start */}
        <div className="shrink-0" style={{ width: "calc(25% - 40px)" }} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6 px-6">
        {/* Dots */}
        <div className="flex gap-2">
          {items.map((_, i) => (
            <button key={i} onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? `w-6 ${darkDots ? "bg-white" : "bg-gray-900 dark:bg-white"}`
                  : `w-2 ${darkDots ? "bg-white/30" : "bg-gray-300 dark:bg-gray-700"}`
              }`}
            />
          ))}
        </div>

        {/* Prev / Next */}
        <div className="flex gap-2">
          <button onClick={prev} disabled={current === 0}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all disabled:opacity-30 ${
              darkDots
                ? "border-white/30 text-white hover:bg-white/10"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={next} disabled={current === items.length - 1}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all disabled:opacity-30 ${
              darkDots
                ? "border-white/30 text-white hover:bg-white/10"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main section ─── */
export default function TestimonialSection({ items, theme = "classic" }: Props) {
  if (items.length === 0) return null;

  /* ── GLOBE ── */
  if (theme === "globe") return (
    <section className="py-24 overflow-hidden" style={{ background: "var(--gl-bg)" }}>
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-10">
          <span className="gl-pill mb-3 inline-flex" style={{ background: "var(--gl-lavender)", color: "var(--gl-on-lavender)", borderColor: "transparent" }}>🌍 Testimoni</span>
          <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--gl-text)" }}>Kata Mereka</h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`gl-card p-6 flex flex-col h-full transition-all duration-300 ${active ? "" : "opacity-70"}`}
              style={{ background: active ? "#fef9c3" : "var(--gl-card)" }}>
              <Stars rating={item.rating} />
              <p className="text-sm leading-relaxed mt-4 flex-1" style={{ color: active ? "#1a2a3a" : "var(--gl-subtext)" }}>
                &ldquo;{item.content}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t"
                style={{ borderColor: "color-mix(in srgb, var(--gl-border) 25%, transparent)" }}>
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className="text-sm font-black" style={{ color: active ? "#1a2a3a" : "var(--gl-text)" }}>{item.name}</p>
                  {item.role && <p className="text-xs" style={{ color: active ? "#5a7a9a" : "var(--gl-subtext)" }}>{item.role}</p>}
                </div>
              </div>
            </div>
          )} />
        </AnimateIn>
      </div>
    </section>
  );

  /* ── ATLAS ── */
  if (theme === "atlas") return (
    <section className="py-24 overflow-hidden at-grid-bg" style={{ backgroundColor: "var(--at-bg)" }}>
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-10">
          <span className="at-pill mb-3 inline-flex" style={{ color: "var(--at-subtext)" }}>Testimoni</span>
          <h2 className="text-3xl lg:text-5xl font-bold mt-3" style={{ color: "var(--at-text)" }}>Kata Mereka</h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`at-card p-6 flex flex-col h-full transition-all duration-300 ${active ? "" : "opacity-60"}`}>
              <Stars rating={item.rating} />
              <p className="text-sm leading-relaxed mt-4 flex-1" style={{ color: "var(--at-subtext)" }}>
                &ldquo;{item.content}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t"
                style={{ borderColor: "var(--at-border)" }}>
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--at-text)" }}>{item.name}</p>
                  {item.role && <p className="text-xs" style={{ color: "var(--at-subtext)" }}>{item.role}</p>}
                </div>
              </div>
            </div>
          )} />
        </AnimateIn>
      </div>
    </section>
  );

  /* ── MAP / ATLAS ── */
  if (theme === "map") return (
    <section className="py-24 overflow-hidden relative"
      style={{ background: "var(--mp-bg)", backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }}>
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-10">
          <span className="mp-pill mb-3 inline-flex" style={{ background: "var(--mp-navy)", color: "var(--mp-on-ink)", borderColor: "var(--mp-border)" }}>Testimoni</span>
          <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--mp-text)", fontFamily: "Georgia,'Times New Roman',serif" }}>Kata Mereka</h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`mp-card p-6 flex flex-col h-full transition-all duration-300 ${active ? "" : "opacity-70"}`}
              style={{ background: active ? "var(--mp-land)" : "var(--mp-card)" }}>
              <Stars rating={item.rating} />
              <p className="text-sm leading-relaxed mt-4 flex-1" style={{ color: active ? "var(--mp-text)" : "var(--mp-subtext)" }}>
                &ldquo;{item.content}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t-2"
                style={{ borderColor: "var(--mp-border)" }}>
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className="text-sm font-black" style={{ color: active ? "var(--mp-text)" : "var(--mp-text)" }}>{item.name}</p>
                  {item.role && <p className="text-xs" style={{ color: active ? "var(--mp-text)" : "var(--mp-subtext)", opacity: 0.8 }}>{item.role}</p>}
                </div>
              </div>
            </div>
          )} />
        </AnimateIn>
      </div>
    </section>
  );

  /* ── PIXEL ── */
  if (theme === "pixel") return (
    <section className="py-24 overflow-hidden relative" style={{
      background: "var(--px-bg)",
      backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
      backgroundSize: "24px 24px",
    }}>
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-10">
          <span className="px-pill mb-3 inline-flex" style={{ background: "var(--px-cyan)", color: "var(--px-on-cyan)" }}>► TESTIMONI</span>
          <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--px-text)", fontFamily: "monospace" }}>KATA MEREKA</h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`px-card p-6 flex flex-col h-full transition-all duration-100 ${active ? "" : "opacity-70"}`}
              style={{ background: active ? "var(--px-yellow)" : "var(--px-card)" }}>
              <Stars rating={item.rating} />
              <p className="text-sm leading-relaxed mt-4 flex-1" style={{ color: "var(--px-text)", fontFamily: "monospace" }}>
                &ldquo;{item.content}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t-2"
                style={{ borderColor: "var(--px-border)" }}>
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className="text-sm font-black" style={{ color: "var(--px-text)", fontFamily: "monospace" }}>{item.name}</p>
                  {item.role && <p className="text-xs" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>{item.role}</p>}
                </div>
              </div>
            </div>
          )} />
        </AnimateIn>
      </div>
    </section>
  );

  /* ── KAWAII ── */
  if (theme === "kawaii") return (
    <section className="py-24 overflow-hidden" style={{ background: "var(--kw-bg)" }}>
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-10">
          <span className="kw-pill mb-3 inline-flex" style={{ background: "var(--kw-blush)", color: "var(--kw-text)" }}>♡ Testimoni</span>
          <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--kw-text)" }}>Kata Mereka</h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`kw-card p-6 flex flex-col h-full transition-all duration-300 ${active ? "" : "opacity-70"}`}
              style={{ background: active ? "var(--kw-peach)" : "var(--kw-card)" }}>
              <Stars rating={item.rating} />
              <p className="text-sm leading-relaxed mt-4 flex-1" style={{ color: "var(--kw-subtext)" }}>
                &ldquo;{item.content}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t-2 border-dashed"
                style={{ borderColor: "var(--kw-border)" }}>
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className="text-sm font-black" style={{ color: "var(--kw-text)" }}>{item.name}</p>
                  {item.role && <p className="text-xs" style={{ color: "var(--kw-subtext)" }}>{item.role}</p>}
                </div>
              </div>
            </div>
          )} />
        </AnimateIn>
      </div>
    </section>
  );

  /* ── TROPICAL ── */
  if (theme === "tropical") return (
    <section className="py-24 overflow-hidden" style={{ background: "var(--tr-bg)" }}>
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-10">
          <span className="tr-pill mb-3 inline-flex" style={{ background: "var(--tr-pink)", color: "var(--tr-text)" }}>💬 Testimoni</span>
          <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--tr-text)" }}>Kata Mereka</h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`tr-card p-6 flex flex-col h-full transition-all duration-300 ${active ? "" : "opacity-70"}`}
              style={{ background: active ? "var(--tr-mint)" : "var(--tr-card)" }}>
              <Stars rating={item.rating} />
              <p className="text-sm leading-relaxed mt-4 flex-1" style={{ color: "var(--tr-subtext)" }}>
                &ldquo;{item.content}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t-2 border-dashed"
                style={{ borderColor: "var(--tr-border)" }}>
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className="text-sm font-black" style={{ color: "var(--tr-text)" }}>{item.name}</p>
                  {item.role && <p className="text-xs text-gray-400">{item.role}</p>}
                </div>
              </div>
            </div>
          )} />
        </AnimateIn>
      </div>
    </section>
  );

  /* ── CLASSIC ── */
  if (theme === "classic" || theme === "atelier") return (
    <section className={`py-24 overflow-hidden ${theme === "atelier" ? "" : "bg-white dark:bg-black"}`}
      style={theme === "atelier" ? { background: "var(--atl-surface)" } : undefined}>
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-10">
          <p className="text-xs tracking-[0.15em] uppercase text-gray-400 mb-3">Testimoni</p>
          <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: "var(--site-heading,#111827)" }}>
            Kata Mereka
          </h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`bg-gray-50 dark:bg-gray-950 rounded-2xl p-6 border transition-all duration-300 h-full flex flex-col ${
              active ? "border-gray-300 dark:border-gray-700 shadow-md" : "border-gray-100 dark:border-gray-900"
            }`}>
              <Stars rating={item.rating} />
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-4 flex-1">
                &ldquo;{item.content}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-gray-900">
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                  {item.role && <p className="text-xs text-gray-400">{item.role}</p>}
                </div>
              </div>
            </div>
          )} />
        </AnimateIn>
      </div>
    </section>
  );

  /* ── CATALOG (vibrant) ── */
  if (theme === "vibrant") return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-gray-400 mb-2">Testimoni</p>
              <h2 className="text-3xl lg:text-4xl font-black" style={{ color: "var(--site-heading,#111827)" }}>
                Kata Mereka
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--site-accent,#2d6a4f)" }}>
                <Quote size={14} className="text-white" />
              </div>
              <span className="text-sm text-gray-400">{items.length} ulasan</span>
            </div>
          </div>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`rounded-3xl p-7 relative overflow-hidden transition-all duration-300 h-full flex flex-col ${
              active
                ? "shadow-2xl scale-[1.01]"
                : "opacity-80"
            }`} style={{ background: active ? "var(--site-accent,#2d6a4f)" : "white" }}>
              <Quote size={48} className={`absolute top-4 right-6 ${active ? "text-white/10" : "text-gray-100"}`} />
              <Stars rating={item.rating} />
              <p className={`text-sm leading-relaxed mt-4 flex-1 relative z-10 ${active ? "text-white font-medium" : "text-gray-600"}`}>
                &ldquo;{item.content}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-5 pt-5 border-t relative z-10" style={{ borderColor: active ? "rgba(255,255,255,0.2)" : "#f3f4f6" }}>
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className={`font-bold text-sm ${active ? "text-white" : "text-gray-900"}`}>{item.name}</p>
                  {item.role && <p className={`text-xs ${active ? "text-white/70" : "text-gray-400"}`}>{item.role}</p>}
                </div>
              </div>
            </div>
          )} />
        </AnimateIn>
      </div>
    </section>
  );

  /* ── BOLD ── */
  return (
    <section className="py-24 bg-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-10">
          <h2 className="text-3xl lg:text-5xl font-black text-white">Kata Mereka</h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`rounded-2xl p-6 transition-all duration-300 h-full flex flex-col ${
              active ? "bg-gray-800 border border-gray-700" : "bg-gray-900 border border-gray-800 opacity-70"
            }`} style={{ borderLeft: active ? `4px solid var(--site-accent,#2d6a4f)` : "4px solid transparent" }}>
              <Quote size={20} className="mb-3" style={{ color: "var(--site-accent,#2d6a4f)" }} />
              <p className="text-gray-300 text-sm leading-relaxed flex-1">
                {item.content}
              </p>
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-700">
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  {item.role && <p className="text-xs text-gray-500">{item.role}</p>}
                </div>
                <div className="ml-auto"><Stars rating={item.rating} /></div>
              </div>
            </div>
          )} darkDots />
        </AnimateIn>
      </div>
    </section>
  );
}
