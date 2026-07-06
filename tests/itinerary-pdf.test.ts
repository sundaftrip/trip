import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  buildImportantNotes,
  deriveItineraryMeta,
  formatPaymentTotalHeading,
  getDurationArrivalNote,
  ItineraryPDF,
  PDF_LINKS,
  polishItineraryTitle,
  polishPdfCopy,
  professionalizePaymentText,
  splitGalleryPages,
  splitItineraryPages,
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
  assert.equal(PDF_LINKS.instagram.display, "@sundaf.trip");
  assert.equal(PDF_LINKS.visa.href, "https://sundaftrip.com/visa");
  assert.equal(PDF_LINKS.faq.href, "https://sundaftrip.com/faq");
  assert.equal(PDF_LINKS.email.href, "mailto:info@sundaftrip.com");
  assert.equal(PDF_LINKS.whatsapp.href, "https://wa.me/6281775202759");
});

test("itinerary PDF clarifies price and duration semantics", () => {
  assert.equal(formatPaymentTotalHeading("Rp33.500.000", "Rp31.000.000"), "Estimasi Total dengan Add-on Terpilih");
  assert.equal(formatPaymentTotalHeading("Rp31.000.000", "Rp31.000.000"), "Total Settlement");
  assert.equal(
    getDurationArrivalNote({
      duration: "9 hari 7 malam",
      itinerary: [
        { day: 1, title: "Berangkat", description: "" },
        { day: 10, title: "Arrive Jakarta", description: "" },
      ],
    }),
    "Estimasi tiba kembali di Jakarta: Hari ke-10",
  );
});

test("itinerary PDF polishes Russia Aurora copy without changing the template style", () => {
  assert.equal(polishPdfCopy("Iconic Rusia dengan bangunan gereja berkubah es cream"), "ikonik Rusia dengan bangunan gereja berkubah es krim");
  assert.equal(polishPdfCopy("Kereta cepat Rusia ambil melihat pemandangan"), "Kereta cepat Rusia sambil melihat pemandangan");
  assert.equal(polishPdfCopy("pemimpin tur berpengalaman start Jakarta"), "Tour Leader berpengalaman dari Jakarta");
  assert.equal(polishPdfCopy("Akomodasi *3 & *4"), "Akomodasi hotel bintang 3 & 4");
  assert.equal(polishPdfCopy("bagasi pesawat domestik (2.5) PP"), "Bagasi pesawat domestik 25 kg PP");
  assert.equal(polishItineraryTitle("Arrive Jakarta"), "Tiba di Jakarta");
  assert.equal(polishItineraryTitle("Sammi Village"), "Sami Village");
  assert.equal(
    polishItineraryTitle("Kereta ke Saint Petersburg check-in hotel Hermitage Museum (opsional), waktu bebas"),
    "Kereta ke Saint Petersburg • Check-in Hotel • Hermitage Museum Opsional",
  );
  assert.equal(
    polishItineraryTitle("Nevski Prospect • Kazan Cathedral • Spilled Blood Cathedral • Photostop St. Isaac • Blue mosque"),
    "Nevsky Prospect • Kazan Cathedral • Spilled Blood Cathedral • St. Isaac • Blue Mosque",
  );
  assert.equal(
    polishItineraryTitle("Sami Village (opsional) Husky Farm Deer Farm Reindeer Husky riding (opsional) Banana Boat Aurora (opsional) • Culinary Tour kepiting alaska (opsional)"),
    "Sami Village Opsional • Husky Farm • Deer Farm • Aurora Hunt",
  );
});

test("itinerary PDF keeps payment and operational notes customer-facing", () => {
  assert.equal(
    professionalizePaymentText("Pembayaran aman dan fleksibel. Kamu cukup bayar DP dulu, sisanya dicicil santai sesuai skema pembayaran."),
    "Pembayaran dilakukan bertahap sesuai skema di bawah ini.",
  );

  const notes = buildImportantNotes("Penawaran Harga paket ini memiliki syarat minimum keberangkatan 15 orang.");
  assert.ok(notes.includes("Aurora adalah fenomena alam sehingga kemunculannya tidak dapat dijamin."));
  assert.ok(notes.includes("Minimum keberangkatan 15 peserta."));
  assert.ok(notes.includes("Jadwal final mengikuti cuaca, kondisi operasional, dan konfirmasi layanan."));
});

