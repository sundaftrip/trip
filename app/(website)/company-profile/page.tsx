import type { Metadata } from "next";
import {
  Building2, MapPin, Mail, Download, ShieldCheck,
  Compass, CheckCircle2, Phone, Globe,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Company Profile — Sundaf Trip",
  description:
    "Company profile of Sundaf Trip — an Indonesia-based small group tour "
    + "operator under CV Sundaf Holiday Group. Track record, services, "
    + "destinations, and contact details.",
};

const STATS = [
  { num: "20+", label: "Groups operated in 2025" },
  { num: "700+", label: "Travelers served" },
  { num: "10–20", label: "Pax per departure" },
  { num: "B2C + B2B", label: "Business model" },
];

const SERVICES = [
  {
    title: "Small Group Tours",
    desc: "Curated international tours for groups of 10–20 pax, with a personal touch and flexible itineraries.",
  },
  {
    title: "End-to-End Coordination",
    desc: "Flights, accommodation, ground transport, meals, and attraction tickets — all organized under one roof.",
  },
  {
    title: "Tour Leadership",
    desc: "Every departure is accompanied by our own Indonesian-speaking tour leader, from start to return.",
  },
  {
    title: "Budget-Friendly Packages",
    desc: "Value-for-money packages that make international travel accessible to more Indonesian travelers.",
  },
  {
    title: "Custom Itinerary Design",
    desc: "We design itineraries from scratch based on destination appeal, budget, and traveler preferences.",
  },
  {
    title: "Content & Documentation",
    desc: "In-house content production — branded visuals, travel stories, and full trip documentation.",
  },
];

const WHY = [
  "Proven track record — 20+ groups and 700+ travelers operated in 2025.",
  "Small group sizes of 10–20 pax for focused, well-coordinated operations.",
  "Our own Indonesian-speaking tour leader on every single departure.",
  "End-to-end operations: structured itineraries, clear communication, on-time coordination.",
  "Long-term mindset — we build lasting relationships with partners and travelers.",
];

const SNAPSHOT: [string, string][] = [
  ["Legal Entity", "CV Sundaf Holiday Group"],
  ["Business License (NIB)", "1601260060842"],
  ["Headquarters", "Jakarta, Indonesia"],
  ["Founder", "Ferdiansah"],
  ["Business Model", "B2C + B2B Tour Operator"],
  ["Tour Leadership", "Own Indonesian-speaking tour leader"],
];

const PHOTOS = [
  { src: "/trip-photos/trip-1.jpg", caption: "Red Square · Moscow" },
  { src: "/trip-photos/trip-4.jpg", caption: "Kaindy Lake · Kazakhstan" },
  { src: "/trip-photos/trip-6.jpg", caption: "Group departure · Moscow" },
];

export default function CompanyProfilePage() {
  return (
    <div className="min-h-screen pt-24 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Hero ── */}
        <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">
          Company Profile
        </span>
        <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-5 text-gray-900 dark:text-white">
          Sundaf Trip
        </h1>
        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          Sundaf Trip is an Indonesia-based tour operator under CV Sundaf
          Holiday Group, running affordable, well-curated small group tours to
          international destinations. We handle every trip end-to-end —
          itinerary design, ground coordination, and on-ground tour
          leadership — so each journey is safe, enjoyable, and memorable.
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

        {/* ── Stats ── */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map(({ num, label }) => (
            <div
              key={label}
              className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-center"
            >
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{num}</p>
              <p className="mt-1 text-[11px] leading-tight text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* ── About ── */}
        <h2 className="mt-12 mb-4 text-2xl font-black text-gray-900 dark:text-white">
          About Us
        </h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          Founded by Ferdiansah, Sundaf Trip was built on the belief that
          international travel should be accessible to more people. We
          specialize in small group departures with personal attention —
          giving travelers a high-value experience without the price tag of a
          private trip.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          From sourcing vendors and negotiating ground arrangements to
          designing itineraries and leading the group on location, our team
          manages the full operation in-house — keeping quality and cost under
          one roof.
        </p>

        {/* ── Services ── */}
        <h2 className="mt-12 mb-5 text-2xl font-black text-gray-900 dark:text-white">
          Our Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SERVICES.map(({ title, desc }) => (
            <div
              key={title}
              className="p-5 rounded-xl border border-gray-100 dark:border-gray-800"
            >
              <p className="font-black text-gray-900 dark:text-white">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>

        {/* ── Destinations ── */}
        <h2 className="mt-12 mb-5 text-2xl font-black text-gray-900 dark:text-white">
          Destinations We Serve
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <MapPin size={15} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-black text-sm text-gray-900 dark:text-white">Current</p>
              <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">
                Russia (Moscow · St. Petersburg · Murmansk), Central Asia, and India
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <Compass size={15} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-black text-sm text-gray-900 dark:text-white">Expanding To</p>
              <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">
                Western Europe and Scandinavia
              </p>
            </div>
          </div>
        </div>

        {/* ── Why ── */}
        <h2 className="mt-12 mb-5 text-2xl font-black text-gray-900 dark:text-white">
          Why Sundaf Trip
        </h2>
        <div className="space-y-3">
          {WHY.map((point) => (
            <div key={point} className="flex items-start gap-3">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{point}</p>
            </div>
          ))}
        </div>

        {/* ── Real departures ── */}
        <h2 className="mt-12 mb-1 text-2xl font-black text-gray-900 dark:text-white">
          Real Departures
        </h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          A glimpse of groups we have operated across Russia, Central Asia, and beyond.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PHOTOS.map(({ src, caption }) => (
            <div
              key={src}
              className="relative aspect-[3/2] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={caption} loading="lazy" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pt-8 pb-2">
                <p className="text-[11px] font-semibold text-white">{caption}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Company snapshot ── */}
        <h2 className="mt-12 mb-5 text-2xl font-black text-gray-900 dark:text-white">
          Company Snapshot
        </h2>
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {SNAPSHOT.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-5 py-3">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{k}</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white text-right">{v}</span>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="mt-12 p-6 rounded-2xl bg-gray-900 dark:bg-gray-800 text-center">
          <h2 className="text-2xl font-black text-white mb-2">Work With Sundaf Trip</h2>
          <p className="text-sm text-gray-300 mb-6">
            Download our full company profile, or reach out directly — we
            respond to every enquiry.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/sundaftrip-company-profile.pdf"
              download
              className="inline-flex items-center justify-center gap-2 px-6 py-3 font-black text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              <Download size={16} /> Download Company Profile (PDF)
            </a>
            <a
              href="https://wa.me/6281775202759"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 font-black text-sm rounded-xl border border-gray-600 text-gray-200 hover:bg-gray-800 transition"
            >
              <Phone size={16} /> WhatsApp Us
            </a>
          </div>
          <div className="mt-5 flex flex-col sm:flex-row gap-x-6 gap-y-1 justify-center text-xs text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={12} /> info@sundaftrip.com
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Globe size={12} /> sundaftrip.com
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
