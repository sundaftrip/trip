import { requireAdminModule } from "@/lib/admin-access";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  await requireAdminModule("settings");
  return <SettingsForm />;
}
