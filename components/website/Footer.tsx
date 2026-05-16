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

const navLinks = [["Beranda", "/"], ["Paket Tour", "/tours"], ["Blog", "/blog"], ["Tentang Kami", "/about"], ["FAQ", "/faq"], ["Syarat & Ketentuan", "/terms"]];

export default async function Footer({ theme = "classic" }: { theme?: string }) {
  const { t, c } = await getFooterData();

  const tagline  = t["footer_tagline"] || "";
  const name     = c["company_name"] || "";
  const logo     = c["company_logo"] || "";
  const nib      = c["company_nib"] || "";
  const address  = c["company_address"] || "";
  const phone    = c["company_phone"] || "";
  const whatsapp = c["company_whatsapp"] || "";
  const email    = c["company_email"] || "";

  const contacts = [
    address  && { Icon: MapPin, label: "Alamat", value: address, href: null },
    phone    && { Icon: Phone,  label: "Telepon", value: phone, href: `tel:${phone.replace(/\D/g,"")}` },
    whatsapp && { Icon: Phone,  label: "WhatsApp", value: "WhatsApp", href: `https://wa.me/${whatsapp}` },
    email    && { Icon: Mail,   label: "Email", value: email, href: `mailto:${email}` },
  ].filter(Boolean) as { Icon: typeof MapPin; label: string; value: string; href: string | null }[];

  /* ── KAWAII ── */
  if (theme === "kawaii") return (
    <footer className="border-t-2 relative overflow-hidden"
      style={{ background: "var(--kw-bg)", borderColor: "var(--kw-border)", boxShadow: "0 -4px 0 0 var(--kw-shadow)" }}>
      {/* Floating decorations */}
      <span className="absolute top-8 right-16 text-4xl pointer-events-none kw-float-1 select-none" style={{ color: "var(--kw-border)", opacity: 0.25 }}>♡</span>
      <span className="absolute bottom-10 left-12 text-3xl pointer-events-none kw-float-3 select-none" style={{ color: "var(--kw-border)", opacity: 0.2 }}>✦</span>
      <span className="absolute top-12 left-[40%] text-2xl pointer-events-none kw-float-2 select-none" style={{ color: "var(--kw-border)", opacity: 0.18 }}>★</span>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b-2 border-dashed" style={{ borderColor: "var(--kw-border)" }}>
          <div className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo || "/logo.png"} alt={name} className="logo-theme" style={{ height: 40, width: "auto", marginBottom: 16 }} />
            {tagline && <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--kw-subtext)" }}>{tagline}</p>}
            {nib && <p className="text-xs mt-3" style={{ color: "var(--kw-subtext)" }}>NIB {nib}</p>}
          </div>

          <div>
            <span className="kw-pill mb-5 inline-flex" style={{ background: "var(--kw-blush)", color: "var(--kw-text)" }}>✦ Navigasi</span>
            <ul className="space-y-3 mt-3">
              {navLinks.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: "var(--kw-subtext)" }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="kw-pill mb-5 inline-flex" style={{ background: "var(--kw-sky)", color: "var(--kw-text)" }}>♡ Kontak</span>
            <ul className="space-y-3 mt-3">
              {contacts.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-2">
                  <Icon size={13} className="mt-0.5 shrink-0" style={{ color: "var(--kw-border)" }} />
                  {href
                    ? <a href={href} className="text-sm hover:opacity-70 transition-opacity" style={{ color: "var(--kw-subtext)" }}>{value}</a>
                    : <span className="text-sm leading-relaxed" style={{ color: "var(--kw-subtext)" }}>{value}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: "var(--kw-subtext)" }}>
          <p>© {new Date().getFullYear()} {name} ♡</p>
          {c["company_website"] && <p>{c["company_website"]}</p>}
        </div>
      </div>
    </footer>
  );

  /* ── GLOBE / WORLD LANDMARKS ── */
  if (theme === "globe") return (
    <footer style={{ background: "var(--gl-card)", borderTop: "1.5px solid color-mix(in srgb, var(--gl-border) 25%, transparent)", boxShadow: "0 -8px 32px var(--gl-shadow)" }}>
      {/* Landmark decorations */}
      <span className="absolute pointer-events-none select-none gl-float-2" style={{ right: "5%", bottom: "30%", opacity: 0.08, fontSize: "5rem" }}>🗼</span>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b" style={{ borderColor: "color-mix(in srgb, var(--gl-border) 20%, transparent)" }}>
          <div className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo || "/logo.png"} alt={name} className="logo-theme" style={{ height: 40, width: "auto", marginBottom: 16 }} />
            {tagline && <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--gl-subtext)" }}>{tagline}</p>}
            {nib && <p className="text-xs mt-3" style={{ color: "var(--gl-subtext)" }}>NIB {nib}</p>}
          </div>

          <div>
            <span className="gl-pill mb-5 inline-flex" style={{ background: "var(--gl-sky)", color: "var(--gl-on-sky)", borderColor: "transparent" }}>🗺️ Navigasi</span>
            <ul className="space-y-3 mt-3">
              {navLinks.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: "var(--gl-subtext)" }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="gl-pill mb-5 inline-flex" style={{ background: "var(--gl-amber)", color: "var(--gl-on-amber)", borderColor: "transparent" }}>✈ Kontak</span>
            <ul className="space-y-3 mt-3">
              {contacts.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-2">
                  <Icon size={13} className="mt-0.5 shrink-0" style={{ color: "var(--gl-border)" }} />
                  {href
                    ? <a href={href} className="text-sm hover:opacity-70 transition-opacity" style={{ color: "var(--gl-subtext)" }}>{value}</a>
                    : <span className="text-sm leading-relaxed" style={{ color: "var(--gl-subtext)" }}>{value}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: "var(--gl-subtext)" }}>
          <p>© {new Date().getFullYear()} {name} 🌍</p>
          {c["company_website"] && <p>{c["company_website"]}</p>}
        </div>
      </div>
    </footer>
  );

  /* ── ATLAS ── */
  if (theme === "atlas") return (
    <footer className="border-t at-grid-bg"
      style={{ backgroundColor: "var(--at-bg)", borderColor: "var(--at-border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b" style={{ borderColor: "var(--at-border)" }}>
          <div className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo || "/logo.png"} alt={name} className="logo-theme" style={{ height: 40, width: "auto", marginBottom: 16 }} />
            {tagline && <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--at-subtext)" }}>{tagline}</p>}
            {nib && <p className="text-xs mt-3" style={{ color: "var(--at-subtext)" }}>NIB {nib}</p>}
          </div>

          <div>
            <span className="at-pill mb-5 inline-flex" style={{ color: "var(--at-subtext)" }}>Navigasi</span>
            <ul className="space-y-3 mt-3">
              {navLinks.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: "var(--at-subtext)" }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="at-pill mb-5 inline-flex" style={{ color: "var(--at-subtext)" }}>Kontak</span>
            <ul className="space-y-3 mt-3">
              {contacts.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-2">
                  <Icon size={13} className="mt-0.5 shrink-0" style={{ color: "var(--at-border)" }} />
                  {href
                    ? <a href={href} className="text-sm hover:opacity-70 transition-opacity" style={{ color: "var(--at-subtext)" }}>{value}</a>
                    : <span className="text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>{value}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: "var(--at-subtext)" }}>
          <p>© {new Date().getFullYear()} {name}</p>
          {c["company_website"] && <p>{c["company_website"]}</p>}
        </div>
      </div>
    </footer>
  );

  /* ── MAP / ATLAS ── */
  if (theme === "map") return (
    <footer className="relative overflow-hidden border-t-2"
      style={{ background: "var(--mp-card)", borderColor: "var(--mp-border)", boxShadow: "0 -3px 0 0 var(--mp-border), 0 -8px 24px var(--mp-shadow)", backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }}>
      {/* CSS compass decoration */}
      <div className="absolute bottom-8 right-8 mp-compass pointer-events-none" style={{ width: 48, height: 48, opacity: 0.35 }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b-2" style={{ borderColor: "var(--mp-border)" }}>
          <div className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo || "/logo.png"} alt={name} className="logo-theme" style={{ height: 40, width: "auto", marginBottom: 16 }} />
            {tagline && <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--mp-subtext)" }}>{tagline}</p>}
            {nib && <p className="text-xs mt-3" style={{ color: "var(--mp-subtext)" }}>NIB {nib}</p>}
          </div>

          <div>
            <span className="mp-pill mb-5 inline-flex" style={{ background: "var(--mp-water)", color: "var(--mp-on-water)", borderColor: "var(--mp-border)" }}>Navigasi</span>
            <ul className="space-y-3 mt-3">
              {navLinks.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: "var(--mp-subtext)" }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="mp-pill mb-5 inline-flex" style={{ background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>Kontak</span>
            <ul className="space-y-3 mt-3">
              {contacts.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-2">
                  <Icon size={13} className="mt-0.5 shrink-0" style={{ color: "var(--mp-border)" }} />
                  {href
                    ? <a href={href} className="text-sm hover:opacity-70 transition-opacity" style={{ color: "var(--mp-subtext)" }}>{value}</a>
                    : <span className="text-sm leading-relaxed" style={{ color: "var(--mp-subtext)" }}>{value}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: "var(--mp-subtext)" }}>
          <p>© {new Date().getFullYear()} {name}</p>
          {c["company_website"] && <p>{c["company_website"]}</p>}
        </div>
      </div>
    </footer>
  );

  /* ── TROPICAL ── */
  if (theme === "tropical") return (
    <footer className="border-t-2"
      style={{ background: "var(--tr-bg)", borderColor: "var(--tr-border)", boxShadow: "0 -4px 0 0 var(--tr-shadow)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b-2 border-dashed" style={{ borderColor: "var(--tr-border)" }}>
          <div className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo || "/logo.png"} alt={name} className="logo-theme" style={{ height: 40, width: "auto", marginBottom: 16 }} />
            {tagline && <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--tr-subtext)" }}>{tagline}</p>}
            {nib && <p className="text-xs mt-3" style={{ color: "var(--tr-subtext)" }}>NIB {nib}</p>}
          </div>

          <div>
            <span className="tr-pill mb-5 inline-flex" style={{ background: "var(--tr-mint)", color: "var(--tr-text)" }}>🌿 Navigasi</span>
            <ul className="space-y-3 mt-3">
              {navLinks.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: "var(--tr-subtext)" }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="tr-pill mb-5 inline-flex" style={{ background: "var(--tr-sky)", color: "var(--tr-text)" }}>🌏 Kontak</span>
            <ul className="space-y-3 mt-3">
              {contacts.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-2">
                  <Icon size={13} className="mt-0.5 shrink-0" style={{ color: "var(--tr-text)" }} />
                  {href
                    ? <a href={href} className="text-sm hover:opacity-70 transition-opacity" style={{ color: "var(--tr-subtext)" }}>{value}</a>
                    : <span className="text-sm leading-relaxed" style={{ color: "var(--tr-subtext)" }}>{value}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: "var(--tr-subtext)" }}>
          <p>© {new Date().getFullYear()} {name}</p>
          {c["company_website"] && <p>{c["company_website"]}</p>}
        </div>
      </div>
    </footer>
  );

  /* ── PIXEL ── */
  if (theme === "pixel") return (
    <footer className="border-t-2"
      style={{
        background: "var(--px-bg)",
        backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
        backgroundSize: "24px 24px",
        borderColor: "var(--px-border)",
        boxShadow: "0 -4px 0 0 var(--px-shadow)",
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b-2" style={{ borderColor: "var(--px-border)" }}>
          <div className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo || "/logo.png"} alt={name} className="logo-theme" style={{ height: 40, width: "auto", marginBottom: 16 }} />
            {tagline && <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>{tagline}</p>}
            {nib && <p className="text-xs mt-3" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>NIB {nib}</p>}
            {/* Pixel color blocks */}
            <div className="flex gap-2 mt-5">
              {["var(--px-red)","var(--px-yellow)","var(--px-cyan)","var(--px-purple)","var(--px-green)"].map((c, i) => (
                <div key={i} className="w-5 h-5 border-2" style={{ background: c, borderColor: "var(--px-border)", boxShadow: "2px 2px 0 0 var(--px-shadow)" }} />
              ))}
            </div>
          </div>

          <div>
            <span className="px-pill mb-5 inline-flex" style={{ background: "var(--px-cyan)", color: "var(--px-on-cyan)" }}>NAVIGASI</span>
            <ul className="space-y-3 mt-3">
              {navLinks.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm font-black hover:opacity-70 transition-opacity uppercase"
                    style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="px-pill mb-5 inline-flex" style={{ background: "var(--px-yellow)", color: "#111827" }}>KONTAK</span>
            <ul className="space-y-3 mt-3">
              {contacts.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-2">
                  <Icon size={13} className="mt-0.5 shrink-0" style={{ color: "var(--px-border)" }} />
                  {href
                    ? <a href={href} className="text-sm font-black hover:opacity-70 transition-opacity" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>{value}</a>
                    : <span className="text-sm leading-relaxed" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>{value}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>
          <p>© {new Date().getFullYear()} {name} [ALL RIGHTS RESERVED]</p>
          {c["company_website"] && <p>{c["company_website"]}</p>}
        </div>
      </div>
    </footer>
  );

  /* ── CLASSIC / VIBRANT / BOLD (dark footer) ── */
  /* ── ATELIER ── */
  if (theme === "atelier") return (
    <footer style={{ background: "var(--atl-bg)", color: "var(--atl-sub)", borderTop: "1px solid var(--atl-line)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center pb-14 border-b" style={{ borderColor: "var(--atl-line)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo || "/logo.png"} alt={name} className="atl-logo" style={{ margin: "0 auto 18px" }} />
          {tagline && <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "var(--atl-sub)" }}>{tagline}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-14">
          <div>
            <h3 className="atl-eyebrow mb-6">Navigasi</h3>
            <ul className="grid grid-cols-2 gap-3 text-sm">
              {navLinks.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:opacity-60 transition-opacity" style={{ color: "var(--atl-ink)" }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="atl-eyebrow mb-6">Kontak</h3>
            <ul className="space-y-3 text-sm">
              {contacts.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-2.5">
                  <Icon size={13} className="mt-0.5 shrink-0" style={{ color: "var(--atl-accent)" }} />
                  {href
                    ? <a href={href} className="hover:opacity-60 transition-opacity" style={{ color: "var(--atl-ink)" }}>{value}</a>
                    : <span style={{ color: "var(--atl-ink)" }}>{value}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t" style={{ borderColor: "var(--atl-line)" }}>
          <p>© {new Date().getFullYear()} {name}</p>
          {nib && <p>NIB {nib}</p>}
          {c["company_website"] && <p>{c["company_website"]}</p>}
        </div>
      </div>
    </footer>
  );

  return (
    <footer className="bg-gray-950 text-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-gray-900">
          <div className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo || "/logo.png"} alt={name} className="logo-dark" style={{ height: 40, width: "auto", marginBottom: 20 }} />
            {tagline && <p className="text-sm leading-relaxed text-gray-500 max-w-xs">{tagline}</p>}
            {nib && <p className="text-xs text-gray-500 mt-3">NIB {nib}</p>}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Navigasi</h3>
            <ul className="space-y-3 text-sm">
              {navLinks.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-600 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Kontak</h3>
            <ul className="space-y-3 text-sm">
              {contacts.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-2.5">
                  <Icon size={13} className="mt-0.5 shrink-0 text-gray-700" />
                  {href
                    ? <a href={href} className="text-gray-600 hover:text-white transition-colors leading-relaxed">{value}</a>
                    : <span className="text-gray-600 leading-relaxed">{value}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-700">
          <p>© {new Date().getFullYear()} {name}</p>
          {c["company_website"] && <p>{c["company_website"]}</p>}
        </div>
      </div>
    </footer>
  );
}
