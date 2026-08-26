"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Flag, Lock, LockOpen, MessageSquareReply } from "lucide-react";

type VisaDiscussionAdminItem = {
  id: string;
  parentId: string | null;
  authorName: string;
  countryName: string | null;
  topic: string | null;
  caseContext: string | null;
  title: string | null;
  message: string;
  sourceUrl: string | null;
  status: string;
  isAdminReply: boolean;
  isLocked: boolean;
  reportCount: number;
  reports: Array<{
    id: string;
    reason: string;
    details: string | null;
    status: string;
    createdAt: string;
  }>;
  createdAt: string;
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  PUBLISHED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  REJECTED: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const REPORT_REASON_LABEL: Record<string, string> = {
  PERSONAL_DATA: "Data pribadi",
  MISINFORMATION: "Informasi keliru",
  HARASSMENT: "Pelecehan",
  SPAM: "Spam",
  IMPERSONATION: "Penyamaran identitas",
  OTHER: "Lainnya",
};

const REPORT_STATUS_LABEL: Record<string, string> = {
  OPEN: "Terbuka",
  RESOLVED: "Ditangani",
  DISMISSED: "Diabaikan",
};

export default function VisaDiscussionRow({
  item,
  statusLabel,
  canModerate,
}: {
  item: VisaDiscussionAdminItem;
  statusLabel: Record<string, string>;
  canModerate: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(item.status);
  const [isLocked, setIsLocked] = useState(item.isLocked);
  const [reply, setReply] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reports, setReports] = useState(item.reports);
  const [reportBusyId, setReportBusyId] = useState("");
  const [error, setError] = useState("");

  async function request(url: string, init: RequestInit) {
    const response = await fetch(url, init);
    const payload = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) throw new Error(payload.error || "Permintaan gagal.");
  }

  async function changeStatus(next: string) {
    const previous = status;
    setBusy(true);
    setError("");
    setStatus(next);
    try {
      await request(`/api/admin/visa-discussions/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } catch (caught) {
      setStatus(previous);
      setError(caught instanceof Error ? caught.message : "Permintaan gagal.");
    } finally {
      setBusy(false);
    }
  }

  async function sendReply() {
    if (reply.trim().length < 20) return;
    setBusy(true);
    setError("");
    try {
      await request(`/api/admin/visa-discussions/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply.trim(), sourceUrl: sourceUrl.trim() }),
      });
      setReply("");
      setSourceUrl("");
      setShowReply(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Permintaan gagal.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleLock() {
    const next = !isLocked;
    setBusy(true);
    setError("");
    setIsLocked(next);
    try {
      await request(`/api/admin/visa-discussions/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: next }),
      });
      router.refresh();
    } catch (caught) {
      setIsLocked(!next);
      setError(caught instanceof Error ? caught.message : "Permintaan gagal.");
    } finally {
      setBusy(false);
    }
  }

  async function changeReportStatus(reportId: string, nextStatus: "RESOLVED" | "DISMISSED") {
    const previous = reports;
    setReportBusyId(reportId);
    setError("");
    setReports((current) => current.map((report) => (
      report.id === reportId ? { ...report, status: nextStatus } : report
    )));
    try {
      await request(`/api/admin/visa-discussions/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      router.refresh();
    } catch (caught) {
      setReports(previous);
      setError(caught instanceof Error ? caught.message : "Permintaan gagal.");
    } finally {
      setReportBusyId("");
    }
  }

  const date = new Date(item.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <tr className="align-top text-gray-700 dark:text-gray-300">
      <td className="px-4 py-3">
        <div className="font-bold text-gray-900 dark:text-white">{item.authorName}</div>
        <div className="text-xs text-gray-400">
          {item.isAdminReply ? "Tim Sundaf" : "Pengalaman komunitas"}
        </div>
        {item.parentId && <div className="mt-1 text-[10px] text-gray-400">Balasan thread</div>}
      </td>
      <td className="px-4 py-3">
        <div>{item.countryName || "Mengikuti thread"}</div>
        {item.topic && <div className="mt-1 text-xs text-gray-400">{item.topic}</div>}
        {item.caseContext && <div className="text-xs text-gray-400">{item.caseContext}</div>}
        {item.reportCount > 0 && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-600">
            <Flag size={12} /> {item.reportCount} laporan
          </div>
        )}
      </td>
      <td className="max-w-md px-4 py-3">
        {item.title && <p className="mb-1 text-sm font-bold text-gray-900 dark:text-white">{item.title}</p>}
        <p className="whitespace-pre-wrap break-words text-xs">{item.message}</p>
        {item.sourceUrl && (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            Buka rujukan <ExternalLink size={12} />
          </a>
        )}
        {reports.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-red-100 pt-3 dark:border-red-950">
            {reports.map((report) => {
              const reportDate = new Date(report.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              return (
                <div key={report.id} className="rounded-lg bg-red-50 p-2.5 text-xs dark:bg-red-950/30">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-red-800 dark:text-red-300">
                    <Flag size={12} />
                    <span>{REPORT_REASON_LABEL[report.reason] || report.reason}</span>
                    <span aria-hidden="true">·</span>
                    <span>{reportDate}</span>
                    <span className="rounded-full bg-white/80 px-2 py-0.5 dark:bg-black/20">
                      {REPORT_STATUS_LABEL[report.status] || report.status}
                    </span>
                  </div>
                  {report.details && (
                    <p className="mt-1.5 whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300">
                      {report.details}
                    </p>
                  )}
                  {canModerate && report.status === "OPEN" && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={Boolean(reportBusyId)}
                        onClick={() => changeReportStatus(report.id, "RESOLVED")}
                        className="rounded-md bg-red-700 px-2 py-1 font-bold text-white disabled:opacity-50"
                      >
                        Tandai ditangani
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(reportBusyId)}
                        onClick={() => changeReportStatus(report.id, "DISMISSED")}
                        className="rounded-md bg-white px-2 py-1 font-bold text-gray-600 disabled:opacity-50 dark:bg-gray-900 dark:text-gray-300"
                      >
                        Abaikan laporan
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {item.reportCount > reports.length && (
              <p className="text-[11px] text-gray-500">
                Menampilkan {reports.length} dari {item.reportCount} laporan terbaru.
              </p>
            )}
          </div>
        )}
        {error && <p className="mt-2 text-xs font-semibold text-red-600" role="alert">{error}</p>}
        {showReply && (
          <div className="mt-3 space-y-2">
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-900"
              rows={4}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Jawaban Sundaf; jangan menyebutnya keputusan resmi"
            />
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-900"
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              placeholder="https://... (opsional)"
              type="url"
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy || reply.trim().length < 20}
                onClick={sendReply}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
              >
                Terbitkan jawaban Sundaf
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowReply(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{date}</td>
      <td className="px-4 py-3">
        <select
          aria-label={`Status kiriman ${item.authorName}`}
          value={status}
          disabled={busy || !canModerate}
          onChange={(event) => changeStatus(event.target.value)}
          className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status] ?? ""}`}
        >
          {Object.entries(statusLabel).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          {!item.parentId && status === "PUBLISHED" && canModerate && !isLocked && (
            <button
              type="button"
              disabled={busy}
              onClick={() => setShowReply((value) => !value)}
              className="p-1 text-gray-400 transition hover:text-blue-600 disabled:opacity-40"
              title="Balas sebagai Tim Sundaf"
              aria-label="Balas sebagai Tim Sundaf"
            >
              <MessageSquareReply size={16} />
            </button>
          )}
          {!item.parentId && canModerate && (
            <button
              type="button"
              disabled={busy}
              onClick={toggleLock}
              className="p-1 text-gray-400 transition hover:text-amber-600 disabled:opacity-40"
              title={isLocked ? "Buka kembali diskusi" : "Tutup balasan baru"}
              aria-label={isLocked ? "Buka kembali diskusi" : "Tutup balasan baru"}
            >
              {isLocked ? <LockOpen size={16} /> : <Lock size={16} />}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
