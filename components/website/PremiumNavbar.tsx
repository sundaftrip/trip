import Image from "next/image";
import Link from "next/link";
import { buildWhatsAppHref } from "@/lib/utils";
import styles from "./PremiumChrome.module.css";

const NAV_LINKS = [
  ["Jadwal tour", "/tours"],
  ["Private trip", "/custom-trip"],
  ["Layanan visa", "/visa"],
  ["Tentang", "/about"],
  ["Jurnal", "/blog"],
] as const;

export default function PremiumNavbar({ whatsapp }: { whatsapp: string }) {
  const whatsappHref = buildWhatsAppHref(
    whatsapp,
    "Halo, saya ingin konsultasi perjalanan bersama Sundaf Trip.",
  );

  return (
    <header className={styles.header}>
      <div className={styles.navShell}>
        <Link href="/" prefetch={false} className={styles.brand} aria-label="Sundaf Trip — Beranda">
          <Image src="/logo.png" alt="Sundaf Trip" width={862} height={241} priority sizes="(max-width: 760px) 132px, 158px" />
        </Link>

        <nav className={styles.desktopNav} aria-label="Navigasi utama">
          {NAV_LINKS.map(([label, href]) => (
            <Link key={href} href={href} prefetch={false}>{label}</Link>
          ))}
        </nav>

        <div className={styles.navActions}>
          {whatsappHref && (
            <a href={whatsappHref} target="_blank" rel="noreferrer" className={styles.navCta}>
              Konsultasi
            </a>
          )}
          <details className={styles.mobileMenu}>
            <summary aria-label="Buka menu navigasi">
              <span>Menu</span>
              <span className={styles.menuIcon} aria-hidden="true">+</span>
            </summary>
            <nav aria-label="Navigasi mobile">
              {NAV_LINKS.map(([label, href]) => (
                <Link key={href} href={href} prefetch={false}>{label}<span aria-hidden="true">→</span></Link>
              ))}
              <Link href="/reviews" prefetch={false}>Review peserta<span aria-hidden="true">→</span></Link>
              <Link href="/contact" prefetch={false}>Kontak<span aria-hidden="true">→</span></Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
