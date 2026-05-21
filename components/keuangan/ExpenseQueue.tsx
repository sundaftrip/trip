"use client";

import { useMemo, useState } from "react";
import { fmtDate, fmtMonthKey, monthKey, rupiah } from "@/lib/keuangan/format";
import { ApproveExpenseButton, RejectExpenseButton } from "@/components/keuangan/forms";

export type ExpenseRow = {
  id: string;
  tourId: string;
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
  const [status, setStatus] = useState<string>("PENDING");
  const [trip, setTrip] = useState<string>("ALL");
  const [period, setPeriod] = useState<string>("ALL");

  // opsi filter trip & periode diturunkan dari data
  const trips = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows) m.set(r.tourId, `${r.tourCode} · ${r.tourTitle}`);
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);

  const periods = useMemo(() => {
    const set = new Set(rows.map((r) => monthKey(r.date)));
    return [...set].sort().reverse();
  }, [rows]);

  const shown = rows.filter(
    (r) =>
      (status === "ALL" || r.status === status) &&
      (trip === "ALL" || r.tourId === trip) &&
      (period === "ALL" || monthKey(r.date) === period),
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        {FILTERS.map((f) => {
          const n = f.key === "ALL" ? rows.length : rows.filter((r) => r.status === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={`keu-btn ${status === f.key ? "keu-btn-primary" : "keu-btn-ghost"}`}
              style={{ padding: "6px 12px", fontSize: 10 }}
            >
              {f.label} · {n}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <select
          className="keu-select"
          value={trip}
          onChange={(e) => setTrip(e.target.value)}
          style={{ width: "auto", minWidth: 200, fontSize: 11, padding: "7px 10px" }}
        >
          <option value="ALL">Semua Trip</option>
          {trips.map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="keu-select"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{ width: "auto", minWidth: 150, fontSize: 11, padding: "7px 10px" }}
        >
          <option value="ALL">Semua Periode</option>
          {periods.map((p) => (
            <option key={p} value={p}>
              {fmtMonthKey(p)}
            </option>
          ))}
        </select>
        {(trip !== "ALL" || period !== "ALL") && (
          <button
            onClick={() => {
              setTrip("ALL");
              setPeriod("ALL");
            }}
            className="keu-btn keu-btn-ghost"
            style={{ padding: "7px 12px", fontSize: 10 }}
          >
            ✕ RESET FILTER
          </button>
        )}
        <span
          style={{
            marginLeft: "auto",
            alignSelf: "center",
            fontSize: 10,
            letterSpacing: "0.1em",
            color: "var(--keu-faint)",
          }}
        >
          {shown.length} DARI {rows.length} ENTRI
        </span>
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
