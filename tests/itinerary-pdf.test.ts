import assert from "node:assert/strict";
import test from "node:test";
import { cloneElement, isValidElement, type ReactNode } from "react";
import { readFileSync } from "node:fs";
import { pdf, renderToBuffer } from "@react-pdf/renderer";
import { ItineraryPDF, type ItineraryPDFProps } from "../components/pdf/ItineraryPDF";
import { CleanItineraryPDF, pdfText, wrapPdfWord } from "../components/pdf/CleanItineraryPDF";
import { CANADA_ROCKIES_TOUR } from "../data/catalog/canada-rockies-april-2027";
import { localizePdfTour } from "../lib/itinerary-pdf-localization";
import { formatCurrency, formatDate } from "../lib/utils";

const props: ItineraryPDFProps = {
  tour: { title: "Paket uji", country: "Kanada", seatsLeft: 20,
    itinerary: [{ day: 1, title: "Kedatangan (B,L)", description: "Makan: sarapan dan makan siang\nBermalam: Hotel A\nKalimat penutup tetap utuh." }],
    inclusions: ["Transportasi"], exclusions: ["Visa"], notes: "Catatan lengkap.",
    addOns: [{ name: "Asuransi", tag: "recommended", priceLabel: "Rp 1.000.000", desc: "Premi sesuai usia." }],
  }, company: { name: "Sundaf Trip", phone: "08111620207" },
  priceLabel: "Rp 40.900.000", inclusivePriceLabel: "Rp 45.300.000",
  mandatoryAddOns: [{ name: "Tips Tour Leader & Driver", tag: "wajib", priceLabel: "Rp 4.400.000", desc: "Biaya dikonfirmasi saat tiket grup dikunci." }],
};

function collectText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(collectText).join(" ");
  if (!isValidElement<{ children?: ReactNode }>(node)) return "";
  if (typeof node.type === "function") return collectText((node.type as (props: unknown) => ReactNode)(node.props));
  return collectText(node.props.children);
}

test("public PDF entry uses the clean flowing renderer", () => {
  assert.equal(ItineraryPDF, CleanItineraryPDF);
  const document = ItineraryPDF(props);
  assert.equal(Array.isArray(document.props.children), false, "all sections flow inside a single wrapping Page");
  assert.equal(document.props.children.props.wrap, true);
});

test("keeps raw meal and stay metadata, complete descriptions, notes and contact", () => {
  const text = collectText(ItineraryPDF(props)).replace(/\s+/g, " ");
  for (const value of ["(B,L)", "Makan: sarapan dan makan siang", "Bermalam: Hotel A", "Kalimat penutup tetap utuh.", "Catatan lengkap.", "08111620207"]) assert.ok(text.includes(value), value);
  assert.equal(text.match(/Rp 45\.300\.000/g)?.length, 1);
  assert.ok(text.includes("Opsional, belum masuk total di atas."));
  assert.ok(text.includes("Asuransi (direkomendasikan)"));
  assert.ok(text.includes("Premi sesuai usia."));
  assert.ok(text.includes("Biaya dikonfirmasi saat tiket grup dikunci."));
});

test("normalizes service wording without shortening content", () => {
  assert.equal(pdfText("pemimpin tur & pengemudi — Kelayakan"), "Tour Leader & Driver - Syarat");
  const long = "Uraian lengkap. ".repeat(1000) + "Kalimat terakhir.";
  assert.ok(pdfText(long).endsWith("Kalimat terakhir."));
});

test("hidden payment schedules stay hidden; manual schedules retain amounts and dates", () => {
  const hidden = collectText(ItineraryPDF({ ...props, paymentPlan: null }));
  assert.ok(hidden.includes("Jadwal dan nominal pembayaran mengikuti invoice resmi"));
  assert.ok(!hidden.includes("Tahap 1"));
  const manual = collectText(ItineraryPDF({ ...props, paymentPlan: { title: "Pembayaran", intro: "Jadwal uji", paymentMethodsLabel: "Transfer", urgencyLabel: "", totalAmount: 45300000, totalLabel: "Rp 45.300.000", finePrint: "Syarat pembayaran uji", steps: [{ label: "Deposit", dueDate: new Date("2027-01-01"), dueDateLabel: "1 Januari 2027", amount: 1500000, amountLabel: "Rp 1.500.000" }] } }));
  for (const value of ["Deposit", "1 Januari 2027", "Rp 1.500.000", "Syarat pembayaran uji"]) assert.ok(manual.includes(value));
});

test("unavailable trips do not claim seats are available", () => {
  for (const commerceStatus of ["sold_out", "waitlist", "completed"] as const) {
    const text = collectText(ItineraryPDF({ ...props, commerceStatus }));
    assert.ok(!text.includes("20 kursi tersedia"));
    assert.ok(text.includes(commerceStatus === "completed" ? "Perjalanan ini telah selesai" : "Daftar tunggu"));
  }
});

test("renders a valid PDF with missing photos, empty lists and no itinerary", async () => {
  const document = ItineraryPDF({ ...props, tour: { ...props.tour, itinerary: [], inclusions: [], exclusions: [] } });
  const buffer = await renderToBuffer(document);
  assert.equal(buffer.subarray(0, 5).toString(), "%PDF-");
  assert.ok(buffer.length > 2000);
});

// Isolate react-pdf's internal layout hook here. Text extraction alone misses
// glyphs drawn from zero-height boxes after a page break.
interface LayoutNode {
  type: string;
  props?: { fixed?: boolean; render?: unknown };
  box?: { top: number; height: number; width: number; paddingTop?: number; paddingBottom?: number };
  lines?: Array<{ box: { height: number }; xAdvance: number; overflowRight?: number }>;
  children?: LayoutNode[];
}

