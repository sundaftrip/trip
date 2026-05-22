/* Shared B2B land-tour pitch for Indonesian travel agents.
   Rendered by /partner (with co-founder) and /b2b (without). Single
   content source so the two pages never drift apart. Bilingual ID/EN —
   follows the site-wide language stored in localStorage. */
"use client";

import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Building2, Compass, CheckCircle2, Phone, Mail, Download,
  Hotel, Bus, Utensils, Ticket, UserCheck, Route, MapPin,
} from "lucide-react";
import { lora } from "@/lib/fonts";

type Lang = "id" | "en";
type Bi = { id: string; en: string };

const HERO = {
  eyebrow: { id: "Operator Land Tour · B2B", en: "Land Tour Operator · B2B" },
  title: {
    id: "Land Operator Anda untuk Rusia, Asia Tengah & India",
    en: "Your Land Operator for Russia, Central Asia & India",
  },
  intro: {
    id: "Sundaf Trip adalah land tour operator. Travel agent mengirimkan grupnya, dan kami yang menangani seluruh operasional di destinasi — hotel, transportasi, makan, tiket atraksi, hingga tour leader. Anda fokus menjual; kami memastikan perjalanannya berjalan mulus.",
    en: "Sundaf Trip is a land tour operator. Travel agents send their groups, and we handle the entire operation on the ground — hotels, transport, meals, attraction tickets, and tour leadership. You focus on selling; we make sure the trip runs smoothly.",
  },
};

const POSITIONING = {
  title: { id: "Anda jual, kami yang operasikan", en: "You sell, we operate" },
  body: {
    id: "Sundaf Trip — CV Sundaf Holiday Group — adalah pemasok (supplier) land tour spesialis Rusia, Asia Tengah, dan India untuk travel agent di Indonesia.",
    en: "Sundaf Trip — CV Sundaf Holiday Group — is a land tour supplier specializing in Russia, Central Asia, and India for travel agents in Indonesia.",
  },
};

const COVERAGE: { Icon: LucideIcon; title: Bi; desc: Bi }[] = [
  {
    Icon: Hotel,
    title: { id: "Akomodasi", en: "Accommodation" },
    desc: {
      id: "Hotel terkurasi di lokasi strategis dan nyaman untuk grup.",
      en: "Hand-picked hotels in convenient, strategic locations for groups.",
    },
  },
  {
    Icon: Bus,
    title: { id: "Transportasi Darat", en: "Ground Transport" },
    desc: {
      id: "Coach atau minibus private dengan sopir berpengalaman.",
      en: "Private coach or minibus with experienced drivers.",
    },
  },
  {
    Icon: Utensils,
    title: { id: "Pengaturan Makan", en: "Meal Arrangements" },
    desc: {
      id: "Makan terjadwal, fleksibel — termasuk opsi halal.",
      en: "Scheduled meals, flexible — including halal options.",
    },
  },
  {
    Icon: Ticket,
    title: { id: "Tiket Atraksi", en: "Attraction Tickets" },
    desc: {
      id: "Tiket masuk objek wisata utama di setiap destinasi.",
      en: "Entrance tickets to the main attractions at each destination.",
    },
  },
  {
    Icon: UserCheck,
    title: { id: "Tour Leader", en: "Tour Leader" },
    desc: {
      id: "Tour leader berbahasa Indonesia mendampingi grup secara penuh.",
      en: "An Indonesian-speaking tour leader accompanies the group throughout.",
    },
  },
  {
    Icon: Route,
    title: { id: "Desain Itinerary", en: "Itinerary Design" },
    desc: {
      id: "Itinerary dirancang sesuai tema, budget, dan preferensi grup.",
      en: "Itineraries designed around the group's theme, budget, and preferences.",
    },
  },
];

const DESTINATIONS: { region: Bi; detail: Bi }[] = [
  {
    region: { id: "Rusia", en: "Russia" },
    detail: { id: "Moscow · St. Petersburg · Murmansk (aurora)", en: "Moscow · St. Petersburg · Murmansk (aurora)" },
  },
  {
    region: { id: "Asia Tengah", en: "Central Asia" },
    detail: { id: "Kazakhstan · Uzbekistan · Kyrgyzstan · Tajikistan", en: "Kazakhstan · Uzbekistan · Kyrgyzstan · Tajikistan" },
  },
  {
    region: { id: "India", en: "India" },
    detail: { id: "Rute budaya & heritage", en: "Cultural & heritage routes" },
  },
  {
    region: { id: "Berkembang ke", en: "Expanding to" },
    detail: { id: "Eropa Barat & Skandinavia", en: "Western Europe & Scandinavia" },
  },
];

