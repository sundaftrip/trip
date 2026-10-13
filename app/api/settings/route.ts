import { isInternalCompanyInfoKey, publicCompanyInfoWhere } from "@/lib/company-info";
import { notifyIndexNowChange } from "@/lib/indexnow-server";
import { settingsContentChange } from "@/lib/indexnow-content";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidateTag, revalidatePath } from "next/cache";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { apiError } from "@/lib/api-error";
import { EDITABLE_SETTING_KEYS } from "@/lib/company-settings";

const PUBLIC_SETTING_KEYS = [
  "about_destinations",
  "about_story",
  "about_tagline",
  "about_values",
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
    ...(authenticated ? { where: publicCompanyInfoWhere } : { where: { key: { in: [...PUBLIC_SETTING_KEYS] } } }),
    select: { key: true, value: true },
  });
  const result: Record<string, string> = {};
  items.forEach((item) => {
    if (isSecretSettingKey(item.key)) return;
    if (isInternalCompanyInfoKey(item.key)) return;
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

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Format pengaturan tidak valid." }, { status: 400 });
  }
  if (Object.keys(body).some(isInternalCompanyInfoKey)) {
    return NextResponse.json({ error: "Pengaturan internal tidak dapat diubah melalui CMS." }, { status: 400 });
  }
  // Hanya kunci yang memang punya form di CMS yang boleh ditulis.
  const unknownKeys = Object.keys(body).filter((key) => !EDITABLE_SETTING_KEYS.has(key));
  if (unknownKeys.length > 0) {
    return NextResponse.json({ error: `Pengaturan ini tidak bisa diubah dari CMS: ${unknownKeys.join(", ")}` }, { status: 400 });
  }
  // Hanya nilai string yang diterima (kolom CompanyInfo.value bertipe String)
  const values: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string") values[key] = value.trim();
  }
  if (Object.keys(values).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan untuk disimpan." }, { status: 400 });
  }

  // Keep the WhatsApp number in the digits-only form wa.me links need,
  // regardless of how it was typed in the admin panel.
  if (typeof values.company_whatsapp === "string") {
    values.company_whatsapp = values.company_whatsapp.replace(/\D/g, "");
  }

  if (!await checkPermission(session, "company_edit"))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  try {
    const previous = await prisma.companyInfo.findMany({
      where: { key: { in: Object.keys(values).filter((key) => key.startsWith("company_") || key.startsWith("about_")) } },
      select: { key: true, value: true },
    });
    const discoveryChange = settingsContentChange(Object.fromEntries(previous.map((row) => [row.key, row.value])), values);
    await Promise.all(
      Object.entries(values).map(([key, value]) =>
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
    // Info perusahaan tampil di header/footer seluruh halaman — buang cache rute sesitus
    (revalidatePath as unknown as (p: string, t?: string) => void)("/", "layout");

    const isAboutChange = Object.keys(values).every((key) => key.startsWith("about_"));
    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "UPDATE", resource: "SETTINGS",
      detail: isAboutChange ? "Update halaman Tentang Kami" : "Update info perusahaan",
    });

    await notifyIndexNowChange(discoveryChange);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
