/** Offline render audit. No database writes or network requests.
 * Input: public fixture export { source, liveVerified, company, tours }.
 * Remote photos are represented by local photos; their live availability is
 * deliberately outside this audit. Run with: npx tsx scripts/audit-itinerary-catalog.ts input.json output-dir
 */
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { cloneElement } from "react";
import { pdf } from "@react-pdf/renderer";
import { ItineraryPDF, type ItineraryPDFProps, type PdfAddOn } from "../components/pdf/ItineraryPDF";
import { localizePdfTour } from "../lib/itinerary-pdf-localization";
import { formatCurrency, formatDate } from "../lib/utils";
import { getCommerceTourStatus } from "../lib/tour-commerce";
import { buildTourPaymentPlan } from "../lib/tour-payment-plan";
import { isPublicTourVisible } from "../lib/public-tours";

type Fixture = Omit<ItineraryPDFProps["tour"], "addOns"> & {
  slug: string; status: string; tripDate: string | null;
  price: number; promoPrice?: number | null; priceLandTour?: number | null;
  addOns: Array<PdfAddOn & { price: number }>; paymentPlan?: unknown;
};
interface LayoutNode {
  type: string; props?: { fixed?: boolean; render?: unknown };
  box?: { top: number; height: number; width: number; paddingTop?: number; paddingBottom?: number };
  lines?: Array<{ box: { height: number }; xAdvance: number; overflowRight?: number; string?: string }>;
  children?: LayoutNode[];
}

function validateLayout(layout: LayoutNode) {
  assert.ok(layout.children?.length, "empty document");
  for (const [index, page] of layout.children.entries()) {
    assert.ok(page.box);
    const minY = page.box.paddingTop || 0;
    const maxY = page.box.height - (page.box.paddingBottom || 0);
    let pageNumbers = 0;
    let bodyText = 0;
    function visit(node: LayoutNode, parentY = 0, parentFixed = false) {
      const fixed = parentFixed || node.props?.fixed === true;
      const y = parentY + (node.box?.top || 0);
      const where = `page ${index + 1}`;
      if (node.type === "TEXT") {
        if (node.props?.render && fixed) {
          pageNumbers += 1;
          assert.ok(node.lines?.length && node.box && node.box.width > 0 && node.box.height > 0, `${where}: missing page number`);
        }
        if (!fixed && node.lines?.length && node.box) {
          bodyText += 1;
          assert.ok(node.box.height > 0, `${where}: zero-height text`);
          assert.ok(node.box.height + 0.6 >= node.lines.reduce((sum, line) => sum + line.box.height, 0), `${where}: shrunk text`);
          for (const line of node.lines) assert.ok(line.xAdvance - (line.overflowRight || 0) <= node.box.width + 0.6, `${where}: horizontal overflow (${line.xAdvance - (line.overflowRight || 0)} / ${node.box.width}): ${line.string}`);
          assert.ok(y >= minY - 0.6 && y + node.box.height <= maxY + 0.6, `${where}: text outside margins`);
        }
        return;
      }
      if (!fixed && node.type === "IMAGE" && node.box) assert.ok(y >= minY - 0.6 && y + node.box.height <= maxY + 0.6, `${where}: image outside margins`);
      for (const child of node.children || []) visit(child, y, fixed);
    }
    for (const child of page.children || []) visit(child);
    assert.equal(pageNumbers, 1, `page ${index + 1}: page number count`);
    assert.ok(bodyText, `page ${index + 1}: empty page`);
  }
  return layout.children.length;
}

async function main() {
  assert.ok(process.argv[2] && process.argv[3], "Provide public fixture JSON and output directory");
  const input = JSON.parse(await readFile(process.argv[2], "utf8")) as {
    source: string; liveVerified: boolean; company: ItineraryPDFProps["company"]; tours: Fixture[];
  };
  const output = path.resolve(process.argv[3]);
  await mkdir(output, { recursive: true });
  async function image(file: string, mime: string) {
    return `data:${mime};base64,${(await readFile(file)).toString("base64")}`;
  }
  const photos = await Promise.all(["hero-sapa.jpg", "hanoi-street.jpg", "halong-sunset.jpg"].map((file) => image(path.join("public/vietnam/assets", file), "image/jpeg")));
  const company = { ...input.company, logo: await image("public/logo.png", "image/png") };
  const results: Array<{ slug: string; days: number; pages?: number; bytes?: number; error?: string }> = [];
  for (const source of input.tours) {
    try {
      assert.match(source.slug, /^[a-z0-9-]+$/, "unsafe output slug");
      assert.ok(Number.isFinite(source.price) && source.price > 0, "invalid base price");
      const addOns = (source.addOns || []).map((item) => ({ ...item, priceLabel: formatCurrency(item.price) }));
      const mandatory = addOns.filter((item) => item.tag === "wajib");
      const base = source.promoPrice ?? source.price;
      const total = base + mandatory.reduce((sum, item) => sum + item.price, 0);
      const commerceStatus = getCommerceTourStatus(source);
      const tour = localizePdfTour({ ...source, tripDateLabel: source.tripDate ? formatDate(source.tripDate) : null, heroImg: photos[0], gallery: photos, addOns });
      const data: ItineraryPDFProps = {
        tour: { ...tour, addOns: tour.addOns.filter((item) => item.tag !== "wajib") }, company,
        priceLabel: formatCurrency(base), inclusivePriceLabel: formatCurrency(total),
        priceCoretLabel: source.promoPrice ? formatCurrency(source.price) : null,
        landTourLabel: source.priceLandTour ? formatCurrency(source.priceLandTour) : null,
        mandatoryAddOns: tour.addOns.filter((item) => item.tag === "wajib"), commerceStatus,
        paymentPlan: isPublicTourVisible(source) && source.status !== "CANCELLED" && ["available", "last_seats", "confirmed", "flexible"].includes(commerceStatus)
          ? buildTourPaymentPlan({ totalAmount: total, departureDate: source.tripDate, seatsLeft: source.seatsLeft, paymentPlanConfig: source.paymentPlan }) : null,
        faqUrl: "https://sundaftrip.com/faq",
      };
      let layout: LayoutNode | undefined;
      const document = cloneElement(ItineraryPDF(data), { onRender: (result: unknown) => {
        layout = (result as { _INTERNAL__LAYOUT__DATA_: LayoutNode })._INTERNAL__LAYOUT__DATA_;
      } });
      const stream = await pdf(document).toBuffer();
      const chunks: Buffer[] = [];
      for await (const chunk of stream) chunks.push(Buffer.from(chunk));
      const buffer = Buffer.concat(chunks);
      assert.ok(layout);
      // Preserve a failed render for visual diagnosis; no output is published.
      await writeFile(path.join(output, `${source.slug}.pdf`), buffer);
      const pages = validateLayout(layout);
      results.push({ slug: source.slug, days: source.itinerary.length, pages, bytes: buffer.length });
      console.log(`PASS ${source.slug}: ${pages} pages`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ slug: source.slug, days: source.itinerary.length, error: message });
      console.error(`FAIL ${source.slug}: ${message}`);
    }
  }
  await writeFile(path.join(output, "render-audit.json"), JSON.stringify({ source: input.source, liveVerified: input.liveVerified, imageScope: "Local photos used as layout fixtures; remote asset availability not tested", results }, null, 2));
  if (results.some((result) => result.error)) process.exitCode = 1;
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
