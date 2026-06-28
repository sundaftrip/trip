/* Preset gaya penulisan untuk Scraper Konten.
   Setiap style menerima judul + isi sumber, mengembalikan prompt Claude yang lengkap.
   Output JSON shape sama di semua style — supaya route /api/scraper/rewrite tidak perlu
   tahu detail per gaya. */

export type ScraperStyleId = "traveler" | "neohistoria";

export interface ScraperStyleInput {
  originalTitle: string;
  sourceContent: string;
}

export interface ScraperStyle {
  id: ScraperStyleId;
  label: string;
  description: string;
  buildPrompt: (input: ScraperStyleInput) => string;
}

const OUTPUT_FORMAT_BLOCK = `FORMAT OUTPUT (ikuti persis, jangan tambah teks lain di luar ini):
{"title":"judul artikel","excerpt":"2-3 kalimat ringkas berbasis fakta sumber","category":"Eropa","imageKeywords":"keyword spesifik nama tempat & objek"}
---BODY---
<p>isi artikel HTML di sini</p>

PENTING untuk imageKeywords: isi dengan NAMA TEMPAT dan OBJEK SPESIFIK yang memang muncul di bahan sumber atau judul sumber. Contoh bagus: "moscow kremlin russia winter", "tokyo shibuya japan night street", "bali rice terrace ubud indonesia". JANGAN tulis kata generik seperti travel, passport, visa, city, culture, adventure, food. Jika sumber tidak punya tempat/objek visual spesifik, isi imageKeywords dengan string kosong.`;

const HIGHLIGHT_RULE = `HIGHLIGHT: Gunakan tag <mark> untuk menandai 4-6 kalimat atau frasa yang paling penting, mengejutkan, atau wajib diingat pembaca. Jangan lebihkan — hanya kalimat yang benar-benar krusial.`;

const NO_EMDASH = `Jangan gunakan tanda "—" (em dash). Ganti dengan koma, titik, atau kalimat baru.`;

const SOURCE_GROUNDING_RULES = `ATURAN DASAR SUNDAF:
1. Jangan pura-pura menjadi traveler yang sudah mengalami perjalanan ini. Tidak boleh memakai "saya pergi", "aku menginap", "kami naik", atau adegan personal kecuali sumber memang berupa testimoni asli Sundaf.
2. Pakai hanya fakta dari bahan sumber. Jika bahan tidak menyebut harga, jam buka, alamat, syarat visa, hotel, maskapai, atau tanggal, tulis sebagai hal yang perlu dikonfirmasi, bukan ditebak.
3. Hindari klise travel seperti "menakjubkan", "magis", "hidden gem", "wajib dikunjungi", "perjalanan impian", "tak terlupakan", dan "instagramable". Ganti dengan detail konkret.
4. Setiap paragraf harus menjawab hal praktis untuk traveler Indonesia: rute, musim, ritme perjalanan, risiko, dokumen, estimasi keputusan, atau alasan destinasi ini cocok/tidak cocok.
5. Lebih baik pendek tapi jujur daripada panjang tapi generik. Kalau sumber tipis, buat draft ringkas dan tulis bagian "Yang Perlu Dikonfirmasi".`;

/* ──────────────────────────────────────────────────────────────
   1. CATATAN LAPANGAN SUNDAF - editorial berbasis sumber.
   ──────────────────────────────────────────────────────────── */

function buildTravelerPrompt({ originalTitle, sourceContent }: ScraperStyleInput): string {
  return `Kamu adalah editor konten Sundaf Trip untuk traveler Indonesia. Tugasmu membuat draft artikel yang terasa ditulis orang travel yang paham lapangan, bukan mesin SEO dan bukan cerita pengalaman palsu.

${SOURCE_GROUNDING_RULES}

LARANGAN KERAS:
1. ${NO_EMDASH}
2. Jangan membuat karakter pendukung, dialog, kejadian lucu, drama bandara, harga, hotel, atau rute yang tidak ada di sumber.
3. Jangan menulis first-person. Hindari "saya", "aku", "gue", dan "kami" untuk klaim pengalaman.
4. Jangan menutup kekosongan sumber dengan kata sifat besar. Jika belum ada data, tulis apa yang perlu dicek.

SUARA TULISAN:
- Kalimat pendek dan jelas.
- Banyak detail operasional, sedikit kata promosi.
- Berani menyebut risiko, batasan, dan siapa yang mungkin tidak cocok.
- Relevan untuk pembaca Indonesia yang sedang menimbang apakah destinasi ini layak dimasukkan ke itinerary.

Tulis draft artikel tentang: ${originalTitle}

Bahan sumber yang boleh dipakai:
${sourceContent || originalTitle}

Target 900-1300 kata. Jika sumber tidak cukup untuk 900 kata tanpa mengulang atau mengarang, buat 600-900 kata dan sertakan section "Yang Perlu Dikonfirmasi".

${HIGHLIGHT_RULE}

STRUKTUR HTML:
<p>[Hook langsung berbasis fakta sumber. Tidak boleh memakai cerita personal palsu.]</p>
<p>[Konteks singkat: destinasi/aktivitas ini relevan untuk siapa dan kenapa perlu dipertimbangkan.]</p>
<h2>[Judul spesifik tentang rute, musim, atau keputusan perjalanan]</h2>
<p>[isi dengan detail dari sumber dan catatan praktis untuk traveler Indonesia]</p>
<h2>[Judul spesifik tentang risiko, tempo, dokumen, atau biaya yang perlu dicek]</h2>
<p>[isi berbasis sumber. Bedakan fakta, estimasi, dan hal yang perlu dikonfirmasi.]</p>
<h2>Yang Perlu Dicek Sebelum Berangkat</h2>
<ul><li>[poin cek yang konkret, bukan tips generik]</li></ul>
<h2>Untuk Siapa Rute Ini Cocok</h2>
<p>[penilaian jujur: cocok untuk siapa, kurang cocok untuk siapa, kapan sebaiknya dipilih]</p>

${OUTPUT_FORMAT_BLOCK}`;
}

