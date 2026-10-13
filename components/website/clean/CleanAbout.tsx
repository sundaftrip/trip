import Link from "./PreserveScrollLink";
import { ArrowRight, MessageCircle } from "lucide-react";
import GalleryZoom from "@/components/website/GalleryZoom";
import InquiryForm from "@/components/website/InquiryForm";
import ScrollReveal from "./ScrollReveal";
import doc from "./DocFormat.module.css";
import styles from "./CleanAbout.module.css";

type AboutValue = { title: string; desc: string };
type AboutDestination = { label: string; sub: string };

const DEFAULT_TAGLINE = "Visa, bahasa, cuaca, rute, sampai pertanyaan \"ini aman gak sih?\" sering bikin maju-mundur duluan. Sundaf bantu beresin bagian ribetnya, supaya kamu bisa fokus berangkat dan menikmati perjalanannya.";

/** About page in the Sundaf DMC document format (atlas theme). */
export default function CleanAbout({
  story,
  values,
  destinations,
  tagline,
  nib,
  waLink,
  tourCount,
  blogCount,
  gallery,
}: {
  story: string[];
  values: AboutValue[];
  destinations: AboutDestination[];
  tagline: string;
  nib: string;
  waLink: string;
  tourCount: number;
  blogCount: number;
  gallery: string[];
}) {
  const stats = [
    { label: "Program perjalanan di katalog", value: tourCount },
    { label: "Destinasi utama", value: destinations.length },
    { label: "Artikel jurnal", value: blogCount },
  ];

  return (
    <div className={styles.page} id="about-page">
      <ScrollReveal rootId="about-page" />
      <div className={styles.shell}>
        <header className={styles.hero} aria-labelledby="about-page-title">
          <div>
            <p className={doc.eyebrow}>Tentang kami / Sundaf Trip</p>
            <h1 id="about-page-title" className={`${doc.title} ${styles.title}`}>
              Jalan ke <mark className={doc.mark}>Rusia</mark>, <mark className={doc.mark}>Asia Tengah</mark>,
              {" "}sampai <mark className={doc.mark}>aurora</mark>, tanpa drama yang gak perlu
            </h1>
          </div>
          <div className={styles.heroAside}>
            <p className={`${doc.lead} ${styles.lead}`}>{tagline || DEFAULT_TAGLINE}</p>
            {nib && <p className={styles.nib}>Terdaftar resmi · NIB {nib}</p>}
          </div>
        </header>

        <section className={styles.section} aria-labelledby="about-story-title" data-reveal>
          <h2 id="about-story-title" className={doc.tag}>Awalnya dari rasa penasaran</h2>
          <div className={styles.split}>
            <div className={styles.prose}>
              {story.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
            <dl className={styles.stats} aria-label="Sundaf Trip dalam angka">
              {stats.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {gallery.length > 0 && (
          <section className={styles.section} aria-labelledby="about-gallery-title" data-reveal>
            <h2 id="about-gallery-title" className={doc.tag}>Bukti jalan, bukan cuma cerita</h2>
            <p className={styles.note}>
              Cuplikan perjalanan peserta kami di Rusia, Asia Tengah, dan rute aurora. Klik untuk lihat lebih dekat.
            </p>
            <GalleryZoom images={gallery} altPrefix="Dokumentasi perjalanan Sundaf Trip" />
          </section>
        )}

        <section className={styles.section} aria-labelledby="about-routes-title" data-reveal>
          <h2 id="about-routes-title" className={doc.tag}>Rute yang sering bikin traveler penasaran</h2>
          <table className={`${doc.table} ${styles.table}`}>
            <thead>
              <tr><th scope="col">Destinasi</th><th scope="col">Kota &amp; rute</th></tr>
            </thead>
            <tbody>
              {destinations.map((item) => (
                <tr key={item.label}><th scope="row">{item.label}</th><td>{item.sub}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.section} aria-labelledby="about-values-title" data-reveal>
          <h2 id="about-values-title" className={doc.tag}>Cara kami bikin trip tetap waras</h2>
          <div className={styles.values}>
            {values.map((item, index) => (
              <div className={index % 2 === 0 ? doc.boxSage : doc.boxSand} key={item.title}>
                <h3 className={doc.subhead}>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} id="sundaf-group" aria-labelledby="sundaf-group-title" data-reveal>
          <h2 id="sundaf-group-title" className={doc.tag} data-no-translate translate="no">SUNDAF Holiday Group</h2>
          <div className={styles.split}>
            <div className={styles.prose}>
              <p>SUNDAF Trip dan SUNDAF DMC berada dalam payung brand SUNDAF Holiday Group, dengan layanan yang saling melengkapi.</p>
              <p>SUNDAF Trip melayani wisatawan melalui open trip, perjalanan privat, dan bantuan visa. SUNDAF DMC membantu agen dan operator perjalanan merancang perjalanan di Indonesia.</p>
              <p><a className={doc.textLink} href="https://sundafdmc.com/">Kenali SUNDAF DMC untuk mitra perjalanan</a></p>
            </div>
            <div className={`${doc.boxSage} ${styles.profile}`}>
              <h3 className={doc.subhead}>Profil brand formal</h3>
              <p>
                Halaman ini dibuat lebih santai untuk traveler. Untuk versi formal tentang identitas brand, nama legal, layanan utama, dan rute spesialisasi Sundaf Trip, buka profil resmi kami.
              </p>
              <Link className={doc.button} href="/sundaf-trip">
                Buka profil resmi <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="about-company-title" lang="en" data-reveal>
          <h2 id="about-company-title" className={doc.tag}>Company Information</h2>
          <div className={styles.prose}>
            <p>Sundaf Trip is an Indonesia-based travel and tour operations brand focused on curated group tours, corporate travel arrangements, and destination coordination.</p>
            <p>Sundaf Trip is operated by CV Sundaf Holiday Group.</p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="about-form-title" data-reveal>
          <h2 id="about-form-title" className={doc.tag}>Cerita dulu rencana kamu</h2>
          <p className={styles.note}>Tulis tujuan, tanggal, jumlah peserta, dan budget kasar. Tim Sundaf akan follow up via WhatsApp.</p>
          <div className={`${doc.boxSand} ${styles.form}`}>
            <InquiryForm />
          </div>
        </section>

        <section className={`${doc.boxSage} ${styles.cta}`} aria-labelledby="about-cta-title">
          <h2 id="about-cta-title" className={doc.title}>Mau coba rute yang beda dari orang-orang?</h2>
          <p>Ceritakan rencana, budget, dan tanggal kamu. Kami bantu lihat rute yang paling masuk akal.</p>
          <div className={styles.actions}>
            <a className={doc.button} href={waLink} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden="true" /> Konsultasi via WhatsApp
            </a>
            <Link className={styles.secondary} href="/tours">Lihat paket tour</Link>
            <Link className={styles.secondary} href="/visa">Layanan visa</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
