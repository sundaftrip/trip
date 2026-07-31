import { DEFAULT_PERMISSIONS } from "@/lib/permission-keys";

export type PermissionSession = {
  user?: {
    id?: string | null;
    role?: string | null;
  } | null;
} | null;

export type PersistedPermissionUser = {
  id: string;
  role: string;
  permissions: unknown;
};

type PermissionUserLookup = (
  id: string,
) => Promise<PersistedPermissionUser | null>;

function isPermissionMap(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasPersistedPermission(user: PersistedPermissionUser, key: string): boolean {
  if (user.role === "SUPERADMIN") return true;

  if (isPermissionMap(user.permissions) && Object.hasOwn(user.permissions, key)) {
    return user.permissions[key] === true;
  }

  return DEFAULT_PERMISSIONS[user.role]?.[key] === true;
}

/**
 * Resolves permissions only after loading the current user record. Session roles
 * are intentionally ignored because JWT claims can outlive a role change or user.
 */
export async function checkPermissionsWithLookup(
  session: PermissionSession,
  keys: readonly string[],
  findUserById: PermissionUserLookup,
): Promise<boolean> {
  const userId = session?.user?.id;
  if (!userId || keys.length === 0) return false;

  const user = await findUserById(userId);
  if (!user || user.id !== userId) return false;

  return [...new Set(keys)].every((key) => hasPersistedPermission(user, key));
}

/**
 * Maps each submitted mutable field to its applicable permission. A field not
 * listed in fieldPermissions uses the default edit permission.
 */
export function requiredPermissionsForMutation(
  input: Record<string, unknown>,
  defaultPermission: string,
  fieldPermissions: Readonly<Record<string, string>>,
): string[] {
  const fields = Object.keys(input);
  if (fields.length === 0) return [defaultPermission];

  return [
    ...new Set(
      fields.map((field) => fieldPermissions[field] ?? defaultPermission),
    ),
  ];
}

export function getPublicationCreatePolicy(
  requestedPublished: boolean | undefined,
  createPermission: string,
  publishPermission: string,
): { published: boolean; requiredPermissions: string[] } {
  const published = requestedPublished === true;
  return {
    published,
    requiredPermissions: published
      ? [createPermission, publishPermission]
      : [createPermission],
  };
}
