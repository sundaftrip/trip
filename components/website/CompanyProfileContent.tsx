/* Company profile page content — credibility page aimed at DMC partners.
   Bilingual ID/EN, follows the site-wide language in localStorage. */
"use client";

import { useState, useEffect } from "react";
import {
  Building2, MapPin, Compass, CheckCircle2, Phone, Mail, Download, ShieldCheck,
} from "lucide-react";
import { lora } from "@/lib/fonts";

type Lang = "id" | "en";
type Bi = { id: string; en: string };

const HERO = {
  eyebrow: { id: "Profil Perusahaan", en: "Company Profile" },
  intro: {
    id: "Sundaf Trip adalah tour operator asal Indonesia di bawah CV Sundaf Holiday Group, menjalankan tur grup kecil yang terjangkau dan terkurasi ke berbagai destinasi internasional. Kami menangani setiap perjalanan secara menyeluruh — perancangan itinerary, koordinasi darat, hingga kepemimpinan tur di lapangan.",
    en: "Sundaf Trip is an Indonesia-based tour operator under CV Sundaf Holiday Group, running affordable, well-curated small group tours to international destinations. We handle every trip end-to-end — itinerary design, ground coordination, and on-ground tour leadership.",
  },
  legalLine1: {
    id: "Badan usaha terdaftar · NIB 1601260060842",
    en: "Registered business · NIB 1601260060842",
  },
  legalLine2: {
    id: "Berbasis di Jakarta, Indonesia · Tour operator B2C + B2B",
    en: "Based in Jakarta, Indonesia · B2C + B2B tour operator",
  },
};

const STATS: { num: string; label: Bi }[] = [
  { num: "20+", label: { id: "Grup dioperasikan pada 2025", en: "Groups operated in 2025" } },
  { num: "700+", label: { id: "Traveler dilayani", en: "Travelers served" } },
  { num: "10–20", label: { id: "Pax per keberangkatan", en: "Pax per departure" } },
  { num: "B2C + B2B", label: { id: "Model bisnis", en: "Business model" } },
];

const ABOUT: Bi[] = [
  {
    id: "Didirikan oleh Ferdiansah, Sundaf Trip lahir dari keyakinan bahwa perjalanan internasional seharusnya bisa dijangkau lebih banyak orang. Kami berfokus pada keberangkatan grup kecil dengan perhatian personal — memberi traveler pengalaman bernilai tinggi tanpa harga setinggi private trip.",
    en: "Founded by Ferdiansah, Sundaf Trip was built on the belief that international travel should be accessible to more people. We focus on small group departures with personal attention — giving travelers a high-value experience without the price tag of a private trip.",
  },
  {
    id: "Dari mencari vendor dan menegosiasikan pengaturan darat hingga merancang itinerary dan memimpin grup di lokasi, tim kami mengelola seluruh operasional secara in-house — menjaga kualitas dan biaya dalam satu atap.",
    en: "From sourcing vendors and negotiating ground arrangements to designing itineraries and leading groups on location, our team manages the full operation in-house — keeping quality and cost under one roof.",
  },
];

const SERVICES: { title: Bi; desc: Bi }[] = [
  {
    title: { id: "Tur Grup Kecil", en: "Small Group Tours" },
    desc: {
      id: "Tur internasional terkurasi untuk grup 10–20 pax, dengan sentuhan personal dan itinerary fleksibel.",
      en: "Curated international tours for groups of 10–20 pax, with a personal touch and flexible itineraries.",
    },
  },
  {
    title: { id: "Koordinasi Menyeluruh", en: "End-to-End Coordination" },
    desc: {
      id: "Penerbangan, akomodasi, transportasi darat, makan, dan tiket atraksi — diatur dalam satu atap.",
      en: "Flights, accommodation, ground transport, meals, and attraction tickets — organized under one roof.",
    },
  },
  {
    title: { id: "Kepemimpinan Tur", en: "Tour Leadership" },
    desc: {
      id: "Setiap keberangkatan didampingi tour leader kami sendiri yang berbahasa Indonesia.",
      en: "Every departure is accompanied by our own Indonesian-speaking tour leader.",
    },
  },
  {
    title: { id: "Paket Ramah Budget", en: "Budget-Friendly Packages" },
    desc: {
      id: "Paket bernilai yang membuat perjalanan internasional terjangkau bagi lebih banyak traveler Indonesia.",
      en: "Value-for-money packages that make international travel accessible to more Indonesian travelers.",
    },
  },
  {
    title: { id: "Desain Itinerary Kustom", en: "Custom Itinerary Design" },
    desc: {
      id: "Kami merancang itinerary dari nol sesuai daya tarik destinasi, budget, dan preferensi traveler.",
      en: "We design itineraries from scratch based on destination appeal, budget, and traveler preferences.",
    },
  },
  {
    title: { id: "Konten & Dokumentasi", en: "Content & Documentation" },
    desc: {
      id: "Produksi konten in-house — visual brand, cerita perjalanan, dan dokumentasi trip lengkap.",
      en: "In-house content production — branded visuals, travel stories, and full trip documentation.",
    },
  },
];

