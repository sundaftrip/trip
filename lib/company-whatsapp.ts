import { prisma } from "@/lib/prisma";

/**
 * WhatsApp number for public CTAs: the deployment override first, then the
 * number saved in CMS settings. Returns an empty string when neither exists.
 */
export async function getConfiguredWhatsAppNumber() {
  if (process.env.SUNDAF_WHATSAPP_NUMBER) return process.env.SUNDAF_WHATSAPP_NUMBER;
  const row = await prisma.companyInfo.findUnique({ where: { key: "company_whatsapp" } }).catch(() => null);
  return row?.value ?? "";
}
