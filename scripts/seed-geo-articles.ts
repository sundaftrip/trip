/**
 * Seed 3 artikel blog "AI-citable" (format tanya-jawab + tabel data) untuk
 * mendongkrak GEO/AEO sundaftrip.com. Disimpan sebagai DRAFT (published:false)
 * supaya bisa di-review dulu dari /admin/blog sebelum dipublish.
 *
 * Idempotent: upsert by slug, jadi aman dijalankan ulang (tidak menduplikasi,
 * dan TIDAK mengubah status published kalau sudah dipublish manual).
 *
 * Jalankan:  npx tsx scripts/seed-geo-articles.ts
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
    slug: "waktu-terbaik-berburu-aurora-rusia",
    title: "Kapan Waktu Terbaik Berburu Aurora di Rusia? Panduan Bulan & Peluang",
    excerpt:
      "Musim aurora di Murmansk berlangsung akhir Agustus hingga pertengahan April, dengan peluang terbaik pada Desember–Maret. Berikut panduan bulan, jam, dan faktor yang menentukan peluang melihat cahaya utara.",
    category: "Panduan",
    author: AUTHOR,
    readTime: "6",
    body: `
<p>Salah satu pertanyaan yang paling sering kami terima: <strong>"Kapan sebenarnya waktu terbaik berburu aurora di Rusia?"</strong> Jawaban singkatnya: musim gelap di kawasan Arktik, sekitar akhir Agustus hingga pertengahan April. Tapi ada nuansa yang penting kamu pahami sebelum memilih tanggal keberangkatan.</p>

<h2>Bulan apa yang paling baik untuk melihat aurora di Murmansk?</h2>
<p>Aurora borealis hanya bisa terlihat saat langit cukup gelap. Di Murmansk, Rusia (kota terbesar di atas Lingkar Arktik), musim aurora kira-kira seperti ini:</p>
<table>
<thead><tr><th>Periode</th><th>Peluang</th><th>Catatan</th></tr></thead>
<tbody>
<tr><td>Akhir Agustus – Oktober</td><td>Sedang</td><td>Malam mulai gelap, suhu belum terlalu ekstrem, salju belum tebal.</td></tr>
<tr><td><strong>November – Maret</strong></td><td><strong>Terbaik</strong></td><td>Malam panjang dan gelap, lanskap bersalju. Inilah jendela utama berburu aurora.</td></tr>
<tr><td>Desember awal – pertengahan Januari</td><td>Terbaik (tapi gelap total)</td><td>Periode "polar night" — matahari nyaris tidak terbit. Sangat gelap, bagus untuk aurora, tapi waktu untuk sightseeing siang hari terbatas.</td></tr>
<tr><td>April</td><td>Sedang</td><td>Masih mungkin, tapi malam makin pendek menjelang musim panas Arktik.</td></tr>
</tbody>
</table>
<p>Di luar rentang ini (Mei–Juli), kawasan Arktik mengalami "midnight sun" — langit tidak pernah benar-benar gelap, sehingga aurora praktis mustahil dilihat meski aktivitas matahari tinggi.</p>

<h2>Jam berapa aurora biasanya muncul?</h2>
<p>Aurora paling sering tampak antara <strong>pukul 21.00 hingga 02.00 waktu setempat</strong>, dengan puncak aktivitas sekitar tengah malam. Karena itu, perburuan aurora hampir selalu dilakukan malam hari, sering kali dengan menjauh dari polusi cahaya kota menuju area yang lebih gelap.</p>

<h2>Berapa malam minimal yang dibutuhkan?</h2>
<p>Aurora adalah fenomena alam — <strong>tidak ada yang bisa menjaminnya muncul pada malam tertentu.</strong> Kuncinya adalah memperbanyak kesempatan. Kami menyarankan minimal <strong>3 hingga 4 malam</strong> di kawasan Murmansk. Semakin banyak malam yang kamu miliki, semakin besar peluang langit cerah dan aktivitas aurora bertemu di waktu yang sama.</p>

<h2>Apa saja yang menentukan peluang melihat aurora?</h2>
<ul>
<li><strong>Langit cerah.</strong> Awan adalah musuh utama. Malam dingin yang kering biasanya lebih cerah.</li>
<li><strong>Kegelapan.</strong> Jauh dari lampu kota, peluang melihat aurora redup pun meningkat.</li>
<li><strong>Aktivitas matahari (indeks Kp).</strong> Semakin tinggi indeks Kp, semakin kuat dan luas aurora terlihat. Pasca-puncak Siklus Matahari ke-25 (2024–2025), aktivitas geomagnetik masih relatif tinggi pada 2026 — kabar baik untuk pemburu aurora.</li>
<li><strong>Lokasi.</strong> Murmansk berada tepat di bawah "auroral oval", sabuk wilayah dengan frekuensi aurora tertinggi di bumi.</li>
</ul>

<h2>Kesimpulan</h2>
<p>Jika kamu ingin peluang terbaik, rencanakan perjalanan pada <strong>Desember hingga Maret</strong>, alokasikan setidaknya 3–4 malam di Murmansk, dan siapkan ekspektasi yang sehat: aurora adalah hadiah dari langit, bukan jadwal yang bisa dipesan. Yang bisa kami lakukan adalah menempatkan kamu di tempat dan waktu dengan peluang setinggi mungkin.</p>
<p>Mau tahu paket aurora Rusia yang sedang kami buka beserta tanggalnya? Lihat <a href="/tours">daftar paket tour</a> kami, atau pelajari lebih lanjut tentang <a href="/destinations/murmansk">Murmansk sebagai destinasi aurora</a>.</p>
`.trim(),
  },
  {
    slug: "murmansk-kota-aurora-rusia",
    title: "Murmansk: Kota Aurora di Rusia — Kenapa Dipilih & Apa yang Bisa Dilakukan",
    excerpt:
      "Murmansk adalah kota terbesar di dunia di atas Lingkar Arktik dan salah satu lokasi terbaik untuk berburu aurora. Dari Sami village, husky sledding, sampai kapal pemecah es nuklir Lenin — ini panduan lengkapnya.",
    category: "Destinasi",
    author: AUTHOR,
    readTime: "7",
    body: `
<p>Kalau bicara berburu aurora di Rusia, satu nama selalu muncul: <strong>Murmansk</strong>. Tapi apa istimewanya kota ini, dan apa saja yang bisa dilakukan selain menengadah ke langit malam? Berikut panduan ringkas dari kami.</p>

<h2>Di mana Murmansk?</h2>
<p>Murmansk terletak di barat laut Rusia, di Semenanjung Kola, di tepi Teluk Kola yang terhubung ke Laut Barents. Posisinya sekitar <strong>68,97° Lintang Utara</strong> — jauh di atas Lingkar Arktik. Inilah <strong>kota terbesar di dunia yang berada di atas Lingkar Arktik</strong>, dengan populasi ratusan ribu jiwa, lengkap dengan bandara, hotel, dan infrastruktur kota yang memadai.</p>

<h2>Kenapa Murmansk bagus untuk berburu aurora?</h2>
<p>Tiga alasan utama:</p>
<ul>
<li><strong>Berada di bawah "auroral oval".</strong> Lintang Murmansk masuk sabuk wilayah dengan frekuensi aurora tertinggi di bumi, sehingga peluang melihat cahaya utara relatif besar pada musimnya.</li>
<li><strong>Akses & infrastruktur.</strong> Berbeda dari banyak titik aurora yang terpencil, Murmansk adalah kota sungguhan. Kamu bisa tidur di hotel hangat, lalu berkendara keluar kota mencari langit gelap saat malam tiba.</li>
<li><strong>Malam Arktik yang panjang.</strong> Pada puncak musim dingin, malam berlangsung sangat panjang — memberi banyak jam gelap untuk berburu.</li>
</ul>

<h2>Apa saja yang bisa dilakukan di Murmansk selain aurora?</h2>
<p>Aurora muncul malam hari, jadi siang hari biasanya diisi aktivitas khas Arktik:</p>
<ul>
<li><strong>Sami Village.</strong> Mengunjungi desa suku Sami, masyarakat adat Arktik, dan bertemu peternakan rusa kutub (reindeer). Sering ada kesempatan naik kereta luncur yang ditarik rusa.</li>
<li><strong>Husky sledding.</strong> Mengendarai kereta luncur yang ditarik anjing husky di atas salju — salah satu pengalaman paling berkesan.</li>
<li><strong>Snowmobile safari.</strong> Menjelajah lanskap bersalju dengan mobil salju.</li>
<li><strong>Kapal pemecah es nuklir Lenin.</strong> Kapal pemecah es bertenaga nuklir pertama di dunia, kini menjadi museum di pelabuhan Murmansk — ikon sejarah Soviet.</li>
<li><strong>Teriberka.</strong> Desa di tepi Samudra Arktik (Laut Barents), terkenal lewat film "Leviathan", dengan pemandangan pantai Arktik yang dramatis.</li>
</ul>

<h2>Bagaimana cara ke Murmansk dari Indonesia?</h2>
<p>Tidak ada penerbangan langsung dari Indonesia ke Rusia. Rute umumnya:</p>
<ol>
<li>Terbang dari Jakarta menuju Moskow atau St. Petersburg, biasanya <strong>transit di Timur Tengah</strong> (misalnya via Doha, Dubai, atau Istanbul).</li>
<li>Lanjut penerbangan domestik ke Bandara Murmansk (kode <strong>MMK</strong>) — sekitar 2,5 jam dari Moskow.</li>
</ol>
<p>Banyak paket tour menggabungkan Murmansk dengan <strong>Moskow</strong> dan <strong>St. Petersburg</strong>, sehingga kamu mendapat perpaduan kota bersejarah dan petualangan Arktik dalam satu perjalanan.</p>

<h2>Berapa lama sebaiknya di Murmansk?</h2>
<p>Untuk berburu aurora, kami menyarankan <strong>minimal 3 malam</strong> di kawasan Murmansk demi memperbesar peluang langit cerah bertemu aktivitas aurora. Untuk perjalanan lengkap Rusia (Moskow + St. Petersburg + Murmansk), durasi yang nyaman umumnya sekitar 8–10 hari.</p>

<p>Penasaran kapan waktu terbaik datang? Baca panduan kami soal <a href="/blog/waktu-terbaik-berburu-aurora-rusia">waktu terbaik berburu aurora di Rusia</a>, atau lihat <a href="/tours">paket tour</a> yang sedang kami buka.</p>
`.trim(),
  },
  {
    slug: "biaya-tour-rusia-aurora-indonesia-2026",
    title: "Biaya Tour Rusia Aurora dari Indonesia 2026: Komponen & Kisaran",
    excerpt:
      "Berapa biaya tour Rusia berburu aurora dari Indonesia di 2026? Open trip umumnya mulai dari kisaran Rp 25 jutaan. Berikut rincian komponen biaya, mulai dari tiket, hotel, visa, hingga aktivitas Arktik.",
    category: "Tips",
    author: AUTHOR,
    readTime: "6",
    body: `
<p>"Berapa sih biaya tour Rusia aurora dari Indonesia?" Ini salah satu pertanyaan pertama yang muncul saat orang membayangkan berburu cahaya utara. Jawabannya tergantung banyak faktor, tapi di artikel ini kami uraikan <strong>komponen biayanya</strong> supaya kamu punya gambaran yang jujur.</p>

<p><em>Catatan: angka di bawah adalah kisaran pasar pada 2026 dan dapat berubah mengikuti harga tiket pesawat, nilai tukar rubel, dan musim. Untuk harga paket terkini Sundaf Trip, silakan cek <a href="/tours">halaman paket tour</a> kami.</em></p>

<h2>Berapa kisaran harga open trip Rusia aurora?</h2>
<p>Untuk format <strong>open trip</strong> (berangkat berkelompok dengan jadwal yang sudah ditentukan), harga di pasar Indonesia umumnya <strong>mulai dari kisaran Rp 25 jutaan per orang</strong>, dan bisa lebih tinggi tergantung durasi, musim puncak, dan kelas hotel. Format <strong>private trip</strong> (jadwal & rombongan sendiri) biasanya lebih tinggi karena fleksibilitas dan layanan personal.</p>

<h2>Apa saja komponen biaya tour Rusia?</h2>
<table>
<thead><tr><th>Komponen</th><th>Catatan</th></tr></thead>
<tbody>
<tr><td><strong>Tiket pesawat internasional</strong></td><td>Biasanya komponen terbesar. Rute transit (via Timur Tengah), tidak ada penerbangan langsung dari Indonesia.</td></tr>
<tr><td><strong>Penerbangan domestik</strong></td><td>Moskow/St. Petersburg ke Murmansk (MMK).</td></tr>
<tr><td><strong>Hotel</strong></td><td>Beberapa malam di Moskow, St. Petersburg, dan Murmansk.</td></tr>
<tr><td><strong>Transportasi darat & tour leader</strong></td><td>Bus/van privat, pemandu, dan tour leader berbahasa Indonesia.</td></tr>
<tr><td><strong>Visa Rusia</strong></td><td>Lihat bagian di bawah.</td></tr>
<tr><td><strong>Aktivitas Arktik</strong></td><td>Husky sledding, snowmobile, kunjungan Sami village — sebagian sering bersifat opsional/add-on.</td></tr>
<tr><td><strong>Asuransi perjalanan</strong></td><td>Sangat dianjurkan untuk perjalanan musim dingin Arktik.</td></tr>
</tbody>
</table>

<h2>Berapa biaya visa Rusia untuk WNI?</h2>
<p>Sejak 2023, Rusia membuka <strong>e-Visa terpadu (unified e-visa)</strong> untuk turis dari banyak negara, termasuk Indonesia. Biaya konsuler resminya sekitar <strong>US$52</strong>, berlaku untuk kunjungan hingga 16 hari. Selain e-Visa, masih tersedia jalur visa tempel konvensional. Karena aturan dan biaya bisa berubah, kami selalu menyarankan mengecek persyaratan terkini — kamu bisa mulai dari <a href="/visa">halaman info visa</a> kami.</p>

<h2>Apa yang biasanya sudah termasuk dan belum termasuk?</h2>
<p>Ini sangat bervariasi antar penyelenggara, jadi <strong>selalu baca rincian "termasuk / tidak termasuk"</strong> sebelum memutuskan. Yang umum <em>belum</em> termasuk: tiket masuk objek tertentu, makan di luar jadwal, pengeluaran pribadi, dan kadang sebagian aktivitas opsional. Yang umum sudah termasuk: hotel, sebagian besar makan, transportasi, dan tour leader.</p>

<h2>Tips agar lebih hemat</h2>
<ul>
<li><strong>Pesan jauh-jauh hari.</strong> Harga tiket pesawat ke Rusia cenderung naik mendekati musim puncak aurora.</li>
<li><strong>Pilih open trip.</strong> Berbagi biaya transport dan tour leader dengan rombongan membuat harga per orang lebih ringan dibanding private trip.</li>
<li><strong>Hindari periode liburan puncak.</strong> Tanggal di sekitar libur akhir tahun biasanya paling mahal.</li>
<li><strong>Perhatikan kurs rubel.</strong> Sebagian biaya darat di Rusia mengikuti nilai tukar; fluktuasi kurs bisa memengaruhi total.</li>
</ul>

<h2>Kesimpulan</h2>
<p>Sebagai gambaran kasar, siapkan anggaran mulai dari kisaran <strong>Rp 25 jutaan</strong> untuk open trip Rusia aurora, dengan total akhir bergantung pada durasi, musim, dan aktivitas yang kamu pilih. Cara paling pasti? Bandingkan rincian paket dan tanyakan apa saja yang termasuk. Kamu bisa melihat <a href="/tours">paket dan harga terkini kami</a> atau bertanya langsung lewat WhatsApp.</p>
`.trim(),
  },
];

async function main() {
  for (const a of articles) {
    const res = await prisma.blog.upsert({
      where: { slug: a.slug },
      // Saat update: JANGAN sentuh `published` (hormati keputusan manual admin).
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
