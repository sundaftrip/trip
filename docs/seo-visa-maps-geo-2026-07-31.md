# Handoff SEO, Google Maps, dan GEO Visa — 31 Juli 2026

## Hasil yang realistis

**[Certain] Tidak ada perubahan website yang dapat menjamin Sundaf Trip muncul pertama saat orang mencari “jasa pembuatan visa” di Google Maps, Google Search, atau jawaban AI.**

[Certain] Website kini memberi Google dan mesin AI sinyal yang lebih konsisten: satu halaman layanan visa kanonis, tautan internal, metadata, schema `Service`, sitemap, dan deskripsi brand faktual. [Certain] Menurut dokumentasi Google, ranking lokal terutama ditentukan oleh relevansi, jarak, dan prominence; website hanya memengaruhi sebagian sinyal tersebut. [Likely] Perubahan ini meningkatkan peluang mesin pencari memahami bahwa Sundaf Trip menyediakan layanan pengurusan visa untuk WNI, tetapi hasil aktual tetap bergantung pada kompetisi, lokasi pencari, reputasi, ulasan, dan waktu crawl/indexing.

## Implementasi yang telah diverifikasi

| Area | Status | Implementasi |
|---|---|---|
| Halaman layanan utama | [Certain] Selesai | `/jasa-urus-visa-terpercaya` menjadi halaman kanonis dengan judul “Jasa Pembuatan Visa untuk WNI”, penjelasan proses, biaya, batas tanggung jawab, cakupan Indonesia, dan CTA konsultasi. |
| URL lama | [Certain] Selesai | `/jasa-pembuatan-visa` diarahkan permanen ke halaman kanonis. Alias tidak dibuat sebagai halaman duplikat. |
| Tautan internal | [Certain] Selesai | Landing visa menautkan CTA “Jasa pembuatan visa” ke halaman kanonis. Halaman kanonis juga tercantum dalam sitemap. |
| Structured data | [Certain] Selesai | Halaman layanan menggunakan schema `Service` dengan provider Sundaf Trip, audience WNI, area layanan Indonesia, dan kanal online. Schema organisasi tidak mengklaim alamat, koordinat, jam kantor, atau kantor walk-in. |
| Konten faktual untuk AI/GEO | [Certain] Selesai | `llms.txt` dan `llms-full.txt` menjelaskan layanan secara faktual, menautkan sumber resmi, dan tidak mengklaim peringkat atau rekomendasi. File ini bersifat pelengkap; HTML yang dapat dirayapi tetap sumber utama. |
| Klaim model layanan | [Certain] Selesai pada kode yang direview | Halaman publik yang direview menyatakan layanan online/tanpa kantor walk-in. Halaman kontak hanya menawarkan WhatsApp/email; alur paspor fisik menggunakan pengaturan kurir tepercaya, bukan kunjungan ke kantor Sundaf Trip. |

## Guardrail Google Business Profile

[Certain] PR ini **tidak mengubah Google Business Profile**. Tidak ada perubahan nama bisnis, alamat, visibilitas alamat, pin, kategori, service area, jam buka, atau atribut profil melalui akun Google.

[Certain] Sesuai batas yang ditetapkan pemilik bisnis, jangan menambahkan alamat publik, kantor fiktif, virtual office, atau klaim bahwa pelanggan dapat datang ke kantor. Setiap perubahan Google Business Profile di masa depan harus menjadi pekerjaan terpisah dan mendapat persetujuan eksplisit karena dapat memicu pemeriksaan atau verifikasi ulang.

[Certain] Website dan schema juga tidak boleh berbeda dari kondisi bisnis nyata. Karena Sundaf Trip beroperasi sebagai layanan online/service-area tanpa kantor walk-in, schema `Service` dan `Organization` tanpa alamat publik adalah pendekatan yang lebih aman daripada memaksakan `LocalBusiness` dengan lokasi yang tidak melayani pelanggan.

## Langkah aman setelah merge

[Certain] Langkah berikut tidak menyentuh Google Business Profile:

