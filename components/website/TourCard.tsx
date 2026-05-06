import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Users, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Tour {
  id: string;
  title: string;
  country: string;
  cityHighlight?: string | null;
  price: number;
  promoPrice?: number | null;
  seatsLeft: number;
  tripDate?: Date | null;
  duration?: string | null;
  heroImg?: string | null;
  badge?: string | null;
  category: string;
  status: string;
}

export default function TourCard({ tour }: { tour: Tour }) {
  return (
    <Link href={`/tours/${tour.id}`} className="group block rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-gray-800">
        {tour.heroImg ? (
          <Image src={tour.heroImg} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <MapPin size={32} />
          </div>
        )}
        {/* Badge */}
        {tour.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
            {tour.badge}
          </span>
        )}
        {/* Status */}
        {tour.status === "FULL" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-4 py-2 bg-red-600 text-white font-bold rounded-full">FULL</span>
          </div>
        )}
        {/* Category */}
        <span className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
          {tour.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
          {tour.title}
        </h3>
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-3">
          <MapPin size={12} />
          <span>{tour.country}{tour.cityHighlight ? ` · ${tour.cityHighlight}` : ""}</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
          {tour.duration && (
            <span className="flex items-center gap-1"><Clock size={11} /> {tour.duration}</span>
          )}
          {tour.tripDate && (
            <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(tour.tripDate, "id-ID")}</span>
          )}
          <span className="flex items-center gap-1"><Users size={11} /> {tour.seatsLeft} seat tersisa</span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-400">Mulai dari</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(tour.promoPrice ?? tour.price)}
            </p>
            {tour.promoPrice && (
              <p className="text-xs text-gray-400 line-through">{formatCurrency(tour.price)}</p>
            )}
          </div>
          <span className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition">
            Lihat Detail
          </span>
        </div>
      </div>
    </Link>
  );
}
