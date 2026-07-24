import assert from "node:assert/strict";
import test from "node:test";
import {
  getAbsoluteTourProductImage,
  getTourProductImage,
  PEXELS_TOUR_IMAGES,
} from "../lib/tour-product-images";

const VIETNAM_NORTH = new Set<string>([
  PEXELS_TOUR_IMAGES.vietnamNinhBinh,
  PEXELS_TOUR_IMAGES.vietnamHaLong,
  PEXELS_TOUR_IMAGES.vietnamHanoi,
]);

const VIETNAM_MIXED = new Set<string>([
  ...VIETNAM_NORTH,
  PEXELS_TOUR_IMAGES.vietnamHoiAn,
  PEXELS_TOUR_IMAGES.vietnamGoldenBridge,
  PEXELS_TOUR_IMAGES.vietnamHoChiMinh,
]);

const CENTRAL_ASIA = new Set<string>([
  PEXELS_TOUR_IMAGES.centralAsiaAlmaty,
  PEXELS_TOUR_IMAGES.centralAsiaKazakhstanLake,
  PEXELS_TOUR_IMAGES.centralAsiaIssykKul,
  PEXELS_TOUR_IMAGES.centralAsiaAlaToo,
  PEXELS_TOUR_IMAGES.centralAsiaSamarkand,
  PEXELS_TOUR_IMAGES.centralAsiaTashkent,
]);

const JAPAN_WINTER = new Set<string>([
  PEXELS_TOUR_IMAGES.japanTokyo,
  PEXELS_TOUR_IMAGES.japanHokkaido,
  PEXELS_TOUR_IMAGES.japanBiei,
  PEXELS_TOUR_IMAGES.japanOtaru,
]);

const RUSSIA_AURORA = new Set<string>([
  PEXELS_TOUR_IMAGES.russiaAuroraSea,
  PEXELS_TOUR_IMAGES.russiaAuroraGlow,
  PEXELS_TOUR_IMAGES.russiaAuroraForest,
  PEXELS_TOUR_IMAGES.russiaWinter,
]);

const RUSSIA_CITY = new Set<string>([
  PEXELS_TOUR_IMAGES.russiaMoscow,
  PEXELS_TOUR_IMAGES.russiaMoscowGolden,
  PEXELS_TOUR_IMAGES.russiaStPetersburg,
  PEXELS_TOUR_IMAGES.russiaHermitage,
]);

const GENERIC_TRAVEL = new Set<string>([
  PEXELS_TOUR_IMAGES.centralAsiaKazakhstanLake,
  PEXELS_TOUR_IMAGES.vietnamNinhBinh,
  PEXELS_TOUR_IMAGES.japanTokyo,
  PEXELS_TOUR_IMAGES.russiaStPetersburg,
]);

test("maps focused Vietnam routes to their matching visual region", () => {
  assert.ok(
    VIETNAM_NORTH.has(
      getTourProductImage({
        slug: "4d3n-northern-vietnam",
        title: "4 Hari 3 Malam Vietnam Utara",
        cityHighlight: "Hanoi – Ninh Binh – Teluk Halong",
      }),
    ),
  );

  assert.equal(
    getTourProductImage({
      title: "5 Hari 4 Malam Vietnam Utara dengan Sapa",
      country: "Vietnam",
    }),
    PEXELS_TOUR_IMAGES.vietnamSapa,
  );

  assert.ok(
    new Set<string>([
      PEXELS_TOUR_IMAGES.vietnamHoiAn,
      PEXELS_TOUR_IMAGES.vietnamGoldenBridge,
    ]).has(
      getTourProductImage({
        title: "4 Hari 3 Malam Vietnam Tengah",
        cityHighlight: "Danang – Hoi An",
      }),
    ),
  );

  assert.equal(
    getTourProductImage({
      title: "4 Hari 3 Malam Vietnam Selatan",
      cityHighlight: "Ho Chi Minh – Mekong – My Tho",
    }),
    PEXELS_TOUR_IMAGES.vietnamHoChiMinh,
  );
});

test("maps Phu Quoc packages to the dedicated island image", () => {
  assert.equal(
    getTourProductImage({
      slug: "4d3n-phu-quoc-island-vietnam",
      title: "4 Hari 3 Malam Pulau Phu Quoc Vietnam",
    }),
    PEXELS_TOUR_IMAGES.vietnamPhuQuoc,
  );
});

test("keeps multi-region Vietnam routes in the mixed image pool", () => {
  const image = getTourProductImage({
    slug: "10d9n-vietnam-from-north-to-south",
    title: "10 Hari 9 Malam Vietnam dari Utara ke Selatan",
    cityHighlight: "Hanoi – Teluk Halong – Danang – Ho Chi Minh – Mekong",
  });

  assert.ok(VIETNAM_MIXED.has(image));
});

test("maps Central Asia and winter Japan packages to their destination pools", () => {
  assert.ok(
    CENTRAL_ASIA.has(
      getTourProductImage({
        slug: "central-asia-4-tan",
        title: "Asia Tengah 4-TAN",
        country: "Kazakhstan–Kyrgyzstan–Uzbekistan–Tajikistan",
      }),
    ),
  );

  assert.ok(
    JAPAN_WINTER.has(
      getTourProductImage({
        slug: "winter-hokkaido-tokyo",
        title: "Musim Dingin Hokkaido + Tokyo",
        country: "Jepang",
      }),
    ),
  );
});

test("separates Russian aurora packages from Russian city packages", () => {
  assert.ok(
    RUSSIA_AURORA.has(
      getTourProductImage({
        slug: "russia-murmansk-aurora-borealis",
        title: "Rusia Murmansk Aurora Borealis",
      }),
    ),
  );

  assert.ok(
    RUSSIA_CITY.has(
      getTourProductImage({
        slug: "russia-white-night-2",
        title: "Rusia Malam Putih",
        cityHighlight: "Moskow – St Petersburg",
      }),
    ),
  );
});

test("keeps unknown destinations on a local Pexels fallback instead of legacy imagery", () => {
  const suppliedHero = "https://cdn.example.com/tours/iceland.webp";

  assert.ok(
    GENERIC_TRAVEL.has(getTourProductImage({
      title: "Iceland Ring Road",
      country: "Iceland",
      heroImg: suppliedHero,
    })),
  );
  assert.ok(
    GENERIC_TRAVEL.has(getTourProductImage({ title: "Unclassified Journey" })),
  );
});

test("returns the same product image for the same tour input", () => {
  const tour = {
    id: "stable-tour-id",
    slug: "central-asia-4-tan",
    title: "Asia Tengah 4-TAN",
    cityHighlight: "Almaty – Bishkek – Issyk-Kul – Samarkand – Tashkent",
  };

  const first = getTourProductImage(tour);
  for (let attempt = 0; attempt < 20; attempt += 1) {
    assert.equal(getTourProductImage(tour), first);
  }
});

test("converts every resolved local product image to an absolute URL", () => {
  const localTour = { title: "Musim Dingin Hokkaido + Tokyo" };
  const localImage = getTourProductImage(localTour);

  assert.equal(
    getAbsoluteTourProductImage(localTour, "https://sundaftrip.com/"),
    `https://sundaftrip.com${localImage}`,
  );

  const unknownTour = {
    title: "Iceland Ring Road",
    heroImg: "https://cdn.example.com/iceland.webp",
  };
  const unknownImage = getTourProductImage(unknownTour);
  assert.equal(
    getAbsoluteTourProductImage(unknownTour, "https://sundaftrip.com"),
    `https://sundaftrip.com${unknownImage}`,
  );
});
