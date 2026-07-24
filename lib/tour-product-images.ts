export type TourProductImageInput = {
  id?: string | null;
  slug?: string | null;
  title?: string | null;
  country?: string | null;
  cityHighlight?: string | null;
  heroImg?: string | null;
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

export function getTourProductImage(tour: TourProductImageInput) {
  const seed = imageSeed(tour);

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
