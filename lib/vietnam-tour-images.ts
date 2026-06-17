type VietnamTourPhotoInput = {
  slug?: string | null;
  title: string;
  route_summary?: string | null;
  cityHighlight?: string | null;
  highlights?: string[] | null;
  brief_itinerary?: Array<{ route?: string | null }> | null;
  detailed_itinerary?: Array<{ heading?: string | null; details?: string[] | null }> | null;
  internal_flights?: Array<{ route?: string | null }> | null;
};

type VietnamDestinationKey =
  | "hanoi"
  | "ninh-binh"
  | "halong-bay"
  | "sapa"
  | "da-nang"
  | "hoi-an"
  | "ho-chi-minh"
  | "mekong-delta"
  | "phu-quoc";

const VIETNAM_CATALOG_IMAGE_BASE =
  "https://res.cloudinary.com/dlmgl1grq/image/upload/sundaftrip/vietnam/catalog";

function imageUrl(destination: VietnamDestinationKey, fileName: string) {
  return `${VIETNAM_CATALOG_IMAGE_BASE}/${destination}/${fileName}`;
}

const DESTINATION_IMAGES: Record<VietnamDestinationKey, string[]> = {
  hanoi: [
    imageUrl("hanoi", "hoan-kiem-lake.webp"),
    imageUrl("hanoi", "hanoi-street.webp"),
    imageUrl("hanoi", "train-street.webp"),
    imageUrl("hanoi", "temple-of-literature.webp"),
    imageUrl("hanoi", "one-pillar-pagoda.webp"),
    imageUrl("hanoi", "tran-quoc-pagoda.webp"),
    imageUrl("hanoi", "cyclo-tour.webp"),
    imageUrl("hanoi", "water-puppet-show.webp"),
  ],
  "ninh-binh": [
    imageUrl("ninh-binh", "tam-coc.webp"),
    imageUrl("ninh-binh", "mua-cave.webp"),
    imageUrl("ninh-binh", "trang-an.webp"),
    imageUrl("ninh-binh", "hoa-lu.webp"),
    imageUrl("ninh-binh", "bich-dong-pagoda.webp"),
    imageUrl("ninh-binh", "bai-dinh-pagoda.webp"),
    imageUrl("ninh-binh", "thung-nham-bird-park.webp"),
    imageUrl("ninh-binh", "mua-cave-customers.webp"),
  ],
  "halong-bay": [
    imageUrl("halong-bay", "ha-long-view.webp"),
    imageUrl("halong-bay", "halong-views.webp"),
    imageUrl("halong-bay", "ha-long-cruise.webp"),
    imageUrl("halong-bay", "kayaking.webp"),
    imageUrl("halong-bay", "sung-sot-cave.webp"),
    imageUrl("halong-bay", "taichi-cruise.webp"),
    imageUrl("halong-bay", "cooking-class.webp"),
    imageUrl("halong-bay", "meals-on-cruise.webp"),
    imageUrl("halong-bay", "customers-boating.webp"),
  ],
  sapa: [
    imageUrl("sapa", "rice-terrace.webp"),
    imageUrl("sapa", "sapa-morning.webp"),
    imageUrl("sapa", "cloud-view.webp"),
    imageUrl("sapa", "fansipan-mount.webp"),
    imageUrl("sapa", "cable-car.webp"),
    imageUrl("sapa", "sapa-locals.webp"),
    imageUrl("sapa", "silver-waterfalls.webp"),
    imageUrl("sapa", "love-waterfall-customers.webp"),
    imageUrl("sapa", "sapa-lake.webp"),
    imageUrl("sapa", "cat-cat-market.webp"),
  ],
  "da-nang": [
    imageUrl("da-nang", "golden-bridge-sunset.webp"),
    imageUrl("da-nang", "bana-hills.webp"),
    imageUrl("da-nang", "dragon-bridge.webp"),
    imageUrl("da-nang", "my-khe-beach.webp"),
    imageUrl("da-nang", "marble-mountain.webp"),
    imageUrl("da-nang", "linh-ung-pagoda.webp"),
    imageUrl("da-nang", "han-market.webp"),
    imageUrl("da-nang", "sun-world-cable-car.webp"),
    imageUrl("da-nang", "cham-museum.webp"),
    imageUrl("da-nang", "french-village-bana.webp"),
  ],
  "hoi-an": [
    imageUrl("hoi-an", "ancient-town.webp"),
    imageUrl("hoi-an", "lanterns.webp"),
    imageUrl("hoi-an", "basket-boat.webp"),
    imageUrl("hoi-an", "japanese-bridge.webp"),
    imageUrl("hoi-an", "tra-que-farming.webp"),
    imageUrl("hoi-an", "making-lanterns.webp"),
    imageUrl("hoi-an", "an-bang-beach.webp"),
    imageUrl("hoi-an", "memories-show.webp"),
    imageUrl("hoi-an", "hoi-an-street.webp"),
    imageUrl("hoi-an", "customers-with-lanterns.webp"),
  ],
  "ho-chi-minh": [
    imageUrl("ho-chi-minh", "city-view.webp"),
    imageUrl("ho-chi-minh", "night-view.webp"),
    imageUrl("ho-chi-minh", "ben-thanh-market.webp"),
    imageUrl("ho-chi-minh", "notre-dame-cathedral.webp"),
    imageUrl("ho-chi-minh", "independence-palace.webp"),
    imageUrl("ho-chi-minh", "cu-chi-tunnels.webp"),
    imageUrl("ho-chi-minh", "cu-chi-tunnels-2.webp"),
    imageUrl("ho-chi-minh", "hcm-street-customers.webp"),
    imageUrl("ho-chi-minh", "war-remnants-museum.webp"),
  ],
  "mekong-delta": [
    imageUrl("mekong-delta", "mekong-boat.webp"),
    imageUrl("mekong-delta", "floating-market.webp"),
    imageUrl("mekong-delta", "mekong-river.webp"),
    imageUrl("mekong-delta", "delta-view.webp"),
    imageUrl("mekong-delta", "tra-su-cajuput-forest.webp"),
    imageUrl("mekong-delta", "vinh-trang-pagoda.webp"),
    imageUrl("mekong-delta", "traditional-village.webp"),
    imageUrl("mekong-delta", "delta-sunset.webp"),
    imageUrl("mekong-delta", "local-meal.webp"),
    imageUrl("mekong-delta", "boat-ride-customers.webp"),
  ],
  "phu-quoc": [
    imageUrl("phu-quoc", "sao-beach.webp"),
    imageUrl("phu-quoc", "thom-island.webp"),
    imageUrl("phu-quoc", "cable-car.webp"),
    imageUrl("phu-quoc", "kiss-bridge.webp"),
    imageUrl("phu-quoc", "grand-world.webp"),
    imageUrl("phu-quoc", "sunset-sanato-beach.webp"),
    imageUrl("phu-quoc", "vinwonder.webp"),
    imageUrl("phu-quoc", "water-show.webp"),
  ],
};

