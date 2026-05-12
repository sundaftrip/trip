export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Calendar, Clock, Users, CheckCircle, XCircle,
  ArrowLeft, MessageCircle, Camera, Building2, FileText,
  ClipboardList, Plane, Tag, Package, Ban, Route,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import GalleryZoom from "@/components/website/GalleryZoom";
import TourShareButtons from "@/components/website/TourShareButtons";

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tour, companyRows] = await Promise.all([
    prisma.tour.findUnique({ where: { id } }),
    prisma.companyInfo.findMany({ where: { key: { in: ["company_whatsapp", "company_name", "site_theme"] } } }),
  ]);
  if (!tour || (tour.status === "DRAFT" && process.env.NODE_ENV === "production")) notFound();

  const now = new Date();
  if (tour.tripDate && tour.tripDate < now) redirect("/tours");

  const company: Record<string, string> = {};
  companyRows.forEach((c) => { company[c.key] = c.value; });
  const waNumber = company["company_whatsapp"] || "";
  const companyName = company["company_name"] || "";
  const siteTheme = company["site_theme"] ?? "classic";
  const isTropical = siteTheme === "tropical";
  const isKawaii   = siteTheme === "kawaii";
  const isPixel    = siteTheme === "pixel";
  const isAtlas    = siteTheme === "atlas";
  const isOutlined = isTropical || isKawaii || isPixel || isAtlas;

  const pfx   = isTropical ? "tr" : isKawaii ? "kw" : isPixel ? "px" : isAtlas ? "at" : "";
  const tBg   = isTropical ? "var(--tr-bg)"   : isKawaii ? "var(--kw-bg)"   : isPixel ? "var(--px-bg)"   : isAtlas ? "var(--at-bg)"   : undefined;
  const tText = isTropical ? "var(--tr-text)"  : isKawaii ? "var(--kw-text)" : isPixel ? "var(--px-text)" : isAtlas ? "var(--at-text)" : undefined;
  const tCard = isTropical ? "var(--tr-card)"  : isKawaii ? "var(--kw-card)" : isPixel ? "var(--px-card)" : isAtlas ? "var(--at-card)" : undefined;
  const tMint = isTropical ? "var(--tr-mint)"  : isKawaii ? "var(--kw-mint)" : isPixel ? "var(--px-cyan)" : isAtlas ? "var(--at-muted)" : undefined;
  const tSun  = isTropical ? "var(--tr-sun)"   : isKawaii ? "var(--kw-sun)"  : isPixel ? "var(--px-yellow)" : isAtlas ? "var(--at-muted)" : undefined;
  const tSub  = isTropical ? "var(--tr-subtext)" : isKawaii ? "var(--kw-subtext)" : isPixel ? "var(--px-subtext)" : isAtlas ? "var(--at-subtext)" : undefined;
  const tBdr  = isTropical ? "var(--tr-border)" : isKawaii ? "var(--kw-border)" : isPixel ? "var(--px-border)" : isAtlas ? "var(--at-border)" : undefined;

  const itinerary = (tour.itinerary as { day: number; title: string; description: string }[]) ?? [];
  const addOns = (tour.addOns as { name: string; price: number }[]) ?? [];
  const hotelInfo = tour.hotel as Record<string, string> | null;

  const greeting = companyName ? `Halo ${companyName}` : "Halo";
  const waMessage = encodeURIComponent(`${greeting}, saya tertarik dengan paket *${tour.title}*. Mohon informasi lebih lanjut.`);

  const secTitle = isOutlined
    ? "text-2xl font-black flex items-center gap-2"
    : "text-xl font-bold text-gray-900 dark:text-white";

  const pixelGridStyle = isPixel ? {
    backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
    backgroundSize: "24px 24px",
  } : isAtlas ? {
    backgroundImage: "linear-gradient(var(--at-grid) 1px,transparent 1px),linear-gradient(90deg,var(--at-grid) 1px,transparent 1px)",
    backgroundSize: "32px 32px",
  } : {};

  /* Helper: icon+label for sidebar rows (outlined themes) */
  const sidebarLabel = (icon: React.ReactNode, label: string) =>
    isOutlined ? (
      <span className="flex items-center gap-1.5">{icon}{label}</span>
    ) : label;

  return (
    <div className="min-h-screen pt-16" style={isOutlined ? { backgroundColor: tBg, ...pixelGridStyle } : undefined}>
      {/* Hero */}
      <div className={`relative h-72 lg:h-96 ${isOutlined ? "border-b-2" : "bg-gray-200 dark:bg-gray-800"}`}
        style={isOutlined ? { borderColor: tBdr } : undefined}>
        {tour.heroImg && <Image src={tour.heroImg} alt={tour.title} fill className="object-cover" priority />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 max-w-7xl mx-auto">
          {tour.badge && (
            isOutlined
              ? <span className={`${pfx}-pill mb-3 inline-flex`} style={{ background: tSun, color: tText }}>{tour.badge}</span>
              : <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full mb-3">{tour.badge}</span>
          )}
          <h1 className={`text-3xl lg:text-4xl mb-2 ${isOutlined ? "font-black text-white" : "font-bold text-white"}`}>{tour.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {isOutlined ? (
              <>
                <span className={`${pfx}-pill flex items-center gap-1`} style={{ background: "rgba(255,255,255,0.9)", color: "#1a1a1a" }}>
                  <MapPin size={12} />{tour.country}{tour.cityHighlight ? ` · ${tour.cityHighlight}` : ""}
                </span>
                {tour.duration && (
                  <span className={`${pfx}-pill flex items-center gap-1`} style={{ background: "rgba(255,255,255,0.9)", color: "#1a1a1a" }}>
                    <Clock size={12} />{tour.duration}
                  </span>
                )}
                {tour.tripDate && (
                  <span className={`${pfx}-pill flex items-center gap-1`} style={{ background: "rgba(255,255,255,0.9)", color: "#1a1a1a" }}>
                    <Calendar size={12} />{formatDate(tour.tripDate)}
                  </span>
                )}
                <span className={`${pfx}-pill flex items-center gap-1`} style={{ background: "rgba(255,255,255,0.9)", color: "#1a1a1a" }}>
                  <Users size={12} />{tour.seatsLeft} seat tersisa
                </span>
              </>
            ) : (
              <span className="flex flex-wrap gap-4 text-white/80">
                <span className="flex items-center gap-1"><MapPin size={14} /> {tour.country}{tour.cityHighlight ? ` · ${tour.cityHighlight}` : ""}</span>
                {tour.duration && <span className="flex items-center gap-1"><Clock size={14} /> {tour.duration}</span>}
                {tour.tripDate && <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(tour.tripDate)}</span>}
                <span className="flex items-center gap-1"><Users size={14} /> {tour.seatsLeft} seat tersisa</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/tours"
          className={`inline-flex items-center gap-1 text-sm mb-8 transition ${isOutlined ? `${pfx}-pill font-black` : "text-gray-500 hover:text-blue-600"}`}
          style={isOutlined ? { background: tCard, color: tText } : undefined}>
          <ArrowLeft size={16} /> Kembali ke Daftar Tour
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Gallery */}
            {tour.gallery.length > 0 && (
              <div>
                <h2 className={`${secTitle} mb-4`} style={isOutlined ? { color: tText } : undefined}>
                  {isOutlined && <Camera size={18} />} Galeri
                </h2>
                <GalleryZoom images={tour.gallery} />
              </div>
            )}

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {tour.inclusions.length > 0 && (
                <div className={isOutlined ? `${pfx}-card p-5` : ""}>
                  <h2 className={`${secTitle} mb-3`} style={isOutlined ? { color: tText } : undefined}>
                    {isOutlined && <CheckCircle size={18} />} Sudah Termasuk
                  </h2>
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
                <div className={isOutlined ? `${pfx}-card p-5` : ""}>
                  <h2 className={`${secTitle} mb-3`} style={isOutlined ? { color: tText } : undefined}>
                    {isOutlined && <XCircle size={18} />} Tidak Termasuk
                  </h2>
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
                <h2 className={`${secTitle} mb-6`} style={isOutlined ? { color: tText } : undefined}>
                  {isOutlined && <Route size={18} />} Itinerary
                </h2>

                {isAtlas ? (
                  /* Atlas: clean vertical timeline — black & white */
                  <div className="space-y-0">
                    {itinerary.map((item, idx) => (
                      <div key={item.day} className="flex gap-5">
                        <div className="flex flex-col items-center">
                          <div
                            className="w-9 h-9 rounded-full border bg-white dark:bg-[#111] text-xs font-bold flex items-center justify-center shrink-0"
                            style={{ borderColor: "var(--at-border)", color: "var(--at-text)" }}
                          >
                            {String(item.day).padStart(2, "0")}
                          </div>
                          {idx < itinerary.length - 1 && (
                            <div className="w-px flex-1 bg-black/10 dark:bg-white/10 my-1 min-h-8" />
                          )}
                        </div>
                        <div className="pb-8 pt-1.5 flex-1">
                          <h3 className="font-semibold text-sm" style={{ color: "var(--at-text)" }}>{item.title}</h3>
                          {item.description && (
                            <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--at-subtext)" }}>{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isOutlined ? (
                  /* Other outlined themes: card + pill badge */
                  <div className="space-y-3">
                    {itinerary.map((item) => (
                      <div key={item.day} className={`flex gap-4 ${pfx}-card p-4`}>
                        <span className={`${pfx}-pill shrink-0`} style={{ background: tMint, color: tText }}>Hari {item.day}</span>
                        <div>
                          <h3 className="font-black" style={{ color: tText }}>{item.title}</h3>
                          {item.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Classic: blue circle + vertical line */
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
                )}
              </div>
            )}

            {/* Hotel */}
            {hotelInfo && Object.keys(hotelInfo).length > 0 && (
              <div>
                <h2 className={`${secTitle} mb-4`} style={isOutlined ? { color: tText } : undefined}>
                  {isOutlined && <Building2 size={18} />} Hotel
                </h2>
                <div className={isOutlined ? `${pfx}-card p-4` : "bg-gray-50 dark:bg-gray-800 rounded-xl p-4"}>
                  {Object.entries(hotelInfo).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0 text-sm">
                      <span className="text-gray-500 capitalize">{k}</span>
                      <span className={`font-${isOutlined ? "black" : "medium"} text-gray-900 dark:text-white`}
                        style={isOutlined ? { color: tText } : undefined}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visa Info */}
            {tour.visaInfo && (
              <div>
                <h2 className={`${secTitle} mb-3`} style={isOutlined ? { color: tText } : undefined}>
                  {isOutlined && <FileText size={18} />} Informasi Visa
                </h2>
                <p className={`text-sm leading-relaxed p-4 ${isOutlined ? `${pfx}-card` : "text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl"}`}
                  style={isOutlined ? { color: tSub } : undefined}>
                  {tour.visaInfo}
                </p>
              </div>
            )}

            {/* Notes */}
            {tour.notes && (
              <div>
                <h2 className={`${secTitle} mb-3`} style={isOutlined ? { color: tText } : undefined}>
                  {isOutlined && <ClipboardList size={18} />} Catatan Penting
                </h2>
                <p className={`text-sm leading-relaxed p-4 ${isOutlined ? `${pfx}-card` : "text-gray-600 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"}`}
                  style={isOutlined ? { background: tSun, color: tSub } : undefined}>
                  {tour.notes}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Booking */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className={isOutlined ? `${pfx}-card p-6` : "bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"}>
              {/* Price */}
              <div className="mb-5">
                {isOutlined ? (
                  <div className="mb-3">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Harga per orang</p>
                    <span className={`${pfx}-pill font-black`} style={{ background: tMint, color: tText, fontSize: "1.5rem", padding: "8px 20px" }}>
                      {formatCurrency(tour.promoPrice ?? tour.price)}
                    </span>
                    {tour.promoPrice && (
                      <p className="text-sm text-gray-400 line-through mt-2">{formatCurrency(tour.price)}</p>
                    )}
                    {tour.priceLandTour && (
                      <p className="text-xs mt-1">
                        <span className={`${pfx}-pill`} style={{ background: tSun, color: tText }}>Land Tour: {formatCurrency(tour.priceLandTour)}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-1">Harga per orang</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(tour.promoPrice ?? tour.price)}</p>
                    {tour.promoPrice && <p className="text-sm text-gray-400 line-through">{formatCurrency(tour.price)}</p>}
                    {tour.priceLandTour && <p className="text-xs text-gray-500 mt-1">Land Tour: {formatCurrency(tour.priceLandTour)}</p>}
                  </div>
                )}
              </div>

              {/* CTA */}
              {tour.status === "FULL" ? (
                <div className={`w-full py-3 text-center font-black mb-3 flex items-center justify-center gap-2 ${isOutlined ? `${pfx}-card` : "bg-red-100 text-red-700 rounded-xl"}`}
                  style={isOutlined ? { background: "#fee2e2", color: "#991b1b" } : undefined}>
                  <Ban size={16} /> FULLY BOOKED
                </div>
              ) : (
                <a href={`https://wa.me/${waNumber}?text=${waMessage}`} target="_blank" rel="noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-3 font-black mb-3 transition ${isOutlined ? `${pfx}-btn` : "bg-green-500 hover:bg-green-600 text-white rounded-xl"}`}
                  style={isOutlined ? { background: "var(--site-accent)", color: "#fff", justifyContent: "center" } : undefined}>
                  <MessageCircle size={18} /> Pesan via WhatsApp
                </a>
              )}

              <div className="text-xs text-center mb-5 font-black text-gray-400">
                Konsultasi gratis · Tanpa biaya tambahan
              </div>

              {/* Tour details grid */}
              <div className={`space-y-2 text-sm pt-4 ${isOutlined ? "border-t-2 border-dashed" : "border-t border-gray-100 dark:border-gray-800"}`}
                style={isOutlined ? { borderColor: tBdr } : undefined}>
                {tour.tripDate && (
                  <div className="flex justify-between">
                    <span style={{ color: tSub ?? "" }} className={tSub ? "" : "text-gray-500"}>
                      {sidebarLabel(<Plane size={12} />, "Keberangkatan")}
                    </span>
                    <span className={`font-${isOutlined ? "black" : "medium"} text-gray-900 dark:text-white`}
                      style={isOutlined ? { color: tText } : undefined}>{formatDate(tour.tripDate)}</span>
                  </div>
                )}
                {tour.duration && (
                  <div className="flex justify-between">
                    <span style={{ color: tSub ?? "" }} className={tSub ? "" : "text-gray-500"}>
                      {sidebarLabel(<Clock size={12} />, "Durasi")}
                    </span>
                    <span className={`font-${isOutlined ? "black" : "medium"} text-gray-900 dark:text-white`}
                      style={isOutlined ? { color: tText } : undefined}>{tour.duration}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: tSub ?? "" }} className={tSub ? "" : "text-gray-500"}>
                    {sidebarLabel(<Users size={12} />, "Sisa Seat")}
                  </span>
                  <span className={`font-${isOutlined ? "black" : "medium"} text-gray-900 dark:text-white`}
                    style={isOutlined ? { color: tText } : undefined}>{tour.seatsLeft}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: tSub ?? "" }} className={tSub ? "" : "text-gray-500"}>
                    {sidebarLabel(<Tag size={12} />, "Kategori")}
                  </span>
                  <span className={`font-${isOutlined ? "black" : "medium"} text-gray-900 dark:text-white`}
                    style={isOutlined ? { color: tText } : undefined}>{tour.category}</span>
                </div>
              </div>

              {/* Add Ons */}
              {addOns.length > 0 && (
                <div className={`mt-4 pt-4 ${isOutlined ? "border-t-2 border-dashed" : "border-t border-gray-100 dark:border-gray-800"}`}
                  style={isOutlined ? { borderColor: tBdr } : undefined}>
                  <p className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isOutlined ? "font-black" : "font-semibold text-gray-500"}`}
                    style={isOutlined ? { color: tSub } : undefined}>
                    {isOutlined && <Package size={12} />} Add Ons
                  </p>
                  <div className="space-y-1.5">
                    {addOns.map((item) => (
                      <div key={item.name} className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                        <span className={`font-${isTropical ? "black" : "medium"} text-gray-900 dark:text-white`}>+{formatCurrency(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Share buttons */}
              <TourShareButtons
                tourTitle={tour.title}
                isOutlined={isOutlined}
                isAtlas={isAtlas}
                pfx={pfx}
                tText={tText}
                tCard={tCard}
                tBdr={tBdr}
                tSub={tSub}
                tMint={tMint}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
