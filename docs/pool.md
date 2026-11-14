# Pool land tour

Orang yang tiba di tanggal yang sama dikumpulkan jadi satu rombongan. Makin banyak yang ikut,
makin murah harga per orang. Semua data ada di database website; Google Sheet dan Apps Script
tidak dipakai lagi.

## Halaman

| URL | Isi | File |
|---|---|---|
| `/kazakhstan` | Halaman khusus Kazakhstan: kalender, nyusul rombongan, tambah Kirgistan, jam tiba | `public/kazakhstan/index.html` |
| `/pool` | Daftar negara yang dibuka | `public/pool/index.html` |
| `/pool/<kode>` | Satu negara (pool dengan harga, atau daftar minat) | `public/pool/index.html` |
| Beranda, tab "Gabung tanggal" | Pilih negara + tanggal tiba, lihat jumlah orang | `components/website/clean/home/HomeFinderTabs.tsx` |
| `/admin/pool` | Pendaftar (nama + WhatsApp), negara, paket, harga, kuota, link grup | `app/admin/pool`, `components/admin/pool` |

Link `/kazakhstan?d=2027-03-24` dan `/pool/<kode>?d=2027-03-24` langsung membuka formulir di tanggal itu.

## Data dan privasi

- **Publik** (`GET /api/pool`, `/api/pool/kazakhstan`, `/api/pool/summary`): hanya angka per tanggal,
  pengaturan tampilan, dan harga. Query publik hanya memilih kolom hitungan (`COUNT_SELECT` di
  `lib/pool/store.ts`); nama dan nomor WhatsApp tidak pernah dimuat untuk permintaan publik.
  `tests/pool.test.ts` menjaga ini.
- **Pendaftaran** (`POST /api/pool`, `POST /api/pool/kazakhstan`): rate limit 8/menit per IP, isi
  maksimal 6.000 karakter, kolom jebakan bot. Kuota dan rombongan yang disusul dicek di dalam
  transaksi dengan kunci per negara, jadi dua pendaftaran bersamaan tidak bisa melampaui kuota.
  Nomor yang sama di tanggal yang sama memperbarui baris lama, bukan membuat baris baru.
- **CMS** (`/admin/pool`, `/api/pool-admin/*`): butuh izin `pool_view` (melihat) atau `pool_edit`
  (mengubah). Bawaan hanya Super Admin; akun lain diberi izin satu per satu di menu Izin Akses.
  Unduhan CSV dan semua perubahan tercatat di Log Aktivitas.

## Tabel

`PoolDestination` (negara, aturan, isi halaman), `PoolPackage` (paket + harga per jumlah orang),
`PoolDate` (kuota khusus dan link grup WA per tanggal), `PoolSignup` (pendaftar). Lihat
`prisma/schema.prisma`.

Status negara: **Buka** (pool dengan harga), **Segera** (daftar minat: orang mengisi perkiraan
tanggal tiba, belum ada harga), **Draf** (tidak di daftar, bisa dipratinjau lewat link), **Tutup**.

## Mengubah isi

Semua dari `/admin/pool`:

- **Pendaftar**: per negara per tanggal. Tombol WhatsApp ke tiap orang, salin semua nomor, tandai
  batal, pindah tanggal, catatan admin, tambah pendaftar manual. "Atur tanggal" untuk kuota khusus
  (kosong = bawaan, 0 = tutup) dan link grup WA.
- **Negara & harga**: status, titik jumlah orang (angka pertama = grup WA dibuka), tanggal paling
  cepat, kuota, paket dan harga per jumlah orang, isi halaman.
- Tombol hijau/merah di kanan atas membuka atau menutup semua pendaftaran.

Itinerary dan teks halaman `/kazakhstan` ada di file halamannya. Harga, kuota, titik kumpul, dan
transfer malam Kazakhstan diatur dari CMS.

## Rilis pertama (pindah dari Apps Script)

Tabel baru hanya menambah, tidak mengubah tabel lama, jadi aman dibuat sebelum kodenya rilis.

1. Buat tabel di database production: deploy production sekali dengan
   `ALLOW_PRODUCTION_DB_MIGRATION=true` (lihat `scripts/build.mjs`), atau jalankan
   `npx prisma db push` dengan `DATABASE_URL` production.
2. Buka `/admin/pool` → **Buat negara awal** (Kazakhstan dengan harga dari Sheet lama; Kirgistan dan
   Rusia sebagai daftar minat).
3. Tab **Impor dari Sheet**: salin tab "Pendaftar" dari Sheet "SUNDAF · Pool Kazakhstan", tempel,
   Periksa dulu, lalu Impor. Aman diulang: kode yang sudah ada tidak dibuat dua kali.
4. Cocokkan jumlah orang per tanggal di `/kazakhstan` dengan tab "Pool" di Sheet.
5. Salin link grup WA dan kuota khusus dari tab "Pool" ke "Atur tanggal" (kalau ada).
6. Setelah yakin: arsipkan deployment Apps Script kedua Sheet supaya tidak ada pendaftaran yang
   masuk ke tempat lama.

Halaman `/pastiberangkat`, `/2tans`, dan `/turharian` masih memakai Sheet sendiri
(`docs/pasti-berangkat.md`).
