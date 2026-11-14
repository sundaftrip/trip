"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import styles from "./CleanShell.module.css";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

const subscribeNoop = () => () => {};

/** Tombol mode malam. Pergantian tema memudar pelan (±0,7 dtk) supaya terasa lembut. */
export default function CleanThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // true setelah hidrasi; sebelum itu label mengikuti mode terang (bawaan).
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const isNight = mounted && resolvedTheme === "dark";
  const label = isNight ? "Matikan mode malam" : "Nyalakan mode malam";

  function toggle() {
    const next = isNight ? "light" : "dark";
    const root = document.documentElement;
    const apply = () => {
      root.classList.toggle("dark", next === "dark");
      root.classList.toggle("light", next !== "dark");
      root.style.colorScheme = next;
      setTheme(next);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }

    const doc = document as ViewTransitionDocument;
    if (typeof doc.startViewTransition === "function") {
      root.classList.add("theme-switching");
      doc
        .startViewTransition(apply)
        .finished.finally(() => root.classList.remove("theme-switching"));
      return;
    }

    root.classList.add("theme-fade");
    apply();
    window.setTimeout(() => root.classList.remove("theme-fade"), 750);
  }

  return (
    <button
      className={`${styles.themeButton} ${className}`}
      type="button"
      aria-label={label}
      aria-pressed={isNight}
      title={label}
      data-no-translate
      onClick={toggle}
    >
      {/* Kedua ikon dirender; CSS memilih sesuai kelas .dark, jadi tidak berkedip saat dimuat. */}
      <Moon className={styles.themeIconMoon} aria-hidden="true" />
      <Sun className={styles.themeIconSun} aria-hidden="true" />
    </button>
  );
}
