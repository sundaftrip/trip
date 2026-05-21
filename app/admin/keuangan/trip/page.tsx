import Link from "next/link";
import { getTripList } from "@/lib/keuangan/data";
import { rupiah, fmtDate } from "@/lib/keuangan/format";
import { PageHead, Section, Panel, Stat, Pill, Empty, autoTone } from "@/components/keuangan/ui";

export const dynamic = "force-dynamic";

export default async function TripCashflowPage() {
  const { trips, sum } = await getTripList();

  return (
    <>
      <PageHead
        crumb={
          <>
            <Link href="/admin/keuangan">TERMINAL</Link> / 02 — CASHFLOW TRIP
          </>
        }
        title="Cashflow Real per Trip"
        lede="Angka real per trip dari payment peserta + HPP vendor — dibandingkan dengan proyeksi yang di-input tim Finance."
      />

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <Stat k="Real Cash In" v={rupiah(sum.realIn)} tone="up" accent="var(--keu-green)" />
        <Stat k="Real Cash Out" v={rupiah(sum.realOut)} tone="down" accent="var(--keu-red)" />
        <Stat
          k="Real Net Profit"
          v={rupiah(sum.realProfit)}
          tone={autoTone(sum.realProfit)}
          accent="var(--keu-orange)"
        />
        <Stat
          k="Proyeksi Profit"
          v={rupiah(sum.projProfit)}
          tone={autoTone(sum.projProfit)}
          accent="var(--keu-cyan)"
          sub="Target dari Finance"
        />
      </div>

      <Section title="Cashflow Real per Trip" note={`${trips.length} trip`} />
      <Panel pad={false} ticked>
        {trips.length === 0 ? (
          <Empty>BELUM ADA TRIP TERDAFTAR</Empty>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="keu-table">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>Status</th>
                  <th className="keu-r">Pax</th>
                  <th className="keu-r">Real In</th>
                  <th className="keu-r">Real Out</th>
                  <th className="keu-r">Real Profit</th>
                  <th className="keu-r">Proyeksi</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link href={`/admin/keuangan/trip/${t.id}`} className="keu-table-link">
                        <span className="keu-accent">{t.code}</span>{" "}
                        <span>{t.title}</span>
                      </Link>
                      <div style={{ fontSize: 9.5, color: "var(--keu-faint)", marginTop: 2 }}>
                        {t.country.toUpperCase()}
                        {t.tripDate ? ` · ${fmtDate(t.tripDate)}` : ""}
                      </div>
                    </td>
                    <td>
                      <Pill tone={t.status.tone}>{t.status.label}</Pill>
                    </td>
                    <td className="keu-r keu-dim-t">{t.agg.pax}</td>
                    <td className="keu-r keu-up">{rupiah(t.agg.realCashIn)}</td>
                    <td className="keu-r keu-down">{rupiah(t.agg.realCashOut)}</td>
                    <td className={`keu-r ${profitClass(t.agg.realProfit)}`}>
                      {rupiah(t.agg.realProfit)}
                    </td>
                    <td className="keu-r keu-cyan-t">
                      {t.hasFinance ? rupiah(t.agg.projProfit) : "—"}
                    </td>
                    <td className="keu-r">
                      <Link
                        href={`/admin/keuangan/trip/${t.id}`}
                        className="keu-table-link keu-faint-t"
                      >
                        DETAIL ›
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>TOTAL</td>
                  <td className="keu-r keu-up">{rupiah(sum.realIn)}</td>
                  <td className="keu-r keu-down">{rupiah(sum.realOut)}</td>
                  <td className={`keu-r ${profitClass(sum.realProfit)}`}>
                    {rupiah(sum.realProfit)}
                  </td>
                  <td className="keu-r keu-cyan-t">{rupiah(sum.projProfit)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}

function profitClass(n: number): string {
  return n > 0 ? "keu-up" : n < 0 ? "keu-down" : "keu-dim-t";
}
