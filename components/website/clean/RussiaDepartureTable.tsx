import Link from "./PreserveScrollLink";
import {
  formatRussiaTourDate,
  getRussiaTourPricing,
  russiaTourStatusLabel,
  selectRussiaGuideTours,
  type RussiaSummaryTour,
} from "@/lib/russia-tour-summary";
import { canonicalTourPath } from "@/lib/seo-routes";
import { normalizeTourDisplayTitle } from "@/lib/tour-display";
import { formatCurrency } from "@/lib/utils";
import styles from "./RussiaDepartureTable.module.css";

export default function RussiaDepartureTable({
  tours,
  now,
}: {
  tours: readonly RussiaSummaryTour[] | null;
  now: Date;
}) {
  const selected = selectRussiaGuideTours(tours ?? [], now);
  return (
    <section id="jadwal-rusia" className={styles.section} aria-labelledby="russia-departures-title">
      <h2 id="russia-departures-title">Jadwal dan biaya open trip Rusia</h2>
      <p className={styles.intro}>
        Bandingkan keberangkatan yang masih ditawarkan. Harga per orang mengikuti pilihan kamar
        pada paket. Subtotal mencakup harga paket dan tambahan wajib yang terhitung di tabel;
        biaya lain yang belum termasuk serta pilihan opsional perlu diperiksa sebelum memesan.
      </p>
      {selected.length ? (
        <>
          <p className={styles.scrollHint}>Geser tabel ke samping untuk melihat rincian biaya.</p>
          <div className={styles.scroll} role="region" aria-label="Tabel jadwal dan biaya Rusia; geser untuk melihat seluruh kolom" tabIndex={0}>
          <table>
            <caption className="sr-only">Keberangkatan mendatang, harga paket, tambahan wajib terhitung, dan subtotal per orang</caption>
            <thead>
              <tr>
                <th scope="col">Keberangkatan</th>
                <th scope="col">Durasi &amp; rute</th>
                <th scope="col">Harga paket mulai /orang</th>
                <th scope="col">Tambahan wajib terhitung /orang</th>
                <th scope="col">Subtotal mulai /orang</th>
              </tr>
            </thead>
            {selected.map((tour) => {
              const pricing = getRussiaTourPricing(tour);
              const hasPrice = pricing.headlinePrice > 0;
              const exclusions = tour.exclusions?.map((item) => item.trim()).filter(Boolean) ?? [];
              return (
                <tbody key={tour.id}>
                  <tr>
                    <th scope="row">
                      <Link href={canonicalTourPath(tour)}>{normalizeTourDisplayTitle(tour.title)}</Link>
                      <span>{formatRussiaTourDate(tour.tripDate!)}</span>
                      <span className={styles.status}>{russiaTourStatusLabel(tour, now)}</span>
                    </th>
                    <td>{tour.duration || "Lihat detail paket"}<span>{tour.cityHighlight || tour.country}</span></td>
                    <td>{hasPrice ? formatCurrency(pricing.headlinePrice) : "Konfirmasi harga"}</td>
                    <td>{pricing.mandatoryTotal > 0 ? formatCurrency(pricing.mandatoryTotal) : "Tidak ada tambahan terhitung"}
                      {pricing.mandatoryTotal > 0 && <span>{pricing.mandatoryLabel}</span>}
                    </td>
                    <td><strong>{hasPrice ? formatCurrency(pricing.mandatoryTotalPrice) : "Konfirmasi harga"}</strong>
                      <Link href={canonicalTourPath(tour)} className={styles.detail}>Lihat rincian paket</Link>
                    </td>
                  </tr>
                  <tr className={styles.notes}>
                    <td colSpan={5}>
                      {exclusions.length
                        ? <><strong>Belum termasuk dalam harga paket:</strong> {exclusions.join("; ")}.</>
                        : "Periksa fasilitas dan biaya yang belum termasuk pada halaman paket."}
                      {hasPrice && pricing.mandatoryTotal > 0 && <> {pricing.baggageOnly ? "Bagasi wajib" : "Tambahan wajib"} pada tabel sudah dihitung dalam subtotal.</>}
                    </td>
                  </tr>
                </tbody>
              );
            })}
          </table>
          </div>
        </>
      ) : (
        <p className={styles.empty}>
          {tours === null
            ? "Jadwal belum dapat ditampilkan."
            : "Belum ada keberangkatan mendatang yang ditawarkan pada daftar ini."}{" "}
          <Link href="/tours?destination=rusia">Lihat katalog Rusia</Link> atau{" "}
          <Link href="/custom-trip">ajukan private trip</Link>.
        </p>
      )}
      <p className={styles.note}>Kursi, harga akhir, dan rincian fasilitas dikonfirmasi sebelum pembayaran. Kemunculan aurora bergantung pada kondisi alam.</p>
    </section>
  );
}
