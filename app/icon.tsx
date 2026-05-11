import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Icon() {
  try {
    const rows = await prisma.companyInfo.findMany({
      where: { key: { in: ["favicon_logo", "company_logo"] } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const logoUrl = map["favicon_logo"] || map["company_logo"];

    if (logoUrl) {
      return new ImageResponse(
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          width={32}
          height={32}
          alt="logo"
          style={{ objectFit: "contain", width: "100%", height: "100%" }}
        />,
        { ...size }
      );
    }
  } catch {
    /* fallback ke default */
  }

  /* Fallback: huruf S di atas navy */
  return new ImageResponse(
    <div
      style={{
        background: "#1e3a5f",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#f97316",
        fontSize: 22,
        fontWeight: 900,
        borderRadius: 6,
      }}
    >
      S
    </div>,
    { ...size }
  );
}
