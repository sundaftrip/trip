import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, Clock, Calendar, MessageCircle, Star, ChevronRight, Plane, Thermometer, Camera, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Wisata Murmansk & Aurora Borealis dari Indonesia — Sundaftrip",
  description:
    "Panduan lengkap wisata Murmansk, Rusia untuk traveler Indonesia: cara ke sana, visa, waktu terbaik lihat aurora borealis, estimasi budget dalam rupiah, dan paket tur tersedia.",
  keywords: [
    "wisata murmansk","aurora borealis murmansk","northern lights rusia",
    "paket tour murmansk indonesia","wisata rusia dari jakarta",
    "aurora borealis indonesia","tur rusia murmansk","sundaftrip rusia",
  ],
  openGraph: {
    title: "Wisata Murmansk & Aurora Borealis — Sundaftrip",
    description: "Panduan lengkap wisata Murmansk Rusia untuk traveler Indonesia. Visa, flight, aurora, budget IDR.",
    type: "article",
    images: [{ url: "https://picsum.photos/seed/murmansk-aurora/1200/630", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://sundaftrip.com/destinations/murmansk" },
};

async function getData() {
  const [companyRows, tours, relatedPosts] = await Promise.all([
    prisma.companyInfo.findMany({ where: { key: { in: ["company_whatsapp", "site_theme"] } } }),
    prisma.tour.findMany({
      where: {
        status: { in: ["ACTIVE", "FULL"] },
        OR: [
          { country: { contains: "rusia", mode: "insensitive" } },
          { country: { contains: "russia", mode: "insensitive" } },
          { title: { contains: "rusia", mode: "insensitive" } },
          { title: { contains: "murmansk", mode: "insensitive" } },
        ],
      },
      orderBy: { tripDate: "asc" },
      take: 3,
    }),
    prisma.blog.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: "rusia", mode: "insensitive" } },
          { title: { contains: "russia", mode: "insensitive" } },
          { title: { contains: "murmansk", mode: "insensitive" } },
          { title: { contains: "aurora", mode: "insensitive" } },
          { category: { contains: "eropa", mode: "insensitive" } },
        ],
      },
      orderBy: { date: "desc" },
      take: 3,
      select: { id: true, slug: true, title: true, excerpt: true, cover: true, readTime: true, date: true },
    }),
  ]);

  const company: Record<string, string> = {};
  companyRows.forEach((r) => { company[r.key] = r.value; });
  return { wa: company["company_whatsapp"] ?? "", theme: company["site_theme"] ?? "classic", tours, relatedPosts };
}

const QUICK_FACTS = [
  { icon: Plane,       label: "Flight dari Jakarta",  value: "±18–22 jam (transit)" },
  { icon: Calendar,    label: "Waktu terbaik",         value: "Oktober – Maret" },
  { icon: Thermometer, label: "Suhu musim dingin",     value: "-10°C s/d -25°C" },
  { icon: Wallet,      label: "Estimasi budget",       value: "Rp 25–45 juta/orang" },
];

const ACTIVITIES = [
  {
    emoji: "🌌",
    title: "Berburu Aurora Borealis",
    desc: "Ini alasan utama orang datang ke Murmansk. Langit di atas Laut Barents jadi salah satu spot terbaik di dunia buat lihat aurora. Bulan terbaik: Desember–Februari saat langit paling gelap.",
  },
  {
    emoji: "🚢",
    title: "Kapal Pemecah Es Atomik",
    desc: "Naik kapal nuklir pemecah es (icebreaker) dan keluar ke Samudra Arktik. Literally pengalaman yang gak ada duanya di bumi. Harganya lumayan, tapi worth it banget buat yang mau flex.",
  },
  {
    emoji: "🐕",
    title: "Husky Sledding",
    desc: "Berkeliling hutan bersalju ditarik anjing husky? Check. Ini bukan sekadar aktivitas wisata — ini healing level dewa. Suara sepatu salju, napas anjing, dan sepi yang adem.",
  },
  {
    emoji: "🐟",
    title: "Memancing di Atas Es",
    desc: "Mancing di tengah danau yang membeku, duduk di atas lapisan es tebal. Cukup hangat di dalam tenda khusus, dan kalau dapat ikan, langsung dimasak di sana.",
  },
  {
    emoji: "🏔️",
    title: "Snowmobile Safari",
    desc: "Ngebut di atas salju dengan snowmobile sampai ke titik terpencil di hutan Arktik. Ini versi off-road-nya orang Kutub Utara.",
  },
  {
    emoji: "🌅",
    title: "Polar Night & Midnight Sun",
    desc: "Desember–Januari, Murmansk mengalami Polar Night — matahari gak terbit sama sekali selama berminggu-minggu. Aneh banget, tapi justru itu yang bikin auranya makin spektakuler.",
  },
];