async function checkedLayout(data: ItineraryPDFProps) {
  let layout: LayoutNode | undefined;
  const document = cloneElement(ItineraryPDF(data), {
    onRender: (result: unknown) => { layout = (result as { _INTERNAL__LAYOUT__DATA_: LayoutNode })._INTERNAL__LAYOUT__DATA_; },
  });
  const stream = await pdf(document).toBuffer();
  await new Promise<void>((resolve, reject) => {
    stream.on("end", resolve); stream.on("error", reject); stream.resume();
  });
  assert.ok(layout?.children?.length);
  for (const [index, page] of layout.children.entries()) {
    assert.ok(page.box);
    const minY = page.box.paddingTop || 0;
    const maxY = page.box.height - (page.box.paddingBottom || 0);
    let pageNumbers = 0;
    function visit(node: LayoutNode, parentY = 0, parentFixed = false) {
      const fixed = parentFixed || node.props?.fixed === true;
      const y = parentY + (node.box?.top || 0);
      if (node.type === "TEXT") {
        if (node.props?.render && fixed) {
          pageNumbers += 1;
          assert.ok(node.lines?.length && node.box && node.box.width > 0 && node.box.height > 0);
        }
        if (!fixed && node.lines?.length && node.box) {
          assert.ok(node.box.height > 0, `page ${index + 1}: zero-height body text`);
          const lineHeight = node.lines.reduce((sum, line) => sum + line.box.height, 0);
          assert.ok(node.box.height + 0.6 >= lineHeight, `page ${index + 1}: shrunk text box`);
          // textkit excludes trailing whitespace from the visible line width.
          assert.ok(node.lines.every((line) => line.xAdvance - (line.overflowRight || 0) <= node.box!.width + 0.6), `page ${index + 1}: text overflows horizontally`);
          assert.ok(y >= minY - 0.6 && y + node.box.height <= maxY + 0.6, `page ${index + 1}: body text outside margins (${y}, ${node.box.height})`);
        }
        return; // Inline Text spans intentionally have no standalone box.
      }
      if (!fixed && node.type === "IMAGE" && node.box) assert.ok(y >= minY - 0.6 && y + node.box.height <= maxY + 0.6);
      for (const child of node.children || []) visit(child, y, fixed);
    }
    for (const child of page.children || []) visit(child);
    assert.equal(pageNumbers, 1, `page ${index + 1} needs a visible page number`);
  }
  return layout.children.length;
}

test("Canada stays at three pages with full-size photos and no clipped body text", async () => {
  const source = CANADA_ROCKIES_TOUR;
  const image = (file: string, mime: string) => `data:${mime};base64,${readFileSync(new URL(file, import.meta.url)).toString("base64")}`;
  // Local fixture photos keep CI offline; production photo dimensions are set by styles.
  const gallery = ["hero-sapa.jpg", "hanoi-street.jpg", "halong-sunset.jpg"].map((file) => image(`../public/vietnam/assets/${file}`, "image/jpeg"));
  const localized = localizePdfTour({ ...source, tripDateLabel: formatDate(source.tripDate), itinerary: source.itinerary.map((day) => ({ ...day })), inclusions: [...source.inclusions], exclusions: [...source.exclusions], addOns: source.addOns.map((item) => ({ ...item, priceLabel: formatCurrency(item.price) })), heroImg: gallery[0], gallery });
  const count = await checkedLayout({ ...props, tour: { ...localized, addOns: localized.addOns.filter((item) => item.tag !== "wajib") }, mandatoryAddOns: localized.addOns.filter((item) => item.tag === "wajib"), company: { ...props.company, logo: image("../public/logo.png", "image/png"), whatsapp: "6281775202759", email: "info@sundaftrip.com", nib: "1601260060842" }, faqUrl: "https://sundaftrip.com/faq" });
  assert.equal(count, 3);
});

test("multi-page paragraphs and long service lists do not shrink or clip on page breaks", async () => {
  const paragraph = "Sarapan di hotel lalu perjalanan dilanjutkan sesuai program yang sudah tercantum. ".repeat(80);
  await checkedLayout({ ...props, tour: { ...props.tour, itinerary: [{ day: 1, title: "Hari panjang (B,L)", description: paragraph + "AKHIR HARI" }], notes: paragraph + "AKHIR CATATAN", inclusions: Array.from({ length: 25 }, (_, i) => `Layanan ${i + 1}: transportasi dan tiket kunjungan sesuai program perjalanan.`) } });
});

test("a single sixteen-item service column is allowed to flow across pages", async () => {
  await checkedLayout({ ...props, tour: { ...props.tour, itinerary: [], exclusions: [], inclusions: Array.from({ length: 16 }, (_, i) => `${i + 1}. ${"DOKUMENPERJALANAN ".repeat(12).trim()}`) } });
});

test("long supplier references wrap within the page without dropping characters", async () => {
  const reference = `https://supplier.example/booking?reference=${"ABC123".repeat(1000)}`;
  assert.equal(wrapPdfWord(reference).join(""), reference);
  assert.deepEqual(wrapPdfWord("direkomendasikan"), ["direkomendasikan"]);
  await checkedLayout({ ...props, tour: { ...props.tour, itinerary: [{ day: 1, title: "Referensi supplier", description: reference }] } });
});

test("long Vietnam titles stay inside the page margins", async () => {
  for (const title of ["4 Hari 3 Malam Vietnam Utara dengan Sapa", "5 Hari 4 Malam Vietnam Utara dengan Sapa dan Teluk Halong"]) {
    await checkedLayout({ ...props, tour: { ...props.tour, title } });
  }
});
