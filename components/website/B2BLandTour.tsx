/* Shared presentation; /partner retains Billy's contact details and brochure. */
import Link from "@/components/website/clean/PreserveScrollLink";
import { ArrowDown, ArrowUpRight, Check, Download, Hotel, Bus, Utensils, Ticket, UserCheck, Route, MapPin } from "lucide-react";
import profile from "@/lib/b2b-profile-content.json";
import { b2bProfilePdfHref, type B2BLanguage } from "@/lib/b2b-profile";
import { getProofPhotos } from "@/lib/b2bGallery";
import styles from "./clean/B2BProfile.module.css";

export type { B2BLanguage } from "@/lib/b2b-profile";
type Tri = Record<B2BLanguage, string>;
const ICONS = { Hotel, Bus, Utensils, Ticket, UserCheck, Route };
const LANGUAGE_LABELS = { id: "ID", en: "ENG", ru: "RU" };

export default function B2BLandTour({ withCofounder = false, language = "id", showLanguageSwitcher = false }: {
  withCofounder?: boolean; language?: B2BLanguage; showLanguageSwitcher?: boolean;
}) {
  const { HERO, POSITIONING, COVERAGE, DESTINATIONS, WHY, STEPS, TX, FERDIANSAH, FERDIANSAH_USA_PROOF, BILLY } = profile;
  const person = withCofounder ? BILLY : FERDIANSAH;
  const pdfHref = b2bProfilePdfHref(language, withCofounder);
  const t = (value: Tri) => value[language];

  return (
    <div className={styles.page} lang={language} data-no-translate>
      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.topline}>
            <p className={styles.eyebrow}>/ {t(HERO.eyebrow)}</p>
            {showLanguageSwitcher && <nav className={styles.languages} aria-label="Language">
              {(["id", "en", "ru"] as const).map((code) => <Link key={code} href={`/b2b?lang=${code}`} hrefLang={code} aria-current={language === code ? "page" : undefined}>{LANGUAGE_LABELS[code]}</Link>)}
            </nav>}
          </div>
          <div className={styles.heroGrid}>
            <div>
              <h1>{t(HERO.title)}</h1>
              <p className={styles.intro}>{t(HERO.intro)}</p>
              <div className={styles.actions}>
                <a href={person.whatsappUrl} target="_blank" rel="noreferrer" className={styles.primaryButton}>{t(TX.wa)} <ArrowUpRight size={17} aria-hidden="true" /></a>
                <a href={pdfHref} download target="_blank" rel="noopener" className={styles.downloadLink}><Download size={17} aria-hidden="true" /> {t(TX.profile)}</a>
              </div>
              <p className={styles.privateNote}>{t(HERO.privateNote)}</p>
            </div>
            <figure className={styles.heroPhoto}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/trip-photos/trip-1.jpg" alt={t(TX.photosBody)} fetchPriority="high" width={900} height={1100} />
              <figcaption>{t(DESTINATIONS[0].region)} · {t(DESTINATIONS[1].region)}</figcaption>
            </figure>
          </div>
          <div className={styles.positioning}>
            <h2>{t(POSITIONING.title)}</h2>
            <div><p>{t(POSITIONING.desc)}</p><a href="#scope"><ArrowDown size={18} aria-hidden="true" /> {t(TX.coverageHead)}</a></div>
          </div>
        </div>
      </header>
      <section className={`${styles.section} ${styles.container}`} id="scope" aria-labelledby="b2b-scope-title">
        <h2 className={styles.sectionTitle} id="b2b-scope-title">{t(TX.coverageHead)}</h2>
        <div className={styles.coverageGrid}>
          {COVERAGE.map(({ Icon: icon, title, desc }) => {
            const Icon = ICONS[icon as keyof typeof ICONS];
            return <article key={t(title)} className={styles.service}><Icon size={25} strokeWidth={1.4} aria-hidden="true" /><h3>{t(title)}</h3><p>{t(desc)}</p></article>;
          })}
        </div>
      </section>
      <section className={styles.marketSection} aria-labelledby="b2b-markets-title">
        <div className={`${styles.container} ${styles.split}`}>
          <div><h2 className={styles.sectionTitle} id="b2b-markets-title">{t(TX.destinationsHead)}</h2><p className={styles.sectionIntro}>{t(HERO.proofOne)}</p></div>
          <div className={styles.markets}>{DESTINATIONS.map(({ region, detail }) => <article key={t(region)}><MapPin size={21} strokeWidth={1.4} aria-hidden="true" /><div><h3>{t(region)}</h3><p>{t(detail)}</p></div></article>)}</div>
        </div>
      </section>
      <section className={`${styles.section} ${styles.container} ${styles.split}`} aria-labelledby="b2b-why-title">
        <div><h2 className={styles.sectionTitle} id="b2b-why-title">{t(TX.whyHead)}</h2><p className={styles.sectionIntro}>{t(HERO.proofTwo)}</p></div>
        <ul className={styles.reasons}>{WHY.map((point) => <li key={t(point)}><Check size={19} strokeWidth={1.5} aria-hidden="true" /><p>{t(point)}</p></li>)}</ul>
      </section>
      <section className={`${styles.section} ${styles.container} ${styles.processSection}`} aria-labelledby="b2b-process-title">
        <h2 className={styles.sectionTitle} id="b2b-process-title">{t(TX.stepsHead)}</h2>
        <ol className={styles.steps}>{STEPS.map(({ n, title, desc }) => <li key={n}><span className={styles.stepNumber}>{n.padStart(2, "0")}</span><h3>{t(title)}</h3><p>{t(desc)}</p></li>)}</ol>
      </section>
      <section className={`${styles.section} ${styles.container}`} aria-labelledby="b2b-evidence-title">
        <h2 className={styles.sectionTitle} id="b2b-evidence-title">{t(TX.photosHead)}</h2><p className={styles.galleryIntro}>{t(TX.photosBody)}</p>
        <div className={styles.gallery}>{getProofPhotos().map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt={`${t(TX.photosHead)} ${i + 1}`} loading="lazy" width={400} height={400} />
        ))}</div>
      </section>
      <section className={`${styles.section} ${styles.container} ${styles.lead}`} aria-labelledby="b2b-lead-title">
        <div>
          <h2 className={styles.sectionTitle} id="b2b-lead-title">{t(TX.b2bLead)}</h2>
          <div className={styles.person}>
            {person.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={person.photo} alt={person.name} loading="lazy" width={80} height={80} />
            ) : <span className={styles.initial} aria-hidden="true">{person.initial}</span>}
            <div><h3>{person.name}</h3><p className={styles.eyebrow}>{person.role}</p></div>
          </div>
          <p className={styles.sectionIntro}>{t(person.desc)}</p>
        </div>
        {!withCofounder && <figure className={styles.leadPhoto}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FERDIANSAH_USA_PROOF.src} alt={t(FERDIANSAH_USA_PROOF.alt)} loading="lazy" width={1067} height={1600} /><figcaption>{t(FERDIANSAH_USA_PROOF.caption)}</figcaption>
        </figure>}
      </section>
      <section className={`${styles.container} ${styles.closing}`} aria-labelledby="b2b-contact-title">
        <div><h2 id="b2b-contact-title">{t(TX.ctaHead)}</h2><p>{t(TX.ctaBody)}</p></div>
        <div className={styles.actions}>
          <a href={person.whatsappUrl} target="_blank" rel="noreferrer" className={styles.primaryButton}>{t(TX.wa)} <ArrowUpRight size={17} aria-hidden="true" /></a>
          <a href={pdfHref} download target="_blank" rel="noopener" className={styles.downloadLink}><Download size={17} aria-hidden="true" /> {t(TX.profile)}</a>
        </div>
        <div className={styles.contactDetails}><a href={`mailto:${person.email}`}>{person.email}</a><span>CV Sundaf Holiday Group · NIB 1601260060842</span></div>
      </section>
    </div>
  );
}
