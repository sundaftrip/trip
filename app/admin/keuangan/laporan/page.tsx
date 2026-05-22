import Link from "next/link";
import { getLaporan } from "@/lib/keuangan/data";
import { rupiah, fmtMonthKey } from "@/lib/keuangan/format";
import { PageHead, Section, Panel, Stat, Spark, Empty, autoTone } from "@/components/keuangan/ui";

export const dynamic = "force-dynamic";

const MON = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
const shortMonth = (key: string) => MON[Number(key.split("-")[1]) - 1] ?? key;

export default async function LaporanPage() {
  const d = await getLaporan();
  const cur = d.current;
  const labaKotor = cur.revenue - cur.hpp;

  return (
    <>
      <PageHead
        crumb={
          <>
            <Link href="/admin/keuangan">TERMINAL</Link> / 04 — LAPORAN P&L
          </>
        }
        title="Laporan Laba Rugi (Akrual)"
        lede="Pendapatan & HPP diakui pada bulan trip BERANGKAT — bukan saat uang masuk. Inilah ukuran kinerja yang sebenarnya."
        actions={
          <Link
            href="/admin/keuangan/laporan/cetak"
            className="keu-btn keu-btn-ghost"
            style={{ fontSize: 10 }}
          >
            CETAK LAPORAN
          </Link>
        }
      />

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}
      >
        <Stat
          k={`Pendapatan · ${fmtMonthKey(cur.key)}`}
          v={rupiah(cur.revenue)}
          tone="up"
          accent="var(--keu-green)"
        />
        <Stat
          k="HPP Trip"
          v={rupiah(cur.hpp)}
          tone="down"
          accent="var(--keu-red)"
        />
        <Stat
          k="Beban Operasional"
          v={rupiah(cur.opex)}
          tone="down"
          accent="var(--keu-amber)"
        />
        <Stat
          k="Laba Bersih Bulan Ini"
          v={rupiah(cur.net)}
          tone={autoTone(cur.net)}
          accent="var(--keu-orange)"
        />
      </div>

      <Section title="Tren 6 Bulan" note="Laba bersih per bulan (akrual)" />
      <Panel pad ticked>
        {d.last6.length === 0 ? (
          <Empty>BELUM ADA TRIP YANG BERANGKAT / TRANSAKSI</Empty>
        ) : (
          <>
            <Spark data={d.last6.map((m) => m.net)} labels={d.last6.map((m) => shortMonth(m.key))} />
            <div style={{ overflowX: "auto", marginTop: 16 }}>
              <table className="keu-table">
                <thead>
                  <tr>
                    <th>Bulan</th>
                    <th className="keu-r">Pendapatan</th>
                    <th className="keu-r">HPP</th>
                    <th className="keu-r">Laba Kotor</th>
                    <th className="keu-r">Beban Ops</th>
                    <th className="keu-r">Laba Bersih</th>
                  </tr>
                </thead>
                <tbody>
                  {d.last6.map((m) => (
                    <tr key={m.key}>
                      <td>{fmtMonthKey(m.key)}</td>
                      <td className="keu-r keu-num keu-up">{rupiah(m.revenue)}</td>
                      <td className="keu-r keu-num keu-down">{rupiah(m.hpp)}</td>
                      <td className="keu-r keu-num">{rupiah(m.revenue - m.hpp)}</td>
                      <td className="keu-r keu-num keu-down">{rupiah(m.opex)}</td>
                      <td className={`keu-r keu-num ${toneCls(m.net)}`}>{rupiah(m.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>

      <Section title={`Laba Rugi Lengkap — ${fmtMonthKey(cur.key)}`} note="Bulan berjalan" />
      <Panel pad={false} ticked>
        <table className="keu-table">
          <tbody>
            <tr className="keu-row-strong">
              <td colSpan={2} className="keu-accent">
                PENDAPATAN TRIP (diakui saat berangkat)
              </td>
            </tr>
            {d.tripsThisMonth.length === 0 ? (
              <tr>
                <td className="keu-faint-t">Tidak ada trip berangkat bulan ini</td>
                <td className="keu-r keu-faint-t">Rp 0</td>
              </tr>
            ) : (
              d.tripsThisMonth.map((t) => (
                <tr key={t.code}>
                  <td>
                    <span className="keu-accent">{t.code}</span> {t.title}
                  </td>
                  <td className="keu-r keu-num keu-up">{rupiah(t.revenue)}</td>
                </tr>
              ))
            )}
            <Line label="Total Pendapatan Trip" value={cur.revenue} strong />
            <Line label="(−) HPP Trip" value={-cur.hpp} />
            <Line label="= LABA KOTOR" value={labaKotor} strong hi />

            {d.incomeLines.length > 0 && (
              <>
                <tr className="keu-row-strong">
                  <td colSpan={2} className="keu-accent">
                    PENDAPATAN LAIN
                  </td>
                </tr>
                {d.incomeLines.map((l) => (
                  <tr key={l.label}>
                    <td>{l.label}</td>
                    <td className="keu-r keu-num keu-up">{rupiah(l.amount)}</td>
                  </tr>
                ))}
              </>
            )}

            <tr className="keu-row-strong">
              <td colSpan={2} className="keu-accent">
                BEBAN OPERASIONAL
              </td>
            </tr>
            {d.opexLines.length === 0 ? (
              <tr>
                <td className="keu-faint-t">Tidak ada beban operasional bulan ini</td>
                <td className="keu-r keu-faint-t">Rp 0</td>
              </tr>
            ) : (
              d.opexLines.map((l) => (
                <tr key={l.label}>
                  <td>{l.label}</td>
                  <td className="keu-r keu-num keu-down">{rupiah(l.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td>LABA BERSIH — {fmtMonthKey(cur.key)}</td>
              <td className={`keu-r keu-num ${toneCls(cur.net)}`}>{rupiah(cur.net)}</td>
            </tr>
          </tfoot>
        </table>
      </Panel>

      <Panel ticked style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 10.5, letterSpacing: "0.14em", color: "var(--keu-dim)" }}>
            AKUMULASI SEJAK AWAL (LABA DITAHAN)
          </span>
          <span className={`keu-num ${toneCls(d.lifetime.net)}`} style={{ fontSize: 18, fontWeight: 700 }}>
            {rupiah(d.lifetime.net)}
          </span>
        </div>
      </Panel>
    </>
  );
}

function Line({
  label,
  value,
  strong,
  hi,
}: {
  label: string;
  value: number;
  strong?: boolean;
  hi?: boolean;
}) {
  return (
    <tr className={strong ? "keu-row-strong" : ""} style={hi ? { background: "var(--keu-bg2)" } : undefined}>
      <td>{label}</td>
      <td className={`keu-r keu-num ${toneCls(value)}`}>{rupiah(value)}</td>
    </tr>
  );
}

function toneCls(n: number): string {
  return n > 0 ? "keu-up" : n < 0 ? "keu-down" : "keu-dim-t";
}
