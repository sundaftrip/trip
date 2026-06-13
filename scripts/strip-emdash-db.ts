/**
 * Bersihkan em-dash (—) dari konten DB user-facing → ganti koma (prosa).
 * Mode default DRY-RUN (cuma laporan). Jalankan dgn argumen "apply" utk eksekusi.
 *
 *   npx tsx scripts/strip-emdash-db.ts          # dry-run (laporan saja)
 *   npx tsx scripts/strip-emdash-db.ts apply     # eksekusi update
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("apply");
const EM = "—";

// Rule: em-dash + spasi di sekitarnya → ", ". Lone em-dash → "-" (placeholder).
function fix(v: unknown): unknown {
  if (typeof v !== "string") return deepFix(v);
  if (!v.includes(EM)) return v;
  if (v.trim() === EM) return "-"; // placeholder utuh "—" → "-"
  let r = v;
  r = r.replace(/(\d)\s*—\s*(\d)/g, "$1-$2"); // rentang angka: 3 — 5 → 3-5
  r = r.replace(/\s*—\s*/g, ", "); // em-dash + spasi apa pun (termasuk antar-kata) → ", "
  r = r.replace(/ ,/g, ",").replace(/,\s*,/g, ","); // rapikan
  return r;
}

// Deep-fix untuk Json (object/array) & string[].
function deepFix(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(deepFix);
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) o[k] = deepFix(val);
    return o;
  }
  if (typeof v === "string") return fix(v);
  return v;
}

function hasEm(v: unknown): boolean {
  if (typeof v === "string") return v.includes(EM);
  if (Array.isArray(v)) return v.some(hasEm);
  if (v && typeof v === "object") return Object.values(v).some(hasEm);
  return false;
}

type Row = Record<string, unknown> & { id: string; key?: string };
type Patch = Record<string, unknown>;
type Spec = { model: string; fields: string[]; find: () => Promise<unknown[]>; update: (id: string, data: Patch) => Promise<unknown> };

const specs: Spec[] = [
  { model: "Blog", fields: ["title", "excerpt", "body", "category", "author"],
    find: () => prisma.blog.findMany(), update: (id, d) => prisma.blog.update({ where: { id }, data: d }) },
  { model: "Faq", fields: ["question", "answer", "section"],
    find: () => prisma.faq.findMany(), update: (id, d) => prisma.faq.update({ where: { id }, data: d }) },
  { model: "CompanyInfo", fields: ["value"],
    find: () => prisma.companyInfo.findMany(), update: (id, d) => prisma.companyInfo.update({ where: { id }, data: d }) },
  { model: "SiteText", fields: ["valueId", "valueEn"],
    find: () => prisma.siteText.findMany(), update: (id, d) => prisma.siteText.update({ where: { id }, data: d }) },
  { model: "Tour", fields: ["title", "cityHighlight", "duration", "visaInfo", "badge", "notes", "description", "inclusions", "exclusions", "itinerary", "hotel", "addOns"],
    find: () => prisma.tour.findMany(), update: (id, d) => prisma.tour.update({ where: { id }, data: d }) },
  { model: "Testimonial", fields: ["name", "content"],
    find: () => prisma.testimonial.findMany(), update: (id, d) => prisma.testimonial.update({ where: { id }, data: d }) },
  { model: "CountryVisa", fields: ["name", "en", "region", "stay", "cost", "notes", "eligibility", "documents", "faqs"],
    find: () => prisma.countryVisa.findMany(), update: (id, d) => prisma.countryVisa.update({ where: { id }, data: d }) },
  { model: "VisaVariant", fields: ["name", "processingTime", "notes"],
    find: () => prisma.visaVariant.findMany(), update: (id, d) => prisma.visaVariant.update({ where: { id }, data: d }) },
];

async function main() {
  let totalRows = 0;
  let totalFields = 0;
  for (const spec of specs) {
    let rows: unknown[];
    try { rows = await spec.find(); }
    catch (e: unknown) { console.log(`! skip ${spec.model}: ${e instanceof Error ? e.message : String(e)}`); continue; }
    for (const item of rows) {
      const row = item as Row;
      const patch: Patch = {};
      for (const f of spec.fields) {
        if (!(f in row)) continue;
        if (!hasEm(row[f])) continue;
        const fixed = fix(row[f]);
        patch[f] = fixed;
        totalFields++;
        const raw = typeof row[f] === "string" ? row[f] : JSON.stringify(row[f]);
        const out = typeof fixed === "string" ? fixed : JSON.stringify(fixed);
        const i = raw.indexOf(EM);
        console.log(`  ${spec.model}.${f} [${row.id ?? row.key}]`);
        console.log(`    before: …${raw.slice(Math.max(0, i - 30), i + 30).replace(/\n/g, " ")}…`);
        const j = out.search(/, |-(?=[A-Za-z])/);
        console.log(`    after : …${out.slice(Math.max(0, (j < 0 ? i : j) - 30), (j < 0 ? i : j) + 30).replace(/\n/g, " ")}…`);
      }
      if (Object.keys(patch).length) {
        totalRows++;
        if (APPLY) await spec.update(row.id, patch);
      }
    }
  }
  console.log(`\n${APPLY ? "APPLIED" : "DRY-RUN"} — baris terdampak: ${totalRows}, field terdampak: ${totalFields}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error("ERR:", e.message); await prisma.$disconnect(); process.exit(1); });
