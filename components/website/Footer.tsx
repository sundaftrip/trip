import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Image src="/logo-white.png" alt="Sundaf Trip" width={140} height={42} className="h-9 w-auto mb-4" />
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              CV Sundaf Holiday Group — Mitra perjalanan wisata religi dan halal terpercaya Anda.
            </p>
            <p className="text-xs text-gray-500 mt-3">NIB 1601260060842</p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Navigasi</h3>
            <ul className="space-y-2 text-sm">
              {[["Beranda", "/"], ["Paket Tour", "/tours"], ["Blog", "/blog"], ["Syarat & Ketentuan", "/terms"]].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-white transition">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Kontak</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-blue-400 mt-0.5 shrink-0" />
                <span className="text-gray-400">Epiwalk Office Suite Lt. 5 Unit A501, Kuningan, Jakarta Selatan</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-blue-400 shrink-0" />
                <a href="tel:02122321146" className="hover:text-white transition">021-22321146</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-blue-400 shrink-0" />
                <a href="https://wa.me/628111620207" target="_blank" rel="noreferrer" className="hover:text-white transition">+62 811 1620 207</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-blue-400 shrink-0" />
                <a href="mailto:sundaf.group@gmail.com" className="hover:text-white transition">sundaf.group@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} CV Sundaf Holiday Group. Hak cipta dilindungi.</p>
          <p>Built with ❤ by Sundaf Team</p>
        </div>
      </div>
    </footer>
  );
}
