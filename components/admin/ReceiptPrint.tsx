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
  pricingBreakdown?: unknown;
  notes?: string;
  status: string;
  createdAt: Date;
}

interface CompanyInfo {
  name?: string;
  legalName?: string;
  nib?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PAID: { label: "LUNAS", color: "#15803d" },
  DP: { label: "DOWN PAYMENT", color: "#b45309" },
  UNPAID: { label: "BELUM BAYAR", color: "#b91c1c" },
};

type ReceiptPricingItem = { name: string; quantity: number; unitPrice: number; discount: number };
type ReceiptPricingBreakdown = { items: ReceiptPricingItem[]; subtotal: number; globalDiscount: number; total: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function parsePricingBreakdown(value: unknown): ReceiptPricingBreakdown {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    return { items: [], subtotal: 0, globalDiscount: 0, total: 0 };
  }

  const items = value.items.flatMap((item) => {
    if (!isRecord(item)) return [];
    const name = typeof item.name === "string" ? item.name.trim() : "";
    const quantity = readNumber(item.quantity);
    const unitPrice = readNumber(item.unitPrice);
    const discount = readNumber(item.discount);
    if (!name || quantity <= 0) return [];
    return [{ name, quantity, unitPrice, discount }];
  });
  const subtotal = items.reduce(
    (sum, item) => sum + Math.max(0, item.quantity * item.unitPrice - item.discount),
    0
  );
  const globalDiscount = readNumber(value.globalDiscount);
  const total = Math.max(0, subtotal - globalDiscount);

  return { items, subtotal, globalDiscount, total };
}

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toLocaleString("id-ID");
}

