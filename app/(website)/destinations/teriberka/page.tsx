import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, Clock, MessageCircle, Star, ChevronRight, Plane, Thermometer, Camera, Wallet, Calendar } from "lucide-react";
import { formatCurrency, toWaNumber } from "@/lib/utils";
import ActivityVideo from "@/components/website/ActivityVideo";

// CATATAN FOTO: Aurora (foto) + Whale Watching & Kuburan Kapal (video) sudah sesuai.
// MASIH perlu foto Teriberka yang BENAR untuk: Pantai Telur Naga (kini foto king
// crab), Air Terjun Batareyskiy (kini snowmobile), Jejak Film Leviathan (kini
// kereta rusa). Ganti URL `img` di entri ACTIVITIES terkait bila foto sudah ada.

export const metadata: Metadata = {
  title: "Wisata Teriberka, Desa di Ujung Dunia & Laut Barents, Sundaftrip",
  description:
    "Panduan lengkap wisata Teriberka, Rusia untuk traveler Indonesia: cara ke sana dari Murmansk, whale watching Laut Barents, aurora borealis, pantai telur naga, lokasi film Leviathan, dan estimasi budget dalam rupiah.",
  keywords: [
    "wisata teriberka", "teriberka rusia", "whale watching teriberka",
    "aurora borealis teriberka", "lokasi film leviathan", "laut barents",
    "paket tour teriberka indonesia", "wisata rusia dari jakarta", "sundaftrip rusia",
  ],
  openGraph: {
    title: "Wisata Teriberka, Desa di Ujung Dunia, Sundaftrip",
    description: "Panduan lengkap wisata Teriberka Rusia untuk traveler Indonesia. Cara ke sana, paus Laut Barents, aurora, budget IDR.",
    type: "article",
    images: [{ url: "https://res.cloudinary.com/dlmgl1grq/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/v1778586061/WhatsApp_Image_2026-05-12_at_18.27.58_xusryb.jpg", width: 1200, height: 630, alt: "Teriberka di tepi Laut Barents, Rusia bersama Sundaf Trip" }],
  },
  alternates: { canonical: "https://sundaftrip.com/destinations/teriberka" },
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
          { title: { contains: "teriberka", mode: "insensitive" } },
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
          { title: { contains: "teriberka", mode: "insensitive" } },
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
  return {
    wa: toWaNumber(company["company_whatsapp"]),
    theme: company["site_theme"] ?? "classic",
    tours,
    relatedPosts,
  };
}

const QUICK_FACTS = [
  { icon: MapPin,      label: "Jarak dari Murmansk", value: "±120 km (2–3 jam mobil)" },
  { icon: Calendar,    label: "Waktu terbaik",        value: "Aurora: Okt–Mar · Paus: Jun–Okt" },
  { icon: Thermometer, label: "Suhu musim dingin",    value: "-8°C s/d -22°C" },
  { icon: Wallet,      label: "Estimasi day-trip",    value: "Rp 1,5–3 juta/orang" },
];

