import { requireAdminModule } from "@/lib/admin-access";
import UsersManager from "./UsersManager";

export default async function UsersPage() {
  const viewer = await requireAdminModule("users");
  return <UsersManager currentUserId={viewer.id} />;
}
