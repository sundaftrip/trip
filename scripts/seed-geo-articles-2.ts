/**
 * Batch 2 artikel blog "AI-citable" untuk GEO/AEO sundaftrip.com.
 * Disimpan sebagai DRAFT (published:false) — review dulu di /admin/blog.
 * Idempotent (upsert by slug, tidak mengubah `published` saat update).
 *
 * Jalankan:  npx tsx scripts/seed-geo-articles-2.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  readTime: string;
  body: string;
};

const AUTHOR = "Tim Sundaf Trip";

const articles: Article[] = [
  {
    slug: "visa-rusia-wni-evisa-vs-visa-tempel-2026",
    title: "Visa Rusia untuk WNI 2026: e-Visa vs Visa Tempel, Mana yang Tepat?",
    excerpt:
      "Sejak 2023, WNI bisa masuk Rusia dengan e-Visa terpadu seharga US$52 untuk kunjungan hingga 16 hari. Berikut perbandingan e-Visa vs visa tempel, syarat, dan prosesnya untuk wisata.",
    category: "Visa",
    author: AUTHOR,
    readTime: "6",
    body: `
<p>Salah satu pertanyaan paling penting sebelum merencanakan perjalanan ke Rusia: <strong>visa apa yang saya butuhkan?</strong> Sejak Rusia membuka e-Visa terpadu, prosesnya jauh lebih sederhana untuk turis Indonesia. Berikut perbandingannya.</p>

<p><em>Catatan: aturan dan biaya visa dapat berubah sewaktu-waktu. Selalu konfirmasi persyaratan terkini sebelum mengajukan. Untuk informasi visa lebih lengkap, kunjungi <a href="/visa">halaman info visa</a> kami.</em></p>

<h2>Apa itu e-Visa terpadu Rusia?</h2>
<p>Sejak Agustus 2023, Rusia menerbitkan <strong>unified e-visa (e-Visa terpadu)</strong> yang bisa diajukan sepenuhnya online untuk warga negara dari banyak negara, termasuk Indonesia. e-Visa ini cocok untuk tujuan <strong>wisata, kunjungan keluarga, bisnis singkat, dan acara</strong>.</p>

<h2>e-Visa vs Visa Tempel: apa bedanya?</h2>
<table>
<thead><tr><th>Aspek</th><th>e-Visa terpadu</th><th>Visa tempel (konvensional)</th></tr></thead>
<tbody>
<tr><td>Pengajuan</td><td>100% online</td><td>Lewat kedutaan/konsulat atau pusat aplikasi visa</td></tr>
<tr><td>Biaya konsuler</td><td>Sekitar US$52</td><td>Bervariasi menurut jenis & durasi</td></tr>
<tr><td>Masa tinggal</td><td>Hingga 16 hari</td><td>Bisa lebih panjang, tergantung jenis visa</td></tr>
<tr><td>Jumlah masuk</td><td>Sekali masuk (single entry)</td><td>Bisa single/multiple entry</td></tr>
<tr><td>Cocok untuk</td><td>Wisata singkat — termasuk paket aurora</td><td>Tinggal lebih lama, keperluan khusus</td></tr>
</tbody>
</table>

<h2>Bagaimana proses mengajukan e-Visa Rusia?</h2>
<ol>
<li>Isi formulir aplikasi di portal e-Visa resmi Rusia.</li>
<li>Unggah <strong>foto</strong> sesuai ketentuan dan halaman data paspor.</li>
<li>Bayar biaya konsuler (sekitar US$52).</li>
<li>Tunggu persetujuan — biasanya beberapa hari kerja. Ajukan beberapa hari sebelum keberangkatan, jangan mepet.</li>
<li>Cetak e-Visa yang disetujui dan bawa saat keberangkatan.</li>
</ol>

<h2>Apakah e-Visa cukup untuk tour aurora ke Murmansk?</h2>
<p>Untuk sebagian besar paket wisata Rusia — termasuk rute Moskow, St. Petersburg, dan Murmansk yang berdurasi sekitar 8–10 hari — <strong>e-Visa 16 hari umumnya sudah cukup</strong>. Pastikan total hari perjalananmu tidak melebihi masa berlaku e-Visa.</p>

<h2>Apa yang perlu diperhatikan?</h2>
<ul>
<li><strong>Masa berlaku paspor</strong> minimal 6 bulan dari rencana masuk Rusia, dengan halaman kosong yang cukup.</li>
<li><strong>Asuransi perjalanan</strong> sangat dianjurkan untuk perjalanan musim dingin.</li>
<li><strong>Akurasi data.</strong> Nama dan nomor paspor harus persis sama dengan dokumen — kesalahan kecil bisa menghambat masuk.</li>
</ul>

<p>Kalau kamu memesan paket lewat kami, urusan visa adalah salah satu yang bisa kami bantu koordinasikan. Lihat <a href="/tours">paket tour Rusia</a> yang sedang dibuka, atau pelajari <a href="/visa">info visa</a> selengkapnya.</p>
`.trim(),
  },
  {
    slug: "itinerary-8-hari-rusia-moskow-stpetersburg-murmansk",
    title: "Itinerary 8 Hari Rusia: Moskow – St. Petersburg – Murmansk (Aurora)",
    excerpt:
      "Contoh itinerary 8 hari menjelajah Rusia: dari Lapangan Merah Moskow, kemegahan St. Petersburg, hingga berburu aurora di Murmansk. Rencana hari-per-hari untuk perjalanan musim dingin.",
    category: "Panduan",
    author: AUTHOR,
    readTime: "7",
    body: `
<p>Banyak yang bertanya, "Berapa hari ideal untuk keliling Rusia plus berburu aurora?" Untuk perpaduan kota bersejarah dan petualangan Arktik, durasi <strong>8 hari</strong> adalah titik nyaman. Berikut contoh itinerary yang sering jadi acuan.</p>

<p><em>Catatan: ini contoh kerangka. Urutan dan isi bisa berbeda antar penyelenggara dan musim. Lihat <a href="/tours">paket tour kami</a> untuk itinerary dan tanggal terkini.</em></p>

<h2>Ringkasan rute</h2>
<p>Moskow (kota & sejarah) → St. Petersburg (seni & arsitektur) → Murmansk (Arktik & aurora). Tiga wajah Rusia dalam satu perjalanan.</p>

<h2>Itinerary hari per hari</h2>
<table>
<thead><tr><th>Hari</th><th>Kota</th><th>Aktivitas utama</th></tr></thead>
<tbody>
<tr><td>Hari 1</td><td>Transit → Moskow</td><td>Terbang dari Jakarta (transit Timur Tengah), tiba di Moskow, istirahat.</td></tr>
<tr><td>Hari 2</td><td>Moskow</td><td>Lapangan Merah, Katedral St. Basil, GUM, Masjid Agung Moskow, Arbat Street.</td></tr>
<tr><td>Hari 3</td><td>Moskow → St. Petersburg</td><td>Metro Moskow yang megah, lalu kereta cepat ke St. Petersburg.</td></tr>
<tr><td>Hari 4</td><td>St. Petersburg</td><td>Museum Hermitage, Gereja Juru Selamat Atas Darah yang Tertumpah, Sungai Neva.</td></tr>
<tr><td>Hari 5</td><td>St. Petersburg → Murmansk</td><td>Benteng Peter & Paul, lalu terbang ke Murmansk (Arktik).</td></tr>
<tr><td>Hari 6</td><td>Murmansk</td><td>Sami village (rusa kutub), husky sledding. Malam: <strong>berburu aurora</strong>.</td></tr>
<tr><td>Hari 7</td><td>Murmansk</td><td>Kapal pemecah es nuklir Lenin / snowmobile safari. Malam: <strong>berburu aurora lagi</strong>.</td></tr>
<tr><td>Hari 8</td><td>Murmansk → pulang</td><td>Terbang kembali ke Moskow, lanjut penerbangan pulang ke Indonesia.</td></tr>
</tbody>
</table>

<h2>Kenapa Murmansk diletakkan di akhir?</h2>
<p>Menempatkan perburuan aurora di hari-hari terakhir memberi <strong>2 malam berburu</strong> — memperbesar peluang langit cerah bertemu aktivitas aurora. Aurora tidak bisa dijadwalkan, jadi memperbanyak malam adalah strategi terbaik.</p>

<h2>Tips menjalani itinerary musim dingin</h2>
<ul>
<li>Suhu Murmansk bisa sangat dingin (sering di bawah -10°C hingga -20°C). Siapkan pakaian berlapis.</li>
<li>Jam siang pendek di musim dingin Arktik — manfaatkan sebaik mungkin untuk sightseeing.</li>
<li>Sisakan jeda; perjalanan antar kota Rusia memakan waktu.</li>
</ul>

<p>Mau tahu apa saja yang perlu dibawa ke Arktik? Baca <a href="/blog/packing-list-musim-dingin-rusia-arktik">packing list musim dingin Rusia</a> kami. Atau cek <a href="/tours">paket & tanggal keberangkatan</a> yang tersedia.</p>
`.trim(),
  },
  {
    slug: "packing-list-musim-dingin-rusia-arktik",
    title: "Packing List Musim Dingin Rusia & Arktik: Apa yang Harus Dibawa",
    excerpt:
      "Suhu Murmansk di musim dingin bisa menembus -20°C. Berikut daftar bawaan lengkap untuk tetap hangat saat berburu aurora di Arktik — dari sistem berlapis, sepatu, hingga perlindungan kamera.",
    category: "Tips",
    author: AUTHOR,
    readTime: "6",
    body: `
<p>"Sedingin apa sih Rusia di musim dingin, dan apa yang harus saya bawa?" Pertanyaan wajar — dan penting. Di Murmansk, suhu musim dingin sering berada di kisaran <strong>-10°C hingga -20°C</strong>, kadang lebih dingin. Persiapan pakaian yang tepat menentukan apakah perjalananmu nyaman atau menderita.</p>

<h2>Prinsip utama: sistem berlapis (layering)</h2>
<p>Kunci tetap hangat di Arktik bukan satu jaket tebal, melainkan <strong>tiga lapisan</strong> yang bekerja sama:</p>
<ul>
<li><strong>Lapisan dalam (base layer):</strong> pakaian termal (thermal/heattech) yang menempel di kulit untuk menjaga panas tubuh.</li>
<li><strong>Lapisan tengah (mid layer):</strong> fleece atau sweter tebal untuk menahan panas.</li>
<li><strong>Lapisan luar (outer layer):</strong> jaket dan celana tahan angin & tahan air (windproof + waterproof).</li>
</ul>

<h2>Daftar bawaan lengkap</h2>
<table>
<thead><tr><th>Kategori</th><th>Barang</th></tr></thead>
<tbody>
<tr><td>Badan</td><td>2–3 set thermal, fleece/sweter, jaket winter tebal (down/parka), celana tahan angin.</td></tr>
<tr><td>Kepala & wajah</td><td>Beanie/kupluk yang menutup telinga, buff/neck gaiter, masker wajah untuk angin.</td></tr>
<tr><td>Tangan</td><td>Sarung tangan berlapis (liner tipis + sarung tangan tebal), idealnya tahan air.</td></tr>
<tr><td>Kaki</td><td>Kaus kaki wol tebal (bawa cadangan), sepatu boot musim dingin anti-selip & tahan air.</td></tr>
<tr><td>Aksesori</td><td>Hand warmer/toe warmer sekali pakai, kacamata, lip balm, pelembap.</td></tr>
<tr><td>Elektronik</td><td>Power bank (baterai cepat habis di suhu dingin), kamera + baterai cadangan, tripod untuk foto aurora.</td></tr>
</tbody>
</table>

<h2>Tips khusus berburu aurora</h2>
<ul>
<li><strong>Lindungi baterai.</strong> Suhu dingin menguras baterai dengan cepat. Simpan baterai cadangan di saku dalam yang hangat.</li>
<li><strong>Bawa tripod.</strong> Foto aurora butuh eksposur panjang; tangan goyang akan merusak hasil.</li>
<li><strong>Hand warmer adalah penyelamat.</strong> Berdiri diam di luar selama berjam-jam menunggu aurora terasa jauh lebih dingin daripada berjalan.</li>
<li><strong>Hindari kapas untuk base layer.</strong> Kapas menyerap keringat dan membuat dingin; pilih bahan termal sintetis atau wol.</li>
</ul>

<h2>Apa yang sering terlupa?</h2>
<p>Pelembap dan lip balm (udara Arktik sangat kering), kacamata hitam (pantulan salju menyilaukan di siang hari), serta kaus kaki cadangan. Hal-hal kecil ini sering diremehkan tapi sangat memengaruhi kenyamanan.</p>

<p>Sudah siap dengan perlengkapannya? Pelajari <a href="/blog/waktu-terbaik-berburu-aurora-rusia">waktu terbaik berburu aurora</a> dan lihat <a href="/tours">paket tour Rusia</a> kami untuk merencanakan perjalananmu.</p>
`.trim(),
  },
];

async function main() {
  for (const a of articles) {
    const res = await prisma.blog.upsert({
      where: { slug: a.slug },
      update: {
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
        author: a.author,
        readTime: a.readTime,
        body: a.body,
      },
      create: {
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
        author: a.author,
        readTime: a.readTime,
        body: a.body,
        published: false, // DRAFT — review dulu di /admin/blog
      },
      select: { slug: true, published: true },
    });
    console.log(`✓ ${res.slug}  (published: ${res.published})`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("ERROR:", e.message);
    await prisma.$disconnect();
    process.exit(1);
  });
