"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { REGIONS, regionOf, type RegionKey } from "../TourFilter";
import CleanTourCard, { type CleanTour } from "./CleanTourCard";
import styles from "./CleanSite.module.css";

const PAGE_SIZE = 12;

function validRegion(value: string): value is RegionKey {
  return REGIONS.some((region) => region.key === value);
}

export default function CleanToursCatalog({
  tours,
  initialRegion = "all",
  initialMonth = "all",
}: {
  tours: CleanTour[];
  initialRegion?: string;
  initialMonth?: string;
}) {
  const [region, setRegion] = useState<RegionKey>(validRegion(initialRegion) ? initialRegion : "all");
  const [month, setMonth] = useState(initialMonth);
  const [archivePage, setArchivePage] = useState(1);

  const months = useMemo(() => Array.from(new Set(
    tours.filter((tour) => tour.tripDate && (tour.state === "bookable" || tour.state === "sold"))
      .map((tour) => tour.tripDate!.slice(0, 7)),
  )).sort(), [tours]);

  const filtered = tours.filter((tour) => {
    const matchesRegion = region === "all" || regionOf(tour.country) === region;
    const matchesMonth = month === "all" || tour.tripDate?.startsWith(month);
    return matchesRegion && matchesMonth;
  });
  const currentTours = filtered.filter((tour) => tour.state === "bookable" || tour.state === "flexible");
  const archiveTours = filtered.filter((tour) => tour.state === "sold" || tour.state === "completed");
  const totalArchivePages = Math.max(1, Math.ceil(archiveTours.length / PAGE_SIZE));
  const safePage = Math.min(archivePage, totalArchivePages);
  const pagedArchive = archiveTours.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const scheduledCount = tours.filter((tour) => tour.state === "bookable").length;
  const flexibleCount = tours.filter((tour) => tour.state === "flexible").length;
  const archiveCount = tours.filter((tour) => tour.state === "sold" || tour.state === "completed").length;

  function changeRegion(next: RegionKey) {
    setRegion(next);
    setArchivePage(1);
  }

  function changeMonth(next: string) {
    setMonth(next);
    setArchivePage(1);
  }

  function goToArchivePage(page: number) {
    setArchivePage(Math.min(totalArchivePages, Math.max(1, page)));
    window.requestAnimationFrame(() => document.getElementById("dokumentasi")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div className={styles.catalogPage} id="main-content">
      <section className={styles.catalogHero} aria-labelledby="catalog-page-title">
        <div className={`${styles.shell} ${styles.catalogHeroLayout}`}>
          <div>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Beranda</Link><span aria-hidden="true">/</span><span>Jadwal Tour</span></nav>
            <p className={styles.sectionKicker}>#Spesialis Trip Russia</p>
            <h1 id="catalog-page-title">Perjalanan yang siap dipilih.</h1>
            <p>Jadwal, durasi, dan harga kami tampilkan sejak awal. Pilih open trip bertanggal atau land tour privat dengan waktu yang lebih fleksibel.</p>
          </div>
          <div className={styles.catalogSummary} aria-label="Ringkasan katalog">
            <div><strong>{scheduledCount}</strong><span>keberangkatan terjadwal</span></div>
            <div><strong>{flexibleCount}</strong><span>pilihan land tour fleksibel</span></div>
            <div><strong>{archiveCount}</strong><span>dokumentasi perjalanan</span></div>
          </div>
        </div>
      </section>

      <section className={styles.catalogSection} id="tours" aria-labelledby="catalog-title">
        <div className={styles.shell}>
          <div className={styles.catalogTopline}>
            <div><p className={styles.sectionKicker}>Katalog aktif</p><h2 id="catalog-title">Jadwal &amp; land tour tersedia</h2></div>
            <p><strong>{currentTours.length}</strong> tour sesuai filter</p>
          </div>

          <div className={styles.catalogTools}>
            <div className={styles.filterRow} aria-label="Filter wilayah">
              {REGIONS.map((item) => (
                <button key={item.key} type="button" aria-pressed={region === item.key} onClick={() => changeRegion(item.key)}>{item.label}</button>
              ))}
            </div>
            <label className={styles.monthFilter}>
              <span>Waktu berangkat</span>
              <select value={month} onChange={(event) => changeMonth(event.target.value)}>
                <option value="all">Semua bulan</option>
                {months.map((value) => <option key={value} value={value}>{new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(`${value}-02T00:00:00+07:00`))}</option>)}
              </select>
            </label>
          </div>

          {currentTours.length ? (
            <div className={styles.catalogGrid}>{currentTours.map((tour) => <CleanTourCard key={tour.id} tour={tour} compact />)}</div>
          ) : (
            <div className={styles.empty}>Tidak ada tour aktif untuk filter ini. Coba wilayah atau bulan lain.</div>
          )}
        </div>
      </section>

      {archiveTours.length > 0 && (
        <section className={styles.archiveSection} id="dokumentasi" aria-labelledby="archive-title">
          <div className={styles.shell}>
            <div className={styles.archiveHeading}>
              <div><p className={styles.sectionKicker}>Jejak perjalanan</p><h2 id="archive-title">Dokumentasi trip terdahulu</h2><p>Trip penuh dan yang sudah lewat ditampilkan monokrom sebagai arsip, bukan jadwal yang masih dijual.</p></div>
              <strong>{archiveTours.length} perjalanan</strong>
            </div>
            <div className={styles.catalogGrid}>{pagedArchive.map((tour) => <CleanTourCard key={tour.id} tour={tour} compact />)}</div>
            {totalArchivePages > 1 && (
              <nav className={styles.pagination} aria-label="Halaman dokumentasi trip">
                <button type="button" disabled={safePage === 1} onClick={() => goToArchivePage(safePage - 1)}>← Sebelumnya</button>
                <span>Halaman {safePage} dari {totalArchivePages}</span>
                <button type="button" disabled={safePage === totalArchivePages} onClick={() => goToArchivePage(safePage + 1)}>Berikutnya →</button>
              </nav>
            )}
          </div>
        </section>
      )}

      <section className={styles.catalogSupport}>
        <div className={`${styles.shell} ${styles.supportRow}`}>
          <div><h2>Belum menemukan jadwal yang cocok?</h2><p>Private trip dapat disusun sesuai tanggal, jumlah peserta, dan gaya perjalanan.</p></div>
          <Link href="/custom-trip">Rancang private trip →</Link>
        </div>
      </section>
    </div>
  );
}
