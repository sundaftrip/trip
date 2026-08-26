import { serializeVisaIntelligenceRss } from "@/lib/visa-intelligence";
import { loadVisaIntelligenceDataset } from "@/lib/visa-intelligence-server";

export const revalidate = 3600;

export async function GET() {
  const dataset = await loadVisaIntelligenceDataset();

  return new Response(serializeVisaIntelligenceRss(dataset), {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "application/rss+xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
