"use client";

import { useEffect, useState } from "react";
import { Shield, Save, RotateCcw } from "lucide-react";
import { ALL_PERMISSION_KEYS, DEFAULT_PERMISSIONS, PERMISSION_LABELS } from "@/lib/permissions";

const SECTIONS = ["Tour", "Receipt", "Blog", "Konten"];
const ROLES = ["ADMIN", "EDITOR"];

type PermMap = Record<string, Record<string, boolean>>;

export default function PermissionsPage() {
  const [perms, setPerms] = useState<PermMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/permissions")
      .then((r) => r.json())
      .then((data: PermMap) => {
        const merged: PermMap = {};
        ROLES.forEach((role) => {
          merged[role] = { ...DEFAULT_PERMISSIONS[role], ...(data[role] ?? {}) };
        });
        setPerms(merged);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = (role: string, key: string) => {
    setPerms((prev) => ({
      ...prev,
      [role]: { ...prev[role], [key]: !prev[role]?.[key] },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/permissions", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(perms) });
    setSaving(false);
    setSaved(true);
  };

  const handleReset = (role: string) => {
    setPerms((prev) => ({ ...prev, [role]: { ...DEFAULT_PERMISSIONS[role] } }));
    setSaved(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Memuat...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <Shield size={22} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Izin Akses</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Atur hak akses untuk setiap role</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition">
          <Save size={16} />
          {saving ? "Menyimpan..." : saved ? "Tersimpan ✓" : "Simpan Perubahan"}
        </button>
      </div>

      {/* Note for SUPERADMIN */}
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
        <strong>Catatan:</strong> SuperAdmin selalu memiliki semua izin dan tidak dapat dibatasi. Pengaturan di bawah hanya berlaku untuk role <strong>Admin</strong> dan <strong>Editor</strong>.
      </div>

      {SECTIONS.map((section) => {
        const sectionKeys = ALL_PERMISSION_KEYS.filter((k) => PERMISSION_LABELS[k]?.section === section);
        return (
          <div key={section} className="mb-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-white">{section}</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {/* Header */}
              <div className="grid grid-cols-3 px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <span>Izin</span>
                {ROLES.map((r) => (
                  <div key={r} className="flex items-center justify-center gap-2">
                    <span>{r}</span>
                    <button onClick={() => handleReset(r)} title="Reset ke default"
                      className="p-0.5 text-gray-300 hover:text-gray-500 transition">
                      <RotateCcw size={11} />
                    </button>
                  </div>
                ))}
              </div>
              {sectionKeys.map((key) => (
                <div key={key} className="grid grid-cols-3 px-6 py-3.5 items-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{PERMISSION_LABELS[key]?.label}</span>
                  {ROLES.map((role) => (
                    <div key={role} className="flex justify-center">
                      <button
                        onClick={() => toggle(role, key)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                          perms[role]?.[key] ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                        }`}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                          perms[role]?.[key] ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