const DESTINATIONS: { label: Bi; detail: Bi }[] = [
  {
    label: { id: "Saat Ini", en: "Current" },
    detail: {
      id: "Rusia (Moscow · St. Petersburg · Murmansk), Asia Tengah, dan India",
      en: "Russia (Moscow · St. Petersburg · Murmansk), Central Asia, and India",
    },
  },
  {
    label: { id: "Berkembang ke", en: "Expanding To" },
    detail: { id: "Eropa Barat dan Skandinavia", en: "Western Europe and Scandinavia" },
  },
];

const WHY: Bi[] = [
  {
    id: "Rekam jejak terbukti — 20+ grup dan 700+ traveler dioperasikan sepanjang 2025.",
    en: "A proven track record — 20+ groups and 700+ travelers operated through 2025.",
  },
  {
    id: "Spesialis grup kecil 10–20 pax untuk operasional yang fokus dan terkoordinasi.",
    en: "Small group specialists, 10–20 pax, for focused and well-coordinated operations.",
  },
  {
    id: "Tour leader sendiri, berbahasa Indonesia, di setiap keberangkatan.",
    en: "Our own Indonesian-speaking tour leader on every departure.",
  },
  {
    id: "Operasional menyeluruh: itinerary terstruktur, komunikasi jelas, koordinasi tepat waktu.",
    en: "End-to-end operations: structured itineraries, clear communication, on-time coordination.",
  },
  {
    id: "Berpikir jangka panjang — kami membangun hubungan yang langgeng dengan mitra dan traveler.",
    en: "A long-term mindset — we build lasting relationships with partners and travelers.",
  },
];

const DMC_STEPS: { n: string; title: Bi; desc: Bi }[] = [
  {
    n: "1",
    title: { id: "Perencanaan Itinerary", en: "Itinerary Planning" },
    desc: {
      id: "Kami sampaikan rute, destinasi, ukuran grup, tanggal, dan kisaran budget. Masukan Anda berdasarkan pengetahuan lokal sangat kami harapkan.",
      en: "We share our route, destinations, group size, dates, and budget range. Your suggestions based on local knowledge are very welcome.",
    },
  },
  {
    n: "2",
    title: { id: "Penawaran & Kesepakatan", en: "Quotation & Agreement" },
    desc: {
      id: "Mitra DMC memberikan penawaran terinci: hotel, transportasi, makan, dan tiket atraksi. Kami review, negosiasi, dan konfirmasi.",
      en: "The DMC partner provides a detailed quotation: hotels, transport, meals, and attraction tickets. We review, negotiate, and confirm.",
    },
  },
  {
    n: "3",
    title: { id: "Koordinasi Pra-Trip", en: "Pre-Trip Coordination" },
    desc: {
      id: "Rooming list final, kebutuhan diet, dan permintaan khusus dibagikan 3–4 minggu sebelum keberangkatan.",
      en: "Final rooming list, dietary needs, and special requests are shared 3–4 weeks before departure.",
    },
  },
  {
    n: "4",
    title: { id: "Eksekusi di Lapangan", en: "On-Ground Execution" },
    desc: {
      id: "Tour leader kami memimpin grup; mitra DMC menangani logistik lokal — sopir, check-in hotel, dan koordinasi harian.",
      en: "Our tour leader manages the group; the DMC partner handles local logistics — drivers, hotel check-ins, and daily coordination.",
    },
  },
  {
    n: "5",
    title: { id: "Tinjauan Pasca-Trip", en: "Post-Trip Review" },
    desc: {
      id: "Kami bagikan umpan balik traveler dan membahas perbaikan untuk keberangkatan berikutnya.",
      en: "We share traveler feedback and discuss improvements for future departures.",
    },
  },
];

const PHOTOS: { src: string; caption: Bi }[] = [
  { src: "/trip-photos/trip-1.jpg", caption: { id: "Red Square · Moscow", en: "Red Square · Moscow" } },
  { src: "/trip-photos/trip-4.jpg", caption: { id: "Danau Kaindy · Kazakhstan", en: "Kaindy Lake · Kazakhstan" } },
  { src: "/trip-photos/trip-6.jpg", caption: { id: "Keberangkatan grup · Moscow", en: "Group departure · Moscow" } },
];

const SNAPSHOT: { k: Bi; v: Bi }[] = [
  { k: { id: "Badan Usaha", en: "Legal Entity" }, v: { id: "CV Sundaf Holiday Group", en: "CV Sundaf Holiday Group" } },
  { k: { id: "Izin Usaha (NIB)", en: "Business License (NIB)" }, v: { id: "1601260060842", en: "1601260060842" } },
  { k: { id: "Kantor Pusat", en: "Headquarters" }, v: { id: "Jakarta, Indonesia", en: "Jakarta, Indonesia" } },
  { k: { id: "Pendiri", en: "Founder" }, v: { id: "Ferdiansah", en: "Ferdiansah" } },
  { k: { id: "Model Bisnis", en: "Business Model" }, v: { id: "Tour Operator B2C + B2B", en: "B2C + B2B Tour Operator" } },
  { k: { id: "Kepemimpinan Tur", en: "Tour Leadership" }, v: { id: "Tour leader sendiri berbahasa Indonesia", en: "Own Indonesian-speaking tour leader" } },
];

