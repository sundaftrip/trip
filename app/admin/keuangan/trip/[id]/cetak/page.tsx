import "../../../cetak.css";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTripDetail, getCompanyName } from "@/lib/keuangan/data";
import { rupiah, fmtDate, fmtDateTime } from "@/lib/keuangan/format";
import CetakToolbar from "@/components/keuangan/CetakToolbar";

export const dynamic = "force-dynamic";

export default async function TripCetakPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, company, session] = await Promise.all([
    getTripDetail(id),
    getCompanyName(),
    auth(),
  ]);
  if (!data) notFound();
  const { trip, receipts, bills, fieldExpenses, fieldPending, kasbonSisa } = data;
  const a = trip.agg;
  const now = new Date();

  return (
    <div className="cetak">
      <CetakToolbar backHref={`/admin/keuangan/trip/${id}`} />

      <div className="cetak-doc">
        <div className="cetak-kop">
          <div>
            <div className="cetak-kop-co">{company}</div>
            <div className="cetak-kop-sub">Laporan Keuangan Internal</div>
          </div>
          <div className="cetak-kop-right">
            <div className="cetak-doctype">Datasheet Trip</div>
            <div className="cetak-docdate">Dicetak {fmtDate(now)}</div>
          </div>
        </div>

        <div className="cetak-title">
          {trip.code} — {trip.title}
        </div>
        <div className="cetak-subtitle">
          {trip.country}
          {trip.tripDate ? ` · Berangkat ${fmtDate(trip.tripDate)}` : ""} ·{" "}
          {trip.status.label}
        </div>

        <div className="cetak-meta">
          <div>
            <div className="cetak-meta-k">Status Akrual</div>
            <div className="cetak-meta-v">
              {trip.departed ? "Sudah Berangkat" : "Belum Berangkat"}
            </div>
          </div>
          <div>
            <div className="cetak-meta-k">Pax Terkonfirmasi</div>
            <div className="cetak-meta-v">{a.pax} pax</div>
          </div>
          <div>
            <div className="cetak-meta-k">Proyeksi Finance</div>
            <div className="cetak-meta-v">{trip.hasFinance ? "Tersedia" : "Belum di-set"}</div>
          </div>
          <div>
            <div className="cetak-meta-k">Arus Kas Bersih</div>
            <div className="cetak-meta-v">{rupiah(a.netCashFlow)}</div>
          </div>
        </div>

        {/* kartu ringkas */}
        <div className="cetak-cards">
          {trip.departed ? (
            <>
              <Card k="Pendapatan Diakui" v={rupiah(a.recognizedRevenue)} />
              <Card k="HPP Diakui" v={rupiah(a.recognizedHpp)} tone="down" />
              <Card
                k="Laba Diakui"
                v={rupiah(a.recognizedProfit)}
                tone={a.recognizedProfit >= 0 ? "up" : "down"}
              />
            </>
          ) : (
            <>
              <Card k="Titipan Peserta" v={rupiah(a.deferredRevenue)} />
              <Card k="Biaya Trip Ditangguhkan" v={rupiah(a.wipCost)} tone="down" />
              <Card
                k="Estimasi Laba"
                v={rupiah(a.billedTotal - a.hppTotal)}
                tone={a.billedTotal - a.hppTotal >= 0 ? "up" : "down"}
              />
            </>
          )}
        </div>

        {/* pemasukan peserta */}
        <div className="cetak-sec">Pemasukan Peserta</div>
        <table className="cetak-table">
          <thead>
            <tr>
              <th>Nama Peserta</th>
              <th>No. Receipt</th>
              <th>Status</th>
              <th className="cetak-r">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {receipts.length === 0 ? (
              <tr>
                <td colSpan={4} className="cetak-empty">
                  Belum ada pembayaran peserta.
                </td>
              </tr>
            ) : (
              receipts.map((r) => (
                <tr key={r.id}>
                  <td>{r.customerName}</td>
                  <td className="cetak-muted">{r.receiptNo}</td>
                  <td>{r.status}</td>
                  <td className="cetak-r">{rupiah(r.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Kas Diterima dari Peserta</td>
              <td className="cetak-r">{rupiah(a.pesertaCashIn)}</td>
            </tr>
          </tfoot>
        </table>

        {/* biaya vendor */}
        <div className="cetak-sec">Biaya Vendor (HPP)</div>
        <table className="cetak-table">
          <thead>
            <tr>
              <th>Keterangan</th>
              <th>Vendor</th>
              <th>Status</th>
              <th className="cetak-r">Nilai</th>
              <th className="cetak-r">Dibayar</th>
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 ? (
              <tr>
                <td colSpan={5} className="cetak-empty">
                  Belum ada tagihan vendor.
                </td>
              </tr>
            ) : (
              bills.map((b) => (
                <tr key={b.id}>
                  <td>{b.description}</td>
                  <td className="cetak-muted">{b.vendor.name}</td>
                  <td>{b.status}</td>
                  <td className="cetak-r">{rupiah(b.amount)}</td>
                  <td className="cetak-r cetak-muted">{rupiah(b.amountPaid)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Total Tagihan Vendor</td>
              <td className="cetak-r">{rupiah(a.vendorHpp)}</td>
              <td className="cetak-r">{rupiah(a.hppPaid)}</td>
            </tr>
          </tfoot>
        </table>

        {/* pengeluaran lapangan */}
        <div className="cetak-sec">Pengeluaran Lapangan (TL)</div>
        <table className="cetak-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kategori</th>
              <th>TL</th>
              <th>Status</th>
              <th className="cetak-r">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {fieldExpenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="cetak-empty">
                  Belum ada pengeluaran lapangan.
                </td>
              </tr>
            ) : (
              fieldExpenses.map((f) => (
                <tr key={f.id}>
                  <td className="cetak-muted">{fmtDate(f.date)}</td>
                  <td>{f.category}</td>
                  <td className="cetak-muted">{f.submittedBy}</td>
                  <td>{f.status}</td>
                  <td className="cetak-r">{rupiah(f.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}>Disetujui (masuk HPP)</td>
              <td className="cetak-r">{rupiah(a.fieldHpp)}</td>
            </tr>
          </tfoot>
        </table>

        {/* rekonsiliasi kasbon */}
        <div className="cetak-sec">Rekonsiliasi Kasbon TL</div>
        <table className="cetak-table">
          <tbody>
            <tr>
              <td>Kasbon diberikan ke TL</td>
              <td className="cetak-r">{rupiah(a.advanceOut)}</td>
            </tr>
            <tr>
              <td>Pengeluaran lapangan disetujui</td>
              <td className="cetak-r">{rupiah(a.fieldHpp)}</td>
            </tr>
            <tr>
              <td>Masih menunggu review</td>
              <td className="cetak-r cetak-muted">{rupiah(fieldPending)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>
                Sisa Kasbon{" "}
                {kasbonSisa > 0
                  ? "(TL wajib kembalikan)"
                  : kasbonSisa < 0
                    ? "(kantor wajib reimburse)"
                    : "(lunas)"}
              </td>
              <td className="cetak-r">{rupiah(kasbonSisa)}</td>
            </tr>
          </tfoot>
        </table>

        {/* proyeksi vs real */}
        <div className="cetak-sec">Proyeksi vs Real</div>
        <table className="cetak-table">
          <thead>
            <tr>
              <th>Metrik</th>
              <th className="cetak-r">Proyeksi (Finance)</th>
              <th className="cetak-r">Real Diakui</th>
              <th className="cetak-r">Selisih</th>
            </tr>
          </thead>
          <tbody>
            {[
              { m: "Pendapatan", proj: a.projIncome, real: a.recognizedRevenue },
              { m: "HPP / Biaya", proj: a.projHpp, real: a.recognizedHpp },
              { m: "Laba", proj: a.projProfit, real: a.recognizedProfit },
            ].map((r) => (
              <tr key={r.m}>
                <td>{r.m}</td>
                <td className="cetak-r">{rupiah(r.proj)}</td>
                <td className="cetak-r">
                  {trip.departed ? rupiah(r.real) : <span className="cetak-muted">belum diakui</span>}
                </td>
                <td className="cetak-r">
                  {trip.departed ? rupiah(r.real - r.proj) : <span className="cetak-muted">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="cetak-grandtotal">
          <span className="cetak-grandtotal-k">
            {trip.departed ? "Laba Diakui Trip" : "Estimasi Laba (belum final)"}
          </span>
          <span className="cetak-grandtotal-v">
            {rupiah(trip.departed ? a.recognizedProfit : a.billedTotal - a.hppTotal)}
          </span>
        </div>

        <div className="cetak-foot">
          <span>
            Dicetak oleh {session?.user?.name ?? "—"} · {fmtDateTime(now)}
          </span>
          <span>{company} — dokumen internal</span>
        </div>
      </div>
    </div>
  );
}

function Card({ k, v, tone }: { k: string; v: string; tone?: "up" | "down" }) {
  return (
    <div className="cetak-card">
      <div className="cetak-card-k">{k}</div>
      <div className={`cetak-card-v ${tone === "up" ? "cetak-up" : tone === "down" ? "cetak-down" : ""}`}>
        {v}
      </div>
    </div>
  );
}
