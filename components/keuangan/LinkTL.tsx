"use client";

import { useEffect, useState } from "react";
import { generateExpenseToken, revokeExpenseToken } from "@/lib/keuangan/actions";

export default function LinkTL({
  tourId,
  token,
}: {
  tourId: string;
  token: string | null;
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

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
          Bagikan ke TL. Tanpa login — TL cukup buka link, foto struk, submit.
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
