import type { Metadata } from "next";
import Image from "next/image";
import { Download, LogOut } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCatalogAccessPasswordId } from "@/lib/b2b-catalog";
import B2BCatalogLoginForm from "@/components/website/B2BCatalogLoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "B2B Russia Tour Catalog | Sundaf Trip",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

type PageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

function hasError(value?: string | string[]) {
  return Array.isArray(value) ? Boolean(value[0]) : Boolean(value);
}

const catalogBackgroundSrc = "/b2b-russia-catalog-background.png?v=2a6be203";
const catalogDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
const mathPaperGridStyle = {
  backgroundImage:
    "linear-gradient(rgba(37, 99, 235, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.12) 1px, transparent 1px), linear-gradient(rgba(37, 99, 235, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.07) 1px, transparent 1px)",
  backgroundSize: "96px 96px, 96px 96px, 24px 24px, 24px 24px",
  backgroundPosition: "-1px -1px",
};

function formatCatalogUpdatedAt(date: Date) {
  return catalogDateFormatter.format(date);
}

function CatalogSketchBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src={catalogBackgroundSrc}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-top opacity-[0.46] saturate-[0.92]"
      />
      <div className="absolute inset-0 bg-white/30" />
      <div
        className="absolute inset-0 opacity-70 mix-blend-multiply"
        style={mathPaperGridStyle}
      />
    </div>
  );
}

async function getAccess() {
  const passwordId = await getCatalogAccessPasswordId();
  if (!passwordId) return null;

  return prisma.b2bCatalogPassword.findFirst({
    where: { id: passwordId, active: true },
    select: { id: true },
  });
}

export default async function B2BRussiaCatalogPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const access = await getAccess();

  if (!access) {
    return (
      <section className="relative isolate min-h-[100svh] overflow-hidden bg-white px-5 pt-14 pb-10 sm:min-h-screen sm:px-6 sm:pt-28 sm:pb-16 lg:px-8">
        <CatalogSketchBackground />
        <B2BCatalogLoginForm showError={hasError(sp.error)} />
      </section>
    );
  }

  const documents = await prisma.b2bCatalogDocument.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-white px-5 pt-14 pb-10 sm:min-h-screen sm:px-6 sm:pt-28 sm:pb-16 lg:px-8">
      <CatalogSketchBackground />
      <div className="relative mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-start justify-between gap-4 sm:mb-8 sm:items-center">
          <h1 className="text-xl font-semibold leading-tight text-gray-950 sm:text-2xl">B2B Russia Tour Catalog</h1>
          <form action="/api/b2b-catalog/logout" method="post">
            <button
              type="submit"
              aria-label="Keluar"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-white/85 text-gray-500 transition hover:bg-white hover:text-gray-900"
            >
              <LogOut size={17} />
            </button>
          </form>
        </div>

        {documents.length === 0 ? (
          <div className="rounded-lg border-2 border-black bg-white/90 px-5 py-10 text-center text-sm text-gray-500 shadow-sm">
            Belum ada PDF.
          </div>
        ) : (
          <div className="divide-y-2 divide-black overflow-hidden rounded-lg border-2 border-black bg-white/90 shadow-sm">
            {documents.map((document) => (
              <a
                key={document.id}
                href={`/api/b2b-catalog/documents/${document.id}/download`}
                className="flex min-h-16 items-center justify-between gap-4 px-4 py-4 text-gray-950 transition hover:bg-white sm:px-5"
              >
                <span className="min-w-0 space-y-1">
                  <span className="block truncate text-sm font-medium sm:text-base">{document.title}</span>
                  <span className="block text-[10px] font-normal leading-snug text-gray-500 sm:text-xs">
                    Dokumen diperbarui tanggal {formatCatalogUpdatedAt(document.updatedAt)}
                  </span>
                </span>
                <Download size={18} className="shrink-0 text-gray-400" />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
