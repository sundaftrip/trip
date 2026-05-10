import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const getFooterData = unstable_cache(
  async () => {
    try {
      const [texts, info] = await Promise.all([
        prisma.siteText.findMany({ where: { key: { in: ["footer_tagline"] } } }),
        prisma.companyInfo.findMany({ where: { key: { startsWith: "company_" } } }),
      ]);
      const t: Record<string, string> = {};
      texts.forEach((x) => { t[x.key] = x.valueId ?? ""; });
      const c: Record<string, string> = {};
      info.forEach((x) => { c[x.key] = x.value; });
      return { t, c };
    } catch {
      return { t: {}, c: {} };
    }
  },
  ["footer-data"],
  { revalidate: 3600, tags: ["footer-data", "site-colors"] }
);

export default async function Footer() {
  const { t, c } = await getFooterData();

  const tagline = t["footer_tagline"] || "CV Sundaf Holiday Group — Mitra perjalanan wisata religi dan halal terpercaya.";
  const name = c["company_name"] || "CV Sundaf Holiday Group";
  const nib = c["company_nib"] || "1601260060842";
  const address = c["company_address"] || "Epiwalk Office Suite Lt. 5, Kuningan, Jakarta Selatan";
  const phone = c["company_phone"] || "021-22321146";
  const whatsapp = c["company_whatsapp"] || "628111620207";
  const email = c["company_email"] || "sundaf.group@gmail.com";

  return (
    <footer className="bg-gray-950 text-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-gray-900">
          <div className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Sundaf Trip" style={{ height: 32, width: "auto", marginBottom: 20, filter: "brightness(0) invert(0.8)" }} />
            <p className="text-sm leading-relaxed text-gray-600 max-w-xs">{tagline}</p>
            <p className="text-xs text-gray-700 mt-3">NIB {nib}</p>
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
                <span className="text-gray-600 leading-relaxed">{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={13} className="text-gray-700 shrink-0" />
                <a href={`tel:${phone.replace(/\D/g, "")}`} className="text-gray-600 hover:text-white transition-colors">{phone}</a>
              </li>
              {whatsapp && (
                <li className="flex items-center gap-2.5">
                  <Phone size={13} className="text-gray-700 shrink-0" />
                  <a href={`https://wa.me/${whatsapp}`} className="text-gray-600 hover:text-white transition-colors">WhatsApp</a>
                </li>
              )}
              <li className="flex items-center gap-2.5">
                <Mail size={13} className="text-gray-700 shrink-0" />
                <a href={`mailto:${email}`} className="text-gray-600 hover:text-white transition-colors">{email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-700">
          <p>© {new Date().getFullYear()} {name}</p>
          <p>sundaftrip.com</p>
        </div>
      </div>
    </footer>
  );
}
