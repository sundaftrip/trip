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
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Paket Tour Pilihan</h2>
            <p className="text-gray-500 dark:text-gray-400">Temukan perjalanan impian Anda</p>
          </div>
          <Link href="/tours" className="hidden sm:flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:gap-2 transition-all text-sm">
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
        </div>
        <div className="text-center mt-8 sm:hidden">
          <Link href="/tours" className="inline-flex items-center gap-2 px-6 py-2.5 border border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition">
            Lihat Semua Tour <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
