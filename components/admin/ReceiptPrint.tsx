"use client";

import { useEffect } from "react";
import Image from "next/image";
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
  nib: "NIB 1601260060842",
  address: "Kawasan Rasuna Epicentrum, Epiwalk Office Suite Lt. 5 Unit A501,\nKuningan, Setiabudi, Jakarta Selatan",
  phone: "021-22321146 · +62 811 1620 207",
  email: "sundaf.group@gmail.com",
};

export default function ReceiptPrint({ receipt }: { receipt: ReceiptData }) {
  useEffect(() => {
    window.print();
  }, []);

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          @page { size: A4; margin: 20mm; }
        }
        body { font-family: 'Arial', sans-serif; background: #f5f5f5; }
      `}</style>

      <div className="no-print fixed top-4 right-4 z-50">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-lg hover:bg-blue-700">
          🖨 Print / Simpan PDF
        </button>
        <button onClick={() => window.history.back()} className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium shadow-lg hover:bg-gray-300">
          ← Kembali
        </button>
      </div>

      <div className="min-h-screen flex items-start justify-center p-8 bg-gray-100">
        <div className="w-full max-w-2xl bg-white shadow-xl" id="receipt">
          {/* Header */}
          <div className="flex items-start justify-between p-8 border-b-4 border-blue-600">
            <div>
              <Image src="/logo.png" alt="Sundaf Trip" width={160} height={48} className="h-12 w-auto mb-3" />
              <p className="text-xs text-gray-500 whitespace-pre-line">{COMPANY.address}</p>
              <p className="text-xs text-gray-500 mt-1">{COMPANY.phone}</p>
              <p className="text-xs text-gray-500">{COMPANY.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Bukti Pembayaran</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{receipt.receiptNo}</p>
              <p className="text-xs text-gray-500 mt-1">{formatDate(receipt.createdAt)}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                receipt.status === "PAID" ? "bg-green-100 text-green-700" :
                receipt.status === "DP" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {receipt.status === "PAID" ? "LUNAS" : receipt.status === "DP" ? "DOWN PAYMENT" : "BELUM BAYAR"}
              </span>
            </div>
          </div>

          {/* Company & Customer */}
          <div className="grid grid-cols-2 gap-6 px-8 py-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Perusahaan</p>
              <p className="font-bold text-gray-900">{COMPANY.name}</p>
              <p className="text-xs text-gray-500">{COMPANY.nib}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pelanggan</p>
              <p className="font-bold text-gray-900">{receipt.customerName}</p>
              {receipt.customerPhone && <p className="text-xs text-gray-500">{receipt.customerPhone}</p>}
              {receipt.customerEmail && <p className="text-xs text-gray-500">{receipt.customerEmail}</p>}
            </div>
          </div>

          {/* Tour Detail */}
          <div className="mx-8 border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Detail Pemesanan</p>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Paket Tour", receipt.tourTitle],
                  ["Tanggal Keberangkatan", receipt.tripDate ? formatDate(receipt.tripDate as Date) : "-"],
                  ["Jumlah Peserta", `${receipt.pax} orang`],
                  ["Metode Pembayaran", receipt.paymentMethod ?? "-"],
                  ["Tanggal Pembayaran", receipt.paymentDate ? formatDate(receipt.paymentDate as Date) : "-"],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2.5 text-gray-500 w-48">{label}</td>
                    <td className="px-4 py-2.5 text-gray-900 font-medium">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="mx-8 mb-6">
            <div className="bg-blue-600 text-white px-6 py-4 rounded-lg flex items-center justify-between">
              <p className="font-semibold text-lg">Total Pembayaran</p>
              <p className="text-2xl font-bold">{formatCurrency(receipt.amount)}</p>
            </div>
          </div>

          {/* Notes */}
          {receipt.notes && (
            <div className="mx-8 mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Catatan</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{receipt.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 px-8 py-4 flex items-center justify-between">
            <p className="text-xs text-gray-400">Dokumen ini diterbitkan secara elektronik oleh {COMPANY.name}</p>
            <p className="text-xs text-gray-400">sundaftrip.com</p>
          </div>
        </div>
      </div>
    </>
  );
}
