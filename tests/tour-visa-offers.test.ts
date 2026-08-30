import assert from "node:assert/strict";
import test from "node:test";
import {
  parseVisaServicePrice,
  resolveTourVisaOffers,
  type VisaServiceCatalogEntry,
} from "../lib/tour-visa-offers";

const canada: VisaServiceCatalogEntry = {
  name: "Kanada",
  en: "Canada",
  region: "Amerika",
  visa: "wajib",
  servicePrice: "Rp 3.600.000",
  sortOrder: 74,
  variants: [
    {
      name: "Visitor Visa Premium",
      priceIDR: 3_900_000,
      processingTime: "4-8 minggu",
      sortOrder: 1,
    },
    {
      name: "Visitor Visa",
      priceIDR: 3_100_000,
      processingTime: "3-8 minggu",
      sortOrder: 0,
    },
  ],
};

const unitedStates: VisaServiceCatalogEntry = {
  name: "Amerika Serikat",
  en: "United States",
  region: "Amerika",
  visa: "wajib",
  servicePrice: "Mulai Rp 4.300.000",
  sortOrder: 73,
  variants: [],
};

const france: VisaServiceCatalogEntry = {
  name: "Prancis",
  en: "France",
  region: "Eropa Schengen",
  visa: "wajib",
  servicePrice: "Rp 3.500.000",
  sortOrder: 41,
  variants: [
    {
      name: "Sticker Schengen",
      priceIDR: 3_500_000,
      processingTime: "1-3 minggu",
    },
  ],
};

const unitedKingdom: VisaServiceCatalogEntry = {
  name: "Inggris",
  en: "United Kingdom",
  region: "Eropa Non-Schengen",
  visa: "wajib",
  servicePrice: "Mulai Rp 4.300.000",
  sortOrder: 40,
};

const netherlands: VisaServiceCatalogEntry = {
  name: "Belanda",
  en: "Netherlands",
  region: "Eropa Schengen",
  visa: "wajib",
  servicePrice: "Rp 3.500.000",
  sortOrder: 45,
  variants: [
    {
      name: "Sticker Schengen",
      priceIDR: 3_500_000,
      processingTime: "1-3 minggu",
    },
  ],
};

const vietnam: VisaServiceCatalogEntry = {
  name: "Vietnam",
  en: "Vietnam",
  region: "Asia Tenggara",
  visa: "bebas",
  servicePrice: "Rp 850.000",
};

test("parses Indonesian currency strings used by the visa service", () => {
  assert.equal(parseVisaServicePrice("Mulai Rp 4.300.000"), 4_300_000);
  assert.equal(parseVisaServicePrice("Rp 3,5 juta"), 3_500_000);
  assert.equal(parseVisaServicePrice("850 ribu"), 850_000);
  assert.equal(parseVisaServicePrice("Tanya harga"), null);
});

test("offers only Canada and uses the Sundaf service price shown on the visa page", () => {
  const offers = resolveTourVisaOffers(
    {
      title: "Canada Rockies Spring",
      country: "Kanada",
      cityHighlight: "Vancouver, Banff, Calgary",
      route: "Amerika Utara",
    },
    [unitedStates, canada],
  );

  assert.deepEqual(offers, [
    {
      id: "visa-canada",
      name: "Visa Kanada",
      price: 3_600_000,
      href: "/visa/canada",
      processingTime: null,
    },
  ]);
});

test("falls back to the cheapest positive variant when the service price is unavailable", () => {
  const offers = resolveTourVisaOffers(
    { country: "Kanada" },
    [{ ...canada, servicePrice: null }],
  );

  assert.equal(offers[0]?.price, 3_100_000);
  assert.equal(offers[0]?.processingTime, "3-8 minggu");
});

test("offers Canada and the United States when both destinations appear", () => {
  const offers = resolveTourVisaOffers(
    {
      title: "Canada dan Amerika",
      itinerary: [
        { title: "Vancouver" },
        { title: "Seattle, Amerika Serikat" },
      ],
    },
    [unitedStates, canada],
  );

  assert.deepEqual(offers.map((offer) => offer.id), [
    "visa-canada",
    "visa-united-states",
  ]);
  assert.equal(offers[1]?.price, 4_300_000);
  assert.equal(offers[1]?.href, "/visa/united-states");
});

test("collapses a multi-country Western Europe itinerary into one Schengen offer", () => {
  const offers = resolveTourVisaOffers(
    {
      title: "Pesona Eropa Barat",
      route: "Prancis, Belgia, dan Belanda",
    },
    [netherlands, france],
  );

  assert.deepEqual(offers, [
    {
      id: "visa-schengen",
      name: "Visa Schengen",
      price: 3_500_000,
      href: "/visa/france",
      processingTime: null,
    },
  ]);
});

