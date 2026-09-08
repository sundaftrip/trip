import Image from "next/image";
import Link from "@/components/website/clean/PreserveScrollLink";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Download, Mail, MapPin, Plane, Users, Wifi } from "lucide-react";
import StableDetails from "@/components/website/clean/StableDetails";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import LatinAmericaPricePanel from "./LatinAmericaPricePanel";
import LatinAmericaPhotoCredit from "./LatinAmericaPhotoCredit";
import { LATIN_AMERICA_BROCHURE, type LatinAmericaProgramme as Programme } from "@/lib/latin-america";
import { LATIN_AMERICA_PACKAGES } from "@/lib/latin-america-packages";
import { rupiahMillions } from "@/lib/latin-america-package-types";
import { serializeJsonLd } from "@/lib/safe-json-ld";
import styles from "./LatinAmerica.module.css";

export default function LatinAmericaProgramme({ programme }: { programme: Programme }) {
  const detail = LATIN_AMERICA_PACKAGES[programme.id];
  const schema = {
    "@context": "https://schema.org", "@type": "TouristTrip",
    "@id": `https://sundaftrip.com${programme.href}#trip`,
    url: `https://sundaftrip.com${programme.href}`, name: programme.title,
    description: `${programme.summary} ${detail.duration}. Estimasi mulai ${rupiahMillions(detail.price.from)} per orang untuk 20 peserta; harga akhir dikonfirmasi sesuai tanggal.`,
    image: `https://sundaftrip.com${programme.image}`,
    touristType: "Group travel", provider: { "@id": "https://sundaftrip.com#organization" },
    itinerary: { "@type": "ItemList", itemListElement: detail.days.map((day, index) => ({ "@type": "ListItem", position: index + 1, name: day.title, description: day.description })) },
  };
  return (
    <div className={styles.page} id="main-content">
      <BreadcrumbSchema crumbs={[{ name: "Beranda", url: "/" }, { name: "Amerika Latin", url: "/amerika-latin" }, { name: programme.title, url: programme.href }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <section className={styles.detailHero}>
        <div className={styles.shell}>
          <Link scroll data-scroll-reset-after-navigation className={styles.back} href="/amerika-latin"><ArrowLeft size={16} aria-hidden="true" /> Katalog Amerika Latin</Link>
          <div className={styles.heroGrid}>
            <div>
              <p className={styles.eyebrow}>{programme.eyebrow} · 2027</p><h1>{programme.title}</h1><p className={styles.lead}>{programme.summary}</p>
              <ul className={styles.tripFacts}><li><CalendarDays size={17} aria-hidden="true" /> {detail.duration}</li><li><Users size={17} aria-hidden="true" /> Acuan 20 peserta + 1 tour leader</li><li><Plane size={17} aria-hidden="true" /> Anggaran penerbangan PP dari Jakarta</li></ul>
              <div className={styles.heroPrice}><span>Estimasi mulai</span><strong>{rupiahMillions(detail.price.from)}</strong><small>per orang · kamar berdua</small></div>
              <div className={styles.actions}><a href="#harga" className={styles.primary}>Lihat harga & pilihan tambahan <ArrowRight size={18} aria-hidden="true" /></a><a href={LATIN_AMERICA_BROCHURE} className={styles.secondary} download><Download size={17} aria-hidden="true" /> Unduh katalog</a></div>
            </div>
            <figure className={styles.heroPhoto}><Image src={programme.image} alt={programme.imageAlt} fill priority quality={90} sizes="(max-width: 760px) 100vw, 50vw" /><figcaption><LatinAmericaPhotoCredit image={programme.image} /></figcaption></figure>
          </div>
        </div>
      </section>
      <nav className={styles.packageNav} aria-label="Bagian paket"><div className={styles.shell}><a href="#itinerary">Itinerary</a><a href="#harga">Harga & opsional</a><a href="#layanan">Termasuk / terpisah</a><a href="#hotel">Hotel</a><a href="#penerbangan">Penerbangan</a></div></nav>

      <section className={`${styles.section} ${styles.shell}`} id="itinerary" aria-labelledby="route-heading">
        <div className={styles.sectionIntro}><p className={styles.eyebrow}>PERJALANAN HARI DEMI HARI</p><h2 id="route-heading">Itinerary {programme.id === "peru" ? "Peru" : "empat negara"}</h2><p>{detail.travelNote}</p></div>
        <ol className={styles.route} aria-label="Urutan perjalanan">{programme.route.map((city, index) => <li key={`${city}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span>{city}</li>)}</ol>
        <div className={styles.itinerary}>{detail.days.map((day, index) => <StableDetails key={day.title} open={index === 0}><summary><span className={styles.dayNumber}>HARI {String(index + 1).padStart(2, "0")}</span><strong>{day.title}</strong><span className={styles.dayToggle} aria-hidden="true">+</span></summary><div className={styles.dayContent}><p>{day.description}</p><span><MapPin size={14} aria-hidden="true" /> {day.overnight}</span>{day.meals ? <small>Makan tercantum: {day.meals}</small> : null}</div></StableDetails>)}</div>
        <p className={styles.caption}>Urutan kunjungan dapat menyesuaikan jadwal penerbangan, waktu masuk situs dan kondisi setempat. Tidak ada jadwal keberangkatan tetap yang sedang dijual.</p>
      </section>
      <section className={styles.gallery} aria-label="Foto destinasi">{detail.gallery.map((photo) => <figure key={photo.src}><div><Image src={photo.src} alt={photo.alt} fill quality={90} sizes="(max-width: 760px) 90vw, 33vw" /></div><figcaption><strong>{photo.caption}</strong><LatinAmericaPhotoCredit image={photo.src} /></figcaption></figure>)}</section>
      <section className={`${styles.section} ${styles.shell}`} aria-label="Harga paket"><LatinAmericaPricePanel title={programme.title} price={detail.price} /></section>

      <section className={styles.planning} id="layanan" aria-labelledby="inclusions-heading"><div className={`${styles.shell} ${styles.inclusionsGrid}`}>
        <div><p className={styles.eyebrow}>CAKUPAN PAKET</p><h2 id="inclusions-heading">Sudah diperhitungkan</h2><ul className={styles.includedList}>{detail.included.map((item) => <li key={item}><Check size={17} aria-hidden="true" /><span>{item}</span></li>)}</ul></div>
        <div><p className={styles.eyebrow}>DI LUAR HARGA DASAR</p><h2>Dibayar terpisah</h2><ul className={styles.excludedList}>{detail.excluded.map((item) => <li key={item}>{item}</li>)}</ul><p className={styles.caption}>Komponen yang belum memiliki tarif pasti dirinci dalam penawaran sebelum pemesanan. Tip dan kebutuhan dokumen tidak dianggap sebagai upgrade rekreasi.</p></div>
      </div></section>
      <section className={`${styles.section} ${styles.shell}`} id="hotel" aria-labelledby="hotel-heading"><div className={styles.sectionIntro}><p className={styles.eyebrow}>TEMPAT BERISTIRAHAT</p><h2 id="hotel-heading">Rencana menginap</h2><p>Acuan kamar berdua. Nama hotel merupakan pilihan perencanaan, belum reservasi; hotel pengganti dan kategori kamar dicantumkan dalam penawaran akhir.</p></div><div className={styles.hotelGrid}>{detail.hotels.map((hotel) => <article key={hotel.city}><span>{hotel.nights} MALAM</span><h3>{hotel.city}</h3><p>{hotel.note}</p></article>)}</div></section>
      <section className={styles.flightSection} id="penerbangan" aria-labelledby="flight-heading"><div className={`${styles.shell} ${styles.twoColumns}`}>
        <div><p className={styles.eyebrow}>BERANGKAT DARI JAKARTA</p><h2 id="flight-heading">Penerbangan & koneksi</h2><p className={styles.flightRoute}>{detail.flightRoute}</p></div>
        <div><p>{detail.flightNote}</p><p><Wifi size={17} aria-hidden="true" /> Qatar menyediakan Starlink pada pesawat tertentu. Sambungan dengan maskapai partner memiliki layanan internetnya sendiri.</p><p className={styles.caption}>Tarif yang diteliti adalah sampel retail ekonomi reguler, bukan tiket promo atau kursi grup yang sudah ditahan. Tarif bagasi setiap maskapai, pajak, waktu transit dan kebutuhan dokumen diperiksa sebelum tiket diterbitkan.</p><a href="https://www.qatarairways.com/en-sg/onboard/connectivity.html" className={styles.textLink}>Lihat ketentuan Wi-Fi Qatar <ArrowRight size={15} aria-hidden="true" /></a></div>
      </div></section>
      <section className={`${styles.section} ${styles.shell}`} aria-labelledby="faq-heading"><h2 id="faq-heading">Sebelum menentukan tanggal</h2><div className={styles.faq}>
        <StableDetails><summary>Apakah harga sudah termasuk tiket dari Jakarta?</summary><p>Estimasi mencakup anggaran tiket internasional PP, penerbangan domestik atau regional yang diperlukan, serta pembagian tiket satu tour leader. Rincian angka tersedia pada bagian harga. Harga akhir disesuaikan dengan tanggal, jumlah peserta dan hasil quotation.</p></StableDetails>
        <StableDetails><summary>Kenapa harga memakai acuan 20 peserta?</summary><p>Biaya tour leader dan layanan grup dibagi ke 20 peserta berbayar. Untuk grup lebih kecil atau lebih besar, tim menghitung ulang cakupan layanan dan biaya per orang.</p></StableDetails>
        <StableDetails><summary>Bisa meminta kamar sendiri atau hotel 4 bintang?</summary><p>Simulasi upgrade hotel tersedia pada pilihan tambahan. Kamar single dan permintaan khusus membutuhkan penawaran sesuai hotel serta tanggal; keduanya belum masuk harga dasar.</p></StableDetails>
        <StableDetails><summary>Apakah bisa langsung membayar atau memastikan keberangkatan?</summary><p>Kirim tanggal dan jumlah peserta terlebih dahulu. Tim akan mengonfirmasi hotel, tiket pesawat, tiket kunjungan, rincian biaya, serta ketentuan pembayaran dan pembatalan secara tertulis sebelum pemesanan.</p></StableDetails>
      </div></section>
      <section className={styles.trade} id="trade-summary" lang="en" aria-labelledby="trade-heading"><div className={`${styles.shell} ${styles.twoColumns}`}>
        <div><p className={styles.eyebrow}>TRAVEL TRADE ENQUIRIES</p><h2 id="trade-heading">Sundaf Trip, Indonesia</h2></div>
        <div><p>{detail.englishSummary}</p><p>Sundaf Trip operates under CV Sundaf Holiday Group. We are seeking local operating partners for Indonesian outbound groups in 2027.</p><div className={styles.actions}><a href={`mailto:info@sundaftrip.com?subject=${encodeURIComponent(`Trade enquiry: ${programme.title} 2027`)}`} className={styles.secondary}><Mail size={17} aria-hidden="true" /> Contact our team</a><a href={LATIN_AMERICA_BROCHURE} className={styles.textLink} download>Download catalogue <Download size={16} aria-hidden="true" /></a></div></div>
      </div></section>
      <div className={`${styles.shell} ${styles.finalCta}`}><div><h2>Sudah punya rencana bulan perjalanan?</h2><p>Periksa pilihanmu, lalu kirim tanggal dan jumlah peserta.</p></div><a href="#harga" className={styles.primary}>Periksa pilihan & minta penawaran <ArrowRight size={18} aria-hidden="true" /></a></div>
      <p className={`${styles.shell} ${styles.credits}`}>Foto destinasi berlisensi CC BY-SA 4.0; resolusi dan format disesuaikan, tampilan dapat terpotong mengikuti layar. Foto merupakan gambaran destinasi.</p>
    </div>
  );
}
