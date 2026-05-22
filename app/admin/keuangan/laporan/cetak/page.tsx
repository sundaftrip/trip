import "../../cetak.css";
import { auth } from "@/lib/auth";
import { getLaporan, getCompanyIdentity } from "@/lib/keuangan/data";
import { rupiah, fmtDate, fmtDateTime, fmtMonthKey } from "@/lib/keuangan/format";
import CetakToolbar from "@/components/keuangan/CetakToolbar";

export const dynamic = "force-dynamic";

export default async function LaporanCetakPage() {
  const [d, company, session] = await Promise.all([
    getLaporan(),
    getCompanyIdentity(),
    auth(),
  ]);
  const cur = d.current;
  const labaKotor = cur.revenue - cur.hpp;
  const now = new Date();

  return (
    <div className="cetak">
      <CetakToolbar backHref="/admin/keuangan/laporan" />

      <div className="cetak-doc">
        <div className="cetak-kop">
          <div className="cetak-kop-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={company.logo} alt={company.name} className="cetak-kop-logo" />
            <div>
              <div className="cetak-kop-co">{company.name}</div>
              <div className="cetak-kop-sub">Laporan Keuangan Internal</div>
            </div>
          </div>
          <div className="cetak-kop-right">
            <div className="cetak-doctype">Laba Rugi</div>
            <div className="cetak-docdate">Dicetak {fmtDate(now)}</div>
          </div>
        </div>

        <div className="cetak-title">Laporan Laba Rugi</div>
        <div className="cetak-subtitle">
          Basis akrual — pendapatan & HPP diakui saat trip berangkat · Periode{" "}
          {fmtMonthKey(cur.key)}
        </div>

        <div className="cetak-sec">Tren 6 Bulan Terakhir</div>
        <table className="cetak-table">
          <thead>
            <tr>
              <th>Bulan</th>
              <th className="cetak-r">Pendapatan</th>
              <th className="cetak-r">HPP</th>
              <th className="cetak-r">Laba Kotor</th>
              <th className="cetak-r">Beban Ops</th>
              <th className="cetak-r">Laba Bersih</th>
            </tr>
          </thead>
          <tbody>
            {d.last6.length === 0 ? (
              <tr>
                <td colSpan={6} className="cetak-empty">
                  Belum ada data periode.
                </td>
              </tr>
            ) : (
              d.last6.map((m) => (
                <tr key={m.key}>
                  <td>{fmtMonthKey(m.key)}</td>
                  <td className="cetak-r">{rupiah(m.revenue)}</td>
                  <td className="cetak-r">{rupiah(m.hpp)}</td>
                  <td className="cetak-r">{rupiah(m.revenue - m.hpp)}</td>
                  <td className="cetak-r">{rupiah(m.opex)}</td>
                  <td className={`cetak-r ${m.net >= 0 ? "cetak-up" : "cetak-down"}`}>
                    {rupiah(m.net)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="cetak-sec">Laba Rugi — {fmtMonthKey(cur.key)}</div>
        <table className="cetak-table">
          <tbody>
            <tr>
              <td colSpan={2} style={{ fontWeight: 800 }}>
                PENDAPATAN TRIP (diakui saat berangkat)
              </td>
            </tr>
            {d.tripsThisMonth.length === 0 ? (
              <tr>
                <td className="cetak-empty">Tidak ada trip berangkat bulan ini</td>
                <td className="cetak-r cetak-muted">Rp 0</td>
              </tr>
            ) : (
              d.tripsThisMonth.map((t) => (
                <tr key={t.code}>
                  <td>
                    {t.code} — {t.title}
                  </td>
                  <td className="cetak-r">{rupiah(t.revenue)}</td>
                </tr>
              ))
            )}
            <tr style={{ fontWeight: 700 }}>
              <td>Total Pendapatan Trip</td>
              <td className="cetak-r">{rupiah(cur.revenue)}</td>
            </tr>
            <tr>
              <td>(−) HPP Trip</td>
              <td className="cetak-r cetak-down">{rupiah(cur.hpp)}</td>
            </tr>
            <tr style={{ fontWeight: 800, background: "var(--soft)" }}>
              <td>= LABA KOTOR</td>
              <td className={`cetak-r ${labaKotor >= 0 ? "cetak-up" : "cetak-down"}`}>
                {rupiah(labaKotor)}
              </td>
            </tr>
            {d.incomeLines.length > 0 && (
              <>
                <tr>
                  <td colSpan={2} style={{ fontWeight: 800 }}>
                    PENDAPATAN LAIN
                  </td>
                </tr>
                {d.incomeLines.map((l) => (
                  <tr key={l.label}>
                    <td>{l.label}</td>
                    <td className="cetak-r cetak-up">{rupiah(l.amount)}</td>
                  </tr>
                ))}
              </>
            )}
            <tr>
              <td colSpan={2} style={{ fontWeight: 800 }}>
                BEBAN OPERASIONAL
              </td>
            </tr>
            {d.opexLines.length === 0 ? (
              <tr>
                <td className="cetak-empty">Tidak ada beban operasional bulan ini</td>
                <td className="cetak-r cetak-muted">Rp 0</td>
              </tr>
            ) : (
              d.opexLines.map((l) => (
                <tr key={l.label}>
                  <td>{l.label}</td>
                  <td className="cetak-r cetak-down">{rupiah(l.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td>LABA BERSIH — {fmtMonthKey(cur.key)}</td>
              <td className={`cetak-r ${cur.net >= 0 ? "cetak-up" : "cetak-down"}`}>
                {rupiah(cur.net)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="cetak-grandtotal">
          <span className="cetak-grandtotal-k">Akumulasi Laba Ditahan (sejak awal)</span>
          <span className="cetak-grandtotal-v">{rupiah(d.lifetime.net)}</span>
        </div>

        <div className="cetak-foot">
          <span>
            Dicetak oleh {session?.user?.name ?? "—"} · {fmtDateTime(now)}
          </span>
          <span>{company.name} — dokumen internal</span>
        </div>
      </div>
    </div>
  );
}
