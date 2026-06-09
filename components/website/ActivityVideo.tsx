"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

const FILL = "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105";
const IMG_FILL = "object-cover transition-transform duration-500 group-hover:scale-105";
const SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

/**
 * Media kartu aktivitas yang punya klip video dekoratif (muted, loop).
 *
 * INTENT PEMILIK (eksplisit): video kartu HARUS autoplay andal untuk SEMUA
 * pengunjung — Chrome, Firefox, Edge, Safari desktop, dan iOS Safari. Klip ini
 * dekoratif, muted, dan looping pendek.
 *
 * AKAR MASALAH (bug "beku di poster"):
 * <video> di-mount ke DOM SETELAH halaman selesai parse, lewat state flip
 * IntersectionObserver (inView false→true). Atribut deklaratif `autoPlay` hanya
 * dijamin dihormati browser untuk elemen yang ada saat dokumen di-parse; untuk
 * node yang React sisipkan belakangan, heuristik autoplay UA sering TIDAK
 * terpicu (paling ketat di WebKit/iOS Safari) → elemen diam di poster.
 *
 * PERBAIKAN: panggil element.play() EKSPLISIT setelah <video> ter-mount.
 *   1. set el.muted = true via PROPERTY sebelum play — autoplay tanpa gesture
 *      hanya diizinkan untuk video muted; ini juga menutup race muted-attr React.
 *   2. tegakkan playsinline + webkit-playsinline untuk iOS (inline, bukan
 *      fullscreen).
 *   3. panggil play() segera DAN saat canplay/loadeddata (preload="metadata"
 *      bisa membuat percobaan pertama belum cukup ready); .catch() promise-nya
 *      agar NotAllowed/Abort tidak crash — poster jadi fallback yang tenang.
 *
 * SUMBER: MP4 H.264/avc1 tunggal — universal di semua browser target & lebih
 * ringan dari rendition VP9/WebM untuk klip ini, jadi tak perlu multi-source.
 *
 * prefers-reduced-motion: SESUAI INTENT PEMILIK, gate ini dilepas — versi lama
 * menahan <video> sepenuhnya untuk user reduce-motion (mis. iOS Low Power Mode),
 * yang membuat sebagian pengunjung melihat poster beku ("video tidak jalan").
 *
 * HYDRASI: SSR & render awal klien sama-sama poster <Image> (inView=false) → tak
 * ada hydration mismatch; swap ke <video> hanya di klien setelah IO memicu.
 * Video diberi aria-hidden (dekoratif; judul & deskripsi sudah ada sebagai teks).
 *
 * LAZY-LOAD: <video> hanya dirender saat kartu mendekati viewport (IO,
 * rootMargin 300px) agar beberapa video tak ikut terunduh saat page load.
 */
export default function ActivityVideo({
  video,
  poster,
  title,
}: {
  video: string;
  poster: string;
  title: string;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  /* ── Lazy-mount: <video> hanya dirender saat kartu mendekati viewport ── */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const MARGIN = 300;
    // Cek sinkron saat mount: jika kartu sudah di (atau dekat) viewport, langsung
    // flip tanpa menunggu callback IO. Menutup kasus notifikasi async PERTAMA IO
    // hilang (mis. double-invoke effect React StrictMode: observe → cleanup
    // disconnect → observe membuang callback awal utk elemen yang sudah terlihat).
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const near =
      rect.bottom >= -MARGIN &&
      rect.top <= vh + MARGIN &&
      rect.right >= -MARGIN &&
      rect.left <= vw + MARGIN;
    if (near) {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: `${MARGIN}px` }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /** Jalur autoplay otoritatif. Aman dipanggil berkali-kali. */
  const tryPlay = useCallback((el: HTMLVideoElement | null) => {
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    const p = el.play();
    if (p && typeof p.then === "function") {
      p.catch(() => {
        /* NotAllowedError/AbortError: poster tetap tampil sebagai fallback. */
      });
    }
  }, []);

  /* ── Picu play() eksplisit setelah <video> ter-mount (kunci perbaikan) ── */
  useEffect(() => {
    if (!inView) return;
    const el = videoRef.current;
    if (!el) return;

    let cancelled = false;
    const attempt = () => {
      if (!cancelled) tryPlay(el);
    };

    attempt();
    el.addEventListener("canplay", attempt);
    el.addEventListener("loadeddata", attempt);

    return () => {
      cancelled = true;
      el.removeEventListener("canplay", attempt);
      el.removeEventListener("loadeddata", attempt);
    };
  }, [inView, tryPlay]);

  return (
    <span ref={wrapRef} className="absolute inset-0 block">
      {inView ? (
        <video
          ref={videoRef}
          src={video}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          tabIndex={-1}
          className={FILL}
        />
      ) : (
        <Image src={poster} alt={title} fill className={IMG_FILL} sizes={SIZES} />
      )}
      <span
        className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      >
        <Camera size={9} /> Video
      </span>
    </span>
  );
}
