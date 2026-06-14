export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgePercent, Banknote, CalendarDays, MapPin, Plane, Sparkles, Ticket, UserRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ReferralGateClient from "@/components/website/ReferralGateClient";
import {
  buildReferralLink,
  claimDiscountMessage,
  generateWhatsAppUrl,
  getConfiguredWhatsAppNumber,
  PARTNER_TYPE_LABEL,
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
    <section className="min-h-screen bg-[#f4f7f7] px-4 pb-6 pt-16 text-gray-950 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
        <div className="space-y-5">
          <header className="rounded-lg border border-teal-900/10 bg-white p-5 shadow-sm sm:p-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-800">
              <BadgePercent size={14} />
              Referral Sundaf Trip
            </div>
            <h1 className="mt-4 max-w-2xl text-3xl font-black leading-tight text-gray-950 sm:text-5xl">
              {campaign.discountLabel} untuk {campaign.packageName}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              Pakai kode dari {partner.partnerName}. Kode akan otomatis masuk ke pesan WhatsApp supaya tim Sundaf Trip tahu promo mana yang kamu klaim.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <UserRound size={15} />
                  Partner
                </div>
                <p className="text-lg font-black text-gray-950">{partner.partnerName}</p>
                <p className="text-sm text-gray-500">{PARTNER_TYPE_LABEL[partner.partnerType] ?? partner.partnerType}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <Ticket size={15} />
                  Kode Referral
                </div>
                <p className="font-mono text-2xl font-black tracking-wide text-gray-950">{partner.referralCode}</p>
                <p className="text-sm text-gray-500">{campaign.campaignName}</p>
              </div>
            </div>
          </header>

          <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            {heroImage && (
              <div
                role="img"
                aria-label={`Foto ${matchedTour?.title ?? campaign.packageName}`}
                className="min-h-48 bg-cover bg-center sm:min-h-64"
                style={{ backgroundImage: `url(${heroImage})` }}
              />
            )}
            <div className="p-5 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-800">
                  <Plane size={13} />
                  Overview Trip
                </span>
                <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                  {campaign.discountLabel}
                </span>
              </div>
              <h2 className="text-2xl font-black leading-tight text-gray-950">
                {matchedTour?.title ?? campaign.packageName}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
                {tripDescription}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                  <MapPin className="mt-0.5 text-teal-700" size={17} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Destinasi</p>
                    <p className="text-sm font-semibold text-gray-950">
                      {matchedTour?.cityHighlight || matchedTour?.country || campaign.packageName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                  <CalendarDays className="mt-0.5 text-teal-700" size={17} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Jadwal</p>
                    <p className="text-sm font-semibold text-gray-950">
                      {matchedTour?.tripDate ? formatDate(matchedTour.tripDate) : "Konfirmasi via WhatsApp"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                  <Sparkles className="mt-0.5 text-teal-700" size={17} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Durasi</p>
                    <p className="text-sm font-semibold text-gray-950">{matchedTour?.duration || "Mengikuti paket"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                  <Banknote className="mt-0.5 text-teal-700" size={17} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Harga paket</p>
                    <p className="text-sm font-semibold text-gray-950">
                      {tourPrice ? `Mulai ${formatCurrency(tourPrice)}` : "Konfirmasi seat dan harga"}
                    </p>
                  </div>
                </div>
              </div>

              {highlights.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Yang akan dibahas saat konsultasi</p>
                  <ul className="mt-2 space-y-2 text-sm leading-6 text-gray-700">
                    {highlights.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tourHref && (
                <Link href={tourHref} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-bold text-gray-900 transition hover:bg-gray-50">
                  Lihat detail trip
                </Link>
              )}
            </div>
          </article>
        </div>

        <aside className="rounded-lg border border-gray-200 bg-white p-5 shadow-lg shadow-gray-200/60 sm:p-6 lg:sticky lg:top-24">
          <div className="mb-5 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Klaim via WhatsApp</p>
            <h2 className="text-2xl font-black text-gray-950">{partner.referralCode}</h2>
            <p className="text-sm text-gray-500">{campaign.discountLabel} untuk {campaign.packageName}</p>
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

          <div className="mt-5 border-t border-gray-200 pt-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Pesan WhatsApp otomatis membawa kode referral.</p>
            <p className="mt-1">Tim Sundaf Trip tetap akan mengonfirmasi seat, jadwal, harga final, dan syarat promo sebelum booking.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