const ACTIVITIES: { img: string; title: string; desc: string; video?: string }[] = [
  { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/v1778586061/WhatsApp_Image_2026-05-12_at_18.25.04_bghn1q.jpg", title: "Berburu Aurora Borealis", desc: "Jauh dari polusi cahaya kota, langit Teriberka jadi salah satu kanvas aurora paling gelap dan jernih di Kola Peninsula. Bulan terbaik: Desember–Februari." },
  // Video whale-watching (Cloudinary). Di-optimasi on-the-fly: q_auto:eco,w_640 ≈ 3 MB (asli 44 MB).
  // `img` dipakai sebagai poster (frame awal sebelum autoplay video jalan).
  { video: "https://res.cloudinary.com/dlmgl1grq/video/upload/q_auto:eco,w_640/20260131_121402_etevcv.mp4", img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/w_640/v1778586061/WhatsApp_Image_2026-05-12_at_18.27.58_xusryb.jpg", title: "Whale Watching Laut Barents", desc: "Naik perahu menyusuri Laut Barents untuk melihat paus bungkuk dan paus beluga di habitat aslinya. Musim terbaik Juni–Oktober saat laut tidak membeku." },
  { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/v1778586062/WhatsApp_Image_2026-05-12_at_18.23.40_ht8etl.jpg", title: "Pantai Telur Naga", desc: "Hamparan batu bulat raksasa hasil tempaan ombak ribuan tahun di tepi pantai. Orang lokal menyebutnya 'telur dinosaurus', spot foto paling ikonik di Teriberka." },
  // Video perahu tua di teluk (Cloudinary). Di-optimasi q_auto:eco,w_540,du_10 ≈ 3 MB.
  { video: "https://res.cloudinary.com/dlmgl1grq/video/upload/q_auto:eco,w_540,du_10/20260127_130726_wmoh3n.mp4", img: "https://res.cloudinary.com/dlmgl1grq/video/upload/so_5,w_640,q_auto/20260127_130726_wmoh3n.jpg", title: "Kuburan Kapal & Bangkai Paus", desc: "Bangkai kapal nelayan tua yang teronggok di teluk dan kerangka paus di pantai. Pemandangan magis-melankolis yang membuat Teriberka terasa seperti negeri lain." },
  { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/v1778586767/WhatsApp_Image_2026-05-12_at_18.48.44_c45msv.jpg", title: "Air Terjun Batareyskiy", desc: "Trek menyusuri tebing menuju air terjun yang jatuh langsung dari danau ke Laut Barents. Pemandangan tundra Arktik yang keras tapi memukau." },
  { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/v1778586061/WhatsApp_Image_2026-05-12_at_18.34.36_zfojhy.jpg", title: "Jejak Film Leviathan", desc: "Teriberka adalah lokasi syuting film 'Leviathan' (nominasi Oscar 2015). Susuri lanskap dramatis yang membuat desa kecil ini mendunia." },
];

const FAQ = [
  { q: "Teriberka itu di mana?", a: "Teriberka adalah desa nelayan terpencil di tepi Laut Barents, Kola Peninsula, Rusia. Berjarak sekitar 120 km dari Murmansk, ditempuh 2–3 jam berkendara melewati jalan tundra P-10." },
  { q: "Bagaimana cara ke Teriberka?", a: "Tidak ada transportasi umum reguler. Cara paling umum adalah sewa mobil + sopir atau ikut day-tour dari Murmansk. Saat musim dingin, jalan bisa ditutup sementara karena badai salju, jadi jadwal harus fleksibel." },
  { q: "Kapan waktu terbaik melihat paus?", a: "Musim paus di Laut Barents berlangsung Juni–Oktober saat laut tidak membeku. Untuk aurora, datang Oktober–Maret. Kalau ingin keduanya, awal musim gugur (September–awal Oktober) adalah jendela terbaik." },
  { q: "Apakah aurora di Teriberka lebih bagus dari Murmansk?", a: "Secara peluang teknis, ya. Teriberka jauh lebih gelap karena minim polusi cahaya, jadi aurora terlihat lebih jelas. Banyak aurora hunter dari Murmansk justru mengejar titik gelap ke arah Teriberka." },
  { q: "Berapa lama sebaiknya di Teriberka?", a: "Day-trip dari Murmansk (berangkat pagi, pulang malam) sudah cukup untuk highlight utama. Tapi kalau ingin mengejar aurora dengan tenang, menginap 1 malam di guesthouse lokal sangat layak." },
  { q: "Bagaimana penginapan dan makanan di Teriberka?", a: "Pilihan terbatas: beberapa guesthouse dan glamping kecil, serta sedikit kafe/restoran seafood. Pilihan halal nyaris tidak ada, jadi bawa snack & mie instan dari Indonesia. Seafood segar (ikan, kepiting) biasanya aman." },
];

export default async function TeriberkaPage() {
  const { wa, theme, tours, relatedPosts } = await getData();

  /* ── theme helpers (same pattern as tours/page.tsx) ── */
  const isKawaii   = theme === "kawaii";
  const isTropical = theme === "tropical";
  const isPixel    = theme === "pixel";
  const isGlobe    = theme === "globe";
  const isMap      = theme === "map";
  const isFumayo   = theme === "fumayo";
  const isOutlined = isKawaii || isTropical || isPixel || isGlobe || isMap || isFumayo;

  const pageBg  = isFumayo ? "var(--fb-bg)" : isKawaii ? "var(--kw-bg)" : isTropical ? "var(--tr-bg)" : isPixel ? "var(--px-bg)" : isGlobe ? "var(--gl-bg)" : isMap ? "var(--mp-bg)" : undefined;
  const headClr = isFumayo ? "var(--fb-text)" : isKawaii ? "var(--kw-text)" : isTropical ? "var(--tr-text)" : isPixel ? "var(--px-text)" : isGlobe ? "var(--gl-text)" : isMap ? "var(--mp-text)" : undefined;
  const subClr  = isFumayo ? "var(--fb-subtext)" : isKawaii ? "var(--kw-subtext)" : isTropical ? "var(--tr-subtext)" : isPixel ? "var(--px-subtext)" : isGlobe ? "var(--gl-subtext)" : isMap ? "var(--mp-subtext)" : undefined;
  const cardBg  = isFumayo ? "var(--fb-card)" : isKawaii ? "var(--kw-card)" : isTropical ? "var(--tr-card)" : isPixel ? "var(--px-card)" : isGlobe ? "var(--gl-card)" : isMap ? "var(--mp-card)" : undefined;
  const bdrClr  = isFumayo ? "var(--fb-border)" : isKawaii ? "var(--kw-border)" : isTropical ? "var(--tr-border)" : isPixel ? "var(--px-border)" : isGlobe ? "color-mix(in srgb, var(--gl-border) 40%, transparent)" : isMap ? "var(--mp-border)" : undefined;

  const pageGrid = isPixel ? { backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)", backgroundSize: "24px 24px" }
    : isMap ? { backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }
    : isFumayo ? { backgroundImage: "linear-gradient(var(--fb-grid) 1px,transparent 1px),linear-gradient(90deg,var(--fb-grid) 1px,transparent 1px)", backgroundSize: "26px 26px", fontFamily: "var(--fb-font)" }
    : {};

  const wrapperStyle = pageBg ? { background: pageBg, ...pageGrid } : {};

  /* Accent-based helpers */
  const accentStyle = isKawaii   ? { background: "var(--kw-border)", color: "#fff" }
                    : isTropical ? { background: "var(--site-accent)", color: "#fff" }
                    : isPixel    ? { background: "var(--px-cyan)", color: "var(--px-on-cyan)" }
                    : isGlobe    ? { background: "var(--gl-border)", color: "#fff" }
                    : isMap      ? { background: "var(--mp-accent)", color: "var(--mp-on-accent)" }
                    : { background: "var(--site-accent,#2d6a4f)", color: "#fff" };

  const eyebrowStyle = isKawaii   ? { background: "var(--kw-peach)", color: "var(--kw-text)" }
                     : isTropical ? { background: "var(--tr-mint)", color: "var(--tr-text)" }
                     : isPixel    ? { background: "var(--px-cyan)", color: "var(--px-on-cyan)" }
                     : isGlobe    ? { background: "var(--gl-sky)", color: "var(--gl-on-sky)", borderColor: "transparent" }
                     : isMap      ? { background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }
                     : { background: "var(--site-accent,#2d6a4f)", color: "#fff", opacity: 0.9 };

  const pillClass = isKawaii ? "kw-pill" : isTropical ? "tr-pill" : isPixel ? "px-pill" : isGlobe ? "gl-pill" : isMap ? "mp-pill" : "rounded-full px-3 py-1 text-xs font-medium";

  const cardClass = isKawaii ? "kw-card" : isTropical ? "tr-card" : isPixel ? "px-card" : isGlobe ? "gl-card" : isMap ? "mp-card"
    : "bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800";

  const waMsg = encodeURIComponent("Halo Sundaftrip! Saya tertarik dengan paket wisata Teriberka (Laut Barents / aurora / whale watching). Bisa tolong info lebih lanjut?");
  const waUrl = wa ? `https://wa.me/${wa}?text=${waMsg}` : "#";

  return (
    <div className={`min-h-screen ${!isOutlined ? "bg-white dark:bg-slate-950" : ""}`} style={wrapperStyle}>

      {/* ── SEO: structured data (Article + Breadcrumb + FAQ) ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: "Wisata Teriberka, Desa di Ujung Dunia & Laut Barents",
              description: "Panduan lengkap wisata Teriberka, Rusia untuk traveler Indonesia: cara ke sana dari Murmansk, whale watching, aurora borealis, pantai telur naga, lokasi film Leviathan, dan estimasi budget.",
              image: "https://res.cloudinary.com/dlmgl1grq/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/v1778586061/WhatsApp_Image_2026-05-12_at_18.27.58_xusryb.jpg",
              inLanguage: "id-ID",
              mainEntityOfPage: "https://sundaftrip.com/destinations/teriberka",
              author: { "@type": "Organization", name: "Sundaf Trip", url: "https://sundaftrip.com" },
              publisher: { "@type": "Organization", name: "Sundaf Trip", url: "https://sundaftrip.com" },
              about: [
                { "@type": "TouristDestination", name: "Teriberka", address: { "@type": "PostalAddress", addressCountry: "RU" } },
                { "@type": "Thing", name: "Aurora Borealis (Northern Lights)" },
                { "@type": "Thing", name: "Whale Watching, Laut Barents" },
                { "@type": "TouristDestination", name: "Murmansk", address: { "@type": "PostalAddress", addressCountry: "RU" } },
              ],
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Beranda", item: "https://sundaftrip.com" },
                { "@type": "ListItem", position: 2, name: "Destinasi", item: "https://sundaftrip.com/destinations" },
                { "@type": "ListItem", position: 3, name: "Teriberka", item: "https://sundaftrip.com/destinations/teriberka" },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQ.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }) }}
      />

      {/* ── HERO ── */}
      <div className="relative h-[72vh] min-h-[520px] flex items-end">
        {/* Hero: frame asli dari footage Teriberka (perahu tua di teluk membeku) */}
        <Image
          src="https://res.cloudinary.com/dlmgl1grq/video/upload/so_5,w_1920,h_1080,c_fill,q_auto/20260127_130726_wmoh3n.jpg"
          alt="Perahu nelayan tua di teluk Teriberka yang membeku, tepi Laut Barents, Rusia"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Cinematic overlay, bawah gelap agar teks terbaca */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.52) 42%, rgba(0,0,0,0.15) 100%)",
        }} />
        {/* Side vignette */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to right, rgba(0,0,0,0.30) 0%, transparent 50%)",
        }} />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-14">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-1.5 mb-5 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.14)", color: "#fff", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.28)" }}>
            <MapPin size={11} />
            Rusia · Laut Barents
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight mb-5 tracking-tight"
            style={{ fontFamily: isPixel ? "monospace" : undefined }}>
            <span className="text-white drop-shadow-lg">
              {isPixel ? "TERIBERKA," : "Teriberka,"}
            </span>
            <br />
            {isPixel
              ? <span className="text-white drop-shadow-lg">DESA DI UJUNG DUNIA</span>
              : <span className="aurora-text aurora-glow">Desa di Ujung Dunia</span>
            }
          </h1>

          <p className="text-base sm:text-lg max-w-xl mb-8 text-white/80 leading-relaxed"
            style={{ fontFamily: isPixel ? "monospace" : undefined }}>
            {isPixel
              ? "> Desa nelayan di tepi Laut Barents. Paus, aurora, dan pantai telur naga di garis akhir daratan Rusia."
              : "Desa nelayan terpencil di tepi Laut Barents, tempat daratan Rusia berakhir. Paus bungkuk, aurora paling gelap, dan pantai batu raksasa yang membuat dunia terasa baru."}
          </p>

          {/* CTA, paket tour dulu, WA sebagai sekunder */}
          <div className="flex flex-wrap gap-3">
            {tours.length > 0 ? (
              <a href="#paket-tour"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-xl hover:scale-105"
                style={{ background: "var(--site-accent,#2d6a4f)", color: "#fff" }}>
                <Star size={15} />
                Lihat Paket Teriberka
              </a>
            ) : (
              <Link href="/tours"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-xl hover:scale-105"
                style={{ background: "var(--site-accent,#2d6a4f)", color: "#fff" }}>
                <Star size={15} />
                Lihat Semua Paket Tour
              </Link>
            )}
            {wa && (
              <a href={waUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition border-2 text-white hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.38)", backdropFilter: "blur(8px)" }}>
                <MessageCircle size={15} />
                Tanya via WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── QUICK FACTS ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_FACTS.map(({ icon: Icon, label, value }) => (
            <div key={label} className={`${cardClass} p-4`} style={cardBg ? { background: cardBg, borderColor: bdrClr } : {}}>
              <div className="flex items-start gap-3">
                <Icon size={16} className="mt-0.5 shrink-0" style={{ color: "var(--site-accent-ink,#2d6a4f)" }} />
                <div>
                  <p className={`text-[11px] font-medium mb-0.5 ${!isOutlined ? "text-gray-500 dark:text-gray-400" : ""}`} style={{ color: subClr }}>{label}</p>
                  <p className={`text-sm font-bold leading-tight ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr }}>{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-20 pb-24">

        {/* ── KENAPA TERIBERKA ── */}
        <section>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
            {isPixel ? "► TENTANG DESTINASI" : "Tentang Destinasi"}
          </span>
          <h2 className={`text-3xl font-black mt-3 mb-6 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Kenapa Harus Sampai ke Teriberka?
          </h2>
          <div className={`space-y-4 text-sm sm:text-base leading-relaxed ${!isOutlined ? "text-gray-700 dark:text-gray-100" : ""}`} style={{ color: isOutlined ? headClr : undefined }}>
            <p>Banyak yang berhenti di Murmansk dan pulang. Padahal 120 kilometer lebih jauh ke utara, di titik tempat daratan Rusia benar-benar berakhir, ada Teriberka, desa nelayan kecil di tepi Laut Barents yang terasa seperti ujung dunia.</p>
            <p>Teriberka bukan kota wisata. Ini desa yang sunyi, keras, dan jujur. Bangkai kapal teronggok di teluk, kerangka paus tergeletak di pantai, dan ombak Samudra Arktik menempa batu menjadi bulat sempurna selama ribuan tahun. Justru itulah yang membuatnya begitu memikat. Film <strong>Leviathan</strong> (nominasi Oscar 2015) mengambil lanskap dramatis Teriberka sebagai latar, dan sejak itu nama desa kecil ini mendunia.</p>
            <p>Buat traveler Indonesia, Teriberka menawarkan tiga hal sekaligus yang sulit ditemukan di satu tempat: aurora borealis di langit paling gelap, whale watching di Laut Barents, dan pemandangan tundra Arktik yang tidak akan pernah kamu lupakan.</p>
          </div>
        </section>

        {/* ── AURORA & ALAM GUIDE ── */}
        <section className={`${isOutlined ? "" : "rounded-3xl"} p-8 lg:p-12`}
          style={isOutlined
            ? { background: cardBg, border: `2px solid ${bdrClr}`, boxShadow: isPixel || isMap || isKawaii || isTropical ? `4px 4px 0 0 ${bdrClr}` : isGlobe ? "0 8px 32px var(--gl-shadow)" : undefined }
            : { background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 22%, #0c0c0c)" }}>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={isOutlined ? eyebrowStyle : { background: "rgba(255,255,255,0.15)", color: "#fff" }}>
            {isPixel ? "► PANDUAN ALAM" : "Panduan Alam"}
          </span>
          <h2 className={`text-2xl sm:text-3xl font-black mt-3 mb-8 ${!isOutlined ? "text-white" : ""}`}
            style={{ color: isOutlined ? headClr : undefined, fontFamily: isPixel ? "monospace" : undefined }}>
            Aurora, Paus & Laut Barents: Yang Perlu Kita Tahu
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "Aurora Paling Gelap", content: "Teriberka jauh dari polusi cahaya kota, jadi peluang aurora terlihat jelas lebih tinggi dari Murmansk. Musim aurora Oktober–Maret, puncaknya Desember–Februari." },
              { title: "Musim Paus", content: "Paus bungkuk dan beluga muncul di Laut Barents saat laut tidak membeku, Juni–Oktober. Trip perahu berangkat tergantung cuaca, jadi siapkan jadwal fleksibel." },
              { title: "Pantai Telur Naga", content: "Batu-batu bulat raksasa di pantai Teriberka, terbentuk oleh ombak Arktik selama ribuan tahun. Spot foto paling ikonik, terbaik saat matahari rendah." },
              { title: "Jalan Bisa Ditutup", content: "Akses Murmansk–Teriberka lewat jalan tundra P-10. Saat badai salju musim dingin, jalan bisa ditutup sementara. Selalu cek cuaca dan punya rencana cadangan." },
              { title: "Berapa Lama Ideal", content: "Day-trip dari Murmansk cukup untuk highlight. Tapi untuk berburu aurora dengan tenang, menginap 1 malam di guesthouse lokal jauh lebih nyaman." },
              { title: "Persiapan Fisik", content: "Angin Laut Barents membuat suhu terasa jauh lebih dingin. Pakai berlapis, base layer wool, jaket windproof, sarung tangan tebal, dan hand warmer." },
            ].map(({ title, content }) => (
              <div key={title} className="flex gap-3">
                <div className="w-1 rounded-full shrink-0 mt-1" style={{ background: "var(--site-accent,#2d6a4f)" }} />
                <div>
                  <p className={`font-bold mb-1 ${!isOutlined ? "text-white" : ""}`} style={{ color: isOutlined ? headClr : undefined }}>{title}</p>
                  <p className={`text-sm leading-relaxed ${!isOutlined ? "text-white/70" : ""}`} style={{ color: isOutlined ? subClr : undefined }}>{content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ACTIVITIES ── */}
        <section>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
            {isPixel ? "► AKTIVITAS" : "Aktivitas"}
          </span>
          <h2 className={`text-3xl font-black mt-3 mb-8 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Apa yang Bisa Kita Lakukan di Teriberka
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACTIVITIES.map(({ img, title, desc, video }) => (
              <div key={title} className={`${cardClass} overflow-hidden`} style={cardBg ? { background: cardBg, borderColor: bdrClr, boxShadow: (isPixel || isMap || isKawaii || isTropical) ? `3px 3px 0 0 ${bdrClr}` : undefined } : {}}>
                <div className="relative h-40 w-full overflow-hidden group">
                  {video ? (
                    <ActivityVideo video={video} poster={img} title={title} />
                  ) : (
                    <Image src={img} alt={title} fill className="object-cover transition-transform duration-500 hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  )}
                </div>
                <div className="p-5">
                  <h3 className={`font-bold mb-2 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>{title}</h3>
                  <p className={`text-sm leading-relaxed ${!isOutlined ? "text-gray-600 dark:text-gray-200" : ""}`} style={{ color: subClr }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CARA KE SANA ── */}
        <section>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
            {isPixel ? "► PERJALANAN DARI INDONESIA" : "Perjalanan dari Indonesia"}
          </span>
          <h2 className={`text-3xl font-black mt-3 mb-8 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Cara ke Teriberka dari Jakarta
          </h2>
          <div className="space-y-4">
            {[
              { step: "01", title: "Jakarta → Murmansk", desc: "Rutenya Jakarta → Dubai/Doha → Moskow → Murmansk, total ±18–22 jam. Detail lengkap rute dan budget ada di halaman destinasi Murmansk kami." },
              { step: "02", title: "Murmansk → Teriberka", desc: "±120 km lewat jalan tundra P-10, ditempuh 2–3 jam dengan mobil. Tidak ada bus reguler, jadi sewa mobil + sopir atau ikut day-tour. Di musim dingin jalan bisa ditutup saat badai, jadwal harus fleksibel." },
              { step: "03", title: "Di Teriberka", desc: "Desa kecil yang bisa dijelajahi jalan kaki. Untuk whale watching dan spot terpencil, pakai pemandu lokal. Sinyal dan fasilitas terbatas, download Google Translate & peta offline sebelum berangkat." },
            ].map(({ step, title, desc }, i, arr) => (
              <div key={step} className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-black text-xs"
                  style={accentStyle}>
                  {step}
                </div>
                <div className={`flex-1 pb-4 ${i < arr.length - 1 ? "border-b" : ""} ${!isOutlined ? "border-gray-100 dark:border-slate-800" : ""}`}
                  style={{ borderColor: i < arr.length - 1 ? bdrClr : undefined }}>
                  <h3 className={`font-bold mb-1 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr }}>{title}</h3>
                  <p className={`text-sm leading-relaxed ${!isOutlined ? "text-gray-600 dark:text-gray-400" : ""}`} style={{ color: subClr }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BUDGET ── */}
        <section className={`${isOutlined ? "" : "bg-gray-50 dark:bg-slate-900 rounded-3xl"} p-8`}
          style={isOutlined ? { background: cardBg, border: `2px solid ${bdrClr}`, boxShadow: (isPixel || isMap || isKawaii || isTropical) ? `4px 4px 0 0 ${bdrClr}` : undefined } : {}}>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
            {isPixel ? "► ESTIMASI BUDGET" : "Estimasi Budget"}
          </span>
          <h2 className={`text-2xl font-black mt-3 mb-6 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Berapa Tambahan Budget untuk Teriberka?
          </h2>
          <div className="space-y-0">
            {[
              { item: "Sewa mobil + sopir PP (day-trip dari Murmansk)", range: "Rp 1.200.000 – 2.500.000 / mobil" },
              { item: "Day-tour gabungan (aurora / Teriberka)", range: "Rp 1.500.000 – 3.000.000 / orang" },
              { item: "Whale watching boat trip (musim paus)", range: "Rp 1.500.000 – 3.500.000 / orang" },
              { item: "Menginap 1 malam (guesthouse / glamping)", range: "Rp 700.000 – 2.500.000 / malam" },
              { item: "Makan seafood lokal", range: "Rp 200.000 – 500.000 / orang" },
            ].map(({ item, range }) => (
              <div key={item} className={`flex items-center justify-between gap-4 py-3 border-b ${!isOutlined ? "border-gray-200 dark:border-slate-800" : ""}`}
                style={{ borderColor: bdrClr }}>
                <span className={`text-sm ${!isOutlined ? "text-gray-700 dark:text-gray-300" : ""}`} style={{ color: subClr }}>{item}</span>
                <span className={`text-sm font-bold whitespace-nowrap ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr }}>{range}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 pt-4">
              <span className={`font-black ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr }}>Estimasi Tambahan</span>
              <span className="font-black text-lg" style={{ color: "var(--site-accent-ink,#2d6a4f)" }}>Rp 2 – 6 juta / orang</span>
            </div>
          </div>
          <p className={`text-xs mt-4 ${!isOutlined ? "text-gray-400 dark:text-gray-600" : ""}`} style={{ color: subClr, opacity: 0.7 }}>
            * Estimasi tambahan di luar budget Murmansk. Dengan paket tur Sundaftrip, Teriberka biasanya sudah termasuk dalam itinerary Rusia Arktik.
          </p>
        </section>

        {/* ── PAKET TOUR dari DB ── */}
        <section id="paket-tour">
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
            {isPixel ? "► PAKET TERSEDIA" : "Paket Tersedia"}
          </span>
          <h2 className={`text-3xl font-black mt-3 mb-6 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Paket Tour Rusia dari Sundaftrip
          </h2>

          {tours.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tours.map((tour) => (
                  <Link key={tour.id} href={`/tours/${tour.slug ?? tour.id}`}
                    className={`group block overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isOutlined ? cardClass : "bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-300"}`}
                    style={cardBg ? { background: cardBg, borderColor: bdrClr } : {}}>
                    <div className="relative h-44 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                      {tour.heroImg
                        ? <Image src={tour.heroImg} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="flex items-center justify-center h-full"><MapPin size={28} className="text-gray-300" /></div>}
                      {tour.badge && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-[11px] font-semibold" style={accentStyle}>{tour.badge}</span>}
                    </div>
                    <div className="p-4">
                      <p className={`text-xs mb-1 ${!isOutlined ? "text-gray-500 dark:text-gray-400" : ""}`} style={{ color: subClr }}>{tour.country} · {tour.duration}</p>
                      <h3 className={`font-bold text-sm leading-tight mb-3 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>{tour.title}</h3>
                      <p className="font-black" style={{ color: "var(--site-accent-ink,#2d6a4f)" }}>
                        {(tour.promoPrice ?? tour.price) > 0 ? formatCurrency(tour.promoPrice ?? tour.price) : "Tanya Harga"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/tours" className="inline-flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: "var(--site-accent-ink,#2d6a4f)" }}>
                  Lihat semua paket tour <ChevronRight size={16} />
                </Link>
              </div>
            </>
          ) : (
            /* Fallback: belum ada paket aktif → arahkan ke halaman tour */
            <div className={`${isOutlined ? cardClass : "bg-gray-50 dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700"} p-8 text-center`}
              style={cardBg ? { background: cardBg, borderColor: bdrClr } : {}}>
              <div className="text-4xl mb-3">🐋</div>
              <h3 className={`font-bold mb-2 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr }}>
                Paket Teriberka Segera Hadir
              </h3>
              <p className={`text-sm mb-5 ${!isOutlined ? "text-gray-500 dark:text-gray-400" : ""}`} style={{ color: subClr }}>
                Tim kami sedang mempersiapkan keberangkatan Rusia Arktik berikutnya, termasuk ekskursi ke Teriberka. Sementara itu, jelajahi paket destinasi lain.
              </p>
              <Link href="/tours"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition hover:opacity-90"
                style={{ background: "var(--site-accent,#2d6a4f)", color: "#fff" }}>
                Jelajahi Semua Paket Tour <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </section>

        {/* ── FAQ ── */}
        <section>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
            FAQ
          </span>
          <h2 className={`text-3xl font-black mt-3 mb-8 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Pertanyaan yang Sering Ditanya
          </h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className={`${isOutlined ? cardClass : "border border-gray-200 dark:border-slate-800 rounded-2xl"} p-6`}
                style={cardBg ? { background: cardBg, borderColor: bdrClr, boxShadow: (isPixel || isMap || isKawaii || isTropical) ? `3px 3px 0 0 ${bdrClr}` : undefined } : {}}>
                <h3 className={`font-bold mb-3 flex items-start gap-2 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
                  <Star size={14} className="mt-0.5 shrink-0" style={{ color: "var(--site-accent-ink,#2d6a4f)" }} />
                  {q}
                </h3>
                <p className={`text-sm leading-relaxed pl-5 ${!isOutlined ? "text-gray-600 dark:text-gray-400" : ""}`} style={{ color: subClr }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ARTIKEL TERKAIT ── */}
        {relatedPosts.length > 0 && (
          <section>
            <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
              {isPixel ? "► BACA JUGA" : "Baca Juga"}
            </span>
            <h2 className={`text-3xl font-black mt-3 mb-6 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
              style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
              Artikel Seputar Rusia & Eropa
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}
                  className={`group block overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isOutlined ? cardClass : "bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-300"}`}
                  style={cardBg ? { background: cardBg, borderColor: bdrClr } : {}}>
                  <div className="relative h-36 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    {post.cover
                      ? <Image src={post.cover} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="flex items-center justify-center h-full"><Camera size={24} className="text-gray-300" /></div>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 text-[11px] mb-2" style={{ color: subClr ?? "var(--color-gray-400)" }}>
                      <Clock size={10} /> {post.readTime}
                    </div>
                    <h3 className={`font-bold text-sm leading-tight line-clamp-2 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        {wa && (
          <section className={`${isOutlined ? "" : "rounded-3xl"} p-10 text-center`}
            style={isOutlined
              ? { background: cardBg, border: `2px solid ${bdrClr}`, boxShadow: (isPixel || isMap || isKawaii || isTropical) ? `6px 6px 0 0 ${bdrClr}` : undefined }
              : { background: "var(--site-accent,#2d6a4f)" }}>
            <h2 className={`text-3xl font-black mb-3 ${!isOutlined ? "text-white" : ""}`}
              style={{ color: isOutlined ? headClr : undefined, fontFamily: isPixel ? "monospace" : undefined }}>
              {isPixel ? "> SIAP KE UJUNG DUNIA?" : isKawaii ? "Siap ke Ujung Dunia? ✨" : "Siap ke Ujung Dunia?"}
            </h2>
            <p className={`mb-8 max-w-lg mx-auto text-sm sm:text-base ${!isOutlined ? "text-white/80" : ""}`} style={{ color: subClr }}>
              Tim Sundaftrip siap bantu Anda merencanakan perjalanan ke Teriberka dari awal sampai akhir: visa, tiket, transport Murmansk–Teriberka, whale watching, dan aurora hunting guide lokal.
            </p>
            <a href={waUrl} target="_blank" rel="noreferrer"
              className={`inline-flex items-center gap-2 px-8 py-4 font-black text-sm transition ${isOutlined ? pillClass : "rounded-full bg-white hover:bg-gray-50"}`}
              style={isOutlined ? accentStyle : { color: "var(--site-accent-ink,#2d6a4f)" }}>
              <MessageCircle size={18} />
              {isPixel ? "[ CHAT WHATSAPP SEKARANG ]" : "Chat WhatsApp Sekarang"}
            </a>
          </section>
        )}

      </div>
    </div>
  );
}
