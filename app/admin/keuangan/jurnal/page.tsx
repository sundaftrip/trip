import Link from "next/link";
import { getJurnalData } from "@/lib/keuangan/data";
import { rupiah, fmtDateTime } from "@/lib/keuangan/format";
import { PageHead, Section, Panel, Stat, Pill, Empty } from "@/components/keuangan/ui";
import { JurnalForm, DeleteEntryButton } from "@/components/keuangan/forms";
import TxnTable from "@/components/keuangan/TxnTable";

export const dynamic = "force-dynamic";

export default async function JurnalPage() {
  const d = await getJurnalData();
  const net = d.ledgerIn - d.ledgerOut;

  return (
    <>
      <PageHead
        crumb={
          <>
            <Link href="/admin/keuangan">TERMINAL</Link> / 08 — JURNAL MANUAL
          </>
        }
        title="Jurnal Manual"
        lede="Buku besar kas. Feed menggabungkan payment peserta, pelunasan vendor, dan entry manual. Catat transaksi non-trip di sini."
        actions={<JurnalForm banks={d.banks} tours={d.tours} />}
      />

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}
      >
        <Stat k="Total Baris Feed" v={d.txns.length} tone="dim" />
        <Stat k="Jurnal Manual / Vendor" v={d.ledgerCount} tone="cyan" accent="var(--keu-cyan)" />
        <Stat k="Cash In (Jurnal)" v={rupiah(d.ledgerIn)} tone="up" accent="var(--keu-green)" />
        <Stat k="Cash Out (Jurnal)" v={rupiah(d.ledgerOut)} tone="down" accent="var(--keu-red)" />
      </div>

      <Section title="Feed Transaksi" note="Gabungan semua sumber — read only" />
      <Panel pad ticked>
        <TxnTable txns={d.txns} />
      </Panel>

      <Section title="Entry Jurnal" note={`${d.entries.length} baris jurnal kas`} />
      <Panel pad={false} ticked>
        {d.entries.length === 0 ? (
          <Empty>BELUM ADA ENTRY JURNAL</Empty>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="keu-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Kategori</th>
                  <th>Arah</th>
                  <th className="keu-r">Nominal</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {d.entries.map((e) => (
                  <tr key={e.id}>
                    <td className="keu-faint-t" style={{ whiteSpace: "nowrap" }}>
                      {fmtDateTime(e.date)}
                    </td>
                    <td>
                      <div>{e.category}</div>
                      <div style={{ fontSize: 9.5, color: "var(--keu-faint)" }}>
                        {e.description || e.source}
                        {e.tourTitle ? ` · ${e.tourTitle}` : ""}
                      </div>
                    </td>
                    <td>
                      <Pill tone={e.direction === "IN" ? "ok" : "red"}>
                        {e.direction === "IN" ? "CASH IN" : "CASH OUT"}
                      </Pill>
                    </td>
                    <td
                      className={`keu-r keu-num ${e.direction === "IN" ? "keu-up" : "keu-down"}`}
                    >
                      {rupiah(e.amount)}
                    </td>
                    <td className="keu-r">
                      {e.locked ? (
                        <span className="keu-faint-t" style={{ fontSize: 9 }}>
                          ↳ VENDOR
                        </span>
                      ) : (
                        <DeleteEntryButton id={e.id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>NET JURNAL</td>
                  <td className={`keu-r ${autoToneCls(net)}`}>{rupiah(net)}</td>
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

function autoToneCls(n: number): string {
  return n > 0 ? "keu-up" : n < 0 ? "keu-down" : "keu-dim-t";
}
