import { prisma } from "@/lib/prisma";

export const PERMISSION_LABELS: Record<string, { label: string; section: string }> = {
  tour_create:    { label: "Buat Tour",            section: "Tour" },
  tour_edit:      { label: "Edit Tour",             section: "Tour" },
  tour_delete:    { label: "Hapus Tour",            section: "Tour" },
  tour_status:    { label: "Ubah Status Tour",      section: "Tour" },
  receipt_view:   { label: "Lihat Receipt",         section: "Receipt" },
  receipt_create: { label: "Buat Receipt",          section: "Receipt" },
  receipt_edit:   { label: "Edit Receipt",          section: "Receipt" },
  receipt_delete: { label: "Hapus Receipt",         section: "Receipt" },
  blog_create:    { label: "Buat Post Blog",        section: "Blog" },
  blog_edit:      { label: "Edit Post Blog",        section: "Blog" },
  blog_delete:    { label: "Hapus Post Blog",       section: "Blog" },
  blog_publish:   { label: "Publish/Unpublish Blog",section: "Blog" },
  text_edit:      { label: "Edit Teks Website",     section: "Konten" },
  color_edit:     { label: "Edit Warna & Tema",     section: "Konten" },
  company_edit:   { label: "Edit Info Perusahaan",  section: "Konten" },
};

export const ALL_PERMISSION_KEYS = Object.keys(PERMISSION_LABELS);

export const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  ADMIN: {
    tour_create: true,  tour_edit: true,  tour_delete: true,  tour_status: true,
    receipt_view: true, receipt_create: true, receipt_edit: true, receipt_delete: true,
    blog_create: true,  blog_edit: true,  blog_delete: true,  blog_publish: true,
    text_edit: true,    color_edit: true, company_edit: true,
  },
  EDITOR: {
    tour_create: false, tour_edit: true,  tour_delete: false, tour_status: false,
    receipt_view: true, receipt_create: true, receipt_edit: true, receipt_delete: false,
    blog_create: true,  blog_edit: true,  blog_delete: false, blog_publish: false,
    text_edit: true,    color_edit: false, company_edit: false,
  },
};

export async function getRolePermissions(role: string): Promise<Record<string, boolean>> {
  if (role === "SUPERADMIN") {
    return Object.fromEntries(ALL_PERMISSION_KEYS.map((k) => [k, true]));
  }
  const row = await prisma.rolePermission.findUnique({ where: { role } });
  if (row) return row.permissions as Record<string, boolean>;
  return DEFAULT_PERMISSIONS[role] ?? {};
}

export async function checkPermission(
  session: { user: { role: string } } | null,
  key: string
): Promise<boolean> {
  if (!session) return false;
  if (session.user.role === "SUPERADMIN") return true;
  const perms = await getRolePermissions(session.user.role);
  return perms[key] === true;
}
