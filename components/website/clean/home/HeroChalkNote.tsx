import { Kalam } from "next/font/google";
import styles from "./CleanHome.module.css";

const kalam = Kalam({ weight: "700", subsets: ["latin"], display: "swap", preload: false });

/* Handwritten chalk note: the one deliberate exception to DM Sans on the public site.
   Its ink is a gradient; the colours live in CleanHome.module.css (--hero-note-ink-*). */
export default function HeroChalkNote() {
  return (
    <p className={styles.heroNote} lang="id" translate="no" data-no-translate>
      <span className="sr-only">Semua bisa jalan!</span>
      <svg className={kalam.className} viewBox="0 0 220 110" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="sundaf-hero-note-ink" gradientUnits="userSpaceOnUse" x1="20" y1="8" x2="200" y2="104">
            <stop offset="0%" className={styles.heroNoteInkStart} />
            <stop offset="55%" className={styles.heroNoteInkMiddle} />
            <stop offset="100%" className={styles.heroNoteInkEnd} />
          </linearGradient>
          <filter id="sundaf-hero-chalk" x="-5%" y="-10%" width="110%" height="120%" colorInterpolationFilters="sRGB">
            {/* Mostly solid pigment with fine pores and a few worn patches, so the gradient stays legible. */}
            <feTurbulence type="fractalNoise" baseFrequency="0.65 0.9" numOctaves="1" seed="12" result="grain" />
            <feColorMatrix in="grain" type="luminanceToAlpha" />
            <feComponentTransfer result="fineMask">
              <feFuncA type="linear" slope="20" intercept="-5.6" />
            </feComponentTransfer>
            <feTurbulence type="fractalNoise" baseFrequency="0.10 0.18" numOctaves="1" seed="8" result="wear" />
            <feColorMatrix in="wear" type="luminanceToAlpha" />
            <feComponentTransfer result="wearMask">
              <feFuncA type="linear" slope="24" intercept="-5.6" />
            </feComponentTransfer>
            <feComposite in="fineMask" in2="wearMask" operator="in" result="chalkMask" />
            <feComposite in="SourceGraphic" in2="chalkMask" operator="in" />
          </filter>
        </defs>
        <g filter="url(#sundaf-hero-chalk)" fill="url(#sundaf-hero-note-ink)">
          <text x="108" y="41" textAnchor="middle" fontSize="38">Semua bisa</text>
          <text x="116" y="91" textAnchor="middle" fontSize="43">jalan!</text>
          <path d="M15 53Q77 48 201 51M55 102Q110 97 173 100" fill="none" stroke="url(#sundaf-hero-note-ink)" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    </p>
  );
}