const HERO_BY_SLUG: Record<string, string> = {
  "4d3n-northern-vietnam": imageUrl("ninh-binh", "tam-coc.webp"),
  "4d3n-northern-vietnam-with-sapa": imageUrl("sapa", "rice-terrace.webp"),
  "5d4n-northern-vietnam-with-sapa-and-halong-bay": imageUrl("sapa", "cloud-view.webp"),
  "4d3n-northern-vietnam-with-halong-bay-day-cruise": imageUrl("halong-bay", "ha-long-view.webp"),
  "4d3n-central-vietnam": imageUrl("da-nang", "golden-bridge-sunset.webp"),
  "4d3n-southern-vietnam": imageUrl("mekong-delta", "mekong-boat.webp"),
  "4d3n-phu-quoc-island-vietnam": imageUrl("phu-quoc", "sao-beach.webp"),
  "5d4n-northern-vietnam": imageUrl("halong-bay", "ha-long-cruise.webp"),
  "6d5n-northern-and-central-vietnam": imageUrl("da-nang", "golden-bridge-sunset.webp"),
  "6d5n-northern-and-southern-vietnam": imageUrl("halong-bay", "halong-views.webp"),
  "6d5n-danang-phu-quoc": imageUrl("phu-quoc", "cable-car.webp"),
  "6d5n-ho-chi-minh-phu-quoc": imageUrl("phu-quoc", "kiss-bridge.webp"),
  "7d6n-northern-and-central-vietnam": imageUrl("hoi-an", "lanterns.webp"),
  "7d6n-northern-and-southern-vietnam": imageUrl("ho-chi-minh", "city-view.webp"),
  "7d6n-vietnam-from-north-to-south": imageUrl("hoi-an", "ancient-town.webp"),
  "7d6n-vietnam-south-to-north": imageUrl("mekong-delta", "floating-market.webp"),
  "8d7n-vietnam-from-north-to-south": imageUrl("halong-bay", "ha-long-view.webp"),
  "8d7n-vietnam-south-to-north": imageUrl("ho-chi-minh", "night-view.webp"),
  "9d8n-vietnam-from-north-to-south": imageUrl("da-nang", "french-village-bana.webp"),
  "9d8n-vietnam-south-to-north": imageUrl("da-nang", "dragon-bridge.webp"),
  "10d9n-vietnam-from-north-to-south": imageUrl("phu-quoc", "sunset-sanato-beach.webp"),
  "10d9n-vietnam-south-to-north": imageUrl("phu-quoc", "grand-world.webp"),
  "7d6n-northern-vietnam-and-phu-quoc": imageUrl("phu-quoc", "grand-world.webp"),
};

