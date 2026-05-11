import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const key = req.headers.get("x-master-key");
  if (!process.env.MASTER_API_KEY || key !== process.env.MASTER_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [tours, blogs, testimonials, users, info, lastLog] = await Promise.all([
    prisma.tour.count({ where: { status: "ACTIVE" } }),
    prisma.blog.count({ where: { published: true } }),
    prisma.testimonial.count({ where: { published: true } }),
    prisma.user.count(),
    prisma.companyInfo.findMany({ where: { key: { in: ["company_name", "site_theme"] } } }),
    prisma.activityLog.findFirst({ orderBy: { createdAt: "desc" } }).catch(() => null),
  ]);

  const infoMap: Record<string, string> = {};
  info.forEach((i) => { infoMap[i.key] = i.value; });

  return NextResponse.json({
    name: infoMap["company_name"] ?? "",
    theme: infoMap["site_theme"] ?? "classic",
    tours,
    blogs,
    testimonials,
    users,
    lastActivity: lastLog?.createdAt ?? null,
  });
}
