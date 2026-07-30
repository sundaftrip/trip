import Image from "next/image";
import Link from "next/link";
import { Contact, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { buildWhatsAppHref, cldFit } from "@/lib/utils";
import styles from "./CleanShell.module.css";

type FooterContactLink = {
  href: string;
  label: string;
  external: boolean;
  icon?: LucideIcon;
  iconOnly?: boolean;
};

export default function CleanFooter({ logo, company }: { logo?: string; company: Record<string, string> }) {
  const logoSrc = cldFit(logo || "/logo.png", 320);
  const whatsappDisplay = company.company_whatsapp?.trim();
  const whatsapp = buildWhatsAppHref(whatsappDisplay, "Halo, saya ingin konsultasi perjalanan bersama Sundaf Trip.");
  const email = company.company_email?.trim();
  const phone = company.company_phone?.trim();
  const phoneHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "";
  const address = company.company_address?.trim();
  const nib = company.company_nib?.trim();
  const legalName = company.company_legal_name?.trim();
  const igUser = (company.company_instagram || "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "")
    .trim();
  const contactLinks: Array<FooterContactLink | null> = [
    whatsapp
      ? {
          href: whatsapp,
          label: "WhatsApp Sundaf Trip",
          external: true,
          icon: MessageCircle,
          iconOnly: true,
        }
      : null,
    email ? { href: `mailto:${email}`, label: email, external: false } : null,
    phoneHref
      ? {
          href: phoneHref,
          label: "Telepon Sundaf Trip",
          external: false,
          icon: Phone,
          iconOnly: true,
        }
      : null,
    igUser
      ? { href: `https://www.instagram.com/${igUser}`, label: `Instagram @${igUser}`, external: true }
      : null,
    { href: "/contact", label: "Halaman kontak", external: false, icon: Contact, iconOnly: true },
  ];
  const visibleContactLinks = contactLinks.filter(
    (link): link is FooterContactLink => Boolean(link),
  );

  return (
    <footer className={styles.footer} data-clean-footer>
      <div className={styles.footerShell}>
        <div className={styles.footerContent}>
          <section className={styles.footerBrand} aria-labelledby="footer-brand-title">
            <Link href="/" aria-label="Sundaf Trip, beranda">
              <Image className={styles.logoImage} src={logoSrc} alt="Sundaf Trip" width={180} height={50} />
            </Link>
            <h2 id="footer-brand-title" className="sr-only">Sundaf Trip</h2>
            <p className={styles.footerDescription}>
              Perjalanan Rusia, Asia Tengah, aurora, dan private trip yang dirancang untuk traveler Indonesia.
            </p>
            {(legalName || address) && (
              <div className={styles.companyBlock}>
                {legalName && <strong>{legalName}</strong>}
                {address && <address>{address}</address>}
              </div>
            )}
          </section>

          <div className={styles.footerLinkGrid}>
            <section className={styles.footerGroup}>
              <h2>Perjalanan</h2>
              <nav aria-label="Tautan perjalanan">
                <Link href="/tours">Jadwal Tour</Link>
                <Link href="/custom-trip">Private Trip</Link>
                <Link href="/destinations">Destinasi</Link>
                <Link href="/visa">Layanan Visa</Link>
              </nav>
            </section>

            <section className={styles.footerGroup}>
              <h2>Sundaf</h2>
              <nav aria-label="Tautan tentang Sundaf">
                <Link href="/about">Tentang Sundaf</Link>
                <Link href="/blog">Jurnal</Link>
                <Link href="/reviews">Cerita Peserta</Link>
                <Link href="/faq">Pertanyaan Umum</Link>
              </nav>
            </section>

            <section className={styles.footerGroup}>
              <h2>Hubungi</h2>
              <nav aria-label="Tautan kontak">
                {visibleContactLinks.map(({ icon: Icon, iconOnly, ...link }) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={iconOnly ? styles.footerContactIcon : undefined}
                    aria-label={
                      iconOnly || link.external
                        ? `${link.label}${link.external ? " (buka di tab baru)" : ""}`
                        : undefined
                    }
                    title={iconOnly ? link.label : undefined}
                    {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {Icon ? <Icon aria-hidden="true" size={20} strokeWidth={1.8} /> : link.label}
                    {iconOnly && <span className="sr-only">{link.label}</span>}
                  </a>
                ))}
              </nav>
            </section>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} Sundaf Trip{nib ? ` · NIB ${nib}` : ""}</span>
          <div className={styles.footerLegal}>
            <Link href="/legalitas-dan-keamanan">Legalitas</Link>
            <Link href="/privacy">Privasi</Link>
            <Link href="/terms">Syarat &amp; Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
