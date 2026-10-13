import Link from "next/link";
import { AlertTriangle, CalendarClock, CircleHelp, Eye, FilePen, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { allowedAdminModules, can, canOpenModule, requireAdminModule } from "@/lib/admin-access";
import { adminTourVisibility, needsCatalogAttention } from "@/lib/admin-tour-checks";
import { formatDate } from "@/lib/utils";

type DashboardSearchParams = { akses?: string | string[] };

const ACTION_LABELS: Record<string, string> = {
  CREATE: "membuat",
  UPDATE: "mengubah",
  DELETE: "menghapus",
  LOGIN: "masuk ke CMS",
  LOGOUT: "keluar dari CMS",
};

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<DashboardSearchParams> }) {
  const viewer = await requireAdminModule("dashboard");
  const sp = await searchParams;
  const accessDenied = (Array.isArray(sp.akses) ? sp.akses[0] : sp.akses) === "ditolak";
  const showCatalog = canOpenModule(viewer, "tours");
  const isSuperadmin = viewer.role === "SUPERADMIN";

  const [tours, recentLogs] = await Promise.all([
    showCatalog
      ? prisma.tour.findMany({
          select: {
            id: true, title: true, slug: true, country: true, status: true, price: true, seatsLeft: true,
            tripDate: true, heroImg: true, description: true, itinerary: true, hotel: true, updatedAt: true,
          },
          orderBy: { updatedAt: "desc" },
        })
      : Promise.resolve([]),
    isSuperadmin
      ? prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 })
      : Promise.resolve([]),
  ]);

  const now = new Date();
  const today = startOfToday();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const liveTours = tours.filter((tour) => {
    const visibility = adminTourVisibility(tour, now);
    return visibility.visible && visibility.tone !== "past";
  });
  const drafts = tours.filter((tour) => tour.status === "DRAFT");
  const upcoming = liveTours
    .filter((tour) => tour.tripDate && tour.tripDate >= today && tour.tripDate <= in30Days && tour.status !== "FULL")
    .sort((a, b) => (a.tripDate?.getTime() ?? 0) - (b.tripDate?.getTime() ?? 0));
  const attention = tours
    .map((tour) => ({ tour, issues: needsCatalogAttention(tour, now) }))
    .filter((entry) => entry.issues.length > 0);
  const otherModules = allowedAdminModules(viewer).filter((module) => !["dashboard", "guide"].includes(module.key) && !module.hiddenInNav);

  const stats = [
    { label: "Tampil di website", value: liveTours.length, href: "/admin/tours?tampil=ya", icon: Eye },
    { label: "Draft", value: drafts.length, href: "/admin/tours?status=DRAFT", icon: FilePen },
    { label: "Berangkat ≤ 30 hari", value: upcoming.length, href: "/admin/tours?sort=date&dir=asc", icon: CalendarClock },
    { label: "Perlu dilengkapi", value: attention.length, href: "#perlu-dilengkapi", icon: AlertTriangle },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Halo, {viewer.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Akses: {viewer.accessLabel}</p>
        </div>
        {showCatalog && (
          <div className="flex flex-wrap gap-2">
            <a href="/tours" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
              <Eye size={16} /> Lihat katalog
            </a>
            {can(viewer, "tour_create") && (
              <Link href="/admin/tours/new"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                <Plus size={16} /> Tambah tour
              </Link>
            )}
          </div>
        )}
      </div>

      {accessDenied && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          Akun Anda tidak punya akses ke halaman itu. Minta Super Admin menambah izin di menu Izin Akses bila memang diperlukan.
        </div>
      )}

      {showCatalog && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat) => (
              <Link key={stat.label} href={stat.href}
                className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800">
                <stat.icon size={18} className="mb-2 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </Link>
            ))}
          </div>

          <section id="perlu-dilengkapi" className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Perlu dilengkapi</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tour yang sedang tampil di website tetapi datanya belum lengkap.</p>
            {attention.length === 0 ? (
              <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">Semua tour yang tampil sudah lengkap.</p>
            ) : (
              <ul className="mt-4 divide-y divide-gray-100 dark:divide-gray-700">
                {attention.slice(0, 10).map(({ tour, issues }) => (
                  <li key={tour.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{tour.title}</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400">{issues.join(" · ")}</p>
                    </div>
                    <Link href={`/admin/tours/${tour.id}`} className="shrink-0 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                      Lengkapi
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Keberangkatan 30 hari ke depan</h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Belum ada keberangkatan dalam 30 hari.</p>
            ) : (
              <ul className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
                {upcoming.slice(0, 8).map((tour) => (
                  <li key={tour.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <Link href={`/admin/tours/${tour.id}`} className="min-w-0 truncate font-medium text-gray-900 hover:text-blue-600 dark:text-white">
                      {tour.title}
                    </Link>
                    <span className="shrink-0 text-gray-500 dark:text-gray-400">
                      {tour.tripDate ? formatDate(tour.tripDate) : "-"} · sisa {tour.seatsLeft} kursi
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {!showCatalog && otherModules.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Menu Anda</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {otherModules.map((module) => (
              <Link key={module.key} href={module.href}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-blue-300 hover:text-blue-700 dark:border-gray-600 dark:text-gray-200">
                {module.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {isSuperadmin && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Aktivitas terbaru</h2>
            <Link href="/admin/logs" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">Semua log</Link>
          </div>
          {recentLogs.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Belum ada aktivitas.</p>
          ) : (
            <ul className="mt-3 divide-y divide-gray-100 text-sm dark:divide-gray-700">
              {recentLogs.map((log) => (
                <li key={log.id} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <span className="min-w-0 text-gray-700 dark:text-gray-300">
                    <strong className="font-medium text-gray-900 dark:text-white">{log.userName}</strong>{" "}
                    {ACTION_LABELS[log.action] ?? log.action.toLowerCase()} {log.resourceName ?? ""}
                    {log.detail ? <span className="text-gray-500 dark:text-gray-400"> · {log.detail}</span> : null}
                  </span>
                  <span className="shrink-0 text-xs text-gray-400">
                    {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(log.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <Link href="/admin/panduan"
        className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 transition hover:border-blue-300 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-300">
        <CircleHelp size={18} aria-hidden="true" />
        Baru di CMS? Buka panduan singkat cara memperbarui katalog.
      </Link>
    </div>
  );
}
