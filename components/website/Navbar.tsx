"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: { id: "Beranda", en: "Home" } },
  { href: "/tours", label: { id: "Paket Tour", en: "Tours" } },
  { href: "/blog", label: { id: "Blog", en: "Blog" } },
  { href: "/#contact", label: { id: "Kontak", en: "Contact" } },
];

export default function Navbar({ logo, theme = "classic" }: { logo?: string; theme?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<"id" | "en">("id");

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("lang") as "id" | "en" | null;
    if (stored) setLang(stored);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleLang() {
    const next = lang === "id" ? "en" : "id";
    setLang(next);
    localStorage.setItem("lang", next);
  }

  const isDark = mounted && resolvedTheme === "dark";

  /* ── KAWAII ── */
  if (theme === "kawaii") return (
    <header className="fixed top-0 inset-x-0 z-50 border-b-2"
      style={{ background: "var(--kw-bg)", borderColor: "var(--kw-border)", boxShadow: "0 4px 0 0 var(--kw-shadow)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image src={logo || "/logo.png"} alt="Logo" width={130} height={40}
              className={`h-8 w-auto${mounted && isDark ? " logo-dark" : ""}`} priority />
          </Link>

          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="kw-pill font-black hover:opacity-75 transition-opacity"
                style={{ background: "var(--kw-card)", color: "var(--kw-text)" }}>
                {link.label[lang]}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className="kw-pill font-black"
              style={{ background: "var(--kw-peach)", color: "var(--kw-text)" }}>
              {lang === "id" ? "EN" : "ID"}
            </button>
            {mounted && (
              <button onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Toggle dark mode"
                className="kw-pill" style={{ background: "var(--kw-sky)", color: "var(--kw-text)" }}>
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            )}
            <Link href="/tours" className="hidden lg:inline-flex kw-btn px-4 py-2 text-xs font-black"
              style={{ background: "var(--kw-border)", color: "#ffffff" }}>
              {lang === "id" ? "Lihat Tour ♡" : "See Tours ♡"}
            </Link>
            <button onClick={() => setOpen(!open)} className="lg:hidden kw-pill"
              style={{ background: "var(--kw-card)", color: "var(--kw-text)" }}>
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t-2 py-4 space-y-1"
            style={{ borderColor: "var(--kw-border)", background: "var(--kw-bg)" }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="block px-4 py-2.5 font-black text-sm" style={{ color: "var(--kw-text)" }}>
                {link.label[lang]}
              </Link>
            ))}
            <div className="px-4 pt-2">
              <Link href="/tours" onClick={() => setOpen(false)}
                className="kw-btn px-5 py-2.5 text-xs font-black w-full justify-center"
                style={{ background: "var(--kw-border)", color: "#ffffff" }}>
                {lang === "id" ? "Lihat Tour ♡" : "See Tours ♡"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );

  /* ── GLOBE / WORLD LANDMARKS ── */
  if (theme === "globe") return (
    <header className="fixed top-0 inset-x-0 z-50"
      style={{ background: "var(--gl-card)", borderBottom: "1.5px solid color-mix(in srgb, var(--gl-border) 30%, transparent)", boxShadow: "0 4px 24px var(--gl-shadow)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image src={logo || "/logo.png"} alt="Logo" width={130} height={40}
              className={`h-8 w-auto${mounted && isDark ? " logo-dark" : ""}`} priority />
          </Link>

          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="gl-pill hover:opacity-80 transition-opacity font-black"
                style={{ background: "color-mix(in srgb, var(--gl-bg) 80%, transparent)", color: "var(--gl-text)", borderColor: "color-mix(in srgb, var(--gl-border) 30%, transparent)" }}>
                {link.label[lang]}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className="gl-pill font-black"
              style={{ background: "var(--gl-sky)", color: "var(--gl-on-sky)", borderColor: "transparent" }}>
              {lang === "id" ? "EN" : "ID"}
            </button>
            {mounted && (
              <button onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Toggle dark mode"
                className="gl-pill" style={{ background: "#fef9c3", color: "#111827", borderColor: "transparent" }}>
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            )}
            <Link href="/tours" className="hidden lg:inline-flex gl-btn px-4 py-2 text-xs font-black"
              style={{ background: "var(--gl-border)", color: "#ffffff", borderColor: "var(--gl-border)" }}>
              {lang === "id" ? "Lihat Tour ✈" : "See Tours ✈"}
            </Link>
            <button onClick={() => setOpen(!open)} className="lg:hidden gl-pill"
              style={{ background: "color-mix(in srgb, var(--gl-bg) 80%, transparent)", color: "var(--gl-text)", borderColor: "color-mix(in srgb, var(--gl-border) 30%, transparent)" }}>
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t py-4 space-y-1"
            style={{ borderColor: "color-mix(in srgb, var(--gl-border) 25%, transparent)", background: "var(--gl-card)" }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="block px-4 py-2.5 font-black text-sm" style={{ color: "var(--gl-text)" }}>
                {link.label[lang]}
              </Link>
            ))}
            <div className="px-4 pt-2">
              <Link href="/tours" onClick={() => setOpen(false)}
                className="gl-btn px-5 py-2.5 text-xs font-black w-full justify-center"
                style={{ background: "var(--gl-border)", color: "#ffffff", borderColor: "var(--gl-border)" }}>
                {lang === "id" ? "Lihat Tour ✈" : "See Tours ✈"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );

  /* ── MAP / ATLAS ── */
  if (theme === "map") return (
    <header className="fixed top-0 inset-x-0 z-50"
      style={{ background: "var(--mp-card)", borderBottom: "2px solid var(--mp-border)", boxShadow: "0 3px 0 0 var(--mp-border), 0 6px 24px var(--mp-shadow)", backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src={logo || "/logo.png"} alt="Logo" width={130} height={40}
              className={`h-8 w-auto${mounted && isDark ? " logo-dark" : ""}`} priority />
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="mp-pill hover:opacity-75 transition-opacity"
                style={{ background: "var(--mp-card)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>
                {link.label[lang]}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className="mp-pill"
              style={{ background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>
              {lang === "id" ? "EN" : "ID"}
            </button>
            {mounted && (
              <button onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Toggle dark mode"
                className="mp-pill" style={{ background: "var(--mp-card)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            )}
            <Link href="/tours" className="hidden lg:inline-flex mp-btn text-xs"
              style={{ background: "var(--mp-accent)", color: "var(--mp-on-accent)", borderColor: "var(--mp-border)" }}>
              {lang === "id" ? "Lihat Tour" : "See Tours"}
            </Link>
            <button onClick={() => setOpen(!open)} className="lg:hidden mp-pill"
              style={{ background: "var(--mp-card)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t-2 py-4 space-y-1"
            style={{ borderColor: "var(--mp-border)", background: "var(--mp-card)" }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="block px-4 py-2.5 font-bold text-sm uppercase tracking-wide" style={{ color: "var(--mp-text)" }}>
                {link.label[lang]}
              </Link>
            ))}
            <div className="px-4 pt-2">
              <Link href="/tours" onClick={() => setOpen(false)}
                className="mp-btn text-xs w-full justify-center"
                style={{ background: "var(--mp-accent)", color: "var(--mp-on-accent)", borderColor: "var(--mp-border)" }}>
                {lang === "id" ? "Lihat Tour" : "See Tours"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );

  /* ── TROPICAL ── */
  if (theme === "tropical") return (
    <header className="fixed top-0 inset-x-0 z-50 border-b-2"
      style={{ background: "var(--tr-bg)", borderColor: "var(--tr-border)", boxShadow: "0 4px 0 0 var(--tr-shadow)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image src={logo || "/logo.png"} alt="Logo" width={130} height={40}
              className={`h-8 w-auto${mounted && isDark ? " logo-dark" : ""}`} priority />
          </Link>

          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="tr-pill font-black hover:opacity-75 transition-opacity"
                style={{ background: "var(--tr-card)", color: "var(--tr-text)" }}>
                {link.label[lang]}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className="tr-pill font-black"
              style={{ background: "var(--tr-mint)", color: "var(--tr-text)" }}>
              {lang === "id" ? "EN" : "ID"}
            </button>
            {mounted && (
              <button onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Toggle dark mode"
                className="tr-pill" style={{ background: "var(--tr-sky)", color: "var(--tr-text)" }}>
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            )}
            <Link href="/tours" className="hidden lg:inline-flex tr-btn px-4 py-2 text-xs font-black"
              style={{ background: "var(--site-accent)", color: "#ffffff" }}>
              {lang === "id" ? "Lihat Tour 🌴" : "See Tours 🌴"}
            </Link>
            <button onClick={() => setOpen(!open)} className="lg:hidden tr-pill"
              style={{ background: "var(--tr-card)", color: "var(--tr-text)" }}>
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t-2 py-4 space-y-1"
            style={{ borderColor: "var(--tr-border)", background: "var(--tr-bg)" }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="block px-4 py-2.5 font-black text-sm" style={{ color: "var(--tr-text)" }}>
                {link.label[lang]}
              </Link>
            ))}
            <div className="px-4 pt-2">
              <Link href="/tours" onClick={() => setOpen(false)}
                className="tr-btn px-5 py-2.5 text-xs font-black w-full justify-center"
                style={{ background: "var(--site-accent)", color: "#ffffff" }}>
                {lang === "id" ? "Lihat Tour 🌴" : "See Tours 🌴"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );

  /* ── PIXEL ── */
  if (theme === "pixel") return (
    <header className="fixed top-0 inset-x-0 z-50 border-b-2"
      style={{
        background: "var(--px-bg)",
        backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
        backgroundSize: "16px 16px",
        borderColor: "var(--px-border)",
        boxShadow: "0 4px 0 0 var(--px-shadow)",
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image src={logo || "/logo.png"} alt="Logo" width={130} height={40}
              className={`h-8 w-auto${mounted && isDark ? " logo-dark" : ""}`} priority />
          </Link>

          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="px-pill hover:opacity-75 transition-opacity"
                style={{ background: "var(--px-card)", color: "var(--px-text)" }}>
                {link.label[lang]}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className="px-pill"
              style={{ background: "var(--px-yellow)", color: "#111827" }}>
              {lang === "id" ? "EN" : "ID"}
            </button>
            {mounted && (
              <button onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Toggle dark mode"
                className="px-pill" style={{ background: "var(--px-cyan)", color: "var(--px-on-cyan)" }}>
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            )}
            <Link href="/tours" className="hidden lg:inline-flex px-btn px-4 py-2 text-xs"
              style={{ background: "var(--site-accent)", color: "#ffffff" }}>
              {lang === "id" ? "LIHAT TOUR ►" : "SEE TOURS ►"}
            </Link>
            <button onClick={() => setOpen(!open)} className="lg:hidden px-pill"
              style={{ background: "var(--px-card)", color: "var(--px-text)" }}>
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t-2 py-4 space-y-1"
            style={{ borderColor: "var(--px-border)", background: "var(--px-bg)" }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="block px-4 py-2.5 font-black text-sm" style={{ color: "var(--px-text)", fontFamily: "monospace" }}>
                {link.label[lang]}
              </Link>
            ))}
            <div className="px-4 pt-2">
              <Link href="/tours" onClick={() => setOpen(false)}
                className="px-btn px-5 py-2.5 text-xs w-full justify-center"
                style={{ background: "var(--site-accent)", color: "#ffffff" }}>
                {lang === "id" ? "LIHAT TOUR ►" : "SEE TOURS ►"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );

  /* ── CLASSIC / VIBRANT / BOLD ── */
  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-300",
      scrolled
        ? "bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-900"
        : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">

          <Link href="/" className="flex items-center">
            <Image
              src={logo || "/logo.png"}
              alt="Logo"
              width={130} height={40}
              className={`h-8 w-auto${mounted && isDark ? " logo-dark" : ""}`}
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                {link.label[lang]}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleLang}
              className="text-[11px] font-bold px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition">
              {lang === "id" ? "EN" : "ID"}
            </button>

            {mounted && (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label="Toggle dark mode"
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition">
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}

            <Link href="/tours"
              className="hidden lg:inline-flex px-4 py-2 text-white text-sm font-semibold rounded-xl transition"
              style={{ background: "var(--site-accent, #2d6a4f)" }}>
              {lang === "id" ? "Lihat Tour" : "See Tours"}
            </Link>

            <button onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-gray-100 dark:border-gray-900 py-4 space-y-1 bg-white dark:bg-black">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg transition">
                {link.label[lang]}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
