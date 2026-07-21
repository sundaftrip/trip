import Image from "next/image";
import Link from "next/link";
import { buildWhatsAppHref, cldFit } from "@/lib/utils";
import styles from "./CleanSite.module.css";

export default function CleanFooter({ logo, company }: { logo?: string; company: Record<string, string> }) {
  const logoSrc = cldFit(logo || "/logo.png", 320);
  const whatsapp = buildWhatsAppHref(company.company_whatsapp, "Halo, saya ingin konsultasi perjalanan bersama Sundaf Trip.") || "/contact";
  const email = company.company_email || "info@sundaftrip.com";
  const phone = company.company_phone || "021-22321146";
  const address = company.company_address || "Jakarta, DKI Jakarta, Indonesia";
  const nib = company.company_nib || "1601260060842";
  const legalName = company.company_legal_name || "CV Sundaf Holiday Group";
  const igUser = (company.company_instagram || "sundaf.trip")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "");

  return (
    <footer className={styles.footer}>
      <div className={`${styles.shell} ${styles.footerMain}`}>
        <div className={styles.footerBrand}>
          <Image src={logoSrc} alt="Sundaf Trip" width={176} height={54} />
          <p>Perjalanan Rusia, Asia Tengah, aurora, dan private trip yang dirancang untuk traveler Indonesia.</p>
          <strong>{legalName}</strong>
          <address>{address}</address>
          <div className={styles.footerContact}>
            <a href={`tel:${phone.replace(/\D/g, "")}`}>{phone}</a>
            <a href={`mailto:${email}`}>{email}</a>
            <a href={`https://www.instagram.com/${igUser}`}>@{igUser}</a>
          </div>
        </div>

        <div className={styles.footerColumn}>
          <h3>Perjalanan</h3>
          <nav><Link href="/tours">Jadwal Tour</Link><Link href="/custom-trip">Private Trip</Link><Link href="/visa">Layanan Visa</Link><Link href="/faq">Pertanyaan Umum</Link></nav>
        </div>
        <div className={styles.footerColumn}>
          <h3>Sundaf</h3>
          <nav><Link href="/sundaf-trip">Profil Sundaf Trip</Link><Link href="/about">Tentang Kami</Link><Link href="/reviews">Review Peserta</Link><Link href="/media-kit">Media Kit</Link></nav>
        </div>
        <div className={styles.footerColumn}>
          <h3>Hubungi</h3>
          <nav><a href={whatsapp}>WhatsApp</a><a href={`mailto:${email}`}>Email</a><a href={`tel:${phone.replace(/\D/g, "")}`}>Telepon</a><a href={`https://www.instagram.com/${igUser}`}>Instagram</a></nav>
        </div>
      </div>
      <div className={`${styles.shell} ${styles.footerBottom}`}>
        <span>© {new Date().getFullYear()} Sundaf Trip · NIB {nib}</span>
        <div><Link href="/legalitas-dan-keamanan">Legalitas</Link><Link href="/privacy">Privasi</Link><Link href="/terms">Syarat &amp; Ketentuan</Link></div>
      </div>
    </footer>
  );
}
