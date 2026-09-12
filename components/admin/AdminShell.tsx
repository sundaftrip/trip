"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, Map, BookOpen, Type, Receipt,
  Users, Settings, FileText, Moon, Sun, LogOut, Menu, X, Shield, Activity, MessageSquareQuote, Info, ExternalLink, Wallet, Database, Inbox, Globe2,
  Handshake,
} from "lucide-react";
import styles from "./AdminWorkspace.module.css";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tours", label: "Tour", icon: Map },
  { href: "/admin/b2b-catalog", label: "Katalog B2B", icon: FileText },
  { href: "/admin/inquiries", label: "Lead Masuk", icon: Inbox },
  { href: "/admin/partners", label: "Referral", icon: Handshake },
  { href: "/admin/database-visa", label: "Database Visa", icon: Database },
  { href: "/admin/visa-discussions", label: "Diskusi Visa", icon: MessageSquareQuote },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/geo", label: "GEO", icon: Globe2 },
  { href: "/admin/testimonials", label: "Testimoni", icon: MessageSquareQuote },
  { href: "/admin/content", label: "Konten publik", icon: FileText },
  { href: "/admin/texts", label: "Teks Website", icon: Type },
  { href: "/admin/receipts", label: "Receipt", icon: Receipt },
  { href: "/admin/keuangan", label: "Keuangan", icon: Wallet },
  { href: "/admin/about", label: "Tentang Kami", icon: Info },
  { href: "/admin/faq", label: "FAQ", icon: FileText },
  { href: "/admin/terms", label: "Syarat & Ketentuan", icon: FileText },
];

const adminItems = [
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
  { href: "/admin/permissions", label: "Izin Akses", icon: Shield },
  { href: "/admin/logs", label: "Log Aktivitas", icon: Activity },
];

interface Props {
  role: string;
  user: { name?: string | null; email?: string | null; role: string };
  logo?: string;
  children: React.ReactNode;
}

function NavLinks({ pathname, role, onClose }: { pathname: string; role: string; onClose?: () => void }) {
  return (
    <nav className={styles.navigation} aria-label="Navigasi CMS">
      <p className={styles.navHeading}>Menu</p>
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} onClick={onClose}
            aria-current={active ? "page" : undefined}
            className={styles.navLink}>
            <item.icon size={18} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
      {role === "SUPERADMIN" && (
        <>
          <p className={styles.navHeading}>Admin</p>
          {adminItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={styles.navLink}>
                <item.icon size={18} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </>
      )}
    </nav>
  );
}

export default function AdminShell({ role, user, logo, children }: Props) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const mainPaneRef = useRef<HTMLDivElement>(null);
  const currentItem = [...navItems, ...adminItems]
    .filter((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)))
    .sort((a, b) => b.href.length - a.href.length)[0];
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const drawer = drawerRef.current;
    const mainPane = mainPaneRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : menuButtonRef.current;
    const previousInert = mainPane?.inert ?? false;
    const previousOverflow = document.body.style.overflow;
    if (mainPane) mainPane.inert = true;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setSidebarOpen(false);
        return;
      }
      if (event.key !== "Tab" || !drawer) return;
      const items = Array.from(drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]'))
        .filter((item) => item.getClientRects().length > 0);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) { event.preventDefault(); return; }
      if (!drawer.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    }

    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeAtDesktop = () => { if (desktop.matches) setSidebarOpen(false); };
    desktop.addEventListener("change", closeAtDesktop);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      desktop.removeEventListener("change", closeAtDesktop);
      document.removeEventListener("keydown", handleKeyDown);
      if (mainPane) mainPane.inert = previousInert;
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected && previousFocus.getClientRects().length) previousFocus.focus({ preventScroll: true });
    };
  }, [sidebarOpen]);

  return (
    <div className={styles.workspace}>

      {/* Sidebar — desktop */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Image src={logo || "/logo.png"} alt="Logo" width={120} height={36} className="h-8 w-auto object-contain dark:brightness-0 dark:invert" />
        </div>
        <NavLinks pathname={pathname} role={role} />
        <p className={styles.sidebarFooter}>Sundaf Trip CMS</p>
      </aside>

      {/* Sidebar overlay — mobile */}
      {sidebarOpen && (
        <div className={styles.mobileLayer}>
          <div className={styles.mobileBackdrop} aria-hidden="true" onClick={() => setSidebarOpen(false)} />
          <aside ref={drawerRef} id="admin-mobile-navigation" className={styles.mobileDrawer} role="dialog" aria-modal="true" aria-label="Menu CMS">
            <div className={styles.brand}>
              <Image src={logo || "/logo.png"} alt="Logo" width={100} height={30} className="h-7 w-auto object-contain dark:brightness-0 dark:invert" />
              <button ref={closeButtonRef} type="button" aria-label="Tutup menu CMS" onClick={() => setSidebarOpen(false)} className={styles.headerButton}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <NavLinks pathname={pathname} role={role} onClose={() => setSidebarOpen(false)} />
            <p className={styles.sidebarFooter}>Sundaf Trip CMS</p>
          </aside>
        </div>
      )}

      {/* Main */}
      <div ref={mainPaneRef} className={styles.mainPane}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            {/* Hamburger — mobile only */}
            <button ref={menuButtonRef} type="button" aria-label="Buka menu CMS" aria-expanded={sidebarOpen} aria-controls="admin-mobile-navigation" onClick={() => setSidebarOpen(true)}
              className={`${styles.headerButton} ${styles.menuButton}`}>
              <Menu size={20} aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <h2>
                {currentItem?.label ?? "Admin CMS"}
              </h2>
            </div>
          </div>

          <div className={styles.headerActions}>
            <a href="/" target="_blank" rel="noopener noreferrer"
              title="Buka website di tab baru"
              aria-label="Buka website di tab baru"
              className={styles.headerButton}>
              <ExternalLink size={16} aria-hidden="true" />
              <span>Buka website</span>
            </a>

            <button type="button" aria-label={mounted && theme === "dark" ? "Gunakan tampilan terang" : "Gunakan tampilan gelap"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={styles.headerButton}>
              {mounted ? (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />) : <Moon size={18} />}
            </button>

            <div className={styles.account}>
              <p>{user.name}</p>
              <p>{user.role}</p>
            </div>

            <button type="button" aria-label="Keluar dari CMS" onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className={styles.headerButton}>
              <LogOut size={16} aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
