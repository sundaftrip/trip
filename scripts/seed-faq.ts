import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FAQS = [
  { section: "Umum", order: 0, question: "Apa yang membedakan Sundaftrip dari agen wisata lain?", answer: "Kami fokus hanya pada Rusia, Asia Tengah, dan aurora borealis — bukan generalis. Tim kami benar-benar menguasai visa, kondisi lokal, dan pengalaman di destinasi-destinasi ini. Grup kecil (maks 10–12 orang) memastikan pengalaman lebih personal, bukan rombongan bus." },
  { section: "Umum", order: 1, question: "Berapa ukuran grup per keberangkatan?", answer: "Maksimal 10–12 orang per keberangkatan. Kami sengaja membatasi ini agar setiap peserta mendapat perhatian penuh dan perjalanan tidak terasa seperti wisata massal." },
  { section: "Umum", order: 2, question: "Apakah ada pemandu perjalanan yang mendampingi?", answer: "Ya. Setiap keberangkatan didampingi tour leader berpengalaman dari tim kami yang fasih bahasa Indonesia. Di lapangan kami juga berkoordinasi dengan mitra lokal yang memahami kultur setempat." },
  { section: "Umum", order: 3, question: "Apakah Sundaftrip terdaftar secara resmi?", answer: "Ya, kami terdaftar resmi dengan Nomor Induk Berusaha (NIB) yang dapat diverifikasi di OSS (Online Single Submission) pemerintah Indonesia." },

  { section: "Visa & Dokumen", order: 0, question: "Apakah Sundaftrip membantu proses visa?", answer: "Ya, kami membantu pengurusan visa dari awal hingga selesai — mulai dari pengisian formulir, legalisasi dokumen, hingga booking appointment di kedutaan. Biaya visa di luar harga paket dan bervariasi tergantung destinasi." },
  { section: "Visa & Dokumen", order: 1, question: "Berapa lama proses visa Rusia?", answer: "Umumnya 5–15 hari kerja untuk visa turis biasa. Kami menyarankan mengurus minimal 4–6 minggu sebelum keberangkatan untuk memberi waktu jika ada dokumen tambahan yang diminta." },
  { section: "Visa & Dokumen", order: 2, question: "Apakah Kazakhstan, Kyrgyzstan, dan Uzbekistan butuh visa untuk WNI?", answer: "Kondisi ini berubah sewaktu-waktu. Saat ini Kazakhstan bebas visa untuk WNI hingga 30 hari. Kyrgyzstan dan Uzbekistan memiliki e-visa yang prosesnya cukup mudah. Tim kami selalu update informasi terkini." },
  { section: "Visa & Dokumen", order: 3, question: "Dokumen apa saja yang perlu saya siapkan?", answer: "Umumnya: paspor yang masih berlaku minimal 6 bulan dari tanggal kepulangan, foto paspor, bukti keuangan (rekening koran 3 bulan), surat keterangan kerja/usaha, dan itinerary perjalanan. Tim kami akan memberikan checklist lengkap." },

  { section: "Pembayaran & Deposit", order: 0, question: "Berapa deposit yang harus dibayar untuk booking?", answer: "Deposit awal sebesar 20–30% dari total harga paket untuk mengamankan kursi Anda. Pelunasan dilakukan 30–45 hari sebelum keberangkatan." },
  { section: "Pembayaran & Deposit", order: 1, question: "Metode pembayaran apa yang diterima?", answer: "Transfer bank (semua bank besar Indonesia), dan dompet digital (GoPay, OVO, DANA). Untuk kemudahan, kami juga menerima cicilan melalui kartu kredit tertentu." },
  { section: "Pembayaran & Deposit", order: 2, question: "Bagaimana kebijakan refund jika saya membatalkan?", answer: "Pembatalan lebih dari 60 hari sebelum keberangkatan: refund 80% deposit. Pembatalan 30–60 hari: refund 50% deposit. Pembatalan kurang dari 30 hari: deposit tidak dikembalikan. Kami sangat menyarankan asuransi perjalanan." },
  { section: "Pembayaran & Deposit", order: 3, question: "Apa saja yang sudah termasuk dalam harga paket?", answer: "Setiap paket berbeda, namun umumnya sudah termasuk: tiket pesawat PP, akomodasi, transportasi lokal, makan sesuai jadwal, biaya masuk objek wisata, dan pendampingan tour leader. Yang biasanya tidak termasuk: biaya visa, pengeluaran pribadi." },

  { section: "Di Lapangan", order: 0, question: "Seberapa dingin cuaca di Rusia dan kawasan aurora?", answer: "Sangat bergantung musim. Musim dingin (Des–Feb) bisa mencapai -20°C di Moskow dan -30°C di wilayah utara. Musim panas (Jun–Agu) sangat nyaman, 18–25°C. Kami selalu menyertakan panduan pakaian lengkap." },
  { section: "Di Lapangan", order: 1, question: "Kapan waktu terbaik melihat aurora borealis?", answer: "September hingga Maret adalah periode terbaik — langit gelap cukup lama setiap malamnya. Puncak aktivitas geomagnetik sering terjadi di ekuinoks (Sep dan Mar). Namun aurora tetap tidak bisa 100% dijamin karena bergantung kondisi alam." },
  { section: "Di Lapangan", order: 2, question: "Apakah aman bepergian ke Rusia dan Asia Tengah?", answer: "Kami selalu memantau perkembangan situasi di lapangan sebelum dan selama perjalanan. Destinasi seperti Kazakhstan, Uzbekistan, Kyrgyzstan, dan Tajikistan secara umum aman untuk wisatawan. Kami juga berkoordinasi dengan KBRI setempat." },
  { section: "Di Lapangan", order: 3, question: "Bagaimana dengan koneksi internet dan komunikasi di sana?", answer: "Kami menyarankan membeli SIM lokal setibanya di destinasi — murah dan koneksinya baik di kota besar. Untuk Rusia, beberapa aplikasi barat mungkin dibatasi; VPN bisa membantu. Tim kami akan memberikan panduan teknis sebelum berangkat." },
];

async function main() {
  console.log("Seeding FAQ...");
  const existing = await prisma.faq.count();
  if (existing > 0) {
    console.log(`Sudah ada ${existing} FAQ di database. Skip seeding.`);
    return;
  }
  await prisma.faq.createMany({ data: FAQS });
  console.log(`✅ ${FAQS.length} FAQ berhasil ditambahkan.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
