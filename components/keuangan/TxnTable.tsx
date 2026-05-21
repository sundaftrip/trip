"use client";

import { useState } from "react";
import { fmtDateTime, rupiah } from "@/lib/keuangan/format";

export type TxnRow = {
  id: string;
  date: Date | string;
  direction: "IN" | "OUT";
  label: string;
  sub: string;
  amount: number;
  kind: string;
  voided?: boolean;
};

const FILTERS = [
  { key: "ALL", label: "SEMUA" },
  { key: "IN", label: "↑ CASH IN" },
  { key: "OUT", label: "↓ CASH OUT" },
] as const;

export default function TxnTable({
  txns,
  limit,
}: {
  txns: TxnRow[];
  limit?: number;
}) {
  const [filter, setFilter] = useState<"ALL" | "IN" | "OUT">("ALL");

  const rows = txns
    .filter((t) => filter === "ALL" || t.direction === filter)
    .slice(0, limit ?? txns.length);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`keu-btn ${filter === f.key ? "keu-btn-primary" : "keu-btn-ghost"}`}
            style={{ padding: "6px 12px", fontSize: 10 }}
          >
            {f.label}
          </button>
        ))}
        <span
          style={{
            marginLeft: "auto",
            alignSelf: "center",
            fontSize: 10,
            letterSpacing: "0.1em",
            color: "var(--keu-faint)",
          }}
        >
          {rows.length} BARIS
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="keu-empty">TIDAK ADA TRANSAKSI PADA FILTER INI</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="keu-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Transaksi</th>
                <th>Kategori</th>
                <th className="keu-r">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} style={t.voided ? { opacity: 0.4 } : undefined}>
                  <td className="keu-faint-t" style={{ whiteSpace: "nowrap" }}>
                    {fmtDateTime(t.date)}
                  </td>
                  <td>
                    <div style={t.voided ? { textDecoration: "line-through" } : undefined}>
                      {t.label}
                    </div>
                    {t.sub && (
                      <div style={{ fontSize: 10, color: "var(--keu-faint)", marginTop: 2 }}>
                        {t.sub}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`keu-pill keu-pill-${t.voided ? "dim" : kindTone(t.kind)}`}>
                      {t.voided ? "VOID" : t.kind}
                    </span>
                  </td>
                  <td
                    className={`keu-r keu-num ${
                      t.voided ? "keu-faint-t" : t.direction === "IN" ? "keu-up" : "keu-down"
                    }`}
                    style={t.voided ? { textDecoration: "line-through" } : undefined}
                  >
                    {t.direction === "IN" ? "+" : "−"}
                    {rupiah(t.amount).replace("−", "")}
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

function kindTone(kind: string): "cyan" | "warn" | "dim" | "ok" | "red" {
  switch (kind) {
    case "PESERTA":
      return "ok";
    case "VENDOR_PAYMENT":
      return "red";
    case "DEPOSIT":
      return "warn";
    case "OPERATIONAL":
      return "cyan";
    case "CAPITAL":
      return "ok";
    case "PRIVE":
      return "warn";
    default:
      return "dim";
  }
}
