import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Users, Clock, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate, cldOptimize } from "@/lib/utils";

interface Tour {
  id: string; title: string; country: string; cityHighlight?: string | null;
  price: number; promoPrice?: number | null; seatsLeft: number;
  tripDate?: Date | null; duration?: string | null; heroImg?: string | null;
  badge?: string | null; status: string;
  notes?: string | null;
  description?: string | null;
}

/* Helpers harga — jangan pernah render "Rp 0" karena bikin kartu terlihat broken.
   Kalau harga = 0 (belum diisi di CMS) → "Tanya Harga".
   strikePrice hanya muncul kalau promoPrice valid & lebih murah dari price asli. */
function priceText(tour: Pick<Tour, "price" | "promoPrice">): string {
  const effective = tour.promoPrice ?? tour.price;
  return effective > 0 ? formatCurrency(effective) : "Tanya Harga";
}
function strikePrice(tour: Pick<Tour, "price" | "promoPrice">): string | null {
  if (!tour.promoPrice || tour.promoPrice <= 0) return null;
  if (tour.price <= 0 || tour.price <= tour.promoPrice) return null;
  return formatCurrency(tour.price);
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
          ? <Image src={cldOptimize(tour.heroImg, 600)} alt={tour.title} fill loading="lazy" sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
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
            {strikePrice(tour) && <p className="text-[11px] text-gray-400 line-through">{strikePrice(tour)}</p>}
            <p className="text-base font-bold" style={{ color: "var(--site-accent,#2d6a4f)" }}>{priceText(tour)}</p>
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
          ? <Image src={cldOptimize(tour.heroImg, 600)} alt={tour.title} fill loading="lazy" sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="flex items-center justify-center h-full text-gray-300" style={{ background: "var(--tr-mint)" }}><MapPin size={28} /></div>}

        {!isDimmed && (
          <div className="absolute bottom-3 right-3 tr-pill font-black"
            style={{ background: priceColor, transform: "rotate(2deg)", color: "#111827" }}>
            {priceText(tour)}
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
        {strikePrice(tour) && (
          <p className="text-[11px] text-gray-400 line-through mb-1">{strikePrice(tour)}</p>
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
          ? <Image src={cldOptimize(tour.heroImg, 600)} alt={tour.title} fill loading="lazy" sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
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
        {strikePrice(tour) && (
          <p className="text-[11px] text-gray-400 line-through mb-1">{strikePrice(tour)}</p>
        )}
        <div className="pt-3 border-t-2 border-dashed flex items-center justify-between"
          style={{ borderColor: "var(--kw-border)" }}>
          <p className="font-black text-base" style={{ color: "var(--kw-border)" }}>
            {priceText(tour)}
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
          ? <Image src={cldOptimize(tour.heroImg, 600)} alt={tour.title} fill loading="lazy" sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover" style={{ imageRendering: "auto", transition: "none" }} />
          : <div className="flex items-center justify-center h-full text-gray-300"
              style={{ background: accentColor, opacity: 0.2 }}>
              <MapPin size={28} />
            </div>}

        {/* Pixel price tag */}
        {!isDimmed && (
          <div className="absolute bottom-3 right-3 px-pill font-black"
            style={{ background: accentColor, color: "#111827", transform: "none" }}>
            {priceText(tour)}
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
        {strikePrice(tour) && (
          <p className="text-[11px] text-gray-400 line-through mb-1" style={{ fontFamily: "monospace" }}>{strikePrice(tour)}</p>
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

/** Map title/city → IATA 3-letter code untuk feel boarding pass yang otentik. */
const IATA_MAP: Record<string, string> = {
  murmansk: "MMK", moskow: "SVO", moscow: "SVO", "st petersburg": "LED",
  petersburg: "LED", "saint petersburg": "LED", kazan: "KZN", sochi: "AER",
  vladivostok: "VVO", baikal: "UUD", irkutsk: "IKT", yekaterinburg: "SVX",
  novosibirsk: "OVB", kaliningrad: "KGD",
  // Indonesia (kalau theme dipakai klien Dermaga lain)
  bali: "DPS", yogyakarta: "JOG", yogya: "JOG", bromo: "JOG", komodo: "LBJ",
  "raja ampat": "SOQ", "labuan bajo": "LBJ", jakarta: "CGK", surabaya: "SUB",
  bandung: "BDO", medan: "KNO", lombok: "LOP",
};
function getIata(title: string, city?: string | null): string {
  const haystack = `${title} ${city ?? ""}`.toLowerCase();
  for (const [key, code] of Object.entries(IATA_MAP)) {
    if (haystack.includes(key)) return code;
  }
  // Fallback: first letters of first 3 significant words
  const words = title.replace(/[^a-zA-Z ]/g, "").split(/\s+/).filter(w => w.length > 2);
  if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  if (words.length === 2) return (words[0].slice(0, 2) + words[1][0]).toUpperCase();
  return (words[0]?.slice(0, 3) ?? "TRP").toUpperCase();
}

/** Compact duration display untuk boarding pass cell.
 *  "11 hari 10 malam" → "11D10N"
 *  "7D6N" → tetap "7D6N"
 *  "9 Hari" → "9D"
 */
function shortenDuration(s: string | null | undefined): string {
  if (!s) return "—";
  const t = s.trim();
  // Already compact like 7D6N
  if (/^\d+\s*[DH]\s*\d*\s*[NM]?$/i.test(t.replace(/\s/g, ""))) {
    return t.replace(/\s+/g, "").toUpperCase();
  }
  // Parse "X hari Y malam" style
  const dayMatch = t.match(/(\d+)\s*(?:hari|h|d|days?)/i);
  const nightMatch = t.match(/(\d+)\s*(?:malam|m|n|nights?)/i);
  const days = dayMatch?.[1];
  const nights = nightMatch?.[1];
  if (days && nights) return `${days}D${nights}N`;
  if (days) return `${days}D`;
  if (nights) return `${nights}N`;
  // Fallback: ambil angka pertama saja
  const numMatch = t.match(/(\d+)/);
  return numMatch ? `${numMatch[1]}D` : t.slice(0, 6);
}

/** Shorten city list ke max 3 entries supaya tinggi card konsisten.
 *  "Almaty · Bishkek · Issyk · Samarkand · Tashkent" → "Almaty · Bishkek · Issyk +2"
 */
function shortenRoute(s: string | null | undefined, max = 3): string {
  if (!s) return "";
  const parts = s.split(/[·•,]/).map(p => p.trim()).filter(Boolean);
  if (parts.length <= max) return parts.join(" · ");
  const rest = parts.length - max;
  return parts.slice(0, max).join(" · ") + ` +${rest}`;
}

/** Ambil excerpt evocative dari tour.notes untuk dipajang di card.
 *  Strip newline/bullet markers, ambil ~120 char pertama yang berakhir di kata. */
function excerpt(s: string | null | undefined, max = 120): string {
  if (!s) return "";
  // Buang baris yang berisi cuma simbol/bullet, gabung sisa jadi 1 paragraf
  const flat = s
    .split(/\n+/)
    .map(line => line.trim())
    .filter(line => line && !/^[+&\-*•·]/.test(line))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (flat.length <= max) return flat;
  // Cut di spasi terdekat sebelum max, lalu …
  const cut = flat.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut) + "…";
}

/** Class code di boarding pass — semantic berdasarkan negara + durasi.
 *  F = First (signature long-haul 10+ hari)
 *  J = Business (international: Russia, Europe, non-Asia)
 *  Y = Economy (domestic Indonesia + regional Asia/SEA)
 */
function getFlightClass(tour: Tour): string {
  const country = (tour.country || "").toLowerCase();
  // Parse duration like "14D13N" or "9 Hari" → ambil angka pertama
  const days = parseInt(String(tour.duration || "0").match(/\d+/)?.[0] || "0", 10);

  // F: signature panjang
  if (days >= 10) return "F";

  // Domestic + regional Asia/SEA → Y
  const isAsia = [
    "indonesia", "indo", "id ",
    "singapura", "singapore", "malaysia", "thailand", "vietnam",
    "filipina", "philippines", "kamboja", "cambodia", "laos", "myanmar",
    "brunei", "asia tenggara"
  ].some(k => country.includes(k));
  if (isAsia) return "Y";

  // International (Russia, Europe, dll) → J
  return "J";
}

function GlobeCard({ tour, isDimmed }: { tour: Tour; isDimmed: boolean }) {
  const isFull = tour.status === "FULL";
  const isExpired = !!tour.tripDate && new Date(tour.tripDate) < new Date();
  const iata = getIata(tour.title, tour.cityHighlight);
  const _tripDate = tour.tripDate ? new Date(tour.tripDate) : null;
  const dateStr = _tripDate
    ? _tripDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
    : "OPEN";
  const duration = shortenDuration(tour.duration);
  const hasPromo = !!tour.promoPrice && tour.promoPrice < tour.price;

  return (
    <div className={`gl-card gl-card-compact group ${isDimmed ? "opacity-60 grayscale cursor-default" : ""}`}>
      {/* === IMAGE — tetap punya identitas boarding pass (IATA + country) === */}
      <div className="relative h-40 sm:h-44 overflow-hidden rounded-t-[8px]">
        {tour.heroImg
          ? <Image src={cldOptimize(tour.heroImg, 600)} alt={tour.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" loading="lazy" className="object-cover group-hover:scale-[1.04] transition-transform duration-700" />
          : <div className="flex items-center justify-center h-full text-5xl" style={{ background: "var(--gl-text)", opacity: 0.15 }}>✈</div>}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55"></div>

        {/* Badge top-right */}
        {tour.badge && !isDimmed && (
          <div className="absolute top-3 right-3 text-[10px] tracking-[0.18em] uppercase text-white font-semibold border border-white/70 px-2 py-0.5 rounded-sm" style={{ fontFamily: "var(--font-anonymous-pro), ui-monospace, monospace" }}>
            {tour.badge}
          </div>
        )}

        {/* BIG IATA + COUNTRY (overlay tetap — identitas tema) */}
        <div className="absolute bottom-3 left-4 right-4" style={{ fontFamily: "var(--font-anonymous-pro), ui-monospace, monospace" }}>
          <div className="text-[48px] sm:text-[56px] font-bold text-white leading-[0.85] tracking-tight">{iata}</div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-white/85 mt-0.5">{tour.country}</div>
        </div>

        {(isFull || isExpired) && (
          <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
            <span className="gl-pill" style={{ background: "var(--gl-card)", color: "var(--gl-text)" }}>
              {isFull ? "✕ Sold Out" : "✓ Trip Selesai"}
            </span>
          </div>
        )}
      </div>

      {/* === BODY COMPACT — 3 baris: title / durasi · tanggal / harga === */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 space-y-2">
        {/* Title */}
        <h3 className="font-semibold text-[14px] sm:text-[16px] lg:text-[17px] leading-snug line-clamp-2" style={{ color: "var(--gl-text)" }}>
          {tour.title}
        </h3>

        {/* Durasi · Tanggal */}
        <div className="flex items-center gap-2 text-[11px] sm:text-[12px] tracking-[0.08em] uppercase font-medium" style={{ color: "var(--gl-subtext)", fontFamily: "var(--font-anonymous-pro), ui-monospace, monospace" }}>
          <span className="whitespace-nowrap">{duration || "—"}</span>
          <span className="opacity-40">·</span>
          <span className="whitespace-nowrap">{dateStr}</span>
        </div>

        {/* Harga — promo besar + harga coret kecil di sebelahnya */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-bold text-[17px] sm:text-[19px] lg:text-[21px] leading-tight" style={{ color: "var(--gl-text)", fontFamily: "var(--font-anonymous-pro), ui-monospace, monospace" }}>
            {priceText(tour)}
          </span>
          {strikePrice(tour) && (
            <span className="text-[11px] sm:text-[12px] line-through opacity-50 whitespace-nowrap" style={{ color: "var(--gl-subtext)" }}>
              {strikePrice(tour)}
            </span>
          )}
        </div>
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
          ? <Image src={cldOptimize(tour.heroImg, 600)} alt={tour.title} fill loading="lazy" sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="flex items-center justify-center h-full" style={{ background: "var(--mp-water)", opacity: 0.4 }} />}

        {!isDimmed && (
          <div className="absolute bottom-3 right-3 mp-pill font-black"
            style={{ background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)", boxShadow: "2px 2px 0 0 var(--mp-border)" }}>
            {priceText(tour)}
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
        {strikePrice(tour) && (
          <p className="text-[11px] text-gray-400 line-through mb-1">{strikePrice(tour)}</p>
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
  const _tripDate = tour.tripDate ? new Date(tour.tripDate) : null;
  const dateStr = _tripDate
    ? _tripDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
    : "OPEN";
  const duration = shortenDuration(tour.duration);

  return (
    <div className={`at-card group overflow-hidden h-full flex flex-col ${isDimmed ? "opacity-60 grayscale cursor-default" : ""}`}>
      <div className="relative h-40 sm:h-44 overflow-hidden border-b shrink-0" style={{ borderColor: "var(--at-border)" }}>
        {tour.heroImg
          ? <Image src={cldOptimize(tour.heroImg, 600)} alt={tour.title} fill loading="lazy" sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="h-full" style={{ background: "var(--at-muted)" }} />}

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

      {/* === BODY COMPACT — ala boarding pass: judul / durasi · tanggal / harga === */}
      <div className="px-5 py-4 flex-1 flex flex-col space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--at-subtext)" }}>
          {tour.country}
        </p>
        <h3 className="font-semibold text-[15px] sm:text-[16px] leading-snug line-clamp-2" style={{ color: "var(--at-text)" }}>
          {tour.title}
        </h3>
        <div className="flex items-center gap-2 text-[11px] sm:text-[12px] tracking-[0.08em] uppercase font-medium" style={{ color: "var(--at-subtext)" }}>
          <span className="whitespace-nowrap">{duration || "—"}</span>
          <span className="opacity-40">·</span>
          <span className="whitespace-nowrap">{dateStr}</span>
        </div>
        <div className="flex items-baseline gap-2 flex-wrap mt-auto pt-1">
          <span className="font-bold text-[17px] sm:text-[19px] leading-tight" style={{ color: "var(--at-text)" }}>
            {priceText(tour)}
          </span>
          {strikePrice(tour) && (
            <span className="text-[11px] line-through opacity-50 whitespace-nowrap" style={{ color: "var(--at-subtext)" }}>
              {strikePrice(tour)}
            </span>
          )}
        </div>
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
          ? <Image src={cldOptimize(tour.heroImg, 600)} alt={tour.title} fill loading="lazy" sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="flex items-center justify-center h-full" style={{ background: "var(--fb-paper)", color: "var(--fb-line)" }}><MapPin size={28} /></div>}

        {!isDimmed && (
          <div className="absolute bottom-3 right-3 fb-pill" style={{ background: "var(--fb-card)", fontWeight: 700 }}>
            {priceText(tour)}
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
        {strikePrice(tour) && (
          <p className="text-[11px] line-through mb-1 mt-auto" style={{ color: "var(--fb-subink)" }}>{strikePrice(tour)}</p>
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

function AtticCard({ tour, isDimmed }: { tour: Tour; isDimmed: boolean }) {
  const isFull = tour.status === "FULL";
  const isExpired = !!tour.tripDate && new Date(tour.tripDate) < new Date();
  return (
    <div className={`atc-box atc-font overflow-hidden h-full flex flex-col ${isDimmed ? "opacity-60 grayscale" : ""}`}>
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9", borderBottom: "1.5px solid var(--atc-border)" }}>
        {tour.heroImg
          ? <Image src={cldOptimize(tour.heroImg, 600)} alt={tour.title} fill loading="lazy" sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
          : <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--atc-pink-soft)" }}><MapPin size={24} style={{ color: "var(--atc-pink-deep)" }} /></div>}
        {(isFull || isExpired) && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="atc-pill">{isFull ? "Sold Out" : "Trip Selesai"}</span>
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--atc-ink-soft)" }}>{tour.country}</p>
        <h3 className="font-extrabold text-sm leading-snug line-clamp-2 mb-2" style={{ color: "var(--atc-ink)" }}>{tour.title}</h3>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tour.duration && <span className="atc-pill"><Clock size={10} /> {tour.duration}</span>}
          <span className="atc-pill"><Users size={10} /> {tour.seatsLeft} seat</span>
        </div>
        <p className="text-[10px] mt-auto" style={{ color: "var(--atc-ink-soft)" }}>mulai dari</p>
        <p className="font-extrabold text-base" style={{ color: "var(--atc-pink-deep)" }}>{priceText(tour)}</p>
        {!isDimmed && <span className="atc-btn mt-2.5 w-full">Lihat Detail →</span>}
      </div>
    </div>
  );
}

function TeriCard({ tour, isDimmed }: { tour: Tour; isDimmed: boolean }) {
  const isFull = tour.status === "FULL";
  const isExpired = !!tour.tripDate && new Date(tour.tripDate) < new Date();
  return (
    <div className={`teri-card group overflow-hidden h-full flex flex-col ${isDimmed ? "opacity-60 grayscale cursor-default" : ""}`}>
      <div className="relative h-52 overflow-hidden border-b-[2.5px] shrink-0" style={{ borderColor: "var(--teri-line)" }}>
        {tour.heroImg
          ? <Image src={cldOptimize(tour.heroImg, 600)} alt={tour.title} fill loading="lazy" sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="flex items-center justify-center h-full" style={{ background: "var(--teri-c2)" }}><MapPin size={28} /></div>}
        {!isDimmed && (
          <div className="absolute bottom-3 right-3 teri-pill" style={{ boxShadow: "3px 3px 0 0 var(--teri-c1)" }}>
            {priceText(tour)}
          </div>
        )}
        {tour.badge && !isDimmed && (
          <div className="absolute top-3 left-3 teri-pill" style={{ boxShadow: "3px 3px 0 0 var(--teri-c4)" }}>{tour.badge}</div>
        )}
        {(isFull || isExpired) && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="teri-pill">{isFull ? "Sold Out" : "Trip Selesai"}</span>
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: "var(--teri-sub)" }}>{tour.country}</p>
        <h3 className="font-extrabold text-[15px] leading-snug line-clamp-2 mb-3" style={{ color: "var(--teri-ink)" }}>{tour.title}</h3>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tour.duration && <span className="teri-pill !shadow-none"><Clock size={11} /> {tour.duration}</span>}
          {tour.tripDate && <span className="teri-pill !shadow-none"><Calendar size={11} /> {formatDate(tour.tripDate, "id-ID")}</span>}
          <span className="teri-pill !shadow-none"><Users size={11} /> {tour.seatsLeft} seat</span>
        </div>
        {strikePrice(tour) && <p className="text-[11px] text-gray-400 line-through mb-1 mt-auto">{strikePrice(tour)}</p>}
        {!isDimmed && (
          <div className={`pt-3 border-t-[2.5px] border-dashed flex items-center justify-between ${tour.promoPrice ? "" : "mt-auto"}`}
            style={{ borderColor: "var(--teri-line)" }}>
            <span className="text-xs font-extrabold inline-flex items-center gap-1" style={{ color: "var(--teri-accent)" }}>Lihat detail <ArrowRight size={12} /></span>
          </div>
        )}
      </div>
    </div>
  );
}

function CoreiCard({ tour, isDimmed }: { tour: Tour; isDimmed: boolean }) {
  return (
    <div className={`group block corei-card overflow-hidden h-full ${isDimmed ? "grayscale opacity-60 cursor-default" : ""}`} style={{ padding: 0 }}>
      <div className="relative h-56 overflow-hidden" style={{ borderTopLeftRadius: "21px", borderTopRightRadius: "21px" }}>
        {tour.heroImg
          ? <Image src={cldOptimize(tour.heroImg, 600)} alt={tour.title} fill loading="lazy" sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="flex items-center justify-center h-full" style={{ background: "rgba(255,255,255,0.06)" }}><MapPin size={28} className="text-white/40" /></div>}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, transparent 50%, rgba(10,14,39,0.55) 100%)" }} />
        {tour.badge && !isDimmed && (
          <span className="absolute top-3 left-3 corei-chip" style={{ fontSize: "10px", padding: "4px 12px" }}>{tour.badge}</span>
        )}
        <StatusOverlay isFull={tour.status === "FULL"} isExpired={!!tour.tripDate && new Date(tour.tripDate) < new Date()} />
      </div>
      <div className="p-5">
        <p className="corei-eyebrow mb-2" style={{ fontSize: "10px" }}>{tour.country}</p>
        <h3 className="font-semibold mb-4 line-clamp-2 leading-snug text-[16px]" style={{ color: "var(--corei-ink)" }}>{tour.title}</h3>
        <div className="flex flex-wrap gap-2 mb-5">
          {tour.duration && <span className="corei-pill"><Clock size={10} /> {tour.duration}</span>}
          {tour.tripDate && <span className="corei-pill"><Calendar size={10} /> {formatDate(tour.tripDate, "id-ID")}</span>}
          <span className="corei-pill"><Users size={10} /> {tour.seatsLeft} seat</span>
        </div>
        <div className="flex items-end justify-between pt-4" style={{ borderTop: "1px solid var(--corei-glass-line)" }}>
          <div>
            {strikePrice(tour) && <p className="text-[11px] line-through" style={{ color: "var(--corei-mute)" }}>{strikePrice(tour)}</p>}
            <p className="text-lg font-bold" style={{ color: "var(--corei-accent)" }}>{priceText(tour)}</p>
          </div>
          {!isDimmed && <span className="text-[11px] font-semibold inline-flex items-center gap-1" style={{ color: "var(--corei-aurora-5)" }}>Lihat <ArrowRight size={12} /></span>}
        </div>
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
