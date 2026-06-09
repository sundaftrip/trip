"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

const MEDIA_CLASS =
  "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105";
const SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

/**
 * Media untuk kartu aktivitas yang punya klip video.
 * Menghormati prefers-reduced-motion: user dengan reduce TIDAK mendapat
 * autoplay/loop sama sekali — cukup poster statis (video pun tak diunduh).
 * Memenuhi WCAG 2.2.2 (Pause/Stop/Hide) tanpa kontrol yang merusak estetika.
 * Default render = video, sama dengan SSR, jadi tak ada hydration mismatch;
 * swap ke poster terjadi setelah mount bila preferensi reduce terdeteksi.
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
  const [motionOk, setMotionOk] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setMotionOk(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (!motionOk) {
    return <Image src={poster} alt={title} fill className={MEDIA_CLASS} sizes={SIZES} />;
  }

  return (
    <>
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
        className={MEDIA_CLASS}
      />
      <span
        className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      >
        <Camera size={9} /> Video
      </span>
    </>
  );
}
