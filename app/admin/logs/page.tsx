import { requireAdminModule } from "@/lib/admin-access";
import LogsViewer from "./LogsViewer";

export default async function LogsPage() {
  await requireAdminModule("logs");
  return <LogsViewer />;
}
