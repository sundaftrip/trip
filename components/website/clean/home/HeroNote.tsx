import styles from "./CleanHome.module.css";

/** Brand note under the hero, set in the site font (DM Sans) so it stays formal and easy to read. */
export default function HeroNote() {
  return (
    <p className={styles.heroNote} lang="id" translate="no" data-no-translate>
      <span className={styles.heroNoteMark} aria-hidden="true" />
      Semua bisa jalan!
    </p>
  );
}
