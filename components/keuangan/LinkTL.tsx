"use client";

import { useEffect, useState } from "react";
import { generateExpenseToken, revokeExpenseToken } from "@/lib/keuangan/actions";
import { isTokenActive, tokenExpiry } from "@/lib/keuangan/calc";
import { fmtDate } from "@/lib/keuangan/format";

export default function LinkTL({
  tourId,
  token,
  tripDate,
}: {
  tourId: string;
  token: string | null;
  tripDate: Date | string | null;
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

  const td = tripDate ? new Date(tripDate) : null;
  const active = isTokenActive(td);
  const expiry = tokenExpiry(td);

  if (!token) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "var(--keu-dim)" }}>
          Belum ada link pelaporan untuk trip ini.
        </span>
        <form action={generateExpenseToken}>
          <input type="hidden" name="tourId" value={tourId} />
          <button type="submit" className="keu-btn keu-btn-primary" style={{ fontSize: 10 }}>
            + BUAT LINK TL
          </button>
        </form>
      </div>
    );
  }

  const url = `${origin}/lapor/${token}`;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="keu-input"
          style={{ flex: 1, minWidth: 220, fontSize: 11 }}
        />
        <button
          type="button"
          className="keu-btn keu-btn-primary"
          style={{ fontSize: 10 }}
          onClick={() => {
            navigator.clipboard?.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
        >
          {copied ? "✓ TERSALIN" : "SALIN LINK"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            `Link lapor pengeluaran trip: ${url}`,
          )}`}
          target="_blank"
          rel="noreferrer"
          className="keu-btn keu-btn-ghost"
          style={{ fontSize: 10 }}
        >
          KIRIM WA
        </a>
      </div>
      <div style={{ marginTop: 8, fontSize: 10 }}>
        {active ? (
          <span className="keu-up">
            ● AKTIF{expiry ? ` — berlaku sampai ${fmtDate(expiry)}` : " — tanpa batas waktu"}
          </span>
        ) : (
          <span className="keu-down">
            ⏳ KEDALUWARSA — link tidak bisa dipakai TL lagi. Klik "GANTI LINK" untuk
            menerbitkan link baru.
          </span>
        )}
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 10, color: "var(--keu-faint)" }}>
          Bagikan ke TL. Tanpa login — TL cukup buka link, foto struk, submit. Link mati
          otomatis 14 hari setelah trip berangkat.
        </span>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <form action={generateExpenseToken}>
            <input type="hidden" name="tourId" value={tourId} />
            <button type="submit" className="keu-btn keu-btn-ghost" style={{ fontSize: 10 }}>
              GANTI LINK
            </button>
          </form>
          <form action={revokeExpenseToken}>
            <input type="hidden" name="tourId" value={tourId} />
            <button type="submit" className="keu-btn keu-btn-ghost" style={{ fontSize: 10 }}>
              CABUT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
