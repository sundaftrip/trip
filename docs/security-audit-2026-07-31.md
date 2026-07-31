# Audit Keamanan Sundaf Trip — 31 Juli 2026

## Keputusan rilis

**[Certain] Status: hardening kode siap masuk proses review, tetapi belum setara pentest atau sertifikasi keamanan.**

[Certain] Perubahan ini menutup beberapa celah berisiko tinggi yang ditemukan pada kode, terutama kebocoran token pelaporan biaya, otorisasi yang mempercayai sesi lama, render konten aktif, pengambilan URL eksternal, unggahan, cron, dan token katalog B2B. Rilis tetap memiliki tiga kewajiban operasional: rotasi seluruh token biaya lama, pemasangan secret produksi yang kuat dan terpisah, serta kesiapan meminta admin login ulang.

## Ruang lingkup dan metode

[Certain] Audit dilakukan melalui review kode dan pengujian lokal atas:

- autentikasi, sesi, izin admin, dan batas data publik;
- API tour, keuangan, receipt, blog, GEO page, FAQ, settings, cron, dan B2B;
- sanitasi HTML, serialisasi JSON-LD, URL eksternal, gambar PDF, dan unggahan;
- dependency produksi berdasarkan lockfile;
- tes regresi keamanan yang ditambahkan di branch ini.

[Certain] Audit ini **bukan pentest penuh**. Audit tidak mencakup serangan black-box ke produksi, konfigurasi cloud/WAF/CDN, kontrol database dan backup, akun pihak ketiga, isi secret produksi, malware scanning eksternal, social engineering, atau pemeriksaan perangkat admin. Temuan “diperbaiki” di bawah berarti diperbaiki pada kode yang direview, bukan jaminan bahwa seluruh sistem bebas celah.

## Perbaikan yang telah diverifikasi

| Area | Status | Bukti dan dampak |
|---|---|---|
| Token biaya tour | [Certain] Diperbaiki | Endpoint baca tour memakai daftar field eksplisit dan tidak lagi mengirim `expenseToken`, termasuk kepada pemanggil anonim. Data publik juga dibatasi ke tour berstatus publik. |
| Sesi dan pencabutan akses | [Certain] Diperbaiki | Sesi kini membawa versi berdasarkan `User.updatedAt`, lalu memuat ulang user dari database pada setiap pemeriksaan. User yang dihapus, sesi lama tanpa versi, perubahan versi, dan kegagalan lookup ditolak secara fail-closed. Role pada cookie tidak lagi menjadi sumber kebenaran. |
| Otorisasi tersimpan | [Certain] Diperbaiki untuk cakupan utama | Pemeriksaan izin mengambil user dan izin terbaru dari database. Akses keuangan dan receipt dibatasi dengan izin lihat/buat/edit/hapus yang sesuai. Mutasi blog dan GEO membedakan izin edit dan publish. Draft blog/GEO serta mode FAQ lengkap tidak tersedia bagi publik. |
| HTML dan JSON-LD | [Certain] Diperbaiki | Rich HTML melewati allowlist sanitizer. JSON-LD diserialisasi dengan karakter berbahaya untuk konteks `<script>` di-escape. Implementasi digunakan pada halaman dinamis yang direview. |
| SSRF dan gambar PDF | [Certain] Diperkeras | URL eksternal dibatasi ke HTTP(S), port standar, host publik, DNS tervalidasi, redirect yang divalidasi ulang, timeout, dan batas ukuran. Gambar PDF dibatasi pada host yang disetujui, JPEG/PNG, ukuran file, dimensi, jumlah piksel, hasil decode, serta jumlah gambar. Ini mengurangi risiko SSRF dan resource exhaustion; bukan klaim bahwa seluruh SSRF mustahil. |
| Cron | [Certain] Diperbaiki | Cron menolak request jika secret konfigurasi kosong/tidak ada, mewajibkan Bearer token, dan membandingkan nilai secara timing-safe. |
| Settings publik | [Certain] Diperbaiki | Hanya key yang masuk allowlist yang dapat dibaca publik; `company_address` tidak termasuk. Key yang tampak seperti secret disaring, sedangkan akses lengkap memerlukan user tersimpan dan response private/no-store. |
| Katalog B2B | [Certain] Diperkeras | Cookie katalog memakai token HMAC bertanda tangan, memiliki waktu terbit dan kedaluwarsa maksimum 30 hari, terkait ke ID password aktif, serta fail-closed ketika secret tidak tersedia. Cookie memakai `HttpOnly`, `Secure` di produksi, dan `SameSite=Lax`. |
| Unggahan | [Certain] Diperkeras | Request dan file memiliki batas ukuran; folder dibatasi; data URI harus kanonis; tipe JPEG/PNG/WebP diperiksa melalui MIME dan magic bytes. Body tetap dibatasi walau `Content-Length` tidak tersedia. |
| Dependency produksi | [Certain] Bersih pada lockfile yang diaudit | `npm audit --omit=dev` melaporkan 0 vulnerability produksi pada 31 Juli 2026. Override dan pembaruan dependency keamanan tercatat di `package.json`/lockfile. |

