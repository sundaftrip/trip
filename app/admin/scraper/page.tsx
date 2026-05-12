import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";
import ScraperTool from "@/components/admin/ScraperTool";

export const metadata = { title: "Scraper Konten — Sundaftrip Admin" };

export default async function ScraperPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const canView = await checkPermission(session, "scraper_view");
  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
      </div>
    );
  }

  return <ScraperTool />;
}
