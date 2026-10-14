# Pool Trip (multi-negara)

Halaman pendaftaran pool land tour untuk beberapa negara sekaligus. Terpisah dari pool Kazakhstan
(`/kazakhstan`, sheet dan Apps Script sendiri).

## Alur

- `public/pool/index.html`: halaman statis. `next.config.ts` menyajikannya di `/pool` (daftar negara)
  dan `/pool/<kode>` (satu negara). Pindah halaman tanpa reload memakai `history.pushState`.
- `app/api/pool/route.ts`: GET meneruskan ke Apps Script `?api=catalog` (cache CDN 30 detik,
  stale-while-revalidate 5 menit). POST meneruskan formulir pendaftaran (rate limit 8/menit per IP,
  maksimal 4.000 karakter, hanya field formulir yang diteruskan).
- `lib/pool-trip.ts`: URL Apps Script (`POOL_SCRIPT_URL`, bisa ditimpa env `POOL_SCRIPT_URL`) dan logika proxy.
- Google Sheet **SUNDAF · Pool Trip** + Apps Script (Web app, Execute as: Me, Anyone): sumber semua isi.

## Mengubah isi (tanpa ubah kode)

Semua dari Google Sheet, tampil di halaman dalam sekitar 1 menit:

- **Destinasi**: satu kolom per negara (kode halaman, nama, status Buka/Segera/Draf/Tutup, kota tiba,
  milestone, catatan, penjemputan).
- **Paket & Harga**: satu baris per paket; harga per orang di kolom jumlah peserta (`2 orang`, `6 orang`, ...).
- **Itinerary**: satu baris per hari; kolom Paket kosong = semua paket.
- **Tambahan**: aktivitas bayar terpisah.
- **Pengaturan**: nomor WA admin, email notifikasi, buka/tutup semua pendaftaran, link halaman.

Data publik dari Apps Script tidak berisi nama atau nomor WA peserta.

## Mengganti deployment Apps Script

Isi `POOL_SCRIPT_URL` di `lib/pool-trip.ts` (atau env `POOL_SCRIPT_URL` di Vercel) dengan URL `/exec`
yang baru. Cek: `https://sundaftrip.com/api/pool` harus membalas JSON `{"ok":true,...}`.
