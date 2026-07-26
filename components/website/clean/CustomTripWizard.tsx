"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown } from "lucide-react";
import { trackSundafEvent } from "@/lib/analytics-events";
import { readCampaignAttribution } from "@/lib/campaign-attribution";
import { toWaNumber } from "@/lib/utils";
import styles from "./CustomTripWizard.module.css";

type CustomTripState = {
  destination: string;
  dateStart: string;
  flexibility: string;
  adults: number;
  children: number;
  budget: string;
  accommodation: string;
  name: string;
  phone: string;
  notes: string;
};

const initialState: CustomTripState = {
  destination: "",
  dateStart: "",
  flexibility: "Fleksibel ±3 hari",
  adults: 2,
  children: 0,
  budget: "",
  accommodation: "Hotel bintang 4",
  name: "",
  phone: "",
  notes: "",
};

const steps = [
  "Destinasi",
  "Tanggal",
  "Peserta",
  "Budget",
  "Kontak",
] as const;

const destinations = [
  "Rusia & Aurora",
  "Asia Tengah",
  "Vietnam",
  "Jepang",
  "Belum yakin",
];

function buildMessage(state: CustomTripState, sourceUrl: string, campaign: string) {
  return [
    "Halo Sundaf Trip, saya ingin merancang private trip:",
    "",
    `Destinasi: ${state.destination}`,
    `Tanggal mulai: ${state.dateStart || "Belum ditentukan"}`,
    `Fleksibilitas: ${state.flexibility}`,
    `Peserta: ${state.adults} dewasa, ${state.children} anak`,
    `Budget: ${state.budget || "Perlu rekomendasi"}`,
    `Akomodasi: ${state.accommodation}`,
    `Nama: ${state.name}`,
    `Nomor WhatsApp: ${state.phone}`,
    `Kebutuhan lain: ${state.notes || "Belum ada"}`,
    "",
    `Source: ${sourceUrl}`,
    ...(campaign ? [`Campaign: ${campaign}`] : []),
    "",
    "Mohon dibantu menyusun opsi rute dan estimasi yang realistis.",
  ].join("\n");
}

