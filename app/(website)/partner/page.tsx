import type { Metadata } from "next";
import {
  Building2,
  MapPin,
  Mail,
  Download,
  ShieldCheck,
  Briefcase,
  Handshake,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Partner with Sundaf Trip",
  description:
    "B2B and partnership information for Sundaf Trip — an Indonesia-based small group tour operator and land tour provider.",
  robots: { index: false, follow: false },
};

const DESTINATIONS = [
  { label: "Russia", sub: "Moscow · St. Petersburg · Murmansk" },
  { label: "Central Asia", sub: "Kazakhstan · Uzbekistan · Kyrgyzstan · Tajikistan" },
  { label: "India", sub: "Cultural & heritage routes" },
  { label: "Expanding to", sub: "Western Europe · Scandinavia" },
];

const MODES = [
  {
    Icon: Briefcase,
    title: "We Are Your Land Operator",
    audience: "For travel agents & organizers in Indonesia",
    desc: "Send your group to Russia, Central Asia, or India and let us handle the ground operation end-to-end — itinerary design, Indonesian-speaking tour leader, hotels, transport, meals, and attraction tickets. You focus on selling; we deliver the trip. In 2025 we operated 20+ groups carrying 700+ travelers for travel agencies across Indonesia.",
  },
  {
    Icon: Handshake,
    title: "Become Our DMC Partner",
    audience: "For overseas DMCs & ground handlers",
    desc: "Our departures run in small groups of 10–20 pax, accompanied by our own Indonesian-speaking tour leader. Your team handles local logistics — drivers, hotel check-ins, and on-the-ground coordination. We are looking for reliable long-term partners to grow with, not one-off deals.",
  },
];

const TRIP_PHOTOS = [
  { src: "/trip-photos/trip-1.jpg", caption: "Group departure · Kazakhstan" },
  { src: "/trip-photos/trip-2.jpg", caption: "Red Square · Moscow" },
  { src: "/trip-photos/trip-3.jpg", caption: "Aurora borealis tour" },
  { src: "/trip-photos/trip-4.jpg", caption: "Kaindy Lake · Kazakhstan" },
  { src: "/trip-photos/trip-5.jpg", caption: "Almaty Mountains · Kazakhstan" },
  { src: "/trip-photos/trip-6.jpg", caption: "Northern Lights · full group" },
];

export default function PartnerPage() {
  return (
    <div className="min-h-screen pt-24 bg-white dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Hero ── */}
        <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">
          Partnership · B2B
        </span>
        <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-5 text-gray-900 dark:text-white">
          Partner with Sundaf Trip
        </h1>
        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          Sundaf Trip is an Indonesia-based tour operator running our own
          affordable, well-curated small group tours — and a B2B land tour
          provider. We deliver complete ground arrangements for travel agents
          sending groups to Russia, Central Asia, and India, and we partner
          with DMCs abroad to support our own departures.
        </p>

        {/* ── Legal entity ── */}
        <div className="mt-8 flex items-start gap-3 p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <Building2 size={18} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-sm">
            <p className="font-black text-gray-900 dark:text-white">
              CV Sundaf Holiday Group
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <ShieldCheck size={13} /> Registered business · NIB 1601260060842
            </p>
            <p className="mt-0.5 text-gray-500 dark:text-gray-400">
              Based in Jakarta, Indonesia · B2C + B2B tour operator
            </p>
          </div>
        </div>

        {/* ── Two ways to work with us ── */}
        <h2 className="mt-12 mb-5 text-2xl font-black text-gray-900 dark:text-white">
          Two Ways to Work With Us
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MODES.map(({ Icon, title, audience, desc }) => (
            <div
              key={title}
              className="flex flex-col p-5 rounded-xl border border-gray-100 dark:border-gray-800"
            >
              <div className="w-10 h-10 mb-3 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
                <Icon size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-black text-gray-900 dark:text-white">
                {title}
              </p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                {audience}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── Trip photos ── */}
        <h2 className="mt-12 mb-1 text-2xl font-black text-gray-900 dark:text-white">
          Real Departures, Real Travelers
        </h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          A look at groups we have operated across Russia and Central Asia.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TRIP_PHOTOS.map(({ src, caption }) => (
            <div
              key={src}
              className="relative aspect-[3/2] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={caption}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pt-8 pb-2">
                <p className="text-[11px] font-semibold text-white">
                  {caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Destinations ── */}
        <h2 className="mt-12 mb-5 text-2xl font-black text-gray-900 dark:text-white">
          Destinations We Serve
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DESTINATIONS.map(({ label, sub }) => (
            <div
              key={label}
              className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800"
            >
              <MapPin size={15} className="mt-0.5 shrink-0 text-gray-400" />
              <div>
                <p className="font-black text-sm text-gray-900 dark:text-white">
                  {label}
                </p>
                <p className="text-xs mt-0.5 text-gray-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="mt-12 p-6 rounded-2xl bg-gray-900 dark:bg-gray-800 text-center">
          <h2 className="text-2xl font-black text-white mb-2">
            Let&apos;s Talk Partnership
          </h2>
          <p className="text-sm text-gray-300 mb-6">
            Whether you need a land operator or want to partner as a DMC —
            download our company profile or reach out directly. We respond to
            every enquiry.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:info@sundaftrip.com?subject=Partnership%20Enquiry%20%E2%80%94%20Sundaf%20Trip"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 font-black text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              <Mail size={16} /> Contact Us for Partnership
            </a>
            <a
              href="/sundaftrip-company-profile.pdf"
              download
              className="inline-flex items-center justify-center gap-2 px-6 py-3 font-black text-sm rounded-xl border border-gray-600 text-gray-200 hover:bg-gray-800 transition"
            >
              <Download size={16} /> Download Company Profile (PDF)
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
