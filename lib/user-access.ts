/* Pilihan "jenis akses" di halaman Pengguna: role biasa atau paket izin. Aman untuk client. */
import { ACCESS_PRESETS, ROLE_LABELS, detectAccessPreset, type AccessPresetKey } from "@/lib/permission-keys";
import { ADMIN_ROLES, type AdminRole } from "@/lib/viewer-access";

export type UserAccessOption = AdminRole | AccessPresetKey;

export const USER_ACCESS_OPTIONS: { value: UserAccessOption; label: string; description: string }[] = [
  { value: "catalog", label: ACCESS_PRESETS.catalog.label, description: ACCESS_PRESETS.catalog.description },
  { value: "EDITOR", label: ROLE_LABELS.EDITOR, description: "Konten (blog, GEO, teks), receipt, lead, edit tour tanpa ubah status." },
  { value: "ADMIN", label: ROLE_LABELS.ADMIN, description: "Semua modul kecuali Pengguna, Izin Akses, Log, dan Pengaturan." },
  { value: "SUPERADMIN", label: ROLE_LABELS.SUPERADMIN, description: "Semua akses, termasuk mengatur pengguna." },
  { value: "VIEWER", label: ROLE_LABELS.VIEWER, description: "Hanya melihat isi CMS, tidak bisa mengubah apa pun." },
];

export function isUserAccessOption(value: unknown): value is UserAccessOption {
  return typeof value === "string" && USER_ACCESS_OPTIONS.some((option) => option.value === value);
}

export function userAccessOf(role: string, permissions: unknown): UserAccessOption {
  const preset = detectAccessPreset(role, permissions);
  if (preset) return preset;
  return (ADMIN_ROLES as readonly string[]).includes(role) ? role as AdminRole : "VIEWER";
}

/**
 * Role + izin tersimpan untuk sebuah pilihan akses. Objek kosong berarti
 * "pakai bawaan role" (tidak ada izin yang ditimpa).
 */
export function accessToUserFields(access: UserAccessOption): { role: AdminRole; permissions: Record<string, boolean> } {
  if (access === "catalog") return { role: ACCESS_PRESETS.catalog.role, permissions: { ...ACCESS_PRESETS.catalog.permissions } };
  return { role: access, permissions: {} };
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}
