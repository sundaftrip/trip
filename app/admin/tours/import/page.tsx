import { redirect } from "next/navigation";
import { can, requireAdminModule } from "@/lib/admin-access";
import ImportTours from "./ImportTours";

export default async function ImportToursPage() {
  const viewer = await requireAdminModule("tours");
  if (!can(viewer, "tour_create")) redirect("/admin/tours");
  return <ImportTours canPublish={can(viewer, "tour_status")} />;
}
