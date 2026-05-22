import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const WIKIPEDIA_URL =
  "https://en.wikipedia.org/wiki/Visa_requirements_for_Indonesian_citizens";

const NAME_ALIASES: Record<string, string> = {
  UAE: "United Arab Emirates",
  "Macao SAR": "Macau",
  "Timor-Leste": "East Timor",
  Taiwan: "Taiwan (Republic of China)",
};

const VISA_FREE_KW = ["visa not required", "freedom of movement", "visa-free", "visa free"];
const VOA_KW = ["visa on arrival", "on arrival"];
const EVISA_KW = [
  "evisa",
  "e-visa",
  "electronic visa",
  "electronic travel",
  "eta",
  "online visa",
];
const REQUIRED_KW = ["visa required", "visa is required"];

function norm(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9]/g, "");
}

function clean(text: string): string {
  return text.replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
}

function has(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => {
    const pattern = new RegExp(
      "\\b" + kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b",
    );
    return pattern.test(text);
  });
}

function classify(raw: string): string {
  const t = raw.toLowerCase();
  if (has(t, VISA_FREE_KW)) return "bebas";
  const hasVoa = has(t, VOA_KW);
  const hasEvisa = has(t, EVISA_KW);
  if (hasVoa && hasEvisa) return "evisa";
  if (hasVoa) return "voa";
  if (hasEvisa) return "evisa";
  if (has(t, REQUIRED_KW)) return "wajib";
  return "";
}

function translateStay(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/\bdays?\b/gi, "hari")
    .replace(/\bmonths?\b/gi, "bulan")
    .replace(/\byears?\b/gi, "tahun")
    .replace(/freedom of movement/gi, "Bebas (perjanjian khusus)")
    .trim();
}

type WikiRow = { country: string; visa_raw: string; stay_raw: string };

function parseWiki(html: string): Map<string, WikiRow> {
  const $ = cheerio.load(html);
  const rows = new Map<string, WikiRow>();

  $("table.wikitable").each((_, table) => {
    const headers = $(table)
      .find("tr")
      .first()
      .find("th")
      .map((__, th) => $(th).text().trim().toLowerCase())
      .get();
    const isRelevant = headers.some(
      (h) => h.includes("visa requirement") || h.includes("conditions of access"),
    );
    if (!isRelevant) return;

    $(table)
      .find("tr")
      .each((__, tr) => {
        const cells = $(tr).children("td, th");
        if (cells.length < 3) return;

        let country = "";
        $(cells[0])
          .find("a")
          .each((___, a) => {
            const txt = $(a).text().trim();
            if (txt && !country) country = txt;
          });
        if (!country) country = clean($(cells[0]).text());
        const key = norm(country);
        if (!key || rows.has(key)) return;

        rows.set(key, {
          country,
          visa_raw: clean($(cells[1]).text()),
          stay_raw: clean($(cells[2]).text()),
        });
      });
  });

  return rows;
}

function matchRow(
  en: string,
  name: string,
  wiki: Map<string, WikiRow>,
): WikiRow | null {
  const aliased = NAME_ALIASES[en] ?? en;
  for (const cand of [aliased, en, name]) {
    const row = wiki.get(norm(cand));
    if (row) return row;
  }
  return null;
}

type Diff = {
  id: string;
  flag: string;
  name: string;
  en: string;
  changes: Array<{ field: "visa" | "stay"; current: string; wiki: string; raw?: string }>;
};

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let html: string;
  try {
    const res = await fetch(WIKIPEDIA_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SundafTripVisaScraper/1.0; +https://sundaftrip.com)",
        Accept: "text/html",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Wikipedia returned ${res.status}` },
        { status: 502 },
      );
    }
    html = await res.text();
  } catch (e) {
    return NextResponse.json(
      { error: `Gagal fetch Wikipedia: ${(e as Error).message}` },
      { status: 502 },
    );
  }

  const wiki = parseWiki(html);
  if (wiki.size === 0) {
    return NextResponse.json(
      { error: "Tidak ada baris terbaca dari Wikipedia — struktur halaman mungkin berubah." },
      { status: 500 },
    );
  }

  const entries = await prisma.countryVisa.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const diffs: Diff[] = [];
  const unmatched: string[] = [];

  for (const c of entries) {
    const row = matchRow(c.en, c.name, wiki);
    if (!row) {
      unmatched.push(c.name);
      continue;
    }
    const newVisa = classify(row.visa_raw);
    const newStay = translateStay(row.stay_raw);
    const changes: Diff["changes"] = [];
    if (newVisa && newVisa !== c.visa) {
      changes.push({
        field: "visa",
        current: c.visa,
        wiki: newVisa,
        raw: row.visa_raw,
      });
    }
    if (newStay && newStay !== c.stay) {
      changes.push({ field: "stay", current: c.stay, wiki: newStay });
    }
    if (changes.length > 0) {
      diffs.push({
        id: c.id,
        flag: c.flag,
        name: c.name,
        en: c.en,
        changes,
      });
    }
  }

  return NextResponse.json({
    scrapedAt: new Date().toISOString(),
    source: WIKIPEDIA_URL,
    totalEntries: entries.length,
    wikiRowCount: wiki.size,
    diffs,
    unmatched,
  });
}
