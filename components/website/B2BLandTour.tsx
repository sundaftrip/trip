/* Shared B2B land-tour pitch for Indonesian travel agents (Bahasa Indonesia).
   /partner  → withCofounder: Billy sebagai sosok utama + PDF versi Billy.
   /b2b      → tanpa Billy: Ferdiansah + PDF tanpa Billy. */
import type { LucideIcon } from "lucide-react";
import {
  Building2, Compass, CheckCircle2, Phone, Mail, Download,
  Hotel, Bus, Utensils, Ticket, UserCheck, Route, MapPin,
} from "lucide-react";
import { lora } from "@/lib/fonts";
import { getProofPhotos } from "@/lib/b2bGallery";

const COVERAGE: { Icon: LucideIcon; title: string; desc: string }[] = [
  { Icon: Hotel, title: "Akomodasi", desc: "Hotel terkurasi di lokasi strategis dan nyaman untuk grup." },
  { Icon: Bus, title: "Transportasi Darat", desc: "Coach atau minibus private dengan sopir berpengalaman." },
  { Icon: Utensils, title: "Pengaturan Makan", desc: "Makan terjadwal, fleksibel, termasuk opsi halal." },
  { Icon: Ticket, title: "Tiket Atraksi", desc: "Tiket masuk objek wisata utama di setiap destinasi." },
  { Icon: UserCheck, title: "Tour Leader", desc: "Tour leader berbahasa Indonesia mendampingi grup secara penuh." },
  { Icon: Route, title: "Desain Itinerary", desc: "Itinerary dirancang sesuai tema, budget, dan preferensi grup." },
];

const DESTINATIONS: { region: string; detail: string }[] = [
  { region: "Rusia", detail: "Moscow · St. Petersburg · Murmansk (aurora)" },
  { region: "Asia Tengah", detail: "Kazakhstan · Uzbekistan · Kyrgyzstan · Tajikistan" },
  { region: "India", detail: "Rute budaya & heritage" },
  { region: "Berkembang ke", detail: "Eropa Barat & Skandinavia" },
];

const WHY: string[] = [
  "Rekam jejak nyata, 20+ grup dan 700+ traveler dioperasikan sepanjang 2025.",
  "Spesialis grup kecil 10–20 pax, operasional fokus dan terkoordinasi.",
  "Tour leader sendiri, berbahasa Indonesia, di setiap keberangkatan.",
  "Harga land tour kompetitif dengan rincian transparan, tanpa biaya tersembunyi.",
  "Komunikasi responsif via WhatsApp dan email sepanjang proses.",
];

const STEPS: { n: string; title: string; desc: string }[] = [
  { n: "1", title: "Konsultasi", desc: "Sampaikan rencana grup Anda, destinasi, tanggal, jumlah pax, dan kisaran budget." },
  { n: "2", title: "Penawaran", desc: "Kami susun penawaran land tour terinci: hotel, transport, makan, tiket, dan tour leader." },
  { n: "3", title: "Konfirmasi", desc: "Review bersama, negosiasi, lalu finalisasi paket dan jadwal." },
  { n: "4", title: "Operasional", desc: "Kami jalankan seluruh perjalanan di destinasi, Anda cukup memantau." },
  { n: "5", title: "Laporan", desc: "Umpan balik pasca-trip untuk menyempurnakan keberangkatan berikutnya." },
];


const FERDIANSAH = {
  initial: "F",
  name: "Ferdiansah",
  role: "Founder",
  photo: "",
  desc: "Memimpin operasional Sundaf Trip, pengelolaan vendor, negosiasi, perancangan itinerary, hingga eksekusi perjalanan di lapangan.",
};

const BILLY = {
  initial: "B",
  name: "Billy",
  role: "Co-Founder",
  photo: "/partner/billy.jpg",
  desc: "Berpengalaman di industri travel dan memimpin perjalanan grup internasional. Memegang pengembangan kemitraan dan hubungan dengan travel agent.",
};

