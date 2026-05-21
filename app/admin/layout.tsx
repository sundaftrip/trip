import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AdminShell from "@/components/admin/AdminShell";
import AdminProviders from "@/components/admin/AdminProviders";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // Modul Keuangan punya shell sendiri (dark terminal) — lihat
  // app/admin/keuangan/layout.tsx. Lewati AdminShell standar.
  const isKeuangan = pathname.startsWith("/admin/keuangan");
  const isShellless = pathname === "/admin/login" || pathname.endsWith("/print");
  const session = isShellless ? null : await auth();
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
