// Primitive presentasional modul keuangan (dark terminal).
// Komponen murni — aman dipakai di server component.

import Link from "next/link";
import { rupiah, rupiahShort, signed, pct } from "@/lib/keuangan/format";

type Tone = "up" | "down" | "accent" | "cyan" | "amber" | "dim" | "faint" | "plain";

const TONE_CLASS: Record<Tone, string> = {
  up: "keu-up",
  down: "keu-down",
  accent: "keu-accent",
  cyan: "keu-cyan-t",
  amber: "keu-amber-t",
  dim: "keu-dim-t",
  faint: "keu-faint-t",
  plain: "",
};

/** Pilih warna otomatis dari tanda angka. */
export function autoTone(n: number): Tone {
  if (n > 0) return "up";
  if (n < 0) return "down";
  return "dim";
}

export function PageHead({
  crumb,
  title,
  lede,
  actions,
}: {
  crumb?: React.ReactNode;
  title: string;
  lede?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="keu-pagehead">
      {crumb && <div className="keu-crumb">{crumb}</div>}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 className="keu-h1">{title}</h1>
          {lede && <p className="keu-lede">{lede}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}

export function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="keu-sec">
      <h2>{title}</h2>
      {note && <span className="keu-sec-note">{note}</span>}
      {children}
    </div>
  );
}

export function Panel({
  tab,
  pad = true,
  ticked = false,
  className = "",
  style,
  children,
}: {
  tab?: string;
  pad?: boolean;
  ticked?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div className={`keu-panel ${ticked ? "keu-ticked" : ""} ${className}`} style={style}>
      {tab && <div className="keu-panel-tab">{tab}</div>}
      {pad ? <div className="keu-panel-pad">{children}</div> : children}
    </div>
  );
}

export function Hero({
  label,
  value,
  formula,
}: {
  label: string;
  value: number;
  formula?: string;
}) {
  const neg = value < 0;
  return (
    <div className={`keu-hero ${neg ? "neg" : ""}`}>
      <div className="keu-hero-label">{label}</div>
      <div className={`keu-hero-num keu-num ${neg ? "keu-down" : "keu-up"}`}>
        {rupiah(value)}
      </div>
      {formula && <div className="keu-hero-formula">{formula}</div>}
    </div>
  );
}

export function Stat({
  k,
  v,
  sub,
  tone = "plain",
  accent,
}: {
  k: string;
  v: React.ReactNode;
  sub?: React.ReactNode;
  tone?: Tone;
  accent?: string;
}) {
  return (
    <div className="keu-stat">
      <div className="keu-stat-k">
        {accent && (
          <span
            style={{ width: 6, height: 6, background: accent, display: "inline-block" }}
          />
        )}
        {k}
      </div>
      <div className={`keu-stat-v keu-num ${TONE_CLASS[tone]}`}>{v}</div>
      {sub && <div className="keu-stat-sub">{sub}</div>}
    </div>
  );
}

export function Pill({
  tone = "dim",
  children,
}: {
  tone?: "cyan" | "warn" | "dim" | "ok" | "red";
  children: React.ReactNode;
}) {
  return <span className={`keu-pill keu-pill-${tone}`}>{children}</span>;
}

/** Angka uang dengan warna sesuai tanda atau eksplisit. */
export function Money({
  value,
  tone,
  short,
}: {
  value: number;
  tone?: Tone;
  short?: boolean;
}) {
  const t = tone ?? "plain";
  return (
    <span className={`keu-num ${TONE_CLASS[t]}`}>
      {short ? rupiahShort(value) : rupiah(value)}
    </span>
  );
}

export function Delta({ value, suffix }: { value: number; suffix?: string }) {
  const tone = value > 0 ? "keu-up" : value < 0 ? "keu-down" : "keu-faint-t";
  const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "■";
  return (
    <span className={`keu-num ${tone}`} style={{ fontSize: 10, letterSpacing: "0.06em" }}>
      {arrow} {pct(value)}
      {suffix ? ` ${suffix}` : ""}
    </span>
  );
}

export function SignedNum({ value, tone }: { value: number; tone?: Tone }) {
  const t = tone ?? autoTone(value);
  return <span className={`keu-num ${TONE_CLASS[t]}`}>{signed(value)}</span>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="keu-empty">{children}</div>;
}

/** Sparkline batang sederhana. */
export function Spark({
  data,
  labels,
}: {
  data: number[];
  labels?: string[];
}) {
  const max = Math.max(1, ...data.map((d) => Math.abs(d)));
  return (
    <div>
      <div className="keu-spark">
        {data.map((d, i) => {
          const h = Math.max(2, (Math.abs(d) / max) * 100);
          const color = d >= 0 ? "var(--keu-green)" : "var(--keu-red)";
          return (
            <div
              key={i}
              className="keu-spark-bar"
              style={{ height: `${h}%`, background: color }}
              title={labels?.[i]}
            />
          );
        })}
      </div>
      {labels && (
        <div
          style={{
            display: "flex",
            gap: 4,
            marginTop: 6,
            fontSize: 8.5,
            letterSpacing: "0.08em",
            color: "var(--keu-faint)",
          }}
        >
          {labels.map((l, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Bar proporsi bertumpuk. */
export function StackBar({
  segments,
}: {
  segments: { value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0) || 1;
  return (
    <div className="keu-bar">
      {segments.map((s, i) => (
        <span
          key={i}
          style={{
            width: `${(Math.max(0, s.value) / total) * 100}%`,
            background: s.color,
          }}
        />
      ))}
    </div>
  );
}

export function NavCard({
  idx,
  href,
  title,
  desc,
}: {
  idx: string;
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="keu-navcard">
      <span className="keu-navcard-idx">[{idx}]</span>
      <span className="keu-navcard-title">{title}</span>
      <span className="keu-navcard-desc">{desc}</span>
    </Link>
  );
}
