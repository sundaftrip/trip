"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: { id: "Beranda", en: "Home" } },
  { href: "/tours", label: { id: "Paket Tour", en: "Tour Packages" } },
  { href: "/blog", label: { id: "Blog", en: "Blog" } },
  { href: "/#contact", label: { id: "Kontak", en: "Contact" } },
];

export default function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<"id" | "en">("id");

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("lang") as "id" | "en" | null;
    if (stored) setLang(stored);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleLang() {
    const next = lang === "id" ? "en" : "id";
    setLang(next);
    localStorage.setItem("lang", next);
  }

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-300",
      scrolled
        ? "bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-900"
        : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {mounted ? (
              <Image
                src={isDark || !scrolled ? "/logo-white.png" : "/logo.png"}
                alt="Sundaf Trip"
                width={140}
                height={42}
                className="h-9 lg:h-10 w-auto"
                priority
              />
            ) : (
              <div className="h-9 w-32 bg-transparent" />
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  scrolled
                    ? "text-gray-700 dark:text-gray-300 hover:text-[#2d6a4f] dark:hover:text-[#7abea4]"
                    : "text-white/80 hover:text-white"
                )}>
                {link.label[lang]}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={toggleLang}
              className={cn(
                "text-xs font-bold px-2.5 py-1 rounded-md border transition",
                scrolled
                  ? "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#2d6a4f] hover:text-[#2d6a4f]"
                  : "border-white/25 text-white/70 hover:border-white hover:text-white"
              )}>
              {lang === "id" ? "EN" : "ID"}
            </button>

            {mounted && (
              <button onClick={() => setTheme(isDark ? "light" : "dark")}
                className={cn(
                  "p-2 rounded-lg transition",
                  scrolled
                    ? "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}>
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            )}

            <Link href="/tours"
              className="hidden lg:inline-flex px-4 py-2 text-white text-sm font-semibold rounded-xl transition"
              style={{ background: "#2d6a4f" }}>
              {lang === "id" ? "Lihat Tour" : "See Tours"}
            </Link>

            <button onClick={() => setOpen(!open)}
              className={cn(
                "lg:hidden p-2 rounded-lg transition",
                scrolled
                  ? "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  : "text-white hover:bg-white/10"
              )}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 py-4 space-y-1 bg-white dark:bg-black">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg transition hover:text-[#2d6a4f] hover:bg-[#2d6a4f]/5">
                {link.label[lang]}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
