import { Kalam } from "next/font/google";
import styles from "./CleanHome.module.css";

const kalam = Kalam({ weight: "700", subsets: ["latin"], display: "swap", preload: false });

export default function HeroChalkNote() {
  return (
    <p className={styles.heroNote} lang="id" translate="no" data-no-translate>
      <span className="sr-only">Semua bisa jalan!</span>
      <svg className={kalam.className} viewBox="0 0 220 110" fill="currentColor" aria-hidden="true" focusable="false">
        <defs>
          <filter id="sundaf-hero-chalk" x="-5%" y="-10%" width="110%" height="120%" colorInterpolationFilters="sRGB">
            {/* Preserve solid pigment between fine pores and occasional worn patches. */}
            <feTurbulence type="fractalNoise" baseFrequency="0.65 0.9" numOctaves="1" seed="12" result="grain" />
            <feColorMatrix in="grain" type="luminanceToAlpha" />
            <feComponentTransfer result="fineMask">
              <feFuncA type="linear" slope="20" intercept="-7" />
            </feComponentTransfer>
            <feTurbulence type="fractalNoise" baseFrequency="0.10 0.18" numOctaves="1" seed="8" result="wear" />
            <feColorMatrix in="wear" type="luminanceToAlpha" />
            <feComponentTransfer result="wearMask">
              <feFuncA type="linear" slope="24" intercept="-7.2" />
            </feComponentTransfer>
            <feComposite in="fineMask" in2="wearMask" operator="in" result="chalkMask" />
            <feComposite in="SourceGraphic" in2="chalkMask" operator="in" />
          </filter>
        </defs>
        <g filter="url(#sundaf-hero-chalk)">
          <text x="108" y="41" textAnchor="middle" fontSize="38">Semua bisa</text>
          <text x="116" y="91" textAnchor="middle" fontSize="43">jalan!</text>
          <path d="M15 53Q77 48 201 51M55 102Q110 97 173 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    </p>
  );
}
