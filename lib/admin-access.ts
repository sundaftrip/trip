import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { accessLabel, resolvePermissionMap } from "@/lib/permission-keys";
import {
  ADMIN_MODULES,
  canOpenAdminModule,
  getAdminModule,
  type AdminModule,
  type AdminModuleKey,
} from "@/lib/admin-modules";

export type AdminViewer = {
  session: Session;
  id: string;
  name: string;
  email: string;
  role: string;
  accessLabel: string;
  permissions: Record<string, boolean>;
};

/**
 * The signed-in CMS user with permissions resolved from the database. Cached
 * per request so the layout and the page share a single lookup.
 */
export const getAdminViewer = cache(async (): Promise<AdminViewer | null> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, permissions: true },
  });
  if (!user) return null;

  return {
    session,
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    accessLabel: accessLabel(user.role, user.permissions),
    permissions: resolvePermissionMap(user.role, user.permissions),
  };
});

export function canOpenModule(viewer: AdminViewer, key: AdminModuleKey) {
  return canOpenAdminModule(getAdminModule(key), viewer);
}

export function allowedAdminModules(viewer: AdminViewer): AdminModule[] {
  return ADMIN_MODULES.filter((module) => canOpenAdminModule(module, viewer));
}

/** Page guard: unknown users go to login, users without access to the dashboard. */
export async function requireAdminModule(key: AdminModuleKey): Promise<AdminViewer> {
  const viewer = await getAdminViewer();
  if (!viewer) redirect("/admin/login");
  if (!canOpenModule(viewer, key)) redirect("/admin?akses=ditolak");
  return viewer;
}

export function can(viewer: AdminViewer, permission: string) {
  return viewer.permissions[permission] === true;
}
