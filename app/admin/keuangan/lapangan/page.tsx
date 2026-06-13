import Link from "next/link";
import { getLapanganData } from "@/lib/keuangan/data";
import { rupiah } from "@/lib/keuangan/format";
import { PageHead, Section, Panel, Stat, autoTone } from "@/components/keuangan/ui";
import ExpenseQueue from "@/components/keuangan/ExpenseQueue";

export const dynamic = "force-dynamic";

export default async function LapanganPage() {
  const d = await getLapanganData();

  return (
    <>
      <PageHead
        crumb={
          <>
            <Link href="/admin/keuangan">TERMINAL</Link> / 09 — PENGELUARAN LAPANGAN
          </>
        }
        title="Pengeluaran Lapangan"
        lede="Pengeluaran yang dilaporkan TL dari lapangan lewat link bertoken. Verifikasi fotonya, lalu approve — pengeluaran yang disetujui otomatis jadi HPP trip."
      />

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <Stat
          k="Menunggu Review"
          accent="var(--keu-amber)"
          v={`${d.pendingCount} entri`}
          tone={d.pendingCount ? "amber" : "faint"}
          sub={`Senilai ${rupiah(d.pendingTotal)}`}
        />
        <Stat
          k="Sudah Disetujui"
          accent="var(--keu-green)"
          v={rupiah(d.approvedTotal)}
          tone="up"
          sub="Masuk HPP trip"
        />
        <Stat
          k="Total Kasbon Keluar"
          accent="var(--keu-cyan)"
          v={rupiah(d.advanceTotal)}
          tone="cyan"
          sub="Uang muka kerja ke TL"
        />
        <Stat
          k="Uang Muka TL (Belum Dipertanggungjawabkan)"
          accent="var(--keu-orange)"
          v={rupiah(d.uangMukaTL)}
          tone={autoTone(d.uangMukaTL)}
          sub="Kasbon − pengeluaran disetujui"
        />
      </div>

      <Section title="Antrian Pengeluaran" note={`${d.rows.length} total`} />
      <Panel pad ticked>
        <ExpenseQueue rows={d.rows} />
      </Panel>

      <Panel pad ticked style={{ marginTop: 14 }}>
        <div style={{ fontSize: 10.5, color: "var(--keu-dim)", lineHeight: 1.7 }}>
          <b className="keu-accent">CARA KERJA.</b> Buka halaman trip → &quot;Buat Link TL&quot; →
          kirim link ke TL via WhatsApp. TL foto tiap struk dan submit lewat link itu
          (tanpa login). Pengeluaran masuk sini berstatus MENUNGGU. Verifikasi fotonya,
          lalu APPROVE — nominalnya langsung jadi HPP trip dan mengurangi sisa kasbon TL.
          Yang tidak wajar → TOLAK.
        </div>
      </Panel>
    </>
  );
}