test("does not classify a non-Schengen destination as Schengen", () => {
  const offers = resolveTourVisaOffers(
    { title: "London Explorer", country: "Inggris" },
    [france, unitedKingdom],
  );

  assert.deepEqual(offers, [
    {
      id: "visa-united-kingdom",
      name: "Visa Inggris",
      price: 4_300_000,
      href: "/visa/united-kingdom",
      processingTime: null,
    },
  ]);
});

test("uses the matching country service price when no priced variant exists", () => {
  const offers = resolveTourVisaOffers(
    { country: "Amerika Serikat" },
    [unitedStates],
  );

  assert.deepEqual(offers, [
    {
      id: "visa-united-states",
      name: "Visa Amerika Serikat",
      price: 4_300_000,
      href: "/visa/united-states",
      processingTime: null,
    },
  ]);
});

test("returns no offer when no destination matches", () => {
  assert.deepEqual(
    resolveTourVisaOffers({ title: "Liburan Selandia Baru" }, [canada, unitedStates]),
    [],
  );
});

test("returns no offer when the matching visa service has no positive price", () => {
  const noPriceCanada: VisaServiceCatalogEntry = {
    ...canada,
    servicePrice: "Tanya harga",
    variants: [
      { name: "Konsultasi", priceIDR: null },
      { name: "Data lama", priceIDR: 0 },
    ],
  };

  assert.deepEqual(
    resolveTourVisaOffers({ country: "Kanada" }, [noPriceCanada]),
    [],
  );
});

test("does not mistake the French history of Cat Cat Village for a Schengen destination", () => {
  const offers = resolveTourVisaOffers(
    {
      title: "5 Hari 4 Malam Vietnam Utara dengan Sapa dan Teluk Halong",
      slug: "5d4n-northern-vietnam-with-sapa-and-halong-bay",
      country: "Vietnam",
      cityHighlight: "Hanoi – Sapa – Teluk Halong",
      itinerary: [{
        day: 2,
        title: "Hanoi - Joint Limousine ke Sapa - Trekking ke Cat Cat Village",
        description: "berjalan menyusuri dasar lembah hingga air terjun tempat orang Prancis membangun Pembangkit Listrik Tenaga Hidrolik",
      }],
    },
    [france, vietnam, canada, unitedStates],
  );

  assert.deepEqual(offers, []);
});

test("does not use attraction names or other itinerary fields as destination countries", () => {
  assert.deepEqual(resolveTourVisaOffers({
    country: "Vietnam",
    itinerary: [
      { title: "Desa Prancis", description: "French Village di Ba Na Hills", image: "https://example.com/france.jpg" },
      { title: "Grand World", highlights: ["Suasana Belanda dan Italia"] },
      { title: "Museum", description: "Sejarah Amerika Serikat dan Kanada" },
    ],
  }, [vietnam, france, netherlands, canada, unitedStates]), []);
});

test("visa and exclusion notes cannot add unrelated countries to a Canada trip", () => {
  const offers = resolveTourVisaOffers({
    country: "Kanada",
    title: "Canada Rockies Spring",
    cityHighlight: "Vancouver, Banff, Calgary",
    destinationText: [
      "Pemegang visa Amerika Serikat dapat menghubungi tim untuk pemeriksaan dokumen.",
      "Visa Schengen, Inggris, dan Prancis belum termasuk.",
    ],
  }, [canada, unitedStates, france, unitedKingdom]);

  assert.deepEqual(offers.map((offer) => offer.id), ["visa-canada"]);
});

test("transit and airline mentions in itinerary notes do not become destinations", () => {
  const offers = resolveTourVisaOffers({
    country: "Kanada",
    itinerary: [{
      title: "Transit di Amerika Serikat sebelum Vancouver",
      description: "Pilihan penerbangan Air France melalui Prancis mengikuti jadwal maskapai.",
    }],
    destinationText: "Persyaratan transit United States dikonfirmasi terpisah.",
  }, [canada, unitedStates, france]);

  assert.deepEqual(offers.map((offer) => offer.id), ["visa-canada"]);
});

test("unconfirmed prose alone does not create a visa offer", () => {
  assert.deepEqual(resolveTourVisaOffers({
    itinerary: [{ title: "France", description: "Canada, United States" }],
    destinationText: "Schengen",
  }, [france, canada, unitedStates]), []);
});

test("declared multi-country metadata still offers Canada and United States separately", () => {
  const offers = resolveTourVisaOffers({
    country: "Kanada, Amerika Serikat",
    route: "Vancouver → Seattle → Los Angeles",
    itinerary: [{ description: "Bangunan bersejarah bergaya Prancis" }],
  }, [france, unitedStates, canada]);

  assert.deepEqual(offers.map((offer) => offer.id), ["visa-canada", "visa-united-states"]);
});

test("city metadata still supports Canada when the country field has not been filled", () => {
  assert.deepEqual(resolveTourVisaOffers({
    title: "Rockies Spring",
    cityHighlight: "Vancouver • Banff • Calgary",
  }, [canada, france]).map((offer) => offer.id), ["visa-canada"]);
});
