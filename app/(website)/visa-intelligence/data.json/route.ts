import { loadVisaIntelligenceDataset } from "@/lib/visa-intelligence-server";

export const revalidate = 3600;

export async function GET() {
  const dataset = await loadVisaIntelligenceDataset();

  return Response.json(dataset, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
