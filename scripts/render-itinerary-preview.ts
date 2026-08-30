/** Database-free visual QA using reviewed catalog data. Outputs are not committed. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ItineraryPDF, ItineraryPDFPremium, type ItineraryPDFProps } from "../components/pdf/ItineraryPDF";
import { CANADA_ROCKIES_TOUR, CANADA_ROCKIES_MANDATORY_TOTAL } from "../data/catalog/canada-rockies-april-2027";
import { localizePdfTour } from "../lib/itinerary-pdf-localization";
import { formatCurrency, formatDate } from "../lib/utils";

async function main() {
  const output = path.resolve(process.argv[2] || "tmp/itinerary-pdf");
  const cache = path.join(output, "images");
  await mkdir(cache, { recursive: true });
  const sources = [CANADA_ROCKIES_TOUR.heroImg, ...CANADA_ROCKIES_TOUR.gallery.slice(0, 2)];
  const images = await Promise.all(sources.map(async (url, index) => {
    const cached = path.join(cache, `${index}.jpg`);
    let bytes: Buffer;
    try { bytes = await readFile(cached); }
    catch {
      // These fixed, reviewed fixture URLs are not CMS/request input.
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`Fixture image ${index}: HTTP ${response.status}`);
      bytes = Buffer.from(await response.arrayBuffer());
      await writeFile(cached, bytes);
    }
    return `data:image/jpeg;base64,${bytes.toString("base64")}`;
  }));
  const logo = `data:image/png;base64,${(await readFile("public/logo.png")).toString("base64")}`;
  const logoOnDark = `data:image/png;base64,${(await readFile("public/vietnam/assets/logo-dark.png")).toString("base64")}`;
  const source = CANADA_ROCKIES_TOUR;
  const tour = localizePdfTour({
    ...source,
    tripDateLabel: formatDate(source.tripDate),
    heroImg: images[0], gallery: images,
    itinerary: source.itinerary.map((day) => ({ ...day })),
    inclusions: [...source.inclusions], exclusions: [...source.exclusions],
    addOns: source.addOns.map((item) => ({ ...item, priceLabel: formatCurrency(item.price) })),
  });
  const props: ItineraryPDFProps = {
    tour: { ...tour, addOns: tour.addOns.filter((item) => item.tag !== "wajib") },
    mandatoryAddOns: tour.addOns.filter((item) => item.tag === "wajib"),
    priceLabel: formatCurrency(source.price),
    inclusivePriceLabel: formatCurrency(source.price + CANADA_ROCKIES_MANDATORY_TOTAL),
    paymentPlan: null, commerceStatus: "available", faqUrl: "https://sundaftrip.com/faq",
    company: { name: "Sundaf Trip", logo, logoOnDark, phone: "08111620207", whatsapp: "6281775202759", email: "info@sundaftrip.com", website: "sundaftrip.com", nib: "1601260060842" },
  };
  async function render(name: string, data: ItineraryPDFProps, legacy = false) {
    type PdfElement = Parameters<typeof renderToBuffer>[0];
    const pdf = await renderToBuffer(createElement(legacy ? ItineraryPDFPremium : ItineraryPDF, data) as unknown as PdfElement);
    const file = path.join(output, name);
    await writeFile(file, pdf);
    console.log(`${file} (${pdf.length} bytes)`);
  }
  await render("canada-clean.pdf", props);
  if (process.argv.includes("--baseline")) await render("canada-baseline.pdf", props, true);
  if (process.argv.includes("--stress")) {
    const longDescription = Array.from({ length: 24 }, (_, i) => `Paragraf ${i + 1}. Sarapan di hotel, kemudian perjalanan dilanjutkan menuju tempat kunjungan. Waktu bebas mengikuti jadwal harian. Informasi ini adalah data uji tata letak, bukan penawaran perjalanan.`).join("\n\n");
    await render("long-content-test.pdf", {
      ...props,
      tour: { ...props.tour, title: "Uji tata letak: uraian panjang", itinerary: [
        { day: 1, title: "Kedatangan (Sarapan, Makan Siang)", description: `Makan: sarapan dan makan siang\nBermalam: hotel uji\n${longDescription}\nAKHIR HARI PERTAMA"` },
        { day: 2, title: "Perjalanan berikutnya", description: "AKHIR HARI KEDUA" },
      ], notes: `${longDescription}\nAKHIR CATATAN`, inclusions: Array.from({ length: 16 }, (_, i) => `Layanan ${i + 1}. Tiket dan transportasi sesuai program yang tercantum untuk setiap hari perjalanan.`), exclusions: [...props.tour.exclusions, "AKHIR PENGECUALIAN"] },
      paymentPlan: { title: "Pembayaran", intro: "Jadwal uji", paymentMethodsLabel: "Transfer", urgencyLabel: "", totalAmount: 45300000, totalLabel: "Rp 45.300.000", finePrint: "AKHIR KETENTUAN PEMBAYARAN", steps: [{ label: "DP", dueDate: new Date("2027-01-01"), dueDateLabel: "1 Januari 2027", amount: 1500000, amountLabel: "Rp 1.500.000" }] },
    });
    await render("no-images-test.pdf", { ...props, company: { ...props.company, logo: null }, tour: { ...props.tour, title: "Uji paket singkat tanpa foto", heroImg: null, gallery: [], itinerary: [], inclusions: [], exclusions: [], addOns: [] }, commerceStatus: "sold_out" });
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
