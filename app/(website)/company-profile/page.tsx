import type { Metadata } from "next";
import CompanyProfileContent from "@/components/website/CompanyProfileContent";
import { getProofPhotos } from "@/lib/b2bGallery";

export const metadata: Metadata = {
  title: "Company Profile, Sundaf Trip",
  description:
    "Company profile of Sundaf Trip, an Indonesia-based small group tour "
    + "operator under CV Sundaf Holiday Group. Track record, services, "
    + "destinations, and how we work with DMC partners.",
  robots: { index: false, follow: false },
};

export default function CompanyProfilePage() {
  return <CompanyProfileContent proofPhotos={getProofPhotos()} />;
}
