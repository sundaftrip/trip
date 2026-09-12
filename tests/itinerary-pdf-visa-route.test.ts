import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { runInNewContext } from "node:vm";
import test from "node:test";
import { createElement } from "react";
import ts from "typescript";
import type { ItineraryPDFProps } from "../components/pdf/ItineraryPDF";
import * as localization from "../lib/itinerary-pdf-localization";
import * as downloads from "../lib/itinerary-pdf-download";
import * as visaAddOns from "../lib/itinerary-pdf-visa-offers";
import * as display from "../lib/tour-display";
import * as currency from "../lib/utils";
import * as companyPhone from "../lib/company-phone";

const routeCode = ts.transpileModule(readFileSync(new URL("../app/(website)/tours/[id]/pdf/route.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;

type Query = "tour" | "company" | "visa";
type Route = {
  GET(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response>;
};

function routeHarness(failure?: Query) {
  const error = new Error(`${failure} query unavailable`);
  const tour = {
    id: "test-tour", slug: "rusia-aurora-test", title: "Rusia Aurora", country: "Russia",
    cityHighlight: "Murmansk", price: 27_000_000, promoPrice: null, priceLandTour: null,
    status: "PUBLISHED", seatsLeft: 16, tripDate: new Date("2027-01-14T00:00:00Z"),
    gallery: [], itinerary: [], inclusions: ["Hotel dan sarapan"], exclusions: ["Visa Rusia"],
    notes: null, visaInfo: null,
    addOns: [
      { name: "Bagasi domestik Rusia", price: 2_500_000, tag: "wajib" },
      { name: "Visa Rusia", price: 1_400_000, tag: "recommended", desc: "Kutipan visa dari CMS." },
      { name: "Sami Village", price: 1_500_000, desc: "Tiket masuk dan kereta rusa." },
    ],
  };
  const catalog = [{ name: "Rusia", en: "Russia", visa: "evisa", servicePrice: "Rp 1.600.000", variants: [] }];
  const calls = { tour: 0, company: 0, visa: 0, render: 0 };
  let rendered: ItineraryPDFProps | undefined;
  let paymentTotal: number | undefined;
  async function query<T>(name: Query, value: T): Promise<T> {
    calls[name] += 1;
    if (failure === name) throw error;
    return value;
  }
  const exports = {} as Route;
  const missingAsset = async () => { throw new Error("No image assets in route harness"); };
  // Execute the actual route with real price/localization helpers. Only its
  // external boundaries (database, image IO, PDF encoding) are replaced.
  runInNewContext(routeCode, {
    exports, Response, Uint8Array, URL, Buffer,
    process: { env: { NODE_ENV: "production", DATABASE_URL: "harness-present" }, cwd: () => "/pdf-route-harness" },
    require: (name: string) => {
      const modules: Record<string, unknown> = {
        "node:path": path,
        "node:fs/promises": { readFile: missingAsset, realpath: missingAsset, stat: missingAsset },
        react: { createElement },
        "@react-pdf/renderer": {
          renderToBuffer: async (element: { props: ItineraryPDFProps }) => {
            calls.render += 1;
            rendered = element.props;
            return Buffer.from("%PDF-route-harness");
          },
        },
        "@/lib/prisma": { prisma: {
          tour: { findFirst: () => query("tour", tour) },
          companyInfo: { findMany: () => query("company", [{ key: "company_name", value: "CV Sundaf Holiday Group" }]) },
          countryVisa: { findMany: () => query("visa", catalog) },
        } },
        "@/lib/public-tours": { isPublicTourVisible: () => true },
        "@/lib/safe-image-url": {
          fetchPdfImageDataUrl: missingAsset, PDF_IMAGE_MAX_BYTES: 1,
          pdfImageBytesToDataUrl: missingAsset, validatePdfImageDataUrl: missingAsset,
        },
        "@/lib/itinerary-pdf-localization": localization,
        "@/lib/itinerary-pdf-download": downloads,
        "@/lib/itinerary-pdf-visa-offers": visaAddOns,
        "@/lib/tour-display": display,
        "@/lib/utils": currency,
        "@/lib/company-phone": companyPhone,
        "@/lib/tour-payment-plan": { buildTourPaymentPlan: (input: { totalAmount: number }) => {
          paymentTotal = input.totalAmount;
          return null;
        } },
        "@/lib/tour-commerce": { getCommerceTourStatus: () => "available" },
        "@/lib/canada-catalog-preview": {
          getCanadaRockiesPreviewTour: () => null,
          selectCanadaRockiesTourSource: (databaseTour: unknown) => databaseTour,
          resolveCanadaRockiesPdfNotes: (notes: unknown) => notes,
        },
        "@/components/pdf/ItineraryPDF": { ItineraryPDF: () => null },
        "@/prisma/visa-seed.json": [],
      };
      if (!(name in modules)) throw new Error(`Unexpected PDF route dependency: ${name}`);
      return modules[name];
    },
  });
  return {
    error, calls, tour,
    get rendered() { return rendered; },
    get paymentTotal() { return paymentTotal; },
    run: () => exports.GET(new Request("https://sundaftrip.com/tours/test-tour/pdf"), {
      params: Promise.resolve({ id: "test-tour" }),
    }),
  };
}

test("visa catalog failure preserves the downloadable tour, company and original optional quotes", async () => {
  const harness = routeHarness("visa");
  const response = await harness.run();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/pdf");
  assert.match(response.headers.get("cache-control") ?? "", /no-store/);
  assert.equal(response.headers.get("x-sundaf-pdf-version"), downloads.ITINERARY_PDF_VERSION);
  assert.equal(await response.text(), "%PDF-route-harness");
  assert.deepEqual(harness.calls, { tour: 1, company: 1, visa: 1, render: 1 });
  const rendered = harness.rendered;
  assert.ok(rendered);
  assert.equal(rendered.tour.title, harness.tour.title);
  assert.equal(rendered.company.name, "CV Sundaf Holiday Group");
  assert.equal(rendered.inclusivePriceLabel, currency.formatCurrency(29_500_000));
  assert.equal(harness.paymentTotal, 29_500_000);
  assert.deepEqual(rendered.mandatoryAddOns?.map((item) => [item.name, item.price]), [["Bagasi domestik Rusia", 2_500_000]]);
  assert.deepEqual(rendered.tour.addOns?.map((item) => [item.name, item.price, item.desc]), [
    ["Visa Rusia", 1_400_000, "Kutipan visa dari CMS."],
    ["Sami Village", 1_500_000, "Tiket masuk dan kereta rusa."],
  ]);
});

test("available catalog updates only the optional visa quote and leaves package/payment totals intact", async () => {
  const harness = routeHarness();
  assert.equal((await harness.run()).status, 200);
  const rendered = harness.rendered;
  assert.ok(rendered);
  assert.equal(rendered.inclusivePriceLabel, currency.formatCurrency(29_500_000));
  assert.equal(harness.paymentTotal, 29_500_000);
  assert.deepEqual(rendered.tour.addOns?.map((item) => [item.name, item.price]), [["Sami Village", 1_500_000], ["Visa Rusia", 1_600_000]]);
});

for (const failure of ["tour", "company"] as const) {
  test(`${failure} query failure is not swallowed by the optional visa fallback`, async () => {
    const harness = routeHarness(failure);
    await assert.rejects(harness.run(), (error) => error === harness.error);
    assert.equal(harness.calls.render, 0);
    assert.equal(harness.rendered, undefined);
  });
}