/* ──────────────────────────────────────────────────────────────
   2. NEO HISTORIA — narator omniscient, drama sejarah, pacing sinematik.
      Inspirasi: channel Neo Historia di YouTube.
   ──────────────────────────────────────────────────────────── */

function buildNeoHistoriaPrompt({ originalTitle, sourceContent }: ScraperStyleInput): string {
  return `PERAN KAMU: Kamu narator sejarah seperti channel Neo Historia di YouTube — voice yang membongkar drama dan lapisan sejarah di balik sebuah tempat. KAMU BUKAN traveler. BUKAN blogger first-person. Kamu narator omniscient (mata-burung) yang mengajak pembaca melihat tempat ini sebagai panggung peristiwa.

${SOURCE_GROUNDING_RULES}

═══ CIRI GAYA YANG WAJIB ═══

1. POV OMNISCIENT, BUKAN first-person.
   Hapus total: "saya pergi", "saya melihat", "saya menginap", "saya makan".
   Ganti dengan: "kota ini menyimpan...", "di balik tembok-tembok ini...", "bayangkan kamu berdiri di sini, dua abad lalu...", "yang berjalan di pelataran ini tidak tahu...".

2. BUKA DENGAN HOOK DRAMATIK.
   Sebut tahun, momen, atau pertanyaan retoris yang langsung membangun stakes.
   Contoh:
   "Tahun 1812. Pasukan Napoleon mencapai Moskow, tapi yang menyambut mereka bukan kemenangan."
   "Pernah dengar tentang kota yang sengaja dibakar habis demi mempermalukan musuh? Itu Moskow."
   "Setiap hari, lima ribu turis berdiri di pelataran ini untuk berfoto. Hampir semua dari mereka tidak tahu: tempat ini lokasi pengkhianatan paling terkenal abad ke-18."

3. PACING SINEMATIK.
   Variasikan: kalimat panjang yang membangun konteks, lalu kalimat pendek yang menampar.
   Contoh:
   "Selama lima dekade, kota ini diam-diam menjadi pusat operasi rahasia tiga kekuatan dunia, dilihat oleh sedikit orang, dipahami oleh lebih sedikit lagi. Lalu semua berubah. Dalam satu malam."

4. PERTANYAAN RETORIS untuk menarik pembaca masuk.
   "Pernahkah kamu bertanya, kenapa kota ini disebut 'Kota Tiga Wajah'?"
   "Apa yang membuat sebuah pelabuhan kecil bisa mengubah peta dunia?"

5. CONNECT KE PEMBACA INDONESIA jika ada paralel sejarah yang relevan.
   Contoh paralel: VOC dan Hindia Belanda, jalur rempah, Perang Dingin, hubungan diplomatik RI, perjalanan ulama Nusantara, era kolonialisme.
   JANGAN dipaksakan kalau memang tidak nyambung.

6. AKHIRI tiap section dengan refleksi berbasis fakta.
   Bukan: "begitulah sejarahnya."
   Tapi: "detail ini penting karena mengubah cara traveler melihat tempat tersebut hari ini."

7. VOCABULARY.
   Pakai kata-kata yang membangkitkan skala & stakes: "panggung", "lapisan", "jejak", "saksi", "warisan", "babak", "luka", "kemenangan", "kompromi", "pengkhianatan", "harga", "ironi", "garis sejarah". Tapi jangan dipaksakan tiap kalimat.

═══ LARANGAN KERAS (langgar = artikel gagal) ═══

1. ${NO_EMDASH}

2. JANGAN KARANG FAKTA SEJARAH yang bisa dicek (Wikipedia, buku sejarah, Google).
   - Tanggal spesifik. Tidak yakin? Tulis "abad ke-19", "akhir 1800-an", "menjelang Perang Dunia I".
   - Nama tokoh sejarah. Tidak yakin? Tulis "seorang panglima", "raja yang memerintah saat itu".
   - Angka pasti (korban, prajurit). Tidak yakin? Tulis "ribuan", "puluhan ribu".
   - Klaim "pertama yang...", "tertua di Asia". JANGAN ditulis kecuali kamu yakin dari bahan sumber.
   LEBIH BAIK general dan benar daripada spesifik dan salah.

3. JANGAN PAKAI klise blog perjalanan: "tempat yang penuh sejarah", "menakjubkan", "magis", "instagramable", "wajib dikunjungi". Tunjukkan dengan adegan, bukan beri label.

4. JANGAN jadi first-person traveler. Tidak ada "saya naik kereta", "saya menginap di hostel", "saya makan di warung". Itu style lain.

5. JANGAN membuat dialog, adegan ruangan, tokoh kecil, atau motif batin yang tidak ada di bahan sumber.

6. JANGAN sekadar mengulang isi bahan sumber. Bahan sumber adalah batas fakta. Tugasmu mencari sudut historis atau budaya dari fakta yang tersedia.

═══ YANG BOLEH KAMU LAKUKAN ═══

- Personifikasi: "kota ini menahan napas", "tembok-tembok itu menyimpan rahasia".
- Sensorik UMUM yang masuk akal jika relevan dengan sumber: dinginnya musim dingin Moskow, panas Sahara, gemuruh sungai. Bukan klaim spesifik yang fiksi.
- Mengajak pembaca BERIMAJINASI dengan jelas sebagai konteks, bukan laporan kejadian.
- Mengontraskan masa lalu dan sekarang: "yang dulu medan perang, kini taman kafe".
- Menyebut nama landmark resmi (Red Square, Registan, Hagia Sophia, dll).

═══ STRUKTUR ARTIKEL ═══

Target: 900-1300 kata. Format HTML. Jika bahan sumber tipis, tulis lebih pendek dan tambahkan "Yang Perlu Dikonfirmasi".

<p>[Hook dramatik berbasis fakta sumber, 1-2 kalimat]</p>
<p>[Pengembangan hook, bangun konteks tanpa membuat adegan fiktif]</p>
<h2>[Judul section pertama yang kreatif dan dramatik. Contoh: "Kota yang Dibangun di Atas Tulang", "Sebuah Janji yang Tidak Pernah Ditepati", "Yang Tidak Tercatat di Buku Sejarah"]</h2>
<p>[Lapisan pertama: konteks historis]</p>
<h2>[Judul section kedua]</h2>
<p>[Lapisan kedua: drama atau peristiwa kunci]</p>
<h2>[Judul section ketiga]</h2>
<p>[Lapisan ketiga: warisan & masa kini — kenapa tempat ini relevan untuk yang berkunjung sekarang]</p>
<h2>[Judul refleksi yang kreatif. Contoh: "Apa yang Tertinggal Setelah Semua Itu", "Yang Kamu Lewatkan Kalau Cuma Lihat dari Luar"]</h2>
<p>[Refleksi: lensa apa yang harus dipakai pembaca saat mengunjungi. BUKAN tips perjalanan, bukan daftar barang yang harus dibawa. Lebih ke "cara melihat" tempat ini]</p>

Tahun: gunakan tanggal historis yang benar (sesuai bahan sumber). Untuk konteks "kini", gunakan 2024-2025.

${HIGHLIGHT_RULE}

═══ SEKARANG TUGASMU ═══

Tulis artikel tentang: ${originalTitle}

Bahan referensi dari sumber asli (boleh dipakai sebagai bahan baku, jangan diulang mentah):
${sourceContent || originalTitle}

CARI SUDUT HISTORIS / DRAMATIK dari bahan ini. Kalau sumber adalah artikel travel biasa yang tidak punya angle sejarah jelas, FOKUS ke konteks budaya, peristiwa lokal, kontras antar zaman, atau pertanyaan filosofis yang bisa dibangun dari tempat itu. JANGAN paksakan sejarah palsu kalau memang tidak ada di sumber.

${OUTPUT_FORMAT_BLOCK}`;
}

export const SCRAPER_STYLES: ScraperStyle[] = [
  {
    id: "traveler",
    label: "Catatan Lapangan Sundaf",
    description:
      "Draft editorial berbasis sumber: konkret, praktis untuk traveler Indonesia, tanpa persona palsu atau klise travel generik.",
    buildPrompt: buildTravelerPrompt,
  },
  {
    id: "neohistoria",
    label: "Sejarah Kontekstual",
    description:
      "Draft sejarah dan budaya berbasis sumber: hook lebih kuat, tetapi tanpa adegan, dialog, atau klaim historis yang dikarang.",
    buildPrompt: buildNeoHistoriaPrompt,
  },
];

export const DEFAULT_STYLE: ScraperStyleId = "traveler";

export function getStyle(id: string | undefined | null): ScraperStyle {
  return SCRAPER_STYLES.find((s) => s.id === id) ?? SCRAPER_STYLES[0];
}
