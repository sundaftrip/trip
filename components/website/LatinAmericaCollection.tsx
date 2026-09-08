import Link from "@/components/website/clean/PreserveScrollLink";
import { ArrowUpRight } from "lucide-react";
import styles from "./LatinAmerica.module.css";

export default function LatinAmericaCollection() {
  return (
    <aside className={styles.collection} aria-label="Katalog Amerika Latin 2027">
      <div>
        <span className={styles.eyebrow}>TOUR GRUP · 2027</span>
        <h2>Peru & Amerika Latin</h2>
        <p>Lima, Cusco dan Machu Picchu, atau sekaligus Brasil, Kolombia dan Chile. Itinerary dan harga untuk grup sendiri.</p>
      </div>
      <Link scroll data-scroll-reset-after-navigation href="/amerika-latin" className={styles.primary}>Lihat katalog <ArrowUpRight size={18} aria-hidden="true" /></Link>
    </aside>
  );
}
