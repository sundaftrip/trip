"use client";

import { assessTourVisas, type VisaAssessmentRecord } from "@/lib/tour-visa-assessment";
import type { TourVisaDestination, TourVisaPlan } from "@/lib/tour-visa-plan";
import { formatCurrency } from "@/lib/utils";

export type VisaEditorCountry = Omit<VisaAssessmentRecord, "lastVerifiedAt"> & { lastVerifiedAt?: string | null };

export default function TourVisaPlanEditor({ value, countries, country, inclusions, addOns, confirmedFingerprint, onChange, onConfirm }: {
  value: TourVisaPlan | null;
  countries: VisaEditorCountry[];
  country?: string;
  inclusions?: string[];
  addOns?: { name: string; tag?: string }[];
  confirmedFingerprint: string | null;
  onChange: (value: TourVisaPlan | null) => void;
  onConfirm: (fingerprint: string | null) => void;
}) {
  const assessment = assessTourVisas({ plan: value, country, inclusions, addOns }, countries);
  const destinations = value?.destinations ?? [];
  function update(rows: TourVisaDestination[]) {
    onConfirm(null);
    onChange(rows.length ? { version: 1, passportCountry: "ID", passportType: "ordinary", purpose: "tourism", destinations: rows } : null);
  }
  function edit(index: number, patch: Partial<TourVisaDestination>) {
    update(destinations.map((row, i) => i === index ? { ...row, ...patch } : row));
  }
  const canConfirm = Boolean(value && assessment.issues.length === 0);

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4" aria-labelledby="tour-visa-plan-title">
      <div>
        <h2 id="tour-visa-plan-title" className="font-semibold text-gray-900 dark:text-white">Negara tujuan & pengurusan visa</h2>
        <p className="text-sm text-gray-500 mt-2">Untuk paspor biasa Indonesia, perjalanan wisata. Pilih setiap negara sesuai urutan kunjungan, termasuk transit. Judul dan nama kota tidak digunakan untuk menentukan visa.</p>
        <p className="text-sm text-gray-500 mt-2">Untuk paspor lain atau tujuan selain wisata, tim perlu memeriksa dokumen secara terpisah. Tambahkan negara yang belum tersedia melalui Database Visa.</p>
      </div>
      {destinations.map((row, index) => {
        const record = countries.find((item) => item.id === row.countryId);
        return (
          <fieldset key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
            <legend className="px-1 text-sm font-medium">Rute {index + 1}</legend>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-sm">Negara
                <select className="input mt-1" value={row.countryId} onChange={(event) => edit(index, { countryId: event.target.value, variantId: undefined })}>
                  <option value="">Pilih negara</option>
                  {countries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="text-sm">Jenis kunjungan
                <select className="input mt-1" value={row.kind} onChange={(event) => edit(index, { kind: event.target.value as TourVisaDestination["kind"], stayDays: Math.max(1, row.stayDays) })}>
                  <option value="visit">Kunjungan</option><option value="transit">Transit</option>
                </select>
              </label>
              <label className="text-sm">Jumlah hari
                <input className="input mt-1" type="number" min={row.kind === "transit" ? 0 : 1} max={365} value={row.stayDays} onChange={(event) => edit(index, { stayDays: Number(event.target.value) })} />
              </label>
              <label className="text-sm">Pengurusan visa
                <select className="input mt-1" value={row.service} onChange={(event) => edit(index, { service: event.target.value as TourVisaDestination["service"] })}>
                  <option value="offer">Tawarkan bila diperlukan</option>
                  <option value="included">Sudah termasuk paket</option>
                  <option value="separate">Sudah tercantum di biaya terpisah</option>
                  <option value="none">Informasi saja / konsultasi</option>
                </select>
              </label>
              <label className="text-sm md:col-span-2">Jenis layanan dari Database Visa
                <select className="input mt-1" value={row.variantId ?? ""} onChange={(event) => edit(index, { variantId: event.target.value || undefined })}>
                  <option value="">Gunakan harga tunggal bila tersedia</option>
                  {(record?.variants ?? []).filter((variant) => variant.id).map((variant) => <option key={variant.id} value={variant.id!}>{variant.name} {variant.priceIDR ? `(${formatCurrency(variant.priceIDR)})` : "(tanya harga)"}</option>)}
                </select>
              </label>
            </div>
            <div className="flex gap-4 text-sm">
              {index > 0 && <button type="button" onClick={() => { const rows = [...destinations]; [rows[index - 1], rows[index]] = [rows[index], rows[index - 1]]; update(rows); }}>Naikkan urutan</button>}
              <button type="button" className="text-red-600" onClick={() => update(destinations.filter((_, i) => i !== index))}>Hapus negara</button>
              {record && <a href={`/admin/database-visa/${record.id}`} target="_blank" rel="noopener noreferrer" className="text-teal-700">Periksa data visa</a>}
            </div>
          </fieldset>
        );
      })}
      <button type="button" className="btn-secondary" disabled={destinations.length >= 100} onClick={() => update([...destinations, { countryId: "", stayDays: 1, kind: "visit", service: "offer" }])}>Tambah negara / transit</button>
      <div className="border-t border-gray-200 pt-4 text-sm space-y-2" aria-live="polite">
        <h3 className="font-semibold">Ringkasan yang ditampilkan kepada traveler</h3>
        {assessment.summary.map((line, index) => <p key={index}>{line}</p>)}
        {assessment.offers.map((offer) => <p key={offer.id}>{offer.name}: {formatCurrency(offer.price)} per peserta yang memerlukan pengurusan.</p>)}
        {assessment.issues.length > 0 && <div className="text-amber-800 dark:text-amber-300"><strong>Lengkapi sebelum terbit:</strong><ul className="list-disc pl-5">{assessment.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul></div>}
        {assessment.warnings.length > 0 && <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300">{assessment.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
        <p className="text-gray-500">Rujukan dan tanggal pemeriksaan mengikuti Database Visa. Batas pemeriksaan ulang internal: 90 hari. Harga yang belum tersedia ditampilkan sebagai konsultasi, bukan dianggap bebas visa.</p>
      </div>
      <label className="flex gap-3 text-sm items-start">
        <input type="checkbox" className="mt-1" disabled={!canConfirm} checked={canConfirm && confirmedFingerprint === assessment.fingerprint} onChange={(event) => onConfirm(event.target.checked ? assessment.fingerprint : null)} />
        <span>Saya sudah memeriksa semua negara, transit, lama tinggal, rujukan aturan, dan penanganan biayanya. Ringkasan ini sesuai dengan perjalanan.</span>
      </label>
      <p className="text-xs text-gray-500">Draft tetap bisa disimpan. Katalog baru tidak dapat diterbitkan sebelum pemeriksaan selesai. Katalog lama tidak otomatis diturunkan.</p>
    </section>
  );
}
