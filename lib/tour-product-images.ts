export type TourProductImageInput = {
  id?: string | null;
  slug?: string | null;
  title?: string | null;
  country?: string | null;
  cityHighlight?: string | null;
  heroImg?: string | null;
};

export type TourVisualOverride = {
  heroImg: string;
  gallery: string[];
  itineraryImages: Record<number, string>;
};

export const PEXELS_TOUR_IMAGES = {
  vietnamNinhBinh: "/images/tours/pexels/vietnam-ninh-binh-30280829.webp",
  vietnamHaLong: "/images/tours/pexels/vietnam-ha-long-bay-15303891.webp",
  vietnamHanoi: "/images/tours/pexels/vietnam-hanoi-36399804.webp",
  vietnamSapa: "/images/tours/pexels/vietnam-sapa-34782073.webp",
  vietnamHoiAn: "/images/tours/pexels/vietnam-hoi-an-33069528.webp",
  vietnamGoldenBridge: "/images/tours/pexels/vietnam-golden-bridge-5037910.webp",
  vietnamHoChiMinh: "/images/tours/pexels/vietnam-ho-chi-minh-30853340.webp",
  vietnamPhuQuoc: "/images/tours/pexels/vietnam-phu-quoc-26742979.webp",
  vietnamHanoiSkyline: "/images/tours/pexels/vietnam-hanoi-skyline-26919110.webp",
  vietnamHaLongIslands: "/images/tours/pexels/vietnam-ha-long-bay-islands-6876808.webp",
  vietnamHaLongLush: "/images/tours/pexels/vietnam-ha-long-bay-lush-26854908.webp",
  vietnamSapaTerraces: "/images/tours/pexels/vietnam-sapa-terraces-6713726.webp",
  vietnamNinhBinhSunset: "/images/tours/pexels/vietnam-ninh-binh-sunset-27966525.webp",
  vietnamNinhBinhBoat: "/images/tours/pexels/vietnam-ninh-binh-boat-28706866.webp",
  vietnamHoiAnOldTown: "/images/tours/pexels/vietnam-hoi-an-old-town-27949182.webp",
  vietnamHoiAnLanternFestival: "/images/tours/pexels/vietnam-hoi-an-lantern-festival-26805261.webp",
  vietnamGoldenBridgeClose: "/images/tours/pexels/vietnam-golden-bridge-32151473.webp",
  vietnamDaNangCoast: "/images/tours/pexels/vietnam-da-nang-coast-36947723.webp",
  vietnamHoChiMinhRiver: "/images/tours/pexels/vietnam-ho-chi-minh-river-33665972.webp",
  vietnamMekongFloatingMarket: "/images/tours/pexels/vietnam-mekong-floating-market-28356799.webp",
  vietnamPhuQuocBeach: "/images/tours/pexels/vietnam-phu-quoc-beach-14012627.webp",
  vietnamPhuQuocSunset: "/images/tours/pexels/vietnam-phu-quoc-sunset-37571062.webp",
  vietnamCoastalTrain: "/images/tours/pexels/vietnam-coastal-train-6136133.webp",
  centralAsiaAlmaty: "/images/tours/pexels/central-asia-almaty-18516807.webp",
  centralAsiaKazakhstanLake: "/images/tours/pexels/central-asia-kazakhstan-lake-37088177.webp",
  centralAsiaIssykKul: "/images/tours/pexels/central-asia-issyk-kul-24778688.webp",
  centralAsiaAlaToo: "/images/tours/pexels/central-asia-ala-too-33999679.webp",
  centralAsiaSamarkand: "/images/tours/pexels/central-asia-samarkand-32494061.webp",
  centralAsiaTashkent: "/images/tours/pexels/central-asia-tashkent-19227991.webp",
  japanTokyo: "/images/tours/pexels/japan-tokyo-31040217.webp",
  japanHokkaido: "/images/tours/pexels/japan-hokkaido-31944781.webp",
  japanBiei: "/images/tours/pexels/japan-biei-31416865.webp",
  japanOtaru: "/images/tours/pexels/japan-otaru-35505746.webp",
  russiaAuroraSea: "/images/tours/pexels/russia-murmansk-aurora-sea-12439594.webp",
  russiaAuroraGlow: "/images/tours/pexels/russia-murmansk-aurora-glow-12439591.webp",
  russiaAuroraForest: "/images/tours/pexels/russia-aurora-forest-8610944.webp",
  russiaWinter: "/images/tours/pexels/russia-murmansk-winter-11303361.webp",
  russiaMoscow: "/images/tours/pexels/russia-moscow-29999122.webp",
  russiaMoscowGolden: "/images/tours/pexels/russia-moscow-golden-5956455.webp",
  russiaStPetersburg: "/images/tours/pexels/russia-st-petersburg-6865593.webp",
  russiaHermitage: "/images/tours/pexels/russia-hermitage-9007396.webp",
} as const;

