"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Flame,
  Inbox,
  MessageCircle,
  RefreshCw,
  TimerReset,
} from "lucide-react";
import type { AiOpsRecommendation } from "@/lib/ai-ops";

type OpsStats = {
  total: number;
  newLeads: number;
  hot: number;
  stale: number;
  contacted: number;
};

type TourSnapshot = {
  id: string;
  title: string;
  href: string;
  tripDateLabel: string;
  priceLabel: string;
  seatsLabel: string;
};

type Props = {
  recommendations: AiOpsRecommendation[];
  stats: OpsStats;
  tours: TourSnapshot[];
  unpaidReceiptCount: number;
};

const priorityLabel: Record<AiOpsRecommendation["priority"], string> = {
  hot: "Hot",
  warm: "Warm",
  normal: "Normal",
  stale: "Telat follow-up",
};

const priorityClass: Record<AiOpsRecommendation["priority"], string> = {
  hot: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
  warm: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  normal: "border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200",
  stale: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300",
};

const statusLabel: Record<string, string> = {
  NEW: "Baru",
  CONTACTED: "Dihubungi",
  CLOSED: "Selesai",
};

function statCards(stats: OpsStats, unpaidReceiptCount: number) {
  return [
    { label: "Lead total", value: stats.total, hint: "Dari form konsultasi", Icon: Inbox },
    { label: "Belum dibalas", value: stats.newLeads, hint: "Perlu first response", Icon: MessageCircle },
    { label: "Prioritas hot", value: stats.hot, hint: "Ada sinyal booking", Icon: Flame },
    { label: "Receipt unpaid", value: unpaidReceiptCount, hint: "Perlu cek finance", Icon: TimerReset },
  ];
}

export default function AiOpsDesk({ recommendations, stats, tours, unpaidReceiptCount }: Props) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const cards = useMemo(() => statCards(stats, unpaidReceiptCount), [stats, unpaidReceiptCount]);

  async function copyDraft(item: AiOpsRecommendation) {
    await navigator.clipboard.writeText(item.replyDraft);
    setCopiedId(item.inquiryId);
    window.setTimeout(() => setCopiedId((current) => current === item.inquiryId ? null : current), 1600);
  }

  async function setStatus(item: AiOpsRecommendation, status: "CONTACTED" | "CLOSED") {
    setBusyId(item.inquiryId);
    try {
      await fetch(`/api/inquiries/${item.inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      startTransition(() => router.refresh());
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-700 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-300">
            <Bot size={14} />
            Sundaf AI Ops Desk
          </div>
          <h1 className="mt-3 text-2xl font-black text-gray-950 dark:text-white">Mesin kerja lead, follow-up, dan booking</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Ini membaca lead asli dari form Sundaf, memilih prioritas, mencocokkan paket, lalu menyiapkan draft WhatsApp dan next action untuk admin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/wa-prototype"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700"
          >
            Prototype WA
            <MessageCircle size={15} />
          </Link>
          <Link
            href="/admin/inquiries"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            Lead Masuk
            <ExternalLink size={15} />
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, hint, Icon }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
                <p className="mt-2 text-3xl font-black text-gray-950 dark:text-white">{value}</p>
                <p className="mt-1 text-xs text-gray-500">{hint}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                <Icon size={19} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-gray-950 dark:text-white">Agent Queue</h2>
              <p className="text-sm text-gray-500">Urutan kerja dari lead paling penting.</p>
            </div>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <RefreshCw size={15} className={isPending ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {recommendations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center text-gray-400 dark:border-gray-700 dark:bg-gray-800">
              <Bot size={38} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Belum ada lead yang bisa diproses AI Ops.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((item) => (
                <article key={item.inquiryId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-black text-gray-950 dark:text-white">{item.customerName}</h3>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${priorityClass[item.priority]}`}>
                          {priorityLabel[item.priority]}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                          {statusLabel[item.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{item.profileLine}</p>
                      <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-gray-200">{item.nextAction}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => copyDraft(item)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <Clipboard size={14} />
                        {copiedId === item.inquiryId ? "Tersalin" : "Copy"}
                      </button>
                      {item.whatsappUrl && (
                        <a
                          href={item.whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700"
                        >
                          <MessageCircle size={14} />
                          WhatsApp
                        </a>
                      )}
                      {item.status !== "CONTACTED" && (
                        <button
                          type="button"
                          disabled={busyId === item.inquiryId}
                          onClick={() => setStatus(item, "CONTACTED")}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-700 disabled:opacity-50"
                        >
                          <CheckCircle2 size={14} />
                          Tandai dibalas
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Draft balasan</p>
                      <textarea
                        readOnly
                        value={item.replyDraft}
                        className="min-h-44 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed text-gray-800 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Paket cocok</p>
                      <div className="space-y-2">
                        {item.matchedTours.length === 0 ? (
                          <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900">
                            Belum ada paket yang match kuat. Arahkan ke custom trip.
                          </p>
                        ) : item.matchedTours.map((tour) => (
                          <Link
                            key={tour.id}
                            href={tour.href}
                            target="_blank"
                            className="block rounded-lg border border-gray-200 p-3 text-xs transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
                          >
                            <p className="font-bold text-gray-900 dark:text-white">{tour.title}</p>
                            <p className="mt-1 text-gray-500">{tour.tripDateLabel} - {tour.priceLabel}</p>
                            <p className="mt-1 text-cyan-700 dark:text-cyan-300">{tour.seatsLabel}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-sm font-black text-gray-950 dark:text-white">Active Tour Feed</h2>
            <p className="mt-1 text-xs text-gray-500">Paket yang dipakai agent untuk mencocokkan lead.</p>
            <div className="mt-4 space-y-3">
              {tours.length === 0 ? (
                <p className="text-sm text-gray-400">Tidak ada tour aktif.</p>
              ) : tours.map((tour) => (
                <Link key={tour.id} href={tour.href} target="_blank" className="block rounded-lg border border-gray-200 p-3 text-xs transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900">
                  <p className="font-bold text-gray-900 dark:text-white">{tour.title}</p>
                  <p className="mt-1 text-gray-500">{tour.tripDateLabel} - {tour.priceLabel}</p>
                  <p className="mt-1 text-cyan-700 dark:text-cyan-300">{tour.seatsLabel}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
            <h2 className="font-black">Batas v1</h2>
            <p className="mt-2 leading-relaxed">
              Ini belum mengambil chat dari WhatsApp Business API atau Instagram DM. Token Meta dan webhook perlu disambungkan supaya semua channel masuk otomatis.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
