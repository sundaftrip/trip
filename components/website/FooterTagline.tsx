"use client";
import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";

/* Tagline footer: di halaman /about tampilkan pesan B2B (menggantikan blurb
   umum), di halaman lain tampilkan tagline biasa.
   CLIENT component — path dideteksi via usePathname() agar Footer TIDAK perlu
   memanggil headers() di server. headers() adalah Dynamic API yang membuat
   SELURUH segmen (website) jadi dynamic → no-store → edge cache mati.
   usePathname() aman untuk halaman static (beda dengan useSearchParams). */
export default function FooterTagline({
  tagline,
  waB2B,
  className = "",
  style,
}: {
  tagline: string;
  waB2B?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const isAbout = usePathname() === "/about";
  if (isAbout) {
    return (
      <p className="text-sm leading-relaxed max-w-md" style={style}>
        <span className="font-semibold">Untuk travel agent &amp; mitra B2B —</span>{" "}
        khusus Rusia{" "}
        <span className="stabilo">kami tangani langsung sebagai operator lokal (tangan pertama)</span>.{" "}
        <span className="stabilo">Sejumlah travel agent di Indonesia telah mempercayakan operasional Rusia mereka kepada kami</span>; atas permintaan
        mitra, identitas dan rincian kerja sama kami jaga kerahasiaannya dan hanya dibuka untuk agent
        terverifikasi.
        {waB2B ? (
          <>
            {" "}
            <a href={waB2B} target="_blank" rel="noreferrer"
              className="font-semibold underline underline-offset-2 hover:opacity-80">
              Hubungi kami untuk skema partner
            </a>
            .
          </>
        ) : null}
      </p>
    );
  }

  return tagline ? <p className={className} style={style}>{tagline}</p> : null;
}
