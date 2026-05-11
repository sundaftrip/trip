export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, Clock, Users, CheckCircle, XCircle, ArrowLeft, MessageCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import GalleryZoom from "@/components/website/GalleryZoom";



export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await prisma.tour.findUnique({ where: { id } });
  if (!tour || (tour.status === "DRAFT" && process.env.NODE_ENV === "production")) notFound();

  const now = new Date();
  if (tour.tripDate && tour.tripDate < now) redirect("/tours");

  const itinerary = (tour.itinerary as { day: number; title: string; description: string }[]) ?? [];
  const addOns = (tour.addOns as { name: string; price: number }[]) ?? [];
  const hotelInfo = tour.hotel as Record<string, string> | null;

  const waMessage = encodeURIComponent(`Halo Sundaf Trip, saya tertarik dengan paket *${tour.title}*. Mohon informasi lebih lanjut.`);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-16">
      {/* Hero */}
      <div className="relative h-72 lg:h-96 bg-gray-200 dark:bg-gray-800">
        {tour.heroImg && <Image src={tour.heroImg} alt={tour.title} fill className="object-cover" priority />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 max-w-7xl mx-auto">
          {tour.badge && <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full mb-3">{tour.badge}</span>}
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{tour.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1"><MapPin size={14} /> {tour.country}{tour.cityHighlight ? ` · ${tour.cityHighlight}` : ""}</span>
            {tour.duration && <span className="flex items-center gap-1"><Clock size={14} /> {tour.duration}</span>}
            {tour.tripDate && <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(tour.tripDate)}</span>}
            <span className="flex items-center gap-1"><Users size={14} /> {tour.seatsLeft} seat tersisa</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/tours" className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 text-sm mb-8 transition">
          <ArrowLeft size={16} /> Kembali ke Daftar Tour
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            {tour.gallery.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Galeri</h2>
                <GalleryZoom images={tour.gallery} />
              </div>
            )}

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {tour.inclusions.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Sudah Termasuk</h2>
                  <ul className="space-y-2">
                    {tour.inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tour.exclusions.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Tidak Termasuk</h2>
                  <ul className="space-y-2">
                    {tour.exclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Itinerary */}
            {itinerary.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Itinerary</h2>
                <div className="space-y-3">
                  {itinerary.map((item) => (
                    <div key={item.day} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                          {item.day}
                        </span>
                        <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />
                      </div>
                      <div className="pb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                        {item.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hotel */}
            {hotelInfo && Object.keys(hotelInfo).length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hotel</h2>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  {Object.entries(hotelInfo).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0 text-sm">
                      <span className="text-gray-500 capitalize">{k}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visa Info */}
            {tour.visaInfo && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Informasi Visa</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl leading-relaxed">{tour.visaInfo}</p>
              </div>
            )}

            {/* Notes */}
            {tour.notes && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Catatan Penting</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl leading-relaxed">{tour.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar Booking */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">Harga per orang</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(tour.promoPrice ?? tour.price)}
                </p>
                {tour.promoPrice && (
                  <p className="text-sm text-gray-400 line-through">{formatCurrency(tour.price)}</p>
                )}
                {tour.priceLandTour && (
                  <p className="text-xs text-gray-500 mt-1">Land Tour: {formatCurrency(tour.priceLandTour)}</p>
                )}
              </div>

              {tour.status === "FULL" ? (
                <div className="w-full py-3 bg-red-100 text-red-700 font-bold rounded-xl text-center mb-3">FULLY BOOKED</div>
              ) : (
                <a href={`https://wa.me/628111620207?text=${waMessage}`} target="_blank" rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl mb-3 transition">
                  <MessageCircle size={18} /> Pesan via WhatsApp
                </a>
              )}

              <div className="text-xs text-gray-400 text-center mb-5">Konsultasi gratis · Tanpa biaya tambahan</div>

              <div className="space-y-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-4">
                {tour.tripDate && <div className="flex justify-between"><span className="text-gray-500">Keberangkatan</span><span className="font-medium text-gray-900 dark:text-white">{formatDate(tour.tripDate)}</span></div>}
                {tour.duration && <div className="flex justify-between"><span className="text-gray-500">Durasi</span><span className="font-medium text-gray-900 dark:text-white">{tour.duration}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Sisa Seat</span><span className="font-medium text-gray-900 dark:text-white">{tour.seatsLeft}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Kategori</span><span className="font-medium text-gray-900 dark:text-white">{tour.category}</span></div>
              </div>

              {/* Add Ons */}
              {addOns.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Add Ons</p>
                  <div className="space-y-1.5">
                    {addOns.map((item) => (
                      <div key={item.name} className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                        <span className="text-gray-900 dark:text-white font-medium">+{formatCurrency(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
