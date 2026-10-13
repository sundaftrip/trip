import { requireAdminModule } from "@/lib/admin-access";
import AboutForm from "./AboutForm";

export default async function AdminAboutPage() {
  await requireAdminModule("about");
  return <AboutForm />;
}