const WHY: Bi[] = [
  {
    id: "Rekam jejak nyata — 20+ grup dan 700+ traveler dioperasikan sepanjang 2025.",
    en: "A real track record — 20+ groups and 700+ travelers operated through 2025.",
  },
  {
    id: "Spesialis grup kecil 10–20 pax — operasional fokus dan terkoordinasi.",
    en: "Small group specialists, 10–20 pax — focused, well-coordinated operations.",
  },
  {
    id: "Tour leader sendiri, berbahasa Indonesia, di setiap keberangkatan.",
    en: "Our own Indonesian-speaking tour leader on every departure.",
  },
  {
    id: "Harga land tour kompetitif dengan rincian transparan — tanpa biaya tersembunyi.",
    en: "Competitive land tour pricing with transparent breakdowns — no hidden costs.",
  },
  {
    id: "Komunikasi responsif via WhatsApp dan email sepanjang proses.",
    en: "Responsive communication via WhatsApp and email throughout.",
  },
];

const STEPS: { n: string; title: Bi; desc: Bi }[] = [
  {
    n: "1",
    title: { id: "Konsultasi", en: "Consultation" },
    desc: {
      id: "Sampaikan rencana grup Anda — destinasi, tanggal, jumlah pax, dan kisaran budget.",
      en: "Share your group plan — destination, dates, pax count, and budget range.",
    },
  },
  {
    n: "2",
    title: { id: "Penawaran", en: "Quotation" },
    desc: {
      id: "Kami susun penawaran land tour terinci: hotel, transport, makan, tiket, dan tour leader.",
      en: "We prepare a detailed land tour quotation: hotels, transport, meals, tickets, and tour leader.",
    },
  },
  {
    n: "3",
    title: { id: "Konfirmasi", en: "Confirmation" },
    desc: {
      id: "Review bersama, negosiasi, lalu finalisasi paket dan jadwal.",
      en: "Review together, negotiate, then finalize the package and schedule.",
    },
  },
  {
    n: "4",
    title: { id: "Operasional", en: "Operations" },
    desc: {
      id: "Kami jalankan seluruh perjalanan di destinasi — Anda cukup memantau.",
      en: "We run the entire trip on the ground — you simply monitor.",
    },
  },
  {
    n: "5",
    title: { id: "Laporan", en: "Report" },
    desc: {
      id: "Umpan balik pasca-trip untuk menyempurnakan keberangkatan berikutnya.",
      en: "Post-trip feedback to refine the next departure.",
    },
  },
];

const PHOTOS: { src: string; caption: Bi }[] = [
  { src: "/trip-photos/trip-1.jpg", caption: { id: "Red Square · Moscow", en: "Red Square · Moscow" } },
  { src: "/trip-photos/trip-4.jpg", caption: { id: "Danau Kaindy · Kazakhstan", en: "Kaindy Lake · Kazakhstan" } },
  { src: "/trip-photos/trip-6.jpg", caption: { id: "Keberangkatan grup · Moscow", en: "Group departure · Moscow" } },
];

const FOUNDERS: { initial: string; name: string; role: Bi; desc: Bi }[] = [
  {
    initial: "F",
    name: "Ferdiansah",
    role: { id: "Founder", en: "Founder" },
    desc: {
      id: "Memimpin operasional Sundaf Trip — pengelolaan vendor, negosiasi, perancangan itinerary, hingga eksekusi perjalanan di lapangan.",
      en: "Leads Sundaf Trip's operations — vendor management, negotiation, itinerary design, and on-the-ground execution.",
    },
  },
  {
    initial: "B",
    name: "Billy",
    role: { id: "Co-Founder", en: "Co-Founder" },
    desc: {
      id: "Berpengalaman di industri travel dan memimpin perjalanan grup internasional. Memegang pengembangan kemitraan dan hubungan dengan travel agent.",
      en: "Experienced in the travel industry and in leading international group trips. Drives partnership development and travel agent relations.",
    },
  },
];

const T = {
  coverageHead: { id: "Yang Kami Tangani di Destinasi", en: "What We Handle on the Ground" },
  destHead: { id: "Destinasi yang Kami Layani", en: "Destinations We Serve" },
  whyHead: { id: "Kenapa Land Tour Sundaf Trip", en: "Why Sundaf Trip Land Tours" },
  howHead: { id: "Cara Kerja Sama", en: "How We Work Together" },
  photosHead: { id: "Keberangkatan Nyata", en: "Real Departures" },
  photosSub: {
    id: "Sebagian grup yang telah kami operasikan di Rusia, Asia Tengah, dan sekitarnya.",
    en: "A selection of groups we have operated in Russia, Central Asia, and beyond.",
  },
  foundersHead: { id: "Pendiri Sundaf Trip", en: "Sundaf Trip Founders" },
  ctaHead: { id: "Kirim Grup Anda Bersama Kami", en: "Send Your Groups With Us" },
  ctaBody: {
    id: "Ceritakan rencana grup Anda — kami siapkan penawaran land tour-nya. Kami merespons setiap pertanyaan.",
    en: "Tell us your group plan — we'll prepare the land tour quotation. We respond to every enquiry.",
  },
  ctaWa: { id: "Hubungi via WhatsApp", en: "Contact via WhatsApp" },
  ctaPdf: { id: "Unduh Company Profile", en: "Download Company Profile" },
};

