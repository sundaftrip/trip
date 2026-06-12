import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminProviders from "@/components/admin/AdminProviders";
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

  // Defense-in-depth: proxy.ts sudah redirect berdasarkan cookie, tapi layout
  // tetap memverifikasi sesi sungguhan untuk SEMUA path /admin (termasuk
  // halaman cetak & keuangan) — kecuali halaman auth publik di atas, supaya
  // tidak terjadi redirect loop di /admin/login.
  const session = isPublicAuthPage ? null : await auth();
  if (!isPublicAuthPage && !session) redirect("/admin/login");

  const showShell = !isShellless && !isKeuangan && !!session;

  if (!showShell) {
    return <AdminProviders>{children}</AdminProviders>;
  }

  const logoRow = await prisma.companyInfo.findFirst({ where: { key: "company_logo" } });
  const logo = logoRow?.value || "";

  return (
    <AdminProviders>
      <AdminShell role={session!.user.role} user={session!.user} logo={logo}>
        {children}
      </AdminShell>
    </AdminProviders>
  );
}
