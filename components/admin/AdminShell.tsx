"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, Map, BookOpen, Type, Receipt,
  Users, Settings, FileText, Moon, Sun, LogOut, User, Menu, X, Shield, Activity, MessageSquareQuote, Info, ExternalLink, Wallet, Database, Inbox, Globe2,
  Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tours", label: "Tour", icon: Map },
  { href: "/admin/b2b-catalog", label: "Katalog B2B", icon: FileText },
  { href: "/admin/inquiries", label: "Lead Masuk", icon: Inbox },
  { href: "/admin/partners", label: "Referral", icon: Handshake },
  { href: "/admin/database-visa", label: "Database Visa", icon: Database },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/geo", label: "GEO", icon: Globe2 },
  { href: "/admin/testimonials", label: "Testimoni", icon: MessageSquareQuote },
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
    <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
      <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
      {navItems.map((item, index) => {
        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} onClick={onClose} data-active={active}
            aria-current={active ? "page" : undefined}
            className={cn(
              "admin-nav-link flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "text-teal-800 dark:text-teal-200"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
            <span className="admin-nav-index">{String(index + 1).padStart(2, "0")}</span>
            <item.icon size={17} strokeWidth={1.7} />
            <span>{item.label}</span>
          </Link>
        );
      })}
      {role === "SUPERADMIN" && (
        <>
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">Admin</p>
          {adminItems.map((item, index) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onClose} data-active={active}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "admin-nav-link flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "text-teal-800 dark:text-teal-200"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}>
                <span className="admin-nav-index">{String(index + 1).padStart(2, "0")}</span>
                <item.icon size={17} strokeWidth={1.7} />
                <span>{item.label}</span>
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
  const currentItem = [...navItems, ...adminItems]
    .filter((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)))
    .sort((a, b) => b.href.length - a.href.length)[0];
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="admin-cms flex h-screen overflow-hidden">

      {/* Sidebar — desktop */}
      <aside className="admin-sidebar hidden w-[17rem] border-r lg:flex flex-col shrink-0">
        <div className="admin-brand flex items-center px-6 border-b">
          <Image src={logo || "/logo.png"} alt="Logo Sundaf Trip" width={132} height={40} className="h-9 w-auto object-contain dark:brightness-0 dark:invert" />
        </div>
        <NavLinks pathname={pathname} role={role} />
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Sundaf Content OS</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Konten publik tersinkron otomatis</p>
        </div>
      </aside>

      {/* Sidebar overlay — mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="admin-sidebar relative z-50 w-[19rem] max-w-[88vw] flex h-full flex-col">
            <div className="admin-brand flex items-center justify-between px-6 border-b">
              <Image src={logo || "/logo.png"} alt="Logo Sundaf Trip" width={112} height={34} className="h-8 w-auto object-contain dark:brightness-0 dark:invert" />
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={19} strokeWidth={1.7} />
              </button>
            </div>
            <NavLinks pathname={pathname} role={role} onClose={() => setSidebarOpen(false)} />
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-400">Travel CMS</p>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="admin-header h-14 sm:h-16 border-b flex items-center justify-between px-3 sm:px-6 shrink-0">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {/* Hamburger — mobile only */}
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <Menu size={20} strokeWidth={1.7} />
            </button>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                {currentItem?.label ?? "Admin CMS"}
              </h2>
              <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">Admin CMS</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
            <a href="/" target="_blank" rel="noopener noreferrer"
              title="Buka website di tab baru"
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition">
              <ExternalLink size={16} strokeWidth={1.7} />
              <span className="hidden sm:inline">Buka Website</span>
            </a>

            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              {mounted ? (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />) : <Moon size={18} />}
            </button>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center shrink-0">
                <User size={16} strokeWidth={1.7} className="text-teal-700 dark:text-teal-300" />
              </div>
              <div className="hidden sm:block">
                <p className="font-medium text-gray-900 dark:text-white leading-none text-xs">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
              </div>
            </div>

            <button onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
              <LogOut size={16} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        <main className="admin-main flex-1 overflow-y-auto p-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
