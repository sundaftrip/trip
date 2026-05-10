import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/Header";
import AdminProviders from "@/components/admin/AdminProviders";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // Login page and print pages don't need the shell
  const isShellless = pathname === "/admin/login" || pathname.endsWith("/print");

  // Auth is enforced by proxy — layout just decides whether to show the shell
  const session = isShellless ? null : await auth();
  const showShell = !isShellless && !!session;

  if (!showShell) {
    return <AdminProviders>{children}</AdminProviders>;
  }

  return (
    <AdminProviders>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <AdminSidebar role={session!.user.role} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader user={session!.user} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AdminProviders>
  );
}
