import Link from "next/link";
import { getCashPosition } from "@/lib/keuangan/data";
import { rupiah } from "@/lib/keuangan/format";
import { PageHead, Section, Panel, Stat, Empty, StackBar, autoTone } from "@/components/keuangan/ui";

export const dynamic = "force-dynamic";

export default async function PosisiKasPage() {
  const d = await getCashPosition();

  return (
    <>
      <PageHead
        crumb={
          <>
            <Link href="/admin/keuangan">TERMINAL</Link> / 03 — POSISI KAS
          </>
        }
        title="Posisi Kas"
        lede="Pisahkan mana cash yang masih earmark untuk vendor (titipan peserta) vs yang sudah pasti milik perusahaan. Inilah yang sering bikin travel kepleset."
      />

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}
      >
        <Stat
          k="Uang Peserta (Titipan)"
          accent="var(--keu-amber)"
          v={rupiah(d.uangPeserta)}
          tone="amber"
          sub={`Earmark vendor ${rupiah(d.agg.titipan)} · mengendap ${rupiah(d.agg.mengendap)}`}
        />
        <Stat
          k="Uang Perusahaan"
          accent="var(--keu-green)"
          v={rupiah(d.uangPerusahaan)}
          tone={autoTone(d.uangPerusahaan)}
          sub="Cash yang sudah PASTI milik perusahaan"
        />
        <Stat
          k="Hutang Vendor"
          accent="var(--keu-red)"
          v={rupiah(d.hutangVendor)}
          tone="down"
          sub="HPP yang belum dibayar — akan keluar dari bank"
        />
      </div>

      <Section title="Komposisi Saldo Bank" note="Titipan vs mengendap vs uang perusahaan" />
      <Panel pad ticked>
        <StackBar
          segments={[
            { value: d.agg.titipan, color: "var(--keu-amber)" },
            { value: d.agg.mengendap, color: "var(--keu-cyan)" },
            { value: Math.max(0, d.uangPerusahaan), color: "var(--keu-green)" },
          ]}
        />
        <div
          style={{
            display: "flex",
            gap: 18,
            marginTop: 10,
            fontSize: 10,
            letterSpacing: "0.06em",
            flexWrap: "wrap",
          }}
        >
          <Legend color="var(--keu-amber)" label="TITIPAN TERIKAT" value={rupiah(d.agg.titipan)} />
          <Legend color="var(--keu-cyan)" label="CICILAN MENGENDAP" value={rupiah(d.agg.mengendap)} />
          <Legend
            color="var(--keu-green)"
            label="UANG PERUSAHAAN"
            value={rupiah(Math.max(0, d.uangPerusahaan))}
          />
        </div>
      </Panel>

      <Section title="Detail per Trip — Uang Peserta vs Margin Locked" note={`${d.rows.length} trip`} />
      <Panel pad={false} ticked>
        {d.rows.length === 0 ? (
          <Empty>BELUM ADA PERGERAKAN KAS PER TRIP</Empty>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="keu-table">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th className="keu-r">Cicilan Masuk</th>
                  <th className="keu-r">HPP Lunas</th>
                  <th className="keu-r">HPP Hutang</th>
                  <th className="keu-r">Titipan</th>
                  <th className="keu-r">Mengendap</th>
                  <th className="keu-r">Margin Locked</th>
                </tr>
              </thead>
              <tbody>
                {d.rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/admin/keuangan/trip/${r.id}`} className="keu-table-link">
                        <span className="keu-accent">{r.code}</span> {r.title}
                      </Link>
                      {!r.hasFinance && (
                        <div style={{ fontSize: 9, color: "var(--keu-amber)", marginTop: 2 }}>
                          ⚠ HPP proyeksi belum di-set Finance
                        </div>
                      )}
                    </td>
                    <td className="keu-r keu-num">{rupiah(r.cicilanMasuk)}</td>
                    <td className="keu-r keu-num keu-faint-t">{rupiah(r.hppLunas)}</td>
                    <td className="keu-r keu-num keu-down">{rupiah(r.hppHutang)}</td>
                    <td className="keu-r keu-num keu-amber-t">{rupiah(r.titipan)}</td>
                    <td className="keu-r keu-num keu-cyan-t">{rupiah(r.mengendap)}</td>
                    <td className={`keu-r keu-num ${marginClass(r.marginLocked)}`}>
                      {rupiah(r.marginLocked)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>TOTAL</td>
                  <td className="keu-r">{rupiah(d.agg.cicilanMasuk)}</td>
                  <td className="keu-r">{rupiah(d.agg.hppLunas)}</td>
                  <td className="keu-r keu-down">{rupiah(d.agg.hppHutang)}</td>
                  <td className="keu-r keu-amber-t">{rupiah(d.agg.titipan)}</td>
                  <td className="keu-r keu-cyan-t">{rupiah(d.agg.mengendap)}</td>
                  <td className={`keu-r ${marginClass(d.agg.marginLocked)}`}>
                    {rupiah(d.agg.marginLocked)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Panel>

      <Panel pad ticked style={{ marginTop: 14 }}>
        <div style={{ fontSize: 10.5, color: "var(--keu-dim)", lineHeight: 1.7 }}>
          <b className="keu-accent">CARA BACA.</b> Titipan = uang peserta yang masih wajib
          disetor ke vendor (HPP belum lunas). Mengendap = cicilan masuk tapi HPP proyeksi
          belum dikunci Finance — statusnya belum jelas milik siapa. Margin locked = sisa
          yang sudah pasti jadi keuntungan perusahaan, hanya muncul setelah proyeksi
          di-confirm.
        </div>
      </Panel>
    </>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 9, height: 9, background: color, display: "inline-block" }} />
      <span style={{ color: "var(--keu-faint)" }}>{label}</span>
      <span className="keu-num" style={{ color: "var(--keu-text)" }}>
        {value}
      </span>
    </span>
  );
}

function marginClass(n: number): string {
  return n > 0 ? "keu-up" : n < 0 ? "keu-down" : "keu-dim-t";
}
