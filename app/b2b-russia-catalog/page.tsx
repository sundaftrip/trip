import type { Metadata } from "next";
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

function CatalogSketchBackground() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full text-[#00ADB5] opacity-[0.16] dark:opacity-[0.24]"
      viewBox="0 0 1200 760"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="catalog-pencil-grain" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M1 17 17 1M-4 9 9-4M9 22 22 9" stroke="currentColor" strokeWidth="0.5" opacity="0.22" />
        </pattern>
      </defs>

      <rect width="1200" height="760" fill="url(#catalog-pencil-grain)" opacity="0.16" />

      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(96 218)"
      >
        <path d="M44 352h324M72 352c-8-48 4-84 36-108 22-16 47-24 76-24 36 0 65 13 86 38 39 1 70 13 92 36 17 18 26 37 28 58" strokeWidth="2.2" opacity="0.55" />
        <path d="M122 338c-3-31 7-57 29-79 23-22 51-33 84-33 35 0 64 12 88 35" strokeWidth="1.1" opacity="0.35" />

        <path d="M112 332V154l46-76 47 76v178" strokeWidth="2" />
        <path d="M132 156h54M124 178h70M142 202h34M136 226h46M130 250h58M124 276h70M134 302h50" strokeWidth="1.1" opacity="0.85" />
        <path d="M158 78c-19 18-30 38-34 60 24 10 48 10 72 0-5-23-17-43-38-60Z" strokeWidth="2" />
        <path d="M158 78c-4 22-3 43 0 65M136 96c10 16 17 31 22 47M181 98c-11 15-18 30-23 45" strokeWidth="1.1" opacity="0.75" />
        <path d="M158 54v24M150 58h16M158 44c-4 4-4 8 0 12 5-4 5-8 0-12Z" strokeWidth="1.4" />

        <path d="M216 352V130l38-62 37 62v222" strokeWidth="2.2" />
        <path d="M254 68c-26 14-41 33-46 58 30 13 61 13 92 0-6-25-21-44-46-58Z" strokeWidth="2.2" />
        <path d="M254 68c-4 23-4 45 0 67M226 89c13 16 23 32 28 46M282 90c-13 16-22 31-28 45" strokeWidth="1.1" opacity="0.75" />
        <path d="M234 154h40M226 178h56M222 204h64M220 231h68M219 260h70M223 291h62M232 321h44" strokeWidth="1.1" opacity="0.85" />
        <path d="M254 36v32M245 44h18M254 24c-5 5-5 10 0 16 6-6 6-11 0-16Z" strokeWidth="1.5" />

        <path d="M300 352V172l42-64 43 64v180" strokeWidth="2" />
        <path d="M342 108c-22 18-35 37-39 58 26 11 53 11 79 0-5-22-18-41-40-58Z" strokeWidth="2" />
        <path d="M319 185h46M313 211h58M309 238h66M312 267h60M320 297h44M326 326h32" strokeWidth="1.1" opacity="0.85" />
        <path d="M342 84v24M334 89h16" strokeWidth="1.3" />

        <path d="M56 352V214l28-44 28 44v138" strokeWidth="1.8" opacity="0.9" />
        <path d="M84 170c-17 15-27 29-29 45 19 8 39 8 58 0-3-17-13-31-29-45Z" strokeWidth="1.8" opacity="0.9" />
        <path d="M78 230h12M70 256h28M68 284h32M72 313h24" strokeWidth="1" opacity="0.7" />

        <path d="M395 352V222l28-46 28 46v130" strokeWidth="1.8" opacity="0.9" />
        <path d="M423 176c-16 14-25 29-28 45 19 8 38 8 57 0-3-17-13-31-29-45Z" strokeWidth="1.8" opacity="0.9" />
        <path d="M410 242h26M405 270h36M407 300h32M414 328h18" strokeWidth="1" opacity="0.7" />

        <path d="M20 358c45-8 92-10 140-7M188 350c47-5 95-4 144 2M358 354c40-4 74-2 102 5" strokeWidth="0.9" opacity="0.35" />
        <path d="M36 386c88-18 172-21 253-8M314 379c39-5 81-2 124 8" strokeWidth="0.9" opacity="0.26" />
      </g>

      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(676 182)"
      >
        <path d="M134 186c27-10 64-12 92-5 25 6 47 17 72 20 24 2 49-2 73 5 20 6 36 18 58 21" strokeWidth="2.1" opacity="0.72" />
        <path d="M23 192c22 7 43 6 66 3 18-3 38-7 54-1 12 5 26 15 42 16" strokeWidth="2.1" opacity="0.72" />
        <path d="M12 230c37-13 75-13 111-2 29 9 59 24 91 19 31-5 60-29 92-25 27 3 51 25 78 29 24 3 46-8 68-2" strokeWidth="1.1" opacity="0.34" />

        <path d="M64 250c16-6 31-5 45 2 10 5 20 5 30 0 12-6 25-8 37-3" strokeWidth="2" />
        <path d="M198 251c22-8 43-6 63 5 18 9 38 9 60 1 22-8 44-8 66 0" strokeWidth="2" />
        <path d="M418 255c20-8 39-8 58 2 15 8 30 8 46 0" strokeWidth="2" />

        <path d="M30 300c34-20 70-27 108-21 22 3 42 12 63 19 24 8 47 10 72 2 32-10 61-31 95-27 28 3 54 23 82 28 29 5 56-4 83 3" strokeWidth="1.3" opacity="0.48" />
        <path d="M104 318c19-8 39-7 58 1M239 325c23-9 47-9 72 0M389 321c26-9 52-8 79 1" strokeWidth="1" opacity="0.35" />

        <path d="M71 83c20-3 36-12 50-27 12-13 27-23 45-27 19-4 35 1 49 15 18 18 41 24 68 19 21-4 41 1 59 15 14 12 31 18 52 18" strokeWidth="1.8" opacity="0.52" />
        <path d="M90 118c25 3 47-2 66-15 15-10 31-13 49-8 24 7 49 8 75 2 20-5 38-2 54 9 22 15 47 22 77 20" strokeWidth="1.2" opacity="0.34" />
        <path d="M118 48c-7 18-7 34 0 49M160 31c-6 25-5 50 3 75M220 52c-5 19-4 38 2 56M308 74c-4 17-2 35 6 52" strokeWidth="0.9" opacity="0.28" />

        <path d="M38 394c21-8 40-7 59 5M122 402c26-11 52-11 79 0M233 397c24-10 49-9 75 3M350 402c22-9 45-8 68 4M456 398c18-7 34-6 49 4" strokeWidth="1.4" opacity="0.55" />
      </g>
    </svg>
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
      <section className="relative isolate min-h-[70vh] overflow-hidden bg-white px-4 pt-28 pb-16 dark:bg-gray-950 sm:px-6 lg:px-8">
        <CatalogSketchBackground />
        <div className="relative mx-auto max-w-sm">
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
    <section className="relative isolate min-h-[70vh] overflow-hidden bg-white px-4 pt-28 pb-16 dark:bg-gray-950 sm:px-6 lg:px-8">
      <CatalogSketchBackground />
      <div className="relative mx-auto max-w-2xl">
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
