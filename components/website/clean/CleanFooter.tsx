import Image from "next/image";
import { Roboto } from "next/font/google";
import WhatsAppIcon from "../WhatsAppIcon";
import Link from "./PreserveScrollLink";
import { FileCheck2, Globe2, Mail, Phone, Route } from "lucide-react";
import {
  APPOINTMENT_ONLY_LABEL,
  appointmentOnlyOfficeAddress,
} from "@/lib/business-identity";
import { buildWhatsAppHref, cldFit } from "@/lib/utils";
import { resolveCompanyPhone } from "@/lib/company-phone";
import styles from "./CleanFooter.module.css";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-footer-roboto", display: "swap", preload: false });

export default function CleanFooter({ logo, company }: { logo?: string; company: Record<string, string> }) {
  const logoSrc = cldFit(logo || "/logo.png", 320);
  const whatsappDisplay = company.company_whatsapp?.trim();
  const whatsapp = buildWhatsAppHref(whatsappDisplay, "Halo, saya ingin konsultasi perjalanan bersama Sundaf Trip.");
  const email = company.company_email?.trim();
  const phone = resolveCompanyPhone(company.company_phone);
  const phoneHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "";
  const nib = company.company_nib?.trim();
  const legalName = company.company_legal_name?.trim();
  const officeAddress = appointmentOnlyOfficeAddress(company.company_address);
  const igUser = (company.company_instagram || "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "")
    .trim();

  return (
    <footer className={`${styles.footer} ${roboto.variable}`} data-clean-footer>
      <div className={styles.shell}>
        <div className={styles.top}>
          <section className={styles.brand} aria-labelledby="footer-brand-title">
            <Link className={styles.logoLink} href="/" aria-label="Sundaf Trip, beranda">
              <Image className={styles.logo} src={logoSrc} alt="Sundaf Trip" width={180} height={50} />
            </Link>
            <h2 id="footer-brand-title" className="sr-only">Sundaf Trip</h2>
            <p>Perjalanan Rusia, Asia Tengah, aurora, dan private trip untuk traveler Indonesia.</p>
            <span className={styles.brandNote} data-no-translate translate="no">Your B2B partner.</span>
          </section>

          <div className={styles.navigation}>
            <section className={styles.group}>
              <h2>Perjalanan</h2>
              <nav aria-label="Tautan perjalanan">
                <Link href="/tours">Jadwal Tour</Link>
                <Link href="/custom-trip">Private Trip</Link>
                <Link href="/destinations">Destinasi</Link>
                <Link scroll data-scroll-reset-after-navigation href="/amerika-latin">Amerika Latin &amp; Peru 2027</Link>
              </nav>
            </section>
            <section className={styles.group}>
              <h2>Layanan</h2>
              <nav aria-label="Tautan layanan">
                <Link href="/russia">Layanan Rusia</Link>
                <Link href="/russia/catering">Katering Halal Rusia</Link>
                <Link href="/visa">Layanan Visa</Link>
              </nav>
            </section>
            <section className={styles.group}>
              <h2>Kenali Sundaf</h2>
              <nav aria-label="Tautan tentang Sundaf">
                <Link href="/about">Tentang Sundaf</Link>
                <Link href="/blog">Jurnal</Link>
                <Link href="/reviews">Cerita Peserta</Link>
                <Link href="/faq">Pertanyaan Umum</Link>
              </nav>
            </section>
            <section className={styles.group}>
              <h2>Informasi</h2>
              <nav aria-label="Tautan informasi">
                <Link href="/contact">Hubungi Kami</Link>
                <Link href="/legalitas-dan-keamanan">Legalitas</Link>
                <Link href="/privacy">Privasi</Link>
                <Link href="/terms">Syarat &amp; Ketentuan</Link>
              </nav>
            </section>
          </div>
        </div>

        <div className={styles.connections}>
          <ul className={styles.highlights} aria-label="Bersama Sundaf">
            <li>
              <span className={`${styles.badge} ${styles.pink}`}><Route aria-hidden="true" /></span>
              <div><strong>Rute dan jadwal jelas</strong><p>Kenali perjalanan sebelum memilih.</p></div>
            </li>
            <li>
              <span className={`${styles.badge} ${styles.orange}`}><FileCheck2 aria-hidden="true" /></span>
              <div><strong>Persiapan dibantu</strong><p>Dari dokumen hingga info keberangkatan.</p></div>
            </li>
            <li>
              <span className={`${styles.badge} ${styles.blue}`}><Globe2 aria-hidden="true" /></span>
              <div><strong>Untuk traveler Indonesia</strong><p>Koordinasi perjalanan dalam bahasa Indonesia.</p></div>
            </li>
          </ul>

          <section className={styles.partner} aria-labelledby="footer-partner-title">
            <h2 id="footer-partner-title">Untuk mitra perjalanan</h2>
            <p>Kebutuhan tamu Anda, dari satu layanan di Rusia hingga perjalanan grup. Mari bekerja sama.</p>
            <Link className={styles.textLink} href="/partner">Kenali kemitraan SUNDAF</Link>
            {(legalName || nib) && (
              <Link className={styles.identity} href="/legalitas-dan-keamanan" aria-label="Lihat identitas dan legalitas usaha Sundaf">
                {nib && (
                  <span className={styles.ossMark}>
                    <Image src="/brand/oss-indonesia.svg" alt="OSS — Kementerian Investasi dan Hilirisasi/BKPM" width={90} height={27} />
                  </span>
                )}
                <span>
                  {legalName ? <strong data-no-translate translate="no">{legalName}</strong> : <strong>Identitas usaha Sundaf</strong>}
                  {nib && <small data-no-translate translate="no">NIB {nib}</small>}
                  {nib && <span className={styles.issuer}>Perizinan melalui OSS</span>}
                </span>
              </Link>
            )}
          </section>

          <section className={styles.contact} aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title">Mari tetap terhubung</h2>
            <p>Cerita perjalanan, inspirasi destinasi, atau rencana liburanmu berikutnya.</p>
            {(whatsapp || igUser || email) && (
              <div className={styles.socials}>
                {whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp Sundaf (buka di tab baru)"><WhatsAppIcon /></a>}
                {igUser && <a href={`https://www.instagram.com/${igUser}`} target="_blank" rel="noreferrer" aria-label={`Instagram @${igUser} (buka di tab baru)`}><InstagramIcon /></a>}
                {email && <a href={`mailto:${email}`} aria-label={`Email ${email}`}><Mail aria-hidden="true" /></a>}
              </div>
            )}
            <nav className={styles.contactLinks} aria-label="Tautan kontak">
              {whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${whatsappDisplay} (buka di tab baru)`}><WhatsAppIcon /><span>{whatsappDisplay}</span></a>}
              {email && <a href={`mailto:${email}`}><Mail aria-hidden="true" /><span>{email}</span></a>}
              {phoneHref && phone !== whatsappDisplay && <a href={phoneHref}><Phone aria-hidden="true" /><span>{phone}</span></a>}
            </nav>
          </section>
        </div>

        <div className={styles.bottom}>
          {officeAddress && <address><span className={styles.appointment}>{APPOINTMENT_ONLY_LABEL}</span>{officeAddress}</address>}
          <p>© {new Date().getFullYear()} Sundaf Trip<span>Perjalanan dimulai dari obrolan.</span></p>
        </div>
      </div>
    </footer>
  );
}
