import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { toWaNumber } from "@/lib/utils";
import { MessageCircle, FileCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Layanan Pengurusan Visa",
  description:
    "Jasa pengurusan visa berbagai negara — proses jelas, dibimbing sampai selesai oleh Sundaf Trip.",
};

interface VisaRow { country: string; type: string; price: string; estimate: string; note: string; }

/* Parse teks katalog visa: 1 baris = Negara | Jenis | Harga | Estimasi | Catatan */
function parseVisa(raw: string): VisaRow[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const p = line.split("|").map((s) => s.trim());
      return { country: p[0] ?? "", type: p[1] ?? "", price: p[2] ?? "", estimate: p[3] ?? "", note: p[4] ?? "" };
    })
    .filter((r) => r.country && r.type);
}

export default async function VisaPage() {
  const rows = await prisma.companyInfo.findMany({
    where: { key: { in: ["visa_catalog", "company_whatsapp", "company_name"] } },
  });
  const map: Record<string, string> = {};
  rows.forEach((r) => { map[r.key] = r.value; });
  const wa = toWaNumber(map["company_whatsapp"]);
  const items = parseVisa(map["visa_catalog"] ?? "");

  const byCountry: Record<string, VisaRow[]> = {};
  items.forEach((it) => { (byCountry[it.country] ??= []).push(it); });
  const countries = Object.keys(byCountry);

  const waLink = (extra?: string) =>
    `https://wa.me/${wa}?text=${encodeURIComponent(
      `Halo, saya ingin tanya layanan pengurusan visa${extra ? ` ${extra}` : ""}.`,
    )}`;

  return (
    <div className="min-h-screen pt-24 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-2 mb-2">
          <FileCheck size={20} style={{ color: "var(--site-accent,#2d6a4f)" }} />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Layanan</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Pengurusan Visa
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl leading-relaxed">
          Bantu uruskan visa berbagai negara — proses jelas, dokumen dibimbing, dipantau sampai selesai.
        </p>

        {countries.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Daftar layanan visa akan segera tersedia.
            </p>
            {wa && (
              <a href={waLink()} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold"
                style={{ background: "var(--site-accent,#2d6a4f)" }}>
                <MessageCircle size={15} /> Tanya via WhatsApp
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {countries.map((country) => (
              <section key={country}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-5 rounded-full" style={{ background: "var(--site-accent,#2d6a4f)" }} />
                  {country}
                </h2>
                <div className="space-y-2.5">
                  {byCountry[country].map((it, i) => (
                    <div key={i}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white">{it.type}</p>
                        {(it.estimate || it.note) && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {[it.estimate, it.note].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-sm" style={{ color: "var(--site-accent,#2d6a4f)" }}>
                          {it.price || "Tanya Harga"}
                        </span>
                        {wa && (
                          <a href={waLink(`${country} — ${it.type}`)} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-white text-xs font-semibold"
                            style={{ background: "var(--site-accent,#2d6a4f)" }}>
                            <MessageCircle size={13} /> Tanya
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
            <p className="text-xs text-gray-400 pt-2">
              Harga dapat berubah sewaktu-waktu. Hubungi kami untuk konfirmasi harga & dokumen terkini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
