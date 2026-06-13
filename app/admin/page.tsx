import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Map, BookOpen, Receipt, Users } from "lucide-react";

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
    { label: "Total Tour", value: stats.tours, icon: Map, color: "blue" },
    { label: "Artikel Blog", value: stats.blogs, icon: BookOpen, color: "green" },
    { label: "Receipt", value: stats.receipts, icon: Receipt, color: "orange" },
    { label: "Admin", value: stats.users, icon: Users, color: "purple" },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Selamat datang di Admin CMS</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[card.color]}`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Tour Terbaru</h2>
        <div className="space-y-3">
          {recentTours.length === 0 && (
            <p className="text-gray-400 text-sm">Belum ada tour. <Link href="/admin/tours/new" className="text-blue-600">Tambah sekarang →</Link></p>
          )}
          {recentTours.map((tour) => (
            <div key={tour.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{tour.title}</p>
                <p className="text-xs text-gray-500">{tour.country}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                tour.status === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                tour.status === "FULL" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}>
                {tour.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
