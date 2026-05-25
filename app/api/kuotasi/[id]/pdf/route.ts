/* GET /api/kuotasi/[id]/pdf — stream branded Kuotasi PDF. */
import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getQuotation } from "@/lib/kuotasi/data";
import { KuotasiPDF } from "@/components/pdf/KuotasiPDF";

export const dynamic = "force-dynamic";

function slugify(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70) || "kuotasi";
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });
  if (!(await checkPermission(session, "kuotasi_view")))
    return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  const q = await getQuotation(id);
  if (!q) return new Response("Kuotasi tidak ditemukan", { status: 404 });

  const companyRows = await prisma.companyInfo.findMany({
    where: {
      key: {
        in: [
          "company_name", "company_logo", "company_whatsapp",
          "company_phone", "company_email", "company_website", "company_nib",
        ],
      },
    },
  });
  const ci: Record<string, string> = {};
  companyRows.forEach((c) => { ci[c.key] = c.value; });

  type PdfElement = Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(
    createElement(KuotasiPDF, {
      q: {
        title: q.title,
        country: q.country,
        durationDays: q.durationDays,
        currency: q.currency,
        kursForeign: q.kursForeign,
        marginPct: q.marginPct,
        validUntil: q.validUntil,
        notes: q.notes,
        days: q.days.map((d) => ({
          dayIndex: d.dayIndex,
          date: d.date,
          city: d.city,
          title: d.title,
          narrativeHtml: d.narrativeHtml,
          highlights: d.highlights,
        })),
        pricings: q.pricings.map((p) => ({ paxCount: p.paxCount, sellingIdr: p.sellingIdr })),
        addons: q.addons.map((a) => ({ label: a.label, priceIdr: a.priceIdr, notes: a.notes })),
      },
      company: {
        name: ci["company_name"],
        logo: ci["company_logo"],
        whatsapp: ci["company_whatsapp"],
        phone: ci["company_phone"],
        email: ci["company_email"],
        website: ci["company_website"],
        nib: ci["company_nib"],
      },
    }) as unknown as PdfElement,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Kuotasi-${slugify(q.title)}.pdf"`,
      "Cache-Control": "no-store, must-revalidate",
    },
  });
}
