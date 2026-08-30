"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Save, ChevronDown, ChevronUp, User } from "lucide-react";
import { ALL_PERMISSION_KEYS, DEFAULT_PERMISSIONS, PERMISSION_LABELS } from "@/lib/permission-keys";
import { adminActionError, requestAdminAction } from "@/lib/admin-action";

const SECTIONS = [...new Set(Object.values(PERMISSION_LABELS).map((permission) => permission.section))];

interface UserPerm {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Record<string, boolean>;
}

function UserPermCard({ user, onSaved }: { user: UserPerm; onSaved: () => void }) {
  const [perms, setPerms] = useState<Record<string, boolean>>(user.permissions);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const toggle = (key: string) => {
    setPerms((p) => ({ ...p, [key]: !p[key] }));
    setStatus("idle");
  };

  const resetToDefault = () => {
    setPerms({ ...(DEFAULT_PERMISSIONS[user.role] ?? {}) });
    setStatus("idle");
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setStatus("idle");
    try {
      await requestAdminAction(`/api/permissions/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(perms),
      }, "Izin belum tersimpan. Coba lagi.");
      setStatus("saved");
      onSaved();
    } catch (error) {
      setErrorMsg(adminActionError(error, "Izin belum tersimpan. Coba lagi."));
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <button type="button" aria-expanded={open} aria-controls={`permissions-${user.id}`}
        className="flex w-full items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600"
        onClick={() => setOpen((o) => !o)}>
        <span className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
            <User size={16} className="text-blue-600 dark:text-blue-400" />
          </span>
          <span>
            <span className="block font-semibold text-gray-900 dark:text-white text-sm">{user.name}</span>
            <span className="block text-xs text-gray-400">{user.email}</span>
          </span>
          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            user.role === "ADMIN"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400"
              : user.role === "VIEWER"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
          }`}>{user.role === "VIEWER" ? "DEMO" : user.role}</span>
        </span>
        <span className="flex items-center gap-3">
          {status === "saved" && <span role="status" className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Tersimpan</span>}
          {status === "error" && <span role="alert" className="text-xs text-red-600 dark:text-red-400">{errorMsg}</span>}
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </span>
      </button>

      {open && (
        <div id={`permissions-${user.id}`} className="border-t border-gray-100 dark:border-gray-700">
          {SECTIONS.map((section) => {
            const keys = ALL_PERMISSION_KEYS.filter((k) => PERMISSION_LABELS[k]?.section === section);
            return (
              <div key={section}>
                <div className="px-6 py-2 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{section}</p>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {keys.map((key) => (
                    <div key={key} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{PERMISSION_LABELS[key]?.label}</span>
                      <button
                        type="button"
                        role="switch"
                        aria-label={PERMISSION_LABELS[key].label}
                        aria-checked={Boolean(perms[key])}
                        disabled={saving}
                        onClick={() => toggle(key)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                          perms[key] ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                        }`}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                          perms[key] ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={resetToDefault} disabled={saving}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline transition">
              Reset ke default {user.role}
            </button>
            <button type="button" onClick={save} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition">
              <Save size={15} />
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PermissionsPage() {
  const [users, setUsers] = useState<UserPerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await requestAdminAction("/api/permissions", {}, "Daftar izin belum dapat dimuat.");
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Daftar izin belum dapat dimuat.");
      setUsers(data);
    } catch (error) {
      setError(adminActionError(error, "Daftar izin belum dapat dimuat."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = window.setTimeout(() => { load(); }, 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
          <Shield size={22} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Izin Akses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Atur izin per pengguna — klik nama untuk expand</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
        <strong>Catatan:</strong> SuperAdmin selalu memiliki semua akses. Pengaturan di bawah berlaku per pengguna secara individual.
      </div>

      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        <p>{error}</p>
        <button type="button" onClick={load} disabled={loading} className="mt-2 font-semibold underline">Coba lagi</button>
      </div>}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Memuat...</div>
      ) : users.length === 0 && !error ? (
        <div className="text-center py-16 text-gray-400">
          <p>Belum ada pengguna selain SuperAdmin.</p>
          <Link href="/admin/users" className="text-blue-600 text-sm mt-2 block">Tambah pengguna →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => <UserPermCard key={u.id} user={u} onSaved={load} />)}
        </div>
      )}
    </div>
  );
}
