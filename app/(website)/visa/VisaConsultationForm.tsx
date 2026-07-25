"use client";

import { useId, useMemo, useRef, useState, type FormEvent } from "react";
import { MessageCircle, Minus, Plus } from "lucide-react";

import { trackSundafEvent } from "@/lib/analytics-events";
import styles from "./VisaPages.module.css";

export type VisaConsultationVariant = {
  id: string;
  name: string;
  priceIDR: number | null;
  processingTime: string | null;
};

type VisaConsultationFormProps = {
  countryName: string;
  waNumber: string;
  variants: VisaConsultationVariant[];
  fallbackCostLabel: string;
  fallbackIsFree: boolean;
};

type FormErrors = {
  name?: string;
  whatsapp?: string;
};

const RUPIAH = new Intl.NumberFormat("id-ID");

function formatRp(value: number) {
  return `Rp ${RUPIAH.format(value)}`;
}

export default function VisaConsultationForm({
  countryName,
  waNumber,
  variants,
  fallbackCostLabel,
  fallbackIsFree,
}: VisaConsultationFormProps) {
  const formId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const whatsappRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");
  const [applicants, setApplicants] = useState(1);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const selected = useMemo(
    () => variants.find((variant) => variant.id === selectedId) ?? variants[0] ?? null,
    [selectedId, variants],
  );
  const subtotal = selected?.priceIDR ? selected.priceIDR * applicants : null;
  const headline = subtotal !== null
    ? formatRp(subtotal)
    : selected?.priceIDR
      ? formatRp(selected.priceIDR)
      : selected
        ? "Tanya harga"
        : fallbackCostLabel;

  async function submitConsultation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !waNumber) return;

    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = "Masukkan nama agar tim tahu siapa yang perlu dihubungi.";
    if (whatsapp.replace(/\D/g, "").length < 8) {
      nextErrors.whatsapp = "Masukkan nomor WhatsApp yang dapat dihubungi.";
    }

    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.whatsapp) {
      window.requestAnimationFrame(() => {
        if (nextErrors.name) nameRef.current?.focus();
        else whatsappRef.current?.focus();
      });
      return;
    }

    const messageLines = [
      `Halo, saya ingin konsultasi visa ${countryName}.`,
      "",
      `Nama: ${name.trim()}`,
      `Nomor WhatsApp: ${whatsapp.trim()}`,
    ];
    if (selected) {
      messageLines.push(`Paket: ${selected.name}`);
      if (selected.processingTime) {
        messageLines.push(`Estimasi tercatat: ${selected.processingTime}`);
      }
    }
    messageLines.push(`Jumlah pelamar: ${applicants} orang`);
    if (subtotal !== null) messageLines.push(`Subtotal estimasi: ${formatRp(subtotal)}`);
    if (notes.trim()) messageLines.push(`Catatan: ${notes.trim()}`);
    messageLines.push("", "Mohon dibantu cek persyaratan, biaya terkini, dan langkah pengajuan.");

    const whatsappHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(messageLines.join("\n"))}`;
    const inquiryParts = [
      selected ? `Paket: ${selected.name}` : null,
      `Jumlah pelamar: ${applicants}`,
      subtotal !== null ? `Subtotal: ${formatRp(subtotal)}` : null,
      notes.trim() ? `Catatan: ${notes.trim()}` : null,
    ].filter((item): item is string => Boolean(item));

    setSubmitting(true);
    trackSundafEvent("whatsapp_consultation_click", {
      source: "visa_detail",
      country: countryName,
    });

    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          whatsapp: whatsapp.trim(),
          destination: `Visa ${countryName}`,
          message: inquiryParts.join(" · "),
          source: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
    } catch {
      // WhatsApp remains the safe fallback if lead recording is unavailable.
    }

    window.location.href = whatsappHref;
  }

  return (
    <form className={styles.consultationCard} onSubmit={submitConsultation} noValidate>
      <p className={styles.formEyebrow}>
        {subtotal !== null ? "Subtotal estimasi" : fallbackIsFree ? "Status biaya" : "Referensi biaya"}
      </p>
      <p className={styles.formPrice} aria-live="polite">{headline}</p>
      <p className={styles.formHint}>
        {fallbackIsFree && variants.length === 0
          ? "Baca ketentuan masuk sebelum berangkat."
          : "Konfirmasi biaya dan persyaratan sebelum pengajuan."}
      </p>

      {variants.length > 0 && (
        <fieldset className={styles.formGroup}>
          <legend className={styles.formLegend}>Pilih layanan</legend>
          <div className={styles.radioList}>
            {variants.map((variant) => (
              <label className={styles.radioCard} key={variant.id}>
                <input
                  type="radio"
                  name={`${formId}-variant`}
                  value={variant.id}
                  checked={selected?.id === variant.id}
                  onChange={() => setSelectedId(variant.id)}
                />
                <span>
                  <span className={styles.radioName}>{variant.name}</span>
                  {variant.processingTime && (
                    <span className={styles.radioMeta}>
                      Estimasi {variant.processingTime}
                    </span>
                  )}
                </span>
                <span className={styles.radioPrice}>
                  {variant.priceIDR ? formatRp(variant.priceIDR) : "Tanya harga"}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className={styles.formGroup}>
        <span className={styles.formLabel} id={`${formId}-applicants-label`}>
          Jumlah pelamar
        </span>
        <div
          className={styles.stepper}
          role="group"
          aria-labelledby={`${formId}-applicants-label`}
        >
          <div className={styles.stepperText}>
            <strong>{applicants} orang</strong>
            <span>Dapat dikoreksi saat konsultasi</span>
          </div>
          <div className={styles.stepperControls}>
            <button
              className={styles.stepperButton}
              type="button"
              aria-label="Kurangi jumlah pelamar"
              disabled={applicants <= 1}
              onClick={() => setApplicants((count) => Math.max(1, count - 1))}
            >
              <Minus size={16} aria-hidden="true" />
            </button>
            <span className={styles.stepperValue} aria-live="polite">{applicants}</span>
            <button
              className={styles.stepperButton}
              type="button"
              aria-label="Tambah jumlah pelamar"
              disabled={applicants >= 20}
              onClick={() => setApplicants((count) => Math.min(20, count + 1))}
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor={`${formId}-name`}>
          Nama lengkap
        </label>
        <input
          ref={nameRef}
          className={styles.formField}
          id={`${formId}-name`}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
          }}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${formId}-name-error` : undefined}
          autoComplete="name"
        />
        {errors.name && (
          <p className={styles.formError} id={`${formId}-name-error`}>
            {errors.name}
          </p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor={`${formId}-whatsapp`}>
          Nomor WhatsApp
        </label>
        <input
          ref={whatsappRef}
          className={styles.formField}
          id={`${formId}-whatsapp`}
          value={whatsapp}
          onChange={(event) => {
            setWhatsapp(event.target.value);
            if (errors.whatsapp) {
              setErrors((current) => ({ ...current, whatsapp: undefined }));
            }
          }}
          aria-invalid={Boolean(errors.whatsapp)}
          aria-describedby={`${formId}-whatsapp-help${errors.whatsapp ? ` ${formId}-whatsapp-error` : ""}`}
          autoComplete="tel"
          inputMode="tel"
          placeholder="Contoh: 0812 3456 7890"
        />
        <p className={styles.formHelp} id={`${formId}-whatsapp-help`}>
          Dipakai untuk tindak lanjut permintaan ini.
        </p>
        {errors.whatsapp && (
          <p className={styles.formError} id={`${formId}-whatsapp-error`}>
            {errors.whatsapp}
          </p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor={`${formId}-notes`}>
          Catatan <span className={styles.formHelp}>(opsional)</span>
        </label>
        <textarea
          className={styles.formField}
          id={`${formId}-notes`}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Tanggal perjalanan atau kebutuhan khusus"
          rows={4}
        />
      </div>

      {waNumber ? (
        <button className={styles.formSubmit} type="submit" disabled={submitting}>
          <MessageCircle size={17} aria-hidden="true" />
          {submitting ? "Menyiapkan WhatsApp…" : "Tanya via WhatsApp"}
        </button>
      ) : (
        <p className={styles.formError} role="status">
          Nomor WhatsApp belum tersedia. Gunakan halaman kontak untuk menghubungi tim.
        </p>
      )}

      <p className={styles.formDisclaimer}>
        Mengirim formulir membuka percakapan WhatsApp dan belum berarti pengajuan,
        pembayaran, atau persetujuan visa.
      </p>
    </form>
  );
}