export default function ReceiptPrint({ receipt, company }: { receipt: ReceiptData; company: CompanyInfo }) {
  useEffect(() => { window.print(); }, []);

  const status = STATUS_LABEL[receipt.status] ?? { label: receipt.status, color: "#374151" };
  const pricing = parsePricingBreakdown(receipt.pricingBreakdown);
  const noteItems = (receipt.notes ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const legalEntityName = company.legalName || "CV Sundaf Holiday Group";
  const brandName = company.name || "Sundaf Trip";

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
        html, body { margin: 0; min-height: 100%; }
        body { font-family: Arial, Helvetica, sans-serif; background: #f3f4f6; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print {
          @page { size: A4; margin: 0; }
          html, body {
            width: 210mm !important;
            min-height: 297mm !important;
            background: white !important;
          }
          .no-print { display: none !important; }
          body * { visibility: hidden !important; }
          #receipt-print, #receipt-print * { visibility: visible !important; }
          #receipt-print {
            position: fixed !important;
            inset: 0 !important;
            display: block !important;
            width: 210mm !important;
            min-height: 297mm !important;
            padding: 0 !important;
            background: white !important;
          }
          .receipt-card {
            width: 210mm !important;
            min-height: 297mm !important;
            max-width: 100% !important;
            box-shadow: none !important;
            margin: 0 !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .receipt-footer {
            margin-top: auto !important;
          }
        }
      `}</style>

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

      <div id="receipt-print" style={{ minHeight: "100vh", display: "flex", justifyContent: "center", padding: "24px 12px", background: "#f3f4f6" }}>
        <div className="receipt-card" style={{ width: "100%", maxWidth: 760, background: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, padding: "22px 34px 18px", borderBottom: "3px solid #2563eb" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={company.logo || "/logo.png"} alt={brandName} style={{ height: 34, width: "auto", marginBottom: 8 }} />
              <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.45, maxWidth: 360 }}>
                <div style={{ fontWeight: 700, color: "#111827" }}>{legalEntityName}</div>
                <div>Trading as {brandName}</div>
                {company.address && <div>{company.address}</div>}
                {company.phone && <div style={{ marginTop: 2 }}>{company.phone}</div>}
                {company.email && <div>{company.email}</div>}
              </div>
            </div>
            <div style={{ textAlign: "right", minWidth: 168 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bukti Pembayaran</div>
              <div style={{ fontSize: 18, lineHeight: 1.15, fontWeight: 800, color: "#2563eb", marginTop: 5, letterSpacing: 0, whiteSpace: "nowrap" }}>
                #{receipt.receiptNo}
              </div>
              <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>{formatDate(receipt.createdAt)}</div>
              <div style={{ marginTop: 7, display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, color: status.color, background: status.color + "18", border: `1px solid ${status.color}40` }}>
                {status.label}
              </div>
            </div>
          </div>

          {/* Company & Customer */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: "18px 34px" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Perusahaan</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{legalEntityName}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Trading as {brandName}</div>
              {company.nib && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>NIB {company.nib}</div>}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Pelanggan</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{receipt.customerName}</div>
              {receipt.customerPhone && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{receipt.customerPhone}</div>}
              {receipt.customerEmail && <div style={{ fontSize: 11, color: "#6b7280" }}>{receipt.customerEmail}</div>}
            </div>
          </div>

          {/* Order Detail */}
          <div style={{ margin: "0 34px 20px" }}>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ background: "#f9fafb", padding: "9px 14px", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Detail Pemesanan</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <tbody>
                  {rows.map(([label, value], i) => (
                    <tr key={label} style={{ borderBottom: i < rows.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                      <td style={{ padding: "9px 14px", color: "#6b7280", width: 190 }}>{label}</td>
                      <td style={{ padding: "9px 14px", color: "#111827", fontWeight: 500 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pricing.items.length > 0 && (
            <div style={{ margin: "0 34px 18px" }}>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ background: "#f9fafb", padding: "9px 14px", borderBottom: "1px solid #e5e7eb" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Rincian Pembayaran</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
                  <thead>
                    <tr style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb" }}>
                      <th style={{ padding: "8px 10px", color: "#6b7280", textAlign: "left", fontWeight: 700 }}>Item</th>
                      <th style={{ padding: "8px 8px", color: "#6b7280", textAlign: "right", fontWeight: 700, width: 42 }}>Qty</th>
                      <th style={{ padding: "8px 8px", color: "#6b7280", textAlign: "right", fontWeight: 700, width: 86 }}>Harga</th>
                      <th style={{ padding: "8px 6px", color: "#6b7280", textAlign: "right", fontWeight: 700, width: 54 }}>Diskon</th>
                      <th style={{ padding: "8px 10px", color: "#6b7280", textAlign: "right", fontWeight: 700, width: 90 }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricing.items.map((item, index) => {
                      const lineTotal = Math.max(0, item.quantity * item.unitPrice - item.discount);
                      return (
                        <tr key={`${item.name}-${index}`} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "8px 10px", color: "#111827", fontWeight: 600, lineHeight: 1.35 }}>{item.name}</td>
                          <td style={{ padding: "8px 8px", color: "#374151", textAlign: "right" }}>{formatQuantity(item.quantity)}</td>
                          <td style={{ padding: "8px 8px", color: "#374151", textAlign: "right", whiteSpace: "nowrap" }}>{formatCurrency(item.unitPrice)}</td>
                          <td style={{ padding: "8px 6px", color: item.discount > 0 ? "#b91c1c" : "#9ca3af", textAlign: "right", whiteSpace: "nowrap" }}>
                            {item.discount > 0 ? `- ${formatCurrency(item.discount)}` : "-"}
                          </td>
                          <td style={{ padding: "8px 10px", color: "#111827", textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>{formatCurrency(lineTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} style={{ padding: "8px 10px", color: "#6b7280", textAlign: "right", fontWeight: 700 }}>Subtotal</td>
                      <td style={{ padding: "8px 10px", color: "#111827", textAlign: "right", fontWeight: 800, whiteSpace: "nowrap" }}>{formatCurrency(pricing.subtotal)}</td>
                    </tr>
                    {pricing.globalDiscount > 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: "8px 10px", color: "#b91c1c", textAlign: "right", fontWeight: 700 }}>Diskon Tambahan</td>
                        <td style={{ padding: "8px 10px", color: "#b91c1c", textAlign: "right", fontWeight: 800, whiteSpace: "nowrap" }}>- {formatCurrency(pricing.globalDiscount)}</td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Total */}
          <div style={{ margin: "0 34px 20px" }}>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderLeft: "4px solid #2563eb", borderRadius: 8, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>Total Pembayaran</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#1d4ed8", whiteSpace: "nowrap" }}>{formatCurrency(receipt.amount)}</span>
            </div>
          </div>

          {noteItems.length > 0 && (
            <div style={{ margin: "0 34px 20px" }}>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ background: "#f9fafb", padding: "8px 14px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Catatan Pembayaran</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af" }}>{noteItems.length} poin</span>
                </div>
                <div>
                  {noteItems.map((note, index) => (
                    <div key={`${note}-${index}`} style={{ display: "flex", gap: 10, padding: "9px 14px", borderBottom: index < noteItems.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                      <span style={{ flex: "0 0 auto", minWidth: 22, height: 20, borderRadius: 999, border: "1px solid #d1d5db", color: "#6b7280", fontSize: 9, fontWeight: 700, lineHeight: "18px", textAlign: "center" }}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span style={{ minWidth: 0, fontSize: 11, lineHeight: 1.55, color: "#374151", overflowWrap: "anywhere" }}>
                        {note}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="receipt-footer" style={{ borderTop: "1px solid #e5e7eb", padding: "12px 34px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 10, color: "#9ca3af" }}>Dokumen ini diterbitkan secara elektronik oleh {legalEntityName}, Trading as {brandName}</span>
            <span style={{ fontSize: 10, color: "#9ca3af" }}>{company.website ?? ""}</span>
          </div>

        </div>
      </div>
    </>
  );
}
