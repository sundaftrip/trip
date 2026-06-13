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
        title="Cashflow & Laba per Trip"
        lede="Arus kas per trip (basis kas) berdampingan dengan laba yang DIAKUI — laba hanya muncul untuk trip yang sudah berangkat. Trip belum berangkat: uangnya masih titipan."
      />

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <Stat k="Total Cash In" v={rupiah(sum.cashIn)} tone="up" accent="var(--keu-green)" />
        <Stat k="Total Cash Out" v={rupiah(sum.cashOut)} tone="down" accent="var(--keu-red)" />
        <Stat
          k="Arus Kas Bersih"
          v={rupiah(sum.netCashFlow)}
          tone={autoTone(sum.netCashFlow)}
          accent="var(--keu-cyan)"
          sub="Basis kas — bukan laba"
        />
        <Stat
          k="Laba Diakui"
          v={rupiah(sum.recognizedProfit)}
          tone={autoTone(sum.recognizedProfit)}
          accent="var(--keu-orange)"
          sub="Hanya trip sudah berangkat"
        />
      </div>

      <Section title="Cashflow & Laba per Trip" note={`${trips.length} trip`} />
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
                  <th className="keu-r">Cash In</th>
                  <th className="keu-r">Cash Out</th>
                  <th className="keu-r">Arus Kas</th>
                  <th className="keu-r">Laba Diakui</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link href={`/admin/keuangan/trip/${t.id}`} className="keu-table-link">
                        <span className="keu-accent">{t.code}</span> <span>{t.title}</span>
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
                    <td className="keu-r keu-up">{rupiah(t.agg.cashIn)}</td>
                    <td className="keu-r keu-down">{rupiah(t.agg.cashOut)}</td>
                    <td className={`keu-r ${toneCls(t.agg.netCashFlow)}`}>
                      {rupiah(t.agg.netCashFlow)}
                    </td>
                    <td className="keu-r">
                      {t.departed ? (
                        <span className={`keu-num ${toneCls(t.agg.recognizedProfit)}`}>
                          {rupiah(t.agg.recognizedProfit)}
                        </span>
                      ) : (
                        <span className="keu-faint-t" style={{ fontSize: 10 }}>
                          BELUM DIAKUI
                        </span>
                      )}
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
                  <td className="keu-r keu-up">{rupiah(sum.cashIn)}</td>
                  <td className="keu-r keu-down">{rupiah(sum.cashOut)}</td>
                  <td className={`keu-r ${toneCls(sum.netCashFlow)}`}>
                    {rupiah(sum.netCashFlow)}
                  </td>
                  <td className={`keu-r ${toneCls(sum.recognizedProfit)}`}>
                    {rupiah(sum.recognizedProfit)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Panel>

      <Panel ticked style={{ marginTop: 14 }}>
        <div style={{ fontSize: 10.5, color: "var(--keu-dim)", lineHeight: 1.7 }}>
          <b className="keu-accent">CARA BACA.</b> &quot;Arus Kas&quot; = uang masuk − keluar (basis kas);
          trip yang baru kumpulkan DP bisa tampak arus kas positif padahal belum untung.
          &quot;Laba Diakui&quot; baru terisi setelah trip berangkat — itulah laba sesungguhnya
          (pendapatan − HPP). Titipan peserta sebesar {rupiah(sum.deferredRevenue)} dari trip
          yang belum berangkat masih berstatus kewajiban, belum jadi laba.
        </div>
      </Panel>
    </>
  );
}

function toneCls(n: number): string {
  return n > 0 ? "keu-up" : n < 0 ? "keu-down" : "keu-dim-t";
}
