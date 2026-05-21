import Link from "next/link";
import { getJurnalData } from "@/lib/keuangan/data";
import { rupiah, fmtDateTime } from "@/lib/keuangan/format";
import { PageHead, Section, Panel, Stat, Pill, Empty } from "@/components/keuangan/ui";
import { JurnalForm, VoidEntryButton } from "@/components/keuangan/forms";
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
        lede="Buku besar kas. Koreksi transaksi salah dengan VOID — entry tetap tersimpan untuk jejak audit, tidak pernah dihapus permanen."
        actions={<JurnalForm banks={d.banks} tours={d.tours} />}
      />

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
      >
        <Stat k="Entry Aktif" v={d.ledgerCount} tone="cyan" accent="var(--keu-cyan)" />
        <Stat k="Entry Di-void" v={d.voidedCount} tone={d.voidedCount ? "amber" : "faint"} />
        <Stat k="Cash In (Jurnal)" v={rupiah(d.ledgerIn)} tone="up" accent="var(--keu-green)" />
        <Stat k="Cash Out (Jurnal)" v={rupiah(d.ledgerOut)} tone="down" accent="var(--keu-red)" />
      </div>

      <Section title="Feed Transaksi" note="Gabungan semua sumber — read only" />
      <Panel pad ticked>
        <TxnTable txns={d.txns} />
      </Panel>

      <Section title="Entry Jurnal" note={`${d.ledgerCount} aktif · ${d.voidedCount} void`} />
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
                  <tr key={e.id} style={e.voided ? { opacity: 0.45 } : undefined}>
                    <td className="keu-faint-t" style={{ whiteSpace: "nowrap" }}>
                      {fmtDateTime(e.date)}
                    </td>
                    <td>
                      <div style={e.voided ? { textDecoration: "line-through" } : undefined}>
                        {e.category}
                      </div>
                      <div style={{ fontSize: 9.5, color: "var(--keu-faint)" }}>
                        {e.description || e.source}
                        {e.tourTitle ? ` · ${e.tourTitle}` : ""}
                      </div>
                    </td>
                    <td>
                      {e.voided ? (
                        <Pill tone="dim">VOID</Pill>
                      ) : (
                        <Pill tone={e.direction === "IN" ? "ok" : "red"}>
                          {e.direction === "IN" ? "CASH IN" : "CASH OUT"}
                        </Pill>
                      )}
                    </td>
                    <td
                      className={`keu-r keu-num ${
                        e.voided
                          ? "keu-faint-t"
                          : e.direction === "IN"
                            ? "keu-up"
                            : "keu-down"
                      }`}
                      style={e.voided ? { textDecoration: "line-through" } : undefined}
                    >
                      {rupiah(e.amount)}
                    </td>
                    <td className="keu-r">
                      {e.voided ? (
                        <span className="keu-faint-t" style={{ fontSize: 9 }}>
                          DIBATALKAN
                        </span>
                      ) : (
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          {e.locked && (
                            <span className="keu-faint-t" style={{ fontSize: 9, alignSelf: "center" }}>
                              ↳ VENDOR
                            </span>
                          )}
                          <VoidEntryButton id={e.id} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>NET JURNAL (AKTIF)</td>
                  <td className={`keu-r ${net > 0 ? "keu-up" : net < 0 ? "keu-down" : "keu-dim-t"}`}>
                    {rupiah(net)}
                  </td>
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
