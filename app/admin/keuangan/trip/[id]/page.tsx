import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripDetail } from "@/lib/keuangan/data";
import { rupiah, fmtDate, foreignAmount, fxNote } from "@/lib/keuangan/format";
import {
  PageHead,
  Section,
  Panel,
  Stat,
  Pill,
  Empty,
  SignedNum,
  autoTone,
} from "@/components/keuangan/ui";
import { TripFinanceForm } from "@/components/keuangan/forms";

export const dynamic = "force-dynamic";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getTripDetail(id);
  if (!data) notFound();
  const { trip, receipts, bills, ledger, finance } = data;
  const a = trip.agg;
  const c = trip.cash;

  const pnl = [
    { metric: "Income", proj: a.projIncome, real: a.realCashIn },
    { metric: "HPP / Cost", proj: a.projHpp, real: a.realCashOut },
    { metric: "Profit", proj: a.projProfit, real: a.realProfit },
  ];

  return (
    <>
      <PageHead
        crumb={
          <>
            <Link href="/admin/keuangan">TERMINAL</Link> /{" "}
            <Link href="/admin/keuangan/trip">CASHFLOW TRIP</Link> / {trip.code}
          </>
        }
        title={trip.title}
        lede={`${trip.country.toUpperCase()}${trip.tripDate ? ` · Berangkat ${fmtDate(trip.tripDate)}` : ""} · ${a.pax} pax terkonfirmasi`}
        actions={<Pill tone={trip.status.tone}>{trip.status.label}</Pill>}
      />

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <Stat k="Real Cash In" v={rupiah(a.realCashIn)} tone="up" accent="var(--keu-green)" />
        <Stat k="Real Cash Out" v={rupiah(a.realCashOut)} tone="down" accent="var(--keu-red)" />
        <Stat
          k="Net Real Profit"
          v={rupiah(a.realProfit)}
          tone={autoTone(a.realProfit)}
          accent="var(--keu-orange)"
        />
        <Stat
          k="Proyeksi Profit"
          v={trip.hasFinance ? rupiah(a.projProfit) : "BELUM DI-SET"}
          tone={trip.hasFinance ? autoTone(a.projProfit) : "faint"}
          accent="var(--keu-cyan)"
        />
      </div>

      <Section
        title="Klasifikasi Uang Saat Ini"
        note="Ke mana cash trip ini sebenarnya milik"
      />
      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
      >
        <Stat
          k="Titipan (Untuk Vendor)"
          accent="var(--keu-amber)"
          v={rupiah(c.titipan)}
          tone="amber"
          sub="Wajib disetor ke vendor — HPP belum lunas"
        />
        <Stat
          k="Cicilan Mengendap"
          accent="var(--keu-cyan)"
          v={rupiah(c.mengendap)}
          tone={c.mengendap ? "cyan" : "faint"}
          sub={a.hasProjection ? "Proyeksi sudah dikunci" : "HPP proyeksi BELUM di-set Finance"}
        />
        <Stat
          k="Margin Locked"
          accent="var(--keu-green)"
          v={rupiah(c.marginLocked)}
          tone={a.hasProjection ? autoTone(c.marginLocked) : "faint"}
          sub={a.hasProjection ? "Sudah pasti milik perusahaan" : "Belum bisa dihitung"}
        />
      </div>

      <Section title="Proyeksi vs Real" note="Finance vs Accounting" />
      <Panel pad={false} ticked>
        <table className="keu-table">
          <thead>
            <tr>
              <th>Metrik</th>
              <th className="keu-r">Proyeksi (Finance)</th>
              <th className="keu-r">Real (Accounting)</th>
              <th className="keu-r">Selisih</th>
            </tr>
          </thead>
          <tbody>
            {pnl.map((r) => (
              <tr key={r.metric} className={r.metric === "Profit" ? "keu-row-strong" : ""}>
                <td>{r.metric}</td>
                <td className="keu-r keu-cyan-t">{rupiah(r.proj)}</td>
                <td className="keu-r">{rupiah(r.real)}</td>
                <td className="keu-r">
                  <SignedNum value={r.real - r.proj} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <div style={{ marginTop: 12 }}>
        <TripFinanceForm
          tourId={trip.id}
          current={
            finance
              ? {
                  sellingPrice: finance.sellingPrice,
                  targetPax: finance.targetPax,
                  projHpp: finance.projHpp,
                  status: finance.status,
                  note: finance.note,
                }
              : null
          }
        />
      </div>

      <div
        className="keu-2col"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginTop: 8,
        }}
      >
        <div>
          <Section title="Real Cash In" note={`${receipts.length} payment peserta`} />
          <Panel pad={false} ticked>
            {receipts.length === 0 ? (
              <Empty>BELUM ADA PAYMENT PESERTA</Empty>
            ) : (
              <table className="keu-table">
                <tbody>
                  {receipts.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div>{r.customerName}</div>
                        <div style={{ fontSize: 9.5, color: "var(--keu-faint)" }}>
                          {r.receiptNo} · {r.pax} pax
                        </div>
                      </td>
                      <td>
                        <Pill tone={r.status === "PAID" ? "ok" : r.status === "DP" ? "warn" : "dim"}>
                          {r.status}
                        </Pill>
                      </td>
                      <td className="keu-r keu-num keu-up">{rupiah(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2}>CASH IN PESERTA</td>
                    <td className="keu-r">{rupiah(a.pesertaCashIn)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </Panel>
        </div>

        <div>
          <Section title="Real Cash Out" note={`${bills.length} tagihan vendor`} />
          <Panel pad={false} ticked>
            {bills.length === 0 && ledger.filter((l) => l.direction === "OUT").length === 0 ? (
              <Empty>BELUM ADA HPP / PENGELUARAN</Empty>
            ) : (
              <table className="keu-table">
                <tbody>
                  {bills.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div>{b.description}</div>
                        <div style={{ fontSize: 9.5, color: "var(--keu-faint)" }}>
                          {b.isDeposit ? "DEPOSIT" : "HPP"}
                          {b.currency !== "IDR"
                            ? ` · ${foreignAmount(b.amount, b.currency, b.fxRate)} · ${fxNote(b.currency, b.fxRate)}`
                            : " · vendor"}
                        </div>
                      </td>
                      <td>
                        <Pill
                          tone={
                            b.status === "PAID" ? "ok" : b.status === "PARTIAL" ? "warn" : "red"
                          }
                        >
                          {b.status}
                        </Pill>
                      </td>
                      <td className="keu-r keu-num">
                        <div>{rupiah(b.amount)}</div>
                        <div style={{ fontSize: 9.5, color: "var(--keu-faint)" }}>
                          lunas {rupiah(b.amountPaid)}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {ledger
                    .filter((l) => l.direction === "OUT" && !l.vendorBillId)
                    .map((l) => (
                      <tr key={l.id}>
                        <td>
                          <div>{l.category}</div>
                          <div style={{ fontSize: 9.5, color: "var(--keu-faint)" }}>
                            {l.description || "entry manual"}
                          </div>
                        </td>
                        <td>
                          <Pill tone="dim">MANUAL</Pill>
                        </td>
                        <td className="keu-r keu-num keu-down">{rupiah(l.amount)}</td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2}>HPP TOTAL · LUNAS</td>
                    <td className="keu-r">
                      {rupiah(a.hppTotal)} · {rupiah(a.hppLunas)}
                    </td>
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
