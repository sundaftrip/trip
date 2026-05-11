import "server-only";
import { prisma } from "@/lib/prisma";
import { ALL_PERMISSION_KEYS, DEFAULT_PERMISSIONS } from "@/lib/permission-keys";

export { ALL_PERMISSION_KEYS, DEFAULT_PERMISSIONS, PERMISSION_LABELS } from "@/lib/permission-keys";

export async function getRolePermissions(role: string): Promise<Record<string, boolean>> {
  if (role === "SUPERADMIN") {
    return Object.fromEntries(ALL_PERMISSION_KEYS.map((k) => [k, true]));
  }
  const row = await prisma.rolePermission.findUnique({ where: { role } });
  if (row) return row.permissions as Record<string, boolean>;
  return DEFAULT_PERMISSIONS[role] ?? {};
}

export async function checkPermission(
  session: { user: { role: string } } | null,
  key: string
): Promise<boolean> {
  if (!session) return false;
  if (session.user.role === "SUPERADMIN") return true;
  const perms = await getRolePermissions(session.user.role);
  return perms[key] === true;
}
