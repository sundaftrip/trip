import Link from "./PreserveScrollLink";
import styles from "./RussiaGuideLinks.module.css";

export default function RussiaGuideLinks() {
  return (
    <nav className={styles.nav} aria-label="Panduan perjalanan Rusia">
      <p>Panduan perjalanan Rusia</p>
      <div>
        <Link href="/tour-rusia-dari-indonesia">Paket tour Rusia: jadwal dan biaya</Link>
        <Link href="/open-trip-rusia-dari-jakarta">Open trip Rusia dari Jakarta</Link>
        <Link href="/open-trip-aurora-rusia">Panduan open trip aurora Rusia</Link>
      </div>
    </nav>
  );
}
