import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "#0d2018", color: "#9ca3af" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Image src="/logo-white.png" alt="Sundaf Trip" width={140} height={42} className="h-9 w-auto mb-4" />
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              CV Sundaf Holiday Group — Mitra perjalanan wisata religi dan halal terpercaya Anda.
            </p>
            <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.25)" }}>NIB 1601260060842</p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Navigasi</h3>
            <ul className="space-y-2.5 text-sm">
              {[["Beranda", "/"], ["Paket Tour", "/tours"], ["Blog", "/blog"], ["Syarat & Ketentuan", "/terms"]].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Kontak</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: "#52a082" }} />
                <span style={{ color: "rgba(255,255,255,0.45)" }}>Epiwalk Office Suite Lt. 5, Kuningan, Jakarta Selatan</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} style={{ color: "#52a082" }} />
                <a href="tel:02122321146" className="hover:text-white transition" style={{ color: "rgba(255,255,255,0.45)" }}>021-22321146</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} style={{ color: "#52a082" }} />
                <a href="https://wa.me/628111620207" target="_blank" rel="noreferrer" className="hover:text-white transition" style={{ color: "rgba(255,255,255,0.45)" }}>+62 811 1620 207</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} style={{ color: "#52a082" }} />
                <a href="mailto:sundaf.group@gmail.com" className="hover:text-white transition" style={{ color: "rgba(255,255,255,0.45)" }}>sundaf.group@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.25)" }}>
          <p>© {new Date().getFullYear()} CV Sundaf Holiday Group. Hak cipta dilindungi.</p>
          <p>sundaftrip.com</p>
        </div>
      </div>
    </footer>
  );
}
