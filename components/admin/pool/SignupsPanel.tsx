"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Check, Copy, Download, MessageCircle, Plus, Search, Settings2, Trash2, Undo2, X } from "lucide-react";
import { sendJson } from "@/lib/admin-fetch";
import { destMode, pkgLabel, priceAt, quotaFor, POOL_NO_QUOTA, type PoolDestinationData } from "@/lib/pool/core";
import type { AdminPoolData, AdminPoolDate, AdminSignup } from "@/lib/pool/store";
import { dateLabel, rupiah, shortDate, stamp, waUrl } from "./format";

type Group = {
  key: string; dest: PoolDestinationData; date: string; interest: boolean;
  rows: AdminSignup[]; n: number; active: number; info: AdminPoolDate | undefined;
};

const VIA: Record<string, string> = { pesawat: "Pesawat", darat: "Darat", lokal: "Sudah di kota" };
const input = "rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white";
const ghost = "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-40";

function milestoneText(dest: PoolDestinationData, n: number, hasGroup: boolean): { text: string; tone: "todo" | "ok" | "idle" } {
  const ms = dest.milestones;
  if (n >= ms[0] && !hasGroup) return { text: `Sudah ${n} orang: buat grup WA, lalu tempel link-nya`, tone: "todo" };
  const next = ms.find((m) => n < m);
  if (next === undefined) return { text: "Harga termurah tercapai", tone: "ok" };
  if (next === ms[0]) return { text: `${next - n} orang lagi, grup WA dibuka`, tone: "idle" };
  return { text: `Grup WA aktif · ${next - n} lagi ke titik ${next} orang`, tone: "ok" };
}

function arrivalText(s: AdminSignup): string {
  const parts: string[] = [];
  if (s.arrivalDate !== s.poolDate) parts.push(`Nyusul, tiba ${shortDate(s.arrivalDate)}`);
  if (s.arrivalTime) parts.push(`jam ${s.arrivalTime.replace(":", ".")}`);
  if (s.via) parts.push(VIA[s.via] ?? s.via);
  if (s.flight) parts.push(s.flight);
  if (s.hotel === "sendiri") parts.push(`hotel sendiri${s.hotelName ? ` (${s.hotelName})` : ""}`);
  else if (s.hotel === "paket") parts.push("hotel paket");
  return parts.join(" · ");
}

