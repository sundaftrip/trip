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

export default function TourCard({ tour }: { tour: Tour }) {
  return (
    <Link href={`/tours/${tour.id}`}
      className="group block bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-0.5 transition-all duration-300">
      <div className="relative h-52 bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {tour.heroImg
          ? <Image src={tour.heroImg} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="flex items-center justify-center h-full text-gray-300 dark:text-gray-700"><MapPin size={28} /></div>}
        {tour.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-white text-[11px] font-semibold rounded-full" style={{ background: "#2d6a4f" }}>
            {tour.badge}
          </span>
        )}
        {tour.status === "FULL" && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="px-4 py-1.5 border border-white text-white text-xs font-semibold rounded-full tracking-widest uppercase">Full</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">{tour.category} · {tour.country}</p>
        <h3 className="font-semibold mb-3 line-clamp-2 leading-snug text-[15px]" style={{ color: "var(--site-tour-title, #111827)" }}>{tour.title}</h3>

        <div className="flex flex-wrap gap-3 text-[11px] text-gray-400 mb-4">
          {tour.duration && <span className="flex items-center gap-1"><Clock size={10} /> {tour.duration}</span>}
          {tour.tripDate && <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(tour.tripDate, "id-ID")}</span>}
          <span className="flex items-center gap-1"><Users size={10} /> {tour.seatsLeft} seat</span>
        </div>

        <div className="flex items-end justify-between pt-4 border-t border-gray-100 dark:border-gray-900">
          <div>
            {tour.promoPrice && <p className="text-[11px] text-gray-400 line-through">{formatCurrency(tour.price)}</p>}
            <p className="text-base font-bold" style={{ color: "var(--site-accent, #2d6a4f)" }}>{formatCurrency(tour.promoPrice ?? tour.price)}</p>
          </div>
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            Lihat Detail →
          </span>
        </div>
      </div>
    </Link>
  );
}