const T = {
  aboutHead: { id: "Tentang Kami", en: "About Us" },
  servicesHead: { id: "Layanan Kami", en: "Our Services" },
  destHead: { id: "Destinasi yang Kami Layani", en: "Destinations We Serve" },
  whyHead: { id: "Kenapa Sundaf Trip", en: "Why Sundaf Trip" },
  dmcHead: { id: "Cara Kami Bekerja dengan Mitra DMC", en: "How We Work With DMC Partners" },
  photosHead: { id: "Keberangkatan Nyata", en: "Real Departures" },
  photosSub: {
    id: "Sebagian grup yang telah kami operasikan di Rusia, Asia Tengah, dan sekitarnya.",
    en: "A selection of groups we have operated in Russia, Central Asia, and beyond.",
  },
  snapshotHead: { id: "Ringkasan Perusahaan", en: "Company Snapshot" },
  ctaHead: { id: "Bermitra dengan Sundaf Trip", en: "Partner With Sundaf Trip" },
  ctaBody: {
    id: "Unduh company profile lengkap kami, atau hubungi langsung — kami merespons setiap pertanyaan.",
    en: "Download our full company profile, or reach out directly — we respond to every enquiry.",
  },
  ctaWa: { id: "Hubungi via WhatsApp", en: "Contact via WhatsApp" },
  ctaPdf: { id: "Unduh Company Profile", en: "Download Company Profile" },
};

export default function CompanyProfileContent() {
  const [lang, setLang] = useState<Lang>("id");
  useEffect(() => {
    const s = localStorage.getItem("lang");
    if (s === "en" || s === "id") setLang(s);
  }, []);
  const t = (v: Bi) => v[lang];
  const head = `mt-12 mb-5 text-2xl font-bold text-gray-900 dark:text-white ${lora.className}`;

  return (
    <div className="min-h-screen pt-24 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Hero ── */}
        <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">
          {t(HERO.eyebrow)}
        </span>
        <h1 className={`text-4xl lg:text-5xl font-bold leading-tight mb-5 text-gray-900 dark:text-white ${lora.className}`}>
          Sundaf Trip
        </h1>
        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">{t(HERO.intro)}</p>

        {/* ── Legal entity ── */}
        <div className="mt-8 flex items-start gap-3 p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <Building2 size={18} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-sm">
            <p className="font-bold text-gray-900 dark:text-white">CV Sundaf Holiday Group</p>
            <p className="mt-1 flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <ShieldCheck size={13} /> {t(HERO.legalLine1)}
            </p>
            <p className="mt-0.5 text-gray-500 dark:text-gray-400">{t(HERO.legalLine2)}</p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map(({ num, label }) => (
            <div key={num} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
              <p className={`text-2xl font-bold text-blue-600 dark:text-blue-400 ${lora.className}`}>{num}</p>
              <p className="mt-1 text-[11px] leading-tight text-gray-500 dark:text-gray-400">{t(label)}</p>
            </div>
          ))}
        </div>

        {/* ── About ── */}
        <h2 className={head}>{t(T.aboutHead)}</h2>
        {ABOUT.map((p, i) => (
          <p key={i} className={`text-sm leading-relaxed text-gray-600 dark:text-gray-400 ${i > 0 ? "mt-3" : ""}`}>
            {t(p)}
          </p>
        ))}

        {/* ── Services ── */}
        <h2 className={head}>{t(T.servicesHead)}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SERVICES.map(({ title, desc }) => (
            <div key={title.en} className="p-5 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="font-bold text-gray-900 dark:text-white">{t(title)}</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(desc)}</p>
            </div>
          ))}
        </div>

        {/* ── Destinations ── */}
        <h2 className={head}>{t(T.destHead)}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DESTINATIONS.map(({ label, detail }) => (
            <div key={label.en} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              {label.en === "Current"
                ? <MapPin size={15} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                : <Compass size={15} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />}
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{t(label)}</p>
                <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">{t(detail)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Why ── */}
        <h2 className={head}>{t(T.whyHead)}</h2>
        <div className="space-y-3">
          {WHY.map((point) => (
            <div key={point.en} className="flex items-start gap-3">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t(point)}</p>
            </div>
          ))}
        </div>

        {/* ── How we work with DMC partners ── */}
        <h2 className={head}>{t(T.dmcHead)}</h2>
        <div className="space-y-3">
          {DMC_STEPS.map(({ n, title, desc }) => (
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
        <h2 className={`${head} mb-1`}>{t(T.photosHead)}</h2>
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

        {/* ── Company snapshot ── */}
        <h2 className={head}>{t(T.snapshotHead)}</h2>
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {SNAPSHOT.map(({ k, v }) => (
            <div key={k.en} className="flex justify-between gap-4 px-5 py-3">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{t(k)}</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white text-right">{t(v)}</span>
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
              <Compass size={12} /> sundaftrip.com
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
