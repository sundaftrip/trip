import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ Teknis Visa Schengen — Paspor Indonesia",
  description:
    "Kasus teknis Schengen yang sering bikin reject: cerai, anak di bawah 18, apostille Spanyol, sponsor pasangan, rekening kecil, apply dari negara lain.",
};

type FaqItem = {
  q: string;
  a: React.ReactNode;
};

const SCHENGEN_TEKNIS: FaqItem[] = [
  {
    q: "Status cerai — apa yang harus dilampirkan?",
    a: (
      <>
        <p>
          Wajib lampirkan <b>akta cerai</b> (asli + fotokopi) sebagai bukti civil status,
          diterjemahkan tersumpah ke Inggris atau bahasa negara tujuan. Akta cerai
          bukan dokumen negatif — justru menjelaskan kenapa apply sendiri tanpa
          pasangan, jangan disembunyikan.
        </p>
        <p>
          Kalau bawa anak: tambahkan <b>penetapan hak asuh</b> dari pengadilan.
          Kalau hak asuh bersama, butuh <b>surat consent dari mantan pasangan</b>
          (notaris) yang mengizinkan anak ikut bepergian.
        </p>
      </>
    ),
  },
  {
    q: "Anak di bawah 18 tahun — dokumen tambahan?",
    a: (
      <>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Akta lahir anak (asli + fotokopi) + Kartu Keluarga</li>
          <li>Paspor anak + paspor & KTP kedua orang tua</li>
          <li>Form aplikasi ditandatangani kedua orang tua / wali sah</li>
          <li>
            Kalau anak pergi sendiri atau hanya dengan satu orang tua:{" "}
            <b>surat consent</b> dari orang tua yang tidak ikut, ditandatangani
            di depan <b>notaris</b>
          </li>
          <li>Scan paspor orang tua yang tidak ikut (halaman data)</li>
        </ul>
      </>
    ),
  },
  {
    q: "Anak di bawah 18 ke Spanyol — apostille?",
    a: (
      <>
        <p>
          Ya. Spanyol paling strict di Schengen untuk minor.{" "}
          <b>Akta lahir wajib di-apostille</b> di Kemenkumham (Indonesia sudah
          anggota Konvensi Apostille sejak 2022 — tidak perlu legalisir kedutaan
          lagi).
        </p>
        <p>
          <b>Surat consent orang tua</b> juga wajib notaris + apostille, lalu
          diterjemahkan tersumpah ke Spanyol. Kalau anak pergi sendiri → consent
          dari kedua orang tua, masing-masing diproses.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Urutan praktis: notaris → Kemenkumham (apostille) → translator
          tersumpah Spanyol. Sediakan <b>3–4 minggu</b> sebelum tanggal submit.
        </p>
      </>
    ),
  },
  {
    q: "Pergi sama suami, tapi suami tidak kerja",
    a: (
      <>
        <p>
          Schengen tidak melarang. Yang penting jelas <b>siapa sponsornya</b>.
          Tiga opsi yang sering dipakai:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Istri sebagai sponsor</b> — istri lampirkan surat kerja, slip
            gaji, mutasi rekening, dan <b>surat sponsor</b> untuk suami. Suami
            statusnya "dependent".
          </li>
          <li>
            <b>Sponsor pihak ketiga</b> (orang tua/saudara) — surat sponsor +
            bukti finansial sponsor + bukti relasi (KK/akta).
          </li>
          <li>
            <b>Aset pasangan</b> — kalau suami pengusaha, lampirkan NIB / SIUP /
            akta usaha. "Tidak kerja kantoran" beda dengan "tidak punya income".
          </li>
        </ul>
        <p>
          Suami tetap submit dokumen sendiri: paspor, form, asuransi, itinerary,
          surat keterangan tidak bekerja / surat usaha, dan <b>akta nikah</b>{" "}
          sebagai bukti relasi ke istri sponsor.
        </p>
      </>
    ),
  },
  {
    q: "Rekening tipis atau mutasi berantakan",
    a: (
      <>
        <p>
          Acuan tidak resmi yang sering dipakai untuk paspor Indonesia:{" "}
          <b>±Rp 100 juta</b> di rekening, atau setara <b>€50–100 per hari</b>{" "}
          rencana perjalanan.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <b>Jangan setor lump-sum mendadak</b> sebulan sebelum apply.
            Petugas visa langsung baca itu sebagai "parking money" — high risk
            reject.
          </li>
          <li>
            <b>Pakai sponsor</b> (orang tua, pasangan, saudara) — tunjukkan
            rekening sponsor + surat sponsor + bukti relasi.
          </li>
          <li>
            <b>Gabungkan bukti finansial lain</b>: deposito, reksadana, SPT
            tahunan, sertifikat tanah, BPKB, surat keterangan usaha. Mutasi
            rekening bukan satu-satunya bukti.
          </li>
          <li>
            <b>Bank reference letter</b> ("rekening aktif sejak…, saldo
            rata-rata…") — minta 2 hari sebelum biometric.
          </li>
          <li>Mutasi 3 bulan asli cap bank, bukan e-statement biasa.</li>
        </ul>
      </>
    ),
  },
  {
    q: "Apply Schengen dari negara lain (WNI tinggal di luar)",
    a: (
      <>
        <p>
          Aturan Schengen: apply di <b>negara tujuan utama</b>, di VAC/kedutaan
          negara <b>tempat tinggal sah</b> kamu — bukan terbang dulu ke Jakarta.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            Wajib punya <b>residence permit / long-stay visa</b> yang masih
            valid <b>minimal 3 bulan</b> setelah rencana balik dari Schengen.
          </li>
          <li>
            VAC di Indonesia hanya terima pemohon yang legal resident di
            Indonesia — WNI di Dubai/Singapura/KL apply di sana.
          </li>
          <li>
            Lampiran tambahan: residence permit/visa kerja/pelajar + bukti
            tinggal (kontrak sewa, payroll, surat sekolah).
          </li>
          <li>
            Kalau residence permit tinggal sebentar (&lt; 6 bulan), kedutaan
            sering kasih validitas Schengen lebih pendek atau reject. Apply pas
            permit masih tebal.
          </li>
        </ul>
      </>
    ),
  },
];

const UMUM: FaqItem[] = [
  {
    q: "Dokumen bahasa Indonesia perlu diterjemahkan?",
    a: (
      <p>
        Ya. Akta lahir, akta nikah, akta cerai, surat kerja, slip gaji, bank
        reference — semua dokumen pendukung wajib diterjemahkan oleh{" "}
        <b>penerjemah tersumpah</b> ke Inggris atau bahasa negara tujuan.
        Mutasi rekening biasanya sudah dwi-bahasa dari bank, tapi konfirmasi
        dulu sebelum apply.
      </p>
    ),
  },
  {
    q: "Asuransi perjalanan — minimum berapa?",
    a: (
      <p>
        Schengen: <b>coverage minimum €30.000</b> untuk medical + repatriation,
        valid di seluruh wilayah Schengen, mencakup seluruh periode perjalanan
        + buffer. UK / Australia / NZ tidak mensyaratkan asuransi untuk visa,
        tapi sangat dianjurkan.
      </p>
    ),
  },
  {
    q: "Tiket pesawat & hotel — booking beneran atau dummy?",
    a: (
      <p>
        <b>Jangan booking lunas</b> sebelum visa approve.
        Pakai <b>reservation</b> tiket (hold 24–72 jam) dan booking hotel yang
        bisa <b>free cancel</b> (Booking.com / Agoda). Cetak konfirmasi-nya
        untuk lampiran. Setelah visa terbit, baru issued tiket beneran.
      </p>
    ),
  },
  {
    q: "Cover letter — perlu atau tidak?",
    a: (
      <p>
        Sangat dianjurkan, terutama untuk profil borderline. Isinya: tujuan
        perjalanan, rencana harian singkat, siapa yang membiayai, dan{" "}
        <b>ikatan ke Indonesia</b> (pekerjaan, properti, keluarga inti, usaha).
        Cover letter yang baik sering mengubah reject jadi approve.
      </p>
    ),
  },
];

function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
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
          </div>
        </details>
      ))}
    </div>
  );
}

