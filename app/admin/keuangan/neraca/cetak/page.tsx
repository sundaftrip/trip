import "../../cetak.css";
import { auth } from "@/lib/auth";
import { getNeraca, getCompanyIdentity } from "@/lib/keuangan/data";
import { rupiah, fmtDate, fmtDateTime } from "@/lib/keuangan/format";
import CetakToolbar from "@/components/keuangan/CetakToolbar";

export const dynamic = "force-dynamic";

export default async function NeracaCetakPage() {
  const [d, company, session] = await Promise.all([
    getNeraca(),
    getCompanyIdentity(),
    auth(),
  ]);
  const p = d.position;
  const now = new Date();

  return (
    <div className="cetak">
      <CetakToolbar backHref="/admin/keuangan/neraca" />

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
            <div className="cetak-doctype">Neraca</div>
            <div className="cetak-docdate">Dicetak {fmtDate(now)}</div>
          </div>
        </div>

        <div className="cetak-title">Neraca / Balance Sheet</div>
        <div className="cetak-subtitle">
          Posisi keuangan per {fmtDate(now)} · Aset = Kewajiban + Ekuitas
        </div>

        <div className="cetak-2col">
          <div>
            <div className="cetak-sec">Aset</div>
            <table className="cetak-table">
              <tbody>
                {d.assets.map((a) => (
                  <tr key={a.label}>
                    <td>
                      {a.label}
                      <div className="cetak-muted" style={{ fontSize: 9.5 }}>
                        {a.group}
                      </div>
                    </td>
                    <td className={`cetak-r ${a.amount < 0 ? "cetak-down" : ""}`}>
                      {rupiah(a.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>TOTAL ASET</td>
                  <td className="cetak-r">{rupiah(p.totalAssets)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div>
            <div className="cetak-sec">Kewajiban &amp; Ekuitas</div>
            <table className="cetak-table">
              <tbody>
                <tr style={{ fontWeight: 800 }}>
                  <td colSpan={2}>KEWAJIBAN</td>
                </tr>
                {d.liabilities.map((l) => (
                  <tr key={l.label}>
                    <td>{l.label}</td>
                    <td className="cetak-r">{rupiah(l.amount)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 700 }}>
                  <td>Subtotal Kewajiban</td>
                  <td className="cetak-r">{rupiah(p.totalLiabilities)}</td>
                </tr>
                <tr style={{ fontWeight: 800 }}>
                  <td colSpan={2}>EKUITAS</td>
                </tr>
                {d.equity.map((e) => (
                  <tr key={e.label}>
                    <td>{e.label}</td>
                    <td className={`cetak-r ${e.amount < 0 ? "cetak-down" : ""}`}>
                      {rupiah(e.amount)}
                    </td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 700 }}>
                  <td>Subtotal Ekuitas</td>
                  <td className={`cetak-r ${p.equity < 0 ? "cetak-down" : ""}`}>
                    {rupiah(p.equity)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>TOTAL KEWAJIBAN + EKUITAS</td>
                  <td className="cetak-r">{rupiah(p.totalLiabilities + p.equity)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="cetak-grandtotal">
          <span className="cetak-grandtotal-k">
            {p.balanced ? "Neraca Seimbang — pembukuan valid" : "Neraca Tidak Seimbang"}
          </span>
          <span className="cetak-grandtotal-v">
            {p.balanced ? "✓" : "⚠"} {rupiah(p.totalAssets)}
          </span>
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
