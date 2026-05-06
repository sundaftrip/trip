import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const published = searchParams.get("published");

  const where: Record<string, unknown> = {};
  if (published === "true") where.published = true;

  const posts = await prisma.blog.findMany({
    where,
    orderBy: { date: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const post = await prisma.blog.create({ data: body });
  return NextResponse.json(post, { status: 201 });
}
