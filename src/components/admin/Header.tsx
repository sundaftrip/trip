"use client";

import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut, User } from "lucide-react";

interface Props {
  user: { name?: string | null; email?: string | null; role: string };
}

export default function AdminHeader({ user }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-6 shrink-0">
      <h2 className="text-sm text-gray-500 dark:text-gray-400">
        Sundaf CMS
      </h2>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <User size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="hidden sm:block">
            <p className="font-medium text-gray-900 dark:text-white leading-none">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
