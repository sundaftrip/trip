import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Handshake,
  Mail,
  MessageCircle,
  Phone,
  Route,
  ShieldCheck,
} from "lucide-react";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import { getProofPhotos } from "@/lib/b2bGallery";
import { lora } from "@/lib/fonts";

const PAGE_URL = "https://sundaftrip.com/partnership-relation";
const CONTACT_EMAIL = "tyas@sundaftrip.com";
const FALLBACK_EMAIL = "info@sundaftrip.com";
const CONTACT_WA =
  "https://wa.me/6281775202759?text=Hello%20Tyas%20and%20the%20Sundaf%20Trip%20team%2C%20I%20would%20like%20to%20introduce%20our%20supplier%20or%20DMC%20services.";
const CORPORATE_IDENTITY_DESCRIPTION =
  "Sundaf Trip Group is the corporate-facing identity of Sundaf Trip, a travel and tour operations brand operated by CV Sundaf Holiday Group, an Indonesian limited partnership.";

export const metadata: Metadata = {
  title: "Sundaf Trip Group - Travel Operations & Supplier Relations",
  description:
    "Sundaf Trip Group supplier relations page for suppliers, DMCs, hotels, transportation providers, guides, restaurants, and operational partners.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Sundaf Trip Group - Travel Operations & Supplier Relations",
    description:
      "Official corporate-facing supplier relations page for Sundaf Trip travel operations and partner coordination.",
    url: PAGE_URL,
    siteName: "Sundaf Trip",
    type: "website",
  },
};

const whyContacted = [
  {
    Icon: Route,
    title: "Mencari partner operasional yang relevan",
    desc: "Sundaf Trip meninjau supplier untuk kebutuhan itinerary, quotation, custom trip, dan pengembangan produk destinasi.",
  },
  {
    Icon: FileText,
    title: "Merapikan informasi sebelum masuk ke tim",
    desc: "Coverage, rate, terms, PIC, dan batasan operasional perlu jelas agar tim kami bisa menilai kecocokan tanpa bolak-balik bertanya hal dasar.",
  },
  {
    Icon: ShieldCheck,
    title: "Menjaga komunikasi B2B tetap profesional",
    desc: "Supplier yang responsif, transparan, dan konsisten akan lebih mudah masuk ke shortlist ketika ada kebutuhan trip nyata.",
  },
];

const supplierTypes = [
  "DMC dan land operator",
  "Hotel dan accommodation partner",
  "Transport provider",
  "Restoran dan meal partner",
  "Local guide dan tour support",
  "Attraction, ticketing, dan experience provider",
];

const requiredInfo = [
  "Company profile, legal entity, dan alamat operasional",
  "Destinasi, kota, atau service coverage yang benar-benar dikuasai",
  "B2B rate sheet, sample package, atau price range indikatif",
  "Inclusions, exclusions, payment terms, dan cancellation policy",
  "Kontak PIC untuk quotation, operation, dan emergency coordination",
  "Foto produk, fact sheet, atau materi yang boleh dipakai untuk penawaran",
];

const nextSteps = [
  "Tyas menerima dan merapikan informasi supplier.",
  "Tim Sundaf Trip meninjau kecocokan layanan dengan rute dan kebutuhan produk.",
  "Jika relevan, supplier dapat diminta quotation untuk itinerary atau request nyata.",
  "Data partner yang cocok disimpan sebagai referensi kerja sama berikutnya.",
];

