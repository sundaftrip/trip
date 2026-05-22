"use client";

import Link from "next/link";

/** Toolbar halaman cetak — tidak ikut tercetak (@media print: hidden). */
export default function CetakToolbar({ backHref }: { backHref: string }) {
  return (
    <div className="cetak-toolbar">
      <button className="cetak-btn" onClick={() => window.print()}>
        Cetak / Simpan PDF
      </button>
      <Link href={backHref} className="cetak-btn cetak-btn-ghost">
        ‹ Kembali
      </Link>
      <span className="cetak-toolbar-note">
        Di dialog cetak, pilih &quot;Simpan sebagai PDF&quot; untuk menyimpan file.
      </span>
    </div>
  );
}
