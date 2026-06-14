export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgePercent, Banknote, CalendarDays, MapPin, Plane, Sparkles, Ticket } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ReferralGateClient from "@/components/website/ReferralGateClient";
import {
  buildReferralLink,
  claimDiscountMessage,
  generateWhatsAppUrl,
  getConfiguredWhatsAppNumber,
  withoutCodeMessage,
} from "@/lib/referrals";
import { cldOptimize, formatCurrency, formatDate } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
};

type TourCandidate = {
  title: string;
  slug: string | null;
  country: string;
  cityHighlight: string | null;
  price: number;
  promoPrice: number | null;
  tripDate: Date | null;
  duration: string | null;
  itinerary: unknown;
  inclusions: string[];
  heroImg: string | null;
  description: string | null;
};

const STOP_WORDS = new Set(["trip", "tour", "paket", "open", "sundaf", "travel"]);

function normalizeMatchText(value: string) {
  return value
    .toLowerCase()
    .replace(/\brusia\b/g, "russia")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function campaignWords(...values: string[]) {
  return [...new Set(
    normalizeMatchText(values.join(" "))
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
  )];
}

function tourText(tour: TourCandidate) {
  return normalizeMatchText([
    tour.title,
    tour.slug ?? "",
    tour.country,
    tour.cityHighlight ?? "",
  ].join(" "));
}

function scoreTour(tour: TourCandidate, words: string[], now: Date) {
  const haystack = tourText(tour);
  let score = 0;

  for (const word of words) {
    if (haystack.includes(word)) score += 10;
  }

  if (tour.tripDate && tour.tripDate >= now) score += 8;
  if ((tour.promoPrice && tour.promoPrice > 0) || tour.price > 0) score += 3;
  if (tour.heroImg) score += 2;
  if (tour.description?.trim()) score += 1;

  return score;
}

function pickCampaignTour(tours: TourCandidate[], packageName: string, campaignName: string) {
  const words = campaignWords(packageName, campaignName);
  if (!words.length) return null;

  const now = new Date();
  const scored = tours
    .map((tour) => ({ tour, score: scoreTour(tour, words, now) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      const aFuture = a.tour.tripDate && a.tour.tripDate >= now;
      const bFuture = b.tour.tripDate && b.tour.tripDate >= now;
      if (aFuture !== bFuture) return bFuture ? 1 : -1;

      const aTime = a.tour.tripDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = b.tour.tripDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

  return scored[0]?.tour ?? null;
}

function cleanText(value?: string | null) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function excerpt(value?: string | null, max = 210) {
  const text = cleanText(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3).trim()}...`;
}

function effectivePrice(tour: TourCandidate | null) {
  if (!tour) return null;
  const values = [tour.promoPrice, tour.price].filter((value): value is number => Boolean(value && value > 0));
  if (!values.length) return null;
  return Math.min(...values);
}

function itineraryTitles(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const title = (item as { title?: unknown }).title;
      return typeof title === "string" ? cleanText(title) : "";
    })
    .filter(Boolean);
}

function tripHighlights(tour: TourCandidate | null) {
  if (!tour) return [];

  return [
    ...itineraryTitles(tour.itinerary),
    ...(tour.inclusions ?? []),
  ]
    .map((item) => cleanText(item))
    .filter(Boolean)
    .slice(0, 3);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const partner = await prisma.referralPartner.findFirst({
    where: { slug, status: "ACTIVE" },
    select: {
      partnerName: true,
      campaigns: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { packageName: true, discountLabel: true },
      },
    },
  });

  if (!partner) return {};
  const campaign = partner.campaigns[0];

  return {
    title: `Kode referral ${partner.partnerName} | Sundaf Trip`,
    description: campaign
      ? `${campaign.discountLabel} untuk ${campaign.packageName} via kode referral ${partner.partnerName}.`
      : `Klaim kode referral ${partner.partnerName} untuk trip bersama Sundaf Trip.`,
    robots: { index: false, follow: false },
  };
}

export default async function ReferralLandingPage({ params, searchParams }: PageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const partner = await prisma.referralPartner.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      campaigns: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!partner) notFound();
  const campaign = partner.campaigns[0];
  if (!campaign) notFound();

  const tourCandidates = await prisma.tour.findMany({
    where: { status: "ACTIVE" },
    select: {
      title: true,
      slug: true,
      country: true,
      cityHighlight: true,
      price: true,
      promoPrice: true,
      tripDate: true,
      duration: true,
      itinerary: true,
      inclusions: true,
      heroImg: true,
      description: true,
    },
    orderBy: [{ tripDate: "asc" }, { updatedAt: "desc" }],
  });
  const matchedTour = pickCampaignTour(tourCandidates, campaign.packageName, campaign.campaignName);
  const tourPrice = effectivePrice(matchedTour);
  const highlights = tripHighlights(matchedTour);
  const compactHighlights = highlights.slice(0, 2);
  const tourHref = matchedTour?.slug ? `/tours/${matchedTour.slug}` : null;
  const heroImage = matchedTour?.heroImg ? cldOptimize(matchedTour.heroImg, 960) : "";
  const tripDescription = matchedTour?.description
    ? excerpt(matchedTour.description)
    : `${campaign.discountLabel} berlaku untuk konsultasi ${campaign.packageName}. Tim Sundaf Trip akan bantu cek jadwal, seat, dan skema pembayaran sebelum booking.`;
  const sourceUrl = `${buildReferralLink(slug)}${sp.ref ? `?ref=${encodeURIComponent(sp.ref)}` : ""}`;
  const whatsapp = await getConfiguredWhatsAppNumber();
  const claimUrl = generateWhatsAppUrl(
    whatsapp,
    claimDiscountMessage({
      packageName: campaign.packageName,
      discountLabel: campaign.discountLabel,
      referralCode: partner.referralCode,
      partnerName: partner.partnerName,
    })
  );
  const withoutCodeUrl = generateWhatsAppUrl(whatsapp, withoutCodeMessage(campaign.packageName));

  return (
    <section className="min-h-screen bg-[#f4f7f7] px-4 pb-6 pt-14 text-gray-950 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1fr_360px] lg:items-start">
        <header className="rounded-lg border border-teal-900/10 bg-white p-4 shadow-sm sm:p-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-teal-800">
            <BadgePercent size={13} />
            Referral Sundaf Trip
          </div>
          <h1 className="mt-3 max-w-xl text-xl font-black leading-tight text-gray-950 sm:text-3xl">
            Kupon {campaign.packageName}
          </h1>
          <p className="mt-2 max-w-xl text-[13px] leading-5 text-gray-600 sm:text-sm">
            Klaim {campaign.discountLabel} dari {partner.partnerName}. Kode otomatis masuk ke pesan WhatsApp.
          </p>

          <div className="relative mt-4 overflow-hidden rounded-lg border border-dashed border-teal-300 bg-teal-50 p-3">
            <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white" />
            <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white">
                <Ticket size={19} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-teal-800 sm:text-[11px]">Kupon partner</p>
                <p className="text-base font-black leading-tight text-gray-950 sm:text-lg">{campaign.discountLabel}</p>
                <p className="mt-0.5 text-xs text-gray-600">
                  Kode <span className="font-mono font-black text-gray-950">{partner.referralCode}</span> · {partner.partnerName}
                </p>
              </div>
            </div>
          </div>
        </header>

        <aside className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg shadow-gray-200/60 lg:sticky lg:top-24 lg:row-span-2">
          <div className="mb-3 flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-gray-600">Kupon siap dipakai</span>
            <span className="rounded-full bg-teal-50 px-2.5 py-1 font-mono font-black text-teal-800">{partner.referralCode}</span>
          </div>

          <ReferralGateClient
            partnerId={partner.id}
            campaignId={campaign.id}
            partnerName={partner.partnerName}
            referralCode={partner.referralCode}
            sourceUrl={sourceUrl}
            claimUrl={claimUrl}
            withoutCodeUrl={withoutCodeUrl}
          />

          <div className="mt-4 border-t border-gray-200 pt-3 text-xs leading-5 text-gray-600">
            <p>WhatsApp akan membawa kode kupon. Tim Sundaf Trip tetap cek seat, jadwal, harga final, dan syarat promo.</p>
          </div>
        </aside>

        <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            {heroImage && (
              <div
                role="img"
                aria-label={`Foto ${matchedTour?.title ?? campaign.packageName}`}
                className="min-h-40 bg-cover bg-center sm:min-h-56"
                style={{ backgroundImage: `url(${heroImage})` }}
              />
            )}
            <div className="p-4 sm:p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-teal-800">
                  <Plane size={13} />
                  Overview Trip
                </span>
              </div>
              <h2 className="text-xl font-black leading-tight text-gray-950 sm:text-2xl">
                {matchedTour?.title ?? campaign.packageName}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {tripDescription}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex items-start gap-2 rounded-lg border border-gray-200 p-2.5">
                  <MapPin className="mt-0.5 text-teal-700" size={15} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Destinasi</p>
                    <p className="text-xs font-semibold leading-5 text-gray-950">
                      {matchedTour?.cityHighlight || matchedTour?.country || campaign.packageName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-gray-200 p-2.5">
                  <CalendarDays className="mt-0.5 text-teal-700" size={15} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Jadwal</p>
                    <p className="text-xs font-semibold leading-5 text-gray-950">
                      {matchedTour?.tripDate ? formatDate(matchedTour.tripDate) : "Konfirmasi via WhatsApp"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-gray-200 p-2.5">
                  <Sparkles className="mt-0.5 text-teal-700" size={15} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Durasi</p>
                    <p className="text-xs font-semibold leading-5 text-gray-950">{matchedTour?.duration || "Mengikuti paket"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-gray-200 p-2.5">
                  <Banknote className="mt-0.5 text-teal-700" size={15} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Harga</p>
                    <p className="text-xs font-semibold leading-5 text-gray-950">
                      {tourPrice ? `Mulai ${formatCurrency(tourPrice)}` : "Konfirmasi seat dan harga"}
                    </p>
                  </div>
                </div>
              </div>

              {compactHighlights.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {compactHighlights.map((item) => (
                    <span key={item} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {tourHref && (
                <Link href={tourHref} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-300 px-3 text-xs font-bold text-gray-900 transition hover:bg-gray-50">
                  Lihat detail trip
                </Link>
              )}
            </div>
        </article>
      </div>
    </section>
  );
}
