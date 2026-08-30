import type { TourVisaAssessment } from "./tour-visa-assessment";
import { formatCurrency } from "./utils";

/** Keep essential conditions in both static PDFs and on-screen catalog notes. */
export function buildTourVisaCatalogNotes(assessment: TourVisaAssessment): string {
  const paragraphs = assessment.countries.length
    ? assessment.countries.map((country) => {
        const conditions = [...new Set(country.conditions.map((value) => value.trim()).filter(Boolean))]
          .filter((value) => !country.explanation.includes(value));
        return `${country.name}: ${[country.explanation, ...conditions].join(" ")}`;
      })
    : assessment.summary;
  return ["Paspor biasa Indonesia, perjalanan wisata. Ketentuan mengikuti negara tujuan, lama tinggal, dan dokumen peserta.", ...paragraphs].join("\n\n");
}

/** A catalog is not a personalized quote. These fees remain optional and are
 * quoted per applicant; they never change the package's mandatory total. */
export function buildTourVisaPdfAddOns(assessment: TourVisaAssessment) {
  return assessment.offers.map((offer) => ({
    name: offer.name,
    price: offer.price,
    priceLabel: `${formatCurrency(offer.price)}/pemohon`,
    tag: "" as const,
    desc: "Bantuan pengurusan, belum termasuk harga paket. Hanya untuk peserta yang memerlukan bantuan; visa yang sudah dimiliki diperiksa terlebih dahulu.",
  }));
}
