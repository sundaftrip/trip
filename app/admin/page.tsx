import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "@/components/admin/AdminWorkspace.module.css";

async function getStats() {
  const [tours, blogs, receipts, users] = await Promise.all([
    prisma.tour.count(),
    prisma.blog.count(),
    prisma.receipt.count(),
    prisma.user.count(),
  ]);
  return { tours, blogs, receipts, users };
}

async function getRecentTours() {
  return prisma.tour.findMany({ take: 5, orderBy: { createdAt: "desc" } });
}

export default async function AdminDashboard() {
  const [stats, recentTours] = await Promise.all([getStats(), getRecentTours()]);

  const cards = [
    { label: "Total tour", value: stats.tours },
    { label: "Artikel blog", value: stats.blogs },
    { label: "Receipt", value: stats.receipts },
    { label: "Admin", value: stats.users },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p>Ringkasan konten dan aktivitas katalog.</p>
        </div>
        <Link href="/admin/tours/new" className={styles.primaryButton}>Tambah tour</Link>
      </div>

      <dl className={styles.metrics}>
        {cards.map((card) => (
          <div key={card.label}>
            <dt>{card.label}</dt>
            <dd>{card.value}</dd>
          </div>
        ))}
      </dl>

      <section className={styles.section} aria-labelledby="recent-tours-title">
        <div className={styles.sectionHeader}>
          <h2 id="recent-tours-title">Tour terbaru</h2>
          <Link href="/admin/tours" className={styles.textLink}>Semua tour</Link>
        </div>
        <div>
          {recentTours.length === 0 && (
            <p className="text-gray-400 text-sm">Belum ada tour. <Link href="/admin/tours/new" className="text-blue-600">Tambah sekarang →</Link></p>
          )}
          {recentTours.map((tour) => (
            <div key={tour.id} className={styles.recentRow}>
              <div>
                <Link href={`/admin/tours/${tour.id}`}>{tour.title}</Link>
                <p>{tour.country}</p>
              </div>
              <span className={`shrink-0 text-xs px-2 py-1 rounded font-medium ${
                tour.status === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                tour.status === "FULL" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}>
                {tour.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
