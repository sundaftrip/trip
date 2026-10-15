# Pool Kazakhstan (v3)

Halaman `/kazakhstan` adalah file statis (`public/kazakhstan/index.html`) yang bicara langsung ke
Apps Script milik Google Sheet "SUNDAF · Pool Kazakhstan". Tidak memakai database website.
Terpisah dari Pool Trip multi-negara (`/pool`, lihat `docs/pool-trip.md`).

## Alur di halaman

1. Kalender ala GetYourGuide: pilih tanggal tiba (tanggal yang sudah ada peserta diberi lingkaran
   dan jumlah orang), jumlah orang, dan "tanggal masih bisa geser ±2 hari". Chip "Sudah ada
   rombongan" melompat ke tanggal yang sudah ramai.
2. Kalau ada rombongan yang tiba 1 sampai 3 hari lebih dulu dan masih jalan, pengunjung bisa
   **nyusul** rombongan itu (dihitung di pool tanggal rombongan) atau pindah ke tanggal itu.
3. Paket 5/6/8 hari dengan harga untuk jumlah orang setelah ia bergabung, plus harga di milestone
   berikutnya. Tab **+ Kirgistan**: atur hari di Kazakhstan (2-5), ke Bishkek lewat darat/pesawat,
   hari di Kirgistan (2-5). Rencana ini ikut dihitung di pool tanggal tibanya.
4. Kedatangan: pesawat / darat dari Bishkek / sudah di Almaty, jam tiba (waktu Almaty),
   nomor penerbangan, hotel paket atau hotel sendiri. Jam di jendela "transfer malam" diberi
   catatan jemput terpisah.
5. Nama, WhatsApp, catatan opsional.

## Data dan privasi

- API publik (`GET ?api=pools`, versi 3) hanya berisi angka per tanggal (`n`, per paket, `kg`,
  kuota `q`, `full`, tanggal selesai `e`), pengaturan tampilan (kuota, titik kumpul, jendela
  transfer malam), dan harga. Tidak ada nama, nomor, jam tiba, atau catatan.
- `POST` menyimpan ke tab Pendaftar. Kuota per tanggal dan rombongan yang disusul dicek di server
  di dalam lock.

## Google Sheet

| Tab | Isi |
|---|---|
| Pendaftar | Satu baris per pendaftaran. Kolom K-Q (v3): Jam tiba, Datang via, No. penerbangan, Hotel, Nyusul rombongan, Rencana Kirgistan, Catatan |
| Pool | Rekap per tanggal. Admin mengisi **Kuota** (kosong = default, 0 = tutup) dan **Link grup WA** |
| Jadwal jemput | Dibuat otomatis: kedatangan dan serah terima ke Kirgistan mulai hari ini, urut tanggal dan jam, dengan link pesan WA H-1 |
| Harga | Harga per orang per jumlah peserta |
| Pengaturan | Nomor WA admin, milestone, kuota default, titik kumpul, jam kumpul, jam dan biaya transfer malam, dll. |

Baris lama "KZ+KG (segera)" adalah daftar minat dari versi 2: disimpan, tidak dihitung di pool.

## Memperbarui Apps Script

Kode sumber dan tesnya ada di luar repo ini. Setelah menempel Code.gs baru: Deploy →
Manage deployments → deployment `AKfycbyFjxj38…` → Edit → Version: New version → Deploy.
URL `/exec` tetap sama. Perbarui Apps Script dulu, baru rilis halaman: kode v3 tetap melayani
halaman versi lama dengan benar.
