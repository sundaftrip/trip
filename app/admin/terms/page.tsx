import { requireAdminModule } from "@/lib/admin-access";
import TermsEditor from "./TermsEditor";

export default async function TermsPage() {
  await requireAdminModule("terms");
  return <TermsEditor />;
}
