"use client";

/* Tombol WhatsApp mengambang, selalu terlihat saat scroll halaman panjang.
   Karena halaman publik bisa sangat panjang, CTA persistent ini penting buat
   konversi mobile. */
import { usePathname } from "next/navigation";
import WhatsAppIcon from "./WhatsAppIcon";
import { buildWhatsAppHref, toWaNumber } from "@/lib/utils";

const WA_MESSAGE = "Halo, saya ingin bertanya rute perjalanan bersama Sundaf Trip.";
const BILLY_WHATSAPP = "+7 916 889-64-71";

export default function StickyWhatsApp({
  phone,
  hideOnTourDetail = false,
}: {
  phone: string;
  hideOnTourDetail?: boolean;
}) {
  const pathname = usePathname();
  const isTourDetail = /^\/tours\/[^/]+\/?$/.test(pathname);
  const wa = toWaNumber(pathname === "/partner" ? BILLY_WHATSAPP : phone);
  if (!wa || (hideOnTourDetail && isTourDetail)) return null;
  const href = buildWhatsAppHref(wa, WA_MESSAGE);
  return (
    <aside
      aria-label="Akses cepat WhatsApp"
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50"
      data-sticky-whatsapp
    >
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label="Tanya rute via WhatsApp"
        className="flex h-12 w-12 items-center justify-center gap-2 rounded-full text-white text-sm font-semibold shadow-lg shadow-black/25 transition hover:scale-105 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:w-auto sm:pl-3 sm:pr-4 sm:h-14"
        style={{ background: "#075E54" }}
      >
        <WhatsAppIcon width="22" height="22" />
        <span className="hidden sm:inline">Tanya rute</span>
      </a>
    </aside>
  );
}
