import "server-only";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PERMISSIONS, ALL_PERMISSION_KEYS } from "@/lib/permission-keys";

export { ALL_PERMISSION_KEYS, DEFAULT_PERMISSIONS, PERMISSION_LABELS } from "@/lib/permission-keys";

export async function checkPermission(
  session: { user: { id?: string | null; role: string } } | null,
  key: string
): Promise<boolean> {
  if (!session) return false;
  if (session.user.role === "SUPERADMIN") return true;

  if (session.user.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { permissions: true, role: true },
    });
    if (user?.permissions) {
      const perms = user.permissions as Record<string, boolean>;
      if (key in perms) return perms[key] === true;
      return DEFAULT_PERMISSIONS[user.role]?.[key] === true;
    }
    // No custom permissions — fall back to role defaults
    return DEFAULT_PERMISSIONS[user?.role ?? "EDITOR"]?.[key] === true;
  }

  return DEFAULT_PERMISSIONS[session.user.role]?.[key] === true;
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
