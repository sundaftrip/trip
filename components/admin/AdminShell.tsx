"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, Map, BookOpen, Type, Receipt,
  Users, Settings, FileText, Moon, Sun, LogOut, User, Menu, X, Shield, Activity, MessageSquareQuote, Newspaper, Info, ExternalLink, Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tours", label: "Tour", icon: Map },
  { href: "/admin/visa", label: "Katalog Visa", icon: FileText },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/scraper", label: "Scraper Konten", icon: Newspaper },
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

export default function AdminShell({ role, user, logo, children }: Props) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const NavLinks = ({ onClose }: { onClose?: () => void }) => (
    <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
      <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              active
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
            <item.icon size={18} />
            {item.label}
          </Link>
        );
      })}
      {role === "SUPERADMIN" && (
        <>
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">Admin</p>
          {adminItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}>
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </>
      )}
    </nav>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">

      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <Image src={logo || "/logo.png"} alt="Logo" width={120} height={36} className="h-8 w-auto object-contain dark:brightness-0 dark:invert" />
        </div>
        <NavLinks />
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-400">Travel CMS</p>
        </div>
      </aside>

      {/* Sidebar overlay — mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 w-72 bg-white dark:bg-gray-800 flex flex-col h-full shadow-xl">
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
              <Image src={logo || "/logo.png"} alt="Logo" width={100} height={30} className="h-7 w-auto object-contain dark:brightness-0 dark:invert" />
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={18} />
              </button>
            </div>
            <NavLinks onClose={() => setSidebarOpen(false)} />
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-400">Travel CMS</p>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <Menu size={20} />
            </button>
            <h2 className="text-sm text-gray-500 dark:text-gray-400 font-medium">Admin CMS</h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <a href="/" target="_blank" rel="noopener noreferrer"
              title="Buka website di tab baru"
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
              <ExternalLink size={16} />
              <span className="hidden sm:inline">Buka Website</span>
            </a>

            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              {mounted ? (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />) : <Moon size={18} />}
            </button>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                <User size={16} className="text-blue-600 dark:text-blue-400" />
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

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
