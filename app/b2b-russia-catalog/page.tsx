import type { Metadata } from "next";
import Image from "next/image";
import { Download, LockKeyhole, LogOut } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCatalogAccessPasswordId } from "@/lib/b2b-catalog";

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

const catalogBackgroundSrc = "/b2b-russia-catalog-background.png?v=84402c40";
const catalogSectionStyle = {
  minHeight: "max(100vh, calc(100vw * 1821 / 864))",
};

function CatalogSketchBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src={catalogBackgroundSrc}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-top opacity-[0.82] saturate-[1.05] dark:opacity-[0.48] dark:brightness-90"
      />
      <div className="absolute inset-0 bg-white/10 dark:bg-gray-950/30" />
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
      <section
        className="relative isolate overflow-hidden bg-white px-4 pt-28 pb-16 dark:bg-gray-950 sm:px-6 lg:px-8"
        style={catalogSectionStyle}
      >
        <CatalogSketchBackground />
        <div className="relative mx-auto w-full max-w-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              <LockKeyhole size={22} />
            </div>
          </div>
          <h1 className="text-center text-2xl font-semibold text-gray-950 dark:text-white">
            B2B Russia Tour Catalog
          </h1>

          <form action="/api/b2b-catalog/login" method="post" className="mt-8 space-y-3">
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-base text-gray-950 outline-none transition focus:border-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-white"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
            >
              Masuk
            </button>
          </form>

          {hasError(sp.error) && (
            <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">Password tidak valid.</p>
          )}
        </div>
      </section>
    );
  }

  const documents = await prisma.b2bCatalogDocument.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <section
      className="relative isolate overflow-hidden bg-white px-4 pt-28 pb-16 dark:bg-gray-950 sm:px-6 lg:px-8"
      style={catalogSectionStyle}
    >
      <CatalogSketchBackground />
      <div className="relative mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-950 dark:text-white">B2B Russia Tour Catalog</h1>
          <form action="/api/b2b-catalog/logout" method="post">
            <button
              type="submit"
              aria-label="Keluar"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
            >
              <LogOut size={17} />
            </button>
          </form>
        </div>

        {documents.length === 0 ? (
          <div className="rounded-lg border border-gray-200 px-5 py-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            Belum ada PDF.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
            {documents.map((document) => (
              <a
                key={document.id}
                href={`/api/b2b-catalog/documents/${document.id}/download`}
                className="flex items-center justify-between gap-4 bg-white px-4 py-4 text-gray-950 transition hover:bg-gray-50 dark:bg-gray-950 dark:text-white dark:hover:bg-gray-900 sm:px-5"
              >
                <span className="min-w-0 truncate text-sm font-medium sm:text-base">{document.title}</span>
                <Download size={18} className="shrink-0 text-gray-400" />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
