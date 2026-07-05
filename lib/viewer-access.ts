export const ADMIN_ROLES = ["SUPERADMIN", "ADMIN", "EDITOR", "VIEWER"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

const WRITING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const PUBLIC_WRITE_API_PATHS = new Set([
  "/api/auth",
  "/api/b2b-catalog/login",
  "/api/b2b-catalog/logout",
  "/api/inquiries",
  "/api/lapor/upload",
  "/api/referrals/events",
]);

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && ADMIN_ROLES.includes(value as AdminRole);
}

export function isViewerRole(value: unknown): value is "VIEWER" {
  return value === "VIEWER";
}

export function isWritingMethod(method: string) {
  return WRITING_METHODS.has(method.toUpperCase());
}

export function isViewerWriteBlockedPath(pathname: string) {
  if (pathname.startsWith("/admin")) return true;
  if (!pathname.startsWith("/api")) return false;

  for (const publicPath of PUBLIC_WRITE_API_PATHS) {
    if (pathname === publicPath || pathname.startsWith(`${publicPath}/`)) {
      return false;
    }
  }

  return true;
}

export function shouldBlockViewerMutation(method: string, pathname: string, role: unknown) {
  return isViewerRole(role) && isWritingMethod(method) && isViewerWriteBlockedPath(pathname);
}
