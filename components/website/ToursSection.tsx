import Link from "next/link";
import TourCard from "./TourCard";
import { ArrowRight } from "lucide-react";

interface Tour {
  id: string; title: string; country: string; cityHighlight: string | null;
  price: number; promoPrice: number | null; seatsLeft: number;
  tripDate: Date | null; duration: string | null; heroImg: string | null;
  badge: string | null; category: string; status: string;
}

export default function ToursSection({ tours }: { tours: Tour[] }) {
  if (tours.length === 0) return null;
  return (
    <section className="py-24 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-gray-400 mb-3">Paket Tersedia</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Tour Pilihan</h2>
          </div>
          <Link href="/tours" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group">
            Semua Tour <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
        </div>
      </div>
    </section>
  );
}
