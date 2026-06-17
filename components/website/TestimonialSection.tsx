"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, X } from "lucide-react";
import AnimateIn from "./AnimateIn";
import ExpandableQuote from "./ExpandableQuote";
import { cldOptimize } from "@/lib/utils";

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
  if (avatar) return <Image src={cldOptimize(avatar, 72)} alt={name} width={36} height={36} sizes="36px" className="w-9 h-9 rounded-sm object-cover shrink-0" />;
  return (
    <div className="w-9 h-9 rounded-sm flex items-center justify-center font-bold text-xs shrink-0 text-white"
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
  const cardWidth = "min(82vw, 21rem)";

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
      {/* Track, square cards with a clear peek of the next testimonial. */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none", paddingLeft: 24, paddingRight: 24 }}
      >
        {items.map((item, i) => (
          <div key={item.id} className="shrink-0 aspect-square" style={{ scrollSnapAlign: "start", width: cardWidth }}>
            {renderCard(item, i === current)}
          </div>
        ))}
        {/* right spacer so last card can snap to start */}
        <div className="shrink-0" style={{ width: `max(24px, calc(100% - ${cardWidth} - 24px))` }} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6 px-6 gap-4">
        {/* Dots, untuk banyak item tampilkan counter saja (ringkas) */}
        {items.length > 10 ? (
          <div className={`text-xs font-medium tabular-nums ${darkDots ? "text-white/70" : "text-gray-500 dark:text-gray-400"}`}>
            {current + 1} / {items.length}
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap max-w-[60%]">
            {items.map((_, i) => (
              <button key={i} onClick={() => scrollToIndex(i)}
                aria-label={`Buka testimoni ke-${i + 1}`}
                type="button"
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? `w-6 ${darkDots ? "bg-white" : "bg-gray-900 dark:bg-white"}`
                    : `w-2 ${darkDots ? "bg-white/30" : "bg-gray-300 dark:bg-gray-700"}`
                }`}
              />
            ))}
          </div>
        )}

        {/* Prev / Next */}
        <div className="flex gap-2">
          <button onClick={prev} disabled={current === 0} type="button" aria-label="Testimoni sebelumnya"
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all disabled:opacity-30 ${
              darkDots
                ? "border-white/30 text-white hover:bg-white/10"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}>
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button onClick={next} disabled={current === items.length - 1} type="button" aria-label="Testimoni berikutnya"
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all disabled:opacity-30 ${
              darkDots
                ? "border-white/30 text-white hover:bg-white/10"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

function testimonialDialogId(id: string) {
  return `testimonial-dialog-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function TestimonialDialogs({ items }: { items: Testimonial[] }) {
  return (
    <>
      {items.map((item) => {
        const id = testimonialDialogId(item.id);
        return (
          <div key={item.id} className="contents">
            <input id={id} type="checkbox" className="peer sr-only" aria-hidden="true" />
            <label
              htmlFor={id}
              aria-label="Tutup testimoni"
              className="fixed inset-0 z-[220] hidden bg-black/70 peer-checked:block"
            />
            <div className="pointer-events-none fixed inset-0 z-[221] hidden items-end justify-center px-4 py-4 peer-checked:flex sm:items-center">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${id}-title`}
                className="pointer-events-auto w-full max-w-xl max-h-[86vh] overflow-y-auto rounded-t-2xl border border-white/15 bg-white p-5 shadow-2xl dark:bg-[#242D67] sm:rounded-2xl sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Stars rating={item.rating} />
                    <h3 id={`${id}-title`} className="mt-4 text-lg font-semibold leading-tight text-gray-950 dark:text-white">
                      {item.name}
                    </h3>
                    {item.role && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-white/55">{item.role}</p>
                    )}
                  </div>
                  <label
                    htmlFor={id}
                    aria-label="Tutup testimoni"
                    className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 dark:border-white/15 dark:text-white/70 dark:hover:bg-white/10"
                  >
                    <X size={16} aria-hidden="true" />
                  </label>
                </div>

                <p className="mt-5 whitespace-pre-line text-[15px] leading-7 text-gray-700 dark:text-white/75">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function MobileDenseTestimonials({ items }: { items: Testimonial[] }) {
  return (
    <section className="sm:hidden overflow-hidden at-grid-bg py-8" style={{ backgroundColor: "var(--at-bg)" }}>
      <div className="px-4">
        <span className="at-pill mb-3 inline-flex" style={{ color: "var(--at-subtext)" }}>Testimoni</span>
        <h2 className="text-xl font-bold leading-tight" style={{ color: "var(--at-text)" }}>Kata traveler Sundaf</h2>
        <div className="mt-4 space-y-2">
          {items.slice(0, 8).map((item) => {
            const dialogId = testimonialDialogId(item.id);
            return (
              <article key={item.id} className="at-card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar avatar={item.avatar} name={item.name} />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold leading-tight" style={{ color: "var(--at-text)" }}>{item.name}</p>
                      {item.role && <p className="truncate text-[10px] leading-tight" style={{ color: "var(--at-subtext)" }}>{item.role}</p>}
                    </div>
                  </div>
                  <Stars rating={item.rating} />
                </div>
                <p className="mt-2 line-clamp-4 text-[12px] leading-snug" style={{ color: "var(--at-subtext)" }}>
                  &ldquo;{item.content}&rdquo;
                </p>
                {item.content.length > 150 && (
                  <label
                    htmlFor={dialogId}
                    className="mt-2 inline-flex cursor-pointer text-[10px] font-semibold uppercase"
                    style={{ color: "var(--site-accent)" }}
                  >
                    Baca penuh
                  </label>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Main section ─── */
export default function TestimonialSection({ items, theme = "classic" }: Props) {
  if (items.length === 0) return null;

  const cardShell = "h-full min-h-0 overflow-hidden";
  const quotePreviewProps = (item: Testimonial) => ({
    clampClassName: "line-clamp-5",
    allowExpand: true,
    toggleThreshold: 130,
    dialogControlId: testimonialDialogId(item.id),
  });
  const withDialogs = (section: React.ReactNode) => (
    <>
      {section}
      <TestimonialDialogs items={items} />
    </>
  );

  /* ── FUMAYO ── */
  if (theme === "fumayo") return withDialogs(
    <section className="fb-page py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-10">
          <span className="fb-pill mb-3 inline-flex" style={{ background: "var(--fb-yellow)", color: "#1a1a1a" }}>★ Testimoni</span>
          <h2 className="text-3xl lg:text-5xl font-bold mt-3" style={{ color: "var(--fb-ink)", fontFamily: "var(--fb-font)" }}>
            Kata <span className="fb-wave" style={{ color: "var(--fb-accent)" }}>Mereka</span>
          </h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`fb-card p-6 flex flex-col ${cardShell} transition-all duration-200 ${active ? "" : "opacity-70"}`}
              style={{ background: active ? "var(--fb-paper)" : "var(--fb-card)", fontFamily: "var(--fb-font)" }}>
              <Stars rating={item.rating} />
              <ExpandableQuote text={item.content} color={"var(--fb-subink)"} {...quotePreviewProps(item)} />
              <div className="flex items-center gap-2.5 mt-4 pt-3" style={{ borderTop: "2px dashed var(--fb-line)" }}>
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className="text-[13px] leading-tight font-bold" style={{ color: "var(--fb-ink)" }}>{item.name}</p>
                  {item.role && <p className="text-[11px] leading-tight mt-0.5" style={{ color: "var(--fb-subink)" }}>{item.role}</p>}
                </div>
              </div>
            </div>
          )} />
        </AnimateIn>
      </div>
    </section>
  );

  /* ── GLOBE ── */
  if (theme === "teri") return withDialogs(
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-10 text-center">
          <span className="teri-pill mb-3 inline-flex">✦ Testimoni</span>
          <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--teri-ink)" }}>Kata Mereka</h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`teri-card p-6 flex flex-col ${cardShell} transition-all duration-300 ${active ? "" : "opacity-60"}`}>
              <Stars rating={item.rating} />
              <ExpandableQuote text={item.content} color={"var(--teri-sub)"} {...quotePreviewProps(item)} />
              <div className="flex items-center gap-2.5 mt-4 pt-3 border-t-[2.5px] border-dashed" style={{ borderColor: "var(--teri-line)" }}>
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className="text-[13px] leading-tight font-extrabold" style={{ color: "var(--teri-ink)" }}>{item.name}</p>
                  {item.role && <p className="text-[11px] leading-tight mt-0.5 text-gray-400">{item.role}</p>}
                </div>
              </div>
            </div>
          )} />
        </AnimateIn>
      </div>
    </section>
  );

  if (theme === "globe") return withDialogs(
    <section className="py-24 overflow-hidden" style={{ background: "var(--gl-bg)" }}>
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-10">
          <span className="gl-pill mb-3 inline-flex" style={{ background: "var(--gl-lavender)", color: "var(--gl-on-lavender)", borderColor: "transparent" }}>🌍 Testimoni</span>
          <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--gl-text)" }}>Kata Mereka</h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`gl-card p-6 flex flex-col ${cardShell} transition-all duration-300 ${active ? "" : "opacity-70"}`}
              style={{ background: active ? "#fef9c3" : "var(--gl-card)" }}>
              <Stars rating={item.rating} />
              <ExpandableQuote text={item.content} color={active ? "#1a2a3a" : "var(--gl-subtext)"} {...quotePreviewProps(item)} />
              <div className="flex items-center gap-2.5 mt-4 pt-3 border-t"
                style={{ borderColor: "color-mix(in srgb, var(--gl-border) 25%, transparent)" }}>
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className="text-[13px] leading-tight font-black" style={{ color: active ? "#1a2a3a" : "var(--gl-text)" }}>{item.name}</p>
                  {item.role && <p className="text-[11px] leading-tight mt-0.5" style={{ color: active ? "#5a7a9a" : "var(--gl-subtext)" }}>{item.role}</p>}
                </div>
              </div>
            </div>
          )} />
        </AnimateIn>
      </div>
    </section>
  );

  /* ── ATLAS ── */
  if (theme === "atlas") return withDialogs(
    <>
      <MobileDenseTestimonials items={items} />
      <section className="hidden sm:block py-14 overflow-hidden at-grid-bg" style={{ backgroundColor: "var(--at-bg)" }}>
        <div className="max-w-7xl mx-auto">
          <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-7">
            <span className="at-pill mb-3 inline-flex" style={{ color: "var(--at-subtext)" }}>Testimoni</span>
            <h2 className="text-3xl lg:text-5xl font-bold mt-3" style={{ color: "var(--at-text)" }}>Kata Mereka</h2>
          </AnimateIn>
          <AnimateIn delay={100}>
            <Carousel items={items} renderCard={(item, active) => (
              <div className={`at-card p-6 flex flex-col ${cardShell} transition-all duration-300 ${active ? "" : "opacity-60"}`}>
                <Stars rating={item.rating} />
                <ExpandableQuote text={item.content} color={"var(--at-subtext)"} {...quotePreviewProps(item)} />
                <div className="flex items-center gap-2.5 mt-4 pt-3 border-t"
                  style={{ borderColor: "var(--at-border)" }}>
                  <Avatar avatar={item.avatar} name={item.name} />
                  <div>
                    <p className="text-[13px] leading-tight font-semibold" style={{ color: "var(--at-text)" }}>{item.name}</p>
                    {item.role && <p className="text-[11px] leading-tight mt-0.5" style={{ color: "var(--at-subtext)" }}>{item.role}</p>}
                  </div>
                </div>
              </div>
            )} />
          </AnimateIn>
        </div>
      </section>
    </>
  );

  /* ── MAP / ATLAS ── */
  if (theme === "map") return withDialogs(
    <section className="py-24 overflow-hidden relative"
      style={{ background: "var(--mp-bg)", backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }}>
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-10">
          <span className="mp-pill mb-3 inline-flex" style={{ background: "var(--mp-navy)", color: "var(--mp-on-ink)", borderColor: "var(--mp-border)" }}>Testimoni</span>
          <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--mp-text)", fontFamily: "Georgia,'Times New Roman',serif" }}>Kata Mereka</h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`mp-card p-6 flex flex-col ${cardShell} transition-all duration-300 ${active ? "" : "opacity-70"}`}
              style={{ background: active ? "var(--mp-land)" : "var(--mp-card)" }}>
              <Stars rating={item.rating} />
              <ExpandableQuote text={item.content} color={active ? "var(--mp-text)" : "var(--mp-subtext)"} {...quotePreviewProps(item)} />
              <div className="flex items-center gap-2.5 mt-4 pt-3 border-t-2"
                style={{ borderColor: "var(--mp-border)" }}>
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className="text-[13px] leading-tight font-black" style={{ color: active ? "var(--mp-text)" : "var(--mp-text)" }}>{item.name}</p>
                  {item.role && <p className="text-[11px] leading-tight mt-0.5" style={{ color: active ? "var(--mp-text)" : "var(--mp-subtext)", opacity: 0.8 }}>{item.role}</p>}
                </div>
              </div>
            </div>
          )} />
        </AnimateIn>
      </div>
    </section>
  );

  /* ── PIXEL ── */
  if (theme === "pixel") return withDialogs(
    <section className="py-14 sm:py-20 lg:py-24 overflow-hidden relative" style={{
      background: "var(--px-bg)",
      backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
      backgroundSize: "24px 24px",
    }}>
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-7 sm:mb-10">
          <span className="px-pill mb-3 inline-flex" style={{ background: "var(--px-cyan)", color: "var(--px-on-cyan)" }}>► TESTIMONI</span>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black mt-2 sm:mt-3" style={{ color: "var(--px-text)", fontFamily: "monospace" }}>KATA MEREKA</h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`px-card p-4 sm:p-6 flex flex-col ${cardShell} transition-all duration-100 ${active ? "" : "opacity-70"}`}
              style={{ background: active ? "var(--px-yellow)" : "var(--px-card)" }}>
              <Stars rating={item.rating} />
              <ExpandableQuote text={item.content} color="var(--px-text)" {...quotePreviewProps(item)} />
              <div className="flex items-center gap-2.5 mt-4 pt-3 border-t-2"
                style={{ borderColor: "var(--px-border)" }}>
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className="text-[13px] leading-tight font-black" style={{ color: "var(--px-text)", fontFamily: "monospace" }}>{item.name}</p>
                  {item.role && <p className="text-[11px] leading-tight mt-0.5" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>{item.role}</p>}
                </div>
              </div>
            </div>
          )} />
        </AnimateIn>
      </div>
    </section>
  );

  /* ── KAWAII ── */
  if (theme === "kawaii") return withDialogs(
    <section className="py-24 overflow-hidden" style={{ background: "var(--kw-bg)" }}>
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-10">
          <span className="kw-pill mb-3 inline-flex" style={{ background: "var(--kw-blush)", color: "var(--kw-text)" }}>♡ Testimoni</span>
          <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--kw-text)" }}>Kata Mereka</h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`kw-card p-6 flex flex-col ${cardShell} transition-all duration-300 ${active ? "" : "opacity-70"}`}
              style={{ background: active ? "var(--kw-peach)" : "var(--kw-card)" }}>
              <Stars rating={item.rating} />
              <ExpandableQuote text={item.content} color={"var(--kw-subtext)"} {...quotePreviewProps(item)} />
              <div className="flex items-center gap-2.5 mt-4 pt-3 border-t-2 border-dashed"
                style={{ borderColor: "var(--kw-border)" }}>
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className="text-[13px] leading-tight font-black" style={{ color: "var(--kw-text)" }}>{item.name}</p>
                  {item.role && <p className="text-[11px] leading-tight mt-0.5" style={{ color: "var(--kw-subtext)" }}>{item.role}</p>}
                </div>
              </div>
            </div>
          )} />
        </AnimateIn>
      </div>
    </section>
  );

  /* ── TROPICAL ── */
  if (theme === "tropical") return withDialogs(
    <section className="py-24 overflow-hidden" style={{ background: "var(--tr-bg)" }}>
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-10">
          <span className="tr-pill mb-3 inline-flex" style={{ background: "var(--tr-pink)", color: "var(--tr-text)" }}>💬 Testimoni</span>
          <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--tr-text)" }}>Kata Mereka</h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`tr-card p-6 flex flex-col ${cardShell} transition-all duration-300 ${active ? "" : "opacity-70"}`}
              style={{ background: active ? "var(--tr-mint)" : "var(--tr-card)" }}>
              <Stars rating={item.rating} />
              <ExpandableQuote text={item.content} color={"var(--tr-subtext)"} {...quotePreviewProps(item)} />
              <div className="flex items-center gap-2.5 mt-4 pt-3 border-t-2 border-dashed"
                style={{ borderColor: "var(--tr-border)" }}>
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className="text-[13px] leading-tight font-black" style={{ color: "var(--tr-text)" }}>{item.name}</p>
                  {item.role && <p className="text-[11px] leading-tight mt-0.5 text-gray-400">{item.role}</p>}
                </div>
              </div>
            </div>
          )} />
        </AnimateIn>
      </div>
    </section>
  );

  /* ── CLASSIC ── */
  return withDialogs(
    <section className="py-24 overflow-hidden bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <AnimateIn className="px-4 sm:px-6 lg:px-8 mb-10">
          <p className="text-xs tracking-[0.15em] uppercase text-gray-400 mb-3">Testimoni</p>
          <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: "var(--site-heading,#111827)" }}>
            Kata Mereka
          </h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <Carousel items={items} renderCard={(item, active) => (
            <div className={`bg-gray-50 dark:bg-gray-950 rounded-2xl p-6 border transition-all duration-300 flex flex-col ${cardShell} ${
              active ? "border-gray-300 dark:border-gray-700 shadow-md" : "border-gray-100 dark:border-gray-900"
            }`}>
              <Stars rating={item.rating} />
              <ExpandableQuote text={item.content} color={undefined} {...quotePreviewProps(item)} />
              <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-gray-100 dark:border-gray-900">
                <Avatar avatar={item.avatar} name={item.name} />
                <div>
                  <p className="text-[13px] leading-tight font-semibold text-gray-900 dark:text-white">{item.name}</p>
                  {item.role && <p className="text-[11px] leading-tight mt-0.5 text-gray-400">{item.role}</p>}
                </div>
              </div>
            </div>
          )} />
        </AnimateIn>
      </div>
    </section>
  );

}
