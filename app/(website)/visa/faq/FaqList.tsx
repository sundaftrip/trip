"use client";

import { useState, type ReactNode } from "react";

export type FaqItem = {
  q: string;
  a: ReactNode;
  /**
   * Teks CTA kontekstual di bawah jawaban.
   * Default: pakai DEFAULT_LAYANAN_CTA.
   * Set null untuk skip CTA (misal di FAQ "Pengurusan Visa via Sundaf" itu sendiri).
   */
  layanan?: string | null;
};

const DEFAULT_LAYANAN_CTA =
  "Kasus ini lebih aman ditangani via pengurusan visa lengkap, lihat detail";

/**
 * Detail layanan "Pengurusan Visa via Sundaf".
 * Dipakai sebagai inline preview saat CTA pink diklik, dan juga sebagai
 * jawaban utama di section "Pengurusan Visa via Sundaf" (lihat page.tsx).
 */
export const PENGURUSAN_VISA_DETAIL: ReactNode = (
  <>
    <p>
      Sundaf melayani pengurusan visa sebagai <b>satu paket utuh</b>, bukan
      layanan satuan. Saat kamu percayakan visa ke kami, kami koordinasikan
      dari hulu ke hilir. Kamu tidak perlu pusing cari vendor sana-sini.
    </p>
    <p>
      <b>Sudah termasuk dalam biaya pengurusan visa kami:</b>
    </p>
    <ul className="list-disc pl-5 space-y-1.5">
      <li>
        <b>Review profil dan dokumen sebelum submit</b>. Kami cek seluruh
        dokumen, cover letter, dan itinerary kamu. Profil borderline atau
        riwayat reject kami tangani secara khusus.
      </li>
      <li>
        <b>Draft cover letter</b>. Disesuaikan profil kamu, negara tujuan, dan
        poin-poin yang officer cari.
      </li>
      <li>
        <b>Itinerary harian</b>. Disusun masuk akal untuk konsulat, bukan
        sekadar nempel tempat wisata populer.
      </li>
      <li>
        <b>Booking tiket pesawat dummy</b>. Reservation yang sah untuk lampiran
        visa, kami yang urus, baru issued setelah visa terbit.
      </li>
      <li>
        <b>Booking hotel free cancel</b>. Format yang biasa diterima konsulat
        sebagai bukti akomodasi.
      </li>
      <li>
        <b>Isi form aplikasi visa lengkap</b>. Dari isi data, verifikasi
        konsistensi antar dokumen, sampai sign-off.
      </li>
      <li>
        <b>Booking slot biometric</b> di VFS / BLS.
      </li>
      <li>
        <b>Briefing sebelum appointment</b>. Apa yang harus dibawa, apa yang
        akan ditanya, dan apa yang sebaiknya dijawab.
      </li>
    </ul>
    <p>
      <b>Dikoordinasikan via kami (biaya terpisah, tergantung kasus):</b>
    </p>
    <ul className="list-disc pl-5 space-y-1.5">
      <li>
        <b>Asuransi perjalanan</b>. Schengen coverage €30.000
        medical+repatriation (AXA, MSIG, Allianz, Zurich), atau polis negara
        lain yang diakui konsulat.
      </li>
      <li>
        <b>Apostille Kemenkumham</b>. Akta lahir, akta nikah, akta cerai,
        ijazah, surat hak asuh, surat consent. Kami antar jemput, kamu tidak
        perlu ke Kemenkumham sendiri.
      </li>
      <li>
        <b>Penerjemah tersumpah</b>. Inggris, Spanyol, Jerman, Belanda,
        Prancis, Mandarin, Jepang, Korea. Bersertifikat HPI/Kemenkumham dengan
        format yang disesuaikan kedutaan.
      </li>
      <li>
        <b>Notaris</b>. Surat sumpah perbedaan ejaan nama, surat consent orang
        tua untuk anak di bawah 18, surat sponsor pasangan atau keluarga.
      </li>
      <li>
        <b>Bank reference letter</b>. Pendampingan urus surat referensi bank
        dengan format yang diakui kedutaan.
      </li>
    </ul>
    <p>
      Untuk biaya pengurusan visa dan estimasi item-item tambahan, kami
      sampaikan via WhatsApp setelah memahami negara tujuan, jenis visa, dan
      dokumen spesifik yang kamu butuhkan. Konsultasi awal gratis. Kami tidak
      ambil klien yang sebenarnya bisa urus sendiri.
    </p>
  </>
);

export function FaqList({
  items,
  showInlinePreview = true,
}: {
  items: FaqItem[];
  /**
   * Saat true (default), CTA pink jadi tombol toggle yang expand
   * `PENGURUSAN_VISA_DETAIL` inline di tempat, user tidak perlu scroll.
   * Saat false (untuk section "Pengurusan Visa via Sundaf" itu sendiri),
   * jatuh kembali ke anchor link `#layanan-pendukung`.
   */
  showInlinePreview?: boolean;
}) {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const ctaText =
          item.layanan === null
            ? null
            : item.layanan ?? DEFAULT_LAYANAN_CTA;
        const isOpen = openSet.has(i);
        return (
          <details
            key={i}
            className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
          >
            <summary className="cursor-pointer list-none px-5 py-4 flex items-start justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-900/60">
              <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base leading-snug">
                {item.q}
              </span>
              <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-500 group-open:rotate-45 transition-transform text-lg leading-none">
                +
              </span>
            </summary>
            <div className="px-5 pb-5 pt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
              {item.a}
              {ctaText && (
                <div
                  className="mt-4 pt-3 border-t"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--site-accent-ink,#2d6a4f) 18%, transparent)",
                  }}
                >
                  {showInlinePreview ? (
                    <>
                      <button
                        type="button"
                        onClick={() => toggle(i)}
                        aria-expanded={isOpen}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold hover:underline cursor-pointer"
                        style={{ color: "var(--site-accent-ink,#2d6a4f)" }}
                      >
                        <span
                          aria-hidden="true"
                          className={`inline-block transition-transform duration-200 ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        >
                          →
                        </span>
                        <span>{ctaText}</span>
                      </button>
                      {isOpen && (
                        <div
                          className="mt-4 p-4 sm:p-5 rounded-lg border bg-gray-50 dark:bg-gray-800/60 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--site-accent-ink,#2d6a4f) 28%, transparent)",
                          }}
                        >
                          <div
                            className="flex items-center gap-2 mb-1 text-[11px] font-bold uppercase tracking-wider"
                            style={{
                              color: "var(--site-accent-ink,#2d6a4f)",
                            }}
                          >
                            <span
                              className="inline-block w-1 h-3.5 rounded-full"
                              style={{
                                background: "var(--site-accent-ink,#2d6a4f)",
                              }}
                            />
                            Pengurusan Visa via Sundaf
                          </div>
                          {PENGURUSAN_VISA_DETAIL}
                        </div>
                      )}
                    </>
                  ) : (
                    <a
                      href="#layanan-pendukung"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold hover:underline"
                      style={{ color: "var(--site-accent-ink,#2d6a4f)" }}
                    >
                      <span aria-hidden="true">→</span>
                      <span>{ctaText}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
