"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

const FILL = "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105";
const IMG_FILL = "object-cover transition-transform duration-500 group-hover:scale-105";
const SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

/**
 * Media kartu aktivitas yang punya klip video.
 *
 * Dua proteksi sekaligus:
 * 1. prefers-reduced-motion → cukup poster statis; video tak diunduh & tak
 *    autoplay (memenuhi WCAG 2.2.2 untuk loop yang lama).
 * 2. Lazy-load via IntersectionObserver → file video baru diunduh saat kartu
 *    mendekati viewport, bukan saat page load. Penting karena halaman ini
 *    bisa punya >1 video; tanpa ini semuanya ikut terunduh di awal.
 *
 * SSR me-render poster <Image> (motionOk=true, inView=false), sama dengan
 * render awal di klien → tak ada hydration mismatch; swap ke <video> terjadi
 * setelah kartu terlihat. Video diberi aria-hidden (dekoratif; judul/desk
 * sudah ada di teks kartu).
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
  const ref = useRef<HTMLSpanElement>(null);
  const [motionOk, setMotionOk] = useState(true);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setMotionOk(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
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
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const showVideo = motionOk && inView;

  return (
    <span ref={ref} className="absolute inset-0 block">
      {showVideo ? (
        <video
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
      {motionOk && (
        <span
          className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
        >
          <Camera size={9} /> Video
        </span>
      )}
    </span>
  );
}
