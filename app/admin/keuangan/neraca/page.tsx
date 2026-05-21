import Link from "next/link";
import { getNeraca } from "@/lib/keuangan/data";
import { rupiah } from "@/lib/keuangan/format";
import { PageHead, Section, Panel, Stat, Empty, autoTone } from "@/components/keuangan/ui";

export const dynamic = "force-dynamic";

export default async function NeracaPage() {
  const d = await getNeraca();
  const balanced = Math.round(d.totalAssets) === Math.round(d.totalLiabilities + d.equity);

  return (
    <>
      <PageHead
        crumb={
          <>
            <Link href="/admin/keuangan">TERMINAL</Link> / 05 — NERACA
          </>
        }
        title="Neraca / Balance Sheet"
        lede="Posisi aset, kewajiban, dan ekuitas perusahaan pada saat ini. Aset selalu = Kewajiban + Ekuitas."
      />

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}
      >
        <Stat k="Total Aset" accent="var(--keu-cyan)" v={rupiah(d.totalAssets)} tone="cyan" />
        <Stat
          k="Total Kewajiban"
          accent="var(--keu-red)"
          v={rupiah(d.totalLiabilities)}
          tone="down"
        />
        <Stat
          k="Ekuitas (Net Worth)"
          accent="var(--keu-orange)"
          v={rupiah(d.equity)}
          tone={autoTone(d.equity)}
        />
      </div>

      <Section title="Neraca" note={balanced ? "✓ Seimbang" : "⚠ Tidak seimbang"} />
      <div
        className="keu-2col"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
      >
        <Panel tab="ASET" pad={false} ticked>
          <table className="keu-table">
            <tbody>
              {d.assets.map((a) => (
                <tr key={a.label}>
                  <td>{a.label}</td>
                  <td className={`keu-r keu-num ${a.amount < 0 ? "keu-down" : ""}`}>
                    {rupiah(a.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>TOTAL ASET</td>
                <td className="keu-r keu-cyan-t">{rupiah(d.totalAssets)}</td>
              </tr>
            </tfoot>
          </table>
        </Panel>

        <Panel tab="KEWAJIBAN + EKUITAS" pad={false} ticked>
          <table className="keu-table">
            <tbody>
              {d.liabilities.length === 0 ? (
                <tr>
                  <td className="keu-faint-t" colSpan={2}>
                    <div style={{ padding: "4px 0" }}>Tidak ada kewajiban tercatat</div>
                  </td>
                </tr>
              ) : (
                d.liabilities.map((l) => (
                  <tr key={l.label}>
                    <td>{l.label}</td>
                    <td className="keu-r keu-num keu-down">{rupiah(l.amount)}</td>
                  </tr>
                ))
              )}
              <tr className="keu-row-strong">
                <td className="keu-faint-t">Subtotal Kewajiban</td>
                <td className="keu-r keu-num keu-down">{rupiah(d.totalLiabilities)}</td>
              </tr>
              <tr>
                <td>Ekuitas Pemilik</td>
                <td className={`keu-r keu-num ${d.equity < 0 ? "keu-down" : "keu-up"}`}>
                  {rupiah(d.equity)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>TOTAL KEWAJIBAN + EKUITAS</td>
                <td className="keu-r keu-cyan-t">
                  {rupiah(d.totalLiabilities + d.equity)}
                </td>
              </tr>
            </tfoot>
          </table>
        </Panel>
      </div>

      {d.assets.length === 0 && d.liabilities.length === 0 && (
        <Panel ticked style={{ marginTop: 14 }}>
          <Empty>BELUM ADA DATA NERACA — MULAI DENGAN MENAMBAH REKENING & TRANSAKSI</Empty>
        </Panel>
      )}

      <Panel ticked style={{ marginTop: 14 }}>
        <div style={{ fontSize: 10.5, color: "var(--keu-dim)", lineHeight: 1.7 }}>
          <b className="keu-accent">CARA BACA.</b> Aset = kas/bank + piutang peserta yang
          belum tertagih. Kewajiban = hutang vendor (HPP yang belum dibayar). Ekuitas =
          kekayaan bersih perusahaan setelah semua kewajiban dilunasi — angka inilah
          ukuran sehat-tidaknya perusahaan, bukan sekadar saldo rekening.
        </div>
      </Panel>
    </>
  );
}