export default function B2BLandTour({ withCofounder = false }: { withCofounder?: boolean }) {
  const proofPhotos = getProofPhotos();
  const person = withCofounder ? BILLY : FERDIANSAH;
  const pdfHref = withCofounder
    ? "/sundaftrip-company-profile-billy.pdf"
    : "/sundaftrip-company-profile.pdf";
  const head = `text-2xl font-bold text-gray-900 dark:text-white ${lora.className}`;

  return (
    <div className="min-h-screen pt-24 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Hero ── */}
        <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">
          Operator Land Tour · B2B
        </span>
        <h1 className={`text-4xl lg:text-5xl font-bold leading-tight mb-5 text-gray-900 dark:text-white ${lora.className}`}>
          Land Operator Anda untuk Rusia, Asia Tengah &amp; India
        </h1>
        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          Sundaf Trip adalah land tour operator. Travel agent mengirimkan
          grupnya, dan kami yang menangani seluruh operasional di destinasi,
          hotel, transportasi, makan, tiket atraksi, hingga tour leader. Anda
          fokus menjual; kami memastikan perjalanannya berjalan mulus.
        </p>

        {/* ── Positioning ── */}
        <div className="mt-8 flex items-start gap-3 p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <Building2 size={18} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-sm">
            <p className="font-bold text-gray-900 dark:text-white">Anda jual, kami yang operasikan</p>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Sundaf Trip, CV Sundaf Holiday Group, adalah pemasok (supplier)
              land tour spesialis Rusia, Asia Tengah, dan India untuk travel
              agent di Indonesia.
            </p>
          </div>
        </div>

        {/* ── Coverage ── */}
        <h2 className={`mt-12 mb-5 ${head}`}>Yang Kami Tangani di Destinasi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COVERAGE.map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                <Icon size={17} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Destinations ── */}
        <h2 className={`mt-12 mb-5 ${head}`}>Destinasi yang Kami Layani</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DESTINATIONS.map(({ region, detail }) => (
            <div key={region} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <MapPin size={15} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{region}</p>
                <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">{detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Why ── */}
        <h2 className={`mt-12 mb-5 ${head}`}>Kenapa Land Tour Sundaf Trip</h2>
        <div className="space-y-3">
          {WHY.map((point) => (
            <div key={point} className="flex items-start gap-3">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{point}</p>
            </div>
          ))}
        </div>

        {/* ── How we work ── */}
        <h2 className={`mt-12 mb-5 ${head}`}>Cara Kerja Sama</h2>
        <div className="space-y-3">
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                {n}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Real departures ── */}
        <h2 className={`mt-12 mb-1 ${head}`}>Keberangkatan Nyata</h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          Sebagian grup yang telah kami operasikan di Rusia, Asia Tengah, dan sekitarnya — peserta nyata, bukan foto stok.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
          {proofPhotos.map((src, i) => (
            <div
              key={src}
              className="group relative aspect-square rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Keberangkatan grup Sundaf Trip ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>

        {/* ── Founder ── */}
        <h2 className={`mt-12 mb-5 ${head}`}>{withCofounder ? "Co-Founder Sundaf Trip" : "Pendiri Sundaf Trip"}</h2>
        <div className="p-5 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {person.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.photo}
                alt={person.name}
                loading="lazy"
                className="is-round w-16 h-16 shrink-0 object-cover ring-2 ring-blue-600/30 dark:ring-blue-400/30"
              />
            ) : (
              <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                {person.initial}
              </div>
            )}
            <div>
              <p className={`text-lg font-bold text-gray-900 dark:text-white leading-tight ${lora.className}`}>{person.name}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">{person.role}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{person.desc}</p>
        </div>

        {/* ── CTA ── */}
        <div className="mt-12 p-6 rounded-2xl bg-gray-900 dark:bg-gray-800 text-center">
          <h2 className={`text-2xl font-bold text-white mb-2 ${lora.className}`}>Kirim Grup Anda Bersama Kami</h2>
          <p className="text-sm text-gray-300 mb-6">
            Ceritakan rencana grup Anda, kami siapkan penawaran land tour-nya.
            Kami merespons setiap pertanyaan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/6281775202759"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              <Phone size={16} /> Hubungi via WhatsApp
            </a>
            <a
              href={pdfHref}
              download
              className="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm rounded-xl border border-gray-600 text-gray-200 hover:bg-gray-800 transition"
            >
              <Download size={16} /> Unduh Company Profile
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
