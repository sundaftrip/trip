"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  type ActionState,
  createBankAccount,
  createLedgerEntry,
  createVendor,
  createVendorBill,
  payVendorBill,
  upsertTripFinance,
  toggleBankArchive,
  deleteLedgerEntry,
} from "@/lib/keuangan/actions";
import { CURRENCIES, rupiah } from "@/lib/keuangan/format";

const INIT: ActionState = { ok: false };

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="keu-btn keu-btn-primary" disabled={pending}>
      {pending ? "MEMPROSES…" : label}
    </button>
  );
}

/** Shell form: trigger → panel berisi <form>. Auto-tutup saat sukses. */
function FormShell({
  triggerLabel,
  title,
  action,
  submitLabel,
  onReset,
  children,
}: {
  triggerLabel: string;
  title: string;
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  submitLabel: string;
  onReset?: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(action, INIT);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      onReset?.();
      setOpen(false);
    }
  }, [state, onReset]);

  return (
    <div>
      <button
        className={`keu-btn ${open ? "keu-btn-ghost" : "keu-btn-primary"}`}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "✕ TUTUP" : `+ ${triggerLabel}`}
      </button>

      {open && (
        <div className="keu-panel keu-ticked" style={{ marginTop: 12 }}>
          <div className="keu-panel-tab">{title}</div>
          <form ref={ref} action={formAction} className="keu-panel-pad">
            {children}
            {state.error && (
              <div
                className="keu-pill keu-pill-red"
                style={{ display: "block", marginBottom: 12, padding: "8px 10px" }}
              >
                ⚠ {state.error}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <SubmitBtn label={submitLabel} />
              <button
                type="button"
                className="keu-btn keu-btn-ghost"
                onClick={() => setOpen(false)}
              >
                BATAL
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 14,
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="keu-field">
      <label className="keu-label">{label}</label>
      {children}
    </div>
  );
}

// ── Bank ──────────────────────────────────────────────────────

export function BankForm() {
  return (
    <FormShell
      triggerLabel="REKENING BARU"
      title="Tambah Rekening Bank / Kas"
      action={createBankAccount}
      submitLabel="Simpan Rekening"
    >
      <Grid>
        <Field label="Nama Rekening">
          <input className="keu-input" name="name" placeholder="Bank Mandiri Operasional" required />
        </Field>
        <Field label="Tipe">
          <select className="keu-select" name="kind" defaultValue="BANK">
            <option value="BANK">Bank</option>
            <option value="CASH">Kas Tunai</option>
            <option value="EWALLET">E-Wallet</option>
          </select>
        </Field>
        <Field label="No. Rekening (opsional)">
          <input className="keu-input" name="accountNo" placeholder="1234567890" />
        </Field>
        <Field label="Saldo Awal (IDR)">
          <input className="keu-input" name="openingBalance" type="number" defaultValue={0} />
        </Field>
      </Grid>
      <Field label="Catatan (opsional)">
        <input className="keu-input" name="note" placeholder="Rekening untuk operasional harian" />
      </Field>
    </FormShell>
  );
}

// ── Jurnal manual ─────────────────────────────────────────────

export function JurnalForm({
  banks,
  tours,
}: {
  banks: { id: string; name: string }[];
  tours: { id: string; title: string }[];
}) {
  return (
    <FormShell
      triggerLabel="ENTRY MANUAL"
      title="Catat Transaksi Manual"
      action={createLedgerEntry}
      submitLabel="Catat Transaksi"
    >
      <Grid>
        <Field label="Arah">
          <select className="keu-select" name="direction" defaultValue="OUT">
            <option value="IN">Cash In (Masuk)</option>
            <option value="OUT">Cash Out (Keluar)</option>
          </select>
        </Field>
        <Field label="Nominal (IDR)">
          <input className="keu-input" name="amount" type="number" placeholder="0" required />
        </Field>
        <Field label="Tanggal">
          <input
            className="keu-input"
            name="date"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </Field>
        <Field label="Kategori">
          <input className="keu-input" name="category" placeholder="Operasional Kantor" required />
        </Field>
        <Field label="Sumber">
          <select className="keu-select" name="source" defaultValue="MANUAL">
            <option value="MANUAL">Manual</option>
            <option value="OPERATIONAL">Operasional</option>
            <option value="REFUND">Refund</option>
            <option value="OTHER">Lainnya</option>
          </select>
        </Field>
        <Field label="Rekening">
          <select className="keu-select" name="bankAccountId" defaultValue="">
            <option value="">— Tidak ditentukan —</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Trip Terkait (opsional)">
          <select className="keu-select" name="tourId" defaultValue="">
            <option value="">— Non-trip —</option>
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </Field>
      </Grid>
      <Field label="Keterangan (opsional)">
        <input className="keu-input" name="description" placeholder="Detail transaksi" />
      </Field>
    </FormShell>
  );
}

// ── Vendor ────────────────────────────────────────────────────

const VENDOR_CATS = [
  ["AIRLINE", "Maskapai"],
  ["HOTEL", "Hotel"],
  ["LAND_OPERATOR", "Land Operator"],
  ["VISA", "Visa"],
  ["TRANSPORT", "Transport"],
  ["INSURANCE", "Asuransi"],
  ["GUIDE", "Tour Guide"],
  ["OTHER", "Lainnya"],
] as const;

export function VendorForm() {
  return (
    <FormShell
      triggerLabel="VENDOR BARU"
      title="Tambah Vendor"
      action={createVendor}
      submitLabel="Simpan Vendor"
    >
      <Grid>
        <Field label="Nama Vendor">
          <input className="keu-input" name="name" placeholder="Aeroflot" required />
        </Field>
        <Field label="Kategori">
          <select className="keu-select" name="category" defaultValue="OTHER">
            {VENDOR_CATS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Kontak (opsional)">
          <input className="keu-input" name="contact" placeholder="+7 ..." />
        </Field>
      </Grid>
      <Field label="Catatan (opsional)">
        <input className="keu-input" name="note" placeholder="" />
      </Field>
    </FormShell>
  );
}

export function VendorBillForm({
  vendors,
  tours,
}: {
  vendors: { id: string; name: string }[];
  tours: { id: string; title: string }[];
}) {
  const [currency, setCurrency] = useState("IDR");
  const [fxRate, setFxRate] = useState("");
  const [nominal, setNominal] = useState("");
  const isForeign = currency !== "IDR";
  const idr = isForeign
    ? (parseFloat(nominal) || 0) * (parseFloat(fxRate) || 0)
    : parseFloat(nominal) || 0;
  const reset = useCallback(() => {
    setCurrency("IDR");
    setFxRate("");
    setNominal("");
  }, []);

  return (
    <FormShell
      triggerLabel="TAGIHAN BARU"
      title="Catat Tagihan / Hutang Vendor"
      action={createVendorBill}
      submitLabel="Simpan Tagihan"
      onReset={reset}
    >
      <Grid>
        <Field label="Vendor">
          <select className="keu-select" name="vendorId" required defaultValue="">
            <option value="" disabled>
              — Pilih vendor —
            </option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Trip Terkait (opsional)">
          <select className="keu-select" name="tourId" defaultValue="">
            <option value="">— Non-trip —</option>
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Mata Uang">
          <select
            className="keu-select"
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        {isForeign && (
          <Field label="Kurs 1 unit → IDR">
            <input
              className="keu-input"
              name="fxRate"
              type="number"
              placeholder="16250"
              value={fxRate}
              onChange={(e) => setFxRate(e.target.value)}
              required
            />
          </Field>
        )}
        <Field label={`Nominal Tagihan (${currency})`}>
          <input
            className="keu-input"
            name="amount"
            type="number"
            placeholder="0"
            value={nominal}
            onChange={(e) => setNominal(e.target.value)}
            required
          />
        </Field>
        <Field label="Jatuh Tempo (opsional)">
          <input className="keu-input" name="dueDate" type="date" />
        </Field>
      </Grid>
      <Field label="Keterangan">
        <input className="keu-input" name="description" placeholder="Tiket pesawat 12 pax" required />
      </Field>
      {isForeign && (
        <div
          className="keu-pill keu-pill-cyan"
          style={{ display: "block", marginBottom: 12, padding: "8px 10px" }}
        >
          ≈ {rupiah(idr)} — disimpan ke pembukuan sebagai nilai IDR
        </div>
      )}
      <label
        className="keu-label"
        style={{ display: "flex", gap: 8, alignItems: "center", textTransform: "none" }}
      >
        <input type="checkbox" name="isDeposit" />
        Tandai sebagai deposit / titipan (mis. deposit PNR maskapai)
      </label>
    </FormShell>
  );
}

export function PayBillForm({
  bills,
  banks,
}: {
  bills: { id: string; label: string; outstanding: number }[];
  banks: { id: string; name: string }[];
}) {
  return (
    <FormShell
      triggerLabel="BAYAR VENDOR"
      title="Catat Pembayaran Vendor"
      action={payVendorBill}
      submitLabel="Catat Pembayaran"
    >
      <Grid>
        <Field label="Tagihan">
          <select className="keu-select" name="billId" required defaultValue="">
            <option value="" disabled>
              — Pilih tagihan —
            </option>
            {bills.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nominal Bayar (IDR)">
          <input className="keu-input" name="amount" type="number" placeholder="0" required />
        </Field>
        <Field label="Tanggal">
          <input
            className="keu-input"
            name="date"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </Field>
        <Field label="Dari Rekening">
          <select className="keu-select" name="bankAccountId" defaultValue="">
            <option value="">— Tidak ditentukan —</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
      </Grid>
    </FormShell>
  );
}

// ── Proyeksi finance per trip ─────────────────────────────────

export function TripFinanceForm({
  tourId,
  current,
}: {
  tourId: string;
  current: {
    sellingPrice: number;
    targetPax: number;
    projHpp: number;
    status: string;
    note: string | null;
  } | null;
}) {
  return (
    <FormShell
      triggerLabel={current ? "EDIT PROYEKSI" : "SET PROYEKSI FINANCE"}
      title="Proyeksi Keuangan Trip"
      action={upsertTripFinance}
      submitLabel="Simpan Proyeksi"
    >
      <input type="hidden" name="tourId" value={tourId} />
      <Grid>
        <Field label="Harga Jual / Pax (IDR)">
          <input
            className="keu-input"
            name="sellingPrice"
            type="number"
            defaultValue={current?.sellingPrice ?? 0}
          />
        </Field>
        <Field label="Target Pax">
          <input
            className="keu-input"
            name="targetPax"
            type="number"
            defaultValue={current?.targetPax ?? 0}
          />
        </Field>
        <Field label="HPP Proyeksi Total (IDR)">
          <input
            className="keu-input"
            name="projHpp"
            type="number"
            defaultValue={current?.projHpp ?? 0}
          />
        </Field>
        <Field label="Status Proyeksi">
          <select className="keu-select" name="status" defaultValue={current?.status ?? "DRAFT"}>
            <option value="DRAFT">Draft (belum dikunci)</option>
            <option value="CONFIRMED">Confirmed (margin terkunci)</option>
          </select>
        </Field>
      </Grid>
      <Field label="Catatan (opsional)">
        <input className="keu-input" name="note" defaultValue={current?.note ?? ""} />
      </Field>
    </FormShell>
  );
}

// ── Aksi kecil (ikon) ─────────────────────────────────────────

export function DeleteEntryButton({ id }: { id: string }) {
  return (
    <form action={deleteLedgerEntry} style={{ display: "inline" }}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="keu-btn keu-btn-ghost"
        style={{ padding: "4px 8px", fontSize: 10 }}
        title="Hapus entry"
      >
        HAPUS
      </button>
    </form>
  );
}

export function ArchiveBankButton({ id, archived }: { id: string; archived: boolean }) {
  return (
    <form action={toggleBankArchive} style={{ display: "inline" }}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="keu-btn keu-btn-ghost"
        style={{ padding: "4px 8px", fontSize: 10 }}
      >
        {archived ? "AKTIFKAN" : "ARSIPKAN"}
      </button>
    </form>
  );
}
