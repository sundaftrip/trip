import Link from "@/components/website/clean/PreserveScrollLink";
import { ArrowUpRight } from "lucide-react";
import styles from "./LatinAmerica.module.css";

export default function LatinAmericaCollection() {
  return (
    <aside className={styles.collection} aria-label="Katalog Amerika Latin 2027">
      <div>
        <span className={styles.eyebrow}>RUTE BARU · PENGEMBANGAN 2027</span>
        <h2>Peru & Amerika Latin</h2>
        <p>Jelajahi rancangan Peru dan perjalanan empat negara. Tanggal dan harga sesuai penawaran.</p>
      </div>
      <Link scroll data-scroll-reset-after-navigation href="/amerika-latin" className={styles.primary}>Lihat katalog <ArrowUpRight size={18} aria-hidden="true" /></Link>
    </aside>
  );
}
