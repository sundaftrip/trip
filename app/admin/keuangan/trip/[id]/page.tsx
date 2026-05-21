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
import {
  TripFinanceForm,
  ApproveExpenseButton,
  RejectExpenseButton,
} from "@/components/keuangan/forms";
import LinkTL from "@/components/keuangan/LinkTL";

export const dynamic = "force-dynamic";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getTripDetail(id);
  if (!data) notFound();
  const { trip, receipts, bills, ledger, finance, fieldExpenses, fieldPending, kasbonSisa, expenseToken } =
    data;
  const a = trip.agg;
  const STATUS_TONE: Record<string, "ok" | "warn" | "red"> = {
    APPROVED: "ok",
    PENDING: "warn",
    REJECTED: "red",
  };

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

      {/* status pengakuan akrual */}
      <Panel ticked className={trip.departed ? "" : ""}>
        <div style={{ fontSize: 11.5, lineHeight: 1.6 }}>
          {trip.departed ? (
            <>
              <b className="keu-up">SUDAH BERANGKAT.</b>{" "}
              <span className="keu-dim-t">
                Pendapatan & HPP trip ini sudah diakui di Laba Rugi. Laba sesungguhnya{" "}
                {rupiah(a.recognizedProfit)}.
              </span>
            </>
          ) : (
            <>
              <b className="keu-amber-t">BELUM BERANGKAT.</b>{" "}
              <span className="keu-dim-t">
                Uang peserta {rupiah(a.pesertaCashIn)} masih berstatus{" "}
                <b className="keu-amber-t">titipan (kewajiban)</b> — belum boleh dihitung
                sebagai laba. Pendapatan baru diakui saat trip berangkat.
              </span>
            </>
          )}
        </div>
      </Panel>

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginTop: 12 }}
      >
        <Stat k="Cash In" v={rupiah(a.cashIn)} tone="up" accent="var(--keu-green)" />
        <Stat k="Cash Out" v={rupiah(a.cashOut)} tone="down" accent="var(--keu-red)" />
        <Stat
          k="Arus Kas Bersih"
          v={rupiah(a.netCashFlow)}
          tone={autoTone(a.netCashFlow)}
          accent="var(--keu-cyan)"
          sub="Basis kas"
        />
        {trip.departed ? (
          <Stat
            k="Laba Diakui"
            v={rupiah(a.recognizedProfit)}
            tone={autoTone(a.recognizedProfit)}
            accent="var(--keu-orange)"
            sub="Pendapatan − HPP"
          />
        ) : (
          <Stat
            k="Titipan Peserta"
            v={rupiah(a.deferredRevenue)}
            tone="amber"
            accent="var(--keu-amber)"
            sub="Kewajiban, belum jadi laba"
          />
        )}
      </div>

      <Section title="Link Pelaporan TL" note="Untuk TL melapor pengeluaran dari lapangan" />
      <Panel pad ticked>
        <LinkTL tourId={trip.id} token={expenseToken} />
      </Panel>

      <Section
        title="Pengakuan Akrual"
        note={trip.departed ? "Trip sudah jalan" : "Menunggu keberangkatan"}
      />
      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
      >
        {trip.departed ? (
          <>
            <Stat
              k="Pendapatan Diakui"
              accent="var(--keu-green)"
              v={rupiah(a.recognizedRevenue)}
              tone="up"
              sub="Total ditagihkan ke peserta"
            />
            <Stat
              k="HPP Diakui"
              accent="var(--keu-red)"
              v={rupiah(a.recognizedHpp)}
              tone="down"
              sub="Total biaya trip"
            />
            <Stat
              k="Piutang Peserta"
              accent="var(--keu-cyan)"
              v={rupiah(a.arPeserta)}
              tone={a.arPeserta ? "cyan" : "faint"}
              sub="Peserta belum lunas"
            />
          </>
        ) : (
          <>
            <Stat
              k="Titipan Peserta (Kewajiban)"
              accent="var(--keu-amber)"
              v={rupiah(a.deferredRevenue)}
              tone="amber"
              sub="Akan jadi pendapatan saat berangkat"
            />
            <Stat
              k="Biaya Trip Ditangguhkan (Aset)"
              accent="var(--keu-cyan)"
              v={rupiah(a.wipCost)}
              tone={a.wipCost ? "cyan" : "faint"}
              sub="Akan jadi HPP saat berangkat"
            />
            <Stat
              k="Estimasi Laba Saat Berangkat"
              accent="var(--keu-orange)"
              v={rupiah(a.billedTotal - a.hppTotal)}
              tone={autoTone(a.billedTotal - a.hppTotal)}
              sub="Ditagihkan − biaya (belum final)"
            />
          </>
        )}
      </div>

      <Section title="Proyeksi vs Real" note="Finance vs Accounting" />
      <Panel pad={false} ticked>
        <table className="keu-table">
          <thead>
            <tr>
              <th>Metrik</th>
              <th className="keu-r">Proyeksi (Finance)</th>
              <th className="keu-r">Real Diakui</th>
              <th className="keu-r">Selisih</th>
            </tr>
          </thead>
          <tbody>
            {[
              { m: "Pendapatan", proj: a.projIncome, real: a.recognizedRevenue },
              { m: "HPP / Biaya", proj: a.projHpp, real: a.recognizedHpp },
              { m: "Laba", proj: a.projProfit, real: a.recognizedProfit },
            ].map((r) => (
              <tr key={r.m} className={r.m === "Laba" ? "keu-row-strong" : ""}>
                <td>{r.m}</td>
                <td className="keu-r keu-cyan-t">{rupiah(r.proj)}</td>
                <td className="keu-r">
                  {trip.departed ? (
                    rupiah(r.real)
                  ) : (
                    <span className="keu-faint-t" style={{ fontSize: 10 }}>
                      BELUM DIAKUI
                    </span>
                  )}
                </td>
                <td className="keu-r">
                  {trip.departed ? (
                    <SignedNum value={r.real - r.proj} />
                  ) : (
                    <span className="keu-faint-t">—</span>
                  )}
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
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 8 }}
      >
        <div>
          <Section title="Pemasukan Peserta" note={`${receipts.length} payment`} />
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
                        <Pill
                          tone={r.status === "PAID" ? "ok" : r.status === "DP" ? "warn" : "dim"}
                        >
                          {r.status}
                        </Pill>
                      </td>
                      <td className="keu-r keu-num keu-up">{rupiah(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2}>KAS DITERIMA</td>
                    <td className="keu-r">{rupiah(a.pesertaCashIn)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </Panel>
        </div>

        <div>
          <Section title="Biaya Vendor (HPP)" note={`${bills.length} tagihan`} />
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
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2}>TAGIHAN VENDOR · DIBAYAR</td>
                    <td className="keu-r">
                      {rupiah(a.vendorHpp)} · {rupiah(a.hppPaid)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </Panel>
        </div>
      </div>

      <Section
        title="Pengeluaran Lapangan"
        note={`${fieldExpenses.length} entri dari TL`}
      />
      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}
      >
        <Stat
          k="Kasbon Diberikan"
          v={rupiah(a.advanceOut)}
          tone="cyan"
          accent="var(--keu-cyan)"
          sub="Uang muka kerja ke TL"
        />
        <Stat
          k="Sudah Disetujui (HPP)"
          v={rupiah(a.fieldHpp)}
          tone="up"
          accent="var(--keu-green)"
          sub="Pengeluaran lapangan terverifikasi"
        />
        <Stat
          k="Menunggu Review"
          v={rupiah(fieldPending)}
          tone={fieldPending ? "amber" : "faint"}
          accent="var(--keu-amber)"
        />
        <Stat
          k="Sisa Kasbon TL"
          v={rupiah(kasbonSisa)}
          tone={autoTone(kasbonSisa)}
          accent="var(--keu-orange)"
          sub={
            kasbonSisa > 0
              ? "TL masih pegang / wajib kembalikan"
              : kasbonSisa < 0
                ? "Kantor wajib reimburse TL"
                : "Sudah lunas"
          }
        />
      </div>
      <Panel pad={false} ticked style={{ marginTop: 12 }}>
        {fieldExpenses.length === 0 ? (
          <Empty>BELUM ADA PENGELUARAN LAPANGAN DILAPORKAN</Empty>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="keu-table">
              <thead>
                <tr>
                  <th>Bukti</th>
                  <th>Pengeluaran</th>
                  <th>TL</th>
                  <th className="keu-r">Nominal</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {fieldExpenses.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <a href={f.photoUrl} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={f.photoUrl}
                          alt="bukti"
                          style={{
                            width: 42,
                            height: 42,
                            objectFit: "cover",
                            borderRadius: 3,
                            border: "1px solid var(--keu-line2)",
                            display: "block",
                          }}
                        />
                      </a>
                    </td>
                    <td>
                      <div>{f.category}</div>
                      <div style={{ fontSize: 9.5, color: "var(--keu-faint)" }}>
                        {fmtDate(f.date)}
                        {f.note ? ` · ${f.note}` : ""}
                      </div>
                    </td>
                    <td className="keu-dim-t">{f.submittedBy}</td>
                    <td className="keu-r keu-num">{rupiah(f.amount)}</td>
                    <td>
                      <Pill tone={STATUS_TONE[f.status] ?? "dim"}>{f.status}</Pill>
                    </td>
                    <td className="keu-r">
                      {f.status === "PENDING" ? (
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <ApproveExpenseButton id={f.id} />
                          <RejectExpenseButton id={f.id} />
                        </div>
                      ) : (
                        <span className="keu-faint-t" style={{ fontSize: 9 }}>
                          SELESAI
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
