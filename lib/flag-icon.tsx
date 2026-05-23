/* SVG flag rendering via the `flag-icons` library.
   Database masih simpan emoji bendera (mis. "🇯🇵"); component ini decode
   regional-indicator codepoints jadi ISO-2 ("jp") lalu render `.fi fi-jp`.
   Kalau decoding gagal, fallback: render emoji asli supaya tetap tampak. */

export function emojiToIso(flag: string): string | null {
  const chars = [...flag.trim()];
  if (chars.length !== 2) return null;
  const codes = chars.map((c) => c.codePointAt(0));
  const valid = codes.every(
    (c) => c !== undefined && c >= 0x1f1e6 && c <= 0x1f1ff,
  );
  if (!valid) return null;
  return codes
    .map((c) => String.fromCharCode((c as number) - 0x1f1e6 + 65))
    .join("")
    .toLowerCase();
}

interface FlagIconProps {
  flag: string;
  className?: string;
  /** Sudut tumpul + shadow halus untuk konteks hero/kartu. */
  rounded?: boolean;
  /** ARIA label. Kalau tidak diset, dianggap dekoratif (aria-hidden). */
  label?: string;
  /** Lebar piksel — WAJIB diisi karena `.fi` default 1.333em menang atas
      utility Tailwind. Default 24 cocok untuk tabel inline. */
  width?: number;
  /** Tinggi piksel. Default 4:3 (75% dari width). */
  height?: number;
}

export function FlagIcon({
  flag,
  className = "",
  rounded,
  label,
  width = 24,
  height,
}: FlagIconProps) {
  const iso = emojiToIso(flag);
  const ariaProps = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  const decoClass = rounded ? "rounded-[2px] shadow-sm" : "";
  // Inline style menang atas `.fi { width: 1.333em }` dari flag-icons
  // (unlayered CSS di Tailwind v4) dan apa pun di className utility.
  const sizeStyle = {
    width: `${width}px`,
    height: `${height ?? Math.round((width * 3) / 4)}px`,
    display: "inline-block",
    flexShrink: 0,
  } as const;

  if (!iso) {
    return (
      <span {...ariaProps} className={`${className} ${decoClass}`.trim()} style={sizeStyle}>
        {flag}
      </span>
    );
  }
  return (
    <span
      {...ariaProps}
      className={`fi fi-${iso} ${decoClass} ${className}`.trim()}
      style={sizeStyle}
    />
  );
}
