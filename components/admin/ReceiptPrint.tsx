"use client";

import { useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ReceiptData {
  receiptNo: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  tourTitle: string;
  tripDate?: string | Date;
  pax: number;
  amount: number;
  paymentMethod?: string;
  paymentDate?: string | Date;
  notes?: string;
  status: string;
  createdAt: Date;
}

const COMPANY = {
  name: "CV SUNDAF HOLIDAY GROUP",
  nib: "1601260060842",
  address: "Kawasan Rasuna Epicentrum, Epiwalk Office Suite Lt. 5 Unit A501, Kuningan, Setiabudi, Jakarta Selatan",
  phone: "021-22321146 · +62 811 1620 207",
  email: "sundaf.group@gmail.com",
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PAID: { label: "LUNAS", color: "#15803d" },
  DP: { label: "DOWN PAYMENT", color: "#b45309" },
  UNPAID: { label: "BELUM BAYAR", color: "#b91c1c" },
};

export default function ReceiptPrint({ receipt }: { receipt: ReceiptData }) {
  useEffect(() => {
    window.print();
  }, []);

  const status = STATUS_LABEL[receipt.status] ?? { label: receipt.status, color: "#374151" };

  const rows = [
    ["Paket Tour", receipt.tourTitle],
    ["Tanggal Keberangkatan", receipt.tripDate ? formatDate(receipt.tripDate as Date) : "-"],
    ["Jumlah Peserta", `${receipt.pax} orang`],
    ["Metode Pembayaran", receipt.paymentMethod ?? "-"],
    ["Tanggal Pembayaran", receipt.paymentDate ? formatDate(receipt.paymentDate as Date) : "-"],
  ] as [string, string][];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, Helvetica, sans-serif; background: #f3f4f6; }
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          @page { size: A4; margin: 15mm 20mm; }
        }
      `}</style>

      {/* Toolbar — hidden on print */}
      <div className="no-print" style={{ position: "fixed", top: 16, right: 16, zIndex: 50, display: "flex", gap: 8 }}>
        <button onClick={() => window.print()}
          style={{ padding: "8px 16px", background: "#2563eb", color: "white", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none" }}>
          🖨 Print / Simpan PDF
        </button>
        <button onClick={() => window.history.back()}
          style={{ padding: "8px 16px", background: "#e5e7eb", color: "#374151", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none" }}>
          ← Kembali
        </button>
      </div>

      {/* Page wrapper */}
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", padding: "48px 16px", background: "#f3f4f6" }}>
        <div style={{ width: "100%", maxWidth: 680, background: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "32px 40px 24px", borderBottom: "4px solid #2563eb" }}>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Sundaf Trip" style={{ height: 40, width: "auto", marginBottom: 10 }} />
              <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.6 }}>
                <div>{COMPANY.address}</div>
                <div style={{ marginTop: 2 }}>{COMPANY.phone}</div>
                <div>{COMPANY.email}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bukti Pembayaran</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb", marginTop: 4, letterSpacing: "-0.5px" }}>
                #{receipt.receiptNo}
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{formatDate(receipt.createdAt)}</div>
              <div style={{ marginTop: 8, display: "inline-block", padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: status.color, background: status.color + "18", border: `1px solid ${status.color}40` }}>
                {status.label}
              </div>
            </div>
          </div>

          {/* Company & Customer */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, padding: "24px 40px" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Perusahaan</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{COMPANY.name}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>NIB {COMPANY.nib}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Pelanggan</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{receipt.customerName}</div>
              {receipt.customerPhone && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{receipt.customerPhone}</div>}
              {receipt.customerEmail && <div style={{ fontSize: 11, color: "#6b7280" }}>{receipt.customerEmail}</div>}
            </div>
          </div>

          {/* Order Detail */}
          <div style={{ margin: "0 40px 24px" }}>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ background: "#f9fafb", padding: "10px 16px", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Detail Pemesanan</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <tbody>
                  {rows.map(([label, value], i) => (
                    <tr key={label} style={{ borderBottom: i < rows.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                      <td style={{ padding: "10px 16px", color: "#6b7280", width: 200 }}>{label}</td>
                      <td style={{ padding: "10px 16px", color: "#111827", fontWeight: 500 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div style={{ margin: "0 40px 24px" }}>
            <div style={{ background: "#2563eb", borderRadius: 10, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "white" }}>Total Pembayaran</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: "white" }}>{formatCurrency(receipt.amount)}</span>
            </div>
          </div>

          {/* Notes */}
          {receipt.notes && (
            <div style={{ margin: "0 40px 24px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Catatan</div>
              <div style={{ fontSize: 12, color: "#374151", background: "#f9fafb", padding: "10px 14px", borderRadius: 6 }}>{receipt.notes}</div>
            </div>
          )}

          {/* Footer */}
          <div style={{ borderTop: "1px solid #e5e7eb", padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#9ca3af" }}>Dokumen ini diterbitkan secara elektronik oleh {COMPANY.name}</span>
            <span style={{ fontSize: 10, color: "#9ca3af" }}>sundaftrip.com</span>
          </div>

        </div>
      </div>
    </>
  );
}
