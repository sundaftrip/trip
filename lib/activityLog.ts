import { prisma } from "@/lib/prisma";

export type LogAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT";
export type LogResource = "TOUR" | "RECEIPT" | "BLOG" | "USER" | "SETTINGS" | "TEXTS" | "PERMISSIONS" | "SCRAPER" | "GEO";

interface LogParams {
  userId: string;
  userName: string;
  userRole: string;
  action: LogAction;
  resource: LogResource;
  resourceId?: string;
  resourceName?: string;
  detail?: string;
}

export async function logActivity(params: LogParams): Promise<void> {
  try {
    await prisma.activityLog.create({ data: params });
  } catch {
    // Non-critical — don't break the request if logging fails
  }
}
