import { requireAdminModule } from "@/lib/admin-access";
import PermissionsManager from "./PermissionsManager";

export default async function PermissionsPage() {
  await requireAdminModule("permissions");
  return <PermissionsManager />;
}
