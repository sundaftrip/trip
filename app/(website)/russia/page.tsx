import type { Metadata } from "next";
import Link from "@/components/website/clean/PreserveScrollLink";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import { getConfiguredWhatsAppNumber } from "@/lib/referrals";
import { buildWhatsAppHref, toWaNumber } from "@/lib/utils";
import styles from "@/components/website/clean/RussiaCatering.module.css";

export const revalidate = 300;
const title = "Layanan Perjalanan Rusia — Tanya SUNDAF";
const description = "Butuh katering halal, pembayaran pesawat domestik Rusia, Sapsan, hotel, bagasi, atau transfer bus dan luxury? Pilih kebutuhan perjalanan Anda bersama SUNDAF.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://sundaftrip.com/russia" },
  openGraph: { title, description, url: "https://sundaftrip.com/russia", siteName: "Sundaf Trip", locale: "id_ID", type: "website" },
};

const services = [
  { title: "Pesawat domestik Rusia", description: "Bantuan pembayaran tiket penerbangan domestik sesuai rute dan tanggal perjalanan Anda.", message: "pembayaran tiket pesawat domestik Rusia" },
  { title: "Kereta cepat Sapsan", description: "Sampaikan tanggal, rute, dan jumlah penumpang untuk menanyakan pembayaran tiket Sapsan.", message: "pembayaran tiket kereta cepat Sapsan" },
  { title: "Pembayaran hotel", description: "Sudah punya pilihan hotel? Sampaikan hotel, tanggal menginap, dan kebutuhan kamar kepada tim.", message: "pembayaran hotel di Rusia" },
  { title: "Transfer bus & luxury", description: "Rencanakan penjemputan dan transportasi untuk kebutuhan pribadi maupun rombongan.", message: "transfer bus atau kendaraan luxury di Rusia" },
  { title: "Tambahan bagasi", description: "Tiket sudah ada? Tanyakan bantuan pembayaran bagasi sesuai maskapai dan penerbangan Anda.", message: "pembayaran tambahan bagasi penerbangan Rusia" },
];

export default async function RussiaServicesPage() {
  const whatsapp = toWaNumber(await getConfiguredWhatsAppNumber()) || "6281775202759";
  return (
    <div className={styles.page}>
      <BreadcrumbSchema crumbs={[{ name: "Beranda", url: "/" }, { name: "Layanan Rusia", url: "/russia" }]} />
      <nav className={`${styles.breadcrumb} ${styles.wrap}`} aria-label="Breadcrumb"><Link href="/">Beranda</Link><span aria-hidden="true">/</span><span>Layanan Rusia</span></nav>
      <header className={`${styles["hub-intro"]} ${styles.wrap}`}><p className={styles.eyebrow}>PILIH KEBUTUHAN PERJALANAN ANDA</p><h1>Butuh apa di Rusia?<br /><em>Tanya SUNDAF.</em></h1><p>Dari satu kebutuhan sampai perjalanan lengkap. Untuk wisatawan Indonesia, rombongan, dan mitra agen perjalanan.</p></header>
      <section className={`${styles["hub-grid"]} ${styles.wrap}`} aria-label="Pilihan layanan Rusia">
        <article className={`${styles["hub-service"]} ${styles["hub-service-featured"]}`}><span className={styles["hub-label"]}>MOSCOW · SAINT PETERSBURG</span><h2>Katering halal Indonesia</h2><p>Pilihan nasi box mulai 700 RUB per porsi. Ayam rempah, nasi kuning, dan ayam krispi dengan pengantaran taksi ke titik temu yang disepakati.</p><Link className={`${styles.button} ${styles.primary}`} href="/russia/catering">Lihat menu katering</Link></article>
        <article className={styles["hub-service"]}><span className={styles["hub-label"]}>LAYANAN MENDATANG</span><h2>Kebutuhan rubel</h2><p>Informasi layanan rubel akan tersedia setelah persiapannya selesai.</p><span className={styles["coming-soon"]}>Coming soon</span></article>
        {services.map((service) => <article className={styles["hub-service"]} key={service.title}><h2>{service.title}</h2><p>{service.description}</p><a href={buildWhatsAppHref(whatsapp, `Halo SUNDAF, saya ingin menanyakan ${service.message}. Mohon informasi kebutuhan data, ketersediaan, dan biayanya.`)} target="_blank" rel="noopener noreferrer">Tanyakan kebutuhan</a></article>)}
        <article className={styles["hub-service"]}><h2>Tour lengkap Rusia</h2><p>Jelajahi pilihan perjalanan dan paket tour Rusia bersama SUNDAF.</p><Link href="/tours?destination=rusia">Lihat pilihan tour</Link></article>
      </section>
    </div>
  );
}