export default function VisaFaqPage() {
  return (
    <div className="min-h-screen pt-24 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <Link
          href="/visa"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
        >
          <ChevronLeft size={14} />
          Kembali ke Database Visa
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <HelpCircle size={20} style={{ color: "var(--site-accent-ink,#2d6a4f)" }} />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            FAQ Teknis Visa
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Kasus Teknis yang Sering Bikin Reject
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
          Jawaban praktis untuk situasi yang tidak ada di checklist standar
          kedutaan — dari status cerai, anak di bawah 18, sampai apply dari
          negara lain.
        </p>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-1.5 h-5 rounded-full"
              style={{ background: "var(--site-accent-ink,#2d6a4f)" }}
            />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Schengen — Kasus Teknis
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Pertanyaan paling sering ditanya calon pemohon dengan profil
            non-standar.
          </p>
          <FaqList items={SCHENGEN_TEKNIS} />
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-1.5 h-5 rounded-full"
              style={{ background: "var(--site-accent-ink,#2d6a4f)" }}
            />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Dokumen Pendukung Umum
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Berlaku untuk hampir semua aplikasi visa turis — Schengen, UK,
            Australia, NZ, Jepang, Korea.
          </p>
          <FaqList items={UMUM} />
        </section>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Disclaimer
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Informasi di halaman ini bersifat panduan praktis berdasarkan
            pengalaman lapangan. Aturan kedutaan bisa berubah tanpa pemberitahuan.
            Selalu cek persyaratan resmi di situs VFS/BLS atau kedutaan negara
            tujuan sebelum submit.
          </p>
        </div>
      </div>
    </div>
  );
}
