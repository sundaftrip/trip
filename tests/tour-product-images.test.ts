import assert from "node:assert/strict";
import test from "node:test";
import {
  getAbsoluteTourProductImage,
  getTourGalleryImages,
  getTourItineraryImage,
  getTourProductImage,
  getTourVisualOverride,
  PEXELS_TOUR_IMAGES,
  VIETNAM_PRODUCT_IMAGE_BY_SLUG,
} from "../lib/tour-product-images";

const VIETNAM_NORTH = new Set<string>([
  PEXELS_TOUR_IMAGES.vietnamNinhBinh,
  PEXELS_TOUR_IMAGES.vietnamHaLong,
  PEXELS_TOUR_IMAGES.vietnamHanoi,
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
    PEXELS_TOUR_IMAGES.vietnamPhuQuocBeach,
  );
});

test("maps multi-region Vietnam routes to a dedicated itinerary highlight", () => {
  const image = getTourProductImage({
    slug: "10d9n-vietnam-from-north-to-south",
    title: "10 Hari 9 Malam Vietnam dari Utara ke Selatan",
    cityHighlight: "Hanoi – Teluk Halong – Danang – Ho Chi Minh – Mekong",
  });

  assert.equal(image, PEXELS_TOUR_IMAGES.vietnamGoldenBridgeClose);
});

test("gives all 23 canonical Vietnam products distinct Pexels covers", () => {
  const entries = Object.entries(VIETNAM_PRODUCT_IMAGE_BY_SLUG);
  const images = entries.map(([slug]) => getTourProductImage({ slug, country: "Vietnam" }));

  assert.equal(entries.length, 23);
  assert.equal(new Set(images).size, 23);
  for (const image of images) {
    assert.match(image, /^\/images\/tours\/pexels\/vietnam-.+\.webp$/);
  }
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

test("uses curated local assets only as fallbacks for CMS-managed tour visuals", () => {
  const hokkaidoCmsHero = "https://images.unsplash.com/photo-1550290960-6e04a8ca2509";
  assert.equal(
    getTourProductImage({
      slug: "winter-hokkaido-tokyo",
      title: "Musim Dingin Hokkaido + Tokyo",
      heroImg: hokkaidoCmsHero,
    }),
    hokkaidoCmsHero,
  );
  assert.equal(
    getTourVisualOverride({ slug: "winter-hokkaido-tokyo" })?.itineraryImages[4],
    PEXELS_TOUR_IMAGES.japanBiei,
  );
  assert.equal(
    getTourProductImage({
      slug: "rusia-aurora-14-januari-2027",
      title: "Rusia Aurora 14–23 Januari 2027",
      heroImg: null,
    }),
    PEXELS_TOUR_IMAGES.russiaAuroraGlow,
  );
  assert.equal(
    getTourProductImage({
      slug: "rusia-aurora-21-30-januari-2027",
      title: "Rusia Aurora 21–30 Januari 2027",
      heroImg: null,
    }),
    PEXELS_TOUR_IMAGES.russiaAuroraSea,
  );

  const cmsDayImage = "https://images.pexels.com/photos/12439602/pexels-photo-12439602.jpeg";
  assert.equal(
    getTourItineraryImage(cmsDayImage, PEXELS_TOUR_IMAGES.russiaAuroraGlow),
    cmsDayImage,
  );
  assert.equal(
    getTourItineraryImage(null, PEXELS_TOUR_IMAGES.russiaAuroraGlow),
    PEXELS_TOUR_IMAGES.russiaAuroraGlow,
  );
});

test("prefers valid CMS gallery images over a local visual override", () => {
  const visualOverride = getTourVisualOverride({ slug: "winter-hokkaido-tokyo" });
  const cmsGallery = [
    "https://images.pexels.com/photos/36067952/pexels-photo-36067952.jpeg",
    "https://images.unsplash.com/photo-1550290960-6e04a8ca2509",
  ];

  assert.ok(visualOverride);
  assert.deepEqual(
    getTourGalleryImages(cmsGallery, visualOverride.gallery),
    cmsGallery,
  );
});

test("filters invalid CMS gallery images while retaining valid CMS images", () => {
  assert.deepEqual(
    getTourGalleryImages([
      "https://cdn.example.com/tours/untrusted.webp",
      "javascript:alert(1)",
      "https://images.pexels.com/photos/36489677/pexels-photo-36489677.jpeg",
      "  /images/tours/local-approved.webp  ",
      null,
    ]),
    [
      "https://images.pexels.com/photos/36489677/pexels-photo-36489677.jpeg",
      "/images/tours/local-approved.webp",
    ],
  );
});

test("falls back to the local gallery when the CMS gallery has no valid images", () => {
  const visualOverride = getTourVisualOverride({ slug: "rusia-aurora-14-januari-2027" });

  assert.ok(visualOverride);
  assert.deepEqual(
    getTourGalleryImages(
      ["https://cdn.example.com/untrusted.webp", "data:image/png;base64,unsafe"],
      visualOverride.gallery,
    ),
    visualOverride.gallery,
  );
  assert.notStrictEqual(
    getTourGalleryImages([], visualOverride.gallery),
    visualOverride.gallery,
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

test("preserves a valid CMS-selected hero and falls back safely when it is absent", () => {
  const suppliedHero = "https://res.cloudinary.com/sundaf/image/upload/tours/iceland.webp";

  assert.equal(
    getTourProductImage({
      title: "Iceland Ring Road",
      country: "Iceland",
      heroImg: suppliedHero,
    }),
    suppliedHero,
  );
  assert.ok(
    GENERIC_TRAVEL.has(getTourProductImage({ title: "Unclassified Journey" })),
  );
  assert.ok(
    GENERIC_TRAVEL.has(getTourProductImage({
      title: "Untrusted external image",
      heroImg: "https://cdn.example.com/tours/untrusted.webp",
    })),
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
    heroImg: "https://res.cloudinary.com/sundaf/image/upload/iceland.webp",
  };
  assert.equal(
    getAbsoluteTourProductImage(unknownTour, "https://sundaftrip.com"),
    unknownTour.heroImg,
  );
});
