/* Impor pendaftar lama dari tab "Pendaftar" Google Sheet "SUNDAF · Pool Kazakhstan".
   Admin menyalin seluruh tab (termasuk baris judul) lalu menempelkannya di CMS.
   Logika murni: teks → baris siap simpan + alasan untuk baris yang dilewati. */

import { isDateKey, keyOf, normWa, type KgPlan } from "./core";

export type ImportedSignup = {
  kode: string; name: string; whatsapp: string; pax: number;
  arrivalDate: string; poolDate: string; pkg: string; interest: boolean; flex: boolean;
  status: "aktif" | "batal"; arrivalTime: string; via: string; flight: string;
  hotel: string; hotelName: string; kgPlan: KgPlan | null; note: string; adminNote: string;
  createdAt: number | null;
};
export type ImportResult = { rows: ImportedSignup[]; skipped: { line: number; reason: string }[] };

const MONTHS: Record<string, number> = {
  jan: 1, januari: 1, feb: 2, februari: 2, mar: 3, maret: 3, apr: 4, april: 4, mei: 5, may: 5,
  jun: 6, juni: 6, jul: 7, juli: 7, agu: 8, agt: 8, agustus: 8, aug: 8, sep: 9, sept: 9, september: 9,
  okt: 10, oktober: 10, oct: 10, nov: 11, november: 11, des: 12, desember: 12, dec: 12,
};

/** "Rab, 24 Mar 2027", "24 Maret 2027", "2027-03-24", atau "24/03/2027" → "2027-03-24". */
export function parseSheetDate(value: string): string {
  const s = value.trim();
  if (!s) return "";
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return dateKey(+iso[1], +iso[2], +iso[3]);
  const slash = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})/);
  if (slash) return dateKey(+slash[3], +slash[2], +slash[1]);
  const words = s.match(/(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})/);
  if (words) {
    const month = MONTHS[words[2].toLowerCase()];
    if (month) return dateKey(+words[3], month, +words[1]);
  }
  return "";
}
function dateKey(y: number, m: number, d: number): string {
  const key = keyOf(Date.UTC(y, m - 1, d));
  const p = key.split("-");
  return +p[0] === y && +p[1] === m && +p[2] === d && isDateKey(key) ? key : "";
}

/** "14 Okt 2026, 22:09" (WIB) → waktu UTC dalam milidetik. */
export function parseSheetTimestamp(value: string): number | null {
  const date = parseSheetDate(value);
  if (!date) return null;
  const time = value.match(/(\d{1,2})[:.](\d{2})(?:[:.]\d{2})?\s*$/);
  const p = date.split("-");
  const h = time ? Math.min(23, +time[1]) : 12;
  const min = time ? Math.min(59, +time[2]) : 0;
  return Date.UTC(+p[0], +p[1] - 1, +p[2], h - 7, min);
}

