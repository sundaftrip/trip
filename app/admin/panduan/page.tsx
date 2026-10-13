import Link from "next/link";
import { requireAdminModule } from "@/lib/admin-access";
import { TOUR_STATUS_HELP, TOUR_STATUS_LABELS } from "@/lib/admin-tour-checks";

const DAILY = [
  "Buka Dashboard. Lengkapi tour di daftar \"Perlu dilengkapi\".",
  "Setelah ada booking atau DP, kurangi Sisa kursi di tour tersebut.",
  "Kursi habis: ubah status ke Penuh. Trip batal: ubah status ke Batal.",
  "Cek \"Keberangkatan 30 hari ke depan\" untuk tour yang sebentar lagi berangkat.",
];

const NEW_TOUR = [
  "Klik Tambah Tour, atau ikon Duplikat pada tour yang mirip agar itinerary tidak diketik ulang.",
  "Isi Info utama, Jadwal & status, lalu Harga per orang.",
  "Upload foto utama (landscape, tajam) dan beberapa foto galeri.",
  "Isi itinerary per hari, termasuk/tidak termasuk, hotel, dan biaya wajib.",
  "Simpan sebagai Draft dulu. Bila kotak cek di bagian Jadwal & status sudah hijau, ubah ke Aktif lalu simpan.",
  "Buka \"Lihat halaman tour di website\" untuk memastikan tampilannya benar.",
];

const PRICE_RULES = [
  "Semua harga per orang, ditulis angka saja tanpa titik, mis. 32500000.",
  "Harga promo membuat harga normal tampil dicoret.",
  "Harga per kamar (4/3/2 orang per kamar), bila diisi, menggantikan harga normal. Harga 4 orang/kamar menjadi harga mulai.",
  "Add-on bertanda Wajib ikut dihitung ke subtotal yang dilihat pengunjung. Tandai hanya biaya yang memang harus dibayar semua peserta.",
];

const PHOTO_RULES = [
  "Upload foto dari perangkat. Foto otomatis dikecilkan agar cepat dibuka.",
  "Link foto hanya diterima dari Cloudinary, Pexels, Unsplash, atau Wikimedia. Foto dari situs lain tidak akan tampil di website.",
  "Pakai foto milik Sundaf atau foto yang boleh dipakai. Hindari foto dengan watermark.",
];

export default async function GuidePage() {
  const viewer = await requireAdminModule("guide");

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panduan update katalog</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Ringkasan kerja harian untuk tim katalog. Akses Anda: {viewer.accessLabel}.
        </p>
      </div>

      <GuideSection title="Rutinitas harian">
        <ol className="list-decimal space-y-1.5 pl-5">{DAILY.map((item) => <li key={item}>{item}</li>)}</ol>
      </GuideSection>

      <GuideSection title="Menambah tour baru">
        <ol className="list-decimal space-y-1.5 pl-5">{NEW_TOUR.map((item) => <li key={item}>{item}</li>)}</ol>
      </GuideSection>

      <GuideSection title="Arti status">
        <dl className="divide-y divide-gray-100 dark:divide-gray-700">
          {Object.entries(TOUR_STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="grid gap-1 py-2 sm:grid-cols-[8rem_1fr]">
              <dt className="font-semibold text-gray-900 dark:text-white">{label}</dt>
              <dd>{TOUR_STATUS_HELP[status]}</dd>
            </div>
          ))}
          <div className="grid gap-1 py-2 sm:grid-cols-[8rem_1fr]">
            <dt className="font-semibold text-gray-900 dark:text-white">Sudah berangkat</dt>
            <dd>Otomatis setelah tanggal berangkat lewat. Tour tetap tampil sebagai trip terdahulu, tidak perlu diubah.</dd>
          </div>
        </dl>
      </GuideSection>

      <GuideSection title="Aturan harga">
        <ul className="list-disc space-y-1.5 pl-5">{PRICE_RULES.map((item) => <li key={item}>{item}</li>)}</ul>
      </GuideSection>

      <GuideSection title="Foto">
        <ul className="list-disc space-y-1.5 pl-5">{PHOTO_RULES.map((item) => <li key={item}>{item}</li>)}</ul>
      </GuideSection>

      <GuideSection title="Kalau ada kendala">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Isian form tersimpan otomatis di browser. Bila koneksi putus, buka lagi form yang sama lalu tekan Simpan.</li>
          <li>Pesan &ldquo;Sesi login berakhir&rdquo;: muat ulang halaman lalu masuk lagi. Ini juga terjadi setelah izin akun diubah.</li>
          <li>Menghapus tour dan mengubah izin hanya bisa dilakukan Super Admin. Semua perubahan tercatat di Log Aktivitas.</li>
        </ul>
      </GuideSection>

      <Link href="/admin/tours" className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        Buka daftar tour
      </Link>
    </div>
  );
}

function GuideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm leading-relaxed text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
      <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">{title}</h2>
      {children}
    </section>
  );
}