export default function CustomTripWizard({ whatsapp }: { whatsapp: string }) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<CustomTripState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationAttempt, setValidationAttempt] = useState(0);
  const [restored, setRestored] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("https://sundaftrip.com/custom-trip");
  const [campaign, setCampaign] = useState("");
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const adultsInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.sessionStorage.getItem("sundaf-custom-trip");
        if (saved) setState({ ...initialState, ...JSON.parse(saved) });
      } catch {
        // A disabled storage API should not block the form.
      } finally {
        setRestored(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSourceUrl(window.location.href);
      setCampaign(readCampaignAttribution());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      window.sessionStorage.setItem("sundaf-custom-trip", JSON.stringify(state));
    } catch {
      // The WhatsApp fallback still works without persistence.
    }
  }, [restored, state]);

  const progress = ((step + 1) / steps.length) * 100;
  const message = useMemo(
    () => buildMessage(state, sourceUrl, campaign),
    [campaign, sourceUrl, state],
  );
  const waHref = `https://wa.me/${toWaNumber(whatsapp)}?text=${encodeURIComponent(message)}`;

  function update<K extends keyof CustomTripState>(key: K, value: CustomTripState[K]) {
    setState((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function validateCurrentStep() {
    const nextErrors: Record<string, string> = {};
    if (step === 0 && !state.destination) nextErrors.destination = "Pilih destinasi atau pilih “Belum yakin”.";
    if (step === 2 && (!Number.isFinite(state.adults) || state.adults < 1)) {
      nextErrors.adults = "Minimal satu peserta dewasa.";
    }
    if (step === 4) {
      if (state.name.trim().length < 2) nextErrors.name = "Masukkan nama kamu.";
      if (state.phone.replace(/\D/g, "").length < 9) nextErrors.phone = "Masukkan nomor WhatsApp yang aktif.";
    }
    setErrors(nextErrors);
    const firstInvalidControl = nextErrors.destination
      ? destinationInputRef.current
      : nextErrors.adults
        ? adultsInputRef.current
        : nextErrors.name
          ? nameInputRef.current
          : nextErrors.phone
            ? phoneInputRef.current
            : null;
    if (firstInvalidControl) {
      setValidationAttempt((attempt) => attempt + 1);
      window.requestAnimationFrame(() => firstInvalidControl.focus());
      return false;
    }
    return true;
  }

  function next() {
    if (!validateCurrentStep()) return;
    if (step === 0) trackSundafEvent("custom_trip_start", { destination: state.destination });
    setStep((value) => Math.min(value + 1, steps.length - 1));
    window.requestAnimationFrame(() => document.getElementById("custom-step-title")?.focus());
  }

  function submit() {
    if (!validateCurrentStep()) return false;
    trackSundafEvent("custom_trip_submit", { destination: state.destination });
    void fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        name: state.name.trim(),
        whatsapp: state.phone.trim(),
        destination: state.destination,
        travelDate: state.dateStart || state.flexibility,
        message,
        source: window.location.href,
      }),
    }).catch(() => undefined);
    return true;
  }

  const errorSummary = Object.keys(errors).length > 0 && (
    <div
      key={validationAttempt}
      className={styles.error}
      role="alert"
      aria-atomic="true"
    >
      Periksa {Object.keys(errors).length} isian:{" "}
      {[
        errors.destination && "destinasi",
        errors.adults && "jumlah peserta dewasa",
        errors.name && "nama",
        errors.phone && "nomor WhatsApp",
      ].filter(Boolean).join(" dan ")}.
    </div>
  );

  return (
    <section className={styles.wizard} aria-labelledby="custom-step-title">
      <div className={styles.progressHeader}>
        <div>
          <span>Langkah {step + 1} dari {steps.length}</span>
          <strong>{steps[step]}</strong>
        </div>
        <span aria-live="polite">{Math.round(progress)}% selesai</span>
      </div>
      <div className={styles.progressTrack} aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

      <div className={styles.stepBody}>
        {step === 0 && (
          <>
            <h2 id="custom-step-title" tabIndex={-1}>Kamu ingin pergi ke mana?</h2>
            <p>Pilih wilayah utama. Kota dan rute detail bisa dibahas setelah tim melihat tanggal serta jumlah peserta.</p>
            {errorSummary}
            <fieldset
              className={styles.choiceGrid}
              aria-invalid={Boolean(errors.destination)}
              aria-describedby={errors.destination ? "destination-error" : undefined}
            >
              <legend className={styles.srOnly}>Destinasi</legend>
              {destinations.map((destination) => (
                <label key={destination} data-selected={state.destination === destination}>
                  <input
                    ref={destination === destinations[0] ? destinationInputRef : undefined}
                    type="radio"
                    name="destination"
                    checked={state.destination === destination}
                    onChange={() => update("destination", destination)}
                    aria-describedby={errors.destination ? "destination-error" : undefined}
                  />
                  <span>{destination}</span><Check aria-hidden="true" />
                </label>
              ))}
            </fieldset>
            {errors.destination && <span className={styles.error} id="destination-error">{errors.destination}</span>}
          </>
        )}

        {step === 1 && (
          <>
            <h2 id="custom-step-title" tabIndex={-1}>Kapan rencananya berangkat?</h2>
            <p>Tanggal perkiraan sudah cukup. Harga final selalu mengikuti ketersediaan aktual.</p>
            <label className={styles.field}>
              <span>Tanggal mulai</span>
              <input type="date" value={state.dateStart} onChange={(event) => update("dateStart", event.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Fleksibilitas</span>
              <select value={state.flexibility} onChange={(event) => update("flexibility", event.target.value)}>
                <option>Tanggal sudah pasti</option>
                <option>Fleksibel ±3 hari</option>
                <option>Fleksibel ±1 minggu</option>
                <option>Baru tahu bulannya</option>
              </select>
              <ChevronDown aria-hidden="true" />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <h2 id="custom-step-title" tabIndex={-1}>Siapa saja yang ikut?</h2>
            <p>Jumlah dan komposisi peserta memengaruhi kendaraan, kamar, serta ritme itinerary.</p>
            {errorSummary}
            <div className={styles.counterGrid}>
              <label><span>Dewasa</span><input ref={adultsInputRef} type="number" min="1" max="40" value={state.adults} onChange={(event) => update("adults", Number(event.target.value))} aria-invalid={Boolean(errors.adults)} aria-describedby={errors.adults ? "custom-adults-error" : undefined} /></label>
              <label><span>Anak</span><input type="number" min="0" max="20" value={state.children} onChange={(event) => update("children", Number(event.target.value))} /></label>
            </div>
            {errors.adults && <span className={styles.error} id="custom-adults-error">{errors.adults}</span>}
          </>
        )}

        {step === 3 && (
          <>
            <h2 id="custom-step-title" tabIndex={-1}>Budget dan kenyamanan seperti apa?</h2>
            <p>Kisaran budget membantu tim menghindari rute yang tidak realistis sejak awal.</p>
            <label className={styles.field}>
              <span>Kisaran budget per orang</span>
              <select value={state.budget} onChange={(event) => update("budget", event.target.value)}>
                <option value="">Perlu rekomendasi</option>
                <option>Di bawah Rp15 juta</option>
                <option>Rp15–25 juta</option>
                <option>Rp25–40 juta</option>
                <option>Di atas Rp40 juta</option>
              </select>
              <ChevronDown aria-hidden="true" />
            </label>
            <label className={styles.field}>
              <span>Preferensi akomodasi</span>
              <select value={state.accommodation} onChange={(event) => update("accommodation", event.target.value)}>
                <option>Hotel bintang 3</option>
                <option>Hotel bintang 4</option>
                <option>Hotel bintang 5</option>
                <option>Campuran sesuai kota</option>
              </select>
              <ChevronDown aria-hidden="true" />
            </label>
          </>
        )}

        {step === 4 && (
          <>
            <h2 id="custom-step-title" tabIndex={-1}>Ke mana tim bisa menghubungi kamu?</h2>
            <p>Data ini hanya dipakai untuk menindaklanjuti rencana perjalanan yang kamu kirim.</p>
            {errorSummary}
            <label className={styles.field}>
              <span>Nama</span>
              <input ref={nameInputRef} value={state.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "custom-name-error" : undefined} />
              {errors.name && <small className={styles.error} id="custom-name-error">{errors.name}</small>}
            </label>
            <label className={styles.field}>
              <span>Nomor WhatsApp</span>
              <input ref={phoneInputRef} value={state.phone} onChange={(event) => update("phone", event.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="08xx xxxx xxxx" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "custom-phone-error" : undefined} />
              {errors.phone && <small className={styles.error} id="custom-phone-error">{errors.phone}</small>}
            </label>
            <label className={styles.field}>
              <span>Kebutuhan khusus atau catatan</span>
              <textarea value={state.notes} onChange={(event) => update("notes", event.target.value)} rows={4} placeholder="Contoh: makanan halal, mobilitas orang tua, perlu tour leader dari Jakarta…" />
            </label>
            <dl className={styles.summary}>
              <div><dt>Destinasi</dt><dd>{state.destination}</dd></div>
              <div><dt>Waktu</dt><dd>{state.dateStart || state.flexibility}</dd></div>
              <div><dt>Peserta</dt><dd>{state.adults} dewasa, {state.children} anak</dd></div>
              <div><dt>Budget</dt><dd>{state.budget || "Perlu rekomendasi"}</dd></div>
            </dl>
          </>
        )}
      </div>

      <footer className={styles.wizardFooter}>
        <button type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>
          <ArrowLeft aria-hidden="true" /> Kembali
        </button>
        {step < steps.length - 1 ? (
          <button type="button" onClick={next}>Lanjut <ArrowRight aria-hidden="true" /></button>
        ) : (
          <a
            href={waHref}
            target="_blank"
            rel="noopener"
            data-analytics-validated="true"
            onClick={(event) => {
              if (!submit()) event.preventDefault();
            }}
          >
            Kirim via WhatsApp <span>(membuka tab baru)</span>
          </a>
        )}
      </footer>
    </section>
  );
}