export default function B2BLandTour({ withCofounder = false }: { withCofounder?: boolean }) {
  const [lang, setLang] = useState<Lang>("id");
  useEffect(() => {
    const s = localStorage.getItem("lang");
    if (s === "en" || s === "id") setLang(s);
  }, []);
  const t = (v: Bi) => v[lang];

  const founders = withCofounder ? FOUNDERS : FOUNDERS.slice(0, 1);
  const head = `text-2xl font-bold text-gray-900 dark:text-white ${lora.className}`;

  return (
    <div className="min-h-screen pt-24 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Hero ── */}
        <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">
          {t(HERO.eyebrow)}
        </span>
        <h1 className={`text-4xl lg:text-5xl font-bold leading-tight mb-5 text-gray-900 dark:text-white ${lora.className}`}>
          {t(HERO.title)}
        </h1>
        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          {t(HERO.intro)}
        </p>

        {/* ── Positioning ── */}
        <div className="mt-8 flex items-start gap-3 p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <Building2 size={18} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-sm">
            <p className="font-bold text-gray-900 dark:text-white">{t(POSITIONING.title)}</p>
            <p className="mt-1 text-gray-500 dark:text-gray-400">{t(POSITIONING.body)}</p>
          </div>
        </div>

        {/* ── Coverage ── */}
        <h2 className={`mt-12 mb-5 ${head}`}>{t(T.coverageHead)}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COVERAGE.map(({ Icon, title, desc }) => (
            <div key={title.en} className="flex items-start gap-3 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                <Icon size={17} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{t(title)}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(desc)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Destinations ── */}
        <h2 className={`mt-12 mb-5 ${head}`}>{t(T.destHead)}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DESTINATIONS.map(({ region, detail }) => (
            <div key={region.en} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <MapPin size={15} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{t(region)}</p>
                <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">{t(detail)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Why ── */}
        <h2 className={`mt-12 mb-5 ${head}`}>{t(T.whyHead)}</h2>
        <div className="space-y-3">
          {WHY.map((point) => (
            <div key={point.en} className="flex items-start gap-3">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(point)}</p>
            </div>
          ))}
        </div>

        {/* ── How we work ── */}
        <h2 className={`mt-12 mb-5 ${head}`}>{t(T.howHead)}</h2>
        <div className="space-y-3">
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                {n}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{t(title)}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(desc)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Real departures ── */}
        <h2 className={`mt-12 mb-1 ${head}`}>{t(T.photosHead)}</h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">{t(T.photosSub)}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PHOTOS.map(({ src, caption }) => (
            <div key={src} className="relative aspect-[3/2] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={t(caption)} loading="lazy" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pt-8 pb-2">
                <p className="text-[11px] font-semibold text-white">{t(caption)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Founders ── */}
        <h2 className={`mt-12 mb-5 ${head}`}>{t(T.foundersHead)}</h2>
        <div className={`grid gap-4 ${withCofounder ? "sm:grid-cols-2" : "grid-cols-1"}`}>
          {founders.map(({ initial, name, role, desc }) => (
            <div key={name} className="p-5 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                  {initial}
                </div>
                <div>
                  <p className={`text-lg font-bold text-gray-900 dark:text-white leading-tight ${lora.className}`}>{name}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">{t(role)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(desc)}</p>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="mt-12 p-6 rounded-2xl bg-gray-900 dark:bg-gray-800 text-center">
          <h2 className={`text-2xl font-bold text-white mb-2 ${lora.className}`}>{t(T.ctaHead)}</h2>
          <p className="text-sm text-gray-300 mb-6">{t(T.ctaBody)}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/6281775202759"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              <Phone size={16} /> {t(T.ctaWa)}
            </a>
            <a
              href="/sundaftrip-company-profile.pdf"
              download
              className="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm rounded-xl border border-gray-600 text-gray-200 hover:bg-gray-800 transition"
            >
              <Download size={16} /> {t(T.ctaPdf)}
            </a>
          </div>
          <div className="mt-5 flex flex-col sm:flex-row gap-x-6 gap-y-1 justify-center text-xs text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={12} /> info@sundaftrip.com
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Compass size={12} /> CV Sundaf Holiday Group · NIB 1601260060842
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