export default function SupplierRelationsPage() {
  const proofPhotos = getProofPhotos().slice(0, 4);
  const webPageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: "Sundaf Trip Group - Travel Operations & Supplier Relations",
        description:
          "Official corporate-facing supplier relations page for Sundaf Trip travel operations and partner coordination.",
        isPartOf: { "@id": "https://sundaftrip.com#website" },
        about: { "@id": `${PAGE_URL}#person` },
      },
      {
        "@type": "Person",
        "@id": `${PAGE_URL}#person`,
        name: "Tyas",
        jobTitle: "Partnership Relation",
        worksFor: { "@id": "https://sundaftrip.com#organization" },
        mainEntityOfPage: { "@id": `${PAGE_URL}#webpage` },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white pt-24 text-gray-900 dark:bg-slate-950 dark:text-white">
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Partnership Relation", url: "/partnership-relation" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <section className="relative overflow-hidden border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,173,181,0.10),transparent_36%,rgba(251,211,36,0.12))]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-700 shadow-sm dark:border-cyan-900/70 dark:bg-slate-900/70 dark:text-cyan-300">
              Sundaf Trip Group
            </span>
            <h1 className={`text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl ${lora.className}`}>
              Travel Operations &amp; Supplier Relations
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
              {CORPORATE_IDENTITY_DESCRIPTION}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
              This section is specifically for suppliers, DMCs, hotels, transportation providers, restaurants, guides, and operational partners.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Tyas supports the first supplier introduction, service review, and follow-up coordination for potential collaboration with Sundaf Trip.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={`mailto:${CONTACT_EMAIL}?cc=${FALLBACK_EMAIL}&subject=Supplier%20Profile%20-%20Sundaf%20Trip&body=Hello%20Tyas%20and%20the%20Sundaf%20Trip%20team%2C%0A%0AI%20would%20like%20to%20introduce%20our%20supplier%20or%20DMC%20services.%0A%0ACompany%3A%0ADestination%20%2F%20service%20coverage%3A%0APIC%3A%0ARate%20sheet%20%2F%20company%20profile%3A%0A`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
              >
                <Mail size={16} /> Submit your supplier profile
              </a>
              <Link
                href="/b2b"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-800 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-gray-700 dark:text-gray-100 dark:hover:border-cyan-600 dark:hover:text-cyan-300"
              >
                View our B2B profile <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
            <div className="flex min-h-[320px] flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900">
              <div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-600 text-3xl font-black text-white">
                  T
                </div>
                <p className={`mt-5 text-2xl font-bold ${lora.className}`}>Tyas</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-300">
                  Partnership Relation
                </p>
                <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  Kontak awal untuk memperkenalkan layanan supplier kepada Sundaf Trip.
                </p>
              </div>
              <div className="mt-8 grid gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="inline-flex items-center gap-2"><Handshake size={15} /> Supplier introduction</span>
                <span className="inline-flex items-center gap-2"><MessageCircle size={15} /> Follow-up quotation dan coverage</span>
                <span className="inline-flex items-center gap-2"><Building2 size={15} /> Sundaf Trip Group</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {proofPhotos.map((src, i) => (
                <div
                  key={src}
                  className="relative min-h-[150px] overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
                >
                  <Image
                    src={src}
                    alt={`Dokumentasi operasional Sundaf Trip ${i + 1}`}
                    fill
                    sizes="(min-width: 1024px) 220px, 45vw"
                    className="object-cover"
                    priority={i < 2}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-300">
              Kenapa saya menghubungi Anda
            </span>
            <h2 className={`mt-3 text-3xl font-bold leading-tight ${lora.className}`}>
              Kami sedang membangun daftar partner yang relevan untuk trip nyata
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Sundaf Trip tidak mengumpulkan kontak supplier hanya untuk arsip. Informasi yang masuk akan ditinjau berdasarkan kebutuhan itinerary, destinasi, quotation, dan standar layanan untuk traveler Indonesia.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {whyContacted.map(({ Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-gray-100 p-5 dark:border-gray-800">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
                  <Icon size={18} />
                </div>
                <h3 className="text-base font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-slate-900/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-300">
              Supplier yang relevan
            </span>
            <h2 className={`mt-3 text-3xl font-bold ${lora.className}`}>Jenis partner yang dapat menghubungi kami</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {supplierTypes.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-slate-950">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-cyan-700 dark:text-cyan-300" />
                  <p className="text-sm font-semibold leading-relaxed text-gray-800 dark:text-gray-200">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-950">
                <FileText size={19} />
              </div>
              <div>
                <p className="font-bold">Mohon kirimkan informasi awal</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Agar review tidak berhenti di chat pembuka.</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {requiredInfo.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-cyan-700 dark:text-cyan-300" />
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-300">
              Setelah Anda membalas
            </span>
            <h2 className={`mt-3 text-3xl font-bold leading-tight ${lora.className}`}>
              Alur follow-up dari Partnership Relation
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Tidak semua supplier langsung masuk ke quotation aktif. Namun data yang jelas membuat tim kami lebih mudah memutuskan kapan layanan Anda cocok digunakan.
            </p>
          </div>
          <div className="grid gap-3">
            {nextSteps.map((item, index) => (
              <div key={item} className="flex gap-4 rounded-2xl border border-gray-100 p-5 dark:border-gray-800">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-sm font-black text-white">
                  {index + 1}
                </div>
                <p className="text-sm font-semibold leading-relaxed text-gray-800 dark:text-gray-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 dark:border-gray-800">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-300">
              Kontak balasan
            </span>
            <h2 className={`mt-3 text-3xl font-bold ${lora.className}`}>Jika Anda menerima pesan dari saya</h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Balas melalui kanal yang sama atau kirimkan supplier introduction ke kontak resmi Sundaf Trip di bawah ini. Lampirkan profil, coverage, rate, terms, dan PIC agar percakapan bisa langsung masuk ke tahap review.
            </p>
          </div>
          <div className="rounded-2xl bg-gray-900 p-6 text-white shadow-sm dark:bg-white dark:text-gray-950">
            <p className={`text-2xl font-bold ${lora.className}`}>Tyas</p>
            <p className="mt-1 text-sm font-bold uppercase tracking-widest text-cyan-300 dark:text-cyan-700">
              Partnership Relation - Sundaf Trip
            </p>
            <p className="mt-5 text-sm leading-relaxed text-gray-300 dark:text-gray-700">
              CV Sundaf Holiday Group
            </p>
            <div className="mt-5 grid gap-3 text-sm">
              <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 hover:text-cyan-200 dark:hover:text-cyan-700">
                <Mail size={15} /> {CONTACT_EMAIL}
              </a>
              <a href={`mailto:${FALLBACK_EMAIL}`} className="inline-flex items-center gap-2 text-gray-300 hover:text-cyan-200 dark:text-gray-700 dark:hover:text-cyan-700">
                <Mail size={15} /> Fallback: {FALLBACK_EMAIL}
              </a>
              <a href={CONTACT_WA} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-cyan-200 dark:hover:text-cyan-700">
                <Phone size={15} /> Hubungi kanal resmi Sundaf Trip
              </a>
              <span className="inline-flex items-center gap-2 text-gray-300 dark:text-gray-700">
                <ArrowRight size={15} /> sundaftrip.com/partnership-relation
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
