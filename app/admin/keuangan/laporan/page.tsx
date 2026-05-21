import Link from "next/link";
import { getLaporan } from "@/lib/keuangan/data";
import { rupiah, fmtMonthKey } from "@/lib/keuangan/format";
import { PageHead, Section, Panel, Stat, Spark, Empty, autoTone } from "@/components/keuangan/ui";

export const dynamic = "force-dynamic";

const MON = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];

function shortMonth(key: string): string {
  const [, m] = key.split("-").map(Number);
  return MON[m - 1] ?? key;
}

export default async function LaporanPage() {
  const d = await getLaporan();
  const cur = d.current;

  return (
    <>
      <PageHead
        crumb={
          <>
            <Link href="/admin/keuangan">TERMINAL</Link> / 04 — LAPORAN P&L
          </>
        }
        title="Laporan Profit & Loss"
        lede="Pendapatan, beban, dan arus kas bersih per bulan. Disusun dari payment peserta dan jurnal kas."
      />

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <Stat
          k={`Pendapatan · ${fmtMonthKey(cur.key)}`}
          v={rupiah(cur.income)}
          tone="up"
          accent="var(--keu-green)"
        />
        <Stat
          k={`Beban · ${fmtMonthKey(cur.key)}`}
          v={rupiah(cur.expense)}
          tone="down"
          accent="var(--keu-red)"
        />
        <Stat
          k="Arus Kas Bersih Bulan Ini"
          v={rupiah(cur.net)}
          tone={autoTone(cur.net)}
          accent="var(--keu-orange)"
        />
        <Stat
          k="Net Kumulatif (Lifetime)"
          v={rupiah(d.lifetime.net)}
          tone={autoTone(d.lifetime.net)}
          accent="var(--keu-cyan)"
        />
      </div>

      <Section title="Tren 6 Bulan" note="Arus kas bersih per bulan" />
      <Panel pad ticked>
        {d.last6.length === 0 ? (
          <Empty>BELUM ADA DATA TRANSAKSI</Empty>
        ) : (
          <>
            <Spark
              data={d.last6.map((m) => m.net)}
              labels={d.last6.map((m) => shortMonth(m.key))}
            />
            <div style={{ overflowX: "auto", marginTop: 16 }}>
              <table className="keu-table">
                <thead>
                  <tr>
                    <th>Bulan</th>
                    <th className="keu-r">Pendapatan</th>
                    <th className="keu-r">Beban</th>
                    <th className="keu-r">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {d.last6.map((m) => (
                    <tr key={m.key}>
                      <td>{fmtMonthKey(m.key)}</td>
                      <td className="keu-r keu-num keu-up">{rupiah(m.income)}</td>
                      <td className="keu-r keu-num keu-down">{rupiah(m.expense)}</td>
                      <td
                        className={`keu-r keu-num ${m.net > 0 ? "keu-up" : m.net < 0 ? "keu-down" : "keu-dim-t"}`}
                      >
                        {rupiah(m.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>

      <Section title={`Rincian P&L — ${fmtMonthKey(cur.key)}`} note="Bulan berjalan" />
      <div
        className="keu-2col"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
      >
        <Panel tab="↑ PENDAPATAN" pad={false} ticked>
          <PnlList lines={d.incomeLines} total={cur.income} tone="up" />
        </Panel>
        <Panel tab="↓ BEBAN" pad={false} ticked>
          <PnlList lines={d.expenseLines} total={cur.expense} tone="down" />
        </Panel>
      </div>

      <Panel ticked style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--keu-dim)" }}>
            LABA / RUGI BERSIH — {fmtMonthKey(cur.key)}
          </span>
          <span
            className={`keu-num ${autoTone(cur.net) === "up" ? "keu-up" : autoTone(cur.net) === "down" ? "keu-down" : "keu-dim-t"}`}
            style={{ fontSize: 22, fontWeight: 700 }}
          >
            {rupiah(cur.net)}
          </span>
        </div>
      </Panel>
    </>
  );
}

function PnlList({
  lines,
  total,
  tone,
}: {
  lines: { label: string; amount: number }[];
  total: number;
  tone: "up" | "down";
}) {
  if (lines.length === 0) {
    return <Empty>TIDAK ADA TRANSAKSI BULAN INI</Empty>;
  }
  return (
    <table className="keu-table">
      <tbody>
        {lines.map((l) => (
          <tr key={l.label}>
            <td>{l.label}</td>
            <td className={`keu-r keu-num ${tone === "up" ? "keu-up" : "keu-down"}`}>
              {rupiah(l.amount)}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td>TOTAL</td>
          <td className="keu-r">{rupiah(total)}</td>
        </tr>
      </tfoot>
    </table>
  );
}
