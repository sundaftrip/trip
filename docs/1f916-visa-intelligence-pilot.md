# Pilot Sundaf Visa Intelligence untuk 1F916

## Status dan batas otorisasi

**Status: preview only. Belum diluncurkan.**

- Dokumen ini adalah bahan review internal, bukan instruksi publikasi.
- Belum ada izin untuk mendaftarkan agent Sundaf Trip di 1F916.
- Belum ada izin untuk menerbitkan post, komentar, balasan, atau pesan di 1F916.
- Ruang diskusi visa sudah dihapus dari website dan CMS (Oktober 2026). Bagian diskusi di bawah ini hanya arsip keputusan; tabel lama tetap ada di database.
- Publikasi atau pendaftaran hanya boleh dilakukan setelah persetujuan terpisah dan eksplisit atas payload final. Perubahan material setelah persetujuan memerlukan preview dan persetujuan baru.

## Tujuan pilot

Pilot ini menguji apakah halaman visa yang transparan, dapat dibaca manusia dan mesin, serta dilengkapi diskusi manusia yang dimoderasi dapat menarik pengunjung relevan dan memperoleh rujukan independen.

Kunjungan dan komentar mentah **tidak secara langsung menciptakan PageRank**. Google menjelaskan bahwa PageRank bekerja melalui analisis tautan dan merupakan satu dari banyak sistem/sinyal pemeringkatan. Karena itu, nilai SEO pilot harus dicari melalui konten yang berguna, rujukan atau backlink yang diperoleh secara wajar, keterlibatan manusia yang bermakna, dan perbaikan kualitas data—bukan sekadar menambah hit atau jumlah komentar. Rujukan: [Google Search ranking systems](https://developers.google.com/search/docs/appearance/ranking-systems-guide) dan [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

## URL kampanye yang diajukan

Gunakan satu URL ini pada payload final agar atribusi konsisten:

```text
https://sundaftrip.com/visa-intelligence?utm_source=1f916&utm_medium=agent_community&utm_campaign=visa_intelligence_pilot&utm_content=launch_post
```

Endpoint yang tersedia pada implementasi pilot:

- Halaman manusia: `https://sundaftrip.com/visa-intelligence`
- Dataset JSON: `https://sundaftrip.com/visa-intelligence/data.json`
- Feed RSS: `https://sundaftrip.com/visa-intelligence/feed.xml`
- Discovery untuk LLM: `https://sundaftrip.com/llms.txt`

Atribusi kampanye mengandalkan parameter UTM di atas. Event yang tersedia untuk evaluasi mencakup kunjungan dari 1F916, interaksi pertama, klik feed, klik rujukan tersimpan, dan klik koreksi.

## Kontrak kejujuran data

Sundaf Visa Intelligence adalah **snapshot status yang sedang tersimpan di database Sundaf Trip**, bukan sumber pemerintah dan bukan log perubahan resmi.

- `generated_at` menunjukkan kapan snapshot dihasilkan.
- `database_updated_at` menunjukkan waktu pembaruan record database, bukan tanggal aturan pemerintah mulai berlaku.
- `last_checked_at`, bila tersedia, adalah tanggal pemeriksaan internal, bukan tanggal efektif kebijakan.
- Tautan pada `source.url` diklasifikasikan sebagai `stored_reference`. Keberadaan tautan tidak membuktikan bahwa sumber tersebut resmi, masih aktif, lengkap, atau mutakhir.
- Cakupan sumber dan tanggal pemeriksaan dapat tidak lengkap.
- Snapshot tidak menyediakan histori perubahan atau koreksi yang lengkap.
- Informasi bersifat informasional, bukan nasihat hukum atau imigrasi.
- Pelancong tetap harus memeriksa ketentuan terbaru kepada pemerintah terkait, kedutaan/konsulat, penyedia layanan aplikasi, dan maskapai sebelum berangkat.

Jangan mengubah batasan ini menjadi klaim seperti “data resmi”, “selalu terbaru”, “terverifikasi pemerintah”, atau “termurah/terlengkap di pasar”.

## Diskusi manusia (dihapus)

Ruang diskusi, API `/api/visa-discussions`, dan moderasi `/admin/visa-discussions` dihapus pada Oktober 2026 agar CMS lebih sederhana. Koreksi data tetap masuk lewat tombol WhatsApp di halaman. Model `VisaDiscussion` dan `VisaDiscussionReport` tetap di schema sebagai arsip data. Bila diskusi publik ingin dibuka lagi, mulai dari desain baru beserta moderasi, kebijakan privasi, dan persetujuan terpisah.

## Aturan distribusi dan integritas

Pilot melarang:

- bot pengunjung, auto-refresh, click farm, traffic exchange, atau kunjungan otomatis yang disamarkan sebagai manusia;
- pembelian traffic, komentar, reaksi, backlink, atau mention;
- spam link, komentar massal, keyword stuffing, atau posting berulang;
- akun palsu, testimoni palsu, pertanyaan palsu, percakapan sintetis, atau balasan staf yang disamarkan sebagai komunitas;
- pertukaran tautan yang tujuan utamanya memanipulasi peringkat;
- klaim “berhasil meningkatkan PageRank” hanya karena sessions, pageviews, atau komentar bertambah.

Google menyebut pembuatan atau pembelian tautan yang terutama bertujuan memanipulasi peringkat sebagai link spam. Rujukan: [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies).

Aktivitas pemeriksaan internal dan monitoring harus disaring dari laporan bila memungkinkan. Keputusan pilot menggunakan pengunjung unik dan tindakan bermakna, bukan pageview berulang.

## Target 30 hari yang diajukan

Angka berikut adalah **decision gates yang diusulkan**, bukan proyeksi, jaminan traffic, atau jaminan peringkat. Periode 30 hari baru dimulai setelah publikasi eksplisit disetujui dan URL kampanye dilepas.

| Gerbang | Target yang diusulkan | Bukti | Keputusan |
|---|---:|---|---|
| Kunjungan berkualitas | Minimal 100 pengguna unik teratribusi 1F916; minimal 25% menghasilkan `onef916_interaction` | GA4 berdasarkan pengguna, UTM, dan event | Menunjukkan distribusi menjangkau manusia yang benar-benar berinteraksi, bukan hit kosong |
| Pemakaian data | Minimal 15 pengguna unik membuka rujukan tersimpan, JSON/RSS, atau kanal koreksi | Event klik per pengguna | Menunjukkan halaman dipakai untuk mengecek data atau melakukan tindak lanjut |
| Nilai komunitas | Minimal 5 pertanyaan/balasan substantif yang disetujui dari minimal 3 kontributor berbeda | Antrean moderasi dan record terbit | Menunjukkan diskusi menambah konteks; komentar singkat, duplikat, atau promosi tidak dihitung |
| Rujukan independen | Minimal 3 mention atau tautan editorial dari pihak relevan yang tidak dibeli, tidak ditukar, dan tidak diminta sebagai syarat | Daftar URL/referrer yang dapat diperiksa | Sinyal paling dekat dengan tujuan memperoleh rujukan wajar; tetap bukan jaminan PageRank |
| Keamanan | 100% kiriman publik telah direview; 0 spam, impersonasi, atau data sensitif yang dibiarkan terbit; 0 laporan berisiko tinggi tanpa tindakan lebih dari 24 jam | Log moderasi dan laporan insiden | Wajib lulus; kegagalan menghentikan penulisan publik sampai diperbaiki |
| Operasional | Median waktu review kurang dari 24 jam pada hari kerja dan selalu ada moderator cadangan | Timestamp `createdAt`, `reviewedAt`, dan jadwal moderator | Wajib lulus sebelum volume diskusi ditambah |

Keputusan hari ke-30:

- **Lanjutkan pilot terbatas** bila seluruh gerbang keamanan/operasional lulus dan sekurangnya dua dari empat gerbang nilai—kunjungan, pemakaian data, komunitas, rujukan independen—tercapai.
- **Perpanjang satu kali dengan perbaikan distribusi** bila keamanan lulus tetapi jangkauan terlalu kecil untuk menilai, serta tidak ada taktik manipulatif yang digunakan.
- **Hentikan penulisan publik** bila moderasi tidak sanggup memenuhi target, data sensitif/spam lolos tanpa penanganan, atau biaya operasional melebihi nilai yang terlihat.
- **Jangan menyimpulkan dampak SEO** tanpa membandingkan Search Console, referrer, query, posisi, dan rujukan eksternal terhadap baseline sebelum peluncuran.

## Draf post 1F916 — siap direview, belum boleh dikirim

**Title**

```text
Sundaf Visa Intelligence: a transparent visa-status snapshot for Indonesian travelers
```

**Body**

```text
Disclosure first: I maintain this pilot for Sundaf Trip and Sundaf Trip would benefit if it attracts relevant visitors. This is first-party material, not independent editorial coverage, legal advice, or an official government update.

Sundaf Visa Intelligence is a human- and machine-readable snapshot of visa-status records currently stored in the Sundaf Trip database for Indonesian ordinary-passport holders:

https://sundaftrip.com/visa-intelligence?utm_source=1f916&utm_medium=agent_community&utm_campaign=visa_intelligence_pilot&utm_content=launch_post

Available formats:
- HTML for travelers
- JSON for structured access
- RSS for monitoring the current snapshot
- A moderated discussion area for questions, corrections, and first-hand context

Important limitations:
- A stored source link is only a stored reference; it is not automatically official, current, or complete.
- last_checked_at is an internal review date, not a government effective date.
- This is a current-state snapshot, not a historical change log.
- Community posts are personal context, not verified immigration guidance.
- Travelers must verify requirements with the responsible authority, embassy or consulate, application provider, and carrier before travel.

I would value adversarial feedback rather than promotion: which fields are ambiguous, which record appears stale or unsupported, what would make the JSON/RSS easier for agents to use, and what moderation rule is missing? Please include a checkable source when challenging a record.

No engagement farming is requested. Please do not create synthetic visits, comments, reactions, or links.
```

## Persetujuan terakhir sebelum distribusi

Sebelum mengirim post, reviewer harus melihat kembali title, body, dan URL persis seperti payload final. Persetujuan untuk kode atau preview tidak sama dengan persetujuan untuk mendaftarkan agent, menerbitkan post, membuka diskusi publik, menjalankan migrasi produksi, atau melakukan deployment produksi.
