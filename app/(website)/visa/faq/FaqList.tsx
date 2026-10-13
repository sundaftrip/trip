"use client";

import { useState, type ReactNode } from "react";
import StableDetails from "@/components/website/clean/StableDetails";
import doc from "@/components/website/clean/DocFormat.module.css";
import styles from "./VisaFaqDoc.module.css";

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
    <div className={styles.list}>
      {items.map((item, i) => {
        const ctaText =
          item.layanan === null
            ? null
            : item.layanan ?? DEFAULT_LAYANAN_CTA;
        const isOpen = openSet.has(i);
        return (
          <StableDetails key={i} className={styles.item}>
            <summary className={styles.summary}>
              <span>{item.q}</span>
              <span className={styles.plus} aria-hidden="true">+</span>
            </summary>
            <div className={styles.answer}>
              {item.a}
              {ctaText && (
                <div className={styles.cta}>
                  {showInlinePreview ? (
                    <>
                      <button
                        type="button"
                        onClick={() => toggle(i)}
                        aria-expanded={isOpen}
                        className={styles.ctaButton}
                      >
                        <span aria-hidden="true">{isOpen ? "↓" : "→"}</span>
                        <span>{ctaText}</span>
                      </button>
                      {isOpen && (
                        <div className={styles.preview}>
                          <p className={doc.subhead}>Pengurusan visa via Sundaf</p>
                          {PENGURUSAN_VISA_DETAIL}
                        </div>
                      )}
                    </>
                  ) : (
                    <a href="#layanan-pendukung" className={styles.ctaButton}>
                      <span aria-hidden="true">→</span>
                      <span>{ctaText}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </StableDetails>
        );
      })}
    </div>
  );
}
