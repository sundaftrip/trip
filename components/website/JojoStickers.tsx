import type { CSSProperties } from "react";

/* Stiker SVG buatan sendiri untuk tema Jojo — premium die-cut, bukan emoji.
   Tiap stiker: siluet putih (die-cut) di belakang + bentuk berwarna +
   outline gelap di atas. Warna mengikuti skema (var --jo-*). */

const OUTLINE = "#43372f";

const PATHS: Record<string, string> = {
  heart:   "M55 89 C28 68 13 54 13 37 C13 23 24 14 35 14 C44 14 51 20 55 28 C59 20 66 14 75 14 C86 14 97 23 97 37 C97 54 82 68 55 89 Z",
  star:    "M55 14 L64.6 42 L94 42.5 L70.4 60 L79 88 L55 71 L31 88 L39.6 60 L16 42.5 L45.4 42 Z",
  sparkle: "M55 12 C58 38 72 52 98 55 C72 58 58 72 55 98 C52 72 38 58 12 55 C38 52 52 38 55 12 Z",
  cloud:   "M26 74 C13 74 11 56 26 54 C24 38 50 34 54 48 C60 34 86 38 82 56 C95 58 93 74 80 74 Z",
};

export type JojoShape = "heart" | "star" | "sparkle" | "cloud" | "face";

interface Props {
  shape: JojoShape;
  color?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function JojoSticker({ shape, color = "var(--jo-accent)", size = 64, className = "", style }: Props) {
  if (shape === "face") {
    return (
      <svg width={size} height={size} viewBox="0 0 110 110" className={`jo-sticker ${className}`} style={style} aria-hidden>
        <circle cx="55" cy="55" r="45" fill="#fff" />
        <circle cx="55" cy="55" r="40" fill={color} stroke={OUTLINE} strokeWidth="3" />
        <circle cx="42" cy="52" r="5.5" fill={OUTLINE} />
        <circle cx="68" cy="52" r="5.5" fill={OUTLINE} />
        <path d="M44 68 Q55 79 66 68" fill="none" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="33" cy="65" rx="6" ry="4" fill="#ff9bb3" opacity="0.75" />
        <ellipse cx="77" cy="65" rx="6" ry="4" fill="#ff9bb3" opacity="0.75" />
      </svg>
    );
  }
  const d = PATHS[shape] ?? PATHS.star;
  return (
    <svg width={size} height={size} viewBox="0 0 110 110" className={`jo-sticker ${className}`} style={style} aria-hidden>
      <path d={d} fill="#fff" stroke="#fff" strokeWidth="13" strokeLinejoin="round" />
      <path d={d} fill={color} stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

/* Hamparan stiker melayang dekoratif — dipakai di hero & section. */
export function JojoStickerField() {
  const items: { shape: JojoShape; color: string; size: number; top: string; left?: string; right?: string; rot: number; dur: number; delay: number }[] = [
    { shape: "star",    color: "var(--jo-accent)", size: 60, top: "16%", left: "6%",  rot: -14, dur: 5.5, delay: 0 },
    { shape: "cloud",   color: "var(--jo-soft)",   size: 78, top: "12%", right: "9%", rot: 8,   dur: 6.2, delay: 0.6 },
    { shape: "heart",   color: "var(--jo-accent)", size: 48, top: "62%", left: "10%", rot: 12,  dur: 4.8, delay: 1.1 },
    { shape: "sparkle", color: "var(--jo-soft)",   size: 44, top: "38%", right: "14%",rot: -10, dur: 5.0, delay: 0.3 },
    { shape: "face",    color: "var(--jo-soft)",   size: 66, top: "70%", right: "8%", rot: -8,  dur: 5.8, delay: 0.9 },
    { shape: "sparkle", color: "var(--jo-accent)", size: 34, top: "30%", left: "16%", rot: 16,  dur: 4.4, delay: 1.4 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {items.map((it, i) => (
        <div
          key={i}
          className="absolute jo-float"
          style={{
            top: it.top, left: it.left, right: it.right,
            ["--jo-rot" as string]: `${it.rot}deg`,
            animationDuration: `${it.dur}s`,
            animationDelay: `${it.delay}s`,
          }}
        >
          <JojoSticker shape={it.shape} color={it.color} size={it.size} />
        </div>
      ))}
    </div>
  );
}