1. [Certain] Deploy, lalu pastikan halaman kanonis memberi response 200 dan `/jasa-pembuatan-visa` mengarah permanen hanya ke satu tujuan.
2. [Certain] Periksa canonical tag, metadata, schema, CTA internal, dan pastikan tidak ada klaim kantor/alamat publik yang muncul kembali setelah penyelesaian konflik.
3. [Certain] Buka Google Search Console, inspeksi `https://sundaftrip.com/jasa-urus-visa-terpercaya`, uji URL live, lalu minta indexing untuk URL kanonis tersebut—bukan URL alias.
4. [Certain] Kirim ulang `https://sundaftrip.com/sitemap.xml` di Search Console setelah deploy dan pastikan URL kanonis tercantum.
5. [Likely] Pantau selama 4–12 minggu: status indexing, impressions, clicks, CTR, dan query seperti “jasa pembuatan visa”, “jasa urus visa”, serta variasi negara. Bandingkan sebelum/sesudah tanpa menganggap fluktuasi singkat sebagai hasil final.
6. [Likely] Bangun prominence secara aman melalui ulasan pelanggan yang autentik, penyebutan brand dari situs relevan, konten visa yang akurat, dan konsistensi nama/telepon/URL pada kanal milik sendiri—tanpa mengubah profil Google dalam PR ini.

## Yang harus dihindari

- [Certain] Jangan membuat halaman kota massal dengan isi hampir sama hanya untuk menangkap query lokal. Google mengategorikan pola doorway sebagai spam.
- [Certain] Jangan menambahkan alamat palsu, virtual office, pin, atau kata “kantor” jika pelanggan tidak dilayani di lokasi tersebut.
- [Certain] Jangan melakukan keyword stuffing, membuat ulasan palsu, atau menambahkan schema yang tidak terlihat dan tidak didukung isi halaman.
- [Certain] Jangan mengklaim “nomor 1”, “paling direkomendasikan Google/AI”, atau “pasti muncul di Maps”.
- [Certain] Jangan menggunakan `llms.txt` sebagai pengganti SEO teknis, konten HTML, sitemap, dan bukti reputasi. Google menyatakan tidak diperlukan file atau markup AI khusus agar situs dipertimbangkan untuk fitur AI Search.

## Urutan merge dengan PR #34

[Certain] PR [#34 — fix: tighten SEO metadata and service-area schema](https://github.com/sundaftrip/trip/pull/34) masih terbuka dan menyentuh beberapa file yang sama dengan perubahan ini.

Urutan yang disarankan:

1. [Certain] Merge PR #34 lebih dulu.
2. [Certain] Rebase/update branch PR keamanan + visa SEO ini di atas `main` terbaru.
3. [Certain] Selesaikan konflik dengan mempertahankan hardening keamanan, halaman visa kanonis, schema tanpa alamat publik, dan copy tanpa kantor walk-in.
4. [Certain] Jalankan ulang tes SEO/keamanan, build produksi, audit dependency, serta pemeriksaan manual halaman sebelum merge PR kedua.

[Likely] Membalik urutan tanpa rekonsiliasi file dapat mengembalikan metadata/schema lama atau menghapus hardening yang baru.

## Acceptance criteria PR kedua

- [Certain] Halaman kanonis 200, self-canonical, dan berada di sitemap.
- [Certain] Alias lama redirect permanen ke halaman kanonis.
- [Certain] CTA internal menuju halaman kanonis.
- [Certain] Schema `Service` cocok dengan teks yang terlihat dan tidak memuat alamat/geo/jam kantor.
- [Certain] Tidak ada copy publik yang mengarahkan pelanggan ke kantor Sundaf Trip.
- [Certain] Tidak ada mutasi Google Business Profile.
- [Certain] Tes `seo-visa-service` dan build produksi lulus setelah merge conflict diselesaikan.

[Certain] Ranking Maps/Search/GEO bukan acceptance criterion karena tidak dapat dikendalikan atau dijamin oleh satu deploy.

## Referensi resmi

- [Google Business Profile: tips meningkatkan ranking lokal](https://support.google.com/business/answer/7091?hl=id)
- [Google Business Profile: service area](https://support.google.com/business/answer/9157481?hl=id)
- [Google Business Profile: pedoman representasi bisnis](https://support.google.com/business/answer/3038177?hl=en)
- [Google Search: kebijakan doorway abuse](https://developers.google.com/search/docs/essentials/spam-policies#doorway-abuse)
- [Google Search: Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google Search: LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google Search: AI features dan website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google Search: panduan optimasi untuk AI search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [OpenAI: publisher and developer FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)
