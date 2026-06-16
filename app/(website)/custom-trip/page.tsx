import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  MapPinned,
  Plane,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toWaNumber } from "@/lib/utils";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";

export const revalidate = 300;

const PAGE_TITLE = "Custom Trip";
const PAGE_DESC =
  "Alur custom trip Sundaf Trip: kirim tanggal, jumlah peserta, tujuan khusus, budget, kebutuhan tiket pesawat internasional, dan komponen perjalanan yang ingin di-include.";

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
    icon: CreditCard,
    title: "Budget",
    desc: "Boleh tulis budget per orang atau total rombongan. Jika belum ada, kami mulai dari estimasi Sundaf.",
  },
  {
    icon: Plane,
    title: "Pesawat internasional",
    desc: "Tentukan apakah tiket internasional ikut dihitung atau hanya land arrangement.",
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
    desc: "Tim Sundaf membaca tanggal, jumlah peserta, tujuan, budget, dan komponen yang ingin dimasukkan.",
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
Budget per orang / total:
Tiket pesawat internasional ikut dihitung? Ya/Tidak:
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
  const panelStyle = isAtlas
    ? { background: "var(--at-card)", borderColor: "var(--at-border)" }
    : undefined;

  return (
    <main
      className={`min-h-screen pt-24 ${isAtlas ? "at-grid-bg" : "bg-white dark:bg-slate-950"}`}
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
            className={`border p-5 ${!isAtlas ? "rounded-lg border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900" : ""}`}
            style={panelStyle}
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
              Kirim brief sekali dengan format rapi. Tim kami bisa langsung cek rute dan estimasi tanpa bolak-balik tanya hal dasar.
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

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {briefItems.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className={`border p-4 ${!isAtlas ? "rounded-lg border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" : ""}`}
                style={panelStyle}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center border"
                    style={isAtlas ? { borderColor: "var(--at-border)", color: "var(--site-accent)" } : undefined}
                  >
                    <Icon size={17} />
                  </span>
                  <h3
                    className={`text-sm font-black ${!isAtlas ? "text-gray-950 dark:text-white" : ""}`}
                    style={textStyle}
                  >
                    {title}
                  </h3>
                </div>
                <p
                  className={`text-sm leading-relaxed ${!isAtlas ? "text-gray-600 dark:text-gray-400" : ""}`}
                  style={subTextStyle}
                >
                  {desc}
                </p>
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

          <ol className="mt-6 space-y-4">
            {timeline.map((item, index) => (
              <li key={item.step} className="relative grid gap-4 sm:grid-cols-[84px_minmax(0,1fr)]">
                {index < timeline.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[41px] top-14 hidden h-[calc(100%_-_16px)] w-px sm:block"
                    style={{ background: isAtlas ? "var(--at-border)" : "rgba(148,163,184,0.45)" }}
                  />
                )}
                <div
                  className="flex h-12 w-12 items-center justify-center border text-sm font-black sm:h-14 sm:w-14"
                  style={isAtlas ? { borderColor: "var(--at-border)", color: "var(--at-text)", background: "var(--at-card)" } : undefined}
                >
                  {item.step}
                </div>
                <div
                  className={`border p-4 ${!isAtlas ? "rounded-lg border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" : ""}`}
                  style={panelStyle}
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <h3
                      className={`text-base font-black ${!isAtlas ? "text-gray-950 dark:text-white" : ""}`}
                      style={textStyle}
                    >
                      {item.title}
                    </h3>
                    <span
                      className={`text-xs font-bold uppercase tracking-wide ${!isAtlas ? "text-gray-500 dark:text-gray-400" : ""}`}
                      style={subTextStyle}
                    >
                      {item.time}
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-sm leading-relaxed ${!isAtlas ? "text-gray-600 dark:text-gray-400" : ""}`}
                    style={subTextStyle}
                  >
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className={`mt-12 grid gap-5 border p-5 sm:mt-16 lg:grid-cols-[1fr_auto] lg:items-center ${!isAtlas ? "rounded-lg border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900" : ""}`}
          style={panelStyle}
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
              Kirim tanggal dan jumlah peserta dulu. Jika tujuan, budget, atau include tambahan belum ada, Sundaf akan mulai dari rekomendasi rute dan komponen standar.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {["Tanggal + peserta sudah cukup untuk mulai", "Anak-anak wajib ditulis usianya", "Budget kosong berarti kami beri estimasi", "Pesawat internasional bisa ya atau tidak"].map((text) => (
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
              className={`${isAtlas ? "at-btn-solid" : "rounded-lg bg-gray-950 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950"} px-5 py-3 text-sm`}
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
