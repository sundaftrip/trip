/* Format tanggal dan harga untuk halaman CMS pool. Aman untuk client. */

const MON = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function dateLabel(key: string): string {
  const p = key.split("-");
  if (p.length !== 3) return key;
  const dow = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay();
  return `${DAYS[dow]}, ${+p[2]} ${MON[+p[1] - 1]} ${p[0]}`;
}
export function shortDate(key: string): string {
  const p = key.split("-");
  return p.length === 3 ? `${+p[2]} ${MON[+p[1] - 1]}` : key;
}
export function rupiah(n: number): string {
  return "Rp" + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
export function stamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
}
export function waUrl(number: string, text: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

/** "2 = 15000000" per baris → [{ n, p }]. Titik dan "Rp" di harga diabaikan. */
export function parseTierLines(text: string): { n: number; p: number }[] {
  const out: { n: number; p: number }[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*(\d+)\s*(?:orang)?\s*[=:]\s*(?:rp)?\s*([\d.,\s]+)/i);
    if (!m) continue;
    const p = Number(m[2].replace(/[^\d]/g, ""));
    if (+m[1] >= 1 && p > 0) out.push({ n: +m[1], p });
  }
  return out;
}
export function tierLines(tiers: readonly { n: number; p: number }[]): string {
  return tiers.map((t) => `${t.n} = ${t.p}`).join("\n");
}
export const linesOf = (text: string) => text.split("\n").map((s) => s.trim()).filter(Boolean);
