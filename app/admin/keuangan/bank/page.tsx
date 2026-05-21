import Link from "next/link";
import { getBankData } from "@/lib/keuangan/data";
import { rupiah } from "@/lib/keuangan/format";
import { PageHead, Section, Panel, Stat, Pill, Empty, autoTone } from "@/components/keuangan/ui";
import { BankForm, ArchiveBankButton } from "@/components/keuangan/forms";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  BANK: "Bank",
  CASH: "Kas Tunai",
  EWALLET: "E-Wallet",
};

export default async function BankPage() {
  const { banks, totalSaldo } = await getBankData();
  const active = banks.filter((b) => !b.archived);
  const archived = banks.filter((b) => b.archived);

  return (
    <>
      <PageHead
        crumb={
          <>
            <Link href="/admin/keuangan">TERMINAL</Link> / 06 — BANK & KAS
          </>
        }
        title="Bank & Kas"
        lede="Rekening bank, kas tunai, dan e-wallet operasional. Pembayaran peserta otomatis dialokasikan ke rekening utama."
        actions={<BankForm />}
      />

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}
      >
        <Stat
          k="Total Saldo Bank/Kas"
          accent="var(--keu-cyan)"
          v={rupiah(totalSaldo)}
          tone={autoTone(totalSaldo)}
        />
        <Stat k="Rekening Aktif" v={active.length} tone="dim" />
        <Stat k="Rekening Diarsipkan" v={archived.length} tone="faint" />
      </div>

      <Section title="Daftar Rekening" note={`${active.length} aktif`} />
      <Panel pad={false} ticked>
        {banks.length === 0 ? (
          <Empty>BELUM ADA REKENING — TAMBAH LEWAT TOMBOL DI ATAS</Empty>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="keu-table">
              <thead>
                <tr>
                  <th>Rekening</th>
                  <th>Tipe</th>
                  <th>No. Rekening</th>
                  <th className="keu-r">Saldo Awal</th>
                  <th className="keu-r">Saldo Terkini</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {banks.map((b) => (
                  <tr key={b.id} style={b.archived ? { opacity: 0.5 } : undefined}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {b.name}
                        {b.isPrimary && <Pill tone="cyan">UTAMA</Pill>}
                        {b.archived && <Pill tone="dim">ARSIP</Pill>}
                      </div>
                      {b.note && (
                        <div style={{ fontSize: 9.5, color: "var(--keu-faint)", marginTop: 2 }}>
                          {b.note}
                        </div>
                      )}
                    </td>
                    <td className="keu-dim-t">{KIND_LABEL[b.kind] ?? b.kind}</td>
                    <td className="keu-faint-t">{b.accountNo || "—"}</td>
                    <td className="keu-r keu-num keu-faint-t">{rupiah(b.openingBalance)}</td>
                    <td className={`keu-r keu-num ${autoToneClass(b.balance)}`}>
                      {rupiah(b.balance)}
                    </td>
                    <td className="keu-r">
                      <ArchiveBankButton id={b.id} archived={b.archived} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}>TOTAL SALDO</td>
                  <td className="keu-r">{rupiah(totalSaldo)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}

function autoToneClass(n: number): string {
  return n > 0 ? "keu-up" : n < 0 ? "keu-down" : "keu-dim-t";
}
