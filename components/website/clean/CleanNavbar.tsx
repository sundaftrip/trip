"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { buildWhatsAppHref, cldFit } from "@/lib/utils";
import styles from "./CleanSite.module.css";

const links = [
  { href: "/tours", label: "Jadwal Tour" },
  { href: "/custom-trip", label: "Private Trip" },
  { href: "/visa", label: "Layanan Visa" },
  { href: "/blog", label: "Jurnal" },
  { href: "/about", label: "Tentang Sundaf" },
];

export default function CleanNavbar({ logo, whatsapp }: { logo?: string; whatsapp?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const logoSrc = cldFit(logo || "/logo.png", 320);
  const waHref = buildWhatsAppHref(whatsapp, "Halo, saya ingin konsultasi perjalanan bersama Sundaf Trip.");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={`${styles.shell} ${styles.navRow}`}>
        <Link className={styles.logo} href="/" aria-label="Sundaf Trip, beranda">
          <Image src={logoSrc} alt="Sundaf Trip" width={176} height={54} priority />
        </Link>

        <nav className={styles.desktopNav} aria-label="Navigasi utama">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}>{link.label}</Link>;
          })}
        </nav>

        <Link className={styles.headerAction} href="/tours">Lihat jadwal tour</Link>
        <button
          className={styles.menuButton}
          type="button"
          aria-expanded={open}
          aria-controls="clean-mobile-panel"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <div className={styles.mobilePanel} id="clean-mobile-panel" hidden={!open}>
        <nav aria-label="Navigasi mobile">
          {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
        </nav>
        <Link className={styles.mobileAction} href={waHref || "/contact"} onClick={() => setOpen(false)}>Konsultasi via WhatsApp</Link>
      </div>
    </header>
  );
}
