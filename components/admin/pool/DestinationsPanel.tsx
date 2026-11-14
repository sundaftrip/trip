"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { sendJson } from "@/lib/admin-fetch";
import { cheapestPrice, destMode, destUrl, type PoolDestinationData, type PoolPackageData } from "@/lib/pool/core";
import type { AdminPoolData } from "@/lib/pool/store";
import { linesOf, parseTierLines, rupiah, tierLines } from "./format";

const STATUS: Record<string, { label: string; hint: string; style: string }> = {
  buka: { label: "Buka", hint: "Tampil di website, orang bisa gabung tanggal dan melihat harga.", style: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  segera: { label: "Segera", hint: "Tampil di website sebagai daftar minat: orang mengisi perkiraan tanggal tiba, belum ada harga.", style: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  draf: { label: "Draf", hint: "Belum tampil di daftar. Halamannya bisa dibuka lewat link untuk pratinjau.", style: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  tutup: { label: "Tutup", hint: "Tidak tampil di daftar dan formulir tidak bisa dikirim.", style: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

const input = "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white disabled:opacity-60";
const label = "text-xs font-semibold text-gray-600 dark:text-gray-400";
const hint = "mt-1 block text-[11px] font-normal text-gray-500";

type PackageDraft = { code: string; name: string; days: string; summary: string; single: string; tiers: string };
type Draft = {
  id: string | null; engine: string;
  name: string; code: string; status: string; city: string; title: string; lede: string; cap: string;
  milestones: string; minDays: string; maxPax: string; quota: string; sortOrder: string;
  incl: string; excl: string; notes: string; pay: string; meet: string; route: string; addons: string;
  joinMax: string; kurs: string; kzMeet: string; meetTime: string; nightOn: boolean; nightFrom: string; nightTo: string; nightFee: string;
  packages: PackageDraft[];
};

const packageDraft = (p?: PoolPackageData): PackageDraft => ({
  code: p?.code ?? "", name: p?.name ?? "", days: p?.days ? String(p.days) : "", summary: p?.summary ?? "",
  single: p?.single ? String(p.single) : "", tiers: p ? tierLines(p.tiers) : "",
});

function toDraft(d: PoolDestinationData | null, nextOrder: number): Draft {
  const c = d?.content;
  const s = d?.settings;
  return {
    id: d?.id ?? null, engine: d?.engine ?? "generic",
    name: d?.name ?? "", code: d?.code ?? "", status: d?.status ?? "segera", city: d?.city ?? "", title: d?.title ?? "", lede: d?.lede ?? "", cap: d?.cap ?? "",
    milestones: (d?.milestones ?? [6]).join(", "), minDays: String(d?.minDays ?? 30), maxPax: String(d?.maxPax ?? 10), quota: String(d?.quota ?? 0), sortOrder: String(d?.sortOrder ?? nextOrder),
    incl: (c?.incl ?? []).join("\n"), excl: (c?.excl ?? []).join("\n"), notes: (c?.notes ?? []).join("\n"), pay: (c?.pay ?? []).join("\n"), meet: (c?.meet ?? []).join("\n"),
    route: (c?.route ?? []).map((r) => [r.t, r.d, r.k.join(",")].join(" | ").replace(/( \| )+$/, "")).join("\n"),
    addons: (c?.addons ?? []).map((a) => [a.name, a.price, a.note].join(" | ").replace(/( \| )+$/, "")).join("\n"),
    joinMax: String(s?.joinMax ?? 3), kurs: String(s?.kurs ?? 0), kzMeet: s?.meet ?? "", meetTime: s?.meetTime ?? "",
    nightOn: !!s?.night, nightFrom: s?.night?.from ?? "22:00", nightTo: s?.night?.to ?? "06:00", nightFee: String(s?.night?.fee ?? 0),
    packages: (d?.packages ?? []).map(packageDraft),
  };
}

function toBody(f: Draft) {
  const split = (line: string) => line.split("|").map((x) => x.trim());
  return {
    name: f.name, code: f.code, status: f.status, city: f.city, title: f.title, lede: f.lede, cap: f.cap,
    milestones: f.milestones.split(/[,\s]+/).map(Number).filter((n) => n > 0),
    minDays: Number(f.minDays), maxPax: Number(f.maxPax), quota: Number(f.quota), sortOrder: Number(f.sortOrder),
    content: {
      incl: linesOf(f.incl), excl: linesOf(f.excl), notes: linesOf(f.notes), pay: linesOf(f.pay), meet: linesOf(f.meet),
      route: linesOf(f.route).map((line) => { const [t, d, k] = split(line); return { t, d: d ?? "", k: (k ?? "").split(",").map((x) => x.trim()).filter(Boolean) }; }),
      addons: linesOf(f.addons).map((line) => { const [name, price, note] = split(line); return { name, price: price ?? "", note: note ?? "" }; }),
    },
    settings: {
      joinMax: Number(f.joinMax), kurs: Number(f.kurs), meet: f.kzMeet, meetTime: f.meetTime,
      night: f.nightOn ? { from: f.nightFrom, to: f.nightTo, fee: Number(f.nightFee) } : null,
    },
    packages: f.packages.map((p) => ({ code: p.code, name: p.name, days: Number(p.days), summary: p.summary, single: Number(p.single.replace(/[^\d]/g, "")), tiers: parseTierLines(p.tiers) })),
  };
}

export default function DestinationsPanel({ data, canEdit }: { data: AdminPoolData; canEdit: boolean }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nextOrder = Math.max(0, ...data.destinations.map((d) => d.sortOrder)) + 10;

  async function save() {
    if (!draft) return;
    setBusy(true);
    setError("");
    const err = await sendJson(draft.id ? `/api/pool-admin/destinations/${draft.id}` : "/api/pool-admin/destinations", draft.id ? "PUT" : "POST", toBody(draft));
    setBusy(false);
    if (err) return setError(err);
    setDraft(null);
    router.refresh();
  }
  async function remove(d: PoolDestinationData) {
    if (!confirm(`Hapus negara ${d.name}? Hanya bisa kalau belum ada pendaftar.`)) return;
    setBusy(true);
    const err = await sendJson(`/api/pool-admin/destinations/${d.id}`, "DELETE");
    setBusy(false);
    if (err) return alert(err);
    router.refresh();
  }

  if (draft) return <DestinationForm draft={draft} setDraft={setDraft} busy={busy} error={error} onSave={save} onCancel={() => { setDraft(null); setError(""); }} />;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">Negara berstatus Buka dan Segera tampil di /pool dan di tab &quot;Gabung tanggal&quot; beranda.</p>
        {canEdit && (
          <button type="button" onClick={() => setDraft(toDraft(null, nextOrder))} className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700">
            <Plus size={14} /> Tambah negara
          </button>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {data.destinations.map((d) => {
          const st = STATUS[d.status] ?? STATUS.draf;
          const low = cheapestPrice(d.packages);
          const people = data.signups.filter((s) => s.destinationId === d.id && s.status === "aktif" && s.poolDate >= data.today).reduce((sum, s) => sum + s.pax, 0);
          return (
            <article key={d.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-gray-900 dark:text-white">{d.name}</h2>
                  <a href={destUrl(d)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-teal-700 hover:underline dark:text-teal-400">
                    sundaftrip.com{destUrl(d)} <ExternalLink size={11} />
                  </a>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${st.style}`}>{st.label}</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                <dt>Orang terdaftar (mendatang)</dt><dd className="font-semibold text-gray-900 dark:text-white">{people}</dd>
                <dt>Paket</dt><dd>{d.packages.length ? d.packages.map((p) => (p.days ? `${p.days} hari` : p.name)).join(", ") : "Belum diisi"}</dd>
                <dt>Harga mulai</dt><dd>{low ? rupiah(low) : "Belum diisi"}</dd>
                <dt>Titik jumlah orang</dt><dd>{d.milestones.join(", ")}</dd>
                <dt>Kuota per tanggal</dt><dd>{d.quota > 0 ? d.quota : "Tanpa batas"}</dd>
              </dl>
              {d.status === "buka" && destMode(d) === "minat" && (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">Belum ada paket berharga, jadi halaman ini masih berupa daftar minat.</p>
              )}
              {canEdit && (
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => setDraft(toDraft(d, nextOrder))} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                    <Pencil size={13} /> Edit negara, paket &amp; harga
                  </button>
                  {d.engine !== "kazakhstan" && (
                    <button type="button" disabled={busy} onClick={() => remove(d)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-500 hover:text-red-600" aria-label={`Hapus ${d.name}`}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Area({ title, note, value, onChange, rows = 4 }: { title: string; note?: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className={label}>
      {title}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={`${input} font-mono text-xs leading-relaxed`} />
      {note && <span className={hint}>{note}</span>}
    </label>
  );
}

function DestinationForm({ draft, setDraft, busy, error, onSave, onCancel }: {
  draft: Draft; setDraft: (d: Draft) => void; busy: boolean; error: string; onSave: () => void; onCancel: () => void;
}) {
  const kz = draft.engine === "kazakhstan";
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft({ ...draft, [key]: value });
  const setPkg = (i: number, patch: Partial<PackageDraft>) => set("packages", draft.packages.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const text = (key: keyof Draft, title: string, opts: { note?: string; disabled?: boolean; placeholder?: string; mode?: "numeric" } = {}) => (
    <label className={label}>
      {title}
      <input
        value={String(draft[key])} disabled={opts.disabled} placeholder={opts.placeholder} inputMode={opts.mode}
        onChange={(e) => set(key, e.target.value as never)} className={input}
      />
      {opts.note && <span className={hint}>{opts.note}</span>}
    </label>
  );
  const section = "rounded-xl border border-gray-200 p-4 dark:border-gray-800";
  const heading = "mb-3 text-sm font-black text-gray-900 dark:text-white";

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-gray-900 dark:text-white">{draft.id ? `Edit ${draft.name}` : "Negara baru"}</h2>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">Kembali ke daftar</button>
      </div>

      <section className={section}>
        <h3 className={heading}>Negara</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {text("name", "Nama negara")}
          {text("code", "Kode halaman", { disabled: kz, note: kz ? "Halaman: /kazakhstan" : `Halaman: /pool/${draft.code || "kode"}`, placeholder: "mis. kirgistan" })}
          <label className={label}>
            Status
            <select value={draft.status} onChange={(e) => set("status", e.target.value)} className={input}>
              {Object.entries(STATUS).map(([value, s]) => <option key={value} value={value}>{s.label}</option>)}
            </select>
            <span className={hint}>{STATUS[draft.status]?.hint}</span>
          </label>
          {text("city", "Kota tiba", { placeholder: "mis. Bishkek" })}
          {!kz && <div className="sm:col-span-2">{text("title", "Judul halaman", { placeholder: `Pool land tour ${draft.name || "Kirgistan"}`, note: "Kosong = judul bawaan." })}</div>}
          {!kz && <div className="sm:col-span-2">{text("lede", "Kalimat pembuka (opsional)")}</div>}
          <div className="sm:col-span-2 lg:col-span-4">{text("cap", "Keterangan harga", { placeholder: "Harga per orang, hotel bintang 3. Belum termasuk tiket pesawat." })}</div>
        </div>
      </section>

      <section className={section}>
        <h3 className={heading}>Aturan pool</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {text("milestones", "Titik jumlah orang", { note: "Pisahkan dengan koma. Angka pertama = grup WA dibuka.", placeholder: "6, 20, 30" })}
          {text("minDays", "Tanggal paling cepat", { note: "Hari dari sekarang.", mode: "numeric" })}
          {text("maxPax", "Maks. orang per pendaftaran", { mode: "numeric" })}
          {text("quota", "Kuota per tanggal", { note: "0 = tanpa batas.", mode: "numeric" })}
          {text("sortOrder", "Urutan tampil", { note: "Kecil = lebih dulu.", mode: "numeric" })}
        </div>
      </section>

      <section className={section}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-black text-gray-900 dark:text-white">Paket &amp; harga per orang</h3>
          {!kz && (
            <button type="button" onClick={() => set("packages", [...draft.packages, packageDraft()])} className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400">
              <Plus size={13} /> Tambah paket
            </button>
          )}
        </div>
        {draft.packages.length === 0 && <p className="text-sm text-gray-500">Belum ada paket. Selama kosong, halaman negara ini berupa daftar minat.</p>}
        <div className="grid gap-3 lg:grid-cols-3">
          {draft.packages.map((p, i) => (
            <div key={i} className="space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
              <div className="grid grid-cols-3 gap-2">
                <label className={label}>Kode<input value={p.code} disabled={kz} onChange={(e) => setPkg(i, { code: e.target.value })} placeholder="5" className={input} /></label>
                <label className={label}>Hari<input value={p.days} disabled={kz} inputMode="numeric" onChange={(e) => setPkg(i, { days: e.target.value })} className={input} /></label>
                <label className={label}>Kamar sendiri<input value={p.single} inputMode="numeric" onChange={(e) => setPkg(i, { single: e.target.value })} placeholder="0" className={input} /></label>
              </div>
              <label className={label}>Nama paket<input value={p.name} onChange={(e) => setPkg(i, { name: e.target.value })} placeholder="5 hari 4 malam" className={input} /></label>
              {!kz && <label className={label}>Ringkasan rute<input value={p.summary} onChange={(e) => setPkg(i, { summary: e.target.value })} className={input} /></label>}
              <label className={label}>
                Harga per jumlah orang
                <textarea value={p.tiers} onChange={(e) => setPkg(i, { tiers: e.target.value })} rows={7} placeholder={"2 = 15000000\n4 = 12000000\n6 = 10000000"} className={`${input} font-mono text-xs`} />
                <span className={hint}>Satu baris: jumlah orang = harga per orang (rupiah).</span>
              </label>
              {!kz && (
                <button type="button" onClick={() => set("packages", draft.packages.filter((_, j) => j !== i))} className="text-xs font-semibold text-red-600 hover:underline">Hapus paket ini</button>
              )}
            </div>
          ))}
        </div>
      </section>

      {kz ? (
        <section className={section}>
          <h3 className={heading}>Pengaturan halaman Kazakhstan</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">{text("kzMeet", "Titik kumpul")}</div>
            {text("meetTime", "Jam kumpul", { placeholder: "08:30", note: "Kosong = tidak ditampilkan." })}
            {text("joinMax", "Boleh nyusul rombongan", { note: "Maks. hari setelah rombongan tiba. 0 = mati.", mode: "numeric" })}
            {text("kurs", "Kurs yang dipakai", { note: "Rupiah per 1 USD saat harga dihitung.", mode: "numeric" })}
            <label className={`${label} flex items-center gap-2 self-end pb-2`}>
              <input type="checkbox" checked={draft.nightOn} onChange={(e) => set("nightOn", e.target.checked)} /> Ada transfer malam
            </label>
            {draft.nightOn && text("nightFrom", "Transfer malam dari", { placeholder: "22:00" })}
            {draft.nightOn && text("nightTo", "Sampai", { placeholder: "06:00" })}
            {draft.nightOn && text("nightFee", "Biaya transfer malam", { note: "0 = dikonfirmasi admin.", mode: "numeric" })}
          </div>
          <p className="mt-3 text-xs text-gray-500">Itinerary dan teks lain halaman /kazakhstan ada di file halamannya, bukan di sini.</p>
        </section>
      ) : (
        <section className={section}>
          <h3 className={heading}>Isi halaman</h3>
          <div className="grid gap-3 lg:grid-cols-2">
            <Area title="Sudah termasuk" note="Satu baris satu butir." value={draft.incl} onChange={(v) => set("incl", v)} />
            <Area title="Belum termasuk" value={draft.excl} onChange={(v) => set("excl", v)} />
            <Area title="Catatan" value={draft.notes} onChange={(v) => set("notes", v)} />
            <Area title="Pembayaran & pembatalan" value={draft.pay} onChange={(v) => set("pay", v)} />
            <Area title="Titik temu & penjemputan" value={draft.meet} onChange={(v) => set("meet", v)} />
            <Area title="Aktivitas tambahan" note="Satu baris: Nama | Harga | Catatan" value={draft.addons} onChange={(v) => set("addons", v)} />
            <div className="lg:col-span-2">
              <Area title="Itinerary" rows={8} note="Satu baris satu hari: Judul | Deskripsi | kode paket. Kode paket kosong = semua paket; isi mis. 7 kalau hari itu hanya ada di paket 7." value={draft.route} onChange={(v) => set("route", v)} />
            </div>
          </div>
        </section>
      )}

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
      <div className="sticky bottom-0 flex gap-2 border-t border-gray-200 bg-white/95 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
        <button type="submit" disabled={busy} className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">{busy ? "Menyimpan…" : "Simpan"}</button>
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">Batal</button>
      </div>
    </form>
  );
}
