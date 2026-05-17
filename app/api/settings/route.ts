import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { PLAN_FEATURES } from "@/lib/plan";
import { getPlan } from "@/lib/license";

export async function GET() {
  const items = await prisma.companyInfo.findMany();
  const result: Record<string, string> = {};
  items.forEach((i) => { result[i.key] = i.value; });
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: Record<string, string> = await req.json();

  // Keep the WhatsApp number in the digits-only form wa.me links need,
  // regardless of how it was typed in the admin panel.
  if (typeof body.company_whatsapp === "string") {
    body.company_whatsapp = body.company_whatsapp.replace(/\D/g, "");
  }

  // Block plan-locked features — plan diresolusi dari MASTER
  const plan = await getPlan();

  if (body.site_theme && body.site_theme !== "classic") {
    const featureKey = `theme_${body.site_theme}`;
    if (PLAN_FEATURES[featureKey] === "pro" && plan !== "pro") {
      return NextResponse.json({ error: "Tema ini memerlukan paket Pro" }, { status: 403 });
    }
  }

  // Skema warna juga fitur Pro
  if (body.color_scheme && PLAN_FEATURES["color_schemes"] === "pro" && plan !== "pro") {
    return NextResponse.json({ error: "Skema warna memerlukan paket Pro" }, { status: 403 });
  }

  const isColorChange = Object.keys(body).some((k) => k.startsWith("color_") || k.startsWith("site_"));
  const permKey = isColorChange ? "color_edit" : "company_edit";

  if (!await checkPermission(session, permKey))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  await Promise.all(
    Object.entries(body).map(([key, value]) =>
      prisma.companyInfo.upsert({ where: { key }, update: { value }, create: { key, value } })
    )
  );
  (revalidateTag as unknown as (t: string) => void)("site-colors");
  (revalidateTag as unknown as (t: string) => void)("footer-data");

  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role, action: "UPDATE", resource: "SETTINGS",
    detail: isColorChange ? "Update warna/tema" : "Update info perusahaan",
  });

  return NextResponse.json({ success: true });
}
