import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-gray-900">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#2d6a4f" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L14 13H2L8 2Z" fill="white"/></svg>
              </span>
              <span className="font-bold text-lg tracking-tight text-white">Sundaf<span style={{ color: "#52a082" }}>Trip</span></span>
            </div>
            <p className="text-sm leading-relaxed text-gray-600 max-w-xs">
              CV Sundaf Holiday Group — Mitra perjalanan wisata religi dan halal terpercaya.
            </p>
            <p className="text-xs text-gray-700 mt-3">NIB 1601260060842</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Navigasi</h3>
            <ul className="space-y-3 text-sm">
              {[["Beranda", "/"], ["Paket Tour", "/tours"], ["Blog", "/blog"], ["Syarat & Ketentuan", "/terms"]].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-600 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Kontak</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin size={13} className="mt-0.5 shrink-0 text-gray-700" />
                <span className="text-gray-600 leading-relaxed">Epiwalk Office Suite Lt. 5, Kuningan, Jakarta Selatan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={13} className="text-gray-700 shrink-0" />
                <a href="tel:02122321146" className="text-gray-600 hover:text-white transition-colors">021-22321146</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={13} className="text-gray-700 shrink-0" />
                <a href="mailto:sundaf.group@gmail.com" className="text-gray-600 hover:text-white transition-colors">sundaf.group@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-700">
          <p>© {new Date().getFullYear()} CV Sundaf Holiday Group</p>
          <p>sundaftrip.com</p>
        </div>
      </div>
    </footer>
  );
}
