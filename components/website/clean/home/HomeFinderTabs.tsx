"use client";

import { type FormEvent, type ReactNode, useCallback, useId, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { trackSundafEvent } from "@/lib/analytics-events";
import styles from "./CleanHome.module.css";

/* Kotak pencarian beranda dengan dua tab:
   - "Open trip": formulir yang sudah ada (children), mencari jadwal dengan tanggal tetap.
   - "Gabung tanggal": pilih negara dan tanggal tiba, lihat berapa orang yang sudah
     memilih tanggal itu, lalu lanjut ke halaman pool negara tersebut.
   Data dari /api/pool/summary: hanya angka per tanggal, tanpa nama dan nomor WhatsApp. */

type PoolDate = { d: string; n: number; full: boolean };
type PoolDest = {
  code: string; name: string; city: string; mode: "pool" | "minat"; url: string;
  first: number; from: number; minDate: string; maxDate: string; total: number; dates: PoolDate[];
};
type Summary = { ok: true; open: boolean; today: string; dests: PoolDest[] };
type Load = { state: "idle" | "loading" | "error" } | { state: "ready"; data: Summary };

const MON = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const OTHER = "other";

function dateLabel(key: string) {
  const p = key.split("-");
  const dow = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay();
  return `${DAYS[dow]}, ${+p[2]} ${MON[+p[1] - 1]} ${p[0]}`;
}
function juta(n: number) {
  return "Rp" + (Math.round(n / 1e4) / 100).toFixed(2).replace(/\.?0+$/, "").replace(".", ",") + " jt";
}
function isSummary(value: unknown): value is Summary {
  return !!value && typeof value === "object" && (value as Summary).ok === true && Array.isArray((value as Summary).dests);
}

function hintFor(load: Load, dest: PoolDest | undefined, date: string): { text: ReactNode; live: boolean } {
  if (load.state === "loading" || load.state === "idle") return { text: "Memuat tanggal…", live: false };
  if (load.state === "error") return { text: "Tanggal belum bisa dimuat. Tekan Gabung untuk membuka halaman pool.", live: false };
  if (!dest) return { text: "Belum ada negara yang dibuka. Pantau lagi, ya.", live: false };
  const pool = dest.mode === "pool";
  const entry = dest.dates.find((x) => x.d === date);
  if (!date) {
    const from = pool && dest.from > 0 ? ` Mulai ${juta(dest.from)} per orang.` : "";
    if (!dest.total) return { text: pool ? `Belum ada yang daftar. Pilih tanggalmu dan jadi yang pertama.${from}` : `${dest.name} segera dibuka. Isi tanggalmu, kami kabari duluan.`, live: false };
    return { text: <><b>{dest.total} orang</b> di {dest.dates.length} tanggal.{from || " Pilih tanggal tibamu."}</>, live: true };
  }
  if (entry?.full) return { text: "Tanggal ini sudah penuh. Pilih tanggal lain.", live: false };
  if (!entry || !entry.n) return { text: "Belum ada yang pilih tanggal ini. Jadi yang pertama, lalu ajak teman.", live: false };
  if (!pool) return { text: <><b>{entry.n} orang</b> berminat di tanggal ini.</>, live: true };
  const left = dest.first - entry.n;
  return {
    text: <><b>{entry.n} orang</b> sudah di tanggal ini{left > 0 ? `, ${left} lagi grup WA dibuka` : ", grup WA sudah dibuka"}.</>,
    live: true,
  };
}

export default function HomeFinderTabs({ children }: { children: ReactNode }) {
  const id = useId();
  const [tab, setTab] = useState<"trip" | "pool">("trip");
  const [load, setLoad] = useState<Load>({ state: "idle" });
  const [code, setCode] = useState("");
  const [choice, setChoice] = useState("");
  const [custom, setCustom] = useState("");
  const started = useRef(false);

  const fetchSummary = useCallback(() => {
    if (started.current) return;
    started.current = true;
    setLoad({ state: "loading" });
    fetch("/api/pool/summary", { headers: { Accept: "application/json" } })
      .then((res) => res.json())
      .then((data: unknown) => {
        if (!isSummary(data)) throw new Error("bad summary");
        setLoad({ state: "ready", data });
      })
      .catch(() => {
        started.current = false;
        setLoad({ state: "error" });
      });
  }, []);

  function openTab(next: "trip" | "pool") {
    setTab(next);
    if (next === "pool") fetchSummary();
  }

  const dests = load.state === "ready" ? load.data.dests : [];
  const dest = dests.find((d) => d.code === code) ?? dests[0];
  const hasDates = !!dest && dest.dates.length > 0;
  const typing = !hasDates || choice === OTHER;
  const date = typing ? custom : choice;
  const validDate = !!dest && /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= dest.minDate && date <= dest.maxDate;
  const hint = hintFor(load, dest, validDate ? date : "");

  function selectDest(next: string) {
    setCode(next);
    setChoice("");
    setCustom("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = new URL(dest?.url ?? "/pool", window.location.origin);
    if (dest && validDate && !dest.dates.find((x) => x.d === date)?.full) target.searchParams.set("d", date);
    new URLSearchParams(window.location.search).forEach((value, key) => {
      if (key.toLowerCase().startsWith("utm_")) target.searchParams.set(key, value);
    });
    trackSundafEvent("home_pool_submit", { destination: dest?.code ?? "all", with_date: target.searchParams.has("d") });
    window.location.assign(target.pathname + target.search);
  }

  const tabButton = (key: "trip" | "pool", label: string) => (
    <button
      type="button" role="tab" id={`${id}-tab-${key}`} aria-selected={tab === key} aria-controls={`${id}-panel-${key}`}
      tabIndex={tab === key ? 0 : -1} className={styles.finderTab}
      onClick={() => openTab(key)}
      onPointerEnter={key === "pool" ? fetchSummary : undefined}
      onFocus={key === "pool" ? fetchSummary : undefined}
      onKeyDown={(event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        const next = key === "trip" ? "pool" : "trip";
        openTab(next);
        document.getElementById(`${id}-tab-${next}`)?.focus();
      }}
    >
      {label}
    </button>
  );

  return (
    <div className={styles.finder}>
      <div className={styles.finderBar}>
        <div className={styles.finderTabs} role="tablist" aria-label="Cara mencari perjalanan">
          {tabButton("trip", "Open trip")}
          {tabButton("pool", "Gabung tanggal")}
        </div>
        {tab === "pool" && (
          <p className={styles.finderHint} aria-live="polite">
            <span>
              {hint.live && <span className={styles.finderHintDot} aria-hidden="true" />}
              {hint.text}
            </span>
            {typing && hasDates && (
              <button type="button" className={styles.finderBack} onClick={() => { setChoice(""); setCustom(""); }}>
                Lihat tanggal yang ada
              </button>
            )}
          </p>
        )}
      </div>

      <div role="tabpanel" id={`${id}-panel-trip`} aria-labelledby={`${id}-tab-trip`} hidden={tab !== "trip"}>
        {children}
      </div>

      <div role="tabpanel" id={`${id}-panel-pool`} aria-labelledby={`${id}-tab-pool`} hidden={tab !== "pool"}>
        <form className={styles.finderCard} onSubmit={submit} aria-label="Gabung dengan orang yang tiba di tanggal yang sama">
          <label className={styles.finderField}>
            <span>
              <small>NEGARA</small>
              <select name="pool-destination" value={dest?.code ?? ""} onChange={(event) => selectDest(event.target.value)} disabled={!dests.length}>
                {!dests.length && <option value="">{load.state === "error" ? "Lihat semua" : "Memuat…"}</option>}
                {dests.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}{d.mode === "minat" ? " (segera)" : ""}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className={styles.finderField}>
            <span>
              <small><span className={styles.finderMonthFull}>TANGGAL TIBA</span><span className={styles.finderMonthShort}>TIBA</span></small>
              {typing ? (
                <input
                  type="date" name="pool-date" value={custom} min={dest?.minDate} max={dest?.maxDate} disabled={!dest}
                  onChange={(event) => setCustom(event.target.value)}
                />
              ) : (
                <select name="pool-date" value={choice} onChange={(event) => setChoice(event.target.value)}>
                  <option value="">Pilih tanggal</option>
                  {(dest?.dates ?? []).map((x) => (
                    <option key={x.d} value={x.d} disabled={x.full}>
                      {dateLabel(x.d)} · {x.full ? "penuh" : `${x.n} orang`}
                    </option>
                  ))}
                  <option value={OTHER}>Tanggal lain…</option>
                </select>
              )}
            </span>
          </label>

          <button type="submit" aria-label={dest ? `Gabung pool ${dest.name}` : "Lihat semua pool"}>
            <span className={styles.finderSubmitLabel}>{dest ? (dest.mode === "pool" ? "Gabung" : "Daftar minat") : "Lihat pool"}</span>
            <ArrowRight className={styles.finderSubmitIcon} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
