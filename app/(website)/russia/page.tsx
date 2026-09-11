import type { Metadata } from "next";
import Link from "@/components/website/clean/PreserveScrollLink";
import RussiaServiceCard, { type RussiaServiceMotion } from "@/components/website/clean/RussiaServiceCard";
import RussiaServiceIllustration from "@/components/website/clean/RussiaServiceIllustration";
import RussiaServiceGrid from "@/components/website/clean/RussiaServiceGrid";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import { getConfiguredWhatsAppNumber } from "@/lib/referrals";
import { buildWhatsAppHref, toWaNumber } from "@/lib/utils";
import styles from "@/components/website/clean/RussiaServices.module.css";

export const revalidate = 300;
const title = "Layanan Perjalanan Rusia — Tanya SUNDAF";
const description = "Katering halal, pembayaran tiket dan hotel, transportasi, tiket sirkus dan balet, guide berbahasa Indonesia, serta akses internet selama di Rusia. Tanya SUNDAF.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://sundaftrip.com/russia" },
  openGraph: { title, description, url: "https://sundaftrip.com/russia", siteName: "Sundaf Trip", locale: "id_ID", type: "website" },
};

const services: { motion: RussiaServiceMotion; title: string; description: string; message: string }[] = [
  { motion: "flight", title: "Pesawat domestik Rusia", description: "Bantuan pembayaran tiket penerbangan domestik sesuai rute dan tanggal perjalanan Anda.", message: "pembayaran tiket pesawat domestik Rusia" },
  { motion: "train", title: "Kereta cepat Sapsan", description: "Sampaikan tanggal, rute, dan jumlah penumpang untuk menanyakan pembayaran tiket Sapsan.", message: "pembayaran tiket kereta cepat Sapsan" },
  { motion: "hotel", title: "Pembayaran hotel", description: "Sudah punya pilihan hotel? Sampaikan hotel, tanggal menginap, dan kebutuhan kamar kepada tim.", message: "pembayaran hotel di Rusia" },
  { motion: "bus", title: "Transfer bus & luxury", description: "Rencanakan penjemputan dan transportasi untuk kebutuhan pribadi maupun rombongan.", message: "transfer bus atau kendaraan luxury di Rusia" },
  { motion: "luggage", title: "Tambahan bagasi", description: "Tiket sudah ada? Tanyakan bantuan pembayaran bagasi sesuai maskapai dan penerbangan Anda.", message: "pembayaran tambahan bagasi penerbangan Rusia" },
  { motion: "show", title: "Tiket sirkus & balet", description: "Bantuan pembayaran tiket sirkus dan balet di Rusia. Sampaikan pertunjukan, tanggal, dan jumlah penonton yang Anda inginkan.", message: "pembayaran tiket sirkus atau balet di Rusia" },
  { motion: "guide", title: "Guide lokal berbahasa Indonesia", description: "Guide lokal untuk menemani perjalanan Anda dalam bahasa Indonesia. Sampaikan kota, tanggal, dan kebutuhan pendampingan.", message: "layanan guide lokal berbahasa Indonesia di Rusia" },
  { motion: "internet", title: "Internet selama di Rusia", description: "Tetap terhubung selama perjalanan. Tanyakan pilihan akses internet sesuai durasi, kota tujuan, dan perangkat yang Anda gunakan.", message: "akses internet selama perjalanan di Rusia" },
];

export default async function RussiaServicesPage() {
  const whatsapp = toWaNumber(await getConfiguredWhatsAppNumber()) || "6281775202759";
  return (
    <div className={styles.page}>
      <BreadcrumbSchema crumbs={[{ name: "Beranda", url: "/" }, { name: "Layanan Rusia", url: "/russia" }]} />
      <nav className={`${styles.breadcrumb} ${styles.shell}`} aria-label="Breadcrumb">
        <Link href="/">Beranda</Link><span aria-hidden="true">/</span><span>Layanan Rusia</span>
      </nav>
      <section className={`${styles.services} ${styles.shell}`} aria-labelledby="russia-services-title">
        <header className={styles.sectionHeading}>
          <p className={styles.eyebrow}>LAYANAN RUSIA SUNDAF</p>
          <h1 id="russia-services-title">Butuh apa di Rusia?<br />Tanya SUNDAF.</h1>
          <p>Dari satu kebutuhan sampai perjalanan lengkap. Untuk wisatawan Indonesia, rombongan, dan mitra agen perjalanan.</p>
        </header>
        <RussiaServiceGrid>
          <RussiaServiceCard motion="catering">
            <div className={styles.serviceTitle}><span className={styles.serviceIcon}><RussiaServiceIllustration kind="catering" /></span><h2>Katering halal Indonesia</h2></div>
            <p>Nasi box mulai 700 RUB per porsi di Moscow dan Saint Petersburg. Diantar dengan taksi ke titik temu yang disepakati.</p>
            <Link className={styles.serviceLink} href="/russia/catering">Lihat menu katering</Link>
          </RussiaServiceCard>
          {services.map((service) => (
            <RussiaServiceCard key={service.title} motion={service.motion}>
              <div className={styles.serviceTitle}><span className={styles.serviceIcon}><RussiaServiceIllustration kind={service.motion} /></span><h2>{service.title}</h2></div>
              <p>{service.description}</p>
              <a className={styles.serviceLink} href={buildWhatsAppHref(whatsapp, `Halo SUNDAF, saya ingin menanyakan ${service.message}. Mohon informasi kebutuhan data, ketersediaan, dan biayanya.`)} target="_blank" rel="noopener noreferrer" aria-label={`Tanyakan ${service.title} ke SUNDAF`}>Tanyakan kebutuhan</a>
            </RussiaServiceCard>
          ))}
          <RussiaServiceCard motion="compass">
            <div className={styles.serviceTitle}><span className={styles.serviceIcon}><RussiaServiceIllustration kind="compass" /></span><h2>Tour lengkap Rusia</h2></div>
            <p>Jelajahi pilihan perjalanan dan paket tour Rusia bersama SUNDAF.</p>
            <Link className={styles.serviceLink} href="/tours?destination=rusia">Lihat pilihan tour</Link>
          </RussiaServiceCard>
          <article>
            <div className={styles.serviceTitle}><span className={styles.serviceIcon}><RussiaServiceIllustration kind="ruble" /></span><h2>Kebutuhan rubel</h2></div>
            <p>Informasi layanan rubel akan tersedia setelah persiapannya selesai.</p>
            <span className={styles.comingSoon}>Coming soon</span>
          </article>
        </RussiaServiceGrid>
      </section>
    </div>
  );
}