export const VIETNAM_PRODUCT_IMAGE_BY_SLUG: Record<string, string> = {
  "4d3n-northern-vietnam": PEXELS_TOUR_IMAGES.vietnamNinhBinh,
  "4d3n-northern-vietnam-with-sapa": PEXELS_TOUR_IMAGES.vietnamSapa,
  "5d4n-northern-vietnam-with-sapa-and-halong-bay": PEXELS_TOUR_IMAGES.vietnamSapaTerraces,
  "4d3n-northern-vietnam-with-halong-bay-day-cruise": PEXELS_TOUR_IMAGES.vietnamHaLongIslands,
  "4d3n-central-vietnam": PEXELS_TOUR_IMAGES.vietnamHoiAn,
  "4d3n-southern-vietnam": PEXELS_TOUR_IMAGES.vietnamHoChiMinh,
  "4d3n-phu-quoc-island-vietnam": PEXELS_TOUR_IMAGES.vietnamPhuQuocBeach,
  "5d4n-northern-vietnam": PEXELS_TOUR_IMAGES.vietnamHanoi,
  "6d5n-northern-and-central-vietnam": PEXELS_TOUR_IMAGES.vietnamGoldenBridge,
  "6d5n-northern-and-southern-vietnam": PEXELS_TOUR_IMAGES.vietnamHoChiMinhRiver,
  "6d5n-danang-phu-quoc": PEXELS_TOUR_IMAGES.vietnamDaNangCoast,
  "6d5n-ho-chi-minh-phu-quoc": PEXELS_TOUR_IMAGES.vietnamPhuQuoc,
  "7d6n-northern-and-central-vietnam": PEXELS_TOUR_IMAGES.vietnamHoiAnOldTown,
  "7d6n-northern-and-southern-vietnam": PEXELS_TOUR_IMAGES.vietnamMekongFloatingMarket,
  "7d6n-vietnam-from-north-to-south": PEXELS_TOUR_IMAGES.vietnamCoastalTrain,
  "7d6n-vietnam-south-to-north": PEXELS_TOUR_IMAGES.vietnamHaLong,
  "8d7n-vietnam-from-north-to-south": PEXELS_TOUR_IMAGES.vietnamHoiAnLanternFestival,
  "8d7n-vietnam-south-to-north": PEXELS_TOUR_IMAGES.vietnamHaLongLush,
  "9d8n-vietnam-from-north-to-south": PEXELS_TOUR_IMAGES.vietnamHanoiSkyline,
  "9d8n-vietnam-south-to-north": PEXELS_TOUR_IMAGES.vietnamNinhBinhSunset,
  "10d9n-vietnam-from-north-to-south": PEXELS_TOUR_IMAGES.vietnamGoldenBridgeClose,
  "10d9n-vietnam-south-to-north": PEXELS_TOUR_IMAGES.vietnamNinhBinhBoat,
  "7d6n-northern-vietnam-and-phu-quoc": PEXELS_TOUR_IMAGES.vietnamPhuQuocSunset,
};

function imageSeed(tour: TourProductImageInput) {
  return [tour.slug, tour.id, tour.title, tour.country, tour.cityHighlight]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("id-ID");
}

function stableIndex(seed: string, length: number) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) % length;
}

function choose(seed: string, images: readonly string[]) {
  return images[stableIndex(seed, images.length)];
}

function controlledCmsImage(value?: string | null) {
  const source = value?.trim();
  if (!source) return null;
  if (/^\/(?!\/)/.test(source)) return source;

  try {
    const url = new URL(source);
    const allowedHost =
      url.protocol === "https:"
      && (
        url.hostname === "res.cloudinary.com"
        || url.hostname === "images.unsplash.com"
        || url.hostname === "picsum.photos"
        || url.hostname === "fastly.picsum.photos"
        || url.hostname === "images.pexels.com"
        || url.hostname === "upload.wikimedia.org"
        || url.hostname.endsWith(".pexels.com")
        || url.hostname.endsWith(".rbth.com")
      );
    return allowedHost ? source : null;
  } catch {
    return null;
  }
}

const VIETNAM_MIXED = [
  PEXELS_TOUR_IMAGES.vietnamNinhBinh,
  PEXELS_TOUR_IMAGES.vietnamHaLong,
  PEXELS_TOUR_IMAGES.vietnamHanoi,
  PEXELS_TOUR_IMAGES.vietnamHoiAn,
  PEXELS_TOUR_IMAGES.vietnamGoldenBridge,
  PEXELS_TOUR_IMAGES.vietnamHoChiMinh,
] as const;

