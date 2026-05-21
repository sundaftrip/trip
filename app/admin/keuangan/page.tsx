import Link from "next/link";
import { getOverview } from "@/lib/keuangan/data";
import { rupiah } from "@/lib/keuangan/format";
import {
  PageHead,
  Section,
  Panel,
  Hero,
  Stat,
  NavCard,
  Delta,
  Pill,
  Empty,
  autoTone,
} from "@/components/keuangan/ui";
import TxnTable from "@/components/keuangan/TxnTable";

export const dynamic = "force-dynamic";

const MODULES = [
  { idx: "02", href: "/admin/keuangan/trip", title: "Cashflow Trip", desc: "Arus kas & laba diakui per trip — basis akrual." },
  { idx: "03", href: "/admin/keuangan/posisi-kas", title: "Posisi Kas", desc: "Titipan peserta (kewajiban) vs uang bebas perusahaan." },
  { idx: "04", href: "/admin/keuangan/laporan", title: "Laporan P&L", desc: "Laba rugi akrual — pendapatan diakui saat trip berangkat." },
  { idx: "05", href: "/admin/keuangan/neraca", title: "Neraca", desc: "Aset = Kewajiban + Ekuitas. Neraca sebagai alat verifikasi." },
  { idx: "06", href: "/admin/keuangan/bank", title: "Bank & Kas", desc: "Rekening bank, kas tunai, dan e-wallet operasional." },
  { idx: "07", href: "/admin/keuangan/vendor", title: "Vendor & Hutang", desc: "Daftar vendor, tagihan, dan pelunasan hutang HPP." },
  { idx: "08", href: "/admin/keuangan/jurnal", title: "Jurnal Manual", desc: "Buku besar kas. Koreksi lewat void, bukan hapus." },
  { idx: "09", href: "/admin/keuangan/lapangan", title: "Pengeluaran Lapangan", desc: "Review pengeluaran TL dari lapangan — foto bukti + approval." },
];

export default async function RingkasanPage() {
  const d = await getOverview();
  const p = d.position;

  return (
    <>
      <PageHead
        crumb="TERMINAL / 01 — RINGKASAN"
        title="Ringkasan Akuntansi"
        lede="Posisi keuangan real-time basis akrual — pendapatan diakui saat trip berangkat, uang peserta yang belum berangkat dihitung sebagai titipan. Semua nilai IDR."
        actions={
          <Pill tone={p.balanced ? "ok" : "red"}>
            {p.balanced ? "✓ NERACA SEIMBANG" : "⚠ NERACA TIMPANG"}
          </Pill>
        }
      />

      <Hero
        label="Uang Bebas Perusahaan"
        value={p.uangBebas}
        formula="UANG BEBAS = KAS/BANK − HUTANG VENDOR − TITIPAN PESERTA · uang yang benar-benar boleh dipakai"
      />

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", marginTop: 12 }}
      >
        <Stat
          k="Total Saldo Bank/Kas"
          accent="var(--keu-cyan)"
          v={rupiah(p.cash)}
          tone={autoTone(p.cash)}
          sub={`${d.counts.banks} rekening`}
        />
        <Stat
          k="Titipan Peserta"
          accent="var(--keu-amber)"
          v={rupiah(p.deferredRevenue)}
          tone="amber"
          sub="Kewajiban — trip belum berangkat"
        />
        <Stat
          k="Hutang Vendor"
          accent="var(--keu-red)"
          v={rupiah(p.hutangVendor)}
          tone="down"
          sub={`${d.counts.bills} tagihan aktif`}
        />
        <Stat
          k="Piutang Peserta"
          accent="var(--keu-cyan)"
          v={rupiah(p.arPeserta)}
          tone="cyan"
          sub="Hak tagih — trip sudah berangkat"
        />
      </div>

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", marginTop: 12 }}
      >
        <Stat
          k="Ekuitas (Modal + Laba Ditahan)"
          accent="var(--keu-orange)"
          v={rupiah(p.equity)}
          tone={autoTone(p.equity)}
          sub="Kekayaan bersih perusahaan"
        />
        <Stat
          k="Laba Bersih — Bulan Ini"
          v={rupiah(d.monthNet)}
          tone={autoTone(d.monthNet)}
          sub={<Delta value={d.monthNetGrowth} suffix="vs bln lalu" />}
        />
        <Stat
          k="Trip Sudah Berangkat"
          v={`${d.counts.departed} / ${d.counts.trips}`}
          tone="cyan"
          sub="Pendapatan sudah diakui"
        />
        <Stat
          k="Pendapatan Diakui (Lifetime)"
          v={rupiah(d.recognizedRevenue)}
          tone="up"
          sub="Total dari trip yang sudah jalan"
        />
      </div>

      {d.fieldPendingCount > 0 && (
        <Link href="/admin/keuangan/lapangan" style={{ display: "block", marginTop: 12 }}>
          <Panel ticked className="keu-panel">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                fontSize: 11.5,
              }}
            >
              <span className="keu-pill keu-pill-warn">REVIEW</span>
              <span className="keu-dim-t">
                <b className="keu-amber-t">{d.fieldPendingCount} pengeluaran lapangan</b> dari TL
                menunggu review — senilai {rupiah(d.fieldPending)}.
              </span>
              <span className="keu-accent" style={{ marginLeft: "auto", fontSize: 10 }}>
                BUKA ANTRIAN ›
              </span>
            </div>
          </Panel>
        </Link>
      )}

      <Section title="Modul Terminal" note="Klik untuk membuka rincian" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        {MODULES.map((m) => (
          <NavCard key={m.idx} {...m} />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
          gap: 14,
          marginTop: 8,
        }}
        className="keu-2col"
      >
        <div>
          <Section title="Transaksi Terbaru" note="Payment peserta + jurnal vendor + entry manual" />
          <Panel pad ticked>
            <TxnTable txns={d.txns} limit={14} />
            <div style={{ marginTop: 12 }}>
              <Link
                href="/admin/keuangan/jurnal"
                className="keu-btn keu-btn-ghost"
                style={{ fontSize: 10 }}
              >
                BUKA JURNAL LENGKAP ›
              </Link>
            </div>
          </Panel>
        </div>

        <div>
          <Section title="Rekening" note="Saldo terkini" />
          <Panel pad ticked>
            {d.bankBalances.length === 0 ? (
              <Empty>
                BELUM ADA REKENING ·{" "}
                <Link href="/admin/keuangan/bank" className="keu-accent">
                  TAMBAH
                </Link>
              </Empty>
            ) : (
              <table className="keu-table">
                <tbody>
                  {d.bankBalances.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div>{b.name}</div>
                        <div style={{ fontSize: 9.5, color: "var(--keu-faint)" }}>{b.kind}</div>
                      </td>
                      <td className={`keu-r keu-num ${toneCls(b.balance)}`}>
                        {rupiah(b.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>TOTAL</td>
                    <td className="keu-r">{rupiah(p.cash)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

function toneCls(n: number): string {
  return n > 0 ? "keu-up" : n < 0 ? "keu-down" : "keu-dim-t";
}
