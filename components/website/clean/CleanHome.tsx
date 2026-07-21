import Image from "next/image";
import Link from "next/link";
import { buildWhatsAppHref, cldThumb } from "@/lib/utils";
import CleanTourCard, { type CleanTour } from "./CleanTourCard";
import CleanReviews from "./CleanReviews";
import styles from "./CleanSite.module.css";

type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
};

function destinationImage(tours: CleanTour[], pattern: RegExp, fallback: string) {
  const match = tours.find((tour) => pattern.test(`${tour.country} ${tour.title}`) && tour.heroImg);
  return match?.heroImg ? cldThumb(match.heroImg, 1100, 800) : fallback;
}

export default function CleanHome({
  tours,
  testimonials,
  company,
}: {
  tours: CleanTour[];
  testimonials: Testimonial[];
  company: Record<string, string>;
}) {
  const featured = tours.slice(0, 3);
  const heroTour = tours.find((tour) => /aurora|murmansk|russia|rusia/i.test(`${tour.title} ${tour.country}`) && tour.heroImg);
  const heroImage = heroTour?.heroImg
    ? cldThumb(heroTour.heroImg, 1800, 1100)
    : "/about-gallery/01-aurora.webp";
  const waHref = buildWhatsAppHref(company.company_whatsapp, "Halo, saya ingin konsultasi perjalanan bersama Sundaf Trip.") || "/contact";
  const nib = company.company_nib || "1601260060842";
  const datedMonths = Array.from(new Set(tours.filter((tour) => tour.tripDate).map((tour) => tour.tripDate!.slice(0, 7)))).slice(0, 8);
  const russiaImage = destinationImage(tours, /russia|rusia|aurora|murmansk/i, "/about-gallery-md/01-aurora.webp");
  const centralAsiaImage = destinationImage(tours, /kazakh|kyrgyz|uzbek|tajik|asia tengah|central asia/i, "/about-gallery-md/08-aurora.webp");

  return (
    <div className={styles.home}>
      <a className={styles.skipLink} href="#main-content">Langsung ke konten utama</a>
      <div id="main-content">
        <section className={styles.hero} aria-labelledby="hero-title">
          <Image src={heroImage} alt="Aurora dalam perjalanan Sundaf Trip di Rusia" fill priority sizes="100vw" className={styles.heroImage} />
          <div className={styles.heroShade} aria-hidden="true" />
          <div className={styles.shell}>
            <div className={styles.heroContent}>
              <p className={styles.heroEyebrow}>#Spesialis Trip Russia</p>
              <h1 id="hero-title">Tour Rusia, Asia Tengah &amp; Aurora</h1>
              <p className={styles.heroLede}>Pergi lebih jauh tanpa mengurus semuanya sendiri. Visa, itinerary, dan koordinasi di destinasi disiapkan dari awal.</p>

              <form className={styles.tourFinder} action="/tours" method="get">
                <div className={styles.finderField}>
                  <label htmlFor="clean-region">Tujuan</label>
                  <select id="clean-region" name="region" defaultValue="all">
                    <option value="all">Semua destinasi</option>
                    <option value="rusia">Rusia</option>
                    <option value="asia-tengah">Asia Tengah</option>
                    <option value="asia">Asia lainnya</option>
                    <option value="eropa">Eropa</option>
                  </select>
                </div>
                <div className={styles.finderField}>
                  <label htmlFor="clean-month">Waktu berangkat</label>
                  <select id="clean-month" name="month" defaultValue="all">
                    <option value="all">Semua bulan</option>
                    {datedMonths.map((month) => <option key={month} value={month}>{new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(`${month}-02T00:00:00+07:00`))}</option>)}
                  </select>
                </div>
                <button className={styles.finderSubmit} type="submit">Cari jadwal</button>
              </form>
              <p className={styles.heroNote}>Konsultasi awal gratis, dibantu langsung oleh tim Sundaf Trip.</p>
            </div>
          </div>
        </section>

        <section className={styles.trust} aria-label="Bukti kepercayaan">
          <div className={`${styles.shell} ${styles.trustGrid}`}>
            <div className={styles.trustItem}><strong>1.500+</strong><span>traveler Indonesia<br />sudah didampingi</span></div>
            <div className={styles.trustItem}><strong>20 grup</strong><span>dioperasikan<br />sepanjang 2025</span></div>
            <div className={styles.trustItem}><strong>NIB</strong><span>{nib}<br />terdaftar resmi</span></div>
          </div>
        </section>

        <section className={styles.section} id="tours" aria-labelledby="featured-tours-title">
          <div className={styles.shell}>
            <div className={`${styles.sectionHeading} ${styles.center}`}>
              <p className={styles.sectionKicker}>Jadwal pilihan Sundaf</p>
              <h2 id="featured-tours-title">Tour yang bisa dipesan sekarang</h2>
              <p>Tanggal, rute, dan harga tampil di depan. Buka detail tour untuk melihat itinerary, fasilitas, dan sisa kursi.</p>
            </div>
            {featured.length ? (
              <div className={styles.tourTrack}>{featured.map((tour) => <CleanTourCard key={tour.id} tour={tour} />)}</div>
            ) : (
              <p className={styles.empty}>Jadwal baru sedang disiapkan. Hubungi tim untuk private trip.</p>
            )}
            <Link className={styles.sectionLink} href="/tours">Lihat semua jadwal dan dokumentasi <span>→</span></Link>
          </div>
        </section>

        <section className={`${styles.section} ${styles.why}`} aria-labelledby="why-title">
          <div className={`${styles.shell} ${styles.whyLayout}`}>
            <div>
              <p className={styles.sectionKicker}>Cara kerja Sundaf</p>
              <h2 id="why-title">Yang rumit kami urus, supaya Anda <em>lebih tenang.</em></h2>
              <p className={styles.sectionCopy}>Informasi penting disampaikan sejak awal dan kebutuhan perjalanan dikoordinasikan sampai di destinasi.</p>
            </div>
            <div className={styles.reasons}>
              <article><span>01</span><h3>Visa &amp; dokumen dibantu</h3><p>Tim membantu mengecek dokumen dan alur pengajuan sebelum perjalanan dikunci.</p></article>
              <article><span>02</span><h3>Itinerary realistis</h3><p>Rute disusun agar destinasi tetap dinikmati, bukan sekadar mengejar jumlah kota.</p></article>
              <article><span>03</span><h3>Koordinasi dari awal</h3><p>Informasi keberangkatan, kebutuhan di destinasi, dan komunikasi grup ditangani end-to-end.</p></article>
              <article><span>04</span><h3>Dokumentasi asli</h3><p>Foto perjalanan berasal dari trip Sundaf dan peserta, bukan katalog gambar stok.</p></article>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="destinations-title">
          <div className={styles.shell}>
            <p className={styles.sectionKicker}>Mulai dari destinasi</p>
            <h2 id="destinations-title">Pilih perjalanan berikutnya</h2>
            <p className={styles.sectionCopy}>Tiga jenis perjalanan yang paling sering dirancang oleh tim Sundaf.</p>
            <div className={styles.destinationGrid}>
              <Link href="/tours?region=rusia"><Image src={russiaImage} alt="Aurora di Rusia" fill sizes="(max-width: 760px) 100vw, 42vw" /><span><strong>Rusia &amp; Aurora</strong><small>Lihat jadwal →</small></span></Link>
              <Link href="/tours?region=asia-tengah"><Image src={centralAsiaImage} alt="Perjalanan Asia Tengah" fill sizes="(max-width: 760px) 100vw, 28vw" /><span><strong>Asia Tengah</strong><small>Lihat tour →</small></span></Link>
              <Link href="/custom-trip"><Image src="https://res.cloudinary.com/dlmgl1grq/image/upload/w_900,h_700,c_fill,g_auto,q_auto:good,f_auto/sundaftrip/vietnam/catalog/ninh-binh/mua-cave.webp" alt="Lanskap Ninh Binh, Vietnam" fill sizes="(max-width: 760px) 100vw, 28vw" /><span><strong>Vietnam Privat</strong><small>Rancang perjalanan →</small></span></Link>
              <Link href="/custom-trip"><Image src="https://res.cloudinary.com/dlmgl1grq/image/upload/w_1100,h_600,c_fill,g_auto,q_auto:good,f_auto/sundaftrip/vietnam/catalog/da-nang/golden-bridge-sunset.webp" alt="Golden Bridge di Vietnam" fill sizes="(max-width: 760px) 100vw, 56vw" /><span><strong>Private &amp; Custom Trip</strong><small>Mulai konsultasi →</small></span></Link>
            </div>
          </div>
        </section>

        <CleanReviews items={testimonials} />

        <section className={styles.finalCta}>
          <div className={`${styles.shell} ${styles.ctaPanel}`}>
            <div><h2>Punya tanggal, tapi belum punya rute?</h2><p>Kirim tujuan, jumlah peserta, dan budget. Tim Sundaf akan membantu menyaring pilihan yang masuk akal.</p></div>
            <a href={waHref}>Konsultasi via WhatsApp</a>
          </div>
        </section>
      </div>
    </div>
  );
}
