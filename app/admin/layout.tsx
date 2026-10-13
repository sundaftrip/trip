import "flag-icons/css/flag-icons.min.css";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell, { type AdminNavItem } from "@/components/admin/AdminShell";
import AdminProviders from "@/components/admin/AdminProviders";
import { allowedAdminModules, getAdminViewer } from "@/lib/admin-access";
import { adminModuleForPath, canOpenAdminModule } from "@/lib/admin-modules";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // Modul Keuangan punya shell sendiri (dark terminal) — lihat
  // app/admin/keuangan/layout.tsx. Lewati AdminShell standar.
  const isKeuangan = pathname.startsWith("/admin/keuangan");
  // Halaman auth publik (boleh tanpa login) — jaga selaras dengan
  // daftar isPublicAuthPage di proxy.ts.
  const isPublicAuthPage = pathname === "/admin/login";
  // Halaman tanpa shell: login dan halaman cetak.
  const isShellless = isPublicAuthPage || pathname.endsWith("/print");

  if (isPublicAuthPage) {
    return <AdminProviders>{children}</AdminProviders>;
  }

  // Defense-in-depth: proxy.ts sudah redirect berdasarkan cookie, tapi layout
  // tetap memverifikasi sesi sungguhan untuk SEMUA path /admin (termasuk
  // halaman cetak & keuangan). Tiap halaman juga memanggil requireAdminModule
  // karena layout tidak dirender ulang saat navigasi di dalam CMS.
  const viewer = await getAdminViewer();
  if (!viewer) redirect("/admin/login");

  const currentModule = adminModuleForPath(pathname);
  if (currentModule && !canOpenAdminModule(currentModule, viewer)) redirect("/admin?akses=ditolak");

  if (isShellless || isKeuangan) {
    return <AdminProviders>{children}</AdminProviders>;
  }

  const logoRow = await prisma.companyInfo.findFirst({ where: { key: "company_logo" } });
  const logo = logoRow?.value || "";
  const navItems: AdminNavItem[] = allowedAdminModules(viewer)
    .filter((module) => !module.hiddenInNav)
    .map(({ key, href, label, group }) => ({ key, href, label, group }));

  return (
    <AdminProviders>
      <AdminShell
        user={{ name: viewer.name, email: viewer.email, accessLabel: viewer.accessLabel }}
        navItems={navItems}
        logo={logo}
      >
        {children}
      </AdminShell>
    </AdminProviders>
  );
}
