"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { buildWhatsAppHref, cldFit } from "@/lib/utils";
import CleanGlobalSearch from "./CleanGlobalSearch";
import styles from "./CleanShell.module.css";

const destinationLinks = [
  { href: "/tours?destination=rusia", label: "Rusia & Aurora" },
  { href: "/tours?destination=asia-tengah", label: "Asia Tengah" },
  { href: "/tours?destination=vietnam", label: "Vietnam" },
  { href: "/tours?destination=jepang", label: "Jepang" },
  { href: "/destinations", label: "Semua destinasi" },
];

const secondaryLinks = [
  { href: "/custom-trip", label: "Private Trip" },
  { href: "/visa", label: "Layanan Visa" },
  { href: "/blog", label: "Jurnal" },
  { href: "/about", label: "Tentang Sundaf" },
];

const desktopLinks = [
  { href: "/destinations", label: "Destinasi" },
  ...secondaryLinks,
];

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function CleanNavbar({ logo, whatsapp }: { logo?: string; whatsapp?: string }) {
  const [open, setOpen] = useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const headerShellRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const logoSrc = cldFit(logo || "/logo.png", 320);
  const waHref = buildWhatsAppHref(whatsapp, "Halo, saya ingin konsultasi perjalanan bersama Sundaf Trip.");
  const consultationHref = waHref || "/contact";
  const showHairline = pathname !== "/" || scrolled;

  function isActive(href: string) {
    const hrefPath = href.split("?")[0];
    return pathname === hrefPath || (hrefPath !== "/" && pathname.startsWith(`${hrefPath}/`));
  }

  function closeDrawer() {
    setOpen(false);
  }

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 8);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  useEffect(() => {
    const closeFrame = window.requestAnimationFrame(() => setOpen(false));
    return () => window.cancelAnimationFrame(closeFrame);
  }, [pathname]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    desktopQuery.addEventListener("change", closeAtDesktop);
    return () => desktopQuery.removeEventListener("change", closeAtDesktop);
  }, []);

  useEffect(() => {
    if (!open) return;

    const drawer = drawerRef.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const backgroundTargets = [
      headerShellRef.current,
      document.querySelector<HTMLElement>('a[href="#website-main"]'),
      document.querySelector<HTMLElement>("main"),
      document.querySelector<HTMLElement>("[data-clean-footer]"),
      document.querySelector<HTMLElement>("[data-sticky-whatsapp]"),
    ].filter((target): target is HTMLElement => Boolean(target));
    const backgroundState = backgroundTargets.map((target) => ({
      target,
      inert: target.inert,
      ariaHidden: target.getAttribute("aria-hidden"),
    }));

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    backgroundTargets.forEach((target) => {
      target.inert = true;
      target.setAttribute("aria-hidden", "true");
    });

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !drawer) return;

      const focusable = Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelector))
        .filter((element) => (
          !element.hasAttribute("disabled")
          && element.getClientRects().length > 0
          && window.getComputedStyle(element).visibility !== "hidden"
        ));

      if (focusable.length === 0) {
        event.preventDefault();
        drawer.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (!drawer.contains(current)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      backgroundState.forEach(({ target, inert, ariaHidden }) => {
        target.inert = inert;
        if (ariaHidden === null) target.removeAttribute("aria-hidden");
        else target.setAttribute("aria-hidden", ariaHidden);
      });
      if (previouslyFocused?.isConnected && previouslyFocused.getClientRects().length > 0) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [open]);

  return (
    <header className={`${styles.header} ${showHairline ? styles.headerHairline : ""}`}>
      <div ref={headerShellRef} className={styles.headerShell}>
        <Link className={styles.logoLink} href="/" aria-label="Sundaf Trip, beranda">
          <Image className={styles.logoImage} src={logoSrc} alt="Sundaf Trip" width={180} height={50} priority />
        </Link>

        <div className={styles.desktopArea}>
          <nav className={styles.desktopNav} aria-label="Navigasi utama">
            {desktopLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link className={styles.desktopAction} href="/tours">Lihat jadwal &amp; biaya</Link>
        </div>

        <div className={styles.headerActions}>
          <CleanGlobalSearch />
          <button
            ref={menuButtonRef}
            className={styles.menuButton}
            type="button"
            aria-expanded={open}
            aria-controls="clean-mobile-drawer"
            aria-label="Buka menu"
            onClick={() => setOpen(true)}
          >
            <Menu aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className={`${styles.drawerLayer} ${open ? styles.drawerLayerOpen : ""}`}
        aria-hidden={!open}
      >
        <button
          className={styles.drawerBackdrop}
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={closeDrawer}
        />
        <div
          ref={drawerRef}
          className={styles.drawer}
          id="clean-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clean-mobile-drawer-title"
          tabIndex={-1}
        >
          <div className={styles.drawerHeader}>
            <Link className={styles.drawerLogo} href="/" aria-label="Sundaf Trip, beranda" onClick={closeDrawer}>
              <Image className={styles.logoImage} src={logoSrc} alt="Sundaf Trip" width={180} height={50} />
            </Link>
            <h2 id="clean-mobile-drawer-title" className="sr-only">Menu utama</h2>
            <button
              ref={closeButtonRef}
              className={styles.drawerClose}
              type="button"
              aria-label="Tutup menu"
              onClick={closeDrawer}
            >
              <X aria-hidden="true" />
            </button>
          </div>

          <div className={styles.drawerBody}>
            <nav className={styles.mobileNav} aria-label="Navigasi mobile">
              <Link
                className={styles.mobileLink}
                href="/tours"
                aria-current={isActive("/tours") ? "page" : undefined}
                onClick={closeDrawer}
              >
                Lihat jadwal &amp; biaya
              </Link>
              <button
                className={`${styles.destinationToggle} ${destinationsOpen ? styles.destinationToggleOpen : ""}`}
                type="button"
                aria-expanded={destinationsOpen}
                aria-controls="clean-destination-links"
                onClick={() => setDestinationsOpen((value) => !value)}
              >
                <span>Destinasi</span>
                <ChevronDown aria-hidden="true" />
              </button>

              <div
                className={`${styles.accordionRegion} ${destinationsOpen ? styles.accordionRegionOpen : ""}`}
                aria-hidden={!destinationsOpen}
              >
                <div className={styles.destinationLinks} id="clean-destination-links">
                  {destinationLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={closeDrawer}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {secondaryLinks.map((link) => (
                <Link
                  className={styles.mobileLink}
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  onClick={closeDrawer}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link className={styles.drawerWhatsApp} href={consultationHref} onClick={closeDrawer}>
              Tanya rute via WhatsApp
            </Link>
            <p className={styles.drawerNote}>Konsultasi awal tidak mengonfirmasi kursi atau pembayaran.</p>
          </div>
        </div>
      </div>
    </header>
  );
}