export default function SignupsPanel({ data, canEdit }: { data: AdminPoolData; canEdit: boolean }) {
  const router = useRouter();
  const [destId, setDestId] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [settingsFor, setSettingsFor] = useState("");
  const [movingId, setMovingId] = useState("");
  const [copied, setCopied] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    const map = new Map<string, Group>();
    for (const s of data.signups) {
      const dest = data.destinations.find((d) => d.id === s.destinationId);
      if (!dest || (destId && dest.id !== destId)) continue;
      if (q && !(s.name.toLowerCase().includes(q) || s.kode.toLowerCase().includes(q) || (digits.length >= 4 && s.whatsapp.includes(digits)))) continue;
      const key = `${dest.id}|${s.interest ? "m" : "p"}|${s.poolDate}`;
      let g = map.get(key);
      if (!g) {
        g = { key, dest, date: s.poolDate, interest: s.interest, rows: [], n: 0, active: 0, info: data.dates.find((d) => d.destinationId === dest.id && d.date === s.poolDate) };
        map.set(key, g);
      }
      g.rows.push(s);
      if (s.status === "aktif") { g.n += s.pax; g.active += 1; }
    }
    return [...map.values()]
      .filter((g) => showAll || q || (g.active > 0 && g.date >= data.today))
      .sort((a, b) => a.dest.sortOrder - b.dest.sortOrder || a.dest.name.localeCompare(b.dest.name) || (a.date < b.date ? -1 : a.date > b.date ? 1 : Number(a.interest) - Number(b.interest)));
  }, [data, destId, query, showAll]);

  const totals = useMemo(() => {
    const t = new Map<string, number>();
    for (const s of data.signups) if (s.status === "aktif" && !s.interest && s.poolDate >= data.today) t.set(s.destinationId, (t.get(s.destinationId) ?? 0) + s.pax);
    return t;
  }, [data]);

  async function mutate(url: string, method: "POST" | "PUT" | "PATCH" | "DELETE", body?: unknown): Promise<boolean> {
    setBusy(true);
    const error = await sendJson(url, method, body);
    setBusy(false);
    if (error) { alert(error); return false; }
    router.refresh();
    return true;
  }

  async function copyNumbers(g: Group) {
    const text = g.rows.filter((s) => s.status === "aktif").map((s) => `${s.name} (${s.pax} orang) +${s.whatsapp}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(g.key);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      prompt("Salin daftar ini:", text);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {[{ id: "", name: "Semua negara" }, ...data.destinations].map((d) => (
            <button
              key={d.id || "all"} type="button" onClick={() => setDestId(d.id)} aria-pressed={destId === d.id}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${destId === d.id ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"}`}
            >
              {d.name}{d.id && totals.get(d.id) ? ` · ${totals.get(d.id)}` : ""}
            </button>
          ))}
        </div>
        <label className="relative ml-auto">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, nomor, kode" aria-label="Cari pendaftar" className={`${input} w-52 pl-8`} />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> Tampilkan yang lewat &amp; batal
        </label>
        <a href={`/api/pool-admin/export${destId ? `?dest=${destId}` : ""}`} className={ghost} title="Unduh semua pendaftar sebagai CSV">
          <Download size={13} /> CSV
        </a>
        {canEdit && (
          <button type="button" onClick={() => setAdding((v) => !v)} className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700">
            <Plus size={14} /> Tambah pendaftar
          </button>
        )}
      </div>

      {adding && canEdit && (
        <AddSignupForm
          data={data} defaultDestId={destId || data.destinations[0]?.id || ""} busy={busy}
          onCancel={() => setAdding(false)}
          onSave={async (body) => { if (await mutate("/api/pool-admin/signups", "POST", body)) setAdding(false); }}
        />
      )}

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-400 dark:border-gray-700">
          {data.signups.length === 0 ? "Belum ada pendaftar pool." : "Tidak ada pendaftar yang cocok dengan saringan ini."}
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => {
            const pool = !g.interest && destMode(g.dest) === "pool";
            const quota = quotaFor(g.dest, g.info ? { date: g.info.date, quota: g.info.quota, groupLink: g.info.groupLink } : undefined);
            const ms = milestoneText(g.dest, g.n, !!g.info?.groupLink);
            const main = g.dest.packages.find((p) => p.tiers.length);
            const past = g.date < data.today;
            return (
              <section key={g.key} className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                <header className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-gray-50 px-4 py-3 dark:bg-gray-900">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{g.dest.name}{g.interest ? " · daftar minat" : ""}{past ? " · sudah lewat" : ""}</p>
                    <h2 className="text-base font-black text-gray-900 dark:text-white">{dateLabel(g.date)}</h2>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <b className="text-lg text-gray-900 dark:text-white">{g.n}</b> orang · {g.active} pendaftar
                    {pool && quota < POOL_NO_QUOTA && <span className="text-gray-500"> · kuota {quota}</span>}
                    {pool && main && g.n > 0 && <span className="text-gray-500"> · {rupiah(priceAt(main.tiers, g.n))}/orang ({main.days ? `${main.days} hari` : main.name})</span>}
                  </div>
                  {pool && !past && g.n > 0 && (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ms.tone === "todo" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" : ms.tone === "ok" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                      {ms.text}
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1">
                    {g.info?.groupLink && (
                      <a href={g.info.groupLink} target="_blank" rel="noreferrer" className={ghost}><MessageCircle size={13} /> Grup WA</a>
                    )}
                    <button type="button" onClick={() => copyNumbers(g)} className={ghost}>
                      {copied === g.key ? <><Check size={13} /> Tersalin</> : <><Copy size={13} /> Salin nomor</>}
                    </button>
                    {canEdit && !g.interest && (
                      <button type="button" onClick={() => setSettingsFor(settingsFor === g.key ? "" : g.key)} className={ghost} aria-expanded={settingsFor === g.key}>
                        <Settings2 size={13} /> Atur tanggal
                      </button>
                    )}
                  </div>
                </header>

                {settingsFor === g.key && canEdit && (
                  <DateSettings
                    group={g} busy={busy}
                    onSave={async (body) => { if (await mutate("/api/pool-admin/dates", "PUT", body)) setSettingsFor(""); }}
                  />
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="px-4 py-2 font-semibold">Nama &amp; WhatsApp</th>
                        <th className="px-4 py-2 font-semibold">Orang</th>
                        <th className="px-4 py-2 font-semibold">Paket &amp; kedatangan</th>
                        <th className="px-4 py-2 font-semibold">Catatan</th>
                        <th className="px-4 py-2 font-semibold">Daftar</th>
                        <th className="px-4 py-2 text-right font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {g.rows.map((s) => {
                        const cancelled = s.status !== "aktif";
                        const hello = `Halo ${s.name}, ini admin SUNDAF Trip. Soal ${g.interest ? "minat trip" : "pool land tour"} ${g.dest.name} tanggal ${dateLabel(s.poolDate)} (kode ${s.kode}).`;
                        return (
                          <tr key={s.id} className={`align-top text-gray-700 dark:text-gray-300 ${cancelled ? "opacity-50" : ""}`}>
                            <td className="px-4 py-3">
                              <div className="font-bold text-gray-900 dark:text-white">{s.name}{cancelled && <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-400">Batal</span>}</div>
                              <a href={waUrl(s.whatsapp, hello)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline">
                                <MessageCircle size={12} /> +{s.whatsapp}
                              </a>
                            </td>
                            <td className="px-4 py-3 font-semibold">{s.pax}</td>
                            <td className="px-4 py-3">
                              <div>{pkgLabel(g.dest, s.pkg, s.kgPlan)}{s.flex && <span className="ml-1.5 text-xs text-gray-500">(tanggal fleksibel)</span>}</div>
                              {arrivalText(s) && <div className="text-xs text-gray-500">{arrivalText(s)}</div>}
                            </td>
                            <td className="max-w-xs px-4 py-3 text-xs">
                              {s.note && <p className="whitespace-pre-wrap break-words">{s.note}</p>}
                              {s.adminNote && <p className="mt-1 whitespace-pre-wrap break-words text-amber-700 dark:text-amber-400">Admin: {s.adminNote}</p>}
                              {canEdit && (
                                <button
                                  type="button" disabled={busy} className="mt-1 text-[11px] text-teal-700 hover:underline dark:text-teal-400"
                                  onClick={() => {
                                    const next = prompt(`Catatan admin untuk ${s.name} (hanya terlihat di CMS):`, s.adminNote);
                                    if (next !== null && next !== s.adminNote) mutate(`/api/pool-admin/signups/${s.id}`, "PATCH", { adminNote: next });
                                  }}
                                >
                                  {s.adminNote ? "Ubah catatan admin" : "+ Catatan admin"}
                                </button>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                              <div className="font-mono text-gray-700 dark:text-gray-300">{s.kode}</div>
                              <div>{stamp(s.createdAt)}</div>
                              {s.source !== "web" && <div>{s.source === "impor" ? "dari Sheet" : "oleh admin"}</div>}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {canEdit && (movingId === s.id ? (
                                <form
                                  className="inline-flex items-center gap-1"
                                  onSubmit={async (e) => {
                                    e.preventDefault();
                                    const date = new FormData(e.currentTarget).get("date");
                                    if (typeof date === "string" && date && date !== s.poolDate && await mutate(`/api/pool-admin/signups/${s.id}`, "PATCH", { poolDate: date })) setMovingId("");
                                  }}
                                >
                                  <input type="date" name="date" defaultValue={s.poolDate} aria-label={`Tanggal baru untuk ${s.name}`} className={`${input} w-36 py-1 text-xs`} />
                                  <button type="submit" disabled={busy} className={ghost} aria-label="Simpan tanggal"><Check size={14} /></button>
                                  <button type="button" onClick={() => setMovingId("")} className={ghost} aria-label="Batal pindah"><X size={14} /></button>
                                </form>
                              ) : (
                                <div className="inline-flex items-center gap-0.5">
                                  <button type="button" disabled={busy} onClick={() => setMovingId(s.id)} className={ghost} title="Pindah ke tanggal lain" aria-label={`Pindah tanggal ${s.name}`}><CalendarClock size={14} /></button>
                                  <button
                                    type="button" disabled={busy} className={ghost}
                                    title={cancelled ? "Aktifkan lagi" : "Tandai batal (tidak dihitung di pool)"} aria-label={`${cancelled ? "Aktifkan" : "Batalkan"} ${s.name}`}
                                    onClick={() => { if (cancelled || confirm(`Tandai ${s.name} batal? Ia tidak lagi dihitung di tanggal ini.`)) mutate(`/api/pool-admin/signups/${s.id}`, "PATCH", { status: cancelled ? "aktif" : "batal" }); }}
                                  >
                                    {cancelled ? <Undo2 size={14} /> : <X size={14} />}
                                  </button>
                                  <button
                                    type="button" disabled={busy} className={`${ghost} hover:text-red-600`} title="Hapus permanen" aria-label={`Hapus ${s.name}`}
                                    onClick={() => { if (confirm(`Hapus permanen pendaftaran ${s.name}? Untuk pembatalan biasa, pakai tombol batal.`)) mutate(`/api/pool-admin/signups/${s.id}`, "DELETE"); }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DateSettings({ group, busy, onSave }: { group: Group; busy: boolean; onSave: (body: Record<string, unknown>) => void }) {
  const [link, setLink] = useState(group.info?.groupLink ?? "");
  const [quota, setQuota] = useState(group.info?.quota === null || group.info?.quota === undefined ? "" : String(group.info.quota));
  return (
    <form
      className="flex flex-wrap items-end gap-3 border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950"
      onSubmit={(e) => { e.preventDefault(); onSave({ destinationId: group.dest.id, date: group.date, groupLink: link, quota: quota.trim() === "" ? null : Number(quota), note: group.info?.note ?? "" }); }}
    >
      <label className="grow text-xs font-semibold text-gray-600 dark:text-gray-400">
        Link grup WhatsApp tanggal ini
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://chat.whatsapp.com/…" className={`${input} mt-1 block w-full`} />
        <span className="mt-1 block font-normal text-gray-500">Setelah diisi, orang yang baru mendaftar di tanggal ini langsung mendapat tombol &quot;Gabung grup&quot;.</span>
      </label>
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
        Kuota tanggal ini
        <input value={quota} onChange={(e) => setQuota(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" placeholder={group.dest.quota > 0 ? `bawaan ${group.dest.quota}` : "tanpa batas"} className={`${input} mt-1 block w-32`} />
        <span className="mt-1 block font-normal text-gray-500">Kosong = bawaan, 0 = tutup.</span>
      </label>
      <button type="submit" disabled={busy} className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">Simpan</button>
    </form>
  );
}

function AddSignupForm({ data, defaultDestId, busy, onCancel, onSave }: {
  data: AdminPoolData; defaultDestId: string; busy: boolean; onCancel: () => void; onSave: (body: Record<string, unknown>) => void;
}) {
  const [destId, setDestId] = useState(defaultDestId);
  const dest = data.destinations.find((d) => d.id === destId);
  const options = dest
    ? [
        ...(destMode(dest) === "pool" ? dest.packages.map((p) => ({ value: p.code, label: p.days ? `${p.days} hari` : p.name })) : []),
        ...(dest.engine === "kazakhstan" && destMode(dest) === "pool" ? [{ value: "KG", label: "Kazakhstan + Kirgistan" }] : []),
        { value: "minat", label: "Daftar minat (belum dihitung di pool)" },
      ]
    : [];
  const label = "text-xs font-semibold text-gray-600 dark:text-gray-400";
  return (
    <form
      className="mb-4 grid gap-3 rounded-xl border border-teal-200 bg-teal-50/50 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-teal-900/50 dark:bg-teal-950/20"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const pkg = String(f.get("pkg") ?? "");
        onSave({ destinationId: destId, date: f.get("date"), pax: Number(f.get("pax")), name: f.get("name"), whatsapp: f.get("whatsapp"), pkg, interest: pkg === "minat", adminNote: f.get("adminNote") });
      }}
    >
      <label className={label}>Negara
        <select value={destId} onChange={(e) => setDestId(e.target.value)} className={`${input} mt-1 block w-full`}>
          {data.destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </label>
      <label className={label}>Tanggal tiba
        <input type="date" name="date" required min={data.today} className={`${input} mt-1 block w-full`} />
      </label>
      <label className={label}>Paket
        <select name="pkg" key={destId} defaultValue={options[0]?.value} className={`${input} mt-1 block w-full`}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <label className={label}>Jumlah orang
        <input type="number" name="pax" min={1} max={60} defaultValue={1} required className={`${input} mt-1 block w-full`} />
      </label>
      <label className={label}>Nama
        <input name="name" required minLength={2} maxLength={80} className={`${input} mt-1 block w-full`} />
      </label>
      <label className={label}>WhatsApp
        <input name="whatsapp" required inputMode="tel" placeholder="0812 3456 7890" className={`${input} mt-1 block w-full`} />
      </label>
      <label className={`${label} sm:col-span-2`}>Catatan admin (opsional)
        <input name="adminNote" maxLength={600} className={`${input} mt-1 block w-full`} />
      </label>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
        <button type="submit" disabled={busy} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">{busy ? "Menyimpan…" : "Simpan pendaftar"}</button>
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">Batal</button>
      </div>
    </form>
  );
}
