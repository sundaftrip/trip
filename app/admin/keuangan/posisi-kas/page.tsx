import Link from "next/link";
import { getCashPosition } from "@/lib/keuangan/data";
import { rupiah } from "@/lib/keuangan/format";
import { PageHead, Section, Panel, Stat, Pill, Empty, StackBar, autoTone } from "@/components/keuangan/ui";

export const dynamic = "force-dynamic";

export default async function PosisiKasPage() {
  const d = await getCashPosition();
  const p = d.position;

  return (
    <>
      <PageHead
        crumb={
          <>
            <Link href="/admin/keuangan">TERMINAL</Link> / 03 — POSISI KAS
          </>
        }
        title="Posisi Kas"
        lede="Pisahkan uang titipan peserta (kewajiban — trip belum berangkat) dari uang yang benar-benar bebas dipakai perusahaan. Inilah yang sering bikin travel kepleset."
      />

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}
      >
        <Stat
          k="Titipan Peserta (Kewajiban)"
          accent="var(--keu-amber)"
          v={rupiah(p.deferredRevenue)}
          tone="amber"
          sub={`${d.titipanCount} trip belum berangkat — BUKAN uang Anda`}
        />
        <Stat
          k="Hutang Vendor"
          accent="var(--keu-red)"
          v={rupiah(p.hutangVendor)}
          tone="down"
          sub="HPP yang belum dibayar"
        />
        <Stat
          k="Uang Bebas Perusahaan"
          accent="var(--keu-green)"
          v={rupiah(p.uangBebas)}
          tone={autoTone(p.uangBebas)}
          sub="Kas − hutang vendor − titipan peserta"
        />
      </div>

      <Section title="Komposisi Saldo Kas" note="Ke mana saldo bank sebenarnya milik" />
      <Panel pad ticked>
        <StackBar
          segments={[
            { value: p.deferredRevenue, color: "var(--keu-amber)" },
            { value: p.hutangVendor, color: "var(--keu-red)" },
            { value: Math.max(0, p.uangBebas), color: "var(--keu-green)" },
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
          <Legend color="var(--keu-amber)" label="TITIPAN PESERTA" value={rupiah(p.deferredRevenue)} />
          <Legend color="var(--keu-red)" label="HAK VENDOR" value={rupiah(p.hutangVendor)} />
          <Legend
            color="var(--keu-green)"
            label="UANG BEBAS"
            value={rupiah(Math.max(0, p.uangBebas))}
          />
          <span style={{ color: "var(--keu-faint)", marginLeft: "auto" }}>
            TOTAL KAS {rupiah(p.cash)}
          </span>
        </div>
      </Panel>

      <Section title="Detail per Trip" note={`${d.rows.length} trip dengan aktivitas`} />
      <Panel pad={false} ticked>
        {d.rows.length === 0 ? (
          <Empty>BELUM ADA PERGERAKAN KAS PER TRIP</Empty>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="keu-table">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>Status</th>
                  <th className="keu-r">Cash Peserta</th>
                  <th className="keu-r">HPP Dibayar</th>
                  <th className="keu-r">HPP Hutang</th>
                  <th className="keu-r">Titipan</th>
                  <th className="keu-r">Laba Diakui</th>
                </tr>
              </thead>
              <tbody>
                {d.rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/admin/keuangan/trip/${r.id}`} className="keu-table-link">
                        <span className="keu-accent">{r.code}</span> {r.title}
                      </Link>
                    </td>
                    <td>
                      <Pill tone={r.departed ? "ok" : "warn"}>
                        {r.departed ? "BERANGKAT" : "BELUM"}
                      </Pill>
                    </td>
                    <td className="keu-r keu-num">{rupiah(r.pesertaCashIn)}</td>
                    <td className="keu-r keu-num keu-faint-t">{rupiah(r.hppPaid)}</td>
                    <td className="keu-r keu-num keu-down">{rupiah(r.hppHutang)}</td>
                    <td className="keu-r keu-num keu-amber-t">
                      {r.departed ? "—" : rupiah(r.titipan)}
                    </td>
                    <td className={`keu-r keu-num ${r.departed ? toneCls(r.recognizedProfit) : "keu-faint-t"}`}>
                      {r.departed ? rupiah(r.recognizedProfit) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5}>TITIPAN PESERTA TOTAL</td>
                  <td className="keu-r keu-amber-t">{rupiah(p.deferredRevenue)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Panel>

      <Panel pad ticked style={{ marginTop: 14 }}>
        <div style={{ fontSize: 10.5, color: "var(--keu-dim)", lineHeight: 1.7 }}>
          <b className="keu-accent">CARA BACA.</b> Selama trip belum berangkat, seluruh uang
          peserta adalah <b className="keu-amber-t">titipan</b> — Anda wajib menyelenggarakan
          trip atau mengembalikannya. Jangan dipakai untuk keperluan lain. Begitu trip
          berangkat, uang itu resmi jadi pendapatan dan labanya pindah ke kolom &quot;Laba Diakui&quot;.
          &quot;Uang Bebas&quot; adalah satu-satunya angka yang aman Anda anggap milik perusahaan.
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

function toneCls(n: number): string {
  return n > 0 ? "keu-up" : n < 0 ? "keu-down" : "keu-dim-t";
}
