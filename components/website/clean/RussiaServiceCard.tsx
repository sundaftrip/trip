"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type RussiaServiceMotion = "catering" | "flight" | "train" | "hotel" | "bus" | "luggage" | "compass";

export default function RussiaServiceCard({ motion, children }: { motion: RussiaServiceMotion; children: ReactNode }) {
  const cardRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return <article ref={cardRef} data-motion={motion} data-motion-visible={visible ? "true" : undefined}>{children}</article>;
}
