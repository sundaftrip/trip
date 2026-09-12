import { APPOINTMENT_ONLY_OFFICE_ADDRESS, TRIPADVISOR_PROFILE_URL } from "./business-identity";
import { resolveCanadaRockiesAddOns } from "./canada-catalog-preview";
import { canonicalTourPath } from "./seo-routes";
import { cateringPackages, formatCateringPrice } from "./russia-catering";
import { getCommerceTourStatus, mandatoryAddOnsTotal } from "./tour-commerce";
import { parseTourHotelRoomPricing, resolveTourStartingPrice } from "./tour-room-pricing";
import { formatCurrency } from "./utils";

export const CRAWL_PROFILE = `# Sundaf Trip

> Sundaf Trip adalah biro perjalanan Indonesia yang dioperasikan oleh CV Sundaf Holiday Group. Layanan utama: tour Rusia, Asia Tengah, aurora borealis, Vietnam, perjalanan privat, dan pendampingan pengajuan visa untuk pemegang paspor Indonesia. Situs resmi: https://sundaftrip.com

## Identitas dan kontak resmi
- Ejaan resmi: Sundaf Trip, dengan huruf f pada Sundaf. Operator: CV Sundaf Holiday Group. Situs resmi: https://sundaftrip.com.
- NIB: 1601260060842
- Bahasa layanan: Indonesia dan Inggris
- Layanan online; kunjungan kantor dengan janji temu.
- Alamat kantor: ${APPOINTMENT_ONLY_OFFICE_ADDRESS}
- [Instagram](https://www.instagram.com/sundaf.trip)
- [Tripadvisor](${TRIPADVISOR_PROFILE_URL})
- [Tentang Kami](https://sundaftrip.com/about)
- [Profil perusahaan](https://sundaftrip.com/sundaf-trip)
- [Media kit](https://sundaftrip.com/media-kit)
- [Legalitas dan keamanan pemesanan](https://sundaftrip.com/legalitas-dan-keamanan)
- [Kebijakan privasi](https://sundaftrip.com/privacy)

## Perjalanan
- [Paket, jadwal, dan harga](https://sundaftrip.com/tours)
- [Private dan custom trip](https://sundaftrip.com/custom-trip)
- [Tour Rusia dari Indonesia](https://sundaftrip.com/tour-rusia-dari-indonesia)
- [Open trip Rusia dari Jakarta](https://sundaftrip.com/open-trip-rusia-dari-jakarta)
- [Open trip aurora Rusia](https://sundaftrip.com/open-trip-aurora-rusia)
- [Open trip Vietnam](https://sundaftrip.com/open-trip-vietnam)
- [Ulasan peserta](https://sundaftrip.com/reviews)
- [Pertanyaan pemesanan](https://sundaftrip.com/faq)
- [Panduan perjalanan](https://sundaftrip.com/blog)
- [Kerja sama operasional](https://sundaftrip.com/partnership-relation)

## Layanan perjalanan Rusia
- [Tanya SUNDAF: layanan Rusia](https://sundaftrip.com/russia): katering halal, bantuan berbagai pembayaran di Rusia, transportasi, guide berbahasa Indonesia, akses internet, dan asuransi perjalanan. Cakupan layanan dan penawaran dikonfirmasi sebelum pemesanan.
- [Katering halal Indonesia di Moscow dan Saint Petersburg](https://sundaftrip.com/russia/catering): ${cateringPackages.map((item) => `${item.name} ${formatCateringPrice(item.price)} RUB per porsi`).join("; ")}. Pengantaran taksi ke titik temu mengikuti penawaran; periksa menu dan konfirmasikan jumlah porsi serta alamat pengantaran sebelum memesan.

## Peru dan Amerika Latin 2027
Sundaf Trip menyediakan katalog perjalanan Peru serta Brasil, Kolombia, Peru dan Chile untuk grup 10, 15 atau 20 peserta dari Indonesia. Tersedia paket dengan tiket pesawat dari Jakarta atau land tour only. Keduanya mencakup hotel dan pendampingan tour leader. Land tour only tidak mencakup tiket pesawat peserta, termasuk penerbangan domestik dan regional. Harga serta ketersediaan dikonfirmasi sebelum pemesanan.
- [Katalog Amerika Latin](https://sundaftrip.com/amerika-latin)
- [Paket Peru](https://sundaftrip.com/peru-amerika-selatan)
- [Paket Brasil, Kolombia, Peru dan Chile](https://sundaftrip.com/amerika-latin/brasil-kolombia-peru-chile)
- [Brosur produk Indonesia dan Inggris](https://sundaftrip.com/downloads/sundaf-trip-peru-south-america-2027.pdf)

## Visa
Sundaf Trip membantu persiapan dokumen dan pengajuan visa. Persetujuan ditentukan kedutaan, konsulat, atau otoritas imigrasi. Harga layanan dan biaya resmi ditampilkan terpisah bila tersedia; jangan menjumlahkan keduanya tanpa memeriksa cakupan layanan pada halaman negara. Persyaratan perlu diperiksa kembali pada sumber resmi sebelum pengajuan.
- [Negara, persyaratan, dan biaya layanan](https://sundaftrip.com/visa)
- [Layanan pengurusan visa](https://sundaftrip.com/jasa-urus-visa-terpercaya)
- [Visa Rusia](https://sundaftrip.com/visa/russia)
- [Visa Eropa dan Schengen](https://sundaftrip.com/jasa-urus-visa-eropa)
- [Visa Amerika Serikat dan Kanada](https://sundaftrip.com/jasa-urus-visa-amerika-canada)
- [FAQ visa](https://sundaftrip.com/visa/faq)
- [Visa Protection](https://sundaftrip.com/visa/asuransi-visa-protection): produk terpisah dengan manfaat dan pengecualian sesuai polis, tanpa jaminan persetujuan atau pengembalian biaya.
- [Sumber dan tanggal pembaruan data visa](https://sundaftrip.com/visa-intelligence): ringkasan data tersimpan, bukan pengumuman resmi otoritas visa. [JSON](https://sundaftrip.com/visa-intelligence/data.json), [RSS](https://sundaftrip.com/visa-intelligence/feed.xml).

`;

