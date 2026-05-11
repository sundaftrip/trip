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

export default function Navbar({ logo }: { logo?: string }) {
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