const CENTRAL_ASIA = [
  PEXELS_TOUR_IMAGES.centralAsiaAlmaty,
  PEXELS_TOUR_IMAGES.centralAsiaKazakhstanLake,
  PEXELS_TOUR_IMAGES.centralAsiaIssykKul,
  PEXELS_TOUR_IMAGES.centralAsiaAlaToo,
  PEXELS_TOUR_IMAGES.centralAsiaSamarkand,
  PEXELS_TOUR_IMAGES.centralAsiaTashkent,
] as const;

const JAPAN_WINTER = [
  PEXELS_TOUR_IMAGES.japanHokkaido,
  PEXELS_TOUR_IMAGES.japanBiei,
  PEXELS_TOUR_IMAGES.japanOtaru,
  PEXELS_TOUR_IMAGES.japanTokyo,
] as const;

const RUSSIA_AURORA = [
  PEXELS_TOUR_IMAGES.russiaAuroraSea,
  PEXELS_TOUR_IMAGES.russiaAuroraGlow,
  PEXELS_TOUR_IMAGES.russiaAuroraForest,
  PEXELS_TOUR_IMAGES.russiaWinter,
] as const;

const RUSSIA_CITY = [
  PEXELS_TOUR_IMAGES.russiaMoscow,
  PEXELS_TOUR_IMAGES.russiaMoscowGolden,
  PEXELS_TOUR_IMAGES.russiaStPetersburg,
  PEXELS_TOUR_IMAGES.russiaHermitage,
] as const;

const GENERIC_TRAVEL = [
  PEXELS_TOUR_IMAGES.centralAsiaKazakhstanLake,
  PEXELS_TOUR_IMAGES.vietnamNinhBinh,
  PEXELS_TOUR_IMAGES.japanTokyo,
  PEXELS_TOUR_IMAGES.russiaStPetersburg,
] as const;

export const TOUR_VISUAL_OVERRIDES: Record<string, TourVisualOverride> = {
  "winter-hokkaido-tokyo": {
    heroImg: PEXELS_TOUR_IMAGES.japanHokkaido,
    gallery: [
      PEXELS_TOUR_IMAGES.japanHokkaido,
      PEXELS_TOUR_IMAGES.japanBiei,
      PEXELS_TOUR_IMAGES.japanOtaru,
      PEXELS_TOUR_IMAGES.japanTokyo,
    ],
    itineraryImages: {
      1: PEXELS_TOUR_IMAGES.japanTokyo,
      2: PEXELS_TOUR_IMAGES.japanTokyo,
      3: PEXELS_TOUR_IMAGES.japanTokyo,
      4: PEXELS_TOUR_IMAGES.japanBiei,
      5: PEXELS_TOUR_IMAGES.japanBiei,
      6: PEXELS_TOUR_IMAGES.japanHokkaido,
      7: PEXELS_TOUR_IMAGES.japanOtaru,
      8: PEXELS_TOUR_IMAGES.japanHokkaido,
      9: PEXELS_TOUR_IMAGES.japanTokyo,
    },
  },
  "rusia-aurora-14-januari-2027": {
    heroImg: PEXELS_TOUR_IMAGES.russiaAuroraGlow,
    gallery: [
      PEXELS_TOUR_IMAGES.russiaAuroraGlow,
      PEXELS_TOUR_IMAGES.russiaAuroraForest,
      PEXELS_TOUR_IMAGES.russiaMoscow,
      PEXELS_TOUR_IMAGES.russiaStPetersburg,
      PEXELS_TOUR_IMAGES.russiaHermitage,
      PEXELS_TOUR_IMAGES.russiaWinter,
    ],
    itineraryImages: {
      1: PEXELS_TOUR_IMAGES.russiaMoscow,
      2: PEXELS_TOUR_IMAGES.russiaMoscow,
      3: PEXELS_TOUR_IMAGES.russiaHermitage,
      4: PEXELS_TOUR_IMAGES.russiaStPetersburg,
      5: PEXELS_TOUR_IMAGES.russiaAuroraGlow,
      6: PEXELS_TOUR_IMAGES.russiaWinter,
      7: PEXELS_TOUR_IMAGES.russiaMoscowGolden,
      8: PEXELS_TOUR_IMAGES.russiaMoscow,
      9: PEXELS_TOUR_IMAGES.russiaAuroraForest,
      10: PEXELS_TOUR_IMAGES.russiaAuroraGlow,
    },
  },
  "rusia-aurora-21-30-januari-2027": {
    heroImg: PEXELS_TOUR_IMAGES.russiaAuroraSea,
    gallery: [
      PEXELS_TOUR_IMAGES.russiaAuroraSea,
      PEXELS_TOUR_IMAGES.russiaAuroraForest,
      PEXELS_TOUR_IMAGES.russiaMoscowGolden,
      PEXELS_TOUR_IMAGES.russiaStPetersburg,
      PEXELS_TOUR_IMAGES.russiaHermitage,
      PEXELS_TOUR_IMAGES.russiaWinter,
    ],
    itineraryImages: {
      1: PEXELS_TOUR_IMAGES.russiaMoscowGolden,
      2: PEXELS_TOUR_IMAGES.russiaMoscow,
      3: PEXELS_TOUR_IMAGES.russiaHermitage,
      4: PEXELS_TOUR_IMAGES.russiaStPetersburg,
      5: PEXELS_TOUR_IMAGES.russiaAuroraSea,
      6: PEXELS_TOUR_IMAGES.russiaWinter,
      7: PEXELS_TOUR_IMAGES.russiaMoscowGolden,
      8: PEXELS_TOUR_IMAGES.russiaMoscow,
      9: PEXELS_TOUR_IMAGES.russiaAuroraForest,
      10: PEXELS_TOUR_IMAGES.russiaAuroraSea,
    },
  },
};

