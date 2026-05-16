"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Home, Map, Newspaper, Info, HelpCircle, Phone, Moon, Sun, Menu, X, ArrowRight } from "lucide-react";

const NAV = [
  { href: "/",         label: "Beranda",      icon: Home },
  { href: "/tours",    label: "Paket Tour",   icon: Map },
  { href: "/blog",     label: "Blog",         icon: Newspaper },
  { href: "/about",    label: "Tentang Kami", icon: Info },
  { href: "/faq",      label: "FAQ",          icon: HelpCircle },
  { href: "/#contact", label: "Kontak",       icon: Phone },
];

export default function ConsoleSidebar({ logo }: { logo?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  function toggleLang() {
    const cur = (localStorage.getItem("lang") as "id" | "en" | null) ?? "id";
    localStorage.setItem("lang", cur === "id" ? "en" : "id");
    window.location.reload();
  }

  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]);

  const NavList = () => (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--at-subtext)" }}>
        Menu
      </p>
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} onClick={() => setOpen(false)}
          data-active={active(href)}
          className="cns-navlink flex items-center gap-2.5 px-3 py-2 text-[13px]">
          <Icon size={15} /> {label}
        </Link>
      ))}
    </nav>
  );

  const Bottom = () => (
    <div className="px-3 py-3 space-y-2" style={{ borderTop: "1px solid var(--at-border)" }}>
      <Link href="/tours" onClick={() => setOpen(false)}
        className="flex items-center justify-center gap-1.5 w-full py-2.5 text-[12px] font-semibold rounded-md"
        style={{ background: "var(--at-text)", color: "var(--at-bg)" }}>
        Lihat Paket Tour <ArrowRight size={13} />
      </Link>
      <div className="flex gap-2">
        <button onClick={toggleLang} className="cns-mini-btn flex-1">
          {mounted && (localStorage.getItem("lang") === "en") ? "ID" : "EN"}
        </button>
        {mounted && (
          <button onClick={() => setTheme(isDark ? "light" : "dark")} className="cns-mini-btn flex-1" aria-label="Toggle dark mode">
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-4 cns-topbar">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo || "/logo.png"} alt="Logo" className="h-7 w-auto cns-logo" />
        </Link>
        <button onClick={() => setOpen(true)} className="cns-mini-btn !w-9 !h-9" aria-label="Buka menu">
          <Menu size={18} />
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-0 h-screen cns-sidebar">
        <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--at-border)" }}>
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo || "/logo.png"} alt="Logo" className="h-8 w-auto cns-logo" />
          </Link>
        </div>
        <NavList />
        <Bottom />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/55" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col cns-sidebar">
            <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--at-border)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo || "/logo.png"} alt="Logo" className="h-7 w-auto cns-logo" />
              <button onClick={() => setOpen(false)} className="cns-mini-btn !w-8 !h-8" aria-label="Tutup menu">
                <X size={16} />
              </button>
            </div>
            <NavList />
            <Bottom />
          </aside>
        </div>
      )}
    </>
  );
}
