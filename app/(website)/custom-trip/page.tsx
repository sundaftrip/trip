import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { defaultOpenGraphImages, defaultTwitterImages } from "@/lib/site-metadata";
import { toWaNumber } from "@/lib/utils";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import CustomTripWizard from "@/components/website/clean/CustomTripWizard";
import styles from "@/components/website/clean/CustomTripWizard.module.css";

export const revalidate = 300;

const PAGE_TITLE = "Private & Custom Trip";
const PAGE_DESC =
  "Rancang private trip bersama Sundaf: pilih destinasi, tanggal, peserta, budget, akomodasi, dan kebutuhan perjalanan dalam lima langkah singkat.";

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

export default async function CustomTripPage() {
  const whatsapp = await getWhatsAppNumber();

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
          <h1>Punya tanggal sendiri? Kita rancang rutenya.</h1>
          <span>Kirim tujuan, jumlah peserta, durasi, dan kisaran budget. Proses dimulai dari kebutuhanmu, bukan paket yang dipaksakan.</span>
        </header>
        <CustomTripWizard whatsapp={whatsapp} />
        <section className={styles.aftercare} aria-labelledby="custom-process-title">
          <div>
            <p>CARA KERJANYA</p>
            <h2 id="custom-process-title">Brief masuk, lalu tim mengecek rute yang realistis.</h2>
          </div>
          <ol>
            <li><strong>01</strong><span><b>Brief dipelajari</b>Kami mengecek tanggal, musim, rute, visa, dan kebutuhan peserta.</span></li>
            <li><strong>02</strong><span><b>Opsi disusun</b>Kamu menerima arah itinerary dan estimasi sebelum keputusan booking.</span></li>
            <li><strong>03</strong><span><b>Detail dikunci</b>Harga final mengikuti ketersediaan aktual dan baru diproses setelah disetujui.</span></li>
          </ol>
        </section>
      </div>
    </div>
  );
}
