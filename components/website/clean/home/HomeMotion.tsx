"use client";

import { useEffect } from "react";
import styles from "./CleanHome.module.css";

/** Content is visible in server HTML. Motion is added only at intersection. */
export default function HomeMotion() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !("IntersectionObserver" in window)) return;
    const targets = document.querySelectorAll<HTMLElement>(`.${styles.sectionHeading}, .${styles.privatePanel}`);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(styles.reveal);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    targets.forEach((target) => observer.observe(target));
    const stop = () => {
      if (!preference.matches) return;
      observer.disconnect();
      targets.forEach((target) => target.classList.remove(styles.reveal));
    };
    preference.addEventListener("change", stop);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", stop);
      targets.forEach((target) => target.classList.remove(styles.reveal));
    };
  }, []);
  return null;
}