const FAQ = [
  {
    q: "Apakah Indonesia bisa masuk Rusia tanpa visa?",
    a: "Belum. Indonesia perlu apply visa turis Rusia (tourist visa). Prosesnya bisa lewat kedutaan Rusia di Jakarta atau agen perjalanan. Perkirakan 2–3 minggu sebelum keberangkatan.",
  },
  {
    q: "Berapa lama penerbangan dari Jakarta ke Murmansk?",
    a: "Tidak ada penerbangan langsung. Rutenya biasanya Jakarta → Dubai/Doha → Moskow → Murmansk. Total sekitar 18–22 jam dengan transit. Dari Moskow ke Murmansk bisa naik pesawat (~2 jam) atau kereta malam (~30 jam, lebih seru!).",
  },
  {
    q: "Kapan waktu terbaik lihat aurora di Murmansk?",
    a: "Oktober sampai Maret adalah window-nya. Puncaknya Desember–Februari karena langit paling gelap (polar night). Tapi ingat: aurora itu fenomena alam, tidak ada yang bisa garansi 100%. Minimal 5–7 hari biar peluangnya bagus.",
  },
  {
    q: "Berapa budget yang dibutuhkan?",
    a: "Estimasi kasar untuk 7–10 hari: tiket PP Rp 12–18 juta, hotel Rp 4–8 juta, activities Rp 5–10 juta, makan & transport Rp 3–5 juta. Total sekitar Rp 25–45 juta/orang. Tapi dengan paket tur, bisa lebih efisien karena sudah bundled.",
  },
  {
    q: "Apa yang harus dibawa ke Murmansk?",
    a: "Jaket thermal berlapis, base layer wool (bukan katun), sepatu boots waterproof, sarung tangan tebal, topi penutup telinga, kacamata ski, dan hand warmer sebanyak-banyaknya. Ingat: -25°C itu bukan bercanda.",
  },
  {
    q: "Apakah makanan halal tersedia di Murmansk?",
    a: "Murmansk kota kecil, pilihan halal terbatas. Bawa mie instan, snack halal dari Indonesia. Seafood (ikan, salmon) biasanya aman. Beberapa restoran bisa accommodate request tapi jangan terlalu berharap.",
  },
];

