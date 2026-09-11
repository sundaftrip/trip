import type { Metadata } from "next";
import { Banknote, Bus, Compass, Hotel, Luggage, Plane, TrainFront, Utensils, type LucideIcon } from "lucide-react";
import Link from "@/components/website/clean/PreserveScrollLink";
import RussiaServiceCard, { type RussiaServiceMotion } from "@/components/website/clean/RussiaServiceCard";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import { getConfiguredWhatsAppNumber } from "@/lib/referrals";
import { buildWhatsAppHref, toWaNumber } from "@/lib/utils";
import styles from "@/components/website/clean/RussiaServices.module.css";

export const revalidate = 300;
const title = "Layanan Perjalanan Rusia — Tanya SUNDAF";
const description = "Butuh katering halal, pembayaran pesawat domestik Rusia, Sapsan, hotel, bagasi, atau transfer bus dan luxury? Pilih kebutuhan perjalanan Anda bersama SUNDAF.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://sundaftrip.com/russia" },
  openGraph: { title, description, url: "https://sundaftrip.com/russia", siteName: "Sundaf Trip", locale: "id_ID", type: "website" },
};

const services: { icon: LucideIcon; motion: RussiaServiceMotion; title: string; description: string; message: string }[] = [
  { icon: Plane, motion: "flight", title: "Pesawat domestik Rusia", description: "Bantuan pembayaran tiket penerbangan domestik sesuai rute dan tanggal perjalanan Anda.", message: "pembayaran tiket pesawat domestik Rusia" },
  { icon: TrainFront, motion: "train", title: "Kereta cepat Sapsan", description: "Sampaikan tanggal, rute, dan jumlah penumpang untuk menanyakan pembayaran tiket Sapsan.", message: "pembayaran tiket kereta cepat Sapsan" },
  { icon: Hotel, motion: "hotel", title: "Pembayaran hotel", description: "Sudah punya pilihan hotel? Sampaikan hotel, tanggal menginap, dan kebutuhan kamar kepada tim.", message: "pembayaran hotel di Rusia" },
  { icon: Bus, motion: "bus", title: "Transfer bus & luxury", description: "Rencanakan penjemputan dan transportasi untuk kebutuhan pribadi maupun rombongan.", message: "transfer bus atau kendaraan luxury di Rusia" },
  { icon: Luggage, motion: "luggage", title: "Tambahan bagasi", description: "Tiket sudah ada? Tanyakan bantuan pembayaran bagasi sesuai maskapai dan penerbangan Anda.", message: "pembayaran tambahan bagasi penerbangan Rusia" },
];

function ServiceIcon({ icon: Icon, steam = false }: { icon: LucideIcon; steam?: boolean }) {
  return (
    <span className={styles.serviceIcon} aria-hidden="true">
      <Icon aria-hidden="true" />
      {steam && (
        <svg className={styles.steam} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
          <path d="M6 20c-3-3 3-4 0-7" />
          <path d="M12 18c-3-3 3-4 0-7" />
          <path d="M18 20c-3-3 3-4 0-7" />
        </svg>
      )}
    </span>
  );
}

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
        <div className={styles.serviceGrid}>
          <RussiaServiceCard motion="catering">
            <div className={styles.serviceTitle}><ServiceIcon icon={Utensils} steam /><h2>Katering halal Indonesia</h2></div>
            <p>Nasi box mulai 700 RUB per porsi di Moscow dan Saint Petersburg. Diantar dengan taksi ke titik temu yang disepakati.</p>
            <Link className={styles.serviceLink} href="/russia/catering">Lihat menu katering</Link>
          </RussiaServiceCard>
          {services.map((service) => (
            <RussiaServiceCard key={service.title} motion={service.motion}>
              <div className={styles.serviceTitle}><ServiceIcon icon={service.icon} /><h2>{service.title}</h2></div>
              <p>{service.description}</p>
              <a className={styles.serviceLink} href={buildWhatsAppHref(whatsapp, `Halo SUNDAF, saya ingin menanyakan ${service.message}. Mohon informasi kebutuhan data, ketersediaan, dan biayanya.`)} target="_blank" rel="noopener noreferrer" aria-label={`Tanyakan ${service.title} ke SUNDAF`}>Tanyakan kebutuhan</a>
            </RussiaServiceCard>
          ))}
          <RussiaServiceCard motion="compass">
            <div className={styles.serviceTitle}><ServiceIcon icon={Compass} /><h2>Tour lengkap Rusia</h2></div>
            <p>Jelajahi pilihan perjalanan dan paket tour Rusia bersama SUNDAF.</p>
            <Link className={styles.serviceLink} href="/tours?destination=rusia">Lihat pilihan tour</Link>
          </RussiaServiceCard>
          <article>
            <div className={styles.serviceTitle}><ServiceIcon icon={Banknote} /><h2>Kebutuhan rubel</h2></div>
            <p>Informasi layanan rubel akan tersedia setelah persiapannya selesai.</p>
            <span className={styles.comingSoon}>Coming soon</span>
          </article>
        </div>
      </section>
    </div>
  );
}
