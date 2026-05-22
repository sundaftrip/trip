import Link from "next/link";
import { getNeraca } from "@/lib/keuangan/data";
import { rupiah } from "@/lib/keuangan/format";
import { PageHead, Section, Panel, Stat, Pill, autoTone } from "@/components/keuangan/ui";

export const dynamic = "force-dynamic";

export default async function NeracaPage() {
  const d = await getNeraca();
  const p = d.position;

  return (
    <>
      <PageHead
        crumb={
          <>
            <Link href="/admin/keuangan">TERMINAL</Link> / 05 — NERACA
          </>
        }
        title="Neraca / Balance Sheet"
        lede="Posisi aset, kewajiban, dan ekuitas. Ekuitas dihitung independen (Modal + Laba Ditahan) — jadi keseimbangan neraca menjadi BUKTI pembukuan benar, bukan sekadar rumus."
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Pill tone={p.balanced ? "ok" : "red"}>
              {p.balanced ? "✓ SEIMBANG — PEMBUKUAN VALID" : "⚠ TIMPANG — ADA SALAH CATAT"}
            </Pill>
            <Link
              href="/admin/keuangan/neraca/cetak"
              className="keu-btn keu-btn-ghost"
              style={{ fontSize: 10 }}
            >
              CETAK NERACA
            </Link>
          </div>
        }
      />

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}
      >
        <Stat k="Total Aset" accent="var(--keu-cyan)" v={rupiah(p.totalAssets)} tone="cyan" />
        <Stat
          k="Total Kewajiban"
          accent="var(--keu-red)"
          v={rupiah(p.totalLiabilities)}
          tone="down"
        />
        <Stat
          k="Ekuitas (Kekayaan Bersih)"
          accent="var(--keu-orange)"
          v={rupiah(p.equity)}
          tone={autoTone(p.equity)}
        />
      </div>

      <Section title="Neraca" note="Aset = Kewajiban + Ekuitas" />
      <div className="keu-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Panel tab="ASET" pad={false} ticked>
          <table className="keu-table">
            <tbody>
              {d.assets.map((a) => (
                <tr key={a.label}>
                  <td>
                    {a.label}
                    <div style={{ fontSize: 9, color: "var(--keu-faint)" }}>{a.group}</div>
                  </td>
                  <td className={`keu-r keu-num ${a.amount < 0 ? "keu-down" : ""}`}>
                    {rupiah(a.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>TOTAL ASET</td>
                <td className="keu-r keu-cyan-t">{rupiah(p.totalAssets)}</td>
              </tr>
            </tfoot>
          </table>
        </Panel>

        <Panel tab="KEWAJIBAN + EKUITAS" pad={false} ticked>
          <table className="keu-table">
            <tbody>
              <tr className="keu-row-strong">
                <td colSpan={2} className="keu-accent">
                  KEWAJIBAN
                </td>
              </tr>
              {d.liabilities.map((l) => (
                <tr key={l.label}>
                  <td>{l.label}</td>
                  <td className="keu-r keu-num keu-down">{rupiah(l.amount)}</td>
                </tr>
              ))}
              <tr className="keu-row-strong">
                <td className="keu-faint-t">Subtotal Kewajiban</td>
                <td className="keu-r keu-num keu-down">{rupiah(p.totalLiabilities)}</td>
              </tr>
              <tr className="keu-row-strong">
                <td colSpan={2} className="keu-accent">
                  EKUITAS
                </td>
              </tr>
              {d.equity.map((e) => (
                <tr key={e.label}>
                  <td>{e.label}</td>
                  <td className={`keu-r keu-num ${e.amount < 0 ? "keu-down" : "keu-up"}`}>
                    {rupiah(e.amount)}
                  </td>
                </tr>
              ))}
              <tr className="keu-row-strong">
                <td className="keu-faint-t">Subtotal Ekuitas</td>
                <td className={`keu-r keu-num ${autoTone(p.equity) === "down" ? "keu-down" : "keu-up"}`}>
                  {rupiah(p.equity)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>TOTAL KEWAJIBAN + EKUITAS</td>
                <td className="keu-r keu-cyan-t">
                  {rupiah(p.totalLiabilities + p.equity)}
                </td>
              </tr>
            </tfoot>
          </table>
        </Panel>
      </div>

      <Panel ticked style={{ marginTop: 14 }}>
        <div style={{ fontSize: 10.5, color: "var(--keu-dim)", lineHeight: 1.7 }}>
          <b className="keu-accent">CARA BACA.</b> Aset = kas + piutang peserta (trip sudah
          berangkat) + biaya trip ditangguhkan (trip belum berangkat). Kewajiban = hutang
          vendor + titipan peserta. Ekuitas = Modal Disetor + Laba Ditahan. Karena ekuitas
          dihitung dari sisi P&L secara terpisah, bila Total Aset = Total Kewajiban + Ekuitas
          berarti seluruh pembukuan konsisten. Bila timpang — ada transaksi yang salah catat.
        </div>
      </Panel>
    </>
  );
}
