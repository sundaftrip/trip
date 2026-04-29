# Panduan CMS — SUNDAF TRIP

Semua konten website ini di-control dari **Google Sheets**. Edit sheet → refresh website → muncul.
Tidak perlu lagi "Publish to web" seperti versi lama.

> **Master sheet:**
> https://docs.google.com/spreadsheets/d/1QjwJW1tTxbLUvKfFCvLkT8ACH_ptu2gfTIZDujHDUek/edit

---

## 1. Sekali setup — share spreadsheet

Klik **Share** di Google Sheets → ubah ke **"Anyone with the link — Viewer"**.
Cukup sekali. Setelah ini setiap edit sheet langsung terbaca website (tanpa rebuild, tanpa publish).

---

## 2. Tab yang harus ada

Buat tab dengan nama persis seperti ini (huruf kecil semua):

| Tab                  | Fungsi                                              |
| -------------------- | --------------------------------------------------- |
| `packages`           | Katalog paket wisata                                |
| `addons`             | Layanan tambahan (insurance, visa, dll)             |
| `text`               | Teks UI yang bisa diedit (hero, payment, dll)       |
| `blog`               | Artikel blog                                        |
| `receipts`           | Database receipt / invoice                          |
| `terms_conditions`   | T&C, FAQ, dan testimonial (reusable, satu sheet)    |

---

## 3. Tab `packages` — kolom

Header (baris 1), urutan boleh dibalik. Yang penting nama kolom persis sama.

| Kolom              | Contoh                                              | Catatan                                                              |
| ------------------ | --------------------------------------------------- | -------------------------------------------------------------------- |
| `id`               | `russia-2026`                                       | Wajib. Dipakai di URL `/trip/?id=russia-2026`                        |
| `title`            | `Russia Spring 9D`                                  | Wajib                                                                |
| `country`          | `Russia`                                            |                                                                      |
| `flag`             | `🇷🇺`                                                | Emoji bendera                                                        |
| `category`         | `europe`                                            | `asia` / `europe` / `america` / `africa` / `oceania`                |
| `duration`         | `9D 8N`                                             |                                                                      |
| `trip_date`        | `15 - 23 Apr 2026`                                  |                                                                      |
| `price`            | `28500000`                                          | **Harga Full Package** (termasuk tiket internasional)                |
| `price_land_tour`  | `19500000`                                          | **Harga Land Tour** (tanpa tiket internasional). Kosong = tipe ini disembunyikan. |
| `promo_price`      | `25500000`                                          | Promo aktif untuk Full Package. Harga normal di-coret + badge PROMO. |
| `seats_left`       | `3`                                                 | ≤ 5 → badge merah "🔥 Sisa N seat"                                    |
| `seats_total`      | `15`                                                | (catatan internal)                                                   |
| `badge`            | `Best Seller`                                       | Badge custom kalau tidak promo                                       |
| `status`           | `sold-out` / `past` / kosong                        | `past` & `sold-out` → kartu otomatis hitam-putih + di bagian bawah  |
| `hero_img`         | URL gambar                                          | Bisa Unsplash, Imgur, GitHub raw                                     |
| `gallery`          | URL1\nURL2\nURL3                                    | Pisah baris baru atau `;` atau `\|`                                  |
| `city_highlight`   | `Moscow, St. Petersburg, Sergiev Posad`             | Tampil di kartu katalog                                              |
| `halal`            | `yes`                                               | `yes` → chip "🕌 Halal Friendly" di kartu                             |
| `story`            | (1-2 paragraf storytelling)                         | Tampil di awal halaman detail. Casual, tidak corporate.              |
| `highlights`       | `Red Square, Hermitage, Volga River cruise`         | Tagline pendek 1 baris                                               |
| `itinerary`        | (lihat di bawah)                                    | Timeline visual di halaman detail                                    |
| `hotel`            | (deskripsi akomodasi)                               | Section "Akomodasi"                                                  |
| `inclusions`       | (list pisah baris)                                  | Section "Termasuk"                                                   |
| `exclusions`       | (list pisah baris)                                  | Section "Tidak Termasuk"                                             |
| `visa_info`        | (penjelasan visa & paspor)                          | Section "Info Visa & Paspor"                                         |
| `notes`            | catatan internal                                    | (tidak tampil)                                                       |

### Format kolom multi-baris (`itinerary`, `inclusions`, `exclusions`, `gallery`, `hotel`, `visa_info`)

Pisah tiap item dengan **Alt+Enter** (baris baru di dalam sel) atau tanda `;` atau `|`:

```
Tiba di Moscow, transfer ke hotel
City tour: Red Square, Kremlin, Bolshoi
Free day, optional Sergiev Posad
Sapsan train ke St. Petersburg
Hermitage Museum & Peterhof
…
```

