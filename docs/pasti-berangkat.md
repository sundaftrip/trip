# Pasti Berangkat: /pastiberangkat, /2tans, /turharian

Tiga halaman pendaftaran trip Almaty yang tidak menunggu kuota. Harga per orang dihitung dari rombongan
pendaftar sendiri, jadi trip tetap jalan walau cuma satu orang yang daftar. Terpisah dari pool Kazakhstan
(`/kazakhstan`) dan Pool Trip (`/pool`): sheet, Apps Script, dan API sendiri.

| URL | Isi |
| --- | --- |
| `/pastiberangkat` | Trip Almaty saja. Tanggal tiba dan pulang bebas, tur dibeli per hari, hotel boleh tidak, atau paket privat 5/6 hari. |
| `/2tans` | Sama dengan di atas, ditambah lanjut ke Kirgistan (tur gabungan 3H2M atau tur privat 4H3M). |
| `/turharian` | Tur harian saja, tanpa hotel dan transfer. Titik kumpul di lobi Astra Hotel, Jl. Zheltoksan 12. |

## Alur

- `scripts/pasti-berangkat/`: sumber ketiga halaman.
  - `src/page.html` template, `src/page.js` mesin (harga, kalender, formulir), `src/page.css` tambahan di atas
    `src/base.css` (gaya halaman `/kazakhstan`, disalin apa adanya).
  - `products.mjs`: teks dan pengaturan tiap halaman (objek `P`: Kirgistan, hotel, paket, kedatangan, contoh harga).
  - `npm run build:pasti-berangkat` menulis `public/<halaman>/index.html`. Jangan ubah file di `public/` langsung;
    `npm test` gagal kalau isinya tidak sama dengan hasil build.
- `next.config.ts` menyajikan file itu di `/pastiberangkat`, `/2tans`, dan `/turharian`.
- `app/api/pasti-berangkat/route.ts` + `lib/pasti-berangkat.ts`: GET meneruskan ke Apps Script `?api=pools`
  (cache CDN 30 detik, stale-while-revalidate 5 menit). POST meneruskan pendaftaran (rate limit 8/menit per IP,
  maksimal 12.000 karakter, halaman harus salah satu dari tiga, hanya field formulir yang diteruskan).
- Google Sheet **SUNDAF · Pasti Berangkat** (akun sundaf.group@gmail.com) dengan Apps Script
  `docs/apps-script/pasti-berangkat.gs` (Web app, Execute as: Me, Who has access: Anyone).
- Dibuka langsung sebagai file atau dengan `?demo=1`: data contoh, tidak menyimpan apa pun.

## Harga

Per orang = ROUNDUP((jumlah modal USD × 17.950 × 1,03 + operasional Rp0) × 1,15; ke Rp10.000).
Harga per baris dibulatkan ke atas ke Rp1.000. Tur harian dihitung dari KZT dengan 454 KZT per USD.

| Komponen | Modal | Status di halaman |
| --- | --- | --- |
| Astra Hotel, per kamar per malam dengan sarapan | USD 59 (sendiri), 64 (berdua), 70 (bertiga) | harga publik (Booking.com, angka tertinggi 22–31 Mar 2027) |
| Tur gabungan Kota & Shymbulak | 27.000 KZT per orang | harga publik |
| Tur gabungan Charyn & Kolsay | 18.000 KZT per orang | harga publik |
| Kirgistan tur gabungan 3H2M | USD 585 per orang, jadwal 28–30 Mar 2027 | harga publik |
| Kirgistan tur privat 4H3M | tier 10–26 orang, tambahan kamar sendiri USD 105 | penawaran mitra s.d. 15 Nov 2026, sesudahnya tampil "perkiraan" |
| Paket privat Almaty 5H4M / 6H5M | tier 2–30 orang | penawaran mitra |
| Paket privat tanpa hotel | paket − USD 90 | perkiraan |

Tampil sebagai "harga menyusul" (belum ada di penawaran): transfer bandara, tur privat harian, e-visa Kirgistan,
transfer ke perbatasan, tambahan kamar sendiri di tur gabungan Kirgistan, paket privat untuk jumlah orang di luar
tier, dan Kirgistan privat di bawah 10 orang. Admin mengirim harganya sebelum DP.

Mengubah harga atau kurs: edit `CONFIG`, `HOTEL`, `TUR`, `KG`, `PAKET`, atau `TAMBAHAN` di
`scripts/pasti-berangkat/src/page.js`, lalu build dan commit.

Aturan yang dijaga mesin harga:

- Tidak ada biaya yang dibagi dengan peserta di luar rombongan pendaftar. Hotel per kamar rombongan sendiri,
  tur gabungan per kursi, paket privat memakai tier jumlah orang di rombongan sendiri.
- Kamar sendiri dibayar penuh dan tidak disebut tarif tur solo.
- Angka publik menghitung pendaftar (tanpa BATAL). Yang sudah DP atau lunas ditampilkan terpisah; tagihan akhir
  di tanggal kunci hanya memperhitungkan peserta DP/LUNAS.
- Jam pulang, kamar, dan peserta tidak dianggap pasti. Untuk Kirgistan, asumsi harganya ditulis di halaman
  (kembali ke Almaty di hari terakhir tur, menginap di Almaty malam itu).

## Kerja harian admin (di Google Sheet)

- **Pendaftar**: satu baris per pendaftaran. Status MINAT terisi otomatis; ubah ke DP, LUNAS, atau BATAL.
  Kolom Halaman menunjukkan asal pendaftar. Kode: `PB-` (pastiberangkat), `2T-` (2tans), `TH-` (turharian).
  Pendaftar yang mengirim lagi dengan nomor, tanggal, dan halaman yang sama memperbarui barisnya sendiri.
- **Rekap tur**: jumlah orang per tanggal per tur dari ketiga halaman, untuk memesan kursi tur gabungan.
  Diperbarui setiap ada pendaftaran, atau lewat menu SUNDAF → Perbarui rekap tur (misalnya setelah mengubah status).
- **Grup WA**: isi tanggal tiba (yyyy-mm-dd) dan link grup WhatsApp. Pendaftar `/pastiberangkat` dan `/2tans`
  di tanggal itu langsung melihat tombol "Gabung grup WA".
- Pengaturan di bagian `CFG` Apps Script: buka/tutup pendaftaran, nomor WA admin, titik dan jam kumpul,
  batas tanggal dan jumlah orang. Setelah mengubah kode: Deploy → Manage deployments → Edit → New version.

Data publik dari Apps Script tidak berisi nama atau nomor WA.

## Mengganti deployment Apps Script

Isi `PB_SCRIPT_URL` di `lib/pasti-berangkat.ts` (atau env `PB_SCRIPT_URL` di Vercel) dengan URL `/exec`
yang baru. Cek: `https://sundaftrip.com/api/pasti-berangkat` harus membalas JSON `{"ok":true,...}`.