## Wajib dilakukan setelah merge dan sebelum membuka trafik

[Certain] Tiga langkah berikut adalah **release blocker**, bukan pekerjaan opsional.

1. **Rotasi seluruh `Tour.expenseToken` lama.**

   [Certain] Token tersebut sebelumnya dapat keluar melalui API baca publik sehingga semua nilai lama harus dianggap terekspos. Rotasi harus mencakup **semua record dengan token non-null**, bukan hanya trip aktif. Gunakan generator kriptografis dengan nilai unik per tour, jangan menulis token ke log, lalu kirim ulang link baru hanya kepada petugas yang masih memerlukannya. Setelah rotasi, verifikasi bahwa setiap URL lama ditolak.

2. **Pasang secret produksi yang kuat dan terpisah.**

   [Certain] Isi `AUTH_SECRET`, `CRON_SECRET`, dan `B2B_CATALOG_SECRET` dengan nilai acak independen minimal 32 byte dari secret manager. Jangan memakai contoh `.env`, jangan menggunakan satu nilai untuk beberapa fungsi, dan jangan menyimpan nilainya di repository, tiket, chat, atau log. Dedicated `B2B_CATALOG_SECRET` wajib dipakai meski kode memiliki fallback kompatibilitas.

3. **Siapkan komunikasi login ulang.**

   [Certain] Sesi lama yang tidak memiliki `sessionVersion` akan ditolak. Mengganti `AUTH_SECRET` juga mencabut seluruh sesi, dan perubahan pada record user yang memperbarui `updatedAt` mencabut sesi user tersebut. Admin harus login ulang setelah deploy; siapkan akses pemulihan untuk SUPERADMIN sebelum rotasi secret.

## Risiko residual dan pekerjaan lanjutan

| Prioritas | Risiko residual | Tindakan yang disarankan |
|---|---|---|
| Tinggi | [Certain] Rate limiter saat ini berada di memori per instance, sehingga tidak konsisten pada deployment multi-instance. Login admin belum memiliki rate limit terdistribusi dan MFA. | Gunakan limiter terpusat, misalnya Redis/Upstash, tambahkan throttling login berbasis akun+IP, alert brute force, dan MFA untuk admin. |
| Tinggi | [Certain] Sejumlah aksi referral, partner, lead, commission, dan dispute masih menerima semua user yang berhasil login tanpa izin fitur yang spesifik. | Tambahkan permission keys per domain dan terapkan least privilege pada setiap action/API sebelum memperluas jumlah akun admin. |
| Tinggi | [Certain] Dashboard partner menggunakan bearer token di query string. | Tukar token bootstrap satu kali menjadi cookie `HttpOnly`, lalu hapus token dari URL. Rotasi token yang pernah masuk history, analytics, log, referrer, atau link yang dibagikan. |
| Sedang | [Certain] `expenseToken` tetap berupa bearer capability. Untuk tour tanpa tanggal, pemeriksaan saat ini dapat membuatnya aktif tanpa batas; endpoint juga belum memiliki rate limit terdistribusi. | Tambahkan kedaluwarsa eksplisit yang tidak bergantung pada tanggal trip, rotasi berkala, rate limit, dan audit penggunaan token. |
| Sedang | [Certain] Mengubah hash password pada record B2B yang sama tidak otomatis mencabut cookie bertanda tangan yang sudah terbit; cookie dapat berlaku sampai 30 hari selama record tetap aktif. | Saat rotasi password, nonaktifkan/ganti record ID atau rotasi `B2B_CATALOG_SECRET`; pertimbangkan `tokenVersion` dan masa berlaku yang lebih pendek. |
| Sedang | [Certain] Unggahan umum memeriksa batas, MIME, dan signature, tetapi belum menjalankan antivirus atau decode gambar penuh sebelum penyimpanan. | Decode dan re-encode gambar di worker terisolasi, hapus metadata, jalankan malware scan bila alur menerima file tidak tepercaya, dan pantau kegagalan/abuse. |
| Sedang | [Certain] Audit dependency penuh masih melaporkan 9 temuan high pada rantai tooling development, tanpa critical; audit produksi melaporkan 0. | Pantau rilis ESLint/minimatch/brace-expansion yang kompatibel, perbarui tanpa menurunkan toolchain secara paksa, dan jalankan audit penuh di CI. |

## Gerbang verifikasi rilis

[Certain] Jalankan kembali pemeriksaan berikut pada commit final setelah penyelesaian konflik merge:

```bash
npm test
npm run build
npm audit --omit=dev
npm audit
```

[Certain] Pada snapshot audit ini, seluruh 111 tes lokal lulus. Acceptance minimum pada commit final: seluruh tes tetap lulus, build produksi berhasil, audit dependency produksi tetap 0, response GET tour tidak mengandung `expenseToken`, token lama sudah tidak berlaku, cron tanpa secret ditolak, dan admin dapat login kembali dengan secret produksi baru.

[Likely] Setelah rilis, lakukan pentest terautentikasi dan review infrastruktur terpisah. Review tersebut diperlukan untuk memeriksa kontrol yang tidak dapat dibuktikan hanya dari source code.
