"use client";

import { useState } from "react";
import { fmtDate, rupiah } from "@/lib/keuangan/format";
import { ApproveExpenseButton, RejectExpenseButton } from "@/components/keuangan/forms";

export type ExpenseRow = {
  id: string;
  tourCode: string;
  tourTitle: string;
  date: Date | string;
  category: string;
  amount: number;
  photoUrl: string;
  note: string | null;
  submittedBy: string;
  status: string;
};

const FILTERS = [
  { key: "PENDING", label: "MENUNGGU" },
  { key: "APPROVED", label: "DISETUJUI" },
  { key: "REJECTED", label: "DITOLAK" },
  { key: "ALL", label: "SEMUA" },
] as const;

const TONE: Record<string, string> = {
  PENDING: "keu-pill-warn",
  APPROVED: "keu-pill-ok",
  REJECTED: "keu-pill-red",
};

export default function ExpenseQueue({ rows }: { rows: ExpenseRow[] }) {
  const [filter, setFilter] = useState<string>("PENDING");
  const shown = rows.filter((r) => filter === "ALL" || r.status === filter);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {FILTERS.map((f) => {
          const n = f.key === "ALL" ? rows.length : rows.filter((r) => r.status === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`keu-btn ${filter === f.key ? "keu-btn-primary" : "keu-btn-ghost"}`}
              style={{ padding: "6px 12px", fontSize: 10 }}
            >
              {f.label} · {n}
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <div className="keu-empty">TIDAK ADA PENGELUARAN PADA FILTER INI</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="keu-table">
            <thead>
              <tr>
                <th>Bukti</th>
                <th>Pengeluaran</th>
                <th>Trip</th>
                <th>TL</th>
                <th className="keu-r">Nominal</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td>
                    <a href={r.photoUrl} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.photoUrl}
                        alt="bukti"
                        style={{
                          width: 46,
                          height: 46,
                          objectFit: "cover",
                          borderRadius: 3,
                          border: "1px solid var(--keu-line2)",
                          display: "block",
                        }}
                      />
                    </a>
                  </td>
                  <td>
                    <div>{r.category}</div>
                    <div style={{ fontSize: 9.5, color: "var(--keu-faint)" }}>
                      {fmtDate(r.date)}
                      {r.note ? ` · ${r.note}` : ""}
                    </div>
                  </td>
                  <td className="keu-dim-t">
                    <span className="keu-accent">{r.tourCode}</span> {r.tourTitle}
                  </td>
                  <td className="keu-dim-t">{r.submittedBy}</td>
                  <td className="keu-r keu-num">{rupiah(r.amount)}</td>
                  <td>
                    <span className={`keu-pill ${TONE[r.status] ?? "keu-pill-dim"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="keu-r">
                    {r.status === "PENDING" ? (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <ApproveExpenseButton id={r.id} />
                        <RejectExpenseButton id={r.id} />
                      </div>
                    ) : (
                      <span className="keu-faint-t" style={{ fontSize: 9 }}>
                        SELESAI
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
