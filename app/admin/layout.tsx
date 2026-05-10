import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AdminShell from "@/components/admin/AdminShell";
import AdminProviders from "@/components/admin/AdminProviders";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  const isShellless = pathname === "/admin/login" || pathname.endsWith("/print");
  const session = isShellless ? null : await auth();
  const showShell = !isShellless && !!session;

  if (!showShell) {
    return <AdminProviders>{children}</AdminProviders>;
  }

  return (
    <AdminProviders>
      <AdminShell role={session!.user.role} user={session!.user}>
        {children}
      </AdminShell>
    </AdminProviders>
  );
}