test("itinerary PDF keeps the gallery to one premium page with up to six images", () => {
  const sixImages = Array.from({ length: 6 }, (_, index) => `image-${index + 1}`);
  const sevenImages = Array.from({ length: 7 }, (_, index) => `image-${index + 1}`);
  const twelveImages = Array.from({ length: 12 }, (_, index) => `image-${index + 1}`);

  assert.deepEqual(splitGalleryPages(sixImages), [sixImages]);
  assert.deepEqual(splitGalleryPages(sevenImages).map((page) => page.length), [6]);
  assert.deepEqual(splitGalleryPages(twelveImages).map((page) => page.length), [6]);
});

test("itinerary PDF splits itinerary rows into compact page groups", () => {
  const tenDays = Array.from({ length: 10 }, (_, index) => ({
    day: index + 1,
    title: `Day ${index + 1}`,
    description: "",
  }));
  const twelveDays = Array.from({ length: 12 }, (_, index) => ({
    day: index + 1,
    title: `Day ${index + 1}`,
    description: "",
  }));

  assert.deepEqual(splitItineraryPages(tenDays).map((page) => page.length), [10]);
  assert.deepEqual(splitItineraryPages(twelveDays).map((page) => page.length), [10, 2]);
});

test("itinerary PDF derives consistent Russia Aurora day metadata", () => {
  const tour = {
    duration: "9 hari 7 malam",
    inclusions: ["Akomodasi hotel bintang 3 & 4"],
  };
  const days = [
    { day: 1, title: "Penerbangan ke Moskow", description: "", transport: "Penerbangan" },
    { day: 2, title: "Tiba di Moskow (SVO) transfer check-in hotel", description: "" },
    { day: 3, title: "Metro Tour • Red Square • Arbat", description: "" },
    { day: 4, title: "Kereta ke Saint Petersburg check-in hotel Hermitage Museum (opsional), waktu bebas", description: "", transport: "Kereta api" },
    { day: 5, title: "Nevski Prospect • Kazan Cathedral • Spilled Blood Cathedral • Photostop St. Isaac • Blue mosque", description: "" },
    { day: 6, title: "Penerbangan ke Murmansk • Pemberhentian foto pemecah es Lenin • Perburuan Aurora", description: "", transport: "Penerbangan" },
    { day: 7, title: "Sammi Village Husky Farm Deer Farm Aurora", description: "" },
    { day: 8, title: "Penerbangan ke Moskow check-in, waktu bebas", description: "", transport: "Penerbangan" },
    { day: 9, title: "Izmailovo Market Transfer", description: "Belanja suvenir lalu transfer bandara untuk pulang ke Indonesia.", transport: "Penerbangan" },
    { day: 10, title: "Arrive Jakarta", description: "Semoga berjumpa kembali." },
  ];

  const actual = days.map((day, index) => (
    deriveItineraryMeta(day, index, days, tour).map((item) => `${item.icon}:${item.label}:${item.value}`)
  ));

  assert.deepEqual(actual, [
    ["plane:Transportasi:Penerbangan"],
    ["bed:Bermalam:Hotel"],
    ["bed:Bermalam:Hotel"],
    ["train:Transportasi:Kereta api", "bed:Bermalam:Hotel"],
    ["bed:Bermalam:Hotel"],
    ["plane:Transportasi:Penerbangan", "bed:Bermalam:Hotel"],
    ["bed:Bermalam:Hotel"],
    ["plane:Transportasi:Penerbangan", "bed:Bermalam:Hotel"],
    ["plane:Transportasi:Penerbangan"],
    [],
  ]);
});

test("itinerary PDF renders a React PDF document buffer", async () => {
  type PdfElement = Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(
    createElement(ItineraryPDF, sampleProps) as unknown as PdfElement,
  );

  assert.equal(buffer.subarray(0, 4).toString(), "%PDF");
  assert.ok(buffer.length > 18_000, `expected a fully rendered compact itinerary PDF, got ${buffer.length} bytes`);
});