const DESTINATION_PATTERNS: Array<[VietnamDestinationKey, RegExp[]]> = [
  ["hanoi", [/\bha\s*noi\b/i, /\bhanoi\b/i, /ho\s+chi\s+minh\s+mausoleum/i, /hoan\s+kiem/i, /train\s*street/i, /one\s+pillar/i, /tran\s+quoc/i, /temple\s+of\s+literature/i]],
  ["ninh-binh", [/ninh\s+binh/i, /hoa\s+lu/i, /tam\s+coc/i, /trang\s+an/i, /mua\s+cave/i, /bich\s+dong/i, /bai\s+dinh/i]],
  ["halong-bay", [/ha\s*long/i, /halong/i, /sung\s+sot/i]],
  ["sapa", [/\bsa\s*pa\b/i, /\bsapa\b/i, /fansipan/i, /cat\s+cat/i]],
  ["da-nang", [/da\s*nang/i, /danang/i, /ba\s*na/i, /bana/i, /golden\s+bridge/i, /dragon\s+bridge/i, /marble/i, /linh\s+ung/i]],
  ["hoi-an", [/hoi\s+an/i, /coconut\s+jungle/i, /cam\s+thanh/i, /japanese\s+bridge/i, /lantern/i, /tra\s+que/i]],
  ["ho-chi-minh", [/ho\s+chi\s+minh/i, /\bhcm\b/i, /saigon/i, /cu\s+chi/i, /ben\s+thanh/i, /notre\s+dame/i]],
  ["mekong-delta", [/mekong/i, /my\s+tho/i, /tra\s+su/i, /floating\s+market/i, /vinh\s+trang/i]],
  ["phu-quoc", [/phu\s+quoc/i, /grand\s+world/i, /thom\s+island/i, /sao\s+beach/i, /kiss\s+bridge/i]],
];

function addUnique<T>(items: T[], value: T) {
  if (!items.includes(value)) items.push(value);
}

function detectDestination(value: string): VietnamDestinationKey | null {
  for (const [key, patterns] of DESTINATION_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(value))) return key;
  }
  return null;
}

function orderedTextParts(tour: VietnamTourPhotoInput) {
  return [
    tour.route_summary,
    tour.cityHighlight,
    ...(tour.brief_itinerary ?? []).map((item) => item.route),
    ...(tour.detailed_itinerary ?? []).map((item) => item.heading),
    ...(tour.detailed_itinerary ?? []).flatMap((item) => item.details ?? []),
    ...(tour.internal_flights ?? []).map((item) => item.route),
    ...(tour.highlights ?? []),
    tour.title,
  ].filter((item): item is string => Boolean(item?.trim()));
}

export function vietnamDestinationSequence(tour: VietnamTourPhotoInput): VietnamDestinationKey[] {
  const destinations: VietnamDestinationKey[] = [];
  for (const part of orderedTextParts(tour)) {
    for (const segment of part.split(/[|,\/;:()\-\u2013\u2014]+/)) {
      const destination = detectDestination(segment);
      if (destination) addUnique(destinations, destination);
    }
  }
  return destinations.length > 0 ? destinations : ["hanoi", "halong-bay", "ninh-binh"];
}

export function heroForVietnamTour(tour: VietnamTourPhotoInput) {
  if (tour.slug && HERO_BY_SLUG[tour.slug]) return HERO_BY_SLUG[tour.slug];
  const [firstDestination] = vietnamDestinationSequence(tour);
  return DESTINATION_IMAGES[firstDestination][0];
}

export function galleryForVietnamTour(tour: VietnamTourPhotoInput) {
  const destinations = vietnamDestinationSequence(tour);
  const images: string[] = [];
  addUnique(images, heroForVietnamTour(tour));

  const imagesPerDestination = destinations.length === 1 ? 6 : destinations.length >= 5 ? 2 : 3;
  for (const destination of destinations) {
    for (const image of DESTINATION_IMAGES[destination].slice(0, imagesPerDestination)) {
      addUnique(images, image);
    }
  }

  return images.slice(0, 16);
}

export function allVietnamCatalogImages() {
  return Object.values(DESTINATION_IMAGES).flat();
}
