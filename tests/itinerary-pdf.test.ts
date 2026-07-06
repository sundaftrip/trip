import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  ItineraryPDF,
  PDF_LINKS,
  type ItineraryPDFProps,
} from "../components/pdf/ItineraryPDF";

const sampleProps: ItineraryPDFProps = {
  tour: {
    title: "Rusia Aurora",
    country: "Rusia",
    cityHighlight: "Moskow, Murmansk, St Petersburg",
    seatsLeft: 12,
    tripDateLabel: "10 November 2026",
    duration: "9 hari 7 malam",
    itinerary: [
      {
        day: 1,
        title: "Jakarta - Moscow",
        description: "Penerbangan menuju Moscow. Transportasi: pesawat internasional.",
      },
      {
        day: 2,
        title: "Moscow City Tour",
        description: "Kunjungan ke Red Square, Metro Moscow, dan Arbat. Bermalam: Moscow.",
      },
    ],
    inclusions: ["Hotel sesuai program", "Transportasi selama tour", "Pemandu wisata"],
    exclusions: ["Visa Rusia", "Pengeluaran pribadi"],
    notes: "Harga mengikuti ketersediaan dan kurs saat konfirmasi.",
    addOns: [
      {
        name: "Bantuan persiapan dokumen visa",
        priceLabel: "Rp1.500.000",
        tag: "recommended",
        desc: "Opsional dan mengikuti kebutuhan destinasi.",
      },
    ],
  },
  priceLabel: "Rp28.900.000",
  priceCoretLabel: "Rp31.900.000 - hemat Rp3.000.000",
  landTourLabel: "Rp22.500.000",
  company: {
    name: "Sundaf Trip",
    whatsapp: "+62 817-7520-2759",
    phone: "+62 817-7520-2759",
    email: "info@sundaftrip.com",
    website: "www.sundaftrip.com",
    instagram: "@sundaf.trip",
    tagline: "Perjalanan rapi untuk traveler Indonesia.",
    story: ["Sundaf Trip membantu perencanaan paket tour, private trip, dan kebutuhan visa."],
  },
  faqUrl: "https://sundaftrip.com/faq",
  paymentPlan: {
    title: "Booking Seat",
    intro: "Pembayaran dapat dilakukan bertahap.",
    paymentMethodsLabel: "transfer bank",
    urgencyLabel: "Sisa seat mengikuti update tim Sundaf.",
    totalAmount: 28_900_000,
    totalLabel: "Rp28.900.000",
    finePrint: "Nominal final mengikuti invoice resmi.",
    steps: [
      {
        label: "DP",
        dueDate: new Date("2026-08-01T00:00:00.000Z"),
        dueDateLabel: "Saat pendaftaran",
        amount: 10_000_000,
        amountLabel: "Rp10.000.000",
      },
      {
        label: "Pelunasan",
        dueDate: new Date("2026-10-10T00:00:00.000Z"),
        dueDateLabel: "30 hari sebelum berangkat",
        amount: 18_900_000,
        amountLabel: "Rp18.900.000",
      },
    ],
  },
};

test("itinerary PDF exposes the required customer-facing link contract", () => {
  assert.equal(PDF_LINKS.website.href, "https://www.sundaftrip.com");
  assert.equal(PDF_LINKS.instagram.href, "https://www.instagram.com/sundaf.trip");
  assert.equal(PDF_LINKS.visa.href, "https://sundaftrip.com/visa");
  assert.equal(PDF_LINKS.faq.href, "https://sundaftrip.com/faq");
  assert.equal(PDF_LINKS.email.href, "mailto:info@sundaftrip.com");
  assert.equal(PDF_LINKS.whatsapp.href, "https://wa.me/6281775202759");
});

test("itinerary PDF renders a React PDF document buffer", async () => {
  type PdfElement = Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(
    createElement(ItineraryPDF, sampleProps) as unknown as PdfElement,
  );

  assert.equal(buffer.subarray(0, 4).toString(), "%PDF");
  assert.ok(buffer.length > 25_000, "expected a fully rendered itinerary PDF");
});
