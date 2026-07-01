import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { buildWhatsAppHref, DEFAULT_WHATSAPP_MESSAGE, toWaNumber } from "@/lib/utils";

interface Props {
  texts: Record<string, { id?: string; en?: string }>;
  company: Record<string, string>;
  theme?: string;
}

export default function ContactSection({ texts, company, theme = "classic" }: Props) {
  // Server Component: render teks ID; AutoTranslate menangani EN.
  const t = (key: string, fallback: string) => {
    const val = texts[key];
    if (!val) return fallback;
    return val.id || val.en || fallback;
  };
  const bankName   = texts["payment_bank_name"]?.id || "";
  const bankAcc    = texts["payment_bank_acc"]?.id || "";
  const bankHolder = texts["payment_bank_holder"]?.id || "";

  const wa      = toWaNumber(company["company_whatsapp"]);
  const email   = company["company_email"] || "";
  const phone   = company["company_phone"] || "";
  const address = company["company_address"] || "";

  const contacts = [
    address && { Icon: MapPin,        label: "Alamat",    value: address, href: null },
    phone   && { Icon: Phone,         label: "Telepon",   value: phone,   href: `tel:${phone.replace(/\D/g,"")}` },
    wa      && { Icon: MessageCircle, label: "WhatsApp",  value: wa.startsWith("62") ? `+${wa}` : wa, href: buildWhatsAppHref(wa, DEFAULT_WHATSAPP_MESSAGE) },
    email   && { Icon: Mail,          label: "Email",     value: email,   href: `mailto:${email}` },
  ].filter(Boolean) as { Icon: typeof MapPin; label: string; value: string; href: string | null }[];

  const headLabel = "Hubungi Kami";
  const bankLabel = "Rekening Pembayaran";

  /* ── FUMAYO ── */
  if (theme === "fumayo") return (
    <section id="contact" className="fb-page py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-xl">
          <span className="fb-pill mb-3 inline-flex" style={{ background: "var(--fb-blue)", color: "#1a1a1a" }}>★ {headLabel}</span>
          <h2 className="text-3xl lg:text-5xl font-bold mt-3" style={{ color: "var(--fb-ink)", fontFamily: "var(--fb-font)" }}>
            {t("contact_title", "Siap Membantu Perjalanan Anda")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--fb-subink)" }}>
            {t("contact_desc", "Konsultasikan perjalanan impian Anda bersama kami.")}
          </p>
        </div>

        <div className="max-w-2xl">
          <div className="space-y-4">
            {contacts.map(({ Icon, label, value, href }, i) => {
              const bgs = ["var(--fb-blue)", "var(--fb-yellow)", "var(--fb-green)", "var(--fb-pink)"];
              return (
                <div key={label} className="fb-card p-5 flex items-start gap-4" style={{ background: bgs[i % bgs.length] }}>
                  <div className="w-9 h-9 flex items-center justify-center shrink-0"
                    style={{ background: "#ffffff", border: "2px solid #333131", borderRadius: 8, boxShadow: "0 3px 0 0 #333131" }}>
                    <Icon size={14} style={{ color: "#1a1a1a" }} />
                  </div>
                  <div style={{ fontFamily: "var(--fb-font)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#1a1a1a", opacity: 0.7 }}>{label}</p>
                    {href
                      ? <a href={href} className="text-sm font-bold hover:opacity-70 transition-opacity" style={{ color: "#1a1a1a" }}>{value}</a>
                      : <p className="text-sm font-bold leading-relaxed" style={{ color: "#1a1a1a" }}>{value}</p>}
                  </div>
                </div>
              );
            })}
            {bankAcc && (
              <div className="fb-card p-5" style={{ fontFamily: "var(--fb-font)" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--fb-subink)" }}>{bankLabel}</p>
                {bankName && <p className="text-xs mb-1" style={{ color: "var(--fb-subink)" }}>{bankName}</p>}
                <p className="text-xl font-bold font-mono" style={{ color: "var(--fb-ink)" }}>{bankAcc}</p>
                {bankHolder && <p className="text-xs mt-1" style={{ color: "var(--fb-subink)" }}>a/n {bankHolder}</p>}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );

  /* ── GLOBE ── */
  if (theme === "globe") return (
    <section id="contact" className="py-24 relative overflow-hidden" style={{ background: "var(--gl-bg)" }}>
      <span className="absolute top-8 right-10 text-5xl pointer-events-none select-none gl-float-3" style={{ opacity: 0.1 }}>🗽</span>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-16 max-w-xl">
          <span className="gl-pill mb-3 inline-flex" style={{ background: "var(--gl-sky)", color: "var(--gl-on-sky)", borderColor: "transparent" }}>✈ {headLabel}</span>
          <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--gl-text)" }}>
            {t("contact_title", "Siap Membantu Perjalanan Anda")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--gl-subtext)" }}>
            {t("contact_desc", "Konsultasikan perjalanan impian Anda bersama kami.")}
          </p>
        </div>

        <div className="max-w-2xl">
          <div className="space-y-4">
            {contacts.map(({ Icon, label, value, href }, i) => {
              const bgs  = ["var(--gl-sky)", "#fef9c3", "#dcfce7", "var(--gl-lavender)"];
              const fgs  = ["var(--gl-on-sky)", "#111827", "#111827", "var(--gl-on-lavender)"];
              return (
                <div key={label} className="gl-card p-5 flex items-start gap-4" style={{ background: bgs[i % bgs.length] }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}>
                    <Icon size={14} style={{ color: "#1a2a3a" }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: fgs[i % fgs.length], opacity: 0.7 }}>{label}</p>
                    {href
                      ? <a href={href} className="text-sm font-black hover:opacity-70 transition-opacity" style={{ color: fgs[i % fgs.length] }}>{value}</a>
                      : <p className="text-sm font-black leading-relaxed" style={{ color: fgs[i % fgs.length] }}>{value}</p>}
                  </div>
                </div>
              );
            })}
            {bankAcc && (
              <div className="gl-card p-5" style={{ background: "var(--gl-amber)" }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--gl-on-amber)", opacity: 0.7 }}>{bankLabel}</p>
                {bankName && <p className="text-xs mb-1" style={{ color: "var(--gl-on-amber)", opacity: 0.8 }}>{bankName}</p>}
                <p className="text-xl font-black font-mono" style={{ color: "var(--gl-on-amber)" }}>{bankAcc}</p>
                {bankHolder && <p className="text-xs mt-1" style={{ color: "var(--gl-on-amber)", opacity: 0.8 }}>a/n {bankHolder}</p>}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );

  /* ── ATLAS ── */
  if (theme === "atlas") return (
    <section id="contact" className="py-14 at-grid-bg" style={{ backgroundColor: "var(--at-bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-xl">
          <span className="at-pill mb-3 inline-flex" style={{ color: "var(--at-subtext)" }}>{headLabel}</span>
          <h2 className="text-3xl lg:text-5xl font-bold mt-3" style={{ color: "var(--at-text)" }}>
            {t("contact_title", "Siap Membantu Perjalanan Anda")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
            {t("contact_desc", "Konsultasikan perjalanan impian Anda bersama kami.")}
          </p>
        </div>

        <div className="max-w-2xl">
          <div className="space-y-4">
            {contacts.map(({ Icon, label, value, href }) => (
              <div key={label} className="at-card p-5 flex items-start gap-4">
                <div className="w-9 h-9 border flex items-center justify-center shrink-0"
                  style={{ background: "var(--at-muted)", borderColor: "var(--at-border)" }}>
                  <Icon size={14} style={{ color: "var(--at-text)" }} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--at-subtext)" }}>{label}</p>
                  {href
                    ? <a href={href} className="inline-flex min-h-11 items-center text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: "var(--at-text)" }}>{value}</a>
                    : <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--at-text)" }}>{value}</p>}
                </div>
              </div>
            ))}
            {bankAcc && (
              <div className="at-card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--at-subtext)" }}>{bankLabel}</p>
                {bankName && <p className="text-xs mb-1" style={{ color: "var(--at-subtext)" }}>{bankName}</p>}
                <p className="text-xl font-bold font-mono" style={{ color: "var(--at-text)" }}>{bankAcc}</p>
                {bankHolder && <p className="text-xs mt-1" style={{ color: "var(--at-subtext)" }}>a/n {bankHolder}</p>}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );

  /* ── MAP / ATLAS ── */
  if (theme === "map") return (
    <section id="contact" className="py-24 relative overflow-hidden"
      style={{ background: "var(--mp-bg)", backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }}>
      {/* CSS route line decoration */}
      <div className="mp-route absolute top-40 left-0 right-0 pointer-events-none" style={{ opacity: 0.2 }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-16 max-w-xl">
          <span className="mp-pill mb-3 inline-flex" style={{ background: "var(--mp-water)", color: "var(--mp-on-water)", borderColor: "var(--mp-border)" }}>{headLabel}</span>
          <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--mp-text)", fontFamily: "Georgia,'Times New Roman',serif" }}>
            {t("contact_title", "Siap Membantu Perjalanan Anda")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--mp-subtext)" }}>
            {t("contact_desc", "Konsultasikan perjalanan impian Anda bersama kami.")}
          </p>
        </div>

        <div className="max-w-2xl">
          <div className="space-y-4">
            {contacts.map(({ Icon, label, value, href }, i) => {
              const bgs = ["var(--mp-water)", "var(--mp-land)", "var(--mp-accent)", "var(--mp-navy)"];
              const fgs = ["var(--mp-on-water)", "var(--mp-text)", "var(--mp-on-accent)", "var(--mp-on-ink)"];
              return (
                <div key={label} className="mp-card p-5 flex items-start gap-4" style={{ background: bgs[i % bgs.length] }}>
                  <div className="w-9 h-9 border-2 flex items-center justify-center shrink-0"
                    style={{ background: "var(--mp-card)", borderColor: "var(--mp-border)", boxShadow: "2px 2px 0 0 var(--mp-border)" }}>
                    <Icon size={14} style={{ color: "var(--mp-text)" }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: fgs[i % fgs.length], opacity: 0.7 }}>{label}</p>
                    {href
                      ? <a href={href} className="text-sm font-black hover:opacity-70 transition-opacity" style={{ color: fgs[i % fgs.length] }}>{value}</a>
                      : <p className="text-sm font-black leading-relaxed" style={{ color: fgs[i % fgs.length] }}>{value}</p>}
                  </div>
                </div>
              );
            })}
            {bankAcc && (
              <div className="mp-card p-5" style={{ background: "var(--mp-rust)" }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--mp-on-rust)", opacity: 0.7 }}>{bankLabel}</p>
                {bankName && <p className="text-xs mb-1" style={{ color: "var(--mp-on-rust)", opacity: 0.8 }}>{bankName}</p>}
                <p className="text-xl font-black font-mono" style={{ color: "var(--mp-on-rust)" }}>{bankAcc}</p>
                {bankHolder && <p className="text-xs mt-1" style={{ color: "var(--mp-on-rust)", opacity: 0.8 }}>a/n {bankHolder}</p>}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );

  /* ── KAWAII ── */
  if (theme === "kawaii") return (
    <section id="contact" className="py-24" style={{ background: "var(--kw-bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-xl">
          <span className="kw-pill mb-3 inline-flex" style={{ background: "var(--kw-blush)", color: "var(--kw-text)" }}>♡ {headLabel}</span>
          <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--kw-text)" }}>
            {t("contact_title", "Siap Membantu Perjalanan Anda")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--kw-subtext)" }}>
            {t("contact_desc", "Konsultasikan perjalanan impian Anda bersama kami.")}
          </p>
        </div>

        <div className="max-w-2xl">
          <div className="space-y-4">
            {contacts.map(({ Icon, label, value, href }) => (
              <div key={label} className="kw-card p-5 flex items-start gap-4" style={{ background: "var(--kw-peach)" }}>
                <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ background: "var(--kw-card)", borderColor: "var(--kw-border)", boxShadow: "2px 2px 0 0 var(--kw-shadow)" }}>
                  <Icon size={14} style={{ color: "var(--kw-border)" }} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--kw-subtext)" }}>{label}</p>
                  {href
                    ? <a href={href} className="text-sm font-black hover:opacity-70 transition-opacity" style={{ color: "var(--kw-text)" }}>{value}</a>
                    : <p className="text-sm font-black leading-relaxed" style={{ color: "var(--kw-text)" }}>{value}</p>}
                </div>
              </div>
            ))}
            {bankAcc && (
              <div className="kw-card p-5" style={{ background: "var(--kw-sky)" }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--kw-subtext)" }}>{bankLabel}</p>
                {bankName && <p className="text-xs mb-1" style={{ color: "var(--kw-subtext)" }}>{bankName}</p>}
                <p className="text-xl font-black font-mono" style={{ color: "var(--kw-text)" }}>{bankAcc}</p>
                {bankHolder && <p className="text-xs mt-1" style={{ color: "var(--kw-subtext)" }}>a/n {bankHolder}</p>}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );

  /* ── Y2K KAWAII (attic) ── */
  if (theme === "attic") return (
    <section id="contact" className="atc-box atc-font p-4 sm:p-5">
      <h2 className="atc-title text-xl">{headLabel} ✉</h2>
      <hr className="atc-divider" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contacts.map(({ Icon, label, value, href }) => (
          <div key={label} className="atc-box p-3 flex items-center gap-3" style={{ background: "var(--atc-pink-soft)" }}>
            <Icon size={15} style={{ color: "var(--atc-pink-deep)" }} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--atc-ink-soft)" }}>{label}</p>
              {href
                ? <a href={href} className="text-xs font-bold" style={{ color: "var(--atc-link)", textDecoration: "underline" }}>{value}</a>
                : <p className="text-xs font-bold" style={{ color: "var(--atc-ink)" }}>{value}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  /* ── TROPICAL ── */
  if (theme === "teri") return (
    <section id="contact" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-xl">
          <span className="teri-pill mb-3 inline-flex">✦ {headLabel}</span>
          <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--teri-ink)" }}>
            {t("contact_title", "Siap Membantu Perjalanan Anda")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--teri-sub)" }}>
            {t("contact_desc", "Konsultasikan perjalanan impian Anda bersama kami.")}
          </p>
        </div>
        <div className="max-w-2xl">
          <div className="space-y-7">
            {contacts.map(({ Icon, label, value, href }) => (
              <div key={label} className="teri-card p-5 flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center shrink-0"
                  style={{ background: "var(--teri-accent)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }}>
                  <Icon size={15} style={{ color: "var(--teri-on-accent)" }} />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: "var(--teri-sub)" }}>{label}</p>
                  {href
                    ? <a href={href} className="text-sm font-extrabold hover:opacity-65 transition-opacity" style={{ color: "var(--teri-ink)" }}>{value}</a>
                    : <p className="text-sm font-extrabold leading-relaxed" style={{ color: "var(--teri-ink)" }}>{value}</p>}
                </div>
              </div>
            ))}
            {bankAcc && (
              <div className="teri-card p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest mb-3" style={{ color: "var(--teri-sub)" }}>{bankLabel}</p>
                {bankName && <p className="text-xs mb-1" style={{ color: "var(--teri-sub)" }}>{bankName}</p>}
                <p className="text-xl font-black font-mono" style={{ color: "var(--teri-ink)" }}>{bankAcc}</p>
                {bankHolder && <p className="text-xs mt-1" style={{ color: "var(--teri-sub)" }}>a/n {bankHolder}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  if (theme === "tropical") return (
    <section id="contact" className="py-24" style={{ background: "var(--tr-bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-xl">
          <span className="tr-pill mb-3 inline-flex" style={{ background: "var(--tr-pink)", color: "var(--tr-text)" }}>🌍 {headLabel}</span>
          <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--tr-text)" }}>
            {t("contact_title", "Siap Membantu Perjalanan Anda")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--tr-subtext)" }}>
            {t("contact_desc", "Konsultasikan perjalanan impian Anda bersama kami.")}
          </p>
        </div>

        <div className="max-w-2xl">
          <div className="space-y-4">
            {contacts.map(({ Icon, label, value, href }, i) => {
              const bgs = ["var(--tr-mint)", "var(--tr-sky)", "var(--tr-peach)", "var(--tr-pink)"];
              return (
                <div key={label} className="tr-card p-5 flex items-start gap-4" style={{ background: bgs[i % bgs.length] }}>
                  <div className="w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0"
                    style={{ background: "var(--tr-card)", borderColor: "var(--tr-border)", boxShadow: "2px 2px 0 0 var(--tr-shadow)" }}>
                    <Icon size={14} style={{ color: "var(--tr-text)" }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--tr-subtext)" }}>{label}</p>
                    {href
                      ? <a href={href} className="text-sm font-black hover:opacity-70 transition-opacity" style={{ color: "var(--tr-text)" }}>{value}</a>
                      : <p className="text-sm font-black leading-relaxed" style={{ color: "var(--tr-text)" }}>{value}</p>}
                  </div>
                </div>
              );
            })}
            {bankAcc && (
              <div className="tr-card p-5" style={{ background: "var(--tr-sun)" }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--tr-subtext)" }}>{bankLabel}</p>
                {bankName && <p className="text-xs mb-1" style={{ color: "var(--tr-subtext)" }}>{bankName}</p>}
                <p className="text-xl font-black font-mono" style={{ color: "var(--tr-text)" }}>{bankAcc}</p>
                {bankHolder && <p className="text-xs mt-1" style={{ color: "var(--tr-subtext)" }}>a/n {bankHolder}</p>}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );

  /* ── PIXEL ── */
  if (theme === "pixel") return (
    <section id="contact" className="py-14 sm:py-20 lg:py-24 relative" style={{
      background: "var(--px-bg)",
      backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
      backgroundSize: "24px 24px",
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-16 max-w-xl">
          <span className="px-pill mb-3 inline-flex" style={{ background: "var(--px-cyan)", color: "var(--px-on-cyan)" }}>► {headLabel.toUpperCase()}</span>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black mt-2 sm:mt-3 leading-tight" style={{ color: "var(--px-text)", fontFamily: "monospace" }}>
            {t("contact_title", "Siap Membantu Perjalanan Anda")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>
            {t("contact_desc", "Konsultasikan perjalanan impian Anda bersama kami.")}
          </p>
        </div>

        <div className="max-w-2xl">
          <div className="space-y-4">
            {contacts.map(({ Icon, label, value, href }, i) => {
              const bgs = ["var(--px-cyan)", "var(--px-yellow)", "var(--px-purple)", "var(--px-green)"];
              const fgs = ["var(--px-text)", "var(--px-text)", "#ffffff", "var(--px-text)"];
              return (
                <div key={label} className="px-card p-4 sm:p-5 flex items-start gap-3 sm:gap-4" style={{ background: bgs[i % bgs.length] }}>
                  <div className="w-9 h-9 border-2 flex items-center justify-center shrink-0"
                    style={{ background: "var(--px-card)", borderColor: "var(--px-border)", boxShadow: "2px 2px 0 0 var(--px-shadow)" }}>
                    <Icon size={14} style={{ color: "var(--px-border)" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: fgs[i % fgs.length], fontFamily: "monospace", opacity: 0.7 }}>{label}</p>
                    {href
                      ? <a href={href} className="break-words text-sm font-black hover:opacity-70 transition-opacity" style={{ color: fgs[i % fgs.length], fontFamily: "monospace" }}>{value}</a>
                      : <p className="break-words text-sm font-black leading-relaxed" style={{ color: fgs[i % fgs.length], fontFamily: "monospace" }}>{value}</p>}
                  </div>
                </div>
              );
            })}
            {bankAcc && (
              <div className="px-card p-4 sm:p-5" style={{ background: "var(--px-card)" }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>{bankLabel.toUpperCase()}</p>
                {bankName && <p className="text-xs mb-1" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>{bankName}</p>}
                <p className="text-xl font-black font-mono" style={{ color: "var(--px-text)" }}>{bankAcc}</p>
                {bankHolder && <p className="text-xs mt-1" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>A/N {bankHolder.toUpperCase()}</p>}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );

  /* ── CLASSIC / VIBRANT / BOLD ── */
  return (
    <section id="contact" className="py-24 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-16 max-w-xl">
          <p className="text-xs tracking-[0.15em] uppercase text-gray-400 mb-4">{headLabel}</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t("contact_title", "Siap Membantu Perjalanan Anda")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("contact_desc", "Konsultasikan perjalanan impian Anda bersama kami.")}
          </p>
        </div>

        <div className="max-w-2xl">
          <div className="space-y-6">
            {contacts.map(({ Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4 pb-6 border-b border-gray-100 dark:border-gray-900 last:border-0">
                <Icon size={16} className="mt-0.5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                  {href
                    ? <a href={href} className="text-sm text-gray-900 dark:text-white font-medium hover:underline">{value}</a>
                    : <p className="text-sm text-gray-900 dark:text-white font-medium">{value}</p>}
                </div>
              </div>
            ))}

            {bankAcc && (
              <div className="pt-2">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-3">{bankLabel}</p>
                {bankName && <p className="text-xs text-gray-500 mb-0.5">{bankName}</p>}
                <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">{bankAcc}</p>
                {bankHolder && <p className="text-xs text-gray-400 mt-0.5">a/n {bankHolder}</p>}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
