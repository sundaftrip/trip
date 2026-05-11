import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Users, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Tour {
  id: string; title: string; country: string; cityHighlight?: string | null;
  price: number; promoPrice?: number | null; seatsLeft: number;
  tripDate?: Date | null; duration?: string | null; heroImg?: string | null;
  badge?: string | null; category: string; status: string;
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
          ? <Image src={tour.heroImg} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="flex items-center justify-center h-full text-gray-300 dark:text-gray-700"><MapPin size={28} /></div>}
        {tour.badge && !isDimmed && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-white text-[11px] font-semibold rounded-full" style={{ background: "var(--site-accent,#2d6a4f)" }}>
            {tour.badge}
          </span>
        )}
        <StatusOverlay isFull={tour.status === "FULL"} isExpired={!!tour.tripDate && new Date(tour.tripDate) < new Date()} />
      </div>
      <div className="p-5">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">{tour.category} · {tour.country}</p>
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

function VibrantCard({ tour, isDimmed }: { tour: Tour; isDimmed: boolean }) {
  return (
    <div className={`group block bg-white dark:bg-gray-900 rounded-3xl overflow-hidden transition-all duration-500 ${isDimmed ? "grayscale opacity-60 cursor-default" : "hover:-translate-y-2 hover:shadow-2xl shadow-md"}`}>
      <div className="relative h-64 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {tour.heroImg
          ? <Image src={tour.heroImg} alt={tour.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
          : <div className="flex items-center justify-center h-full text-gray-300"><MapPin size={32} /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {tour.badge && !isDimmed && (
          <span className="absolute top-4 left-4 px-3 py-1.5 text-white text-[11px] font-bold rounded-full shadow-lg" style={{ background: "var(--site-accent,#2d6a4f)" }}>
            {tour.badge}
          </span>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white/70 text-[10px] uppercase tracking-wider">{tour.category} · {tour.country}</p>
        </div>
        <StatusOverlay isFull={tour.status === "FULL"} isExpired={!!tour.tripDate && new Date(tour.tripDate) < new Date()} />
      </div>
      <div className="p-6">
        <h3 className="font-bold mb-3 line-clamp-2 leading-snug text-base text-gray-900 dark:text-white">{tour.title}</h3>
        <div className="flex flex-wrap gap-3 text-[11px] text-gray-400 mb-5">
          {tour.duration && <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-full"><Clock size={10} /> {tour.duration}</span>}
          {tour.tripDate && <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-full"><Calendar size={10} /> {formatDate(tour.tripDate, "id-ID")}</span>}
          <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-full"><Users size={10} /> {tour.seatsLeft} seat</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {tour.promoPrice && <p className="text-[11px] text-gray-400 line-through">{formatCurrency(tour.price)}</p>}
            <p className="text-lg font-black" style={{ color: "var(--site-accent,#2d6a4f)" }}>{formatCurrency(tour.promoPrice ?? tour.price)}</p>
          </div>
          {!isDimmed && (
            <span className="text-xs font-bold text-white px-4 py-2 rounded-full transition-all" style={{ background: "var(--site-accent,#2d6a4f)" }}>
              Lihat →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function BoldCard({ tour, isDimmed }: { tour: Tour; isDimmed: boolean }) {
  return (
    <div className={`group flex bg-gray-950 rounded-2xl overflow-hidden transition-all duration-300 ${isDimmed ? "grayscale opacity-60 cursor-default" : "hover:bg-gray-900"}`}
      style={{ borderLeft: `4px solid var(--site-accent,#2d6a4f)` }}>
      <div className="relative w-40 sm:w-52 shrink-0 bg-gray-800 overflow-hidden">
        {tour.heroImg
          ? <Image src={tour.heroImg} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="flex items-center justify-center h-full text-gray-600"><MapPin size={24} /></div>}
        <StatusOverlay isFull={tour.status === "FULL"} isExpired={!!tour.tripDate && new Date(tour.tripDate) < new Date()} />
      </div>
      <div className="flex flex-col justify-between p-5 flex-1 min-w-0">
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--site-accent,#2d6a4f)" }}>{tour.category} · {tour.country}</p>
          <h3 className="font-bold text-white line-clamp-2 leading-snug text-sm mb-3">{tour.title}</h3>
          <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
            {tour.duration && <span className="flex items-center gap-1"><Clock size={10} /> {tour.duration}</span>}
            {tour.tripDate && <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(tour.tripDate, "id-ID")}</span>}
            <span className="flex items-center gap-1"><Users size={10} /> {tour.seatsLeft} seat</span>
          </div>
        </div>
        <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-800">
          <div>
            {tour.promoPrice && <p className="text-[11px] text-gray-600 line-through">{formatCurrency(tour.price)}</p>}
            <p className="text-base font-black text-white">{formatCurrency(tour.promoPrice ?? tour.price)}</p>
          </div>
          {!isDimmed && (
            <span className="text-[11px] font-semibold text-gray-400 group-hover:text-white transition-colors">Lihat Detail →</span>
          )}
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
          ? <Image src={tour.heroImg} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="flex items-center justify-center h-full text-gray-300" style={{ background: "var(--tr-mint)" }}><MapPin size={28} /></div>}

        {!isDimmed && (
          <div className="absolute bottom-3 right-3 tr-pill font-black"
            style={{ background: priceColor, transform: "rotate(2deg)", color: "var(--tr-text)" }}>
            {formatCurrency(tour.promoPrice ?? tour.price)}
          </div>
        )}
        {tour.badge && !isDimmed && (
          <div className="absolute top-3 left-3 tr-pill"
            style={{ background: badgeColor, transform: "rotate(-2deg)", color: "var(--tr-text)" }}>
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
          {tour.category} · {tour.country}
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
          ? <Image src={tour.heroImg} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
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
          {tour.category} · {tour.country}
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

export default function TourCard({ tour, theme = "classic" }: { tour: Tour; theme?: string }) {
  const now = new Date();
  const isExpired = !!tour.tripDate && new Date(tour.tripDate) < now;
  const isFull = tour.status === "FULL";
  const isDimmed = isExpired || isFull;

  let card;
  if (theme === "vibrant") card = <VibrantCard tour={tour} isDimmed={isDimmed} />;
  else if (theme === "bold") card = <BoldCard tour={tour} isDimmed={isDimmed} />;
  else if (theme === "tropical") card = <TropicalCard tour={tour} isDimmed={isDimmed} />;
  else if (theme === "kawaii") card = <KawaiiCard tour={tour} isDimmed={isDimmed} />;
  else card = <ClassicCard tour={tour} isDimmed={isDimmed} />;

  if (isDimmed) return card;
  return <Link href={`/tours/${tour.id}`}>{card}</Link>;
}
