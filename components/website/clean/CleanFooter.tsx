import Image from "next/image";
import WhatsAppIcon from "../WhatsAppIcon";
import Link from "./PreserveScrollLink";
import { Mail, Phone } from "lucide-react";
import {
  APPOINTMENT_ONLY_LABEL,
  SUNDAF_AHU_REGISTRATION,
  appointmentOnlyOfficeAddress,
} from "@/lib/business-identity";
import { buildWhatsAppHref, cldFit } from "@/lib/utils";
import { resolveCompanyPhone } from "@/lib/company-phone";
import { SUNDAF_TRANSFER_ACCOUNT } from "@/lib/company-transfer";
import FooterHorizon from "./FooterHorizon";
import styles from "./CleanFooter.module.css";

type PaymentMark = {
  src: string;
  alt: string;
  title?: string;
  width: number;
  height: number;
};

// Payment marks use official, unchanged artwork only. Record each file's
// source in public/brand/ASSET-SOURCES.md before adding it here.
const PAYMENT_MARKS: readonly PaymentMark[] = [
  {
    src: "/brand/bca-white.svg",
    alt: "BCA",
    title: "Logo BCA merupakan merek terdaftar milik PT Bank Central Asia Tbk.",
    width: 51,
    height: 16,
  },
  {
    src: "/brand/mastercard-symbol.svg",
    alt: "Mastercard",
    width: 45,
    height: 32,
  },
  {
    src: "/brand/unionpay.svg",
    alt: "UnionPay",
    width: 37,
    height: 23,
  },
];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function CleanFooter({ logo, company }: { logo?: string; company: Record<string, string> }) {
  const logoSrc = cldFit(logo || "/logo.png", 320);
  const whatsappDisplay = company.company_whatsapp?.trim();
  const whatsapp = buildWhatsAppHref(whatsappDisplay, "Halo, saya ingin konsultasi perjalanan bersama Sundaf Trip.");
  const email = company.company_email?.trim();
  const phone = resolveCompanyPhone(company.company_phone);
  const phoneHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "";
  const nib = company.company_nib?.trim();
  const officeAddress = appointmentOnlyOfficeAddress(company.company_address);
  const igUser = (company.company_instagram || "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "")
    .trim();

  return (
    <footer className={styles.footer} data-clean-footer>
      <FooterHorizon />
      <div className={styles.shell}>
        <div className={styles.top}>
          <section className={styles.brand} aria-labelledby="footer-brand-title">
            <Link className={styles.logoLink} href="/" aria-label="Sundaf Trip, beranda">
              <Image className={styles.logo} src={logoSrc} alt="Sundaf Trip" width={180} height={50} />
            </Link>
            <span className={styles.brandNote} data-no-translate translate="no">Your B2B partner</span>
            <h2 id="footer-brand-title" className="sr-only">Sundaf Trip</h2>
            <p>Perjalanan Rusia, Asia Tengah, aurora, dan private trip untuk traveler Indonesia.</p>
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
          <section className={styles.partner} aria-labelledby="footer-partner-title">
            <h2 id="footer-partner-title">Untuk mitra perjalanan</h2>
            <p>Kebutuhan tamu Anda, dari satu layanan di Rusia hingga perjalanan grup. Mari bekerja sama.</p>
            <Link className={styles.textLink} href="/partner">Kenali kemitraan SUNDAF</Link>
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

        <div className={styles.trust}>
          <div className={styles.certificate} role="group" aria-label="Pendaftaran dan perizinan usaha">
            <div className={styles.credential}>
              <a
                className={styles.emblemLink}
                href={SUNDAF_AHU_REGISTRATION.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Cek pendaftaran ${SUNDAF_AHU_REGISTRATION.legalName} di AHU (buka di tab baru)`}
                title="Cek pendaftaran di AHU"
              >
                <Image className={styles.emblem} src="/brand/ahu-pengayoman.jpg" alt="Lambang Pengayoman, Ditjen AHU Kementerian Hukum RI" width={40} height={40} />
              </a>
              <p className={styles.credentialText}>
                <strong>Terdaftar di Kementerian Hukum RI</strong>
                <span data-no-translate translate="no">{SUNDAF_AHU_REGISTRATION.number}</span>
              </p>
            </div>
            {nib && (
              <div className={styles.credential}>
                <a
                  className={styles.ossBadge}
                  href="https://oss.go.id/id"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Buka situs resmi OSS (buka di tab baru)"
                  title="Buka situs resmi OSS"
                >
                  <Image src="/brand/oss-indonesia.svg" alt="OSS — Kementerian Investasi dan Hilirisasi/BKPM" width={66} height={20} />
                </a>
                <p className={styles.credentialText}>
                  <strong>Perizinan melalui OSS</strong>
                  <span data-no-translate translate="no">NIB {nib}</span>
                </p>
              </div>
            )}
          </div>

          <div className={styles.payments} role="group" aria-label="Metode pembayaran">
            <ul className={styles.paymentMarks}>
              {PAYMENT_MARKS.map((mark) => (
                <li key={mark.src}>
                  <Image src={mark.src} alt={mark.alt} title={mark.title} width={mark.width} height={mark.height} />
                </li>
              ))}
            </ul>
            <p className={styles.paymentNote}>
              {`Transfer perusahaan hanya melalui ${SUNDAF_TRANSFER_ACCOUNT.bank}.`}
              <span data-no-translate translate="no">{SUNDAF_TRANSFER_ACCOUNT.holder}</span>
            </p>
          </div>
        </div>

        <div className={styles.bottom}>
          {officeAddress && <address><span className={styles.appointment}>{APPOINTMENT_ONLY_LABEL}</span>{officeAddress}</address>}
          <p>© {new Date().getFullYear()} Sundaf Trip<span>Perjalanan dimulai dari obrolan.</span></p>
        </div>
      </div>
    </footer>
  );
}
