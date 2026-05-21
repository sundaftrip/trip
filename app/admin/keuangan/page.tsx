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
  Empty,
  autoTone,
} from "@/components/keuangan/ui";
import TxnTable from "@/components/keuangan/TxnTable";

export const dynamic = "force-dynamic";

const MODULES = [
  { idx: "02", href: "/admin/keuangan/trip", title: "Cashflow Trip", desc: "Real cash in/out & profit per trip — dibandingkan proyeksi Finance." },
  { idx: "03", href: "/admin/keuangan/posisi-kas", title: "Posisi Kas", desc: "Pisahkan uang titipan peserta vs uang yang sudah pasti milik perusahaan." },
  { idx: "04", href: "/admin/keuangan/laporan", title: "Laporan P&L", desc: "Profit & loss bulanan, arus kas, dan tren 6 bulan terakhir." },
  { idx: "05", href: "/admin/keuangan/neraca", title: "Neraca", desc: "Posisi aset, kewajiban, dan ekuitas perusahaan." },
  { idx: "06", href: "/admin/keuangan/bank", title: "Bank & Kas", desc: "Kelola rekening bank, kas tunai, dan e-wallet operasional." },
  { idx: "07", href: "/admin/keuangan/vendor", title: "Vendor & Hutang", desc: "Daftar vendor, tagihan, dan pelunasan hutang HPP." },
  { idx: "08", href: "/admin/keuangan/jurnal", title: "Jurnal Manual", desc: "Catat transaksi kas masuk/keluar non-trip secara manual." },
];

export default async function RingkasanPage() {
  const d = await getOverview();
  const t = d.totals;

  return (
    <>
      <PageHead
        crumb="TERMINAL / 01 — RINGKASAN"
        title="Ringkasan Akuntansi"
        lede="Posisi keuangan real-time perusahaan — disusun dari payment peserta, tagihan vendor, dan jurnal kas. Semua nilai IDR."
      />

      <Hero
        label="Real Uang Perusahaan"
        value={t.realUangPerusahaan}
        formula="REAL = SALDO BANK/KAS − HUTANG VENDOR · uang yang benar-benar milik perusahaan"
      />

      <div
        className="keu-statgrid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          marginTop: 12,
        }}
      >
        <Stat
          k="Total Saldo Bank/Kas"
          accent="var(--keu-cyan)"
          v={rupiah(t.saldoBankKas)}
          tone={autoTone(t.saldoBankKas)}
          sub={`${d.counts.banks} rekening aktif`}
        />
        <Stat
          k="Piutang Peserta"
          accent="var(--keu-amber)"
          v={rupiah(t.piutangPeserta)}
          tone="amber"
          sub="Tagihan peserta yang belum lunas"
        />
        <Stat
          k="Hutang Vendor"
          accent="var(--keu-red)"
          v={rupiah(t.hutangVendor)}
          tone="down"
          sub={`${d.counts.bills} tagihan tercatat`}
        />
        <Stat
          k="Net Equity"
          accent="var(--keu-orange)"
          v={rupiah(t.netEquity)}
          tone={autoTone(t.netEquity)}
          sub="Real uang + piutang peserta"
        />
      </div>

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: 12 }}
      >
        <Stat
          k="Arus Kas Bersih — Bulan Ini"
          v={rupiah(d.monthNet)}
          tone={autoTone(d.monthNet)}
          sub={<Delta value={d.monthNetGrowth} suffix="vs bulan lalu" />}
        />
        <Stat k="Trip Aktif" v={`${d.activeTrips} / ${d.counts.trips}`} tone="cyan" sub="Trip open selling" />
        <Stat k="Vendor Terdaftar" v={d.counts.vendors} tone="dim" sub="Mitra HPP" />
        <Stat
          k="Cash In Kumulatif"
          v={rupiah(t.totalCashIn)}
          tone="up"
          sub="Peserta + pemasukan manual"
        />
      </div>

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
                      <td className={`keu-r keu-num ${autoToneClass(b.balance)}`}>
                        {rupiah(b.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>TOTAL</td>
                    <td className="keu-r">{rupiah(t.saldoBankKas)}</td>
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

function autoToneClass(n: number): string {
  return n > 0 ? "keu-up" : n < 0 ? "keu-down" : "keu-dim-t";
}
