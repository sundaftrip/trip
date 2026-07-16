import Link from "next/link";
import { buildWhatsAppHref, cldThumb, formatCurrency } from "@/lib/utils";
import styles from "./PremiumHome.module.css";

export interface PremiumHomeTour {
  id: string;
  slug: string | null;
  title: string;
  country: string;
  price: number;
  promoPrice: number | null;
  seatsLeft: number;
  tripDate: Date | null;
  duration: string | null;
  heroImg: string | null;
}

export interface PremiumHomePost {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  date: Date;
  readTime: string | null;
}

export interface PremiumHomeTestimonial {
  name: string;
  role: string | null;
  content: string;
}

interface Props {
  tours: PremiumHomeTour[];
  posts: PremiumHomePost[];
  testimonial: PremiumHomeTestimonial | null;
  whatsappNumber: string;
}

const SERVICES = [
  {
    number: "01",
    title: "Open trip",
    description: "Pilih tanggal, cek harga, dan lihat sisa kursi sebelum booking.",
    href: "/tours",
    action: "Lihat jadwal",
  },
  {
    number: "02",
    title: "Private trip",
    description: "Atur tanggal, ritme, dan budget untuk keluarga, teman, atau tim Anda.",
    href: "/custom-trip",
    action: "Rancang perjalanan",
  },
  {
    number: "03",
    title: "Layanan visa",
    description: "Cek dokumen dan alur pengajuan sebelum rencana perjalanan dikunci.",
    href: "/visa",
    action: "Cek kebutuhan visa",
  },
] as const;

const PROOF_PHOTOS = [
  {
    src: "/about-gallery-md/20-aurora.webp",
    alt: "Rombongan Sundaf Trip di bawah aurora Murmansk",
    caption: "Murmansk · Rusia",
  },
  {
    src: "/about-gallery-md/01-aurora.webp",
    alt: "Peserta Sundaf Trip menikmati aurora di Rusia",
    caption: "Aurora bersama peserta",
  },
  {
    src: "/about-gallery-md/03-aurora.webp",
    alt: "Peserta Sundaf Trip berfoto dengan aurora",
    caption: "Dokumentasi perjalanan",
  },
] as const;

function departureLabel(tour: PremiumHomeTour) {
  if (!tour.tripDate) return "Tanggal fleksibel";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(tour.tripDate));
}

function priceLabel(tour: PremiumHomeTour) {
  const price = tour.promoPrice ?? tour.price;
  return price > 0 ? formatCurrency(price) : "Tanya harga";
}

function availabilityLabel(tour: PremiumHomeTour) {
  if (!tour.tripDate) return "Private · tanggal fleksibel";
  return tour.seatsLeft > 0 ? `${tour.seatsLeft} kursi tersedia` : "Tanya ketersediaan";
}

function postDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function PremiumHome({ tours, posts, testimonial, whatsappNumber }: Props) {
  const whatsappHref = buildWhatsAppHref(
    whatsappNumber,
    "Halo, saya ingin konsultasi perjalanan bersama Sundaf Trip.",
  );

  return (
    <div className={styles.root}>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Spesialis Rusia, Asia Tengah &amp; Aurora</p>
            <h1 id="home-title" className={styles.heroTitle}>
              Pergi lebih jauh.<br />{" "}Kami urus yang rumit.
            </h1>
            <p className={styles.heroLead}>
              Open trip dan private trip untuk traveler Indonesia. Visa, itinerary,
              dan koordinasi di destinasi disiapkan dari awal.
            </p>

            <div className={styles.heroActions}>
              <Link href="#jadwal" className={styles.primaryButton}>
                Lihat jadwal terdekat <span aria-hidden="true">↓</span>
              </Link>
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noreferrer" className={styles.secondaryButton}>
                  Konsultasi via WhatsApp <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>

            <dl className={styles.stats} aria-label="Ringkasan pengalaman Sundaf Trip">
              <div>
                <dt>Traveler didampingi</dt>
                <dd>1.500+</dd>
              </div>
              <div>
                <dt>Grup sepanjang 2025</dt>
                <dd>20</dd>
              </div>
              <div>
                <dt>Terdaftar resmi</dt>
                <dd>NIB 1601260060842</dd>
              </div>
            </dl>
          </div>

          <figure className={styles.heroFigure}>
            {/* Foto dokumentasi asli, sudah terkompresi 38 KB. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/about-gallery-md/14-aurora.webp"
              alt="Aurora yang didokumentasikan dalam perjalanan Sundaf Trip di Rusia"
              width={1366}
              height={911}
              fetchPriority="high"
              decoding="async"
              className={styles.heroImage}
            />
            <figcaption>
              <span>Dokumentasi asli Sundaf Trip</span>
              <span>Murmansk, Rusia</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.services} aria-labelledby="services-title">
        <div className={styles.shell}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionKicker}>Mulai dari sini</p>
            <h2 id="services-title">Pilih cara berangkat yang paling cocok.</h2>
            <p>Setiap pilihan membawa Anda ke informasi yang dibutuhkan, tanpa memutar.</p>
          </div>

          <div className={styles.serviceList}>
            {SERVICES.map((service) => (
              <Link key={service.href} href={service.href} prefetch={false} className={styles.serviceRow}>
                <span className={styles.serviceNumber}>{service.number}</span>
                <span className={styles.serviceCopy}>
                  <strong>{service.title}</strong>
                  <span>{service.description}</span>
                </span>
                <span className={styles.serviceAction}>
                  {service.action} <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {tours.length > 0 && (
        <section id="jadwal" className={styles.tours} aria-labelledby="tours-title">
          <div className={styles.shell}>
            <div className={styles.sectionIntroRow}>
              <div>
                <p className={styles.sectionKicker}>Bisa dipesan sekarang</p>
                <h2 id="tours-title">Jadwal pilihan</h2>
              </div>
              <p>Harga dan tanggal tampil di depan. Buka detail untuk melihat itinerary dan fasilitas.</p>
            </div>

            <div className={styles.tourGrid}>
              {tours.map((tour) => {
                const href = `/tours/${tour.slug ?? tour.id}`;
                const image = tour.heroImg
                  ? cldThumb(tour.heroImg, 720, 540)
                  : "/about-gallery-sm/14-aurora.webp";
                return (
                  <article key={tour.id} className={styles.tourCard}>
                    <Link href={href} prefetch={false} aria-label={`Lihat detail ${tour.title}`}>
                      <div className={styles.tourImageFrame}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image}
                          alt={tour.title}
                          width={720}
                          height={540}
                          loading="lazy"
                          decoding="async"
                          className={styles.tourImage}
                        />
                      </div>
                      <div className={styles.tourBody}>
                        <p className={styles.tourCountry}>{tour.country}</p>
                        <h3>{tour.title}</h3>
                        <p className={styles.tourMeta}>
                          {tour.duration || "Durasi sesuai rute"} <span aria-hidden="true">·</span> {departureLabel(tour)}
                        </p>
                        <div className={styles.tourBottom}>
                          <div>
                            <span>Mulai dari</span>
                            <strong>{priceLabel(tour)}</strong>
                          </div>
                          <span className={styles.availability}>{availabilityLabel(tour)}</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>

            <div className={styles.sectionLinkWrap}>
              <Link href="/tours" prefetch={false} className={styles.textLink}>
                Lihat semua jadwal dan dokumentasi <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className={styles.proof} aria-labelledby="proof-title">
        <div className={styles.shell}>
          <div className={styles.sectionIntroRow}>
            <div>
              <p className={styles.sectionKicker}>Bukti perjalanan</p>
              <h2 id="proof-title">Momen dari peserta kami.</h2>
            </div>
            <p>Seluruh foto di bawah berasal dari perjalanan Sundaf Trip, bukan gambar stok.</p>
          </div>

          <div className={styles.proofGrid}>
            {PROOF_PHOTOS.map((photo) => (
              <figure key={photo.src} className={styles.proofItem}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width={1366}
                  height={911}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{photo.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {(testimonial || posts.length > 0) && (
        <section className={styles.stories} aria-label="Cerita peserta dan jurnal perjalanan">
          <div className={`${styles.shell} ${styles.storyGrid}`}>
            {testimonial && (
              <div className={styles.testimonial}>
                <p className={styles.sectionKicker}>Kata peserta, apa adanya</p>
                <blockquote>“{testimonial.content.replace(/^[“\"]|[”\"]$/g, "").trim()}”</blockquote>
                <p className={styles.testimonialByline}>
                  <strong>{testimonial.name}</strong>
                  {testimonial.role && <span>{testimonial.role}</span>}
                </p>
                <Link href="/reviews" prefetch={false} className={styles.textLink}>
                  Baca review lain <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}

            {posts.length > 0 && (
              <div className={styles.journal}>
                <div className={styles.journalHead}>
                  <p className={styles.sectionKicker}>Jurnal perjalanan</p>
                  <Link href="/blog" prefetch={false}>Semua artikel</Link>
                </div>
                <div className={styles.postList}>
                  {posts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} prefetch={false} className={styles.postRow}>
                      <span>
                        <small>{post.category || "Jurnal"}</small>
                        <strong>{post.title}</strong>
                      </span>
                      <span className={styles.postMeta}>
                        {postDate(post.date)}{post.readTime ? ` · ${post.readTime}` : ""}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className={styles.finalCta} aria-labelledby="cta-title">
        <div className={`${styles.shell} ${styles.ctaInner}`}>
          <div>
            <p className={styles.ctaKicker}>Konsultasi tanpa biaya</p>
            <h2 id="cta-title">Punya tanggal, tapi belum punya rute?</h2>
            <p>Kirim tujuan, jumlah peserta, dan budget. Kami bantu menyaring pilihan yang masuk akal.</p>
          </div>
          {whatsappHref && (
            <a href={whatsappHref} target="_blank" rel="noreferrer" className={styles.ctaButton}>
              Ceritakan rencana Anda <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
