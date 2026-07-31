import "server-only";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PERMISSIONS, ALL_PERMISSION_KEYS } from "@/lib/permission-keys";
import {
  checkPermissionsWithLookup,
  type PermissionSession,
} from "@/lib/authorization";

export { ALL_PERMISSION_KEYS, DEFAULT_PERMISSIONS, PERMISSION_LABELS } from "@/lib/permission-keys";

export async function checkPermission(
  session: PermissionSession,
  key: string
): Promise<boolean> {
  return checkPermissions(session, [key]);
}

export async function checkPermissions(
  session: PermissionSession,
  keys: readonly string[],
): Promise<boolean> {
  return checkPermissionsWithLookup(
    session,
    keys,
    async (id) => prisma.user.findUnique({
      where: { id },
      select: { id: true, permissions: true, role: true },
    }),
  );
}

/**
 * Confirms that a JWT still belongs to a current database user. Use this for
 * authenticated read paths that do not require a feature-specific permission.
 */
export async function hasPersistedUser(
  session: PermissionSession,
): Promise<boolean> {
  const userId = session?.user?.id;
  if (!userId) return false;

  return Boolean(await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  }));
}

export async function getUsersWithPermissions() {
  const users = await prisma.user.findMany({
    where: { role: { not: "SUPERADMIN" } },
    select: { id: true, name: true, email: true, role: true, permissions: true },
    orderBy: { name: "asc" },
  });
  return users.map((u) => ({
    ...u,
    permissions: Object.fromEntries(ALL_PERMISSION_KEYS.map((k) => [
      k,
      (u.permissions as Record<string, boolean> | null)?.[k] ?? DEFAULT_PERMISSIONS[u.role]?.[k] ?? false,
    ])),
  }));
}
