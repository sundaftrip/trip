import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Users, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Tour {
  id: string; title: string; country: string; cityHighlight?: string | null;
  price: number; promoPrice?: number | null; seatsLeft: number;
  tripDate?: Date | null; duration?: string | null; heroImg?: string | null;
  badge?: string | null; status: string;
}

function StatusOverlay({ isFull, isExpired }: { isFull: boolean; isExpired: boolean }) {
  if (isFull) return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
      <span className="px-4 py-1.5 border border-white text-white text-xs font-semibold rounded-full tracking-widest uppercase">Sold Out</span>
    </div>
  );
  if (isExpired) return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
      <span className="px-4 py-1.5 border border-white text-white text-xs font-semibold rounded-full tracking-widest uppercase">Trip Selesai</span>
    </div>
  );
  return null;
}

function ClassicCard({ tour, isDimmed }: { tour: Tour; isDimmed: boolean }) {
  return (
    <div className={`group block bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-2xl overflow-hidden transition-all duration-300 ${isDimmed ? "grayscale opacity-60 cursor-default" : "hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-1 hover:shadow-lg"}`}>
      <div className="relative h-52 bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {tour.heroImg
          ? <Image src={tour.heroImg} alt={tour.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="flex items-center justify-center h-full text-gray-300 dark:text-gray-700"><MapPin size={28} /></div>}
        {tour.badge && !isDimmed && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-white text-[11px] font-semibold rounded-full" style={{ background: "var(--site-accent,#2d6a4f)" }}>
            {tour.badge}
          </span>
        )}
        <StatusOverlay isFull={tour.status === "FULL"} isExpired={!!tour.tripDate && new Date(tour.tripDate) < new Date()} />
      </div>
      <div className="p-5">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">{tour.country}</p>
        <h3 className="font-semibold mb-3 line-clamp-2 leading-snug text-[15px]" style={{ color: "var(--site-tour-title,#111827)" }}>{tour.title}</h3>
        <div className="flex flex-wrap gap-3 text-[11px] text-gray-400 mb-4">
          {tour.duration && <span className="flex items-center gap-1"><Clock size={10} /> {tour.duration}</span>}
          {tour.tripDate && <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(tour.tripDate, "id-ID")}</span>}
          <span className="flex items-center gap-1"><Users size={10} /> {tour.seatsLeft} seat</span>
        </div>
        <div className="flex items-end justify-between pt-4 border-t border-gray-100 dark:border-gray-900">
          <div>
            {tour.promoPrice && <p className="text-[11px] text-gray-400 line-through">{formatCurrency(tour.price)}</p>}
            <p className="text-base font-bold" style={{ color: "var(--site-accent,#2d6a4f)" }}>{formatCurrency(tour.promoPrice ?? tour.price)}</p>
          </div>
          {!isDimmed && <span className="text-[11px] font-semibold text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Lihat Detail →</span>}
        </div>
      </div>
    </div>
  );
}

/* ─── Tropical card ─── */
const STICKER_PALETTES = [
  "#d1fae5", "#dbeafe", "#fef3c7", "#fce7f3", "#ede9fe", "#fed7aa", "#cffafe",
];
function hashColor(str: string, offset = 0) {
  let h = offset * 31;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return STICKER_PALETTES[Math.abs(h) % STICKER_PALETTES.length];
}