Sistem otomatis nomor jadi "Hari 1", "Hari 2", dst untuk itinerary; jadi bullet list untuk inclusions/exclusions.

---

## 4. Tab `addons` — kolom

| Kolom         | Contoh                                  | Catatan                                                             |
| ------------- | --------------------------------------- | ------------------------------------------------------------------- |
| `package_id`  | `russia-2026` / `*` / kosong            | `*` atau kosong = tampil di semua paket. Diisi spesifik = hanya itu. |
| `name`        | `Asuransi Perjalanan`                   |                                                                     |
| `price`       | `150000`                                |                                                                     |
| `description` | `Cover medical & lost luggage hingga $50k` |                                                                  |

---

## 5. Tab `text` — UI text yang bisa diedit

Cuma 2 kolom: `key` dan `value`.

### Hero & marketing copy

| key             | contoh value                                                                            |
| --------------- | --------------------------------------------------------------------------------------- |
| `hero_eyebrow`  | `Adventure · Culture · Experience`                                                      |
| `hero_title`    | `#SemuaBisaJalan`                                                                       |
| `hero_subtitle` | `Diajak jalan, diajak seru-seruan, pulang bawa cerita yang gak bakal habis buat diceritain` |
| `hero_btn`      | `Lihat Paket Wisata`                                                                    |

### "Kenapa kami" (4 cards)

| key             | contoh value                                  |
| --------------- | --------------------------------------------- |
| `why_1_title`   | `Tiket & Akomodasi`                           |
| `why_1_desc`    | …                                             |
| `why_2_title`   | …                                             |
| `why_2_desc`    | …                                             |
| `why_3_title`   | …                                             |
| `why_3_desc`    | …                                             |
| `why_4_title`   | …                                             |
| `why_4_desc`    | …                                             |

### About section

| key            | contoh value                |
| -------------- | --------------------------- |
| `about_title`  | `CV SUNDAF HOLIDAY GROUP`   |
| `about_desc_1` | …                           |
| `about_desc_2` | …                           |

### Contact CTA

| key             | contoh value                            |
| --------------- | --------------------------------------- |
| `contact_title` | `Siap berangkat?`                       |
| `contact_desc`  | `Konsultasi gratis, tanpa syarat…`      |

### Pembayaran (dipakai di booking step 4 & receipt)

| key                    | contoh value                  |
| ---------------------- | ----------------------------- |
| `payment_bank_name`    | `BCA`                         |
| `payment_bank_acc`     | `1234567890`                  |
| `payment_bank_holder`  | `CV SUNDAF HOLIDAY GROUP`     |

> Cara cek key apa saja yang dipakai: buka inspector di browser (F12) → cari `data-cms="..."` di HTML.

---

## 6. Tab `terms_conditions` — testimoni, FAQ, dan T&C

Satu tab, satu logika. Pakai kolom `type` untuk membedakan.

| Kolom     | Contoh                                  | Catatan                                                             |
| --------- | --------------------------------------- | ------------------------------------------------------------------- |
| `pkg_id`  | `russia-2026` / `*` / kosong            | `*` atau kosong = tampil di SEMUA paket (global). Diisi spesifik = hanya paket itu. |
| `type`    | `testimonial` / `faq` / `tnc`           | Wajib (huruf kecil semua)                                           |
| `name`    | `Pak Budi` (testimoni) / `Apa saja yang termasuk?` (FAQ) / `Pembatalan` (T&C judul) |                                                                     |
| `content` | isi text utama                          | Untuk testimonial: kalimat review. Untuk FAQ: jawaban. Untuk T&C: paragraf.       |
| `stars`   | `5`                                     | Hanya untuk `testimonial`. Skala 1-5.                               |
| `photo`   | URL avatar                              | Hanya untuk `testimonial`                                           |
| `extra`   | `Russia Spring 2025`                    | Hanya untuk `testimonial` (sub-info: trip ikut yang mana)           |

### Contoh

```
pkg_id          type          name                            content                                                stars  photo               extra
*               tnc           Pembatalan                      Pembatalan H-30 dapat refund 70%, H-15 50%, …                                       
*               tnc           Force Majeure                   Trip dapat ditunda/diganti karena situasi …                                          
russia-2026     tnc           Visa Russia                     Wajib paspor min. 12 bulan masa berlaku …                                            
*               faq           Apakah saya butuh visa?         Tergantung destinasi. Tim akan bantu proses …                                         
*               faq           Bisa cicil?                     Bisa, DP 30%, lunas H-30. Detail di booking step.                                   
russia-2026     testimonial   Pak Budi & Bu Ani               Trip-nya seru banget, guidenya sabar & lucu …          5      https://...avatar    Russia Spring 2025
*               testimonial   Sarah                            Pertama kali ke Eropa pakai SUNDAF, gak nyesel.        5      https://...avatar    Eropa 2024
```

