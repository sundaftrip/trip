import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidateTag, revalidatePath } from "next/cache";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { PLAN_FEATURES } from "@/lib/plan";
import { getPlan } from "@/lib/license";
import { apiError } from "@/lib/api-error";

const PUBLIC_SETTING_KEYS = [
  "about_destinations",
  "about_story",
  "about_tagline",
  "about_values",
  "color_accent",
  "color_blog_title",
  "color_eyebrow",
  "color_heading",
  "color_hero",
  "color_scheme",
  "color_tour_title",
  "company_description",
  "company_email",
  "company_facebook",
  "company_google_business",
  "company_instagram",
  "company_legal_name",
  "company_linkedin",
  "company_logo",
  "company_name",
  "company_nib",
  "company_phone",
  "company_tiktok",
  "company_twitter",
  "company_website",
  "company_whatsapp",
  "company_youtube",
  "favicon_logo",
  "site_font",
  "site_theme",
] as const;

const PUBLIC_SETTING_KEY_SET = new Set<string>(PUBLIC_SETTING_KEYS);
const SECRET_SETTING_KEY_PATTERN = /(?:^|[_-])(?:api[_-]?key|credential|hash|password|passwd|private[_-]?key|reset|salt|secret|token)(?:[_-]|$)/i;

function isSecretSettingKey(key: string) {
  return SECRET_SETTING_KEY_PATTERN.test(key);
}

async function hasPersistedAuthenticatedSession() {
  try {
    const userId = (await auth())?.user?.id;
    if (!userId) return false;

    return Boolean(await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    }));
  } catch {
    return false;
  }
}

export async function GET() {
  const authenticated = await hasPersistedAuthenticatedSession();
  const items = await prisma.companyInfo.findMany({
    ...(authenticated ? {} : { where: { key: { in: [...PUBLIC_SETTING_KEYS] } } }),
    select: { key: true, value: true },
  });
  const result: Record<string, string> = {};
  items.forEach((item) => {
    if (isSecretSettingKey(item.key)) return;
    if (!authenticated && !PUBLIC_SETTING_KEY_SET.has(item.key)) return;
    result[item.key] = item.value;
  });
  const response = NextResponse.json(result);
  if (authenticated) response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, string>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  // Hanya nilai string yang diterima (kolom CompanyInfo.value bertipe String)
  for (const k of Object.keys(body)) {
    if (typeof body[k] !== "string") delete body[k];
  }

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

  try {
    await Promise.all(
      Object.entries(body).map(([key, value]) =>
        prisma.companyInfo.upsert({ where: { key }, update: { value }, create: { key, value } })
      )
    );
    (revalidateTag as unknown as (t: string) => void)("site-colors");
    (revalidateTag as unknown as (t: string) => void)("footer-data");
    (revalidateTag as unknown as (t: string) => void)("home-data");
    (revalidateTag as unknown as (t: string) => void)("company-meta");
    // Schema Organization juga baca info perusahaan — ikut disegarkan biar sinkron
    (revalidateTag as unknown as (t: string) => void)("site-org-schema");
    (revalidateTag as unknown as (t: string) => void)("company-info");
    // Tema/warna/font berdampak ke seluruh halaman — buang cache rute sesitus
    (revalidatePath as unknown as (p: string, t?: string) => void)("/", "layout");

    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "UPDATE", resource: "SETTINGS",
      detail: isColorChange ? "Update warna/tema" : "Update info perusahaan",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
