"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import { readApiError, sendJson } from "@/lib/admin-fetch";
import { USER_ACCESS_OPTIONS, type UserAccessOption } from "@/lib/user-access";

type User = { id: string; name: string; email: string; role: string; access: UserAccessOption; createdAt: string };
type Form = { name: string; email: string; access: UserAccessOption; password: string };
const EMPTY: Form = { name: "", email: "", access: "catalog", password: "" };

const ACCESS_COLORS: Record<string, string> = {
  SUPERADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  ADMIN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  catalog: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  EDITOR: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  VIEWER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function accessLabel(access: UserAccessOption) {
  return USER_ACCESS_OPTIONS.find((option) => option.value === access)?.label ?? access;
}

export default function UsersManager({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");

  async function load() {
    const r = await fetch("/api/users");
    if (r.ok) {
      setUsers(await r.json());
      setListError("");
    } else {
      setListError(await readApiError(r, "Daftar pengguna gagal dimuat."));
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => { load(); }, 0);
    return () => window.clearTimeout(id);
  }, []);

  function openAdd() { setForm(EMPTY); setEditing(null); setError(""); setShowPw(false); setModal("add"); }
  function openEdit(u: User) {
    setForm({ name: u.name, email: u.email, access: u.access, password: "" });
    setEditing(u);
    setError("");
    setShowPw(false);
    setModal("edit");
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) return setError("Nama dan email wajib diisi.");
    if (modal === "add" && form.password.length < 8) return setError("Password minimal 8 karakter.");
    setSaving(true);
    setError("");
    const failure = modal === "add"
      ? await sendJson("/api/users", "POST", form)
      : await sendJson(`/api/users/${editing!.id}`, "PATCH", {
          name: form.name,
          email: form.email,
          ...(form.password ? { password: form.password } : {}),
          // Akses hanya dikirim bila berubah, supaya izin kustom tidak tertimpa.
          ...(form.access !== editing!.access ? { access: form.access } : {}),
        });
    setSaving(false);
    if (failure) { setError(failure); return; }
    setModal(null);
    load();
  }

  async function handleDelete(u: User) {
    if (!confirm(`Hapus pengguna "${u.name}"? Akun ini tidak bisa masuk lagi.`)) return;
    const failure = await sendJson(`/api/users/${u.id}`, "DELETE", undefined, "Gagal menghapus pengguna.");
    if (failure) { setListError(failure); return; }
    load();
  }

  const accessChanged = modal === "edit" && editing && form.access !== editing.access;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengguna</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{users.length} akun · izin detail per akun ada di <Link href="/admin/permissions" className="text-blue-600 hover:underline dark:text-blue-400">Izin Akses</Link></p>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
          <Plus size={16} /> Tambah Pengguna
        </button>
      </div>

      {listError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">{listError}</div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {users.length === 0 && <li className="py-12 text-center text-sm text-gray-400">Tidak ada pengguna</li>}
          {users.map((u) => (
            <li key={u.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">
                  {u.name}{u.id === currentUserId && <span className="ml-2 text-xs font-normal text-gray-400">(Anda)</span>}
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${ACCESS_COLORS[u.access] ?? ACCESS_COLORS.EDITOR}`}>
                  {accessLabel(u.access)}
                </span>
                <button onClick={() => openEdit(u)} aria-label={`Edit ${u.name}`}
                  className="rounded p-1.5 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20">
                  <Pencil size={15} />
                </button>
                {u.id !== currentUserId && (
                  <button onClick={() => handleDelete(u)} aria-label={`Hapus ${u.name}`}
                    className="rounded p-1.5 text-gray-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="user-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                {modal === "add" ? "Tambah Pengguna" : "Edit Pengguna"}
              </h2>
              <button onClick={() => setModal(null)} aria-label="Tutup" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="user-name">Nama</label>
                <input id="user-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap" />
              </div>
              <div>
                <label className="label" htmlFor="user-email">Email</label>
                <input id="user-email" className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" />
              </div>
              <fieldset disabled={modal === "edit" && editing?.id === currentUserId}>
                <legend className="label mb-2">Jenis akses</legend>
                <div className="space-y-2">
                  {USER_ACCESS_OPTIONS.map((option) => (
                    <label key={option.value}
                      className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm ${
                        form.access === option.value ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700"
                      }`}>
                      <input type="radio" name="user-access" value={option.value} checked={form.access === option.value}
                        onChange={() => setForm({ ...form, access: option.value })} className="mt-0.5" />
                      <span>
                        <span className="block font-medium text-gray-900 dark:text-white">{option.label}</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
                {accessChanged && (
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                    Mengganti jenis akses mengembalikan izin akun ini ke bawaan jenis tersebut dan membuatnya keluar dari CMS.
                  </p>
                )}
              </fieldset>
              <div>
                <label className="label" htmlFor="user-password">{modal === "add" ? "Password" : "Password baru (kosongkan jika tidak diubah)"}</label>
                <div className="relative">
                  <input
                    id="user-password"
                    className="input pr-10"
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    name="new-cms-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(null)} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  Batal
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 disabled:opacity-60">
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
