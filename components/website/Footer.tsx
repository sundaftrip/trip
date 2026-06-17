import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { toWaNumber } from "@/lib/utils";
import FooterContactList, { type FooterContact } from "./FooterContactList";
import FooterTagline from "./FooterTagline";
import { footerNav } from "@/lib/nav";
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

// Tuple [label, href] di-derive dari sumber tunggal footerNav (lihat lib/nav.ts).
// Bentuk tuple dipertahankan supaya blok render tiap tema tidak perlu diubah.
const navLinks: [string, string][] = footerNav.map((n) => [n.label.id, n.href]);

const STRATEGIC_FOOTER_TAGLINE =
  "Spesialis perjalanan Rusia, Asia Tengah, aurora, dan bantuan visa untuk traveler Indonesia. Rute lain seperti Vietnam kami tampilkan sebagai produk tambahan sesuai ketersediaan.";

function normalizeFooterTagline(value: string) {
  const trimmed = value.trim();
  if (!trimmed || /dari asia hingga eropa/i.test(trimmed) || /semuabisa/i.test(trimmed.replace(/\s+/g, ""))) {
    return STRATEGIC_FOOTER_TAGLINE;
  }
  return trimmed;
}

export default async function Footer({ theme = "classic" }: { theme?: string }) {
  const { t, c } = await getFooterData();

  const tagline  = normalizeFooterTagline(t["footer_tagline"] || "");
  const name     = c["company_name"] || "";
  const logo     = c["company_logo"] || "";
  const nib      = c["company_nib"] || "";
  const legalName = c["company_legal_name"] || "";
  // Baris keterangan legal: "CV Sundaf Holiday Group · NIB 1601…"
  const legalLine = [legalName, nib && `NIB ${nib}`].filter(Boolean).join(" · ");
  const waB2BNum = toWaNumber(c["company_whatsapp"] || "");
  const waB2B = waB2BNum
    ? `https://wa.me/${waB2BNum}?text=${encodeURIComponent("Halo, saya dari travel agent / B2B. Saya ingin menanyakan skema kerja sama partner untuk Rusia.")}`
    : "";
  const address  = c["company_address"] || "";
  const phone    = c["company_phone"] || "";
  const whatsapp = toWaNumber(c["company_whatsapp"]);
  const email    = c["company_email"] || "";
  const igUser   = (c["company_instagram"] || "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "")
    .trim();

  const contacts = [
    address  && { kind: "address", label: "Alamat", value: address, href: null },
    phone    && { kind: "phone", label: "Telepon", value: phone, href: `tel:${phone.replace(/\D/g,"")}` },
    whatsapp && { kind: "whatsapp", label: "WhatsApp", value: "WhatsApp", href: `https://wa.me/${whatsapp}` },
    email    && { kind: "email", label: "Email", value: email, href: `mailto:${email}` },
    igUser   && { kind: "instagram", label: "Instagram", value: `@${igUser}`, href: `https://www.instagram.com/${igUser}` },
  ].filter(Boolean) as FooterContact[];

  /* ── FUMAYO ── */
  if (theme === "fumayo") return (
    <footer className="fb-page relative overflow-hidden" style={{ borderTop: "2.5px solid var(--fb-line)" }}>
      <span className="absolute top-10 right-[12%] text-3xl pointer-events-none select-none fb-float-1" style={{ color: "var(--fb-red)" }}>✶</span>
      <span className="absolute bottom-16 left-[8%] text-2xl pointer-events-none select-none fb-float-3" style={{ color: "var(--fb-blue)" }}>✦</span>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="fb-frame p-8 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10"
            style={{ borderBottom: "2px dashed var(--fb-line)" }}>
            <div className="md:col-span-2">
              <span className="inline-flex items-center rounded-xl px-3 py-1.5 mb-4"
                style={{ border: "2px solid var(--fb-line)", background: "var(--fb-yellow)", boxShadow: "0 3px 0 0 var(--fb-line)" }}>
                <Image src={logo || "/logo.png"} alt={name} width={176} height={54} style={{ height: 34, width: "auto" }} />
              </span>
              <FooterTagline tagline={tagline} waB2B={waB2B} className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--fb-subink)" }} />
              {legalLine && <p className="text-xs mt-3" style={{ color: "var(--fb-subink)" }}>{legalLine}</p>}
            </div>

            <div>
              <span className="fb-pill mb-4 inline-flex" style={{ background: "var(--fb-yellow)", color: "#1a1a1a" }}>★ Navigasi</span>
              <ul className="space-y-3 mt-4">
                {navLinks.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm font-bold hover:opacity-60 transition-opacity" style={{ color: "var(--fb-subink)" }}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="fb-pill mb-4 inline-flex" style={{ background: "var(--fb-blue)", color: "#1a1a1a" }}>✦ Kontak</span>
              <ul className="space-y-3 mt-4">
                <FooterContactList
                  contacts={contacts}
                  iconClassName="mt-0.5 shrink-0"
                  iconStyle={{ color: "var(--fb-accent)" }}
                  linkClassName="text-sm hover:opacity-60 transition-opacity"
                  linkStyle={{ color: "var(--fb-subink)" }}
                  textClassName="text-sm leading-relaxed"
                  textStyle={{ color: "var(--fb-subink)" }}
                />
              </ul>
            </div>
          </div>

          <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: "var(--fb-subink)" }}>
            <p>© {new Date().getFullYear()} {name} ✶</p>
            {c["company_website"] && <p>{c["company_website"]}</p>}
          </div>
        </div>
      </div>
    </footer>
  );

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
            <Image src={logo || "/logo.png"} alt={name} width={176} height={54} className="logo-theme" style={{ height: 40, width: "auto", marginBottom: 16 }} />
            <FooterTagline tagline={tagline} waB2B={waB2B} className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--kw-subtext)" }} />
            {legalLine && <p className="text-xs mt-3" style={{ color: "var(--kw-subtext)" }}>{legalLine}</p>}
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
              <FooterContactList
                contacts={contacts}
                iconClassName="mt-0.5 shrink-0"
                iconStyle={{ color: "var(--kw-border)" }}
                linkClassName="text-sm hover:opacity-70 transition-opacity"
                linkStyle={{ color: "var(--kw-subtext)" }}
                textClassName="text-sm leading-relaxed"
                textStyle={{ color: "var(--kw-subtext)" }}
              />
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
            <Image src={logo || "/logo.png"} alt={name} width={176} height={54} className="logo-theme" style={{ height: 40, width: "auto", marginBottom: 16 }} />
            <FooterTagline tagline={tagline} waB2B={waB2B} className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--gl-subtext)" }} />
            {legalLine && <p className="text-xs mt-3" style={{ color: "var(--gl-subtext)" }}>{legalLine}</p>}
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
              <FooterContactList
                contacts={contacts}
                iconClassName="mt-0.5 shrink-0"
                iconStyle={{ color: "var(--gl-border)" }}
                linkClassName="text-sm hover:opacity-70 transition-opacity"
                linkStyle={{ color: "var(--gl-subtext)" }}
                textClassName="text-sm leading-relaxed"
                textStyle={{ color: "var(--gl-subtext)" }}
              />
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
            <Image src={logo || "/logo.png"} alt={name} width={176} height={54} className="logo-theme" style={{ height: 40, width: "auto", marginBottom: 16 }} />
            <FooterTagline tagline={tagline} waB2B={waB2B} className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--at-subtext)" }} />
            {legalLine && <p className="text-xs mt-3" style={{ color: "var(--at-subtext)" }}>{legalLine}</p>}
          </div>

          <div>
            <span className="at-pill mb-5 inline-flex" style={{ color: "var(--at-subtext)" }}>Navigasi</span>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 md:block md:space-y-3">
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
              <FooterContactList
                contacts={contacts}
                iconClassName="mt-0.5 shrink-0"
                iconStyle={{ color: "var(--at-border)" }}
                linkClassName="text-sm hover:opacity-70 transition-opacity"
                linkStyle={{ color: "var(--at-subtext)" }}
                textClassName="text-sm leading-relaxed"
                textStyle={{ color: "var(--at-subtext)" }}
              />
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
            <Image src={logo || "/logo.png"} alt={name} width={176} height={54} className="logo-theme" style={{ height: 40, width: "auto", marginBottom: 16 }} />
            <FooterTagline tagline={tagline} waB2B={waB2B} className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--mp-subtext)" }} />
            {legalLine && <p className="text-xs mt-3" style={{ color: "var(--mp-subtext)" }}>{legalLine}</p>}
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
              <FooterContactList
                contacts={contacts}
                iconClassName="mt-0.5 shrink-0"
                iconStyle={{ color: "var(--mp-border)" }}
                linkClassName="text-sm hover:opacity-70 transition-opacity"
                linkStyle={{ color: "var(--mp-subtext)" }}
                textClassName="text-sm leading-relaxed"
                textStyle={{ color: "var(--mp-subtext)" }}
              />
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
            <Image src={logo || "/logo.png"} alt={name} width={176} height={54} className="logo-theme" style={{ height: 40, width: "auto", marginBottom: 16 }} />
            <FooterTagline tagline={tagline} waB2B={waB2B} className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--tr-subtext)" }} />
            {legalLine && <p className="text-xs mt-3" style={{ color: "var(--tr-subtext)" }}>{legalLine}</p>}
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
              <FooterContactList
                contacts={contacts}
                iconClassName="mt-0.5 shrink-0"
                iconStyle={{ color: "var(--tr-text)" }}
                linkClassName="text-sm hover:opacity-70 transition-opacity"
                linkStyle={{ color: "var(--tr-subtext)" }}
                textClassName="text-sm leading-relaxed"
                textStyle={{ color: "var(--tr-subtext)" }}
              />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 pb-8 sm:pb-12 border-b-2" style={{ borderColor: "var(--px-border)" }}>
          <div className="md:col-span-2">
            <Image src={logo || "/logo.png"} alt={name} width={176} height={54} className="logo-theme" style={{ height: 40, width: "auto", marginBottom: 16 }} />
            <FooterTagline tagline={tagline} waB2B={waB2B} className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }} />
            {legalLine && <p className="text-xs mt-3" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>{legalLine}</p>}
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
              <FooterContactList
                contacts={contacts}
                itemClassName="flex min-w-0 items-start gap-2"
                iconClassName="mt-0.5 shrink-0"
                iconStyle={{ color: "var(--px-border)" }}
                linkClassName="break-words text-sm font-black hover:opacity-70 transition-opacity"
                linkStyle={{ color: "var(--px-subtext)", fontFamily: "monospace" }}
                textClassName="break-words text-sm leading-relaxed"
                textStyle={{ color: "var(--px-subtext)", fontFamily: "monospace" }}
              />
            </ul>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>
          <p className="break-words">© {new Date().getFullYear()} {name} [ALL RIGHTS RESERVED]</p>
          {c["company_website"] && <p className="break-words">{c["company_website"]}</p>}
        </div>
      </div>
    </footer>
  );

  /* ── CLASSIC (dark footer) ── */
  return (
    <footer className="bg-gray-950 text-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-gray-900">
          <div className="md:col-span-2">
            <Image src={logo || "/logo.png"} alt={name} width={176} height={54} className="logo-dark" style={{ height: 40, width: "auto", marginBottom: 20 }} />
            <FooterTagline tagline={tagline} waB2B={waB2B} className="text-sm leading-relaxed text-gray-500 max-w-xs" />
            {legalLine && <p className="text-xs text-gray-500 mt-3">{legalLine}</p>}
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
              <FooterContactList
                contacts={contacts}
                itemClassName="flex items-start gap-2.5"
                iconClassName="mt-0.5 shrink-0 text-gray-700"
                linkClassName="text-gray-600 hover:text-white transition-colors leading-relaxed"
                textClassName="text-gray-600 leading-relaxed"
              />
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
