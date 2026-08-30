# Integrasi visa katalog

## Hasil dan batas penggunaan

Katalog baru memakai daftar negara yang dipilih admin, urutan kunjungan, jumlah hari, dan transit. Nama pemasaran seperti "Latin America" tidak digunakan untuk menebak kebutuhan visa. Profil yang didukung saat ini adalah paspor biasa Indonesia untuk perjalanan wisata.

Ketentuan visa dan harga bantuan pengurusan merupakan dua data berbeda. Harga diambil dari Database Visa, bukan ditebak dari narasi katalog. Tujuan yang belum dipetakan, sumber yang belum diperiksa, kondisi peserta yang belum jelas, serta harga yang tidak pasti menampilkan konsultasi tanpa biaya otomatis.

Contoh Brasil, Peru, dan Kolombia dengan hanya satu negara memerlukan visa merupakan skenario pengujian sintetis. Implementasi ini tidak menyatakan bahwa ketentuan tersebut berlaku di dunia nyata.

## Alur admin untuk katalog baru

1. Lengkapi negara di Database Visa: jenis visa, batas tinggal, persyaratan, rujukan, tanggal pemeriksaan, dan harga layanan/variannya.
2. Buat katalog, lalu pilih setiap negara kunjungan dan transit sesuai urutan. Catat hari tinggal.
3. Tentukan apakah bantuan visa ditawarkan, sudah termasuk, ditangani terpisah, atau tidak ditawarkan. Pilih varian bila tersedia lebih dari satu.
4. Periksa ringkasan, kondisi, dan masalah yang ditampilkan. Selesaikan masalah penghalang sebelum publikasi, atau simpan draft.
5. Konfirmasi pemeriksaan, lalu terbitkan. Server memeriksa ulang data yang sama agar konfirmasi lama tidak mengesahkan data yang sudah berubah.

Impor massal dan katalog baru dari skrip Vietnam disimpan sebagai draft. Katalog lama tetap online; perubahan yang tidak menyangkut rute/visa dapat disimpan tanpa memaksa migrasi. Perubahan terkait rute dan publikasi baru memerlukan rencana visa terstruktur.

## Pengaman dan perhitungan

- Satu layanan untuk rute dalam kelompok Schengen. Negara pengajuan mengikuti lama tinggal terbanyak, lalu urutan pertama jika sama. Informasi negara dan kelompok tetap memerlukan rujukan yang benar.
- Batas tinggal gabungan dan kunjungan ulang diperiksa. Keluar lalu kembali ke negara/kelompok mengarah ke pemeriksaan jumlah entri, bukan penawaran single-entry otomatis.
- Visa yang sudah termasuk atau tercatat sebagai komponen tersendiri tidak ditambahkan lagi. Dua biaya manual pada satu kelompok Schengen, atau konflik termasuk/berbayar, menghalangi publikasi.
- Pilihan bantuan default Tidak. Ya dapat ditentukan hanya untuk sebagian peserta. Jumlah pemohon tidak boleh lebih besar dari jumlah peserta.
- Harga paket tetap per orang. Biaya visa ditampilkan terpisah sebagai harga per pemohon × jumlah pemohon, termasuk dalam ringkasan dan pesan WhatsApp. Tidak ada pesan yang dikirim otomatis oleh pengujian.
- PDF memakai penilaian dan kondisi yang sama. Layanan visa yang valid tampil sebagai tambahan opsional per pemohon, bukan bagian total wajib. PDF katalog bukan quotation personal dari pilihan pengunjung.
- Jangka pemeriksaan internal 90 hari adalah kebijakan kesegaran konten, bukan masa berlaku aturan imigrasi. Sistem tidak mengambil atau memperbarui ketentuan imigrasi secara otomatis.

## Data dan kompatibilitas

Tidak ada perubahan skema, migrasi, seed, atau pembaruan data produksi. Metadata tersimpan dalam kolom JSON itinerary yang sudah ada: versi 2 berisi `days` dan `visaPlan`; array lama tetap dapat dibaca. API tetap mengembalikan itinerary berbentuk array dengan visaPlan terpisah. Pembaca website, PDF, pencarian, SEO, dan skrip lokalisasi disesuaikan agar metadata tidak hilang.

POST Database Visa menyimpan varian, persyaratan, dokumen, dan FAQ dalam satu transaksi. PUT mempertahankan varian yang tidak diubah dan menolak ID varian milik negara lain. Mengubah harga tidak menandai ketentuan sebagai telah diverifikasi.

## Verifikasi

- Tes aturan: negara campuran, bebas visa, visa bersyarat, transit, sumber kedaluwarsa, batas tinggal, kelompok Schengen, masuk kembali, harga ambigu, varian, duplikasi biaya.
- Tes route API asli dengan adapter database/auth terisolasi: penolakan publikasi tanpa review, status-only bypass, izin edit, penyimpanan itinerary dan impor draft.
- Browser lokal desktop dan 362 × 814: tiga peserta/satu pemohon, pengurangan jumlah peserta, toggle Tidak, subtotal WhatsApp, perpindahan ke katalog Vietnam, tujuan tak dikenal, tanpa luapan horizontal. Data sintetis; fixture dihapus sebelum commit.
- PDF dari route aktual lokal: Kanada, tiga halaman, logo transparan, harga dasar/tambahan terpisah, kondisi konsultasi tanpa sumber lokal, seluruh halaman dirender dan diperiksa.
- Tidak dilakukan pengiriman inquiry, pesan WhatsApp, atau penyimpanan data admin produksi.

## Perubahan utama

- Aturan dan penyimpanan: `lib/tour-visa-plan.ts`, `lib/tour-visa-assessment.ts`, `lib/tour-visa-publishing.ts`, `lib/tour-visa-data.ts`, `lib/tour-visa-catalog.ts`, `lib/visa-service-input.ts`.
- Admin dan API: `TourVisaPlanEditor`, `TourForm`, route tours dan visa-database.
- Pelanggan: komponen pemilihan kamar/peserta/visa dan booking pada `components/website/clean`, halaman tour dan route PDF.
- Kompatibilitas: pencarian/SEO, tiga skrip katalog, versi unduhan PDF, terjemahan Inggris, serta tes regresi.

## Sebelum produksi

Preview harus ditinjau terlebih dahulu. Admin perlu memeriksa data visa negara yang akan dijual dan melengkapi rencana negara pada katalog lama secara bertahap. Sumber, tanggal pemeriksaan, lama tinggal, visa yang sudah dimiliki, jenis paspor, dan jumlah entri tetap perlu pemeriksaan manusia. Tidak ada klaim bahwa semua persyaratan visa dunia telah terverifikasi.