/** Pisahkan teks tempelan jadi sel. Tab (salin dari Sheets) atau koma/titik koma (CSV), dengan tanda kutip. */
export function parseTable(text: string): string[][] {
  const src = text.replace(/\r\n?/g, "\n");
  const firstLine = src.split("\n", 1)[0] ?? "";
  const sep = firstLine.includes("\t") ? "\t" : firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === "") quoted = true;
    else if (ch === sep) { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  row.push(cell);
  rows.push(row);
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const HEADERS: Record<string, string> = {
  "waktu daftar": "createdAt", kode: "kode", nama: "name", whatsapp: "wa", "jumlah orang": "pax",
  "tanggal tiba": "date", paket: "pkg", "tanggal fleksibel": "flex", status: "status",
  "jam tiba": "time", "datang via": "via", "no. penerbangan": "flight", "no penerbangan": "flight",
  hotel: "hotel", "nyusul rombongan": "join", "rencana kirgistan": "kg", catatan: "note",
};

function parsePkg(value: string): { pkg: string; interest: boolean } | null {
  const s = value.trim().toLowerCase();
  if (!s) return null;
  if (s.includes("segera") || s.includes("minat")) return { pkg: "minat", interest: true };
  if (s.includes("kirgistan") || s.includes("kg")) return { pkg: "KG", interest: false };
  const days = [...new Set((s.match(/\d+/g) ?? []).filter((d) => ["5", "6", "8"].includes(d)))].sort();
  return days.length && days.length <= 2 ? { pkg: days.join(","), interest: false } : null;
}
function parseKgPlan(value: string): KgPlan | null {
  const m = value.match(/Kazakhstan\s+(\d)\s+hari.*?(darat|pesawat).*?Kirgistan\s+(\d)\s+hari/i);
  return m ? { kz: +m[1], x: m[2].toLowerCase() === "pesawat" ? "pesawat" : "darat", kgd: +m[3] } : null;
}
function parseVia(value: string): string {
  const s = value.toLowerCase();
  if (!s.trim()) return "";
  if (s.includes("pesawat")) return "pesawat";
  if (s.includes("darat") || s.includes("bishkek")) return "darat";
  return "lokal";
}

export function parseKzSheet(text: string): ImportResult {
  const table = parseTable(text);
  const result: ImportResult = { rows: [], skipped: [] };
  if (!table.length) return result;
  const cols = table[0].map((h) => HEADERS[h.trim().toLowerCase()] ?? "");
  const missing = ["kode", "name", "wa", "pax", "date", "pkg"].filter((k) => !cols.includes(k));
  if (missing.length) {
    result.skipped.push({ line: 1, reason: "Baris judul tidak dikenali. Salin seluruh tab Pendaftar termasuk baris pertama (Waktu daftar, Kode, Nama, WhatsApp, ...)." });
    return result;
  }
  const seen = new Set<string>();
  table.slice(1).forEach((cells, index) => {
    const line = index + 2;
    const get = (key: string) => (cells[cols.indexOf(key)] ?? "").trim();
    const skip = (reason: string) => { result.skipped.push({ line, reason }); };

    const kode = get("kode").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 16);
    if (!kode) return skip("Kode kosong.");
    if (seen.has(kode)) return skip(`Kode ${kode} muncul dua kali.`);
    const name = get("name").replace(/\s+/g, " ").slice(0, 80);
    if (name.length < 2) return skip(`${kode}: nama kosong.`);
    const whatsapp = normWa(get("wa"));
    if (!whatsapp) return skip(`${kode}: nomor WhatsApp tidak terbaca.`);
    const pax = Math.trunc(Number(get("pax")));
    if (!(pax >= 1 && pax <= 60)) return skip(`${kode}: jumlah orang tidak terbaca.`);
    const arrivalDate = parseSheetDate(get("date"));
    if (!arrivalDate) return skip(`${kode}: tanggal tiba tidak terbaca.`);
    const pkg = parsePkg(get("pkg"));
    if (!pkg) return skip(`${kode}: paket tidak terbaca.`);

    const statusText = get("status");
    const hotelText = get("hotel");
    const ownHotel = /^sendiri/i.test(hotelText);
    const time = get("time").replace(".", ":");
    seen.add(kode);
    result.rows.push({
      kode, name, whatsapp, pax, arrivalDate,
      poolDate: parseSheetDate(get("join")) || arrivalDate,
      pkg: pkg.pkg, interest: pkg.interest,
      flex: /^ya/i.test(get("flex")),
      status: /batal/i.test(statusText) ? "batal" : "aktif",
      arrivalTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : "",
      via: parseVia(get("via")),
      flight: get("flight").toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 12),
      hotel: hotelText ? (ownHotel ? "sendiri" : "paket") : "",
      hotelName: ownHotel ? hotelText.replace(/^sendiri\s*[:(-]?\s*/i, "").replace(/\)$/, "").slice(0, 120) : "",
      kgPlan: pkg.pkg === "KG" ? parseKgPlan(get("kg")) : null,
      note: get("note").slice(0, 600),
      adminNote: statusText && !/^(baru|batal)$/i.test(statusText) ? `Status di Sheet: ${statusText}`.slice(0, 200) : "",
      createdAt: parseSheetTimestamp(get("createdAt")),
    });
  });
  return result;
}
