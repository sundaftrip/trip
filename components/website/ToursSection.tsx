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
    <section className="py-24 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#2d6a4f" }}>
              Tour Packages
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Paket Tour Pilihan</h2>
          </div>
          <Link href="/tours" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5" style={{ color: "#2d6a4f" }}>
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
        </div>
        <div className="text-center mt-8 sm:hidden">
          <Link href="/tours" className="inline-flex items-center gap-2 px-6 py-2.5 border font-semibold rounded-xl transition"
            style={{ borderColor: "#2d6a4f", color: "#2d6a4f" }}>
            Lihat Semua Tour <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