### Logika

- Halaman detail paket akan menampilkan T&C, FAQ, testimonial dengan `pkg_id = "*"` (global) **DAN** `pkg_id = id paket tersebut`.
- Mau berlaku ke semua paket? Pakai `*` di `pkg_id`.
- Mau spesifik? Tulis ID paketnya.

---

## 7. Tab `receipts` — untuk cetak receipt

Setiap kali ada booking yang dikonfirmasi, isi 1 baris di tab ini. Halaman receipt
(`/receipt/?inv=INV-XXX`) otomatis tarik datanya.

| Kolom     | Contoh                                  | Catatan                                                  |
| --------- | --------------------------------------- | -------------------------------------------------------- |
| `inv`     | `INV-12345678`                          | Nomor invoice unik                                       |
| `date`    | `28 Apr 2026`                           |                                                          |
| `name`    | `Budi Hartono`                          |                                                          |
| `contact` | `0817...` atau `0817... · email@x.com`  |                                                          |
| `package` | `Russia Spring 9D`                      |                                                          |
| `qty`     | `2`                                     |                                                          |
| `price`   | `25500000`                              | Harga / orang                                            |
| `addons`  | `Asuransi:150000; Visa:1500000`         | Pisah dengan `;`. Format: `Nama:Harga`                   |
| `total`   | `54300000`                              | Override total kalau diisi                               |
| `paid`    | `10000000`                              | Down payment yang sudah masuk                            |
| `status`  | `LUNAS` / `DP` / `PENDING` / `CANCEL`   | Bebas, tampil di badge                                   |
| `notes`   | catatan tambahan                        |                                                          |

Kasih link `https://sundaftrip.com/receipt/?inv=INV-12345678` ke customer → otomatis tampil.

---

## 8. Tab `blog` — kolom

| Kolom       | Contoh                                          |
| ----------- | ----------------------------------------------- |
| `slug`      | `tips-aurora-2026`                              |
| `title`     | `5 Tips Berburu Aurora di Murmansk`             |
| `excerpt`   | (1-2 kalimat)                                   |
| `cover`     | URL gambar                                      |
| `category`  | `Tips` / `Stories` / `Update`                   |
| `date`      | `2026-04-15`                                    |
| `author`    | `Tim SUNDAF`                                    |
| `read_time` | `5 menit`                                       |
| `body`      | isi artikel                                     |

---

## 9. Workflow harian

| Mau ngapain                    | Caranya                                                      |
| ------------------------------ | ------------------------------------------------------------ |
| Ganti harga                    | Edit kolom `price` / `promo_price` / `price_land_tour`       |
| Buat promo dadakan             | Isi `promo_price` lebih murah dari `price` → badge PROMO auto |
| Tutup paket                    | Isi `status` = `sold-out` → kartu auto grayscale + ke bawah  |
| Trip sudah selesai             | Isi `status` = `past` → kartu portfolio (grayscale, ke bawah) |
| Update sisa kursi              | Isi `seats_left` → ≤ 5 jadi badge merah                      |
| Tambah testimonial             | Tambah baris di `terms_conditions` dengan `type=testimonial` |
| Tambah FAQ                     | Tambah baris di `terms_conditions` dengan `type=faq`         |
| Update T&C                     | Edit baris `terms_conditions` dengan `type=tnc`              |
| Ganti rekening pembayaran      | Edit `payment_bank_*` di tab `text`                          |

---

## 10. Sort katalog

Otomatis:

1. **Active trips** (paling atas, urut tahun terbesar)
2. **Past trips** (greyscale, untuk inspirasi/portfolio)
3. **Sold out** (greyscale, paling bawah)

---

## 11. Logo

Source: <https://raw.githubusercontent.com/sundaftrip/SUNDAF/main/sundaf-logo.png>

Dipakai di:

- Header semua halaman (kecil, 18-20px)
- Header invoice (40×40px) & receipt (56×56px)

Untuk ganti logo: replace file `sundaf-logo.png` di repo `sundaftrip/SUNDAF` di GitHub.
Tidak perlu rebuild website.

---

## 12. Debugging

Kalau data tidak muncul:

1. F12 → Console → cari `[SUNDAF]` log.
2. `Packages: 0` → tab packages kosong, atau header kolom tidak match.
3. Cek share spreadsheet → harus **"Anyone with the link — Viewer"**.
4. Sistem otomatis fallback ke published-CSV mode kalau GViz gagal.
