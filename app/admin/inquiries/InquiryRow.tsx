"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, MessageCircle } from "lucide-react";

type Inquiry = {
  id: string;
  name: string;
  whatsapp: string;
  email: string | null;
  destination: string | null;
  travelDate: string | null;
  message: string | null;
  source: string | null;
  status: string;
  createdAt: string;
};

const STATUS_STYLE: Record<string, string> = {
  NEW: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  CONTACTED: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  CLOSED: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function waLink(num: string) {
  const digits = num.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? "62" + digits.slice(1) : digits.startsWith("62") ? digits : digits.startsWith("8") ? "62" + digits : digits;
  return `https://wa.me/${intl}`;
}

export default function InquiryRow({
  inquiry,
  statusLabel,
}: {
  inquiry: Inquiry;
  statusLabel: Record<string, string>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(inquiry.status);
  const [busy, setBusy] = useState(false);

  async function changeStatus(next: string) {
    setBusy(true);
    setStatus(next);
    await fetch(`/api/inquiries/${inquiry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    }).catch(() => {});
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Hapus lead dari ${inquiry.name}?`)) return;
    setBusy(true);
    await fetch(`/api/inquiries/${inquiry.id}`, { method: "DELETE" }).catch(() => {});
    setBusy(false);
    router.refresh();
  }

  const date = new Date(inquiry.createdAt).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <tr className="align-top text-gray-700 dark:text-gray-300">
      <td className="px-4 py-3">
        <div className="font-bold text-gray-900 dark:text-white">{inquiry.name}</div>
        <a href={waLink(inquiry.whatsapp)} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline">
          <MessageCircle size={12} /> {inquiry.whatsapp}
        </a>
        {inquiry.email && <div className="text-xs text-gray-400">{inquiry.email}</div>}
      </td>
      <td className="px-4 py-3">
        <div>{inquiry.destination || "—"}</div>
        {inquiry.travelDate && <div className="text-xs text-gray-400">{inquiry.travelDate}</div>}
      </td>
      <td className="px-4 py-3 max-w-xs">
        <p className="text-xs whitespace-pre-wrap break-words">{inquiry.message || "—"}</p>
        {inquiry.source && <p className="text-[10px] text-gray-400 mt-1">dari: {inquiry.source}</p>}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{date}</td>
      <td className="px-4 py-3">
        <select
          value={status}
          disabled={busy}
          onChange={(e) => changeStatus(e.target.value)}
          className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 cursor-pointer ${STATUS_STYLE[status] ?? ""}`}
        >
          {Object.entries(statusLabel).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 text-right">
        <button onClick={remove} disabled={busy}
          className="text-gray-400 hover:text-red-500 transition p-1" title="Hapus">
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}
