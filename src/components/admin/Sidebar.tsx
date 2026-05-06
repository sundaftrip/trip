"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Map,
  BookOpen,
  Type,
  Receipt,
  Users,
  Settings,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tours", label: "Tour", icon: Map },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/texts", label: "Teks Website", icon: Type },
  { href: "/admin/receipts", label: "Receipt", icon: Receipt },
  { href: "/admin/terms", label: "Syarat & Ketentuan", icon: FileText },
];

const adminItems = [
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export default function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <Image src="/logo.png" alt="Sundaf" width={120} height={36} className="h-8 w-auto dark:hidden" />
        <Image src="/logo-white.png" alt="Sundaf" width={120} height={36} className="h-8 w-auto hidden dark:block" />
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
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
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-center text-gray-400">CV Sundaf Holiday Group</p>
      </div>
    </aside>
  );
}
