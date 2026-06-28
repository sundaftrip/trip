export type ScraperImage = {
  url: string;
  photographer: string;
  photographerUrl: string;
};

type ImageKeywordInput = {
  generatedKeywords?: string | null;
  originalTitle: string;
  sourceContent: string;
};

const GENERIC_IMAGE_WORDS = new Set([
  "adventure",
  "asia",
  "beautiful",
  "best",
  "city",
  "culture",
  "destination",
  "destinasi",
  "europe",
  "food",
  "guide",
  "holiday",
  "image",
  "illustration",
  "journey",
  "landscape",
  "passport",
  "panduan",
  "photo",
  "place",
  "places",
  "praktis",
  "route",
  "routes",
  "rute",
  "scenery",
  "tour",
  "tourism",
  "travel",
  "trip",
  "tips",
  "vacation",
  "visa",
  "wisata",
  "world",
]);

const STOP_WORDS = new Set([
  "about",
  "agar",
  "akan",
  "atau",
  "bagi",
  "bisa",
  "dari",
  "dengan",
  "for",
  "from",
  "ini",
  "into",
  "jadi",
  "kamu",
  "karena",
  "ke",
  "lebih",
  "oleh",
  "pada",
  "that",
  "the",
  "this",
  "untuk",
  "yang",
]);

function decodeText(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function tokens(value: string) {
  return (decodeText(value).toLowerCase().match(/[a-z0-9][a-z0-9-]{2,}/g) ?? [])
    .map((token) => token.replace(/^-+|-+$/g, ""))
    .filter(Boolean);
}

function meaningfulTokens(value: string) {
  return tokens(value).filter((token) => !STOP_WORDS.has(token) && !GENERIC_IMAGE_WORDS.has(token));
}

export function normalizeImageKeywords(value: string | null | undefined) {
  const unique = new Set<string>();
  for (const token of meaningfulTokens(value ?? "")) {
    unique.add(token);
    if (unique.size >= 8) break;
  }
  return [...unique].join(" ");
}

export function chooseSourceGroundedImageKeywords({
  generatedKeywords,
  originalTitle,
  sourceContent,
}: ImageKeywordInput) {
  const sourceTokens = new Set(meaningfulTokens(`${originalTitle}\n${sourceContent}`));
  const generated = normalizeImageKeywords(generatedKeywords);
  const generatedTokens = meaningfulTokens(generated);
  const groundedGeneratedTokens = generatedTokens.filter((token) => sourceTokens.has(token));

  if (generated && groundedGeneratedTokens.length > 0) {
    return groundedGeneratedTokens.join(" ");
  }

  const sourceTitle = normalizeImageKeywords(originalTitle);
  if (sourceTitle) return sourceTitle;

  return "";
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function injectImagesIntoBody(body: string, images: ScraperImage[], keywords: string): string {
  if (images.length === 0) return body;

  const sections = body.split(/(<\/h2>)/i);
  const alt = escapeAttribute(`Ilustrasi terkait ${keywords}`);
  let imgIdx = 0;
  let result = "";

  for (let i = 0; i < sections.length; i++) {
    result += sections[i];
    if (/^<\/h2>$/i.test(sections[i]) && imgIdx < images.length) {
      const img = images[imgIdx];
      result += `\n<figure style="margin:1.5rem 0;border-radius:12px;overflow:hidden;">` +
        `<img src="${escapeAttribute(img.url)}" alt="${alt}" style="width:100%;height:auto;display:block;" loading="lazy" />` +
        `</figure>\n`;
      imgIdx++;
    }
  }

  return result;
}