function TropicalCard({ tour, isDimmed }: { tour: Tour; isDimmed: boolean }) {
  const priceColor = hashColor(tour.id, 0);
  const badgeColor = hashColor(tour.id, 3);
  const isFull = tour.status === "FULL";
  const isExpired = !!tour.tripDate && new Date(tour.tripDate) < new Date();

  return (
    <div className={`tr-card group overflow-hidden ${isDimmed ? "opacity-60 grayscale cursor-default" : ""}`}>
      <div className="relative h-52 overflow-hidden rounded-t-[18px] border-b-2"
        style={{ borderColor: "var(--tr-border)" }}>
        {tour.heroImg
          ? <Image src={tour.heroImg} alt={tour.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="flex items-center justify-center h-full text-gray-300" style={{ background: "var(--tr-mint)" }}><MapPin size={28} /></div>}

        {!isDimmed && (
          <div className="absolute bottom-3 right-3 tr-pill font-black"
            style={{ background: priceColor, transform: "rotate(2deg)", color: "#111827" }}>
            {formatCurrency(tour.promoPrice ?? tour.price)}
          </div>
        )}
        {tour.badge && !isDimmed && (
          <div className="absolute top-3 left-3 tr-pill"
            style={{ background: badgeColor, transform: "rotate(-2deg)", color: "#111827" }}>
            {tour.badge}
          </div>
        )}
        {(isFull || isExpired) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-t-[18px]">
            <span className="tr-pill" style={{ background: "var(--tr-card)", color: "var(--tr-text)" }}>
              {isFull ? "✋ Sold Out" : "✅ Trip Selesai"}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--tr-subtext)" }}>
          {tour.country}
        </p>
        <h3 className="font-black text-[15px] leading-snug line-clamp-2 mb-3" style={{ color: "var(--tr-text)" }}>
          {tour.title}
        </h3>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tour.duration && (
            <span className="tr-pill" style={{ background: "var(--tr-mint)", color: "var(--tr-text)" }}>⏱ {tour.duration}</span>
          )}
          {tour.tripDate && (
            <span className="tr-pill" style={{ background: "var(--tr-sky)", color: "var(--tr-text)" }}>📅 {formatDate(tour.tripDate, "id-ID")}</span>
          )}
          <span className="tr-pill" style={{ background: "var(--tr-pink)", color: "var(--tr-text)" }}>👤 {tour.seatsLeft} seat</span>
        </div>
        {tour.promoPrice && (
          <p className="text-[11px] text-gray-400 line-through mb-1">{formatCurrency(tour.price)}</p>
        )}
        {!isDimmed && (
          <div className="pt-3 border-t-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-xs font-black" style={{ color: "var(--tr-subtext)" }}>Lihat detail →</span>
          </div>
        )}
      </div>
    </div>
  );
}

function KawaiiCard({ tour, isDimmed }: { tour: Tour; isDimmed: boolean }) {
  const isFull = tour.status === "FULL";
  const isExpired = !!tour.tripDate && new Date(tour.tripDate) < new Date();
  return (
    <div className={`kw-card group overflow-hidden ${isDimmed ? "opacity-60 grayscale cursor-default" : ""}`}>
      <div className="relative h-52 overflow-hidden rounded-t-[22px] border-b-2"
        style={{ borderColor: "var(--kw-border)" }}>
        {tour.heroImg
          ? <Image src={tour.heroImg} alt={tour.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="flex items-center justify-center h-full" style={{ background: "var(--kw-peach)", color: "var(--kw-border)" }}><MapPin size={28} /></div>}

        {/* Heart badge */}
        {!isDimmed && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black"
            style={{ background: "var(--kw-card)", borderColor: "var(--kw-border)", color: "var(--kw-border)" }}>♡</div>
        )}
        {tour.badge && !isDimmed && (
          <div className="absolute top-3 left-3 kw-pill"
            style={{ background: "var(--kw-blush)", color: "var(--kw-text)", transform: "rotate(-2deg)" }}>
            {tour.badge}
          </div>
        )}
        {(isFull || isExpired) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-t-[22px]">
            <span className="kw-pill" style={{ background: "var(--kw-card)", color: "var(--kw-text)" }}>
              {isFull ? "✋ Sold Out" : "✅ Trip Selesai"}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--kw-subtext)" }}>
          {tour.country}
        </p>
        <h3 className="font-black text-[15px] leading-snug line-clamp-2 mb-3" style={{ color: "var(--kw-text)" }}>
          {tour.title}
        </h3>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tour.duration && (
            <span className="kw-pill" style={{ background: "var(--kw-mint)", color: "var(--kw-text)" }}>⏱ {tour.duration}</span>
          )}
          {tour.tripDate && (
            <span className="kw-pill" style={{ background: "var(--kw-sky)", color: "var(--kw-text)" }}>📅 {formatDate(tour.tripDate, "id-ID")}</span>
          )}
          <span className="kw-pill" style={{ background: "var(--kw-blush)", color: "var(--kw-text)" }}>👤 {tour.seatsLeft} seat</span>
        </div>
        {tour.promoPrice && (
          <p className="text-[11px] text-gray-400 line-through mb-1">{formatCurrency(tour.price)}</p>
        )}
        <div className="pt-3 border-t-2 border-dashed flex items-center justify-between"
          style={{ borderColor: "var(--kw-border)" }}>
          <p className="font-black text-base" style={{ color: "var(--kw-border)" }}>
            {formatCurrency(tour.promoPrice ?? tour.price)}
          </p>
          {!isDimmed && <span className="text-xs font-black" style={{ color: "var(--kw-subtext)" }}>Lihat →</span>}
        </div>
      </div>
    </div>
  );
}