export function getTourVisualOverride(tour: TourProductImageInput) {
  const normalizedSlug = tour.slug?.trim().toLocaleLowerCase("id-ID");
  return normalizedSlug ? TOUR_VISUAL_OVERRIDES[normalizedSlug] ?? null : null;
}

export function getTourItineraryImage(
  cmsImage?: string | null,
  fallbackImage?: string | null,
) {
  return controlledCmsImage(cmsImage) ?? fallbackImage ?? undefined;
}

export function getTourProductImage(tour: TourProductImageInput) {
  const suppliedHero = controlledCmsImage(tour.heroImg);
  if (suppliedHero) return suppliedHero;

  const visualOverride = getTourVisualOverride(tour);
  if (visualOverride) return visualOverride.heroImg;

  const seed = imageSeed(tour);
  const normalizedSlug = tour.slug?.trim().toLocaleLowerCase("id-ID");
  const vietnamSlugImage = normalizedSlug
    ? VIETNAM_PRODUCT_IMAGE_BY_SLUG[normalizedSlug]
    : undefined;

  if (vietnamSlugImage) return vietnamSlugImage;

  if (/vietnam|hanoi|halong|ha long|ninh binh|sapa|danang|da nang|hoi an|phu quoc|ho chi minh|mekong/.test(seed)) {
    if (/phu quoc/.test(seed) && !/south.to.north|north.to.south|utara dan selatan/.test(seed)) {
      return PEXELS_TOUR_IMAGES.vietnamPhuQuoc;
    }
    if (/sapa/.test(seed)) return PEXELS_TOUR_IMAGES.vietnamSapa;
    if (/central|tengah|danang|da nang|hoi an/.test(seed) && !/south.to.north|north.to.south|utara dan tengah/.test(seed)) {
      return choose(seed, [PEXELS_TOUR_IMAGES.vietnamHoiAn, PEXELS_TOUR_IMAGES.vietnamGoldenBridge]);
    }
    if (/southern|selatan|ho chi minh|mekong|my tho/.test(seed) && !/south.to.north|north.to.south|utara dan selatan/.test(seed)) {
      return PEXELS_TOUR_IMAGES.vietnamHoChiMinh;
    }
    if (/northern|utara|ninh binh|tam coc|ha long|halong/.test(seed) && !/south.to.north|north.to.south|utara dan (selatan|tengah)/.test(seed)) {
      return choose(seed, [
        PEXELS_TOUR_IMAGES.vietnamNinhBinh,
        PEXELS_TOUR_IMAGES.vietnamHaLong,
        PEXELS_TOUR_IMAGES.vietnamHanoi,
      ]);
    }
    return choose(seed, VIETNAM_MIXED);
  }

  if (/japan|jepang|tokyo|hokkaido|sapporo|otaru|asahikawa|biei|furano/.test(seed)) {
    return choose(seed, JAPAN_WINTER);
  }

  if (/central asia|asia tengah|kazakh|kyrgyz|uzbek|tajik|almaty|bishkek|issyk|samarkand|tashkent|4[- ]tan/.test(seed)) {
    return choose(seed, CENTRAL_ASIA);
  }

  if (/russia|rusia|moscow|moskow|murmansk|petersburg|aurora|malam putih|white night/.test(seed)) {
    if (/aurora|murmansk|northern light|cahaya utara|winter|musim dingin|snow|beku|arctic|polar/.test(seed)) {
      return choose(seed, RUSSIA_AURORA);
    }
    return choose(seed, RUSSIA_CITY);
  }

  return choose(seed || "sundaftrip", GENERIC_TRAVEL);
}

export function getAbsoluteTourProductImage(tour: TourProductImageInput, siteUrl: string) {
  const image = getTourProductImage(tour);
  if (/^https?:\/\//i.test(image)) return image;
  return `${siteUrl.replace(/\/$/, "")}${image.startsWith("/") ? image : `/${image}`}`;
}
