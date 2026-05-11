import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function AppleIcon() {
  try {
    const logoRow = await prisma.companyInfo.findFirst({
      where: { key: "company_logo" },
    });
    const logoUrl = logoRow?.value;

    if (logoUrl) {
      return new ImageResponse(
        <div
          style={{
            background: "#ffffff",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 36,
            padding: 16,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            width={148}
            height={148}
            alt="logo"
            style={{ objectFit: "contain" }}
          />
        </div>,
        { ...size }
      );
    }
  } catch {
    /* fallback */
  }

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
        fontSize: 96,
        fontWeight: 900,
        borderRadius: 36,
      }}
    >
      S
    </div>,
    { ...size }
  );
}