/* ─── Pixel Art card ─── */
const PIXEL_COLORS = ["var(--px-red)", "var(--px-yellow)", "var(--px-cyan)", "var(--px-purple)", "var(--px-green)"];
function hashPixelColor(str: string, offset = 0) {
  let h = offset * 31;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return PIXEL_COLORS[Math.abs(h) % PIXEL_COLORS.length];
}

function PixelCard({ tour, isDimmed }: { tour: Tour; isDimmed: boolean }) {
  const isFull = tour.status === "FULL";
  const isExpired = !!tour.tripDate && new Date(tour.tripDate) < new Date();
  const accentColor = hashPixelColor(tour.id, 0);

  return (
    <div className={`px-card group overflow-hidden ${isDimmed ? "opacity-60 grayscale cursor-default" : ""}`}
      style={{
        backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
        backgroundSize: "16px 16px",
      }}>
      {/* Image */}
      <div className="relative h-52 overflow-hidden border-b-2" style={{ borderColor: "var(--px-border)" }}>
        {tour.heroImg
          ? <Image src={tour.heroImg} alt={tour.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover" style={{ imageRendering: "auto", transition: "none" }} />
          : <div className="flex items-center justify-center h-full text-gray-300"
              style={{ background: accentColor, opacity: 0.2 }}>
              <MapPin size={28} />
            </div>}

        {/* Pixel price tag */}
        {!isDimmed && (
          <div className="absolute bottom-3 right-3 px-pill font-black"
            style={{ background: accentColor, color: "#111827", transform: "none" }}>
            {formatCurrency(tour.promoPrice ?? tour.price)}
          </div>
        )}
        {tour.badge && !isDimmed && (
          <div className="absolute top-3 left-3 px-pill"
            style={{ background: "var(--px-yellow)", color: "#111827" }}>
            ★ {tour.badge}
          </div>
        )}
        {(isFull || isExpired) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="px-pill" style={{ background: "var(--px-card)", color: "var(--px-text)" }}>
              {isFull ? "✖ SOLD OUT" : "✔ SELESAI"}
            </span>
          </div>
        )}
      </div>

      <div className="p-5" style={{ background: "var(--px-card)" }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>
          {tour.country}
        </p>
        <h3 className="font-black text-[15px] leading-snug line-clamp-2 mb-3" style={{ color: "var(--px-text)" }}>
          {tour.title}
        </h3>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tour.duration && (
            <span className="px-pill" style={{ background: "var(--px-cyan)", color: "var(--px-on-cyan)" }}>⏱ {tour.duration}</span>
          )}
          {tour.tripDate && (
            <span className="px-pill" style={{ background: "var(--px-yellow)", color: "#111827" }}>📅 {formatDate(tour.tripDate, "id-ID")}</span>
          )}
          <span className="px-pill" style={{ background: "var(--px-purple)", color: "#ffffff" }}>👤 {tour.seatsLeft} SEAT</span>
        </div>
        {tour.promoPrice && (
          <p className="text-[11px] text-gray-400 line-through mb-1" style={{ fontFamily: "monospace" }}>{formatCurrency(tour.price)}</p>
        )}
        {!isDimmed && (
          <div className="pt-3 border-t-2 flex items-center justify-between" style={{ borderColor: "var(--px-border)" }}>
            <span className="text-xs font-black" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>LIHAT DETAIL ►</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Globe / World Landmarks card ─── */
const GL_BADGE_COLORS = ["#e0f2fe", "#fef9c3", "#dcfce7", "#fce7f3", "#ede9fe", "#ffedd5"];
function hashGlobeColor(str: string, offset = 0) {
  let h = offset * 31;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return GL_BADGE_COLORS[Math.abs(h) % GL_BADGE_COLORS.length];
}

function GlobeCard({ tour, isDimmed }: { tour: Tour; isDimmed: boolean }) {
  const isFull = tour.status === "FULL";
  const isExpired = !!tour.tripDate && new Date(tour.tripDate) < new Date();
  const badgeColor = hashGlobeColor(tour.id, 0);

  return (
    <div className={`gl-card group overflow-hidden ${isDimmed ? "opacity-60 grayscale cursor-default" : ""}`}>
      <div className="relative h-52 overflow-hidden rounded-t-[18px]">
        {tour.heroImg
          ? <Image src={tour.heroImg} alt={tour.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="flex items-center justify-center h-full text-5xl" style={{ background: "var(--gl-sky)", opacity: 0.25 }}>🌍</div>}

        {!isDimmed && (
          <div className="absolute bottom-3 right-3 gl-pill font-black"
            style={{ background: "var(--gl-amber)", color: "var(--gl-on-amber)", transform: "rotate(2deg)", borderColor: "transparent", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
            {formatCurrency(tour.promoPrice ?? tour.price)}
          </div>
        )}
        {tour.badge && !isDimmed && (
          <div className="absolute top-3 left-3 gl-pill"
            style={{ background: badgeColor, color: "#111827", transform: "rotate(-2deg)", borderColor: "transparent" }}>
            {tour.badge}
          </div>
        )}
        {(isFull || isExpired) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-t-[18px]">
            <span className="gl-pill" style={{ background: "var(--gl-card)", color: "var(--gl-text)", borderColor: "transparent" }}>
              {isFull ? "🙅 Sold Out" : "✅ Trip Selesai"}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--gl-subtext)" }}>
          {tour.country}
        </p>
        <h3 className="font-black text-[15px] leading-snug line-clamp-2 mb-3" style={{ color: "var(--gl-text)" }}>
          {tour.title}
        </h3>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tour.duration && (
            <span className="gl-pill" style={{ background: "var(--gl-sky)", color: "var(--gl-on-sky)", borderColor: "transparent" }}>⏱ {tour.duration}</span>
          )}
          {tour.tripDate && (
            <span className="gl-pill" style={{ background: "#fef9c3", color: "#111827", borderColor: "transparent" }}>📅 {formatDate(tour.tripDate, "id-ID")}</span>
          )}
          <span className="gl-pill" style={{ background: "#dcfce7", color: "#111827", borderColor: "transparent" }}>👤 {tour.seatsLeft} seat</span>
        </div>
        {tour.promoPrice && (
          <p className="text-[11px] text-gray-400 line-through mb-1">{formatCurrency(tour.price)}</p>
        )}
        {!isDimmed && (
          <div className="pt-3 border-t flex items-center justify-between"
            style={{ borderColor: "color-mix(in srgb, var(--gl-border) 25%, transparent)" }}>
            <span className="text-xs font-black" style={{ color: "var(--gl-subtext)" }}>Lihat detail →</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MapCard({ tour, isDimmed }: { tour: Tour; isDimmed: boolean }) {
  const isFull = tour.status === "FULL";
  const isExpired = !!tour.tripDate && new Date(tour.tripDate) < new Date();

  return (
    <div className={`mp-card group overflow-hidden ${isDimmed ? "opacity-60 grayscale cursor-default" : ""}`}>
      <div className="relative h-52 overflow-hidden border-b-2" style={{ borderColor: "var(--mp-border)" }}>
        {tour.heroImg
          ? <Image src={tour.heroImg} alt={tour.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="flex items-center justify-center h-full" style={{ background: "var(--mp-water)", opacity: 0.4 }} />}

        {!isDimmed && (
          <div className="absolute bottom-3 right-3 mp-pill font-black"
            style={{ background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)", boxShadow: "2px 2px 0 0 var(--mp-border)" }}>
            {formatCurrency(tour.promoPrice ?? tour.price)}
          </div>
        )}
        {tour.badge && !isDimmed && (
          <div className="absolute top-3 left-3 mp-pill"
            style={{ background: "var(--mp-rust)", color: "var(--mp-on-rust)", borderColor: "var(--mp-border)" }}>
            {tour.badge}
          </div>
        )}
        {(isFull || isExpired) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="mp-pill" style={{ background: "var(--mp-card)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>
              {isFull ? "Sold Out" : "Trip Selesai"}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--mp-subtext)" }}>
          {tour.country}
        </p>
        <h3 className="font-black text-[15px] leading-snug line-clamp-2 mb-3" style={{ color: "var(--mp-text)", fontFamily: "Georgia,'Times New Roman',serif" }}>
          {tour.title}
        </h3>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tour.duration && (
            <span className="mp-pill" style={{ background: "var(--mp-ink)", color: "var(--mp-on-ink)", borderColor: "var(--mp-border)" }}>{tour.duration}</span>
          )}
          {tour.tripDate && (
            <span className="mp-pill" style={{ background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>{formatDate(tour.tripDate, "id-ID")}</span>
          )}
          <span className="mp-pill" style={{ background: "var(--mp-accent)", color: "var(--mp-on-accent)", borderColor: "var(--mp-border)" }}>{tour.seatsLeft} seat</span>
        </div>
        {tour.promoPrice && (
          <p className="text-[11px] text-gray-400 line-through mb-1">{formatCurrency(tour.price)}</p>
        )}
        {!isDimmed && (
          <div className="pt-3 border-t-2 flex items-center justify-between"
            style={{ borderColor: "var(--mp-border)" }}>
            <span className="text-xs font-black uppercase tracking-wide" style={{ color: "var(--mp-subtext)" }}>Lihat detail →</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AtlasCard({ tour, isDimmed }: { tour: Tour; isDimmed: boolean }) {
  const isFull = tour.status === "FULL";
  const isExpired = !!tour.tripDate && new Date(tour.tripDate) < new Date();

  return (
    <div className={`at-card group overflow-hidden h-full flex flex-col ${isDimmed ? "opacity-60 grayscale cursor-default" : ""}`}>
      <div className="relative h-52 overflow-hidden border-b shrink-0" style={{ borderColor: "var(--at-border)" }}>
        {tour.heroImg
          ? <Image src={tour.heroImg} alt={tour.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="h-full" style={{ background: "var(--at-muted)" }} />}

        {!isDimmed && (
          <div className="absolute bottom-3 right-3 at-pill font-semibold"
            style={{ background: "var(--at-text)", color: "var(--at-bg)" }}>
            {formatCurrency(tour.promoPrice ?? tour.price)}
          </div>
        )}
        {tour.badge && !isDimmed && (
          <div className="absolute top-3 left-3 at-pill"
            style={{ background: "var(--at-muted)", color: "var(--at-text)" }}>
            {tour.badge}
          </div>
        )}
        {(isFull || isExpired) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="at-pill" style={{ background: "var(--at-card)", color: "var(--at-text)" }}>
              {isFull ? "Sold Out" : "Trip Selesai"}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--at-subtext)" }}>
          {tour.country}
        </p>
        <h3 className="font-semibold text-[15px] leading-snug line-clamp-2 mb-3" style={{ color: "var(--at-text)" }}>
          {tour.title}
        </h3>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tour.duration && (
            <span className="at-pill" style={{ color: "var(--at-subtext)" }}>{tour.duration}</span>
          )}
          {tour.tripDate && (
            <span className="at-pill" style={{ color: "var(--at-subtext)" }}>{formatDate(tour.tripDate, "id-ID")}</span>
          )}
          <span className="at-pill" style={{ color: "var(--at-subtext)" }}>{tour.seatsLeft} seat</span>
        </div>
        {tour.promoPrice && (
          <p className="text-[11px] text-gray-400 line-through mb-1 mt-auto">{formatCurrency(tour.price)}</p>
        )}
        {!isDimmed && (
          <div className={`pt-3 border-t flex items-center justify-between ${tour.promoPrice ? "" : "mt-auto"}`}
            style={{ borderColor: "var(--at-border)" }}>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--at-subtext)" }}>Lihat detail →</span>
          </div>
        )}
      </div>
    </div>
  );
}

function FumayoCard({ tour, isDimmed }: { tour: Tour; isDimmed: boolean }) {
  const isFull = tour.status === "FULL";
  const isExpired = !!tour.tripDate && new Date(tour.tripDate) < new Date();
  return (
    <div className={`fb-card group overflow-hidden h-full flex flex-col ${isDimmed ? "opacity-60 grayscale cursor-default" : ""}`}>
      <div className="relative h-52 overflow-hidden shrink-0" style={{ borderBottom: "2px solid var(--fb-line)" }}>
        {tour.heroImg
          ? <Image src={tour.heroImg} alt={tour.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="flex items-center justify-center h-full" style={{ background: "var(--fb-paper)", color: "var(--fb-line)" }}><MapPin size={28} /></div>}

        {!isDimmed && (
          <div className="absolute bottom-3 right-3 fb-pill" style={{ background: "var(--fb-card)", fontWeight: 700 }}>
            {formatCurrency(tour.promoPrice ?? tour.price)}
          </div>
        )}
        {tour.badge && !isDimmed && (
          <div className="absolute top-3 left-3 fb-pill" style={{ background: "var(--fb-yellow)", color: "#1a1a1a" }}>
            ★ {tour.badge}
          </div>
        )}
        {(isFull || isExpired) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="fb-pill" style={{ background: "var(--fb-card)" }}>
              {isFull ? "Sold Out" : "Trip Selesai"}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col" style={{ fontFamily: "var(--fb-font)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--fb-subink)" }}>
          {tour.country}
        </p>
        <h3 className="font-bold text-[15px] leading-snug line-clamp-2 mb-3" style={{ color: "var(--fb-ink)" }}>
          {tour.title}
        </h3>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tour.duration && (
            <span className="fb-pill" style={{ background: "var(--fb-blue)", color: "#1a1a1a" }}>⏱ {tour.duration}</span>
          )}
          {tour.tripDate && (
            <span className="fb-pill" style={{ background: "var(--fb-pink)", color: "#1a1a1a" }}>📅 {formatDate(tour.tripDate, "id-ID")}</span>
          )}
          <span className="fb-pill" style={{ background: "var(--fb-yellow)", color: "#1a1a1a" }}>👤 {tour.seatsLeft} seat</span>
        </div>
        {tour.promoPrice && (
          <p className="text-[11px] line-through mb-1 mt-auto" style={{ color: "var(--fb-subink)" }}>{formatCurrency(tour.price)}</p>
        )}
        {!isDimmed && (
          <div className={`pt-3 flex items-center justify-between ${tour.promoPrice ? "" : "mt-auto"}`}
            style={{ borderTop: "2px dashed var(--fb-line)" }}>
            <span className="text-xs font-bold" style={{ color: "var(--fb-accent)" }}>Lihat detail →</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TourCard({ tour, theme = "classic" }: { tour: Tour; theme?: string }) {
  const now = new Date();
  const isExpired = !!tour.tripDate && new Date(tour.tripDate) < now;
  const isFull = tour.status === "FULL";
  const isDimmed = isExpired || isFull;

  let card;
  if (theme === "tropical") card = <TropicalCard tour={tour} isDimmed={isDimmed} />;
  else if (theme === "kawaii") card = <KawaiiCard tour={tour} isDimmed={isDimmed} />;
  else if (theme === "pixel") card = <PixelCard tour={tour} isDimmed={isDimmed} />;
  else if (theme === "globe") card = <GlobeCard tour={tour} isDimmed={isDimmed} />;
  else if (theme === "map")   card = <MapCard   tour={tour} isDimmed={isDimmed} />;
  else if (theme === "atlas") card = <AtlasCard tour={tour} isDimmed={isDimmed} />;
  else if (theme === "fumayo") card = <FumayoCard tour={tour} isDimmed={isDimmed} />;
  else card = <ClassicCard tour={tour} isDimmed={isDimmed} />;

  if (isDimmed) return card;
  return <Link href={`/tours/${tour.id}`} className="block h-full">{card}</Link>;
}
