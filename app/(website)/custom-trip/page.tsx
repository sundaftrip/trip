import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Hotel,
  MapPinned,
  Plane,
  PlaneTakeoff,
  UserCheck,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toWaNumber } from "@/lib/utils";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";

export const revalidate = 300;

const PAGE_TITLE = "Custom Trip";
const PAGE_DESC =
  "Alur custom trip Sundaf Trip: kirim tanggal, jumlah peserta, tujuan khusus, budget, kebutuhan tour leader, standar hotel, pilihan pesawat, dan komponen perjalanan yang ingin di-include.";

export const metadata: Metadata = {
  title: "Custom Trip",
  description: PAGE_DESC,
  alternates: { canonical: "https://sundaftrip.com/custom-trip" },
  openGraph: {
    title: `${PAGE_TITLE} · Sundaf Trip`,
    description: PAGE_DESC,
    url: "https://sundaftrip.com/custom-trip",
    siteName: "Sundaf Trip",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} · Sundaf Trip`,
    description: PAGE_DESC,
  },
};

const briefItems = [
  {
    icon: CalendarDays,
    title: "Tanggal & durasi",
    desc: "Tulis tanggal berangkat, tanggal pulang, atau rentang bulan kalau masih fleksibel.",
  },
  {
    icon: Users,
    title: "Jumlah peserta",
    desc: "Sebutkan jumlah dewasa dan usia anak-anak. Jika usia anak tidak ditulis, kami hitung sebagai dewasa.",
  },
  {
    icon: MapPinned,
    title: "Tujuan khusus",
    desc: "Negara, kota, aktivitas, hotel, atau pengalaman yang wajib masuk. Jika kosong, kami susun rute paling masuk akal.",
  },
  {
    icon: UserCheck,
    title: "Tour leader dari Jakarta",
    desc: "Tulis apakah butuh tour leader berangkat dari Jakarta atau cukup guide lokal di destinasi.",
  },
  {
    icon: CreditCard,
    title: "Budget",
    desc: "Boleh tulis budget per orang atau total rombongan. Jika belum ada, kami mulai dari estimasi Sundaf.",
  },
  {
    icon: Hotel,
    title: "Hotel bintang berapa",
    desc: "Sebutkan mau hotel bintang 3, 4, 5, area yang diinginkan, atau contoh hotel jika sudah punya preferensi.",
  },
  {
    icon: Plane,
    title: "Pesawat internasional",
    desc: "Tentukan apakah tiket internasional ikut dihitung atau hanya land arrangement.",
  },
  {
    icon: PlaneTakeoff,
    title: "Kelas pesawat",
    desc: "Pilih full service, low cost, atau tanpa tiket pesawat supaya estimasi awal tidak meleset.",
  },
  {
    icon: ClipboardList,
    title: "Include tambahan",
    desc: "Visa, hotel, transport private, guide, meals, asuransi, tiket atraksi, eSIM, atau kebutuhan lain. Jika kosong, kami rekomendasikan paket normal.",
  },
] as const;

const timeline = [
  {
    step: "01",
    title: "Brief perjalanan masuk",
    time: "Hari yang sama",
    desc: "Tim Sundaf membaca tanggal, jumlah peserta, tujuan, kebutuhan tour leader, hotel, pesawat, budget, dan komponen yang ingin dimasukkan.",
  },
  {
    step: "02",
    title: "Cek rute, musim, dan logistik",
    time: "1-2 hari kerja",
    desc: "Kami cek arah perjalanan, musim terbaik, visa, koneksi antar kota, dan apakah ritmenya realistis untuk peserta.",
  },
  {
    step: "03",
    title: "Draft itinerary & estimasi budget",
    time: "Setelah rute layak",
    desc: "Anda menerima gambaran rute, durasi, komponen include, opsi pesawat internasional, dan kisaran budget awal.",
  },
  {
    step: "04",
    title: "Revisi sampai rutenya masuk akal",
    time: "1-2 putaran",
    desc: "Kita rapikan kota, hotel, aktivitas, tempo perjalanan, dan batas budget sebelum masuk penawaran final.",
  },
  {
    step: "05",
    title: "Quotation final & konfirmasi",
    time: "Sebelum booking",
    desc: "Harga final dikunci berdasarkan ketersediaan terbaru, lalu lanjut DP, dokumen visa, dan reservasi komponen perjalanan.",
  },
  {
    step: "06",
    title: "Briefing sebelum berangkat",
    time: "Menjelang trip",
    desc: "Kami kirim catatan persiapan, dokumen, meeting point, kontak penting, dan detail operasional perjalanan.",
  },
] as const;

const waTemplate = `Halo Sundaf, saya mau custom trip.

Tanggal / bulan perjalanan:
Durasi:
Jumlah peserta:
Ada anak-anak? Usia:
Tujuan khusus:
Butuh tour leader dari Jakarta? Ya/Tidak:
Budget per orang / total:
Hotel mau bintang berapa:
Tiket pesawat internasional ikut dihitung? Ya/Tidak:
Kelas pesawat (full service / low cost / tanpa tiket):
Include tambahan yang dibutuhkan:
Catatan lain:`;

async function getPageData() {
  const rows = await prisma.companyInfo.findMany({
    where: { key: { in: ["company_whatsapp", "site_theme"] } },
  });
  const company: Record<string, string> = {};
  rows.forEach((row) => {
    company[row.key] = row.value;
  });
  const rawTheme = company.site_theme || "classic";
  return {
    theme: rawTheme === "console" ? "atlas" : rawTheme,
    whatsapp: toWaNumber(company.company_whatsapp),
  };
}

export default async function CustomTripPage() {
  const { theme, whatsapp } = await getPageData();
  const isAtlas = theme === "atlas";
  const waHref = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(waTemplate)}`
    : "/about";

  const pageStyle = isAtlas ? { backgroundColor: "var(--at-bg)" } : undefined;
  const textStyle = isAtlas ? { color: "var(--at-text)" } : undefined;
  const subTextStyle = isAtlas ? { color: "var(--at-subtext)" } : undefined;
  const lineStyle = isAtlas
    ? { borderColor: "color-mix(in srgb, var(--at-border) 56%, transparent)" }
    : undefined;
  const accentTextStyle = isAtlas ? { color: "var(--site-accent)" } : undefined;
  const markerStyle = isAtlas
    ? { background: "var(--site-accent)", borderColor: "var(--at-bg)" }
    : undefined;

  return (
    <main
      className={`min-h-screen pt-24 ${isAtlas ? "" : "bg-white dark:bg-slate-950"}`}
      style={pageStyle}
    >
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Custom Trip", url: "/custom-trip" },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <span
              className={isAtlas ? "at-pill mb-4" : "mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest text-gray-500 dark:border-gray-800 dark:text-gray-400"}
              style={isAtlas ? subTextStyle : undefined}
            >
              Custom Trip Sundaf
            </span>
            <h1
              className={`max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.02] ${!isAtlas ? "text-gray-950 dark:text-white" : ""}`}
              style={textStyle}
            >
              <span className="sundaf-title-stabilo">
                Custom Trip Sesuai Tanggal, Rute, dan Budget Anda
              </span>
            </h1>
            <p
              className={`mt-5 max-w-2xl text-base sm:text-lg leading-relaxed ${!isAtlas ? "text-gray-600 dark:text-gray-400" : ""}`}
              style={subTextStyle}
            >
              Mulai dari tanggal, jumlah peserta, tujuan khusus, sampai batas budget. Kalau ada bagian yang belum pasti, Sundaf bantu susun opsi yang paling masuk akal.
            </p>
          </div>

          <div
            className={`p-5 ${isAtlas ? "border-l-2" : "rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"}`}
            style={isAtlas ? { borderColor: "var(--site-accent)" } : undefined}
          >
            <p
              className={`text-xs font-black uppercase tracking-widest ${!isAtlas ? "text-gray-500 dark:text-gray-400" : ""}`}
              style={subTextStyle}
            >
              Format chat tercepat
            </p>
            <p
              className={`mt-2 text-sm leading-relaxed ${!isAtlas ? "text-gray-700 dark:text-gray-300" : ""}`}
              style={textStyle}
            >
              Kirim brief sekali dengan format rapi. Tim kami bisa langsung cek rute, tour leader, hotel, pesawat, dan estimasi tanpa bolak-balik tanya hal dasar.
            </p>
            <a
              href={waHref}
              target={whatsapp ? "_blank" : undefined}
              rel={whatsapp ? "noreferrer" : undefined}
              className={`${isAtlas ? "at-btn-solid" : "rounded-lg bg-gray-950 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950"} mt-5 w-full px-5 py-3 text-sm`}
            >
              Kirim Brief Custom Trip <ArrowRight size={15} />
            </a>
          </div>
        </section>

        <section className="mt-12 sm:mt-16">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p
                className={`text-xs font-black uppercase tracking-widest ${!isAtlas ? "text-gray-500 dark:text-gray-400" : ""}`}
                style={subTextStyle}
              >
                Yang perlu dikirim
              </p>
              <h2
                className={`mt-2 text-2xl sm:text-3xl font-black ${!isAtlas ? "text-gray-950 dark:text-white" : ""}`}
                style={textStyle}
              >
                Brief singkat, keputusan lebih cepat
              </h2>
            </div>
          </div>

          <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {briefItems.map(({ icon: Icon, title, desc }, index) => (
              <div
                key={title}
                className={`flex gap-3 py-5 ${
                  index === 0 ? "" : "border-t"
                } ${
                  index === 1 ? "sm:border-t-0" : ""
                } ${
                  index === 2 ? "lg:border-t-0" : ""
                } ${!isAtlas ? "border-gray-200 dark:border-gray-800" : ""}`}
                style={index === 0 ? undefined : lineStyle}
              >
                <span
                  className={`mt-0.5 shrink-0 ${!isAtlas ? "text-gray-950 dark:text-white" : ""}`}
                  style={accentTextStyle}
                >
                  <Icon size={18} />
                </span>
                <div>
                  <h3
                    className={`text-sm font-black ${!isAtlas ? "text-gray-950 dark:text-white" : ""}`}
                    style={textStyle}
                  >
                    {title}
                  </h3>
                  <p
                    className={`mt-2 text-sm leading-relaxed ${!isAtlas ? "text-gray-600 dark:text-gray-400" : ""}`}
                    style={subTextStyle}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 sm:mt-16">
          <p
            className={`text-xs font-black uppercase tracking-widest ${!isAtlas ? "text-gray-500 dark:text-gray-400" : ""}`}
            style={subTextStyle}
          >
            Timeline kerja
          </p>
          <h2
            className={`mt-2 text-2xl sm:text-3xl font-black ${!isAtlas ? "text-gray-950 dark:text-white" : ""}`}
            style={textStyle}
          >
            Dari ide kasar menjadi itinerary siap jalan
          </h2>

          <ol
            className={`mt-8 border-l pl-5 ${!isAtlas ? "border-gray-200 dark:border-gray-800" : ""}`}
            style={lineStyle}
          >
            {timeline.map((item) => (
              <li key={item.step} className="relative pb-8 last:pb-0">
                <span
                  aria-hidden="true"
                  className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-4 ${
                    !isAtlas ? "border-white bg-gray-950 dark:border-slate-950 dark:bg-white" : ""
                  }`}
                  style={markerStyle}
                />
                <div className="grid gap-2 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-7">
                  <div className="flex items-center gap-3 sm:block">
                    <span
                      className={`text-sm font-black ${!isAtlas ? "text-gray-950 dark:text-white" : ""}`}
                      style={accentTextStyle}
                    >
                      {item.step}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wide sm:mt-2 sm:block ${!isAtlas ? "text-gray-500 dark:text-gray-400" : ""}`}
                      style={subTextStyle}
                    >
                      {item.time}
                    </span>
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-black leading-tight ${!isAtlas ? "text-gray-950 dark:text-white" : ""}`}
                      style={textStyle}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`mt-2 max-w-3xl text-sm leading-relaxed ${!isAtlas ? "text-gray-600 dark:text-gray-400" : ""}`}
                      style={subTextStyle}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className={`mt-12 grid gap-5 border-y py-7 sm:mt-16 lg:grid-cols-[1fr_auto] lg:items-center ${!isAtlas ? "border-gray-200 dark:border-gray-800" : ""}`}
          style={lineStyle}
        >
          <div>
            <h2
              className={`text-xl sm:text-2xl font-black ${!isAtlas ? "text-gray-950 dark:text-white" : ""}`}
              style={textStyle}
            >
              Belum punya rute, hotel, atau budget?
            </h2>
            <p
              className={`mt-2 text-sm leading-relaxed ${!isAtlas ? "text-gray-600 dark:text-gray-400" : ""}`}
              style={subTextStyle}
            >
              Kirim tanggal dan jumlah peserta dulu. Jika tujuan, budget, hotel, atau include tambahan belum ada, Sundaf akan mulai dari rekomendasi rute dan komponen standar.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                "Tanggal + peserta sudah cukup untuk mulai",
                "Anak-anak wajib ditulis usianya",
                "Tour leader dari Jakarta bisa ya atau tidak",
                "Hotel bisa 3, 4, 5 bintang, atau bebas",
                "Budget kosong berarti kami beri estimasi",
                "Pesawat bisa full service, low cost, atau tanpa tiket",
              ].map((text) => (
                <p
                  key={text}
                  className={`flex items-start gap-2 text-sm ${!isAtlas ? "text-gray-700 dark:text-gray-300" : ""}`}
                  style={textStyle}
                >
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={isAtlas ? { color: "var(--site-accent)" } : undefined} />
                  <span>{text}</span>
                </p>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <a
              href={waHref}
              target={whatsapp ? "_blank" : undefined}
              rel={whatsapp ? "noreferrer" : undefined}
              className={`${isAtlas ? "at-btn-solid" : "rounded-lg bg-gray-950 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950"} justify-center px-5 py-3 text-sm`}
            >
              Mulai Custom Trip <ArrowRight size={15} />
            </a>
            <Link
              href="/tours"
              className={`${isAtlas ? "at-btn" : "rounded-lg border border-gray-300 px-5 py-3 text-center text-sm font-bold text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"}`}
            >
              Lihat Paket Jadi
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
