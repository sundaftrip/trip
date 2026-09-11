import type { Metadata } from "next";
import Link from "@/components/website/clean/PreserveScrollLink";
import { prisma } from "@/lib/prisma";
import { defaultOpenGraphImages, defaultTwitterImages } from "@/lib/site-metadata";
import { toWaNumber } from "@/lib/utils";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import CustomTripWizard from "@/components/website/clean/CustomTripWizard";
import styles from "@/components/website/clean/CustomTripWizard.module.css";

export const revalidate = 300;

const PAGE_TITLE = "Private & Custom Trip";
const PAGE_DESC =
  "Rancang land tour privat Thailand, Rusia, dan destinasi pilihanmu. Tentukan tanggal, rute, durasi, jumlah peserta, budget, dan layanan sesuai kebutuhan.";

const destinationLabels = new Map([
  ["rusia", "Rusia & Aurora"],
  ["thailand", "Thailand"],
  ["asia-tengah", "Asia Tengah"],
  ["vietnam", "Vietnam"],
  ["jepang", "Jepang"],
  ["canada", "Kanada"],
  ["lainnya", "Destinasi lainnya"],
]);

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESC,
  alternates: { canonical: "https://sundaftrip.com/custom-trip" },
  openGraph: {
    title: `${PAGE_TITLE} · Sundaf Trip`,
    description: PAGE_DESC,
    url: "https://sundaftrip.com/custom-trip",
    siteName: "Sundaf Trip",
    locale: "id_ID",
    type: "website",
    images: defaultOpenGraphImages(PAGE_TITLE),
  },
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} · Sundaf Trip`,
    description: PAGE_DESC,
    images: defaultTwitterImages(),
  },
};

async function getWhatsAppNumber() {
  const row = await prisma.companyInfo.findUnique({ where: { key: "company_whatsapp" } });
  return toWaNumber(row?.value) || "6281775202759";
}

export default async function CustomTripPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string | string[] }>;
}) {
  const [whatsapp, params] = await Promise.all([getWhatsAppNumber(), searchParams]);
  const initialDestination = typeof params.destination === "string"
    ? destinationLabels.get(params.destination) || (
      /^[a-z][a-z0-9-]{0,79}$/.test(params.destination)
        ? params.destination.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
        : ""
    )
    : "";

  return (
    <div className={styles.page} id="main-content">
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Private & Custom Trip", url: "/custom-trip" },
        ]}
      />
      <div className={styles.shell}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Beranda</Link><span aria-hidden="true">/</span><span>Private &amp; Custom Trip</span>
        </nav>
        <header className={styles.hero}>
          <p>PRIVATE &amp; CUSTOM TRIP</p>
          <h1>Thailand, Rusia, dan rute pilihanmu. Bebas rancang private trip.</h1>
          <span>Tentukan tanggal, rute, durasi, jumlah peserta, dan kisaran budget. Kamu bisa mengajukan perjalanan di luar paket yang ditampilkan, dengan pilihan hotel, transportasi, guide, dan aktivitas sesuai kebutuhan.</span>
          <span>Sudah punya tiket atau sebagian rencana? Ceritakan layanan yang kamu perlukan, mulai dari satu kebutuhan sampai perjalanan lengkap.</span>
        </header>
        <CustomTripWizard whatsapp={whatsapp} initialDestination={initialDestination} />
        <section className={styles.aftercare} aria-labelledby="custom-process-title">
          <div>
            <p>CARA KERJANYA</p>
            <h2 id="custom-process-title">Ceritakan rencanamu, kami bantu merangkainya.</h2>
          </div>
          <ol>
            <li><strong>01</strong><span><b>Kamu tentukan rencananya</b>Pilih kota, tanggal, durasi, teman perjalanan, kisaran budget, dan layanan yang kamu butuhkan.</span></li>
            <li><strong>02</strong><span><b>Pilihan kami siapkan</b>Kami susun rute dan estimasi biaya yang realistis untuk dibahas bersama.</span></li>
            <li><strong>03</strong><span><b>Kamu tetap pegang keputusan</b>Detail dan harga dikonfirmasi lebih dulu. Booking baru diproses setelah kamu setuju.</span></li>
          </ol>
        </section>
      </div>
    </div>
  );
}
