import { requireAdminModule } from "@/lib/admin-access";
import FaqManager from "./FaqManager";

export default async function AdminFaqPage() {
  await requireAdminModule("faq");
  return <FaqManager />;
}
