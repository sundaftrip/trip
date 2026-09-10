import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import RussiaCatering from "@/components/website/clean/RussiaCatering";
import { getConfiguredWhatsAppNumber } from "@/lib/referrals";
import { toWaNumber } from "@/lib/utils";

export const revalidate = 300;
const title = "Katering Halal Moscow & Saint Petersburg Mulai 700 RUB";
const description = "Katering halal Indonesia di Moscow dan Saint Petersburg. Pilih nasi box 700, 850, atau 1.000 RUB per porsi; pengantaran taksi ke titik temu sesuai penawaran.";
const url = "https://sundaftrip.com/russia/catering";
const image = "https://sundaftrip.com/images/russia-catering/02-nasi-kuning.png";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, siteName: "Sundaf Trip", locale: "id_ID", type: "website", images: [{ url: image, alt: "Katering halal Indonesia SUNDAF di Rusia — Nasi Kuning Nusantara" }] },
  twitter: { card: "summary_large_image", title, description, images: [image] },
};

export default async function RussiaCateringPage() {
  const whatsapp = toWaNumber(await getConfiguredWhatsAppNumber()) || "6281775202759";
  return <><BreadcrumbSchema crumbs={[{ name: "Beranda", url: "/" }, { name: "Layanan Rusia", url: "/russia" }, { name: "Katering Halal", url: "/russia/catering" }]} /><RussiaCatering whatsapp={whatsapp} /></>;
}
