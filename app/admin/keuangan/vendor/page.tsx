import Link from "next/link";
import { getVendorData } from "@/lib/keuangan/data";
import { rupiah, fmtDate, foreignAmount, fxNote } from "@/lib/keuangan/format";
import { PageHead, Section, Panel, Stat, Pill, Empty } from "@/components/keuangan/ui";
import { VendorForm, VendorBillForm, PayBillForm } from "@/components/keuangan/forms";

export const dynamic = "force-dynamic";

const CAT_LABEL: Record<string, string> = {
  AIRLINE: "Maskapai",
  HOTEL: "Hotel",
  LAND_OPERATOR: "Land Op",
  VISA: "Visa",
  TRANSPORT: "Transport",
  INSURANCE: "Asuransi",
  GUIDE: "Guide",
  OTHER: "Lainnya",
};

export default async function VendorPage() {
  const d = await getVendorData();

  return (
    <>
      <PageHead
        crumb={
          <>
            <Link href="/admin/keuangan">TERMINAL</Link> / 07 — VENDOR & HUTANG
          </>
        }
        title="Vendor & Hutang"
        lede="Mitra HPP — maskapai, hotel, land operator. Catat tagihan dan lunasi hutang; pelunasan otomatis tercatat sebagai cash out di jurnal."
      />

      <div
        className="keu-statgrid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}
      >
        <Stat k="Total Tagihan" accent="var(--keu-cyan)" v={rupiah(d.totalTagihan)} tone="cyan" />
        <Stat k="Sudah Dibayar" accent="var(--keu-green)" v={rupiah(d.totalDibayar)} tone="up" />
        <Stat
          k="Hutang Vendor Outstanding"
          accent="var(--keu-red)"
          v={rupiah(d.totalHutang)}
          tone="down"
        />
        <Stat k="Vendor Terdaftar" v={d.vendors.length} tone="dim" />
      </div>

      <Section title="Aksi Vendor" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <VendorForm />
        <VendorBillForm vendors={d.vendors} tours={d.tours} />
        <PayBillForm bills={d.unpaidBills} banks={d.banks} />
      </div>

      <Section title="Daftar Vendor" note={`${d.vendors.length} mitra`} />
      <Panel pad={false} ticked>
        {d.vendors.length === 0 ? (
          <Empty>BELUM ADA VENDOR</Empty>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="keu-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Kategori</th>
                  <th className="keu-r">Tagihan</th>
                  <th className="keu-r">Total</th>
                  <th className="keu-r">Dibayar</th>
                  <th className="keu-r">Hutang</th>
                </tr>
              </thead>
              <tbody>
                {d.vendors.map((v) => (
                  <tr key={v.id}>
                    <td>
                      {v.name}
                      {v.contact && (
                        <div style={{ fontSize: 9.5, color: "var(--keu-faint)" }}>{v.contact}</div>
                      )}
                    </td>
                    <td>
                      <Pill tone="dim">{CAT_LABEL[v.category] ?? v.category}</Pill>
                    </td>
                    <td className="keu-r keu-dim-t">{v.billCount}</td>
                    <td className="keu-r keu-num">{rupiah(v.total)}</td>
                    <td className="keu-r keu-num keu-faint-t">{rupiah(v.paid)}</td>
                    <td className={`keu-r keu-num ${v.outstanding > 0 ? "keu-down" : "keu-up"}`}>
                      {rupiah(v.outstanding)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Section title="Tagihan / Hutang Vendor" note={`${d.bills.length} tagihan`} />
      <Panel pad={false} ticked>
        {d.bills.length === 0 ? (
          <Empty>BELUM ADA TAGIHAN VENDOR</Empty>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="keu-table">
              <thead>
                <tr>
                  <th>Tagihan</th>
                  <th>Trip</th>
                  <th>Status</th>
                  <th className="keu-r">Nilai</th>
                  <th className="keu-r">Dibayar</th>
                  <th className="keu-r">Sisa</th>
                  <th>Jatuh Tempo</th>
                </tr>
              </thead>
              <tbody>
                {d.bills.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        {b.description}
                        {b.isDeposit && <Pill tone="warn">DEPOSIT</Pill>}
                      </div>
                      <div style={{ fontSize: 9.5, color: "var(--keu-faint)" }}>
                        {b.vendorName} · {CAT_LABEL[b.vendorCategory] ?? b.vendorCategory}
                      </div>
                    </td>
                    <td className="keu-dim-t">{b.tourTitle ?? "—"}</td>
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
                      {b.currency !== "IDR" && (
                        <div style={{ fontSize: 9.5, color: "var(--keu-cyan)" }}>
                          {foreignAmount(b.amount, b.currency, b.fxRate)} ·{" "}
                          {fxNote(b.currency, b.fxRate)}
                        </div>
                      )}
                    </td>
                    <td className="keu-r keu-num keu-faint-t">{rupiah(b.amountPaid)}</td>
                    <td className={`keu-r keu-num ${b.outstanding > 0 ? "keu-down" : "keu-up"}`}>
                      {rupiah(b.outstanding)}
                    </td>
                    <td className="keu-faint-t">{b.dueDate ? fmtDate(b.dueDate) : "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>TOTAL</td>
                  <td className="keu-r">{rupiah(d.totalTagihan)}</td>
                  <td className="keu-r keu-faint-t">{rupiah(d.totalDibayar)}</td>
                  <td className="keu-r keu-down">{rupiah(d.totalHutang)}</td>
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