export default async function MurmanskPage() {
  const { wa, tours, relatedPosts } = await getData();

  const waMsg = encodeURIComponent("Halo Sundaftrip! Saya tertarik dengan paket wisata Murmansk / Aurora Borealis. Bisa tolong info lebih lanjut?");
  const waUrl = wa ? `https://wa.me/${wa}?text=${waMsg}` : "#";

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      {/* ── HERO ── */}
      <div className="relative h-[70vh] min-h-[480px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-green-950 to-indigo-950" />
        {/* Aurora gradient overlay */}
        <div className="absolute inset-0 opacity-40" style={{
          background: "radial-gradient(ellipse at 20% 50%, #00ff88 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, #8b5cf6 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #06b6d4 0%, transparent 40%)",
        }} />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium mb-4">
            <MapPin size={12} /> Rusia · Eropa
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
            Murmansk &<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
              Aurora Borealis
            </span>
          </h1>
          <p className="text-white/75 text-lg max-w-xl mb-8">
            Kota di atas Lingkar Arktik. Tempat matahari gak terbit selama berminggu-minggu — dan langitnya meledak dengan cahaya hijau magis yang bikin lo nangis.
          </p>
          {wa && (
            <a href={waUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500 hover:bg-green-400 text-white font-bold text-sm transition shadow-lg shadow-green-900/40">
              <MessageCircle size={16} /> Tanya Paket Sekarang
            </a>
          )}
        </div>
      </div>

      {/* ── QUICK FACTS ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_FACTS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-green-50 dark:bg-green-900/30 shrink-0">
                <Icon size={16} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-20 pb-24">

        {/* ── KENAPA MURMANSK ── */}
        <section>
          <span className="text-xs font-bold tracking-widest text-green-600 dark:text-green-400 uppercase">Tentang Destinasi</span>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2 mb-6">
            Kenapa Murmansk, Bukan Finlandia atau Norwegia?
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <p>
              Jujur, kalau lo mau lihat aurora, Finlandia dan Norwegia memang lebih "mainstream". Lebih banyak travel agency, lebih mudah diakses, bahasa Inggrisnya lebih luas. Tapi justru itu masalahnya — lo bakal ketemu ratusan turis lain yang sama-sama angkat HP buat foto langit yang sama.
            </p>
            <p>
              Murmansk menawarkan sesuatu yang berbeda: <strong>keaslian</strong>. Ini kota industri Arktik yang nyata, bukan desa wisata yang didesain buat turis. Penduduknya keras tapi hangat, landscape-nya brutal tapi cantik, dan auranya? Sama spektakularnya — tapi lo bisa nikmatin tanpa berdesakan.
            </p>
            <p>
              Plus satu hal yang sering orang lupakan: Murmansk adalah kota terbesar di dunia yang berada di dalam Lingkar Arktik. Infrastrukturnya jauh lebih lengkap dari yang lo bayangkan — ada hotel proper, restoran, museum kelas dunia, dan transportasi yang berfungsi meski di tengah badai salju -25°C.
            </p>
          </div>
        </section>

        {/* ── AURORA GUIDE ── */}
        <section className="bg-gradient-to-br from-slate-900 to-green-950 rounded-3xl p-8 lg:p-12 text-white">
          <span className="text-xs font-bold tracking-widest text-green-400 uppercase">Panduan Aurora</span>
          <h2 className="text-3xl font-black mt-2 mb-8">Aurora Borealis: Yang Perlu Lo Tau</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "Waktu Terbaik", content: "Oktober–Maret adalah musim aurora. Puncaknya Desember–Februari saat terjadi Polar Night (matahari gak terbit sama sekali). Langit paling gelap = aurora paling terlihat." },
              { title: "Kapan Muncul?", content: "Biasanya antara pukul 21.00–02.00 waktu lokal. Aurora gak bisa diprediksi 100%, tapi ada aplikasi seperti SpaceWeatherLive dan My Aurora Forecast yang bisa bantu." },
              { title: "Tips Foto Aurora", content: "Pakai tripod, set ISO 800–3200, aperture f/2.8 atau lebih lebar, shutter 5–15 detik. Tangan gemetar karena dingin? Gunakan remote shutter atau timer." },
              { title: "Hindari Polusi Cahaya", content: "Keluar dari pusat kota Murmansk. Spot terbaik: Kola Peninsula, tepian Danau Seydozero, atau ikut aurora hunting tour yang bawa lo ke titik gelap terbaik." },
              { title: "Durasi yang Realistis", content: "Minimal 5 malam di Murmansk agar peluang lihat aurora bagus. Idealnya 7–10 malam. Jangan datang cuma 2 malam dan berharap pasti kena." },
              { title: "Persiapan Fisik", content: "Menunggu aurora bisa 1–3 jam di luar dengan suhu -20°C. Bawa hand warmer, pakai berlapis, dan jangan lupa minum teh panas dari termos. Serius, ini penting." },
            ].map(({ title, content }) => (
              <div key={title} className="flex gap-3">
                <div className="w-1 rounded-full bg-green-400 shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-white mb-1">{title}</p>
                  <p className="text-white/70 text-sm leading-relaxed">{content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ACTIVITIES ── */}
        <section>
          <span className="text-xs font-bold tracking-widest text-green-600 dark:text-green-400 uppercase">Aktivitas</span>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2 mb-8">
            Apa yang Bisa Lo Lakuin di Murmansk
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACTIVITIES.map(({ emoji, title, desc }) => (
              <div key={title} className="bg-gray-50 dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800">
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CARA KE SANA ── */}
        <section>
          <span className="text-xs font-bold tracking-widest text-green-600 dark:text-green-400 uppercase">Perjalanan dari Indonesia</span>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2 mb-6">
            Cara ke Murmansk dari Jakarta
          </h2>
          <div className="space-y-4">
            {[
              { step: "01", title: "Jakarta → Moskow", desc: "Penerbangan tidak langsung via Dubai (Emirates), Doha (Qatar Airways), atau Abu Dhabi (Etihad). Durasi total sekitar 12–15 jam. Harga tiket Jakarta–Moskow PP berkisar Rp 10–18 juta tergantung maskapai dan musim." },
              { step: "02", title: "Moskow → Murmansk", desc: "Opsi 1: Penerbangan Aeroflot atau Pobeda, sekitar 2 jam, harga Rp 400–800 ribu. Opsi 2: Kereta malam \"Arktika\" dari Moskow Leningradsky Station, 30 jam — tapi ini experience tersendiri, lo tidur sambil melewati hutan birch Rusia yang perlahan berubah jadi tundra." },
              { step: "03", title: "Di Murmansk", desc: "Kota ini kompak dan bisa dijelajahi dengan taksi atau angkutan lokal. Sewa mobil dengan sopir sangat direkomendasikan untuk aurora hunting ke luar kota. Bahasa Inggris terbatas — Google Translate offline wajib download." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <span className="text-xs font-black text-green-700 dark:text-green-300">{step}</span>
                </div>
                <div className="flex-1 pb-4 border-b border-gray-100 dark:border-slate-800 last:border-0">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BUDGET ── */}
        <section className="bg-gray-50 dark:bg-slate-900 rounded-3xl p-8">
          <span className="text-xs font-bold tracking-widest text-green-600 dark:text-green-400 uppercase">Estimasi Budget</span>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-2 mb-6">
            Berapa yang Harus Lo Siapkan?
          </h2>
          <div className="space-y-3">
            {[
              { item: "Tiket pesawat PP (Jakarta–Moskow–Murmansk)", low: "12.000.000", high: "20.000.000" },
              { item: "Akomodasi 7 malam (hotel bintang 3)", low: "4.000.000", high: "8.000.000" },
              { item: "Aurora hunting & activities", low: "5.000.000", high: "12.000.000" },
              { item: "Makan & transport lokal", low: "3.000.000", high: "5.000.000" },
              { item: "Visa turis Rusia", low: "700.000", high: "1.500.000" },
              { item: "Asuransi perjalanan", low: "500.000", high: "1.000.000" },
            ].map(({ item, low, high }) => (
              <div key={item} className="flex items-center justify-between gap-4 py-3 border-b border-gray-200 dark:border-slate-800 last:border-0">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                  Rp {low} – {high}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 pt-4">
              <span className="font-black text-gray-900 dark:text-white">Total Estimasi</span>
              <span className="font-black text-green-600 dark:text-green-400 text-lg">Rp 25 – 47 juta / orang</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            * Estimasi kasar untuk 7–10 hari. Harga bisa berubah. Dengan paket tur Sundaftrip, biasanya lebih hemat karena sudah bundled.
          </p>
        </section>

        {/* ── PAKET TOUR (dari DB) ── */}
        {tours.length > 0 && (
          <section>
            <span className="text-xs font-bold tracking-widest text-green-600 dark:text-green-400 uppercase">Paket Tersedia</span>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2 mb-6">
              Paket Tour Rusia dari Sundaftrip
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tours.map((tour) => (
                <Link key={tour.id} href={`/tours/${tour.id}`}
                  className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 hover:border-green-300 dark:hover:border-green-700 hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-44 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    {tour.heroImg
                      ? <Image src={tour.heroImg} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="flex items-center justify-center h-full"><MapPin size={28} className="text-gray-300" /></div>}
                    {tour.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-[11px] font-semibold bg-green-600">{tour.badge}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{tour.country} · {tour.duration}</p>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-3">{tour.title}</h3>
                    <p className="text-green-600 dark:text-green-400 font-black">
                      {tour.promoPrice ? formatCurrency(tour.promoPrice) : formatCurrency(tour.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/tours?continent=Eropa" className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400 font-semibold hover:underline">
                Lihat semua paket Eropa <ChevronRight size={16} />
              </Link>
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        <section>
          <span className="text-xs font-bold tracking-widest text-green-600 dark:text-green-400 uppercase">FAQ</span>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2 mb-8">
            Pertanyaan yang Sering Ditanya
          </h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                  <Star size={16} className="text-green-500 mt-0.5 shrink-0" />
                  {q}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-6">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ARTIKEL TERKAIT ── */}
        {relatedPosts.length > 0 && (
          <section>
            <span className="text-xs font-bold tracking-widest text-green-600 dark:text-green-400 uppercase">Baca Juga</span>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2 mb-6">
              Artikel Seputar Rusia & Eropa
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}
                  className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 hover:border-green-300 dark:hover:border-green-700 hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-36 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    {post.cover
                      ? <Image src={post.cover} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="flex items-center justify-center h-full"><Camera size={24} className="text-gray-300" /></div>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
                      <Clock size={10} /> {post.readTime}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        {wa && (
          <section className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-10 text-center text-white">
            <h2 className="text-3xl font-black mb-3">Siap Berburu Aurora?</h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Tim Sundaftrip siap bantu lo rencanakan perjalanan ke Murmansk dari A sampai Z — visa, tiket, hotel, dan aurora hunting guide lokal yang berpengalaman.
            </p>
            <a href={waUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-green-700 font-black text-sm hover:bg-green-50 transition shadow-lg">
              <MessageCircle size={18} /> Chat WhatsApp Sekarang
            </a>
          </section>
        )}

      </div>
    </div>
  );
}
