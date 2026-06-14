"use server";

import type { ReferralDisputeStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUSES = new Set(["OPEN", "REVIEWING", "RESOLVED", "REJECTED"]);

export async function updateDisputeAction(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const raw = String(formData.get("status") ?? "");
  const status = (STATUSES.has(raw) ? raw : "OPEN") as ReferralDisputeStatus;

  await prisma.referralDispute.update({ where: { id }, data: { status } });

  revalidatePath("/admin/disputes");
  redirect("/admin/disputes");
}
