"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity, Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface LogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  resourceName?: string;
  detail?: string;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  LOGIN:  "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  LOGOUT: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

const RESOURCE_LABELS: Record<string, string> = {
  TOUR: "Tour", RECEIPT: "Receipt", BLOG: "Blog", GEO: "GEO", FAQ: "FAQ Visa", TERMS: "Syarat & Ketentuan",
  TESTIMONIAL: "Testimoni", INQUIRY: "Lead", VISA: "Database Visa", B2B_CATALOG: "Katalog B2B",
  SCRAPER: "Scraper", TEXTS: "Teks Beranda", SETTINGS: "Pengaturan", USER: "Pengguna",
  PERMISSIONS: "Izin Akses", AUTH: "Login",
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Buat", UPDATE: "Ubah", DELETE: "Hapus", LOGIN: "Masuk", LOGOUT: "Keluar",
};

export default function LogsViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterResource, setFilterResource] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [userOptions, setUserOptions] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { id: string; name: string }[]) => setUserOptions(rows.map(({ id, name }) => ({ id, name }))))
      .catch(() => {});
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filterResource) params.set("resource", filterResource);
    if (filterAction) params.set("action", filterAction);
    if (filterUser) params.set("userId", filterUser);
    const res = await fetch(`/api/logs?${params}`);
    const data = await res.json();
    setLogs(data.logs ?? []);
    setTotal(data.total ?? 0);
    setPages(data.pages ?? 1);
    setLoading(false);
  }, [page, filterResource, filterAction, filterUser]);

  useEffect(() => {
    const id = window.setTimeout(() => { fetchLogs(); }, 0);
    return () => window.clearTimeout(id);
  }, [fetchLogs]);

  const handleClean = async () => {
    if (!confirm("Hapus log lebih dari 90 hari?")) return;
    await fetch("/api/logs", { method: "DELETE" });
    fetchLogs();
  };

  const filtered = search
    ? logs.filter((l) =>
        l.userName.toLowerCase().includes(search.toLowerCase()) ||
        l.resourceName?.toLowerCase().includes(search.toLowerCase()) ||
        l.detail?.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <Activity size={22} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Log Aktivitas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{total} total aktivitas tercatat</p>
          </div>
        </div>
        <button onClick={handleClean}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
          <Trash2 size={15} />
          Bersihkan &gt;90 hari
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama / detail..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={filterResource} onChange={(e) => { setFilterResource(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Semua Resource</option>
          {Object.entries(RESOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterAction} onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Semua Aksi</option>
          {Object.entries(ACTION_LABELS).map(([a, label]) => <option key={a} value={a}>{label}</option>)}
        </select>
        <select value={filterUser} onChange={(e) => { setFilterUser(e.target.value); setPage(1); }} aria-label="Filter pengguna"
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Semua Pengguna</option>
          {userOptions.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Belum ada log aktivitas</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Waktu</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengguna</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resource</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">{fmt(log.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900 dark:text-white">{log.userName}</p>
                      <p className="text-xs text-gray-400">{log.userRole}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ACTION_COLORS[log.action] ?? ""}`}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-gray-700 dark:text-gray-300">{RESOURCE_LABELS[log.resource] ?? log.resource}</p>
                      {log.resourceName && <p className="text-xs text-gray-400 max-w-[220px] break-words">{log.resourceName}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-xs min-w-[220px] max-w-md whitespace-normal break-words">
                      {log.detail ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Halaman {page} dari {pages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
