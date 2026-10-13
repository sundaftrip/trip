"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  Activity, BookOpen, CircleHelp, Database, ExternalLink, FileText, Globe2, Inbox, Info,
  LayoutDashboard, LogOut, Map, Menu, MessageSquareQuote, Moon, Receipt, Settings, Shield,
  Sun, Type, User, Users, Wallet, X, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_MODULE_GROUPS, adminModuleForPath, type AdminModuleGroup, type AdminModuleKey } from "@/lib/admin-modules";

export type AdminNavItem = {
  key: AdminModuleKey;
  href: string;
  label: string;
  group: AdminModuleGroup;
};

const ICONS: Record<AdminModuleKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  guide: CircleHelp,
  tours: Map,
  visa: Database,
  b2b: FileText,
  inquiries: Inbox,
  receipts: Receipt,
  finance: Wallet,
  blog: BookOpen,
  scraper: BookOpen,
  geo: Globe2,
  testimonials: MessageSquareQuote,
  texts: Type,
  about: Info,
  faq: FileText,
  terms: FileText,
  users: Users,
  permissions: Shield,
  logs: Activity,
  settings: Settings,
};

interface Props {
  user: { name?: string | null; email?: string | null; accessLabel: string };
  navItems: AdminNavItem[];
  logo?: string;
  children: React.ReactNode;
}

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ pathname, navItems, onClose }: { pathname: string; navItems: AdminNavItem[]; onClose?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Menu CMS">
      {ADMIN_MODULE_GROUPS.map((group) => {
        const items = navItems.filter((item) => item.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group} className="mb-4 last:mb-0">
            {group !== "Utama" && (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{group}</p>
            )}
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = ICONS[item.key];
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700",
                    )}
                  >
                    <Icon size={17} aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export default function AdminShell({ user, navItems, logo, children }: Props) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const currentModule = adminModuleForPath(pathname);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar — desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:flex">
        <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-700">
          <Image src={logo || "/logo.png"} alt="Logo" width={120} height={36} className="h-8 w-auto object-contain dark:brightness-0 dark:invert" />
        </div>
        <NavLinks pathname={pathname} navItems={navItems} />
        <div className="border-t border-gray-200 p-3 dark:border-gray-700">
          <p className="text-center text-xs text-gray-400">CMS Sundaf Trip</p>
        </div>
      </aside>

      {/* Sidebar overlay — mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 flex h-full w-72 flex-col bg-white shadow-xl dark:bg-gray-800">
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-700">
              <Image src={logo || "/logo.png"} alt="Logo" width={100} height={30} className="h-7 w-auto object-contain dark:brightness-0 dark:invert" />
              <button onClick={() => setSidebarOpen(false)} aria-label="Tutup menu" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={18} />
              </button>
            </div>
            <NavLinks pathname={pathname} navItems={navItems} onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-800 sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button onClick={() => setSidebarOpen(true)} aria-label="Buka menu"
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden">
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                {currentModule?.label ?? "CMS"}
              </h2>
              <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">CMS Sundaf Trip</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
            <a href="/" target="_blank" rel="noopener noreferrer" title="Buka website di tab baru"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 sm:px-3">
              <ExternalLink size={16} />
              <span className="hidden sm:inline">Buka Website</span>
            </a>

            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Ganti mode terang/gelap"
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-700">
              {mounted ? (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />) : <Moon size={18} />}
            </button>

            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <User size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium leading-none text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.accessLabel}</p>
              </div>
            </div>

            <button onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 sm:px-3">
              <LogOut size={16} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6">{children}</main>
      </div>
    </div>
  );
}
