"use client";

import { useEffect, useRef } from "react";

/* Watermark logo melayang untuk tema Jojo — banyak salinan logo tipis,
   ukuran beragam, berputar, memantul dinding & bertabrakan elastis
   (fisika tumbukan massa-setara) lalu sedikit terpelintir saat tabrakan. */

const SIZES = [56, 134, 82, 168, 64, 110, 146, 74, 98, 122, 60, 152];

export default function JojoWatermark({ logo }: { logo?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const els = Array.from(wrap.querySelectorAll<HTMLImageElement>("img"));
    if (els.length === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = window.innerWidth, h = window.innerHeight;

    const items = els.map((el) => {
      const r = (el.offsetWidth || 80) / 2;
      return {
        el, r,
        x: Math.random() * Math.max(1, w - 2 * r) + r,
        y: Math.random() * Math.max(1, h - 2 * r) + r,
        vx: (Math.random() - 0.5) * 0.85,
        vy: (Math.random() - 0.5) * 0.85,
        ang: Math.random() * 360,
        av: (Math.random() - 0.5) * 0.45,
      };
    });

    const paint = () => {
      for (const p of items) {
        p.el.style.transform = `translate(${p.x - p.r}px, ${p.y - p.r}px) rotate(${p.ang}deg)`;
      }
    };

    if (reduce) { paint(); return; }

    let raf = 0;
    const frame = () => {
      /* integrasi gerak + pantulan dinding */
      for (const p of items) {
        p.x += p.vx; p.y += p.vy; p.ang += p.av;
        if (p.x - p.r < 0) { p.x = p.r;     p.vx =  Math.abs(p.vx); p.av += 0.22; }
        if (p.x + p.r > w) { p.x = w - p.r; p.vx = -Math.abs(p.vx); p.av -= 0.22; }
        if (p.y - p.r < 0) { p.y = p.r;     p.vy =  Math.abs(p.vy); p.av += 0.22; }
        if (p.y + p.r > h) { p.y = h - p.r; p.vy = -Math.abs(p.vy); p.av -= 0.22; }
      }
      /* tabrakan antar-logo — elastis, pisahkan tumpang-tindih + pelintir */
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i], b = items[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 0.001;
          const min = a.r + b.r;
          if (d < min) {
            const nx = dx / d, ny = dy / d;
            const overlap = (min - d) / 2;
            a.x -= nx * overlap; a.y -= ny * overlap;
            b.x += nx * overlap; b.y += ny * overlap;
            const dot = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (dot < 0) {
              a.vx += dot * nx; a.vy += dot * ny;
              b.vx -= dot * nx; b.vy -= dot * ny;
              a.av += dot * 0.5; b.av -= dot * 0.5;
            }
          }
        }
      }
      /* redam putaran + batasi laju agar tetap kalem */
      for (const p of items) {
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 1.2) { p.vx = (p.vx / sp) * 1.2; p.vy = (p.vy / sp) * 1.2; }
        p.av *= 0.985;
      }
      paint();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onResize = () => {
      w = window.innerWidth; h = window.innerHeight;
      for (const p of items) {
        p.x = Math.min(Math.max(p.r, p.x), w - p.r);
        p.y = Math.min(Math.max(p.r, p.y), h - p.r);
      }
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, [logo]);

  if (!logo) return null;

  return (
    <div ref={wrapRef} aria-hidden
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0, background: "var(--jo-bg)" }}>
      {SIZES.map((s, i) => (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img key={i} src={logo} alt="" width={s} height={s}
          className="absolute top-0 left-0 select-none"
          style={{ width: s, height: s, opacity: 0.06, willChange: "transform" }} />
      ))}
    </div>
  );
}