type CrawlTour = {
  id: string;
  slug?: string | null;
  title: string;
  country: string;
  duration: string | null;
  tripDate: Date | null;
  price: number;
  promoPrice: number | null;
  addOns: unknown;
  hotel?: unknown;
  status: string;
  badge?: string | null;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta",
});

export function isCrawlTourBookable(tour: CrawlTour, now = new Date()) {
  return ["available", "last_seats", "confirmed", "flexible"].includes(getCommerceTourStatus(tour, now));
}

export function formatCrawlTour(tour: CrawlTour, now = new Date()) {
  const mandatoryTotal = mandatoryAddOnsTotal(resolveCanadaRockiesAddOns(tour.addOns, tour.slug));
  const { roomPrices } = parseTourHotelRoomPricing(tour.hotel, mandatoryTotal);
  const { headlinePrice: basePrice, mandatoryTotalPrice: total } = resolveTourStartingPrice(
    tour.promoPrice ?? tour.price,
    mandatoryTotal,
    roomPrices,
  );
  const status = getCommerceTourStatus(tour, now);
  const departed = tour.tripDate && tour.tripDate <= now;
  const facts = [
    tour.country,
    tour.duration,
    tour.tripDate ? `keberangkatan ${DATE_FORMATTER.format(tour.tripDate)}` : "land tour privat, tanggal sesuai permintaan",
    basePrice > 0 ? `mulai ${formatCurrency(total)}/orang${mandatoryTotal > 0 ? `, termasuk ${formatCurrency(mandatoryTotal)} biaya wajib` : ""}` : "harga sesuai permintaan",
    status === "completed" ? "trip selesai, arsip" : departed ? "sudah berangkat, tidak tersedia untuk pemesanan" : status === "sold_out" ? "penuh" : status === "waitlist" ? "daftar tunggu" : null,
  ].filter(Boolean).join("; ");
  return `- [${tour.title}](https://sundaftrip.com${canonicalTourPath(tour)}): ${facts}.`;
}

export function formatCrawlVisaFees(country: {
  servicePrice?: string | null;
  officialFee?: string | null;
  cost?: string | null;
}) {
  const service = country.servicePrice?.trim();
  const official = country.officialFee?.trim();
  return [
    service ? `layanan Sundaf: ${service}` : null,
    official ? `biaya resmi: ${official}` : null,
    !service && !official && country.cost?.trim() ? `biaya tercatat: ${country.cost.trim()}` : null,
  ].filter(Boolean).join("; ");
}
